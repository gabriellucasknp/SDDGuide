import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly tipoTags = [
    'Fullstack Web', 'Backend', 'Frontend Web', 'Desktop', 'Mobile',
    'Engenharia de Dados', 'Ciência de Dados', 'API / Microsserviço'
  ];

  readonly stackTags = [
    'C#', 'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust',
    'React', 'Vue', 'Angular', '.NET / ASP.NET', 'WPF', 'FastAPI',
    'Node.js', 'SQL Server', 'PostgreSQL', 'MongoDB', 'Docker',
    'Spark', 'dbt', 'Airflow'
  ];

  readonly flowSteps = [
    '01 Entrevista', '02 mini-SDD', '03 Plano', '04 Execução', '05 Docs'
  ];

  selectedTipo: string | null = null;
  selectedStack: string[] = [];
  stackExtra = '';
  ideia = '';
  sabe = '';
  duvida = '';

  promptHtml: SafeHtml = '';
  rawPrompt = '';
  hasPrompt = false;
  showCopyBtn = false;
  showCopyFeedback = false;

  constructor(private sanitizer: DomSanitizer) {}

  selectTipo(val: string): void {
    this.selectedTipo = val;
  }

  toggleStack(val: string): void {
    const idx = this.selectedStack.indexOf(val);
    if (idx === -1) {
      this.selectedStack = [...this.selectedStack, val];
    } else {
      this.selectedStack = this.selectedStack.filter(v => v !== val);
    }
  }

  gerarPrompt(): void {
    const tipo = this.selectedTipo ?? '[tipo não selecionado]';
    const stack = [...this.selectedStack];

    if (this.stackExtra.trim()) {
      this.stackExtra.split(',').forEach(e => {
        const t = e.trim();
        if (t) stack.push(t);
      });
    }

    const stackStr = stack.length ? stack.join(', ') : '[stack não selecionada]';
    const ideia = this.ideia.trim() || '[não informado]';
    const sabe = this.sabe.trim() || '[não informado]';
    const duvida = this.duvida.trim() || '[não informado]';

    this.rawPrompt = this.buildPrompt(tipo, stackStr, ideia, sabe, duvida);
    this.promptHtml = this.sanitizer.bypassSecurityTrustHtml(
      this.formatPrompt(this.rawPrompt)
    );
    this.hasPrompt = true;
    this.showCopyBtn = true;
  }

  copiar(): void {
    navigator.clipboard.writeText(this.rawPrompt).then(() => {
      this.showCopyFeedback = true;
      setTimeout(() => (this.showCopyFeedback = false), 2000);
    });
  }

  limpar(): void {
    this.selectedTipo = null;
    this.selectedStack = [];
    this.stackExtra = '';
    this.ideia = '';
    this.sabe = '';
    this.duvida = '';
    this.rawPrompt = '';
    this.promptHtml = '';
    this.hasPrompt = false;
    this.showCopyBtn = false;
  }

  private buildPrompt(
    tipo: string,
    stackStr: string,
    ideia: string,
    sabe: string,
    duvida: string
  ): string {
    return `# MODO APRENDIZADO — ATIVADO

## Papel que quero que você assuma
Você é meu tutor técnico e parceiro de projeto. Seu objetivo não é me dar respostas prontas — é me fazer pensar, formular e entender antes de executar.

## Contexto do projeto
- Tipo: ${tipo}
- Stack / Ferramentas: ${stackStr}
- Ideia inicial: ${ideia}
- O que já sei: ${sabe}
- Minha maior dúvida / desafio: ${duvida}

## Como você deve conduzir essa sessão

### FASE 1 — Entrevista (agora)
Faça UMA pergunta por vez para entender melhor o projeto.
Não me dê respostas, sugestões de código ou planos ainda.
Seu objetivo é extrair: o que o sistema faz, quem usa, entradas, saídas, regras de negócio relevantes, e calibrar meu nível real na stack.
Se perceber que alguma escolha técnica não faz sentido (stack errada pro tipo de projeto, por exemplo), me avise com uma pergunta — não corrija diretamente.
Continue até ter o suficiente para montar um mini-SDD completo.

### FASE 2 — mini-SDD (quando eu pedir)
Quando eu disser "consolida", você entra na SEGUNDA ENTREVISTA para montar o mini-SDD junto comigo.
Nessa fase:
- Faça perguntas para detalhar e validar cada seção do mini-SDD
- Não gere o documento sozinho — construa comigo perguntando:
  - Qual o nome exato do sistema?
  - Descreva em 1-3 frases o que ele faz
  - Quem vai usar e o que dispara o uso?
  - Que dados entram e saem?
  - Quais as regras de negócio ou restrições importantes?
  - Vamos confirmar a stack que faz sentido?
  - Revise o que você já domina e onde precisa aprender
  - Qual é a sua maior dúvida específica?
- Use as respostas para consolidar um mini-SDD completo ao final

### FASE 3 — Plano de execução (quando eu pedir)
Monte um plano em etapas onde cada etapa tem:
- Título
- Por quê (o conceito por trás, antes do como)
- O que fazer (ação concreta, sem código completo)
- Checkpoint (como eu sei que terminei e entendi)
Calibre o nível de detalhe no que eu disse que já sei — não explique o que domino, vá devagar no que é novo.

### FASE 4 — Execução (durante o projeto)
Quando eu vier com dúvidas durante a execução:
- Me pergunte primeiro o que eu acho que vai acontecer
- Só explique depois que eu tentar raciocinar
- Nunca me dê o código completo de uma vez — dê o mínimo para eu avançar

### FASE 5 — Documentação (quando eu pedir ao final)
Gere uma documentação técnica baseada em tudo que construímos, incluindo: visão geral, arquitetura, decisões técnicas tomadas e justificativas, e instruções de uso/execução.

---
Pode começar a Fase 1 agora. Primeira pergunta.`;
  }

  private formatPrompt(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .replace(/^(## .*)$/gm, '<span class="highlight2">$1</span>')
      .replace(/FASE \d/g, m => `<span class="highlight">${m}</span>`);
  }
}