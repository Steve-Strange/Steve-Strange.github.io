document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      status.textContent = '已复制';
    } catch {
      status.textContent = '请选中下方 BibTeX 复制，或下载文件。';
    }
  });
});
