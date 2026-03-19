import User from '../models/User.js';

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