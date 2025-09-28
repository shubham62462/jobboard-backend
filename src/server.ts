// src/server.ts - Main Server Entry Point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import DatabaseConnection from './config/database';
import { errorHandler } from './middlewares/errorHandler';
import { apiRoutes } from './routes';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.ALLOWED_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Logging
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Job Board API is running',
        version: config.API_VERSION,
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use(`/api/${config.API_VERSION}`, apiRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Test database connection
      const dbConnection = DatabaseConnection.getInstance();
      const isConnected = await dbConnection.testConnection();
      
      if (!isConnected) {
        console.error('❌ Failed to connect to database');
        process.exit(1);
      }

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
🚀 Job Board API Server Started
📡 Port: ${this.port}
🌍 Environment: ${config.NODE_ENV}
📋 API Version: ${config.API_VERSION}
🔗 Health Check: http://localhost:${this.port}/health
📚 API Docs: http://localhost:${this.port}/api/${config.API_VERSION}
        `);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start().catch(error => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});