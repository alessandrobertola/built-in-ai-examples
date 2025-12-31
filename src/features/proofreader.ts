// API Proofreader
const input = document.querySelector<HTMLTextAreaElement>('#input');
const output = document.querySelector<HTMLDivElement>('#output');
const btn = document.querySelector<HTMLButtonElement>('#btn');

if (btn && input && output) {
  btn.addEventListener('click', async () => {
    if ('Proofreader' in self) {
      const proofreader = await Proofreader.create();
      const result = await proofreader.proofread(input.value);
      output.textContent = JSON.stringify(result, null, 2);
    } else {
      output.textContent = 'API Proofreader not available';
    }
  });
}

