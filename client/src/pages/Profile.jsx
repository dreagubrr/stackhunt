import { useState, useEffect, useRef } from 'react';
import CVGenerator from '../components/CVGenerator';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const API = process.env.REACT_APP_API_BASE_URL;

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python',
  'Java', 'PHP', 'C#', '.NET', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Git',
  'Flutter', 'Kotlin', 'Swift', 'GraphQL', 'REST API', 'Linux', 'DevOps',
];

const LANGUAGE_LEVELS = ['Nativo', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];

const inputStyle = {
  border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a',
  width: '100%', padding: '10px 14px', fontSize: '0.875rem',
  outline: 'none', fontFamily: "'Inter', sans-serif",
};

const cardStyle = {
  background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb',
  padding: '24px', marginBottom: '0',
};

const Profile = () => {
  const { user, logout, updateSavedJobs, login, updateGithubValidatedSkills } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef();

  const [repos, setRepos] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(user?.avatar || null);
  const [showCVGenerator, setShowCVGenerator] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState(null);

  const defaultProfile = {
    title: '', location: '', bio: '', experience: '', phone: '',
    skills: [],
    languages: [],
    education: [],
    workExperience: [],
    links: { linkedin: '', portfolio: '', github: '' },
  };

  const [profileForm, setProfileForm] = useState(defaultProfile);

  useEffect(() => {
    if (!user) return;
    setAvatarSrc(user.avatar || null);
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/users/profile`, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        if (data.profile) {
          setProfileForm({
            title: data.profile.title || '',
            location: data.profile.location || '',
            bio: data.profile.bio || '',
            experience: data.profile.experience || '',
            phone: data.profile.phone || '',
            skills: data.profile.skills || [],
            languages: data.profile.languages || [],
            education: data.profile.education || [],
            workExperience: data.profile.workExperience || [],
            links: {
              linkedin: data.profile.links?.linkedin || '',
              portfolio: data.profile.links?.portfolio || '',
              github: data.profile.links?.github || '',
            },
          });
        }
      } catch (err) { console.error('Error loading profile:', err); }
    };
    fetchProfile();
  }, [user]);

  const loadRepos = async () => {
    if (!user) return;
    setLoadingRepos(true); setReposError('');
    try {
      const [reposRes, analysisRes] = await Promise.all([
        fetch(`${API}/api/users/github-repos`, { headers: { Authorization: `Bearer ${user.token}` } }),
        fetch(`${API}/api/users/github-analysis`, { headers: { Authorization: `Bearer ${user.token}` } }),
      ]);
      const reposData = await reposRes.json();
      if (!reposRes.ok) throw new Error(reposData.message);
      setRepos(reposData);
      const analysisData = await analysisRes.json();
      if (analysisRes.ok) {
        setAnalysis(analysisData);
        if (analysisData.validatedSkills) updateGithubValidatedSkills(analysisData.validatedSkills);
      }
    } catch (err) { setReposError(err.message); }
    finally { setLoadingRepos(false); }
  };

  useEffect(() => {
    if (activeTab === 'repos' && user?.githubUsername) loadRepos();
  }, [activeTab, user]); 

  if (!user) return <Navigate to="/" />;

  const handleLogout = () => logout();

  const handleRemove = async (jobId) => {
    try {
      const res = await fetch(`${API}/api/users/saved-jobs/${jobId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
      updateSavedJobs(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setProfileMessage('La imagen no puede superar 2MB'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${API}/api/users/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ avatar: reader.result.split(',')[1], avatarMimetype: file.type }),
        });
        const data = await res.json();
        if (res.ok && data.avatar) {
          setAvatarSrc(data.avatar);
          const isLocal = !!localStorage.getItem('stackhunt_user');
          const stored = isLocal ? JSON.parse(localStorage.getItem('stackhunt_user')) : JSON.parse(sessionStorage.getItem('stackhunt_user'));
          const updatedUser = { ...stored, avatar: data.avatar };
          if (isLocal) localStorage.setItem('stackhunt_user', JSON.stringify(updatedUser));
          else sessionStorage.setItem('stackhunt_user', JSON.stringify(updatedUser));
          setProfileMessage('Foto actualizada');
        } else setProfileMessage('Error al subir la foto');
      } catch { setProfileMessage('Error al subir la foto'); }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true); setProfileMessage('');
    try {
      const res = await fetch(`${API}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ ...profileForm, experience: profileForm.experience ? parseInt(profileForm.experience) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      login({ ...user, profile: { ...profileForm } }, !!localStorage.getItem('stackhunt_user'));
      setProfileMessage('Perfil guardado correctamente');
      setEditMode(false);
    } catch (err) { setProfileMessage(`${err.message}`); }
    finally { setSavingProfile(false); }
  };

  const handleCancelEdit = () => { setEditMode(false); setProfileMessage(''); };
  const handleAddSkill = (skill) => {
    const s = skill.trim();
    if (s && !profileForm.skills.includes(s)) setProfileForm({ ...profileForm, skills: [...profileForm.skills, s] });
    setSkillInput('');
  };
  const handleRemoveSkill = (skill) => setProfileForm({ ...profileForm, skills: profileForm.skills.filter(s => s !== skill) });

  const handleAddLanguage = () => setProfileForm({ ...profileForm, languages: [...profileForm.languages, { language: '', level: 'B2' }] });
  const handleUpdateLanguage = (idx, field, value) => {
    const updated = [...profileForm.languages];
    updated[idx] = { ...updated[idx], [field]: value };
    setProfileForm({ ...profileForm, languages: updated });
  };
  const handleRemoveLanguage = (idx) => setProfileForm({ ...profileForm, languages: profileForm.languages.filter((_, i) => i !== idx) });

  const handleAddEducation = () => setProfileForm({ ...profileForm, education: [...profileForm.education, { degree: '', institution: '', year: '' }] });
  const handleUpdateEducation = (idx, field, value) => {
    const updated = [...profileForm.education];
    updated[idx] = { ...updated[idx], [field]: value };
    setProfileForm({ ...profileForm, education: updated });
  };
  const handleRemoveEducation = (idx) => setProfileForm({ ...profileForm, education: profileForm.education.filter((_, i) => i !== idx) });

  const handleAddWorkExp = () => setProfileForm({ ...profileForm, workExperience: [...profileForm.workExperience, { company: '', position: '', startDate: '', endDate: '', description: '' }] });
  const handleUpdateWorkExp = (idx, field, value) => {
    const updated = [...profileForm.workExperience];
    updated[idx] = { ...updated[idx], [field]: value };
    setProfileForm({ ...profileForm, workExperience: updated });
  };
  const handleRemoveWorkExp = (idx) => setProfileForm({ ...profileForm, workExperience: profileForm.workExperience.filter((_, i) => i !== idx) });



  const tabs = [
    { id: 'profile', label: 'Mi perfil' },
    { id: 'jobs', label: `Ofertas guardadas (${user.savedJobs?.length || 0})` },
    ...(user.githubUsername ? [{ id: 'repos', label: 'GitHub' }] : []),
  ];

  const doughnutData = analysis ? {
    labels: analysis.languages.slice(0, 6).map(l => l.name),
    datasets: [{ data: analysis.languages.slice(0, 6).map(l => l.percent), backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'], borderWidth: 2, borderColor: '#ffffff' }]
  } : null;

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, usePointStyle: true } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } }
    },
    cutout: '65%',
  };

  const getAvatarBase64 = async () => {
    if (!avatarSrc) return null;
    try {
      const response = await fetch(avatarSrc);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const handleOpenCVGenerator = async () => {
    const base64 = await getAvatarBase64();
    setAvatarBase64(base64);
    setShowCVGenerator(true);
  };

  const infoBanner = (icon, title, desc) => (
    <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '14px 16px' }}>
      <p style={{ color: '#4338ca', fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>{icon} {title}</p>
      <p style={{ color: '#6366f1', fontSize: '0.75rem', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: desc }} />
    </div>
  );

  const sectionLabel = (text) => (
    <p style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{text}</p>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f6f3', minHeight: '100vh', paddingTop: '80px', paddingBottom: '48px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={cardStyle} className="mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current.click()}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontWeight: 700, fontSize: '1.5rem' }}>
                    {user.name[0].toUpperCase()}
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                  className="group-hover:opacity-100">
                  <span style={{ color: '#fff', fontSize: '0.7rem' }}>Cambiar</span>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0a0a0a', letterSpacing: '-0.01em' }}>{user.name}</h2>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{user.email}</p>
                {profileForm.title && !editMode && <p style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>{profileForm.title}</p>}
                {user.githubUsername ? (
                  <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', fontSize: '0.75rem' }}>@{user.githubUsername}</a>
                ) : (
                  <a href={`${API}/api/auth/github/link?token=${user.token}`}
                    style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    Conectar GitHub
                  </a>
                )}
              </div>
            </div>
            <button onClick={handleLogout} style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none' }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px', marginTop: '16px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              paddingBottom: '12px', paddingLeft: '4px', paddingRight: '4px',
              fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
              background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === tab.id ? '#6366f1' : '#6b7280', transition: 'color 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* perfil */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {infoBanner('', '¿Para qué sirve completar tu perfil?', 'Cuanto más completo esté tu perfil, <strong>más preciso será el % de compatibilidad</strong> con las ofertas de empleo y mejor será el CV que genere la IA.')}

            <div style={cardStyle}>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 600, color: '#0a0a0a', fontSize: '0.95rem' }}>Información profesional</h3>
                {!editMode && (
                  <button onClick={() => { setEditMode(true); setProfileMessage(''); }}
                    style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none' }}>
                    Editar
                  </button>
                )}
              </div>
              {profileMessage && <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px' }}>{profileMessage}</p>}

              {/* modo vista */}
              {!editMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(profileForm.title || profileForm.location || profileForm.experience || profileForm.phone) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {profileForm.title && <div><p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '2px' }}>Título</p><p style={{ color: '#0a0a0a', fontWeight: 600, fontSize: '0.875rem' }}>{profileForm.title}</p></div>}
                      {profileForm.location && <div><p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '2px' }}>Ubicación</p><p style={{ color: '#374151', fontSize: '0.875rem' }}> {profileForm.location}</p></div>}
                      {profileForm.phone && <div><p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '2px' }}>Teléfono</p><p style={{ color: '#374151', fontSize: '0.875rem' }}> {profileForm.phone}</p></div>}
                      {profileForm.experience !== '' && profileForm.experience !== undefined && (
                        <div><p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '2px' }}>Experiencia</p><p style={{ color: '#374151', fontSize: '0.875rem' }}>{profileForm.experience} {profileForm.experience === 1 ? 'año' : 'años'}</p></div>
                      )}
                    </div>
                  )}
                  {profileForm.bio && <div><p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '4px' }}>Sobre mí</p><p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>{profileForm.bio}</p></div>}
                  {profileForm.skills.length > 0 && (
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '8px' }}>Habilidades</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {profileForm.skills.map(skill => (
                          <span key={skill} style={{ background: '#eef2ff', color: '#4338ca', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', fontWeight: 500 }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileForm.languages.length > 0 && (
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '8px' }}>Idiomas</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {profileForm.languages.map((l, i) => (
                          <span key={i} style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', fontWeight: 500 }}>
                            {l.language} — {l.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileForm.education.length > 0 && (
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '8px' }}>Formación académica</p>
                      {profileForm.education.map((e, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <p style={{ color: '#0a0a0a', fontWeight: 600, fontSize: '0.875rem' }}>{e.degree}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>{e.institution} {e.year && `· ${e.year}`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {profileForm.workExperience.length > 0 && (
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '8px' }}>Experiencia laboral</p>
                      {profileForm.workExperience.map((w, i) => (
                        <div key={i} style={{ marginBottom: '12px', paddingLeft: '10px', borderLeft: '2px solid #e5e7eb' }}>
                          <p style={{ color: '#0a0a0a', fontWeight: 600, fontSize: '0.875rem' }}>{w.position}</p>
                          <p style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 500 }}>{w.company}</p>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{w.startDate} — {w.endDate || 'Actualidad'}</p>
                          {w.description && <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>{w.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {(profileForm.links.linkedin || profileForm.links.portfolio || profileForm.links.github) && (
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '8px' }}>Links</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {profileForm.links.linkedin && <a href={profileForm.links.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.875rem' }}>LinkedIn</a>}
                        {profileForm.links.portfolio && <a href={profileForm.links.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.875rem' }}>Portfolio</a>}
                        {profileForm.links.github && <a href={profileForm.links.github} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.875rem' }}>GitHub</a>}
                      </div>
                    </div>
                  )}
                  {!profileForm.title && !profileForm.bio && profileForm.skills.length === 0 && (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>Tu perfil está vacío. Pulsa "Editar" para añadir tu información.</p>
                  )}
                </div>
              )}

              {/* modo edición */}
              {editMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Datos básicos */}
                  {sectionLabel('Datos básicos')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Título profesional', key: 'title', placeholder: 'ej. Desarrollador Frontend Junior', type: 'text' },
                      { label: 'Ubicación', key: 'location', placeholder: 'ej. Madrid, España', type: 'text' },
                      { label: 'Teléfono', key: 'phone', placeholder: 'ej. +34 600 000 000', type: 'tel' },
                      { label: 'Años de experiencia', key: 'experience', placeholder: '0', type: 'number' },
                    ].map(({ label, key, placeholder, type }) => (
                      <div key={key}>
                        <label style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>{label}</label>
                        <input type={type} value={profileForm[key]} onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })}
                          placeholder={placeholder} style={inputStyle} min={type === 'number' ? 0 : undefined} max={type === 'number' ? 50 : undefined}
                          onFocus={e => e.target.style.boxShadow = '0 0 0 2px #6366f1'}
                          onBlur={e => e.target.style.boxShadow = 'none'} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Sobre mí</label>
                    <textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Cuéntanos sobre ti..." rows={3}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={e => e.target.style.boxShadow = '0 0 0 2px #6366f1'}
                      onBlur={e => e.target.style.boxShadow = 'none'} />
                  </div>

                  {/* Habilidades */}
                  {sectionLabel('Habilidades técnicas')}
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {profileForm.skills.map(skill => (
                        <span key={skill} style={{ background: '#eef2ff', color: '#4338ca', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {skill}
                          <button onClick={() => handleRemoveSkill(skill)} style={{ color: '#818cf8', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontSize: '0.9rem' }}>×</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddSkill(skillInput)}
                        placeholder="Añadir habilidad..." list="skills-list" style={{ ...inputStyle, flex: 1 }} />
                      <datalist id="skills-list">{SKILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
                      <button onClick={() => handleAddSkill(skillInput)}
                        style={{ background: '#6366f1', color: '#fff', borderRadius: '10px', padding: '10px 14px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.875rem' }}>+</button>
                    </div>
                  </div>

                  {/* Idiomas */}
                  {sectionLabel('Idiomas')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {profileForm.languages.map((lang, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="text" value={lang.language} onChange={e => handleUpdateLanguage(idx, 'language', e.target.value)}
                          placeholder="ej. Inglés" style={{ ...inputStyle, flex: 2 }} />
                        <select value={lang.level} onChange={e => handleUpdateLanguage(idx, 'level', e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}>
                          {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <button onClick={() => handleRemoveLanguage(idx)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>×</button>
                      </div>
                    ))}
                    <button onClick={handleAddLanguage}
                      style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '10px', padding: '8px', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                      + Añadir idioma
                    </button>
                  </div>

                  {/* Formación */}
                  {sectionLabel('Formación académica')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {profileForm.education.map((edu, idx) => (
                      <div key={idx} style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 600 }}>Formación {idx + 1}</p>
                          <button onClick={() => handleRemoveEducation(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                        </div>
                        <input type="text" value={edu.degree} onChange={e => handleUpdateEducation(idx, 'degree', e.target.value)}
                          placeholder="ej. Técnico Superior en DAW" style={inputStyle} />
                        <input type="text" value={edu.institution} onChange={e => handleUpdateEducation(idx, 'institution', e.target.value)}
                          placeholder="ej. IES Ejemplo" style={inputStyle} />
                        <input type="text" value={edu.year} onChange={e => handleUpdateEducation(idx, 'year', e.target.value)}
                          placeholder="ej. 2024" style={{ ...inputStyle, width: '120px' }} />
                      </div>
                    ))}
                    <button onClick={handleAddEducation}
                      style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '10px', padding: '8px', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                      + Añadir formación
                    </button>
                  </div>

                  {/* Experiencia laboral */}
                  {sectionLabel('Experiencia laboral')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {profileForm.workExperience.map((work, idx) => (
                      <div key={idx} style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ color: '#374151', fontSize: '0.8rem', fontWeight: 600 }}>Experiencia {idx + 1}</p>
                          <button onClick={() => handleRemoveWorkExp(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input type="text" value={work.position} onChange={e => handleUpdateWorkExp(idx, 'position', e.target.value)}
                            placeholder="ej. Desarrollador Frontend" style={inputStyle} />
                          <input type="text" value={work.company} onChange={e => handleUpdateWorkExp(idx, 'company', e.target.value)}
                            placeholder="ej. Empresa S.L." style={inputStyle} />
                          <input type="text" value={work.startDate} onChange={e => handleUpdateWorkExp(idx, 'startDate', e.target.value)}
                            placeholder="ej. Enero 2023" style={inputStyle} />
                          <input type="text" value={work.endDate} onChange={e => handleUpdateWorkExp(idx, 'endDate', e.target.value)}
                            placeholder="ej. Actualidad" style={inputStyle} />
                        </div>
                        <textarea value={work.description} onChange={e => handleUpdateWorkExp(idx, 'description', e.target.value)}
                          placeholder="Describe tus responsabilidades y logros..." rows={2}
                          style={{ ...inputStyle, resize: 'none' }} />
                      </div>
                    ))}
                    <button onClick={handleAddWorkExp}
                      style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '10px', padding: '8px', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                      + Añadir experiencia laboral
                    </button>
                  </div>

                  {/* Links */}
                  {sectionLabel('Links')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      {key: 'linkedin', placeholder: 'https://linkedin.com/in/tu-perfil' },
                      {key: 'portfolio', placeholder: 'https://tu-portfolio.com' },
                      {key: 'github', placeholder: 'https://github.com/tu-usuario' },
                    ].map(({ icon, key, placeholder }) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#6366f1', width: '20px', fontSize: '0.8rem', fontWeight: 700 }}>{icon}</span>
                        <input type="url" value={profileForm.links[key]} onChange={e => setProfileForm({ ...profileForm, links: { ...profileForm.links, [key]: e.target.value } })}
                          placeholder={placeholder} style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    ))}
                  </div>

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleProfileSave} disabled={savingProfile}
                      style={{ flex: 1, background: '#0a0a0a', color: '#fff', borderRadius: '10px', padding: '10px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.875rem', opacity: savingProfile ? 0.5 : 1 }}>
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button onClick={handleCancelEdit}
                      style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', color: '#6b7280', cursor: 'pointer', background: '#fff', fontSize: '0.875rem' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#0a0a0a', fontSize: '0.95rem', margin: 0 }}>Currículum Vitae</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '4px' }}>Genera un CV profesional con tus datos de perfil</p>
                </div>
                <button onClick={handleOpenCVGenerator}
                  style={{ background: '#6366f1', color: '#fff', borderRadius: '10px', padding: '9px 18px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}>
                  Generar CV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* trabajos guardados  */}
        {activeTab === 'jobs' && (
          !user.savedJobs?.length ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}></p>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Aún no has guardado ninguna oferta.</p>
              <button onClick={() => navigate('/search')}
                style={{ background: '#0a0a0a', color: '#fff', borderRadius: '10px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.875rem' }}>
                Buscar empleos
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user.savedJobs.map(job => (
                <div key={job._id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, color: '#0a0a0a', fontSize: '0.95rem', marginBottom: '4px' }}>{job.title}</h4>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '4px' }}>{job.company} · {job.location}</p>
                    <span style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{job.source}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 500 }}>Ver oferta</a>
                    <button onClick={() => handleRemove(job._id)} style={{ color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', background: 'none', border: 'none' }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* GitHub Tab */}
        {activeTab === 'repos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loadingRepos && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
            {reposError && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', fontSize: '0.875rem' }}>{reposError}</div>}

            {!loadingRepos && !reposError && analysis && (
              <>
                {infoBanner('','¿Para qué sirve conectar GitHub?', 'Analizamos tus repositorios para <strong>validar tus habilidades con código real</strong>. Las skills demostradas en GitHub pesan más en el % de compatibilidad con las ofertas.')}

                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontWeight: 600, color: '#0a0a0a', fontSize: '0.95rem' }}>Tu stack según GitHub</h3>
                    <span style={{ background: analysis.isActive ? '#f0fdf4' : '#f9fafb', color: analysis.isActive ? '#16a34a' : '#6b7280', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '999px' }}>
                      {analysis.isActive ? '🟢 Activo' : '🔴 Sin actividad'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {[
                      { label: 'Repositorios', value: analysis.totalRepos },
                      { label: 'Propios', value: analysis.ownRepos },
                      { label: 'Activos (90d)', value: analysis.recentReposCount },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: '#eef2ff', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                        <p style={{ fontWeight: 700, fontSize: '1.5rem', color: '#6366f1' }}>{value}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '2px' }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {analysis.languages.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '16px' }}>Lenguajes detectados</p>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '220px', height: '220px' }}>
                          <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                      </div>
                    </div>
                  )}

                  {analysis.validatedSkills.length > 0 && (
                    <div>
                      <p style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', marginBottom: '12px' }}>Validación de habilidades</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {analysis.validatedSkills.map(({ skill, validated }) => (
                          <span key={skill} style={{
                            fontSize: '0.75rem', padding: '5px 12px', borderRadius: '999px', fontWeight: 500,
                            background: validated ? '#f0fdf4' : '#fffbeb',
                            color: validated ? '#16a34a' : '#d97706',
                          }}>
                            {validated ? '✅' : '⚠️'} {skill}
                          </span>
                        ))}
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '8px' }}>✅ Detectado en GitHub · ⚠️ No encontrado en tus repos</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Repositorios</h3>
                  {repos.map(repo => (
                    <div key={repo.id} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#6366f1', fontSize: '0.9rem' }}>{repo.name}</a>
                        {repo.fork && <span style={{ background: '#f9fafb', color: '#9ca3af', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px' }}>Fork</span>}
                      </div>
                      {repo.description && <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '6px' }}>{repo.description}</p>}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', color: '#9ca3af', fontSize: '0.75rem' }}>
                        {repo.language && <span>⬤ {repo.language}</span>}
                        <span>⭐ {repo.stars}</span>
                      </div>
                    </div>
                  ))}
                  {repos.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>No se encontraron repositorios públicos.</p>}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {showCVGenerator && (
        <CVGenerator
          user={user}
          profile={profileForm}
          avatarBase64={avatarBase64}
          onClose={() => setShowCVGenerator(false)}
        />
      )}
    </div>
  );
};

export default Profile;