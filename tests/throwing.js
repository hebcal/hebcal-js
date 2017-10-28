var Hebcal = require('..'), assert = require('assert');

var main = require.main == module;

if (!main) {
	console.log('');
}
console.log('Check that errors are thrown at proper times');
console.log('');

console.log("Hebcal('5774')");
assert.throws(function(){
	new Hebcal('5774');
});

console.log("Hebcal(5774, {})");
assert.throws(function(){
	new Hebcal(5774, {});
});

console.log("Hebcal(5774, {0: 1, 1: 2})");
assert.throws(function(){
	new Hebcal(5774, {0: 1, 1: 2});
});

console.log("yr.addHoliday('my birthday')");
assert.throws(function(){
	var yr = new Hebcal();
	yr.addHoliday('my birthday');
});

console.log("Hebcal.Month([], null)");
assert.throws(function(){
	new Hebcal.Month([], null);
});

console.log("Hebcal.Month(3, null)");
assert.throws(function(){
	new Hebcal.Month(3, null);
});

console.log("Hebcal.HDate(null)");
assert.throws(function(){
	new Hebcal.HDate(null);
});

console.log("Hebcal.HDate(1, 2, 3, 4)");
assert.throws(function(){
	new Hebcal.HDate(1, 2, 3, 4);
});

console.log("day.setLocation()");
assert.throws(function(){
	var day = new Hebcal.HDate();
	day.setLocation();
});

console.log('Errors properly thrown.');
console.log('');

console.log('Hebcal(5774)');
assert.doesNotThrow(function(){
	new Hebcal(5774);
});

console.log("Hebcal(5774, [1, 2])");
assert.doesNotThrow(function(){
	new Hebcal(5774, [1, 2]);
});

console.log("yr.addHoliday(new Hebcal.holidays.Event(new Date(), 'today', 0))");
assert.doesNotThrow(function(){
	var yr = new Hebcal();
	yr.addHoliday(new Hebcal.holidays.Event(new Date(), 'today', 0));
});

console.log("Hebcal.Month(5, 5774)");
assert.doesNotThrow(function(){
	new Hebcal.Month(5, 5774);
});

console.log("Hebcal.HDate()");
assert.doesNotThrow(function(){
	new Hebcal.HDate(undefined);
	new Hebcal.HDate();
});

console.log('Errors properly avoided.');
console.log('');

if (main) {
	console.log('Success!');
	process.exit();
}
