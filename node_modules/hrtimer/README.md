# hrtimer

Wrapper around `process.hrtime`


## Installation

```
npm install hrtimer
```


## Usage

```
var hrtimer = require('hrtimer')();

hrtimer('slowFn1');
slowFn1();
hrtimer('slowFn1');
// The second call to hrtimer with the same string console.logs 'HRTimer slowFn1: 22.555161 ms' and resets the timer.

hrtimer('timer1');
hrtimer('timer2');
setTimeout(function(){
	hrtimer('timer1');
	// logs timer1
}, 1);
setTimeout(function(){
	hrtimer('timer2');
	// logs timer2
}, 1);
```


## TODO

Use `performance.now` or `performance.webkitNow` in the browser.
