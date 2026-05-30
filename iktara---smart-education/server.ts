/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard JSON and URL form body parsers
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Mount API endpoints before static/Vite middleware
  app.use('/api', apiRouter);

  // Health probe endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Hot module reloading setup with Node environmental checks
  if (process.env.NODE_ENV !== 'production') {
    console.log("Configuring Vite Development Middleware Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving pre-compiled static assets in Production Mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Express wildcard fallbacks for seamless single-page application routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`   STUDENT PERFORMANCE PREDICTOR BOOTED`);
    console.log(`   Server running on http://0.0.0.0:${PORT}`);
    console.log(`===============================================`);
  });
}

startServer().catch(err => {
  console.error("Critical server boot error:", err);
});
