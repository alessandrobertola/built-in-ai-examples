import { marked } from 'marked';
import { populateLanguageSelect } from '../utils/languages';

// API Summarizer
const input = document.querySelector<HTMLTextAreaElement>('#input');
const output = document.querySelector<HTMLDivElement>('#output');
const btn = document.querySelector<HTMLButtonElement>('#btn');
const destroyBtn = document.querySelector<HTMLButtonElement>('#destroy-btn');
const info = document.querySelector<HTMLParagraphElement>('#info');
const summaryTypeSelect = document.querySelector<HTMLSelectElement>('#summary-type');
const lengthSelect = document.querySelector<HTMLSelectElement>('#length');
const formatSelect = document.querySelector<HTMLSelectElement>('#format');
const outputLanguageSelect = document.querySelector<HTMLSelectElement>('#output-language');

if (outputLanguageSelect) {
  populateLanguageSelect(outputLanguageSelect, false, 'en');
}

let summarizer: Summarizer | null = null;

const initSummarizer = async (): Promise<Summarizer | null> => {
  if (!('Summarizer' in self)) {
    logSummarizer('non disponibile nel browser');
    return null;
  }

  const availability = await Summarizer.availability({
    outputLanguage: outputLanguageSelect?.value ?? 'en',
    type: summaryTypeSelect?.value as SummarizerType,
    format: formatSelect?.value as SummarizerFormat,
    length: lengthSelect?.value as SummarizerLength,
  });

  logSummarizer(`stato: ${availability}`);
  if (availability === 'unavailable') {
    logSummarizer('non disponibile');
    return null;
  }

  // Disabilita le select dopo la creazione
  setSelectsEnabled(false);

  logSummarizer(`Creazione summarizer con parametri: type=${summaryTypeSelect?.value}, length=${lengthSelect?.value}, format=${formatSelect?.value}, outputLanguage=${outputLanguageSelect?.value}`);

  return await Summarizer.create(
    {
      outputLanguage: outputLanguageSelect?.value ?? 'en',
      //sharedContext: 'context',
      //expectedInputLanguages: ['en'],
      type: summaryTypeSelect?.value as SummarizerType,
      format: formatSelect?.value as SummarizerFormat,
      length: lengthSelect?.value as SummarizerLength,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const p = ((e.loaded / e.total) * 100).toFixed(0);
          logSummarizer(`stato: ${availability} - caricamento: ${p}%`);
        });
      },
    }
  );
};


if (btn && input && output) {
  btn.addEventListener('click', async () => {
    if (!summarizer) {
      summarizer = await initSummarizer();
      if (!summarizer) return;
    }

    logSummarizer('Avvio summarizzazione...');
    const stream = summarizer.summarizeStreaming(input.value);
    output.innerHTML = '';

    for await (const chunk of stream) {
      output.innerHTML += chunk;
    }

    // facoltativo, se non lo facciamo il markdown non viene renderizzato correttamente
    output!.innerHTML = await marked.parse(output.innerHTML);

    logSummarizer('Summarizzazione completata');
  });
}


if (destroyBtn) {
  destroyBtn.addEventListener('click', () => {
    if (summarizer) {
      summarizer.destroy();
      summarizer = null;
      // Riabilita le select dopo la distruzione
      setSelectsEnabled(true);
      logSummarizer('Sessione cancellata');
    } else {
      logSummarizer('Sessione non disponibile');
    }
  });
}


const logSummarizer = (text: string) => {
  console.log(`[API Summarizer] - ${text}`);
  if (info) info.textContent = `[API Summarizer] - ${text}`;
};

const setSelectsEnabled = (enabled: boolean): void => {
  if (summaryTypeSelect) summaryTypeSelect.disabled = !enabled;
  if (lengthSelect) lengthSelect.disabled = !enabled;
  if (formatSelect) formatSelect.disabled = !enabled;
  if (outputLanguageSelect) outputLanguageSelect.disabled = !enabled;
};