import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
  const { user, logout, updateSavedJobs } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState('');
  const [uploadingCV, setUploadingCV] = useState(false);
  const [cvMessage, setCvMessage] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  const loadRepos = async () => {
    if (!user) return;
    setLoadingRepos(true);
    setReposError('');
    try {
      const res = await fetch(`${API}/api/users/github-repos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRepos(data);
    } catch (err) {
      setReposError(err.message);
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'repos' && user?.githubUsername) {
      loadRepos();
    }
  }, [activeTab, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <Navigate to="/" />;

  const handleLogout = () => logout();

  const handleRemove = async (jobId) => {
    try {
      const res = await fetch(`${API}/api/users/saved-jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      updateSavedJobs(data);
    } catch (err) {
      console.error('Error al eliminar oferta:', err);
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setCvMessage('El archivo no puede superar 5MB');
      return;
    }

    setUploadingCV(true);
    setCvMessage('');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await fetch(`${API}/api/users/cv`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            data: base64,
            mimetype: file.type,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCvMessage('✅ CV subido correctamente');
      } catch (err) {
        setCvMessage(`❌ Error: ${err.message}`);
      } finally {
        setUploadingCV(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCV = async () => {
    try {
      const res = await fetch(`${API}/api/users/cv/download`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      window.open(data.url, '_blank');
    } catch (err) {
      setCvMessage(`❌ ${err.message}`);
    }
  };

  const handleDeleteCV = async () => {
    try {
      await fetch(`${API}/api/users/cv`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCvMessage('CV eliminado');
    } catch {
      setCvMessage('Error al eliminar el CV');
    }
  };

  const tabs = [
    { id: 'jobs', label: `Ofertas guardadas (${user.savedJobs?.length || 0})` },
    { id: 'cv', label: 'Mi CV' },
    ...(user.githubUsername ? [{ id: 'repos', label: 'Mis repositorios' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {user.name[0].toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.githubUsername ? (
                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  @{user.githubUsername}
                </a>
              ) : (
                <a
                  href={`${API}/api/auth/github/link?token=${user.token}`}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Conectar GitHub
                </a>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium transition">
            Cerrar sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Saved Jobs */}
        {activeTab === 'jobs' && (
          !user.savedJobs?.length ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
              <p className="text-4xl mb-3">📂</p>
              <p>Aún no has guardado ninguna oferta.</p>
              <button
                onClick={() => navigate('/search')}
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Buscar empleos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {user.savedJobs.map((job) => (
                <div key={job._id} className="bg-white rounded-2xl shadow-md p-5 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">{job.title}</h4>
                    <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
                    <span className="text-xs text-blue-500 font-medium uppercase tracking-wide">{job.source}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">Ver oferta</a>
                    <button onClick={() => handleRemove(job._id)} className="text-xs text-red-400 hover:text-red-600 transition">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* CV */}
        {activeTab === 'cv' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Currículum Vitae</h3>
            <p className="text-sm text-gray-500 mb-4">Sube tu CV en PDF o Word. Máximo 5MB. Se almacena de forma segura en AWS S3.</p>

            {cvMessage && (
              <p className="text-sm mb-4 text-gray-600">{cvMessage}</p>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingCV}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploadingCV ? 'Subiendo...' : 'Subir CV'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCVUpload}
                className="hidden"
              />
              <button
                onClick={handleDownloadCV}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Descargar CV
              </button>
              <button
                onClick={handleDeleteCV}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition"
              >
                Eliminar CV
              </button>
            </div>
          </div>
        )}

        {/* GitHub Repos */}
        {activeTab === 'repos' && (
          <div>
            {loadingRepos && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {reposError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{reposError}</div>
            )}
            {!loadingRepos && !reposError && (
              <div className="space-y-3">
                {repos.map((repo) => (
                  <div key={repo.id} className="bg-white rounded-2xl shadow-md p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {repo.name}
                        </a>
                        {repo.description && (
                          <p className="text-sm text-gray-500 mt-1">{repo.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                          {repo.language && <span>⬤ {repo.language}</span>}
                          <span>⭐ {repo.stars}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {repos.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No se encontraron repositorios públicos.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;