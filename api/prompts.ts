import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose, { Document, Schema } from 'mongoose';

interface IPrompt extends Document {
  tipo: string;
  stack: string[];
  ideia: string;
  sabe: string;
  duvida: string;
  promptText: string;
}

const PromptSchema = new Schema<IPrompt>(
  {
    tipo: { type: String, required: true },
    stack: { type: [String], default: [] },
    ideia: { type: String, default: '' },
    sabe: { type: String, default: '' },
    duvida: { type: String, default: '' },
    promptText: { type: String, required: true }
  },
  { timestamps: true }
);

const PromptModel =
  (mongoose.models['Prompt'] as mongoose.Model<IPrompt>) ??
  mongoose.model<IPrompt>('Prompt', PromptSchema);

let connected = false;

async function connectDB(): Promise<void> {
  if (connected && mongoose.connection.readyState === 1) return;
  const uri = process.env['MONGODB_URI'];
  if (!uri) throw new Error('MONGODB_URI não definida');
  await mongoose.connect(uri);
  connected = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const prompts = await PromptModel.find().sort({ createdAt: -1 }).limit(20);
      return res.json(prompts);
    }

    if (req.method === 'POST') {
      const { tipo, stack, ideia, sabe, duvida, promptText } = req.body as Partial<IPrompt>;
      if (!tipo || !promptText) {
        return res.status(400).json({ error: 'tipo e promptText são obrigatórios' });
      }
      const prompt = new PromptModel({ tipo, stack, ideia, sabe, duvida, promptText });
      await prompt.save();
      return res.status(201).json(prompt);
    }

    if (req.method === 'DELETE') {
      const id = (req.query['id'] as string) ?? '';
      const deleted = await PromptModel.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Não encontrado' });
      return res.json({ message: 'Deletado' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}