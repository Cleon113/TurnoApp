import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://turnoapp.vercel.app'
    : 'http://localhost:4200',
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    app: 'TurnoApp API',
    timestamp: new Date().toISOString(),
  });
});

export default app;