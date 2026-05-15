import axios from 'axios';

const TECH_KEYWORDS = [
  'developer', 'desarrollador', 'programador', 'software', 'frontend', 'backend',
  'fullstack', 'full stack', 'full-stack', 'devops', 'data', 'cloud', 'infraestructura',
  'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue', 'node',
  'php', 'ruby', 'golang', 'kotlin', 'swift', 'flutter', 'android', 'ios',
  'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'git',
  'ciberseguridad', 'seguridad', 'redes', 'sistemas', 'it ', 'ti ',
  'scrum', 'agile', 'microservicios', 'api', 'rest', 'graphql',
  'machine learning', 'inteligencia artificial', 'ia ', 'bi ', 'analista',
  'arquitecto', 'qa ', 'testing', 'ux', 'ui ', 'diseñador web', 'wordpress',
  'sap', 'salesforce', 'cto', 'cio', 'tech lead', 'ingeniero de software',
];

const EXCLUDE_KEYWORDS = [
  'camarero', 'cocinero', 'chef', 'hostelería', 'restaurante', 'barista',
  'peluquer', 'estética', 'esteticista', 'tatuador', 'vidente', 'tarot', 'fotografía',
  'dependiente', 'cajero', 'tienda', 'supermercado', 'equipo comercial', 'mercado',
  'carretillero', 'mozo de almacén', 'encajador', 'repartidor',
  'almacén', 'conductor', 'warehouse',
  'albañil', 'fontanero', 'electricista', 'soldador', 'mecánico de', 'hortofrutícola', 'frescos', 'obra', 'civil', 'industrial',
  'ayudante', 'ingeniero mecánico', 'agrícola', 'aguas residuales', 'químico', 'petroquímico',
  'mecánico senior', 'ingeniero químico', 'procesos industriales',
  'ingeniero civil', 'ingeniero industrial', 'ingeniero eléctrico',
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

function normalizeJobType(value, description = '') {
  const v = (value || '').toLowerCase();
  if (v.includes('full') || v.includes('completa') || v.includes('tiempo completo')) return 'Completa';
  if (v.includes('part') || v.includes('parcial') || v.includes('tiempo parcial')) return 'Parcial';
  if (v.includes('indefinido') || v.includes('permanent')) return 'Indefinido';
  if (v.includes('temporal') || v.includes('temporary') || v.includes('contract')) return 'Temporal';
  if (v.includes('prácticas') || v.includes('internship') || v.includes('becario')) return 'Prácticas';
  if (v.includes('freelance')) return 'Freelance';
  const d = (description || '').toLowerCase();
  if (d.includes('indefinido')) return 'Indefinido';
  if (d.includes('jornada completa') || d.includes('tiempo completo')) return 'Completa';
  if (d.includes('jornada parcial') || d.includes('tiempo parcial')) return 'Parcial';
  if (d.includes('prácticas') || d.includes('becario')) return 'Prácticas';
  if (d.includes('temporal')) return 'Temporal';
  return 'No especificado';
}

export async function getJoobleJobs(keyword, location = 'España') {
  try {
    const apiKey = process.env.JOOBLE_API_KEY;
    const url = `https://es.jooble.org/api/${apiKey}`;

    const [res1, res2] = await Promise.allSettled([
      axios.post(url, { keywords: keyword, location, page: 1 }, {
        headers: { 'Content-Type': 'application/json' }, timeout: 15000,
      }),
      axios.post(url, { keywords: keyword, location, page: 2 }, {
        headers: { 'Content-Type': 'application/json' }, timeout: 15000,
      }),
    ]);

    const mapJob = (job) => ({
      title: job.title || 'Sin título',
      company: job.company || 'No especificada',
      link: job.link || '',
      location: job.location || location,
      salary: job.salary || 'No especificado',
      datePosted: job.updated || 'Reciente',
      jobType: normalizeJobType(job.type, job.snippet),
      description: job.snippet ? job.snippet.replace(/&nbsp;/g, ' ').replace(/\.\.\./g, '').replace(/<[^>]+>/g, '').trim().slice(0, 300) : '',
      source: 'Jooble',
    });

    const jobs1 = res1.status === 'fulfilled' ? (res1.value.data.jobs || []).map(mapJob) : [];
    const jobs2 = res2.status === 'fulfilled' ? (res2.value.data.jobs || []).map(mapJob) : [];

    const seen = new Set();
    const deduped = [...jobs1, ...jobs2].filter(job => {
      if (seen.has(job.link)) return false;
      seen.add(job.link);
      return true;
    });

    return deduped.filter(job => isTechJob(job.title, job.description) && !isExcluded(job.title, job.description));
  } catch (err) {
    console.error('Jooble API error:', err.message);
    throw err;
  }
}