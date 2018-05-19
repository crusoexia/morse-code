const { compose, first } = require('lodash/fp');
const { of, Observable, fromEvent, merge, timer } = require('rxjs');
const { filter, mapTo, buffer, map, debounce, startWith, first: firstRx, concat } = require('rxjs/operators');
const { renderCode, renderChar } = require('./render');

const DASH_DETEMINE_HOLD_MS_THRESHOLD = 200;
const WORD_DETEMINE_HALT_MS_THRESHOLD = 1000;

function streamFromEvent(eventName) {
  return Observable.create(observer => {
    document.addEventListener(eventName, e => {
      observer.next(e);
    });
  })
}

function isEnterKey(e) {
  return e.keyCode === 13;
}

function render() {
  const h1 = document.createElement('h1');
  h1.appendChild(document.createTextNode('Hello world'));
  document.getElementById('root').appendChild(h1);
}

render();

window.addEventListener('load', () => {
  const enterKeyDownStream = streamFromEvent('keydown').pipe(filter(isEnterKey));
  const enterKeyUpStream = fromEvent(document, 'keyup').pipe(filter(isEnterKey));
  const codeStream = enterKeyDownStream.pipe(
    map(() => Date.now()),
    buffer(enterKeyUpStream), 
    map(first),
    map(firstDownTime => Date.now() - firstDownTime > DASH_DETEMINE_HOLD_MS_THRESHOLD ? 'DASH' : 'DOT')
  );
  const charStream = codeStream.pipe(
    buffer(codeStream.pipe(debounce(() => timer(WORD_DETEMINE_HALT_MS_THRESHOLD)))),
  );

  codeStream.pipe(
    firstRx(),
    concat(charStream)
  ).subscribe(() => renderChar(document.getElementById('code_logs')));
  codeStream.subscribe(code => renderCode(document.getElementById('code_logs').lastElementChild, code));
});
