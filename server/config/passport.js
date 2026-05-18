import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://api.stackhuntproject.com/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
     
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          password: Math.random().toString(36).slice(-8), // random password
          avatar: profile.photos[0]?.value,
        });
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'https://api.stackhuntproject.com/api/auth/github/callback',
  scope: ['user:email', 'public_repo'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });

    if (!user) {
      const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
      user = await User.findOne({ email });
      if (user) {
        user.githubId = profile.id;
        user.githubUsername = profile.username;
        user.githubToken = accessToken;
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName || profile.username,
          email,
          githubId: profile.id,
          githubUsername: profile.username,
          githubToken: accessToken,
          password: Math.random().toString(36).slice(-8),
          avatar: profile.photos[0]?.value,
        });
      }
    } else {
      user.githubToken = accessToken;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;