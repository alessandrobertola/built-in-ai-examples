import log from "../utils/logger";

// API Language Detector
const input = document.querySelector<HTMLTextAreaElement>('#input')!;
const output = document.querySelector<HTMLDivElement>('#output')!;
const btn = document.querySelector<HTMLButtonElement>('#btn')!;
const destroyBtn = document.querySelector<HTMLButtonElement>('#destroy-btn')!;
const context = 'Language Detector';

let languageDetector: LanguageDetector | null = null;


const initLanguageDetector = async (): Promise<LanguageDetector | null> => {
  if (!('LanguageDetector' in self)) {
    log(context, 'not available in browser');
    return null;
  }

  const availability = await LanguageDetector.availability();

  if (availability === 'unavailable') {
    log(context, 'not available');
    return null;
  }

  log(context, `status: ${availability}`);
  return await LanguageDetector.create();
};


btn.addEventListener('click', async () => {
  if (!('LanguageDetector' in self)) {
    log(context, 'not available in browser');
    return null;
  }

  if (!languageDetector) {
    languageDetector = await initLanguageDetector();
    if (!languageDetector) return;
  }

  const results = await languageDetector.detect(input.value);
  output.textContent = `Detected language: ${results[0].detectedLanguage || 'Unknown'}\nConfidence: ${results[0].confidence || 0}`;
});


destroyBtn.addEventListener('click', () => {
  if (languageDetector) {
    languageDetector.destroy();
    languageDetector = null;
    log(context, 'Session cleared');
  }
});
