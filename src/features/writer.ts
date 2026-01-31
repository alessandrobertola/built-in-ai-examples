import { marked } from 'marked';
import { populateLanguageSelect } from '../utils/languages';
import { renderApiInfoHeader } from '../utils/api-info';

const input = document.querySelector<HTMLTextAreaElement>('#input');
const contextInput = document.querySelector<HTMLTextAreaElement>('#context');
const output = document.querySelector<HTMLDivElement>('#output');
const btn = document.querySelector<HTMLButtonElement>('#btn');
const destroyBtn = document.querySelector<HTMLButtonElement>('#destroy-btn');
const info = document.querySelector<HTMLParagraphElement>('#info');
const toneSelect = document.querySelector<HTMLSelectElement>('#tone');
const formatSelect = document.querySelector<HTMLSelectElement>('#format');
const lengthSelect = document.querySelector<HTMLSelectElement>('#length');
const outputLanguageSelect = document.querySelector<HTMLSelectElement>('#output-language');

if (outputLanguageSelect) {
  populateLanguageSelect(outputLanguageSelect, false, 'en');
}

renderApiInfoHeader('writer');

let writer: Writer | null = null;

const initWriter = async (): Promise<Writer | null> => {
  if (!('Writer' in self)) {
    logWriter('not available in browser');
    return null;
  }

  const availability = await Writer.availability({
    outputLanguage: outputLanguageSelect?.value ?? 'en',
    tone: toneSelect?.value as WriterTone,
    format: formatSelect?.value as WriterFormat,
    length: lengthSelect?.value as WriterLength,
  });

  logWriter(`status: ${availability}`);
  if (availability === 'unavailable') {
    logWriter('not available');
    return null;
  }

  setSelectsEnabled(false);

  logWriter(`Creating writer with parameters: tone=${toneSelect?.value}, length=${lengthSelect?.value}, format=${formatSelect?.value}, outputLanguage=${outputLanguageSelect?.value}`);

  const options: WriterCreateCoreOptions = {
    outputLanguage: outputLanguageSelect?.value ?? 'en',
    tone: toneSelect?.value as WriterTone ?? 'neutral',
    format: formatSelect?.value as WriterFormat ?? 'markdown',
    length: lengthSelect?.value as WriterLength ?? 'short',
    ...(contextInput?.value.trim() && { sharedContext: contextInput.value.trim() }),
  };

  return await Writer.create({
    ...options,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        const p = ((e.loaded / e.total) * 100).toFixed(0);
        logWriter(`status: ${availability} - loading: ${p}%`);
      });
    },
  });
};

if (btn && input && output) {
  btn.addEventListener('click', async () => {
    if (!writer) {
      writer = await initWriter();
      if (!writer) return;
    }

    if (!input.value.trim()) {
      logWriter('Enter a prompt');
      return;
    }

    logWriter('Starting writing...');
    const stream = writer.writeStreaming(input.value.trim(), {
      context: contextInput?.value.trim() || undefined,
    });
    output.innerHTML = '';

    for await (const chunk of stream) {
      output.innerHTML += chunk;
    }

    output!.innerHTML = await marked.parse(output.innerHTML);

    logWriter('Writing completed');
  });
}

if (destroyBtn) {
  destroyBtn.addEventListener('click', () => {
    if (writer) {
      writer.destroy();
      writer = null;
      setSelectsEnabled(true);
      logWriter('Session cleared');
    } else {
      logWriter('Session not available');
    }
  });
}

const logWriter = (text: string) => {
  console.log(`[API Writer] - ${text}`);
  if (info) info.textContent = `[API Writer] - ${text}`;
};

const setSelectsEnabled = (enabled: boolean): void => {
  if (toneSelect) toneSelect.disabled = !enabled;
  if (lengthSelect) lengthSelect.disabled = !enabled;
  if (formatSelect) formatSelect.disabled = !enabled;
  if (outputLanguageSelect) outputLanguageSelect.disabled = !enabled;
};

