import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import { register, login, getMe, forgotPassword, resetPassword, contactMessage } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/contact', contactMessage);

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

router.get('/github', passport.authenticate('github', { scope: ['user:email', 'public_repo'] }));

// GitHub OAuth — vincular cuenta existente (token en state en vez de sesión)
router.get('/github/link', (req, res, next) => {
  const token = req.query.token;
  if (!token) return res.redirect(`${CLIENT_URL}/profile?error=notoken`);
  passport.authenticate('github', {
    scope: ['user:email', 'public_repo'],
    state: `link_${token}`,
  })(req, res, next);
});

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${CLIENT_URL}/login?error=github` }),
  async (req, res) => {
    const state = req.query.state;

    // Vincular GitHub a cuenta existente
    if (state && state.startsWith('link_')) {
      try {
        const linkToken = state.replace('link_', '');
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
        return res.redirect(`${CLIENT_URL}/auth/callback?data=${encodeURIComponent(JSON.stringify(userData))}`);
      } catch (err) {
        console.error('GitHub link error:', err.message);
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