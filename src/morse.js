const _ = require('lodash');

const DOT = 'DOT';
const DASH = 'DASH';
const morseCodeTable = [
  ['A', [ DOT, DASH ]],
  ['B', [ DASH, DOT, DOT, DOT ]],
  ['C', [ DASH, DOT, DASH, DOT ]],
  ['D', [ DASH, DOT, DOT ]],
  ['E', [ DOT ]],
  ['F', [ DOT, DOT, DASH, DOT ]],
  ['G', [ DASH, DASH, DOT ]],
  ['H', [ DOT, DOT, DOT, DOT ]],
  ['I', [ DOT, DOT ]],
  ['J', [ DOT, DASH, DASH, DASH ]],
  ['K', [ DASH, DOT, DASH ]],
  ['L', [ DOT, DASH, DOT, DOT ]],
  ['M', [ DASH, DASH ]],
  ['N', [ DASH, DOT ]],
  ['O', [ DASH, DASH, DASH ]],
  ['P', [ DOT, DASH, DASH, DOT ]],
  ['Q', [ DASH, DASH, DOT, DASH ]],
  ['R', [ DOT, DASH, DOT ]],
  ['S', [ DOT, DOT, DOT ]],
  ['T', [ DASH ]],
  ['U', [ DOT, DOT, DASH ]],
  ['V', [ DOT, DOT, DOT, DASH ]],
  ['W', [ DOT, DASH, DASH ]],
  ['X', [ DASH, DOT, DOT, DASH ]],
  ['Y', [ DASH, DOT, DASH, DASH ]],
  ['Z', [ DASH, DASH, DOT, DOT ]],
  ['1', [ DOT, DASH, DASH, DASH, DASH ]],
  ['2', [ DOT, DOT, DASH, DASH, DASH ]],
  ['3', [ DOT, DOT, DOT, DASH, DASH ]],
  ['4', [ DOT, DOT, DOT, DOT, DASH ]],
  ['5', [ DOT, DOT, DOT, DOT, DOT ]],
  ['6', [ DASH, DOT, DOT, DOT, DOT ]],
  ['7', [ DASH, DASH, DOT, DOT, DOT ]],
  ['8', [ DASH, DASH, DASH, DOT, DOT ]],
  ['9', [ DASH, DASH, DASH, DASH, DOT ]],
  ['0', [ DASH, DASH, DASH, DASH, DASH ]]
];

function parse(codes) {
  return morseCodeTable
    .filter(charCodes => {
      return _(charCodes[1])
        .zip(codes)
        .every(codePair => codePair[0] === codePair[1]);
    })
    .map(charCodes => charCodes[0])
    .shift() || '?';
}

module.exports = {
  parse,
  DASH,
  DOT
};
