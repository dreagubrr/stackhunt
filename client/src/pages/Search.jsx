import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import JobCard, { calcCompatibility } from "../components/JobCard";

const SOURCES = [
  { value: "spain-all", label: "🇪🇸 Todas las fuentes" },
  { value: "tecnoempleo", label: "💻 Tecnoempleo" },
  { value: "jooble", label: "🔍 Jooble" },
  { value: "adzuna", label: "📊 Adzuna" },
];

const CIUDADES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza",
  "Málaga", "Murcia", "Palma", "Bilbao", "Alicante",
  "Córdoba", "Valladolid", "Vigo", "Gijón", "Granada",
  "Remoto", "España"
];

const SALARY_MIN = 0;
const SALARY_MAX = 100000;
const JOBS_PER_PAGE = 30;

const parseDate = (str) => {
  if (!str || str === 'Reciente') return 0;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [day, month, year] = str.split('/');
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).getTime();
  }
  const t = new Date(str).getTime();
  return isNaN(t) ? 0 : t;
};

const parseSalary = (salaryStr) => {
  if (!salaryStr || salaryStr === 'No especificado') return -1;
  const nums = salaryStr.match(/[\d.]+/g);
  return nums ? parseInt(nums[0].replace(/\./g, '')) : -1;
};

const SalaryRangeSlider = ({ salaryRange, onChange }) => {
  const [min, max] = salaryRange;
  const getPercent = (value) => Math.round(((value - SALARY_MIN) / (SALARY_MAX - SALARY_MIN)) * 100);
  const handleMinChange = (e) => onChange([Math.min(Number(e.target.value), max - 1000), max]);
  const handleMaxChange = (e) => onChange([min, Math.max(Number(e.target.value), min + 1000)]);
  const formatSalary = (value) => value >= SALARY_MAX ? `+${SALARY_MAX.toLocaleString()}€` : `${value.toLocaleString()}€`;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }}>Rango salarial</span>
        <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.875rem' }}>
          {formatSalary(min)} — {formatSalary(max)}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }} />
        <div className="absolute h-1.5 rounded-full" style={{ background: '#6366f1', left: `${getPercent(min)}%`, width: `${getPercent(max) - getPercent(min)}%` }} />
        <input type="range" min={SALARY_MIN} max={SALARY_MAX} step={1000} value={min} onChange={handleMinChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: min > SALARY_MAX - 10000 ? 5 : 3 }} />
        <input type="range" min={SALARY_MIN} max={SALARY_MAX} step={1000} value={max} onChange={handleMaxChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }} />
      </div>
      <div className="flex justify-between mt-1" style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
        <span>{SALARY_MIN.toLocaleString()}€</span>
        <span>+{SALARY_MAX.toLocaleString()}€</span>
      </div>
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%;
          background-color: #6366f1; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15); pointer-events: all; cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          height: 18px; width: 18px; border-radius: 50%;
          background-color: #6366f1; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15); pointer-events: all; cursor: pointer;
        }
      `}</style>
    </div>
  );
};

const Search = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { user, githubValidatedSkills } = useAuth();
  const userSkills = useMemo(() => user?.profile?.skills || [], [user]);

  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(JOBS_PER_PAGE);
  const [loading, setLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [activeSources, setActiveSources] = useState([]);
  const [searchError, setSearchError] = useState('');

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSource, setSelectedSource] = useState("spain-all");
  const [searchParams, setSearchParams] = useState(null);

  const [filters, setFilters] = useState({
    sortBy: userSkills.length ? "compatibility" : "date",
    salaryRange: [SALARY_MIN, SALARY_MAX],
  });

  const applyFilters = useCallback((jobs, currentFilters, searchedLocation = '') => {
    let result = [...jobs];
    const [minSalary, maxSalary] = currentFilters.salaryRange;
    if (minSalary > SALARY_MIN || maxSalary < SALARY_MAX) {
      result = result.filter(job => {
        const s = parseSalary(job.salary);
        return s !== -1 && s >= minSalary && s <= maxSalary;
      });
    }
    switch (currentFilters.sortBy) {
      case "compatibility":
        result.sort((a, b) => calcCompatibility(userSkills, b, githubValidatedSkills).percent - calcCompatibility(userSkills, a, githubValidatedSkills).percent);
        break;
      case "date":
        result.sort((a, b) => parseDate(b.datePosted) - parseDate(a.datePosted));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title, "es"));
        break;
      case "salary":
        result.sort((a, b) => {
          const aVal = parseSalary(a.salary), bVal = parseSalary(b.salary);
          if (aVal === -1 && bVal === -1) return 0;
          if (aVal === -1) return 1;
          if (bVal === -1) return -1;
          return bVal - aVal;
        });
        break;
      case "company":
        result.sort((a, b) => a.company.localeCompare(b.company, "es"));
        break;
      case "source":
        result.sort((a, b) => (a.source || "").localeCompare(b.source || "", "es"));
        break;
      default: break;
    }
    if (searchedLocation) {
      const loc = searchedLocation.toLowerCase();
      result.sort((a, b) => {
        const aMatch = (a.location || '').toLowerCase().includes(loc);
        const bMatch = (b.location || '').toLowerCase().includes(loc);
        return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
      });
    }
    return result;
  }, [userSkills, githubValidatedSkills]);

  useEffect(() => {
    if (!searchParams) return;
    const fetchJobs = async () => {
      setLoading(true);
      setSearchError('');
      setAllJobs([]); setFilteredJobs([]); setVisibleCount(JOBS_PER_PAGE);
      try {
        const params = new URLSearchParams();
        if (searchParams.keyword) params.append("keyword", searchParams.keyword);
        if (searchParams.location) params.append("location", searchParams.location);
        const res = await axios.get(`${BASE_URL}/api/scrape/${searchParams.source}?${params}`);
        const rawJobs = res.data.jobs || [];
        setAllJobs(rawJobs);
        setTotalHits(res.data.hits || rawJobs.length);
        setActiveSources(res.data.sources || [...new Set(rawJobs.map(j => j.source).filter(Boolean))]);
      } catch (err) {
        console.error("Error al obtener empleos:", err);
        setSearchError(err.response?.data?.error || "Error al buscar empleos. Inténtalo de nuevo.");
      }
      setLoading(false);
    };
    fetchJobs();
  }, [BASE_URL, searchParams]);

  useEffect(() => {
    setFilteredJobs(allJobs.length > 0 ? applyFilters(allJobs, filters, searchParams?.location || '') : []);
  }, [allJobs, filters, applyFilters, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim() || searchLocation.trim()) {
      setSearchParams({ keyword: searchKeyword.trim(), location: searchLocation.trim(), source: selectedSource });
    }
  };

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  const inputStyle = { border: '1px solid #e5e7eb', borderRadius: '10px', color: '#0a0a0a', background: '#fff', fontFamily: "'Inter', sans-serif" };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f6f3', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <motion.section
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 pt-28 pb-16"
      >
        <div className="mb-10">
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-0.03em', color: '#0a0a0a' }}>
            Buscar empleos
          </h2>
          <p style={{ color: '#6b7280' }} className="mt-2">
            Ofertas en tiempo real de Tecnoempleo, Jooble y Adzuna
          </p>
        </div>

        {userSkills.length > 0 && (
          <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px' }}
            className="px-4 py-3 mb-6 flex items-center gap-3 flex-wrap">
            <span style={{ color: '#4338ca', fontWeight: 600 }} className="text-sm">🎯 Compatibilidad con:</span>
            {userSkills.map(skill => (
              <span key={skill} style={{ background: '#6366f1', color: '#fff', borderRadius: '999px' }}
                className="text-xs px-2.5 py-0.5">{skill}</span>
            ))}
          </div>
        )}

        {/* Search form */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb' }} className="p-6 mb-6 shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Puesto o palabras clave</label>
                <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="ej. Desarrollador React..." style={inputStyle}
                  className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Ubicación</label>
                <input type="text" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="ej. Madrid, Remoto..." list="ciudades-list" style={inputStyle}
                  className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <datalist id="ciudades-list">{CIUDADES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Fuente</label>
                <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}
                  style={inputStyle} className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <button type="submit"
              style={{ background: '#0a0a0a', borderRadius: '10px', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
              className="text-white px-8 py-2.5 text-sm hover:bg-gray-800 transition-colors w-full md:w-auto">
              Buscar empleos →
            </button>
          </form>
        </div>

        {/* Filters */}
        {allJobs.length > 0 && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb' }} className="p-6 mb-6 shadow-sm">
            <h3 style={{ fontWeight: 600, color: '#0a0a0a', fontSize: '0.95rem' }} className="mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label style={{ color: '#374151', fontSize: '0.875rem', fontWeight: 500 }} className="block mb-1.5">Ordenar por</label>
                <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  style={inputStyle} className="w-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {userSkills.length > 0 && <option value="compatibility">🎯 Compatibilidad</option>}
                  <option value="date">Más reciente</option>
                  <option value="salary">Salario</option>
                  <option value="title">Título</option>
                  <option value="company">Empresa</option>
                  <option value="source">Fuente</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <SalaryRangeSlider salaryRange={filters.salaryRange} onChange={(range) => setFilters({ ...filters, salaryRange: range })} />
              </div>
            </div>
            {activeSources.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {activeSources.map(src => (
                  <span key={src} style={{ background: '#eef2ff', color: '#4338ca', borderRadius: '999px' }} className="text-xs px-2.5 py-1">{src}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {searchError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px', marginTop: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>❌ {searchError}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center mt-10 gap-3">
            <div className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
            <span style={{ color: '#6366f1', fontWeight: 500 }}>Buscando empleos...</span>
          </div>
        )}

        {!loading && filteredJobs.length === 0 && searchParams && (
          <p style={{ color: '#9ca3af' }} className="text-center mt-12">
            No se encontraron empleos. Prueba con otras palabras clave.
          </p>
        )}

        {!loading && !searchParams && (
          <p style={{ color: '#9ca3af' }} className="text-center mt-12">
            Introduce palabras clave para empezar a buscar.
          </p>
        )}

        {!loading && filteredJobs.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Mostrando {visibleJobs.length} de {filteredJobs.length} ofertas
              </p>
              {totalHits > filteredJobs.length && (
                <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{totalHits} totales encontradas</p>
              )}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-5 mb-8">
              {visibleJobs.map((job, idx) => (
                <JobCard key={`${job.link || idx}-${idx}`} job={job} userSkills={userSkills} githubValidatedSkills={githubValidatedSkills} />
              ))}
            </motion.div>

            {hasMore && (
              <div className="flex justify-center mt-4 mb-8">
                <button onClick={() => setVisibleCount(v => v + JOBS_PER_PAGE)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '10px', color: '#374151', fontWeight: 500, background: '#fff' }}
                  className="px-8 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  Ver más ofertas ({filteredJobs.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </motion.section>
    </div>
  );
};

export default Search;