document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      status.textContent = document.documentElement.lang === 'en' ? 'Copied' : '已复制';
    } catch {
      status.textContent = document.documentElement.lang === 'en' ? 'Select and copy the BibTeX below, or download the file.' : '请选中下方 BibTeX 复制，或下载文件。';
    }
  });
});
