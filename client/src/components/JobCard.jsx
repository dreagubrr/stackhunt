import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const SOURCE_COLORS = {
  'Tecnoempleo': 'bg-green-100 text-green-700',
  'InfoJobs': 'bg-yellow-100 text-yellow-700',
  'Indeed España': 'bg-purple-100 text-purple-700',
  'Careerjet': 'bg-blue-100 text-blue-700',
};

const JobCard = ({ job }) => {
  const { user, updateSavedJobs } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(
    () => user?.savedJobs?.some((j) => j.url === job.link) || false
  );

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Reciente') return 'Reciente';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    if (saved) return navigate('/profile');

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/users/saved-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: Array.isArray(job.location) ? job.location.join(', ') : job.location,
          url: job.link,
          source: job.source,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateSavedJobs(data);
        setSaved(true);
      }
    } catch (err) {
      console.error('Error al guardar oferta:', err);
    } finally {
      setSaving(false);
    }
  };

  const sourceClass = SOURCE_COLORS[job.source] || 'bg-gray-100 text-gray-600';

  return (
    <div className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-blue-700 leading-tight flex-1 mr-2">{job.title}</h3>
          {job.source && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${sourceClass}`}>
              {job.source}
            </span>
          )}
        </div>
        <p className="text-gray-800 font-medium mb-3">{job.company}</p>

        {job.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {job.description.replace(/<[^>]+>/g, '').slice(0, 200)}
            {job.description.length > 200 ? '...' : ''}
          </p>
        )}

        <div className="space-y-1 text-sm text-gray-600">
          {job.location && (
            <p className="flex items-center gap-2">
              <span>📍</span>
              <span>{Array.isArray(job.location) ? job.location.join(', ') : job.location}</span>
            </p>
          )}
          {job.salary && job.salary !== 'No especificado' && (
            <p className="flex items-center gap-2">
              <span>💶</span>
              <span>{job.salary}</span>
            </p>
          )}
          {job.jobType && job.jobType !== 'No especificado' && (
            <p className="flex items-center gap-2">
              <span>💼</span>
              <span>{job.jobType}</span>
            </p>
          )}
          {job.datePosted && (
            <p className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(job.datePosted)}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 block text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Ver oferta →
        </a>
        <button
          onClick={handleSave}
          disabled={saving}
          title={saved ? 'Ver guardados' : 'Guardar oferta'}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
            saved
              ? 'bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100'
              : 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600'
          }`}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;