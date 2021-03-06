// 20.2.2.33 Math.tanh(x)
var $export = require('./_export.js')
  , expm1   = require('./_math-expm1.js')
  , exp     = Math.exp;

$export($export.S, 'Math', {
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});