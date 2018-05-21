const { compose, first } = require('lodash/fp');
const { Observable, fromEvent, timer, merge } = require('rxjs');
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

  // Transform DOM events to stream, the basic way to create observable.
  // Marble:
  // enter key down -> ed
  // other key down -> od
  //
  // --ed----od-od-ed---ed-->
  // filter((e) => e.keyCode === 13)
  // --ed----------ed---ed-->
  const enterKeyDownStream = streamFromEvent('keydown').pipe(filter(isEnterKey));

  // Or use the build-in handy methods.
  // Marble: 
  // enter key up -> eu
  //
  // similar with key down
  const enterKeyUpStream = fromEvent(document, 'keyup').pipe(filter(isEnterKey));

  // Merge two stream to create a new interaction stream
  // in this stream we care about each user inputs no mater it's keydown or keyup
  // will be used later
  // 
  // Marble:
  //
  // --ed-ed-ed-ed---------ed-----ed-ed-ed--->
  // --------------eu----------eu----------eu--->
  // merge(keydown, keyup)
  // --ed-ed-ed-ed-eu------ed--eu-ed-ed-ed-eu--->
  const interactionStream = merge(enterKeyDownStream, enterKeyUpStream);

  const codeStream = enterKeyDownStream.pipe(
    // --ed----ed-ed-ed----ed-->
    map(() => Date.now()),
    // --t----t-t-t----t-->
    // -----eu----------eu----eu-->
    buffer(enterKeyUpStream), 
    // -----[t]----------[t, t, t]----[t]-->
    map(first),
    // -----t----------t-------t-->
    map(enterKeyDownTime => Date.now() - enterKeyDownTime > DASH_DETEMINE_HOLD_MS_THRESHOLD ? morse.DASH : morse.DOT)
    // -----DOT----------DASH-------DASH-->
  );

  const charStream = codeStream.pipe(
    // Each time user stop interact for 1s, we create a new char
    //
    // ---DOT--DASH--DOT----DOT-DOT--DASH----->
    // --------------------eu--------------eu----> This stream is created by the inner brackets
    buffer(
      // --ed-ed-ed-ed-eu------ed--eu-ed-ed-ed-eu--->
      interactionStream.pipe(debounce(() => timer(CHAR_DETEMINE_HALT_MS_THRESHOLD)))
      // --------------------eu--------------------eu->
    ),
    // --------------------[DOT, DASH, DOT]--------------[DOT, DOT, DASH]---->
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
