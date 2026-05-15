import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { getSignedAvatarUrl } from '../services/s3Service.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const formatUser = async (user, token) => {
  let avatar = user.avatar;
  if (user.avatarKey) {
    try {
      avatar = await getSignedAvatarUrl(user.avatarKey);
      user.avatar = avatar;
      await user.save();
    } catch {
      avatar = user.avatar;
    }
  }
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar,
    githubUsername: user.githubUsername,
    profile: user.profile,
    savedJobs: user.savedJobs,
    token,
  };
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Rellena todos los campos' });
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: 'Ya existe una cuenta con ese email' });
  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);
  res.status(201).json(await formatUser(user, token));
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });
  const token = generateToken(user._id);
  res.json(await formatUser(user, token));
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  const token = req.headers.authorization?.split(' ')[1];
  res.json(await formatUser(user, token));
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No existe ninguna cuenta con ese email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hora
    await user.save();

    const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    const emailInfo = await transporter.sendMail({
      from: `"StackHunt" <${process.env.BREVO_FROM_EMAIL}>`,
      to: user.email,
      subject: 'Recuperación de contraseña — StackHunt',
      html: `
        <div style="font-family: Inter, Arial, sans-serif;
               max-width: 480px;
               margin: 0 auto;
               padding: 32px;
               background: #f7f6f3;
               border-radius: 16px;">
         
               <h2 style="color: #0a0a0a;
               font-size: 22px;
               margin-bottom: 8px;">Recupera tu contraseña</h2>
          
               <p style="color: #6b7280;
              font-size: 14px;
              margin-bottom: 24px;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en StackHunt.</p>
          
            <a href="${resetUrl}" style="display: inline-block;
             background: #6366f1;
             color: #fff;
             padding: 12px 28px;
             border-radius: 10px;
             text-decoration: none;
             font-weight: 600; font-size: 14px;">
            Restablecer contraseña</a>
          <p style="color: #9ca3af;
             font-size: 12px; margin-top: 24px;">
            Este enlace caduca en 1 hora. Si no solicitaste este cambio, ignora este email.</p>
        </div>
      `,
    });

    console.log('Email enviado:', emailInfo.messageId, emailInfo.response);
    res.json({ message: 'Email de recuperación enviado' });
  } catch (err) {
    console.error('forgotPassword error:', err.message);
    res.status(500).json({ message: 'Error al enviar el email' });
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'El enlace ha caducado o no es válido' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
};


export const contactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: 'Rellena todos los campos' });
  try {
    await transporter.sendMail({
      from: `"StackHunt" <${process.env.BREVO_FROM_EMAIL}>`,
      to: process.env.BREVO_FROM_EMAIL,
      replyTo: email,
      subject: `Nuevo mensaje de contacto — ${name}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f7f6f3; border-radius: 16px;">
          <h2 style="color: #0a0a0a; font-size: 20px; margin-bottom: 16px;">Nuevo mensaje desde StackHunt</h2>
          <p style="color: #374151; font-size: 14px; margin-bottom: 8px;"><strong>Nombre:</strong> ${name}</p>
          <p style="color: #374151; font-size: 14px; margin-bottom: 8px;"><strong>Email:</strong> ${email}</p>
          <p style="color: #374151; font-size: 14px; margin-bottom: 8px;"><strong>Mensaje:</strong></p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; background: #fff; padding: 16px; border-radius: 10px;">${message}</p>
        </div>
      `,
    });
    res.json({ message: 'Mensaje enviado correctamente' });
  } catch (err) {
    console.error('contactMessage error:', err.message);
    res.status(500).json({ message: 'Error al enviar el mensaje' });
  }
};