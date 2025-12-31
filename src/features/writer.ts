import { marked } from 'marked';
import { populateLanguageSelect } from '../utils/languages';

// API Writer
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

let writer: Writer | null = null;

const initWriter = async (): Promise<Writer | null> => {
  if (!('Writer' in self)) {
    logWriter('non disponibile nel browser');
    return null;
  }

  const availability = await Writer.availability({
    outputLanguage: outputLanguageSelect?.value ?? 'en',
    tone: toneSelect?.value as WriterTone,
    format: formatSelect?.value as WriterFormat,
    length: lengthSelect?.value as WriterLength,
  });

  logWriter(`stato: ${availability}`);
  if (availability === 'unavailable') {
    logWriter('non disponibile');
    return null;
  }

  // Disabilita le select dopo la creazione
  setSelectsEnabled(false);

  logWriter(`Creazione writer con parametri: tone=${toneSelect?.value}, length=${lengthSelect?.value}, format=${formatSelect?.value}, outputLanguage=${outputLanguageSelect?.value}`);

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
        logWriter(`stato: ${availability} - caricamento: ${p}%`);
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
      logWriter('Inserisci un prompt');
      return;
    }

    logWriter('Avvio scrittura...');
    const stream = writer.writeStreaming(input.value.trim(), {
      context: contextInput?.value.trim() || undefined,
    });
    output.innerHTML = '';

    for await (const chunk of stream) {
      output.innerHTML += chunk;
    }

    // facoltativo, se non lo facciamo il markdown non viene renderizzato correttamente
    output!.innerHTML = await marked.parse(output.innerHTML);

    logWriter('Scrittura completata');
  });
}

if (destroyBtn) {
  destroyBtn.addEventListener('click', () => {
    if (writer) {
      writer.destroy();
      writer = null;
      // Riabilita le select dopo la distruzione
      setSelectsEnabled(true);
      logWriter('Sessione cancellata');
    } else {
      logWriter('Sessione non disponibile');
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

