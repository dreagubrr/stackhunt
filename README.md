# StackHunt

**Tu próximo trabajo tech en España.**

Plataforma web de búsqueda de empleo tecnológico que agrega ofertas en tiempo real de múltiples portales especializados, calcula la compatibilidad con tu perfil y genera tu CV en PDF.

 **[stackhuntproject.com](https://stackhuntproject.com)**

---

## Funcionalidades

**Búsqueda en tiempo real** — agrega ofertas de Tecnoempleo, Jooble y Adzuna simultáneamente
**Compatibilidad con perfil** — calcula el % de coincidencia entre tus habilidades y cada oferta
**Integración con GitHub** — analiza tus repositorios y valida tus habilidades con código real
**Generador de CV en PDF** — dos plantillas de diseño profesional generadas desde tu perfil
**Autenticación múltiple** — email/contraseña, Google OAuth y GitHub OAuth
**Recuperación de contraseña** — flujo completo por email con token temporal
**Ofertas guardadas** — guarda las ofertas que te interesen en tu perfil

---

## Stack tecnológico

### Frontend
- React + Tailwind CSS
- Framer Motion
- Chart.js
- jsPDF + html2canvas

### Backend
- Node.js + Express
- Passport.js + JWT
- Nodemailer + Brevo SMTP
- Cheerio + Fetch (scraping)

### Base de datos
- MongoDB Atlas (NoSQL)
- Mongoose ODM

### Cloud e infraestructura
- AWS EC2 (Ubuntu 24)
- AWS S3
- Nginx
- PM2
- Let's Encrypt (SSL)

---

## Despliegue local

### Requisitos
- Node.js 18+
- MongoDB Atlas (cuenta gratuita)

### Backend
```bash
cd server
npm install
cp .env.example .env  # Configura las variables de entorno
npm start
```

### Frontend
```bash
cd client
npm install
npm start
```

### Variables de entorno necesarias
```
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JOOBLE_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
BREVO_SMTP_USER=
BREVO_SMTP_PASS=
BREVO_FROM_EMAIL=
FRONTEND_URL=
```

---

## Estructura del proyecto

```
stackhunt/
├── client/                 # Frontend React
│   └── src/
│       ├── components/     # Componentes reutilizables
│       ├── pages/          # Páginas de la aplicación
│       └── context/        # Context API (AuthContext)
└── server/                 # Backend Node.js
    ├── config/             # Passport, env
    ├── controllers/        # Lógica de negocio (MVC)
    ├── middleware/         # Autenticación JWT
    ├── models/             # Modelos Mongoose
    ├── routes/             # Rutas de la API
    ├── scraper/            # Integraciones externas
    └── services/           # S3Service
```