import axios from 'axios';

export async function getAdzunaJobs(keyword, location = 'españa') {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    const url = `https://api.adzuna.com/v1/api/jobs/es/search/1`;

    // Fetch page 1 and page 2 in parallel
    const [res1, res2] = await Promise.allSettled([
      axios.get(url, {
        params: { app_id: appId, app_key: appKey, results_per_page: 50, what: keyword, where: location },
        timeout: 15000,
      }),
      axios.get(`https://api.adzuna.com/v1/api/jobs/es/search/2`, {
        params: { app_id: appId, app_key: appKey, results_per_page: 50, what: keyword, where: location },
        timeout: 15000,
      }),
    ]);

    const mapJob = (job) => ({
      title: job.title || '',
      company: job.company?.display_name || 'No especificada',
      link: job.redirect_url || '',
      location: job.location?.display_name || location,
      salary: job.salary_min && job.salary_max
        ? `${Math.round(job.salary_min).toLocaleString()}€ - ${Math.round(job.salary_max).toLocaleString()}€`
        : job.salary_min
          ? `Desde ${Math.round(job.salary_min).toLocaleString()}€`
          : 'No especificado',
      datePosted: job.created ? new Date(job.created).toLocaleDateString('es-ES') : 'Reciente',
      jobType: job.contract_time || job.contract_type || 'No especificado',
      description: (job.description || '').slice(0, 300),
      source: 'Adzuna',
    });

    const jobs1 = res1.status === 'fulfilled' ? (res1.value.data.results || []).map(mapJob) : [];
    const jobs2 = res2.status === 'fulfilled' ? (res2.value.data.results || []).map(mapJob) : [];

    // Deduplicate by link
    const seen = new Set();
    const deduped = [...jobs1, ...jobs2].filter(job => {
      if (seen.has(job.link)) return false;
      seen.add(job.link);
      return true;
    });

    const EXCLUDE_KEYWORDS = [
      'hostelería', 'camarero', 'cocinero', 'chef', 'limpieza', 'conductor',
      'repartidor', 'almacén', 'operario', 'dependiente', 'cajero', 'inmobiliaria',
      'seguros', 'enfermero', 'médico', 'fisioterapeuta', 'electricista', 'fontanero',
      'albañil', 'carpintero', 'mecánico', 'recepcionista', 'teleoperador',
      'call center', 'abogado', 'derecho', 'jurídico', 'farmacia', 'veterinario',
      'psicólogo', 'terapeuta', 'contable', 'contabilidad', 'administrativo', 'negocio', 'relaciones laborales',
      'recursos humanos', 'rrhh', 'transporte', 'logistica', 'hotel', 'hotelera', 'administración', 'coches', 'ingeniero',
      'financiero', 'financieria', 'interno', 'químico', 'engineer', 'industrial', 'consultor'
    ];

    return deduped.filter(job => {
      const text = (job.title + ' ' + job.description).toLowerCase();
      return !EXCLUDE_KEYWORDS.some(kw => text.includes(kw));
    });
  } catch (err) {
    console.error('Adzuna API error:', err.message);
    throw err;
  }
}