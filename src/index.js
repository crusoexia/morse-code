const { compose, first } = require('lodash/fp');
const { Observable, fromEvent, timer } = require('rxjs');
const { filter, buffer, map, debounce, first: firstRx, concat, tap } = require('rxjs/operators');
const { renderCode, renderMorseChar, renderParsedChar } = require('./render');
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

function clearLogs() {
  document.getElementById('parsed').textContent = '';
  document.getElementById('code_logs').innerHTML = '';
  document.getElementById('clear_btn').blur();
}

function main() {
  const renderParsedCharToParsed = renderParsedChar(document.getElementById('parsed'));
  const renderMorseCharToCharLogs = renderMorseChar(document.getElementById('code_logs'));

  // Transfer DOM events to stream by self, the basic way to create observable.
  const enterKeyDownStream = streamFromEvent('keydown').pipe(filter(isEnterKey));
  // Or use the build-in handy methods.
  const enterKeyUpStream = fromEvent(document, 'keyup').pipe(filter(isEnterKey));
  const codeStream = enterKeyDownStream.pipe(
    map(() => Date.now()),
    buffer(enterKeyUpStream), 
    map(first),
    map(enterKeyDownTime => Date.now() - enterKeyDownTime > DASH_DETEMINE_HOLD_MS_THRESHOLD ? morse.DASH : morse.DOT)
  );
  const charStream = codeStream.pipe(
    buffer(codeStream.pipe(debounce(() => timer(CHAR_DETEMINE_HALT_MS_THRESHOLD)))),
  );
  const clearStream = fromEvent(document.getElementById('clear_btn'), 'click');

  // Log morse codes.
  codeStream
    .pipe(
      firstRx(),
      concat(charStream)
    )
    .subscribe(renderMorseCharToCharLogs);
  codeStream.subscribe(code => renderCode(document.getElementById('code_logs').lastElementChild, code));

  // Log parsed chars.
  charStream
    .pipe(map(codes => morse.parse(codes)))
    .subscribe(renderParsedCharToParsed);

  // Clear logged messages
  clearStream
    .pipe(tap(clearLogs))
    .subscribe(renderMorseCharToCharLogs);
}

window.addEventListener('load', main);
