import User from '../models/User.js';
import axios from 'axios';
import Groq from 'groq-sdk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
import { uploadToS3, deleteFromS3, getSignedDownloadUrl, uploadAvatarToS3, getSignedAvatarUrl } from '../services/s3Service.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/users/saved-jobs
export const saveJob = async (req, res) => {
  const { title, company, location, url, source } = req.body;
  const user = await User.findById(req.user._id);
  const alreadySaved = user.savedJobs.some((j) => j.url === url);
  if (alreadySaved)
    return res.status(400).json({ message: 'Ya tienes esta oferta guardada' });
  user.savedJobs.push({ title, company, location, url, source });
  await user.save();
  res.status(201).json(user.savedJobs);
};

// DELETE /api/users/saved-jobs/:jobId
export const removeSavedJob = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.savedJobs = user.savedJobs.filter(
    (j) => j._id.toString() !== req.params.jobId
  );
  await user.save();
  res.json(user.savedJobs);
};

// GET /api/users/saved-jobs
export const getSavedJobs = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.savedJobs);
};

// GET /api/users/github-repos
export const getGithubRepos = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.githubToken) {
    return res.status(400).json({ message: 'No tienes GitHub conectado' });
  }
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${user.githubToken}`,
        Accept: 'application/vnd.github+json',
      },
      params: { sort: 'updated', per_page: 50, visibility: 'public' },
    });
    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
      fork: repo.fork,
    }));
    res.json(repos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener repositorios de GitHub' });
  }
};

// GET /api/users/github-analysis
export const getGithubAnalysis = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.githubToken) {
    return res.status(400).json({ message: 'No tienes GitHub conectado' });
  }
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${user.githubToken}`,
        Accept: 'application/vnd.github+json',
      },
      params: { sort: 'updated', per_page: 100, visibility: 'public' },
    });

    const repos = response.data;
    const now = new Date();

    const langCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    });

    const totalWithLang = Object.values(langCount).reduce((a, b) => a + b, 0);
    const languages = Object.entries(langCount)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalWithLang) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const recentRepos = repos.filter(repo => {
      const daysDiff = (now - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 90;
    });
    const isActive = recentRepos.length > 0;
    const lastUpdate = repos.length > 0
      ? new Date(repos[0].updated_at).toLocaleDateString('es-ES')
      : null;

    const ownRepos = repos.filter(r => !r.fork).length;
    const forks = repos.filter(r => r.fork).length;

    const githubLangs = languages.map(l => l.name.toLowerCase());
    const userSkills = user.profile?.skills || [];

    const skillToLang = {
      'javascript': ['javascript'],
      'typescript': ['typescript'],
      'python': ['python'],
      'java': ['java'],
      'php': ['php'],
      'c#': ['c#'],
      '.net': ['c#'],
      'kotlin': ['kotlin'],
      'swift': ['swift'],
      'go': ['go'],
      'rust': ['rust'],
      'ruby': ['ruby'],
      'css': ['css'],
      'html': ['html'],
      'dart': ['dart'],
      'flutter': ['dart'],
      'sql': ['plsql', 'sql', 'tsql'],
    };

    const validatedSkills = userSkills.map(skill => {
      const skillLower = skill.toLowerCase();
      const mappedLangs = skillToLang[skillLower] || [skillLower];
      const validated = mappedLangs.some(lang => githubLangs.includes(lang));
      return { skill, validated };
    });

    res.json({
      languages,
      totalRepos: repos.length,
      ownRepos,
      forks,
      isActive,
      lastUpdate,
      recentReposCount: recentRepos.length,
      validatedSkills,
    });
  } catch (err) {
    console.error('GitHub analysis error:', err.message);
    res.status(500).json({ message: 'Error al analizar GitHub' });
  }
};

// POST /api/users/cv
export const uploadCV = async (req, res) => {
  const { filename, data, mimetype } = req.body;
  if (!filename || !data || !mimetype) {
    return res.status(400).json({ message: 'Faltan datos del archivo' });
  }
  try {
    const user = await User.findById(req.user._id);
    if (user.cv?.key) {
      await deleteFromS3(user.cv.key).catch(() => {});
    }
    const buffer = Buffer.from(data, 'base64');
    const key = await uploadToS3(buffer, filename, mimetype, 'cvs');
    user.cv = { filename, key, uploadedAt: new Date() };
    await user.save();
    res.json({ message: 'CV subido correctamente', filename });
  } catch (err) {
    console.error('Error subiendo CV a S3:', err);
    res.status(500).json({ message: 'Error al subir el CV' });
  }
};

// GET /api/users/cv/download
export const downloadCV = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.cv?.key) {
      return res.status(404).json({ message: 'No tienes ningún CV subido' });
    }
    const url = await getSignedDownloadUrl(user.cv.key);
    res.json({ url, filename: user.cv.filename });
  } catch (err) {
    res.status(500).json({ message: 'Error al generar enlace de descarga' });
  }
};

// DELETE /api/users/cv
export const deleteCV = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.cv?.key) {
      await deleteFromS3(user.cv.key);
    }
    user.cv = undefined;
    await user.save();
    res.json({ message: 'CV eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el CV' });
  }
};

// POST /api/users/cv/analyze
export const analyzeCV = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.cv?.key) {
      return res.status(404).json({ message: 'No tienes ningún CV subido' });
    }

    // Download CV from S3
    const cvUrl = await getSignedDownloadUrl(user.cv.key);
    const cvResponse = await axios.get(cvUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(cvResponse.data);

    // Extract text from PDF
    const parsed = await pdfParse(buffer);
    const cvText = parsed.text.slice(0, 6000);

    // Send text to Groq
    const prompt = `Eres un extractor de información de CVs. Analiza el siguiente texto de un CV y extrae esta información en formato JSON estricto, sin texto adicional ni markdown:
{
  "experience": <número entero de años de experiencia laboral total, 0 si no hay>,
  "bio": "<resumen profesional en primera persona basado en la experiencia y habilidades reales del CV, máximo 2 frases concretas y específicas>",
  "skills": ["skill1", "skill2"]
}
Las skills deben ser tecnologías, lenguajes y herramientas reales mencionadas en el CV.
Solo devuelve el JSON puro, sin bloques de código ni explicaciones.

CV:
${cvText}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 600,
    });

    const responseText = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(responseText);

    // Merge skills — add new ones without duplicates
    const existingSkills = user.profile?.skills || [];
    const newSkills = (extracted.skills || []).filter(
      s => !existingSkills.map(e => e.toLowerCase()).includes(s.toLowerCase())
    );
    const mergedSkills = [...existingSkills, ...newSkills];

    // Update profile preserving existing fields
    const currentProfile = user.profile?.toObject ? user.profile.toObject() : (user.profile || {});
    user.profile = {
      title: currentProfile.title || '',
      location: currentProfile.location || '',
      bio: extracted.bio || currentProfile.bio || '',
      experience: extracted.experience ?? currentProfile.experience ?? 0,
      skills: mergedSkills,
      links: {
        linkedin: currentProfile.links?.linkedin || '',
        portfolio: currentProfile.links?.portfolio || '',
        github: currentProfile.links?.github || '',
      },
    };
    await user.save();

    res.json({
      message: 'CV analizado correctamente',
      extracted: {
        bio: extracted.bio,
        experience: extracted.experience,
        newSkills,
      },
      profile: user.profile,
    });
  } catch (err) {
    console.error('CV analysis error:', err.message);
    res.status(500).json({ message: 'Error al analizar el CV', details: err.message });
  }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { title, location, bio, experience, phone, skills, languages, education, workExperience, links, avatar, avatarMimetype } = req.body;
    console.log('updateProfile body:', { title, phone, languages, education, workExperience });
    const user = await User.findById(req.user._id);

    if (avatar && avatarMimetype) {
      if (user.avatarKey) {
        await deleteFromS3(user.avatarKey).catch(() => {});
      }
      const { key, url } = await uploadAvatarToS3(avatar, avatarMimetype, user._id.toString());
      user.avatar = url;
      user.avatarKey = key;
    }

    user.profile = {
      title: title ?? user.profile?.title,
      location: location ?? user.profile?.location,
      bio: bio ?? user.profile?.bio,
      experience: experience ?? user.profile?.experience,
      phone: phone ?? user.profile?.phone,
      skills: skills ?? user.profile?.skills ?? [],
      languages: languages ?? user.profile?.languages ?? [],
      education: education ?? user.profile?.education ?? [],
      workExperience: workExperience ?? user.profile?.workExperience ?? [],
      links: {
        linkedin: links?.linkedin ?? user.profile?.links?.linkedin,
        portfolio: links?.portfolio ?? user.profile?.links?.portfolio,
        github: links?.github ?? user.profile?.links?.github,
      },
    };

    await user.save();
    res.json({ message: 'Perfil actualizado', profile: user.profile, avatar: user.avatar });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

// GET /api/users/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -githubToken');

    let avatar = user.avatar;
    if (user.avatarKey) {
      try {
        avatar = await getSignedAvatarUrl(user.avatarKey);
      } catch {
        avatar = user.avatar;
      }
    }

    res.json({
      name: user.name,
      email: user.email,
      avatar,
      githubUsername: user.githubUsername,
      profile: user.profile,
      cv: user.cv ? { filename: user.cv.filename, uploadedAt: user.cv.uploadedAt } : null,
      savedJobs: user.savedJobs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};