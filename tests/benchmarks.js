var Hebcal = require('..');

try {
	var hrtimer = require('hrtimer')();
} catch (e) {
	console.error('hrtimer not installed! Try installing in dev mode to use this test');
	process.kill();
}

console.log('Benchmarks');
console.log('');

console.log('new Hebcal() 100 times');
hrtimer('new Hebcal()');
Hebcal.range(1,100).map(function(){new Hebcal});
hrtimer('new Hebcal()');
console.log('');

console.log('new Hebcal.HDate() 100 times');
hrtimer('new Hebcal.HDate()');
Hebcal.range(1,100).map(function(){new Hebcal.HDate});
hrtimer('new Hebcal.HDate()');
console.log('');

var today = new Hebcal.HDate, year = new Hebcal;

console.log('today.tachanun() once');
hrtimer('today.tachanun()');
today.tachanun();
hrtimer('today.tachanun()');
console.log('');

console.log('today.tachanun() 100 times');
hrtimer('today.tachanun()');
Hebcal.range(1,100).map(function(){today.tachanun()});
hrtimer('today.tachanun()');
console.log('');

console.log('.tachanun() for every day of the year');
hrtimer('today.tachanun()');
year.map(function(d){d.tachanun()});
hrtimer('today.tachanun()');
console.log('');

console.log('today.hallel() once');
hrtimer('today.hallel()');
today.hallel();
hrtimer('today.hallel()');
console.log('');

console.log('today.hallel() 100 times');
hrtimer('today.hallel()');
Hebcal.range(1,100).map(function(){today.hallel()});
hrtimer('today.hallel()');
console.log('');

console.log('.hallel() for every day of the year');
hrtimer('today.hallel()');
year.map(function(d){d.hallel()});
hrtimer('today.hallel()');
console.log('');

console.log('today.holidays() 100 times');
hrtimer('today.holidays()');
Hebcal.range(1,100).map(function(){today.holidays()});
hrtimer('today.holidays()');
console.log('');

console.log('.holidays() for every day of the year');
hrtimer('today.holidays()');
year.map(function(d){d.holidays()});
hrtimer('today.holidays()');
console.log('');

console.log('today.getSedra() once');
hrtimer('today.getSedra()');
today.getSedra();
hrtimer('today.getSedra()');
console.log('');

console.log('today.getSedra() 100 times');
hrtimer('today.getSedra()');
Hebcal.range(1,100).map(function(){today.getSedra()});
hrtimer('today.getSedra()');
console.log('');

console.log('.getSedra() for every day of the year');
hrtimer('today.getSedra()');
year.map(function(d){d.getSedra()});
hrtimer('today.getSedra()');
console.log('');

process.exit();
