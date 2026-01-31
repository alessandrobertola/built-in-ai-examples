import { marked } from 'marked';
import { populateLanguageSelect } from '../utils/languages';
import { renderApiInfoHeader } from '../utils/api-info';

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

// Render API info header
renderApiInfoHeader('summarizer');

let summarizer: Summarizer | null = null;

const initSummarizer = async (): Promise<Summarizer | null> => {
  if (!('Summarizer' in self)) {
    logSummarizer('not available in browser');
    return null;
  }

  const availability = await Summarizer.availability({
    outputLanguage: outputLanguageSelect?.value ?? 'en',
    type: summaryTypeSelect?.value as SummarizerType,
    format: formatSelect?.value as SummarizerFormat,
    length: lengthSelect?.value as SummarizerLength,
  });

  logSummarizer(`status: ${availability}`);
  if (availability === 'unavailable') {
    logSummarizer('not available');
    return null;
  }

  // Disable selects after creation
  setSelectsEnabled(false);

  logSummarizer(`Creating summarizer with parameters: type=${summaryTypeSelect?.value}, length=${lengthSelect?.value}, format=${formatSelect?.value}, outputLanguage=${outputLanguageSelect?.value}`);

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
          logSummarizer(`status: ${availability} - loading: ${p}%`);
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

    logSummarizer('Starting summarization...');
    const stream = summarizer.summarizeStreaming(input.value);
    output.innerHTML = '';

    for await (const chunk of stream) {
      output.innerHTML += chunk;
    }

    // optional, if we don't do this the markdown won't be rendered correctly
    output!.innerHTML = await marked.parse(output.innerHTML);

    logSummarizer('Summarization completed');
  });
}


if (destroyBtn) {
  destroyBtn.addEventListener('click', () => {
    if (summarizer) {
      summarizer.destroy();
      summarizer = null;
      // Re-enable selects after destruction
      setSelectsEnabled(true);
      logSummarizer('Session cleared');
    } else {
      logSummarizer('Session not available');
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