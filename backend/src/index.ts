import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import promptsRouter from './routes/prompts';

const app = express();
const PORT = process.env['PORT'] ?? 3000;
const MONGODB_URI = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/sddguide';

// Remove o header X-Powered-By para não expor que usa Express
app.disable('x-powered-by');

app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/prompts', promptsRouter);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err: Error) => {
    console.error('Falha ao conectar no MongoDB:', err);
    process.exit(1);
  });