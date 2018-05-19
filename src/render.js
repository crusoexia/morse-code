function renderKeyStroke(container, code) {
  const el = document.createElement('div');
  el.className = `code ${code.toLowerCase()}`;
  container.appendChild(el);
}

module.exports = {
  renderKeyStroke
};
