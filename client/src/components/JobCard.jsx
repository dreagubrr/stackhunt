import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const SOURCE_STYLES = {
  'Tecnoempleo': { background: '#f0fdf4', color: '#16a34a' },
  'Jooble': { background: '#eff6ff', color: '#2563eb' },
  'Adzuna': { background: '#faf5ff', color: '#7c3aed' },
};

export const calcCompatibility = (userSkills = [], job, githubValidatedSkills = []) => {
  if (!userSkills.length) return { percent: 0, matched: [], validatedMatched: [] };
  const jobText = `${job.title} ${job.description || ''}`.toLowerCase();
  const matched = userSkills.filter(skill => jobText.includes(skill.toLowerCase()));
  const validatedMatched = matched.filter(skill => githubValidatedSkills.includes(skill));
  const unvalidatedMatched = matched.filter(skill => !githubValidatedSkills.includes(skill));
  const weightedMatches = validatedMatched.length * 1.5 + unvalidatedMatched.length;
  const maxPossible = githubValidatedSkills.length > 0
    ? validatedMatched.length * 1.5 + (userSkills.length - validatedMatched.length)
    : userSkills.length;
  const raw = githubValidatedSkills.length > 0
    ? weightedMatches / Math.max(maxPossible, userSkills.length)
    : matched.length / userSkills.length;
  return { percent: Math.min(100, Math.round(raw * 100)), matched, validatedMatched };
};

const CompatibilityBadge = ({ percent, matched, validatedMatched = [] }) => {
  if (!percent) return null;
  const color = percent >= 70 ? { bg: '#f0fdf4', text: '#16a34a', bar: '#16a34a' }
    : percent >= 40 ? { bg: '#fffbeb', text: '#d97706', bar: '#d97706' }
    : { bg: '#f9fafb', text: '#6b7280', bar: '#9ca3af' };

  return (
    <div style={{ background: color.bg, borderRadius: '10px', padding: '10px 12px', marginTop: '12px' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ color: color.text, fontSize: '0.75rem', fontWeight: 600 }}>Compatibilidad</span>
        <span style={{ color: color.text, fontSize: '0.8rem', fontWeight: 700 }}>{percent}%</span>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '999px', height: '4px', marginBottom: '8px' }}>
        <div style={{ width: `${percent}%`, height: '4px', borderRadius: '999px', background: color.bar, transition: 'width 0.4s ease' }} />
      </div>
      {matched.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {matched.map(skill => (
            <span key={skill} style={{
              fontSize: '0.7rem', padding: '2px 7px', borderRadius: '999px', fontWeight: 500,
              background: validatedMatched.includes(skill) ? '#dcfce7' : 'rgba(0,0,0,0.06)',
              color: validatedMatched.includes(skill) ? '#15803d' : color.text,
            }}>
              {validatedMatched.includes(skill) ? '✓ ' : ''}{skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const JobCard = ({ job, userSkills = [], githubValidatedSkills = [] }) => {
  const { user, updateSavedJobs } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(() => user?.savedJobs?.some(j => j.url === job.link) || false);

  const { percent, matched, validatedMatched } = calcCompatibility(userSkills, job, githubValidatedSkills);

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Reciente') return 'Reciente';
    try {
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`).toLocaleDateString('es-ES');
      }
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('es-ES');
    } catch { return dateString; }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    if (saved) return navigate('/profile');
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/users/saved-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          title: job.title, company: job.company,
          location: Array.isArray(job.location) ? job.location.join(', ') : job.location,
          url: job.link, source: job.source,
        }),
      });
      const data = await res.json();
      if (res.ok) { updateSavedJobs(data); setSaved(true); }
    } catch (err) {
      console.error('Error al guardar oferta:', err);
    } finally { setSaving(false); }
  };

  const sourceStyle = SOURCE_STYLES[job.source] || { background: '#f9fafb', color: '#6b7280' };
  const borderColor = percent >= 70 ? '#bbf7d0' : percent >= 40 ? '#fde68a' : '#e5e7eb';

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: '#ffffff',
      border: `1px solid ${borderColor}`,
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 style={{ color: '#0a0a0a', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4 }} className="flex-1 mr-2">{job.title}</h3>
          {job.source && (
            <span style={{ ...sourceStyle, borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', whiteSpace: 'nowrap' }}>
              {job.source}
            </span>
          )}
        </div>

        <p style={{ color: '#374151', fontWeight: 500, fontSize: '0.875rem', marginBottom: '10px' }}>{job.company}</p>

        {job.description && (
          <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '12px' }}
            className="line-clamp-3">
            {job.description.replace(/<[^>]+>/g, '').slice(0, 200)}
            {job.description.length > 200 ? '...' : ''}
          </p>
        )}

        <div style={{ fontSize: '0.8rem', color: '#6b7280' }} className="space-y-1">
          {job.location && (
            <p className="flex items-center gap-1.5">
              <span>📍</span>
              <span>{Array.isArray(job.location) ? job.location.join(', ') : job.location}</span>
            </p>
          )}
          {job.salary && job.salary !== 'No especificado' && (
            <p className="flex items-center gap-1.5"><span>💶</span><span>{job.salary}</span></p>
          )}
          {job.jobType && job.jobType !== 'No especificado' && (
            <p className="flex items-center gap-1.5"><span>💼</span><span>{job.jobType}</span></p>
          )}
          {job.datePosted && (
            <p className="flex items-center gap-1.5"><span>📅</span><span>{formatDate(job.datePosted)}</span></p>
          )}
        </div>

        <CompatibilityBadge percent={percent} matched={matched} validatedMatched={validatedMatched} />
      </div>

      <div className="flex gap-2 mt-4">
        <a href={job.link} target="_blank" rel="noopener noreferrer"
          style={{ background: '#0a0a0a', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, padding: '8px 16px', textAlign: 'center', flex: 1, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#374151'}
          onMouseLeave={e => e.currentTarget.style.background = '#0a0a0a'}>
          Ver oferta →
        </a>
        <button onClick={handleSave} disabled={saving}
          style={{
            border: saved ? '1px solid #fde68a' : '1px solid #e5e7eb',
            background: saved ? '#fffbeb' : '#fff',
            color: saved ? '#d97706' : '#9ca3af',
            borderRadius: '8px', padding: '8px 12px', fontSize: '0.875rem',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
          {saved ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;