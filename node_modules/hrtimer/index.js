module.exports = function () {
  var PREFIX = 'timer:'
    , timers = {};

  return function (name) {
    var k = PREFIX + name
      , t = timers[k];

    if (t) {
      timers[k] = null;
      t = process.hrtime(t);
      t = (t[0] * 1e9 + t[1]) / 1e6;
      console.log('HRTimer %s: %s ms', name, t);
    } else {
      timers[k] = process.hrtime();
    }
  };
};
