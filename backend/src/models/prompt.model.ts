import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt extends Document {
  tipo: string;
  stack: string[];
  ideia: string;
  sabe: string;
  duvida: string;
  promptText: string;
  createdAt: Date;
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

export const Prompt = mongoose.model<IPrompt>('Prompt', PromptSchema);