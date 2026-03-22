import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  avatar: { type: String },

  // OAuth
  googleId: { type: String },
  githubId: { type: String },
  githubUsername: { type: String },
  githubToken: { type: String },

  // CV stored in AWS S3
  cv: {
    filename: String,
    key: String,       // S3 object key
    uploadedAt: Date,
  },

  savedJobs: [
    {
      title: String,
      company: String,
      location: String,
      url: String,
      source: String,
      savedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// Hash password before saving (only if set)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;