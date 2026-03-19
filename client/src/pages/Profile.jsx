import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
  const { user, logout, updateSavedJobs } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Saved jobs */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Ofertas guardadas ({user.savedJobs?.length || 0})
        </h3>

        {!user.savedJobs?.length ? (
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
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Ver oferta
                  </a>
                  <button
                    onClick={() => handleRemove(job._id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;