const info = document.querySelector<HTMLParagraphElement>('#info')!;

const log = (context: string, text: string) => {
  if (info) info.textContent = `[${context}] - ${text}`;
};

export default log;
