import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// URL base de la API, definida en el .env del cliente
const API = process.env.REACT_APP_API_BASE_URL;

// Colores del badge de fuente según de dónde viene la oferta
const SOURCE_STYLES = {
  'Tecnoempleo': { background: '#f0fdf4', color: '#16a34a' }, // verde
  'Jooble': { background: '#eff6ff', color: '#2563eb' },      // azul
  'Adzuna': { background: '#faf5ff', color: '#7c3aed' },      // morado
};

// ─────────────────────────────────────────────
// FUNCIÓN DE COMPATIBILIDAD
// Se exporta porque Search.jsx también la usa para ordenar resultados
// ─────────────────────────────────────────────
export const calcCompatibility = (userSkills = [], job, githubValidatedSkills = []) => {
  // Si el usuario no tiene skills en su perfil, no podemos calcular nada
  if (!userSkills.length) return { percent: 0, matched: [], validatedMatched: [] };

  // Juntamos título + descripción de la oferta en un solo texto en minúsculas
  // para poder comparar sin importar mayúsculas
  const jobText = `${job.title} ${job.description || ''}`.toLowerCase();

  // Filtramos qué skills del usuario aparecen en el texto de la oferta
  const matched = userSkills.filter(skill => jobText.includes(skill.toLowerCase()));

  // De las skills que coinciden, separamos las que además están validadas en GitHub
  // (aparecen en sus repositorios reales) de las que solo están declaradas en el perfil
  const validatedMatched = matched.filter(skill => githubValidatedSkills.includes(skill));
  const unvalidatedMatched = matched.filter(skill => !githubValidatedSkills.includes(skill));

  // Las skills validadas por GitHub valen 1.5x más porque están demostradas con código real
  const weightedMatches = validatedMatched.length * 1.5 + unvalidatedMatched.length;

  // Calculamos el máximo posible para normalizar el porcentaje:
  // - Con GitHub: si todas las skills coincidieran, las validadas pesarían 1.5x
  // - Sin GitHub: el máximo es simplemente el total de skills del usuario
  const maxPossible = githubValidatedSkills.length > 0
    ? validatedMatched.length * 1.5 + (userSkills.length - validatedMatched.length)
    : userSkills.length;

  // Calculamos el ratio crudo (entre 0 y 1)
  const raw = githubValidatedSkills.length > 0
    ? weightedMatches / Math.max(maxPossible, userSkills.length)
    : matched.length / userSkills.length;

  // Convertimos a porcentaje, redondeamos y limitamos a 100 máximo
  return { percent: Math.min(100, Math.round(raw * 100)), matched, validatedMatched };
};

// ─────────────────────────────────────────────
// COMPONENTE BADGE DE COMPATIBILIDAD
// Se muestra dentro de cada JobCard con la barra de progreso y las skills coincidentes
// ─────────────────────────────────────────────
const CompatibilityBadge = ({ percent, matched, validatedMatched = [] }) => {
  // Si el porcentaje es 0 (sin skills o sin coincidencias), no mostramos nada
  if (!percent) return null;

  // Color del badge según el porcentaje: verde / amarillo / gris
  const color = percent >= 70 ? { bg: '#f0fdf4', text: '#16a34a', bar: '#16a34a' }
    : percent >= 40 ? { bg: '#fffbeb', text: '#d97706', bar: '#d97706' }
    : { bg: '#f9fafb', text: '#6b7280', bar: '#9ca3af' };

  return (
    <div style={{ background: color.bg, borderRadius: '10px', padding: '10px 12px', marginTop: '12px' }}>

      {/* Fila superior: etiqueta "Compatibilidad" y el número */}
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ color: color.text, fontSize: '0.75rem', fontWeight: 600 }}>Compatibilidad</span>
        <span style={{ color: color.text, fontSize: '0.8rem', fontWeight: 700 }}>{percent}%</span>
      </div>

      {/* Barra de progreso: fondo gris con relleno de color animado */}
      <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '999px', height: '4px', marginBottom: '8px' }}>
        <div style={{ width: `${percent}%`, height: '4px', borderRadius: '999px', background: color.bar, transition: 'width 0.4s ease' }} />
      </div>

      {/* Lista de skills coincidentes como pills */}
      {matched.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {matched.map(skill => (
            // Las validadas por GitHub aparecen en verde más oscuro con ✓
            // Las no validadas usan el color base del badge
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

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL: JobCard
// Recibe una oferta y las skills del usuario para calcular la compatibilidad
// ─────────────────────────────────────────────
const JobCard = ({ job, userSkills = [], githubValidatedSkills = [] }) => {
  const { user, updateSavedJobs } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  // Inicializamos `saved` comprobando si esta oferta ya está en los trabajos guardados del usuario.
  // Usamos función de inicialización (() => ...) para que solo se evalúe una vez al montar
  const [saved, setSaved] = useState(() => user?.savedJobs?.some(j => j.url === job.link) || false);

  // Calculamos la compatibilidad al renderizar la tarjeta
  const { percent, matched, validatedMatched } = calcCompatibility(userSkills, job, githubValidatedSkills);

  // Convierte distintos formatos de fecha a formato español (dd/mm/yyyy)
  // Tecnoempleo devuelve "12/05/2025", Adzuna devuelve ISO "2025-05-12", Jooble devuelve texto
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Reciente') return 'Reciente';
    try {
      // Formato dd/mm/yyyy de Tecnoempleo — hay que reordenar para que Date lo entienda
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`).toLocaleDateString('es-ES');
      }
      // Formato ISO u otros — Date lo parsea directamente
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('es-ES');
    } catch { return dateString; }
  };

  // Guarda la oferta en el perfil del usuario llamando al backend
  const handleSave = async () => {
    // Si no está logueado, lo mandamos a login
    if (!user) return navigate('/login');
    // Si ya está guardada, lo llevamos al perfil para verla
    if (saved) return navigate('/profile');

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/users/saved-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          title: job.title, company: job.company,
          // location puede ser array (Adzuna) o string (resto), lo normalizamos
          location: Array.isArray(job.location) ? job.location.join(', ') : job.location,
          url: job.link, source: job.source,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateSavedJobs(data); // actualiza el contexto global con la lista nueva
        setSaved(true);        // cambia la estrella a guardada
      }
    } catch (err) {
      console.error('Error al guardar oferta:', err);
    } finally { setSaving(false); }
  };

  // Color del badge de fuente (Tecnoempleo / Jooble / Adzuna), gris si fuente desconocida
  const sourceStyle = SOURCE_STYLES[job.source] || { background: '#f9fafb', color: '#6b7280' };

  // El borde de la tarjeta cambia de color según la compatibilidad:
  // verde si ≥70%, amarillo si ≥40%, gris por defecto
  const borderColor = percent >= 70 ? '#bbf7d0' : percent >= 40 ? '#fde68a' : '#e5e7eb';

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: '#ffffff',
      border: `1px solid ${borderColor}`, // borde dinámico según compatibilidad
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
      // Efecto hover: sombra + subida de 2px para dar sensación de profundidad
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div>
        {/* Título de la oferta + badge de fuente */}
        <div className="flex justify-between items-start mb-2">
          <h3 style={{ color: '#0a0a0a', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.4 }} className="flex-1 mr-2">{job.title}</h3>
          {job.source && (
            <span style={{ ...sourceStyle, borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', whiteSpace: 'nowrap' }}>
              {job.source}
            </span>
          )}
        </div>

        {/* Nombre de la empresa */}
        <p style={{ color: '#374151', fontWeight: 500, fontSize: '0.875rem', marginBottom: '10px' }}>{job.company}</p>

        {/* Descripción: limpiamos etiquetas HTML residuales y cortamos a 200 caracteres */}
        {job.description && (
          <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '12px' }}
            className="line-clamp-3">
            {job.description.replace(/<[^>]+>/g, '').slice(0, 200)}
            {job.description.length > 200 ? '...' : ''}
          </p>
        )}

        {/* Metadatos: ubicación, salario, jornada y fecha */}
        <div style={{ fontSize: '0.8rem', color: '#6b7280' }} className="space-y-1">
          {job.location && (
            <p className="flex items-center gap-1.5">
              <span>📍</span>
              {/* Adzuna puede devolver location como array, el resto como string */}
              <span>{Array.isArray(job.location) ? job.location.join(', ') : job.location}</span>
            </p>
          )}
          {/* Solo mostramos salario si está especificado */}
          {job.salary && job.salary !== 'No especificado' && (
            <p className="flex items-center gap-1.5"><span>💶</span><span>{job.salary}</span></p>
          )}
          {/* Solo mostramos tipo de jornada si está especificado */}
          {job.jobType && job.jobType !== 'No especificado' && (
            <p className="flex items-center gap-1.5"><span>💼</span><span>{job.jobType}</span></p>
          )}
          {job.datePosted && (
            <p className="flex items-center gap-1.5"><span>📅</span><span>{formatDate(job.datePosted)}</span></p>
          )}
        </div>

        {/* Badge de compatibilidad con barra de progreso y skills coincidentes */}
        <CompatibilityBadge percent={percent} matched={matched} validatedMatched={validatedMatched} />
      </div>

      {/* Botones de acción: ver oferta (enlace externo) y guardar (estrella) */}
      <div className="flex gap-2 mt-4">
        <a href={job.link} target="_blank" rel="noopener noreferrer"
          style={{ background: '#0a0a0a', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, padding: '8px 16px', textAlign: 'center', flex: 1, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#374151'}
          onMouseLeave={e => e.currentTarget.style.background = '#0a0a0a'}>
          Ver oferta →
        </a>
        {/* La estrella cambia de ☆ a ★ y de gris a amarillo cuando se guarda */}
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
