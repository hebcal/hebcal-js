var Hebcal = require('..'),
	argv = require('./lib/argv'),
	table = require('./lib/table'),
	main = require.main == module;

var helpString = "node day -aipdghq";

var opts = {
	day: undefined,
	lang: 's',
	parsha: false,
	holidays: false,
	times: [],
	tachanun: false,
	hallel: false,
	dafyomi: false,
	omer: false,
	greg: false,
	quiet: false
}, shortargs = {
	a: function(){opts.lang = 'a'},
	i: function(){opts.lang = 'h'},
	p: function(){opts.parsha = true},
	d: function(){opts.holidays = true},
	g: function(){opts.greg = true},
	c: function(city){Hebcal.defaultCity = city},
	t: function(times){
		if (!times) {
			times = Object.keys(new Hebcal.HDate().getZemanim()).join(',');
		}
		opts.times = times.split(',').map(function(str){return str.trim()});
	},
	h: function(){
		console.log(helpString);
		process.kill();
	},
	q: function(){opts.quiet = true}
};

module.exports = function(opts) {

	opts = opts || {};
	opts.times = opts.times || [];

	var day = new Hebcal.HDate(opts.day);

	var echo = {};

	/*var day = new Hebcal.HDate().onOrBefore(0).prev();

	for (var i = 0; i < 7; i++) {
		week.push(day = day.next());
	}

	console.log('Week of ' +
		week[0].toString(opts.lang) + ' - ' + week[6].toString(opts.lang) +
		(opts.greg ? ' / ' + week[0].greg().toDateString() + ' - ' + week[6].greg().toDateString() : '')
	);*/

	echo.day = day.toString(opts.lang) + (opts.greg ? ' / ' + day.greg().toDateString() : '');

	if (opts.parsha) {
		echo.parsha = 'Parsha: ' + day.getParsha(opts.lang);
	}

	if (opts.holidays && day.holidays().length) {
		echo.holidays = 'Holidays: ' + day.holidays().map(function(h){return h.getDesc(opts.lang)}).join(', ');
	}

	if (opts.tachanun) {
		echo.tachanun = 'Tachanun: ' + day.tachanun();
	}
	if (opts.hallel) {
		echo.hallel = 'Hallel: ' + day.hallel();
	}

	if (opts.dafyomi) {
		echo.dafyomi = 'Daf Yomi: ' + day.dafyomi(opts.lang);
	}

	if (opts.times.length) {
		var times = Hebcal.filter(day.getZemanim(), opts.times);
		echo.times = 'Times:\n' + table(Object.keys(times).map(function(t){return [t, times[t]]}), {prefix: '  '});
	}

	if (opts.omer && day.omer()) {
		echo.omer = 'Day of omer: ' + day.omer();
	}

	return echo;
};

if (main) {
	argv.parse(shortargs, {
		day: function(day){opts.day = day},
		ashkenazis: shortargs.a,
		ivrit: shortargs.i,
		parsha: shortargs.p,
		city: shortargs.c,
		holidays: shortargs.d,
		showgreg: shortargs.g,
		times: shortargs.t,
		tachanun: function(){opts.tachanun = true},
		hallel: function(){opts.hallel = true},
		dafyomi: function(){opts.dafyomi = true},
		omer: function(){opts.omer = true},
		help: shortargs.h,
		quiet: shortargs.q
	});

	if (!opts.quiet) {
		argv.warn();
	}

	var echo = module.exports(opts), i;
	for (i in echo) {
		console.log(echo[i]);
	}
	process.kill();
}