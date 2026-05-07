import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import { register, login, getMe } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// correo y contraseña
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login?error=google` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      savedJobs: req.user.savedJobs,
      githubUsername: req.user.githubUsername,
      token,
    };
    res.redirect(`${CLIENT_URL}/auth/callback?data=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

// GitHub OAuth (login/registrase)
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'public_repo'] }));

// GitHub OAuth (vincular cuenta existente)
router.get('/github/link', (req, res, next) => {
  const token = req.query.token;
  if (token) req.session.linkToken = token;
  passport.authenticate('github', {
    scope: ['user:email', 'public_repo'],
    state: 'link',
  })(req, res, next);
});

// callback a git 
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/login?error=github` }),
  async (req, res) => {
    const state = req.query.state;

    // Vincular GitHub a cuenta existente
    if (state === 'link') {
      try {
        const linkToken = req.session.linkToken;
        if (!linkToken) return res.redirect(`${CLIENT_URL}/profile?error=notoken`);

        const decoded = jwt.verify(linkToken, process.env.JWT_SECRET);
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(decoded.id);
        if (!user) return res.redirect(`${CLIENT_URL}/profile?error=nouser`);

        user.githubId = req.user.githubId;
        user.githubUsername = req.user.githubUsername;
        user.githubToken = req.user.githubToken;
        await user.save();

        const newToken = generateToken(user._id);
        const userData = {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          savedJobs: user.savedJobs,
          githubUsername: user.githubUsername,
          token: newToken,
        };

        req.session.linkToken = null;
        return res.redirect(`${CLIENT_URL}/auth/callback?data=${encodeURIComponent(JSON.stringify(userData))}`);
      } catch (err) {
        return res.redirect(`${CLIENT_URL}/profile?error=link`);
      }
    }

    // Login/registro normal con GitHub
    const token = generateToken(req.user._id);
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      savedJobs: req.user.savedJobs,
      githubUsername: req.user.githubUsername,
      token,
    };
    res.redirect(`${CLIENT_URL}/auth/callback?data=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

export default router;