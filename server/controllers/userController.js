import User from '../models/User.js';
import axios from 'axios';
import { deleteFromS3, uploadAvatarToS3, getSignedAvatarUrl } from '../services/s3Service.js';

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

export const removeSavedJob = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.savedJobs = user.savedJobs.filter(
    (j) => j._id.toString() !== req.params.jobId
  );
  await user.save();
  res.json(user.savedJobs);
};

export const getSavedJobs = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.savedJobs);
};

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

export const updateProfile = async (req, res) => {
  try {
    const { title, location, bio, experience, phone, skills, languages, education, workExperience, links, avatar, avatarMimetype } = req.body;

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
      savedJobs: user.savedJobs,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el perfil' });
  }
};