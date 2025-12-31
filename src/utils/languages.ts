import languagesData from './languages.json';

export interface Language {
  code: string;
  name: string;
}

export const LANGUAGES: Language[] = languagesData as Language[];

export function populateLanguageSelect(
  selectElement: HTMLSelectElement,
  includeAuto: boolean = false,
  selectedCode: string = 'en'
): void {
  let options = '';

  if (includeAuto) {
    options += `<option value="auto" ${selectedCode === 'auto' ? 'selected' : ''}>Rileva lingua da solo</option>`;
  }

  for (const lang of LANGUAGES) {
    const selected = lang.code === selectedCode ? 'selected' : '';
    options += `<option value="${lang.code}" ${selected}>${lang.name} (${lang.code})</option>`;
  }

  selectElement.innerHTML = options;
}
