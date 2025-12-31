import { marked } from "marked";

// API Prompt
const input = document.querySelector<HTMLTextAreaElement>('#input');
const output = document.querySelector<HTMLDivElement>('#output');
const btn = document.querySelector<HTMLButtonElement>('#btn');
const destroyBtn = document.querySelector<HTMLButtonElement>('#destroy-btn');
const info = document.querySelector<HTMLParagraphElement>('#info');


let languageModel: LanguageModel | null = null;

const initPrompt = async (): Promise<LanguageModel | null> => {
  if (!('LanguageModel' in self)) {
    logPrompt('non disponibile nel browser');
    return null;
  }

  const availability = await LanguageModel.availability(
  );

  logPrompt(`stato: ${availability}`);
  if (availability === 'unavailable') {
    logPrompt('non disponibile');
    return null;
  }

  logPrompt('Creazione prompt...');

  return await LanguageModel.create(
    {
      initialPrompts: [
        {
          role: 'user',
          content: 'Sei un giardiniere esperto. Dammi consigli per la piantagione di un giardino.'
        }
      ],
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const p = ((e.loaded / e.total) * 100).toFixed(0);
          logPrompt(`stato: ${availability} - caricamento: ${p}%`);
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

    logPrompt('Avvio prompt...');
    const stream = languageModel.promptStreaming(input.value);
    output.innerHTML = '';

    for await (const chunk of stream) {
      output.innerHTML += chunk;
    }

    // facoltativo, se non lo facciamo il markdown non viene renderizzato correttamente
    output!.innerHTML = await marked.parse(output.innerHTML);

    logPrompt('Prompt completato');
  });
}

if (destroyBtn) {
  destroyBtn.addEventListener('click', () => {
    if (languageModel) {
      languageModel.destroy();
      languageModel = null;
      logPrompt('Sessione cancellata');
    } else {
      logPrompt('Sessione non disponibile');
    }
  });
}

const logPrompt = (text: string) => {
  console.log(`[API Prompt] - ${text}`);
  if (info) info.textContent = `[API Prompt] - ${text}`;
};

