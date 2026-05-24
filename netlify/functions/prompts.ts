import type { Handler, HandlerEvent } from '@netlify/functions';
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

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  try {
    await connectDB();

    if (event.httpMethod === 'GET') {
      const prompts = await PromptModel.find().sort({ createdAt: -1 }).limit(20);
      return {
        statusCode: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify(prompts)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body ?? '{}') as Partial<IPrompt>;
      const { tipo, stack, ideia, sabe, duvida, promptText } = body;
      if (!tipo || !promptText) {
        return {
          statusCode: 400,
          headers: { ...cors, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'tipo e promptText são obrigatórios' })
        };
      }
      const prompt = new PromptModel({ tipo, stack, ideia, sabe, duvida, promptText });
      await prompt.save();
      return {
        statusCode: 201,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      };
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.['id'] ?? '';
      const deleted = await PromptModel.findByIdAndDelete(id);
      if (!deleted) {
        return {
          statusCode: 404,
          headers: { ...cors, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Não encontrado' })
        };
      }
      return {
        statusCode: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Deletado' })
      };
    }

    return {
      statusCode: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro interno' })
    };
  }
};

export { handler };
