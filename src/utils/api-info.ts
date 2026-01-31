import apiInfoData from '../assets/api-info.json';

export interface ApiInfo {
  documentation: string;
  status: 'open' | 'origin-trial';
  originTrial?: {
    localOnlyWarning: string;
    chromeFlags: string[];
    additionalInstructions: string[];
  };
}

export interface ApiInfoData {
  [key: string]: ApiInfo;
}

const apiInfo = apiInfoData as ApiInfoData;

export function getApiInfo(apiName: string): ApiInfo | null {
  return apiInfo[apiName] || null;
}

function createSVGIcon(paths: string[], width: number = 16, height: number = 16): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  paths.forEach(pathData => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
  });

  return svg;
}

function createDocsIcon(): SVGSVGElement {
  return createSVGIcon([
    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
    'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'
  ]);
}

function createTrialIcon(): SVGSVGElement {
  // Beaker/flask icon for experiment/trial
  return createSVGIcon([
    'M9.5 2A2.5 2.5 0 0 0 7 4.5v15a2.5 2.5 0 0 0 5 0v-15A2.5 2.5 0 0 0 9.5 2Z',
    'M19 8l-5-5',
    'M14 8l5-5',
    'M9.5 2h5',
    'M12 21v-4'
  ]);
}

function createWarningIcon(): SVGSVGElement {
  const svg = createSVGIcon([
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z',
    'M12 9v4',
    'M12 17h.01'
  ]);
  return svg;
}

function createExternalLinkIcon(): SVGSVGElement {
  const svg = createSVGIcon([
    'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
    'M15 3h6v6',
    'M10 14L21 3'
  ], 14, 14);
  return svg;
}

function createElement(tag: string, className?: string, textContent?: string): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

function createLink(href: string, text: string, className?: string, target: string = '_blank'): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.target = target;
  link.rel = 'noopener noreferrer';
  if (className) link.className = className;
  return link;
}

export function renderApiInfoHeader(apiName: string, containerId: string = 'api-info-header'): void {
  const info = getApiInfo(apiName);
  if (!info) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Create header container
  const header = createElement('div', 'api-info-header');

  // Documentation link
  const docItem = createElement('div', 'api-info-item');
  const docLink = createLink(info.documentation, 'Documentation', 'api-info-link');
  const docIcon = createElement('span', 'api-info-icon');
  docIcon.appendChild(createDocsIcon());
  const extIcon = createElement('span', 'external-link-icon');
  extIcon.appendChild(createExternalLinkIcon());
  docLink.insertBefore(docIcon, docLink.firstChild);
  docLink.appendChild(extIcon);
  docItem.appendChild(docLink);
  header.appendChild(docItem);

  // Status badge
  const statusItem = createElement('div', 'api-info-item');
  const statusBadge = createElement('span', `api-status-badge api-status-${info.status}`);
  if (info.status === 'origin-trial') {
    const statusIcon = createElement('span', 'api-info-icon api-status-icon');
    statusIcon.appendChild(createTrialIcon());
    statusBadge.appendChild(statusIcon);
  }
  statusBadge.appendChild(createElement('span', '', info.status === 'origin-trial' ? 'Origin Trial' : 'Open'));
  statusItem.appendChild(statusBadge);
  header.appendChild(statusItem);

  // Origin trial warning
  if (info.status === 'origin-trial' && info.originTrial) {
    const warningItem = createElement('div', 'api-info-item api-warning');
    const warningContent = createElement('div', 'api-warning-content');

    // Warning header
    const warningHeader = createElement('div', 'api-warning-header');
    const warningIcon = createElement('span', 'api-info-icon');
    warningIcon.appendChild(createWarningIcon());
    warningHeader.appendChild(warningIcon);
    warningHeader.appendChild(createElement('span', '', info.originTrial.localOnlyWarning));
    warningContent.appendChild(warningHeader);

    // Chrome flags
    const flagsContainer = createElement('div', 'api-flags-container');
    info.originTrial.chromeFlags.forEach(flag => {
      const flagLink = createLink(flag, flag, 'api-flag-link');
      flagsContainer.appendChild(flagLink);
    });
    warningContent.appendChild(flagsContainer);

    // Additional instructions
    if (info.originTrial.additionalInstructions.length > 0) {
      const instructionsList = createElement('ol', 'api-localhost-instructions');
      info.originTrial.additionalInstructions.forEach(instruction => {
        const li = createElement('li', '', instruction);
        instructionsList.appendChild(li);
      });
      warningContent.appendChild(instructionsList);
    }

    warningItem.appendChild(warningContent);
    header.appendChild(warningItem);
  }

  container.appendChild(header);
}
