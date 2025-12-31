// API Translator
import { populateLanguageSelect } from '../utils/languages';

const input = document.querySelector<HTMLTextAreaElement>('#input')!;
const output = document.querySelector<HTMLDivElement>('#output')!;
const btn = document.querySelector<HTMLButtonElement>('#btn')!;
const info = document.querySelector<HTMLParagraphElement>('#info')!;
const info_second = document.querySelector<HTMLParagraphElement>('#info-2')!;
const destroyBtn = document.querySelector<HTMLButtonElement>('#destroy-btn')!;
const inputLang = document.querySelector<HTMLSelectElement>('#input-lang')!;
const outputLang = document.querySelector<HTMLSelectElement>('#output-lang')!;

// Exportable translateText function
export async function translateText(
  text: string,
  sourceLanguage: string = 'auto',
  targetLanguage: string = 'en'
): Promise<string> {
  // Auto-detect language if needed
  let detectedSourceLanguage = sourceLanguage;
  if (sourceLanguage === 'auto') {
    if (!('LanguageDetector' in self)) {
      throw new Error('LanguageDetector not available in browser');
    }
    
    const availability = await LanguageDetector.availability();
    if (availability === 'unavailable') {
      throw new Error('LanguageDetector unavailable');
    }
    
    const languageDetector = await LanguageDetector.create();
    const detection = await languageDetector.detect(text);
    detectedSourceLanguage = detection[0].detectedLanguage ?? 'en';
    languageDetector.destroy();
  }

  // Check if Translator is available
  if (!('Translator' in self)) {
    throw new Error('Translator not available in browser');
  }

  const availability = await Translator.availability({
    sourceLanguage: detectedSourceLanguage,
    targetLanguage: targetLanguage,
  });

  if (availability === 'unavailable') {
    throw new Error(`Translation unavailable for ${detectedSourceLanguage} -> ${targetLanguage}`);
  }

  // Create translator instance
  const translator = await Translator.create({
    sourceLanguage: detectedSourceLanguage,
    targetLanguage: targetLanguage,
  });

  try {
    // Translate using streaming API
    const stream = translator.translateStreaming(text);
    let result = '';
    for await (const chunk of stream) {
      result += chunk;
    }
    return result;
  } finally {
    // Clean up
    translator.destroy();
  }
}

// Popola i select con le lingue disponibili
populateLanguageSelect(inputLang, true, 'auto');
populateLanguageSelect(outputLang, false, 'en');


let translator: Translator | null = null;
let languageDetector: LanguageDetector | null = null;

const logTranslator = (text: string) => {
  console.log(`[API Translator] - ${text}`);
  if (info) info.textContent = `[API Translator] - ${text}`;
};

const logDetector = (text: string) => {
  console.log(`[API Language Detector] - ${text}`);
  if (info_second) info_second.textContent = `[API Language Detector] - ${text}`;
};

const initLanguageDetector = async (): Promise<LanguageDetector | null> => {
  if (!('LanguageDetector' in self)) {
    logDetector('non disponibile nel browser');
    return null;
  }

  const availability = await LanguageDetector.availability();
  if (availability === 'unavailable') {
    logDetector('non disponibile');
    return null;
  }

  logDetector(`stato: ${availability}`);

  return await LanguageDetector.create(
    {
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const p = ((e.loaded / e.total) * 100).toFixed(0);
          logDetector(`stato: ${availability} - caricamento: ${p}%`);
        });
      },
    }
  );
};

const initTranslator = async (languageInput: string, languageOutput: string): Promise<Translator | null> => {
  
  if (!('Translator' in self)) {
    logTranslator('non disponibile');
    return null;
  }

  const availability = await Translator.availability({
    sourceLanguage: languageInput,
    targetLanguage: languageOutput,
  });

  logTranslator(`stato: ${availability}`);
  if (availability === 'unavailable') return null;

  inputLang.disabled = true;
  outputLang.disabled = true;

  return await Translator.create({
    sourceLanguage: languageInput,
    targetLanguage: languageOutput,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        const p = ((e.loaded / e.total) * 100).toFixed(0);
        logTranslator(`stato: ${availability} - caricamento: ${p}%`);
      });
    },
  });
};

btn.addEventListener('click', async () => {
  if (inputLang.value === 'auto') {
    if (!languageDetector) {
      languageDetector = await initLanguageDetector();
      if (!languageDetector) return;
    }
    const language = await languageDetector.detect(input.value);
    inputLang.value = language[0].detectedLanguage ?? 'en';
    logDetector(`lingua rilevata: ${inputLang.value}`);
  }

  if (!translator) {
    // Inizializza il translator se non è già stato creato
    translator = await initTranslator(inputLang.value, outputLang.value);
    if (!translator) return;
  }

  const stream = translator.translateStreaming(input.value);
  output.innerHTML = '';
  for await (const chunk of stream) {
    output.innerHTML += chunk;
  }
});

destroyBtn.addEventListener('click', () => {
  if (translator) {
    translator.destroy();
    translator = null;
    inputLang.disabled = false;
    outputLang.disabled = false;
    logTranslator('Sessione cancellata');
    logDetector('Sessione cancellata');
  } else {
    logTranslator('Sessione non disponibile');
  }

  if (languageDetector) {
    languageDetector.destroy();
    languageDetector = null;
    logDetector('Sessione cancellata');
  } else {
    logDetector('Sessione non disponibile');
  }
});

