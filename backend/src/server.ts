import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  // Step 1: Connect to PostgreSQL
  await connectDatabase();

  // Step 2: Start listening for HTTP requests
  app.listen(PORT, () => {
    console.log(`🚀 TurnoApp API running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();