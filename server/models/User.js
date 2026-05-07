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
  avatarKey: { type: String },  // S3 key para el avatar

  // OAuth
  googleId: { type: String },
  githubId: { type: String },
  githubUsername: { type: String },
  githubToken: { type: String },

  // Información del perfil
  profile: {
    title: { type: String, trim: true },        // "Desarrollador Frontend"
    location: { type: String, trim: true },     // "Madrid, España"
    bio: { type: String, trim: true },          // descripción corta
    experience: { type: Number },               // años de experiencia
    skills: [{ type: String, trim: true }],     // ["React", "Node.js", ...]
    links: {
      linkedin: { type: String, trim: true },
      portfolio: { type: String, trim: true },
      github: { type: String, trim: true },
    },
  },

  // CV almacenado en AWS S3
  cv: {
    filename: String,
    key: String,
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;