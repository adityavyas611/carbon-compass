import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleInsightRequest, handleWeeklyReportRequest } from './api/_lib/handlers';
import { applySecurityHeaders } from './api/_lib/securityHeaders';

function setSecurityHeaders(res: ServerResponse): void {
  applySecurityHeaders((name, value) => res.setHeader(name, value));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolveBody(data));
    req.on('error', reject);
  });
}

async function apiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  if (!req.url?.startsWith('/api/') || req.method !== 'POST') {
    next();
    return;
  }

  try {
    const body = await readBody(req);
    const parsed = body ? JSON.parse(body) : {};
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'local';

    if (req.url === '/api/insights') {
      const result = await handleInsightRequest(parsed, clientIp);
      setSecurityHeaders(res);
      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.body));
      return;
    }

    if (req.url === '/api/weekly-report') {
      const result = await handleWeeklyReportRequest(parsed, clientIp);
      setSecurityHeaders(res);
      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.body));
      return;
    }

    next();
  } catch {
    setSecurityHeaders(res);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }

  return {
    plugins: [
      react(),
      {
        name: 'security-headers',
        configureServer(server) {
          server.middlewares.use((_req, res, next) => {
            setSecurityHeaders(res);
            next();
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use((_req, res, next) => {
            setSecurityHeaders(res);
            next();
          });
        },
      },
      {
        name: 'api-dev-middleware',
        configureServer(server) {
          server.middlewares.use(apiMiddleware);
        },
      },
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('recharts') || id.includes('d3-')) return 'recharts';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'react';
            if (id.includes('date-fns')) return 'date-fns';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('zustand')) return 'zustand';
            if (id.includes('zod')) return 'zod';
          },
        },
      },
    },
  };
});
