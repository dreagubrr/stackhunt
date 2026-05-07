import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getSignedAvatarUrl } from '../services/s3Service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const buildUserResponse = async (user, token) => {
  let avatar = user.avatar;

  // Refresh signed avatar URL if user has one stored in S3
  if (user.avatarKey) {
    try {
      avatar = await getSignedAvatarUrl(user.avatarKey);
      // Update the avatar URL in DB so it stays fresh
      user.avatar = avatar;
      await user.save();
    } catch {
      avatar = user.avatar; // fallback to stored URL
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

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Rellena todos los campos' });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: 'Ya existe una cuenta con ese email' });

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json(await buildUserResponse(user, token));
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });

  const token = generateToken(user._id);
  res.json(await buildUserResponse(user, token));
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  const token = req.headers.authorization?.split(' ')[1];
  res.json(await buildUserResponse(user, token));
};