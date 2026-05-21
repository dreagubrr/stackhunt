import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({

 
  name: { type: String, required: true, trim: true },   
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }, 
  password: { type: String, minlength: 6 },            
  avatar: { type: String },    
  avatarKey: { type: String },  
  googleId: { type: String },       
  githubId: { type: String },      
  githubUsername: { type: String }, 
  githubToken: { type: String },    
  profile: {
    title: { type: String, trim: true },      
    location: { type: String, trim: true },   
    bio: { type: String, trim: true },        
    experience: { type: Number },             
    phone: { type: String, trim: true },      
    skills: [{ type: String, trim: true }],   
    languages: [
      {
        language: { type: String, trim: true }, 
        level: { type: String, trim: true },    
      }
    ],
    education: [
      {
        degree: { type: String, trim: true },      
        institution: { type: String, trim: true }, 
        year: { type: String, trim: true },        
      }
    ],

    workExperience: [
      {
        company: { type: String, trim: true },     
        position: { type: String, trim: true },    
        startDate: { type: String, trim: true },   
        endDate: { type: String, trim: true },     
        description: { type: String, trim: true },
      }
    ],
    links: {
      linkedin: { type: String, trim: true },  
      portfolio: { type: String, trim: true }, 
      github: { type: String, trim: true },
    },
  },

  resetPasswordToken: { type: String },   
  resetPasswordExpires: { type: Date },  
  cv: { filename: String, key: String, uploadedAt: Date },

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
