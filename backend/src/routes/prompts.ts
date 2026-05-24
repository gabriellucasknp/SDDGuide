import { Router, Request, Response } from 'express';
import { Prompt } from '../models/prompt.model';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 }).limit(20);
    res.json(prompts);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar prompts' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { tipo, stack, ideia, sabe, duvida, promptText } = req.body;
    if (!tipo || !promptText) {
      res.status(400).json({ error: 'tipo e promptText são obrigatórios' });
      return;
    }
    const prompt = new Prompt({ tipo, stack, ideia, sabe, duvida, promptText });
    await prompt.save();
    res.status(201).json(prompt);
  } catch {
    res.status(500).json({ error: 'Erro ao salvar prompt' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await Prompt.findByIdAndDelete(req.params['id']);
    if (!deleted) {
      res.status(404).json({ error: 'Prompt não encontrado' });
      return;
    }
    res.json({ message: 'Deletado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar prompt' });
  }
});

export default router;