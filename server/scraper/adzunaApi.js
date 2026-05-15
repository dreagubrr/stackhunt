import axios from 'axios';

function normalizeJobType(value, description = '') {
  const v = (value || '').toLowerCase();
  if (v.includes('full_time') || v.includes('full-time') || v.includes('permanent')) return 'Completa';
  if (v.includes('part_time') || v.includes('part-time')) return 'Parcial';
  if (v.includes('contract') || v.includes('temporary')) return 'Temporal';
  if (v.includes('internship') || v.includes('graduate')) return 'Prácticas';
  const d = (description || '').toLowerCase();
  if (d.includes('indefinido')) return 'Indefinido';
  if (d.includes('jornada completa') || d.includes('tiempo completo')) return 'Completa';
  if (d.includes('jornada parcial') || d.includes('tiempo parcial')) return 'Parcial';
  if (d.includes('prácticas') || d.includes('becario')) return 'Prácticas';
  if (d.includes('temporal')) return 'Temporal';
  return 'No especificado';
}

const TECH_KEYWORDS = [
  'developer', 'desarrollador', 'software', 'frontend', 'backend',
  'fullstack', 'full stack', 'react', 'vue', 'angular', 'node',
  'javascript', 'typescript', 'java', 'python', 'php', 'laravel',
  'spring', '.net', 'c#', 'devops', 'cloud', 'aws', 'azure',
  'docker', 'kubernetes', 'data', 'machine learning', 'inteligencia artificial',
  'qa', 'tester', 'testing', 'sre', 'sysadmin', 'programador',
  'programmer', 'cto', 'tech lead', 'engineering manager',
  'mobile', 'ios', 'android', 'flutter', 'swift', 'kotlin',
  'ux', 'ui', 'product engineer', 'software engineer', 'wordpress',
  'ciberseguridad', 'seguridad informática', 'redes', 'sistemas',
  'salesforce', 'sap', 'analista', 'microservicios', 'api rest',
];

const EXCLUDE_KEYWORDS = [
  'camarero', 'cocinero', 'chef', 'hostelería', 'restaurante', 'barista',
  'peluquer', 'estética', 'esteticista', 'tatuador', 'vidente', 'tarot', 'fotografía',
  'dependiente', 'cajero', 'tienda', 'supermercado', 'equipo comercial',
  'carretillero', 'mozo de almacén', 'encajador', 'repartidor',
  'almacén', 'conductor', 'warehouse',
  'albañil', 'fontanero', 'electricista', 'soldador',
  'mecánico de', 'hortofrutícola', 'frescos', 'obra', 'civil', 'industrial',
  'ayudante', 'ingeniero mecánico', 'agrícola', 'aguas residuales', 'químico', 'petroquímico',
  'mecánico senior', 'ingeniero químico', 'ingeniero civil', 'ingeniero industrial', 'ingeniero eléctrico',
  'Medidor Interno',
  'médico', 'enfermero', 'fisioterapeuta', 'ginecolog',
  'logopeda', 'farmacia', 'veterinario', 'terapeuta', 'medicina',
  'profesor de', 'academia de', 'Formación Subvencionada', 'docente',
  'administrativo', 'contable', 'contabilidad',
  'teleoperador', 'call center', 'recepcionista', 'customer', 'service', 'consultor',
  'abogado', 'jurídico', 'seguros', 'banca', 'gestor banca',
  'limpieza', 'limpiador',
  'cronoshare', 'domestiko'
];

function isTechJob(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  return TECH_KEYWORDS.some(kw => text.includes(kw));
}

function isExcluded(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  return EXCLUDE_KEYWORDS.some(kw => text.includes(kw));
}

export async function getAdzunaJobs(keyword, location = 'españa') {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    const [res1, res2] = await Promise.allSettled([
      axios.get('https://api.adzuna.com/v1/api/jobs/es/search/1', {
        params: { app_id: appId, app_key: appKey, results_per_page: 50, what: keyword, where: location },
        timeout: 15000,
      }),
      axios.get('https://api.adzuna.com/v1/api/jobs/es/search/2', {
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
      jobType: normalizeJobType(job.contract_time || job.contract_type, job.description),
      description: (job.description || '').slice(0, 300),
      source: 'Adzuna',
    });

    const jobs1 = res1.status === 'fulfilled' ? (res1.value.data.results || []).map(mapJob) : [];
    const jobs2 = res2.status === 'fulfilled' ? (res2.value.data.results || []).map(mapJob) : [];

    const seen = new Set();
    return [...jobs1, ...jobs2].filter(job => {
      if (seen.has(job.link)) return false;
      seen.add(job.link);
      return isTechJob(job.title, job.description) && !isExcluded(job.title, job.description);
    });

  } catch (err) {
    console.error('Adzuna API error:', err.message);
    throw err;
  }
}