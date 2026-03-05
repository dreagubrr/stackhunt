const SOURCE_COLORS = {
  'Tecnoempleo': 'bg-green-100 text-green-700',
  'InfoJobs': 'bg-yellow-100 text-yellow-700',
  'Indeed España': 'bg-purple-100 text-purple-700',
  'Careerjet': 'bg-blue-100 text-blue-700',
};

const JobCard = ({ job }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Reciente') return 'Reciente';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
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

      <div className="mt-4">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Ver oferta →
        </a>
      </div>
    </div>
  );
};

export default JobCard;
