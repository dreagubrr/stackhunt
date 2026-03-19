import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    savedJobs: user.savedJobs,
    token: generateToken(user._id),
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    savedJobs: user.savedJobs,
    token: generateToken(user._id),
  });
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
  res.json(req.user);
};