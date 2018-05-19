const { curry } = require('lodash/fp');

const renderCode = curry(function (container, code) {
  const el = document.createElement('div');
  el.className = `code ${code.toLowerCase()}`;
  container.appendChild(el);
});

function renderChar(container) {
  const el = document.createElement('div');
  el.className = 'char';
  container.appendChild(el);
}

module.exports = {
  renderCode,
  renderChar
};
