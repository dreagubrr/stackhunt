import axios from 'axios';

export async function getJoobleJobs(keyword, location = 'España') {
  try {
    const apiKey = process.env.JOOBLE_API_KEY;
    const url = `https://es.jooble.org/api/${apiKey}`;

    // Fetch page 1 and page 2 in parallel
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
      jobType: job.type || 'No especificado',
      description: job.snippet ? job.snippet.slice(0, 300) : '',
      source: 'Jooble',
    });

    const jobs1 = res1.status === 'fulfilled' ? (res1.value.data.jobs || []).map(mapJob) : [];
    const jobs2 = res2.status === 'fulfilled' ? (res2.value.data.jobs || []).map(mapJob) : [];
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
    console.error('Jooble API error:', err.message);
    throw err;
  }
}