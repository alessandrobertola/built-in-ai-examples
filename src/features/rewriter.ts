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

renderApiInfoHeader('rewriter');

let rewriter: Rewriter | null = null;

const initRewriter = async (): Promise<Rewriter | null> => {
  if (!('Rewriter' in self)) {
    logRewriter('not available in browser');
    return null;
  }

  const availability = await Rewriter.availability({
    outputLanguage: outputLanguageSelect?.value ?? 'en',
    tone: toneSelect?.value as RewriterTone,
    format: formatSelect?.value as RewriterFormat,
    length: lengthSelect?.value as RewriterLength,
  });

  logRewriter(`status: ${availability}`);
  if (availability === 'unavailable') {
    logRewriter('not available');
    return null;
  }

  setSelectsEnabled(false);

  logRewriter(`Creating rewriter with parameters: tone=${toneSelect?.value}, length=${lengthSelect?.value}, format=${formatSelect?.value}, outputLanguage=${outputLanguageSelect?.value}`);

  const options: RewriterCreateCoreOptions = {
    outputLanguage: outputLanguageSelect?.value ?? 'en',
    tone: toneSelect?.value as RewriterTone ?? 'neutral',
    format: formatSelect?.value as RewriterFormat ?? 'markdown',
    length: lengthSelect?.value as RewriterLength ?? 'short',
    ...(contextInput?.value.trim() && { sharedContext: contextInput.value.trim() }),
  };

  return await Rewriter.create({
    ...options,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        const p = ((e.loaded / e.total) * 100).toFixed(0);
        logRewriter(`status: ${availability} - loading: ${p}%`);
      });
    },
  });
};

if (btn && input && output) {
  btn.addEventListener('click', async () => {
    if (!rewriter) {
      rewriter = await initRewriter();
      if (!rewriter) return;
    }

    if (!input.value.trim()) {
      logRewriter('Enter text to rewrite');
      return;
    }

    logRewriter('Starting rewrite...');
    const stream = rewriter.rewriteStreaming(input.value.trim(), {
      context: contextInput?.value.trim() || undefined,
    });
    output.innerHTML = '';

    for await (const chunk of stream) {
      output.innerHTML += chunk;
    }

    output!.innerHTML = await marked.parse(output.innerHTML);

    logRewriter('Rewrite completed');
  });
}

if (destroyBtn) {
  destroyBtn.addEventListener('click', () => {
    if (rewriter) {
      rewriter.destroy();
      rewriter = null;
      setSelectsEnabled(true);
      logRewriter('Session cleared');
    } else {
      logRewriter('Session not available');
    }
  });
}

const logRewriter = (text: string) => {
  console.log(`[API Rewriter] - ${text}`);
  if (info) info.textContent = `[API Rewriter] - ${text}`;
};

const setSelectsEnabled = (enabled: boolean): void => {
  if (toneSelect) toneSelect.disabled = !enabled;
  if (lengthSelect) lengthSelect.disabled = !enabled;
  if (formatSelect) formatSelect.disabled = !enabled;
  if (outputLanguageSelect) outputLanguageSelect.disabled = !enabled;
};
