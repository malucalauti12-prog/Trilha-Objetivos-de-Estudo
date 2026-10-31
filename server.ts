import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI SDK (Server-Side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// 1. RECURSOS DE INTELIGÊNCIA ARTIFICIAL (IA)
// ==========================================

/**
 * Endpoint para gerar uma Trilha de Estudos estruturada com IA a partir de um tema/objetivo geral.
 */
app.post('/api/ai/plan-study', async (req: Request, res: Response) => {
  try {
    const { topic, timeframe, dailyMinutes, experienceLevel } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'O tema de estudo é obrigatório.' });
    }

    const prompt = `Você é um mentor pedagógico acolhedor especialista em educação para iniciantes do aplicativo "Trilha Viva".
O estudante quer aprender sobre: "${topic}".
Tempo total disponível: ${timeframe || '2 semanas'}.
Tempo diário de estudo: ${dailyMinutes || 30} minutos por dia.
Nível de experiência: ${experienceLevel || 'iniciante'}.

Gere um plano de estudos com 4 a 6 micro-metas práticas e realistas para iniciantes.
Cada micro-meta deve ser pequena, clara e fácil de concluir em uma sessão de estudo (regra do passo menor possível).
Evite jargões complexos e metas gigantes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Você é um mentor especialista em pedagogia e organização de estudos para estudantes iniciantes. Sempre responda em português do Brasil com linguagem encorajadora, estruturada e prática.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studyOverview: {
              type: Type.STRING,
              description: 'Um resumo curto e motivador do plano de estudos gerado (2 frases).',
            },
            goals: {
              type: Type.ARRAY,
              description: 'Lista de 4 a 6 metas de estudo ordenadas cronologicamente.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Título conciso e acionável da meta (ex: "Aprender variáveis e tipos primitivos").',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Passos práticos (ex: "Assistir vídeo de 15 min, anotar resumo e fazer 2 testes práticos").',
                  },
                  category: {
                    type: Type.STRING,
                    description: 'Categoria da matéria (ex: "Programação", "Matemática", "Idiomas", "Geral").',
                  },
                  daysAhead: {
                    type: Type.INTEGER,
                    description: 'Em quantos dias a partir de hoje essa meta deve ser concluída (ex: 2, 4, 7, 10).',
                  },
                  priority: {
                    type: Type.STRING,
                    description: 'Prioridade da meta: "baixa", "media" ou "alta".',
                  },
                  studyTip: {
                    type: Type.STRING,
                    description: 'Dica pedagógica curta para não travar nessa etapa.',
                  },
                },
                required: ['title', 'description', 'category', 'daysAhead', 'priority'],
              },
            },
          },
          required: ['studyOverview', 'goals'],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Resposta vazia da IA.');
    }

    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Erro na API de IA de planejamento:', error);
    return res.status(500).json({
      error: 'Não foi possível gerar o plano de estudos no momento.',
      details: error?.message || 'Erro interno',
    });
  }
});

/**
 * Endpoint para aprimorar uma meta específica com a IA (quebra em passos práticos).
 */
app.post('/api/ai/refine-goal', async (req: Request, res: Response) => {
  try {
    const { title, category } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'O título da meta é obrigatório.' });
    }

    const prompt = `O estudante iniciante cadastrou a seguinte ideia de meta: "${title}" (Categoria: ${category || 'Geral'}).
Como mentor pedagógico, aprimore essa meta para um estudante iniciante:
1. Deixe o título mais claro e acionável.
2. Crie uma descrição detalhada em 2 ou 3 passos práticos (ex: Leitura ativa + anotação + exercícios).
3. Sugira uma categoria e um prazo realista em dias (ex: 3 a 5 dias).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedTitle: { type: Type.STRING },
            refinedDescription: { type: Type.STRING },
            suggestedDays: { type: Type.INTEGER },
            suggestedPriority: { type: Type.STRING },
            pedagogicalTip: { type: Type.STRING },
          },
          required: ['refinedTitle', 'refinedDescription', 'suggestedDays', 'suggestedPriority'],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) throw new Error('Sem resposta da IA.');
    return res.json(JSON.parse(outputText));
  } catch (error: any) {
    console.error('Erro ao aprimorar meta:', error);
    return res.status(500).json({
      error: 'Não foi possível aprimorar a meta no momento.',
      details: error?.message,
    });
  }
});

// ==========================================
// 2. SINCRONIZAÇÃO ENTRE DISPOSITIVOS (CLOUD SYNC)
// ==========================================

const SYNC_CACHE_FILE = path.resolve(__dirname, 'sync_store.json');

interface SyncRecord {
  syncCode: string;
  goals: any[];
  categories: any[];
  lastSyncedAt: string;
}

let syncStore: Record<string, SyncRecord> = {};

// Carrega cache existente se houver
try {
  if (fs.existsSync(SYNC_CACHE_FILE)) {
    const raw = fs.readFileSync(SYNC_CACHE_FILE, 'utf-8');
    syncStore = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Iniciando novo sync store');
}

const persistSyncStore = () => {
  try {
    fs.writeFileSync(SYNC_CACHE_FILE, JSON.stringify(syncStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Falha ao persistir sync store no disco:', e);
  }
};

/**
 * Gera um novo código de sincronização amigável de 6 dígitos.
 */
app.post('/api/sync/generate-code', (_req: Request, res: Response) => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const num = Math.floor(100 + Math.random() * 900);
  const syncCode = `TRILHA-${prefix}${num}`;
  return res.json({ syncCode });
});

/**
 * Envia dados locais para a nuvem para um código de sincronização.
 */
app.post('/api/sync/push', (req: Request, res: Response) => {
  const { syncCode, goals, categories } = req.body;

  if (!syncCode || typeof syncCode !== 'string') {
    return res.status(400).json({ error: 'Código de sincronização é obrigatório.' });
  }

  const normalizedCode = syncCode.trim().toUpperCase();
  const lastSyncedAt = new Date().toISOString();

  syncStore[normalizedCode] = {
    syncCode: normalizedCode,
    goals: Array.isArray(goals) ? goals : [],
    categories: Array.isArray(categories) ? categories : [],
    lastSyncedAt,
  };

  persistSyncStore();

  return res.json({
    success: true,
    syncCode: normalizedCode,
    lastSyncedAt,
    goalsCount: syncStore[normalizedCode].goals.length,
    categoriesCount: syncStore[normalizedCode].categories.length,
  });
});

/**
 * Baixa dados da nuvem usando o código de sincronização.
 */
app.get('/api/sync/pull/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim().toUpperCase();

  const record = syncStore[code];
  if (!record) {
    return res.status(404).json({
      error: 'Nenhum dado encontrado para este código de sincronização.',
      code,
    });
  }

  return res.json({
    success: true,
    syncCode: record.syncCode,
    goals: record.goals,
    categories: record.categories,
    lastSyncedAt: record.lastSyncedAt,
  });
});

// ==========================================
// 3. VITE MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { port: 24678 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Trilha Viva] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
