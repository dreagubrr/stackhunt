import User from '../models/User.js';
import axios from 'axios';
import { uploadToS3, deleteFromS3, getSignedDownloadUrl } from '../services/s3Service.js';

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
      params: { sort: 'updated', per_page: 20, visibility: 'public' },
    });

    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
    }));

    res.json(repos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener repositorios de GitHub' });
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

    // Delete old CV from S3 if exists
    if (user.cv?.key) {
      await deleteFromS3(user.cv.key).catch(() => {});
    }

    const buffer = Buffer.from(data, 'base64');
    const key = await uploadToS3(buffer, filename, mimetype);

    user.cv = {
      filename,
      key,
      uploadedAt: new Date(),
    };
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