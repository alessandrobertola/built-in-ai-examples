import { marked } from "marked";
import { renderApiInfoHeader } from '../utils/api-info';

// API Prompt
const input = document.querySelector<HTMLTextAreaElement>('#input');
const output = document.querySelector<HTMLDivElement>('#output');
const btn = document.querySelector<HTMLButtonElement>('#btn');
const destroyBtn = document.querySelector<HTMLButtonElement>('#destroy-btn');
const info = document.querySelector<HTMLParagraphElement>('#info');


let languageModel: LanguageModel | null = null;

// Render API info header
renderApiInfoHeader('prompt');

const initPrompt = async (): Promise<LanguageModel | null> => {
  if (!('LanguageModel' in self)) {
    logPrompt('not available in browser');
    return null;
  }

  const availability = await LanguageModel.availability(
  );

  logPrompt(`status: ${availability}`);
  if (availability === 'unavailable') {
    logPrompt('not available');
    return null;
  }

  logPrompt('Creating prompt...');

  return await LanguageModel.create(
    {
      initialPrompts: [
        {
          role: 'user',
          content: 'You are an expert gardener. Give me advice for planting a garden.'
        }
      ],
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const p = ((e.loaded / e.total) * 100).toFixed(0);
          logPrompt(`status: ${availability} - loading: ${p}%`);
        });
      },
    }
  );
};

if (btn && input && output) {
  btn.addEventListener('click', async () => {
    if (!languageModel) {
      languageModel = await initPrompt();
      if (!languageModel) return;
    }

    logPrompt('Starting prompt...');
    const stream = languageModel.promptStreaming(input.value);
    output.innerHTML = '';

    for await (const chunk of stream) {
      output.innerHTML += chunk;
    }

    // optional, if we don't do this the markdown won't be rendered correctly
    output!.innerHTML = await marked.parse(output.innerHTML);

    logPrompt('Prompt completed');
  });
}

if (destroyBtn) {
  destroyBtn.addEventListener('click', () => {
    if (languageModel) {
      languageModel.destroy();
      languageModel = null;
      logPrompt('Session cleared');
    } else {
      logPrompt('Session not available');
    }
  });
}

const logPrompt = (text: string) => {
  console.log(`[API Prompt] - ${text}`);
  if (info) info.textContent = `[API Prompt] - ${text}`;
};

