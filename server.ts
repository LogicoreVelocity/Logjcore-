import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Drive API Endpoint to list report files
  app.get('/api/drive/files', async (req, res) => {
    const token = req.headers['x-goog-workspace-access-token'];
    if (!token || typeof token !== 'string') {
      return res.status(401).json({ error: 'Missing Workspace Access Token' });
    }
    
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: token });
      const drive = google.drive({ version: 'v3', auth });
      
      const response = await drive.files.list({
        // Get Excel and CSV files
        q: "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='text/csv'",
        fields: 'files(id, name, mimeType)',
      });
      
      res.json(response.data.files || []);
    } catch (error: any) {
      console.error('Error fetching drive files:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Gemini AI endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const ai = new GoogleGenAI({}); // uses process.env.GEMINI_API_KEY
      const { prompt } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          // As requested, enable thinking mode with high level
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/db-url', (req, res) => {
    res.json({ url: process.env.DATABASE_URL });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`DB URL:`, process.env.DATABASE_URL);
  });
}

startServer();
