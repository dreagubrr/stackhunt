import express from 'express';
import dotenv from 'dotenv';
import scrapeRoutes from './routes/scrapeRoutes.js';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://jobminerspain-1.onrender.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

app.use('/api/scrape', scrapeRoutes);

app.get('/', (req, res) => {
  res.send('Job Miner España API - funcionando ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
