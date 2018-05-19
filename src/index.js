const { compose, first } = require('lodash/fp');
const { of, Observable, fromEvent, merge } = require('rxjs');
const { filter, mapTo, buffer, map } = require('rxjs/operators');

const DASH_DETEMINE_HOLD_MS_THRESHOLD = 200;

function streamFromEvent(eventName) {
  return Observable.create(observer => {
    document.addEventListener(eventName, e => {
      observer.next(e);
    });
  })
}

function isEnterKey(keyCode) {
  return keyCode === 13;
}

function render() {
  const h1 = document.createElement('h1');
  h1.appendChild(document.createTextNode('Hello world'));
  document.getElementById('root').appendChild(h1);
}

render();

window.addEventListener('load', () => {
  const enterKeyDownStream = streamFromEvent(document, 'keydown').pipe(filter(isEnterKey));
  const enterKeyUpStream = fromEvent('keyup').pipe(filter(isEnterKey));

  enterKeyDownStream
    .pipe(
      map(() => Date.now()),
      buffer(enterKeyUpStream), 
      map(first),
      map(firstDownTime => Date.now() - firstDownTime > DASH_DETEMINE_HOLD_MS_THRESHOLD ? 'DASH' : 'DOT')
    )
    .subscribe(console.log)
})
