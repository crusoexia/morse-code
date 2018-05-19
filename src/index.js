const { compose, first } = require('lodash/fp');
const { Observable, fromEvent, timer } = require('rxjs');
const { filter, buffer, map, debounce, first: firstRx, concat } = require('rxjs/operators');
const { renderCode, renderChar, renderParsedChar } = require('./render');
const morse = require('./morse');

const DASH_DETEMINE_HOLD_MS_THRESHOLD = 200;
const CHAR_DETEMINE_HALT_MS_THRESHOLD = 1000;

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

window.addEventListener('load', () => {
  const renderParsedCharToParsed = renderParsedChar(document.getElementById('parsed'));
  // Transfer DOM events to observable by self.
  const enterKeyDownStream = streamFromEvent('keydown').pipe(filter(isEnterKey));
  // Or use the build-in handy methods.
  const enterKeyUpStream = fromEvent(document, 'keyup').pipe(filter(isEnterKey));
  const codeStream = enterKeyDownStream.pipe(
    map(() => Date.now()),
    buffer(enterKeyUpStream), 
    map(first),
    map(firstDownTime => Date.now() - firstDownTime > DASH_DETEMINE_HOLD_MS_THRESHOLD ? morse.DASH : morse.DOT)
  );
  const charStream = codeStream.pipe(
    buffer(codeStream.pipe(debounce(() => timer(CHAR_DETEMINE_HALT_MS_THRESHOLD)))),
  );

  // Log codes.
  codeStream
    .pipe(
      firstRx(),
      concat(charStream)
    )
    .subscribe(() => renderChar(document.getElementById('code_logs')));
  codeStream.subscribe(code => renderCode(document.getElementById('code_logs').lastElementChild, code));

  // Log parsed chars.
  charStream
    .pipe(map(codes => morse.parse(codes)))
    .subscribe(renderParsedCharToParsed);
});
