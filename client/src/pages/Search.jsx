import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import JobCard from "../components/JobCard";

const SOURCES = [
  { value: "spain-all", label: "🇪🇸 Todas las fuentes" },
  { value: "tecnoempleo", label: "💻 Tecnoempleo" },
  { value: "infojobs", label: "📋 InfoJobs" },
  { value: "indeed-es", label: "🔍 Indeed España" },
  { value: "careerjet-es", label: "🌐 Careerjet España" },
];

const CIUDADES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza",
  "Málaga", "Murcia", "Palma", "Bilbao", "Alicante",
  "Córdoba", "Valladolid", "Vigo", "Gijón", "Granada",
  "Remoto", "España"
];

const Search = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [activeSources, setActiveSources] = useState([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSource, setSelectedSource] = useState("spain-all");
  const [searchParams, setSearchParams] = useState(null);

  const [filters, setFilters] = useState({ sortBy: "date", salaryMin: "" });

  const applyFilters = useCallback((jobs, currentFilters) => {
    let result = [...jobs];

    if (currentFilters.salaryMin) {
      const minSalary = parseInt(currentFilters.salaryMin);
      result = result.filter((job) => {
        if (!job.salary) return false;
        const salaryNumbers = job.salary.match(/\d+/g);
        if (salaryNumbers && salaryNumbers.length > 0) {
          return parseInt(salaryNumbers[0]) >= minSalary;
        }
        return false;
      });
    }

    switch (currentFilters.sortBy) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title, "es"));
        break;
      case "salary":
        result.sort((a, b) => {
          const val = (job) => {
            const nums = job.salary?.match(/\d+/g);
            return nums ? parseInt(nums[0]) : 0;
          };
          return val(b) - val(a);
        });
        break;
      case "company":
        result.sort((a, b) => a.company.localeCompare(b.company, "es"));
        break;
      case "source":
        result.sort((a, b) => (a.source || "").localeCompare(b.source || "", "es"));
        break;
      default:
        break;
    }

    return result;
  }, []);

  useEffect(() => {
    if (!searchParams) return;

    const fetchJobs = async () => {
      setLoading(true);
      setAllJobs([]);
      setFilteredJobs([]);

      try {
        const params = new URLSearchParams();
        if (searchParams.keyword) params.append("keyword", searchParams.keyword);
        if (searchParams.location) params.append("location", searchParams.location);
        if (searchParams.source === "careerjet-es") params.append("page", currentPage.toString());

        const res = await axios.get(
          `${BASE_URL}/api/scrape/${searchParams.source}?${params}`
        );

        const rawJobs = res.data.jobs || [];
        setAllJobs(rawJobs);
        setTotalHits(res.data.hits || rawJobs.length);
        setTotalPages(res.data.totalPages || 1);
        setActiveSources(res.data.sources || [...new Set(rawJobs.map(j => j.source).filter(Boolean))]);
      } catch (err) {
        console.error("Error al obtener empleos:", err);
        alert(err.response?.data?.error || "Error al buscar empleos. Inténtalo de nuevo.");
      }

      setLoading(false);
    };

    fetchJobs();
  }, [BASE_URL, searchParams, currentPage]);

  useEffect(() => {
    if (allJobs.length > 0) {
      setFilteredJobs(applyFilters(allJobs, filters));
    } else {
      setFilteredJobs([]);
    }
  }, [allJobs, filters, applyFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim() || searchLocation.trim()) {
      setCurrentPage(1);
      setSearchParams({
        keyword: searchKeyword.trim(),
        location: searchLocation.trim(),
        source: selectedSource,
      });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <motion.section
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <h2 className="text-4xl font-bold text-blue-700 mb-2 text-center md:text-left">
          Buscar Empleos en España
        </h2>
        <p className="text-gray-500 mb-8 text-center md:text-left">
          Ofertas en tiempo real de InfoJobs, Tecnoempleo, Indeed España y más
        </p>

        <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puesto o Palabras clave
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="ej. Desarrollador React, Data Analyst..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="ej. Madrid, Barcelona, Remoto..."
                list="ciudades-list"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="ciudades-list">
                {CIUDADES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuente
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full md:w-auto"
          >
            Buscar Empleos
          </button>
        </form>

        {allJobs.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="date">Más reciente</option>
                  <option value="title">Título del puesto</option>
                  <option value="salary">Mayor salario</option>
                  <option value="company">Empresa</option>
                  <option value="source">Fuente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salario mínimo (€)</label>
                <input
                  type="number"
                  placeholder="ej. 25000"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {activeSources.length > 1 && (
                <div className="flex items-end">
                  <div className="flex flex-wrap gap-2">
                    {activeSources.map((src) => (
                      <span key={src} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{src}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center mt-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-blue-600 font-medium">Buscando empleos...</span>
          </div>
        )}

        {!loading && filteredJobs.length === 0 && searchParams && (
          <p className="text-center text-gray-500 mt-12 text-lg">
            No se encontraron empleos. Prueba con otras palabras clave o ubicación.
          </p>
        )}

        {!loading && !searchParams && (
          <p className="text-center text-gray-500 mt-12 text-lg">
            Introduce palabras clave y/o ubicación para empezar a buscar.
          </p>
        )}

        {!loading && filteredJobs.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Mostrando {filteredJobs.length} de {totalHits} ofertas
              </p>
              {totalPages > 1 && (
                <p className="text-gray-600">Página {currentPage} de {totalPages}</p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-6 mb-8"
            >
              {filteredJobs.map((job, idx) => (
                <JobCard key={`${job.link || idx}-${idx}`} job={job} />
              ))}
            </motion.div>

            {totalPages > 1 && selectedSource === "careerjet-es" && (
              <div className="flex justify-center space-x-2 mt-8">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50">
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  return (
                    <button key={pageNum} onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-md ${currentPage === pageNum ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-blue-50"}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50">
                  Siguiente
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
