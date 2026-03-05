# 🇪🇸 Job Miner España

Buscador de empleo fullstack en tiempo real para el mercado laboral español.
Fuentes: **InfoJobs · Tecnoempleo · Indeed España · Careerjet España**

---

## 🚀 Despliegue en producción

### 1. Backend → Render (gratis)

1. Sube la carpeta `server/` a un repositorio de GitHub
2. Ve a [render.com](https://render.com) → **New Web Service**
3. Conecta tu repositorio y selecciona la carpeta `server/`
4. Configura:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. En **Environment Variables** añade:
   - `API_KEY` → tu affiliate ID de Careerjet (opcional)
   - `API_URL` → `https://www.careerjet.es/jobs/api/`
   - `FRONTEND_URL` → la URL de tu app en Netlify (la obtienes en el paso siguiente)
6. Copia la URL del servicio (ej. `https://job-miner-api.onrender.com`)

---

### 2. Frontend → Netlify (gratis)

1. Sube la carpeta `client/` a un repositorio de GitHub (puede ser el mismo repo)
2. Ve a [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Selecciona tu repositorio y configura:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
4. En **Environment variables** añade:
   - `REACT_APP_API_BASE_URL` → la URL de Render del paso anterior
5. Despliega. Copia la URL (ej. `https://job-miner-spain.netlify.app`)
6. Vuelve a Render y actualiza `FRONTEND_URL` con esta URL

---

## 💻 Desarrollo local

```bash
# Backend
cd server
npm install
cp .env.example .env    # edita con tus variables
npm run dev             # http://localhost:5000

# Frontend (en otra terminal)
cd client
npm install
cp .env.example .env    # asegúrate de que apunta a localhost:5000
npm start               # http://localhost:3000
```

---

## 📡 Endpoints API

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/scrape/spain-all?keyword=react&location=Madrid` | **Todas las fuentes** (recomendado) |
| `GET /api/scrape/tecnoempleo?keyword=...&location=...` | Solo Tecnoempleo |
| `GET /api/scrape/infojobs?keyword=...&location=...` | Solo InfoJobs |
| `GET /api/scrape/indeed-es?keyword=...&location=...` | Solo Indeed España |
| `GET /api/scrape/careerjet-es?keyword=...&location=...&page=1` | Careerjet (paginado) |

---

## 🧱 Stack tecnológico

**Frontend**: React · TailwindCSS · Framer Motion · Axios · Netlify  
**Backend**: Node.js · Express · Cheerio · Axios · Render

---

## ⚠️ Notas sobre el scraping

- InfoJobs y Indeed pueden bloquear scrapers con el tiempo. Si una fuente falla, el endpoint `/spain-all` devuelve igualmente los resultados del resto.
- Careerjet (via API oficial con `locale_code: es_ES`) es la fuente más estable.
- Tecnoempleo suele ser la más accesible para scraping.
