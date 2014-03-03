var Hebcal = require('..'),
	argv = require('./lib/argv'),
	table = require('./lib/table'),
	suntimes = require('./lib/suntimes'),
	main = require.main == module;

var helpString = "node day -aipdghq";

var opts = {
	lang: 's',
	times: []
}, shortargs = {
	a: function(){opts.lang = 'a'},
	i: function(){opts.lang = 'h'},
	p: function(){opts.parsha = true},
	d: function(){opts.holidays = true},
	g: function(){opts.greg = true},
	c: function(city){opts.candles = true},
	t: function(times){
		if (!times) {
			times = Object.keys(new Hebcal.HDate().getZemanim()).join(',');
		}
		opts.times = times.split(',').map(function(str){return suntimes(str)});
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

	var echo = {
		day: day.toString(opts.lang) + (opts.greg ? ' / ' + day.greg().toDateString() : '')
	};

	if (opts.parsha) {
		echo.parsha = 'Parsha: ' + day.getParsha(opts.lang);
	}

	if (opts.holidays && day.holidays().length) {
		var holidays = day.holidays().map(function(h){return ['', h.getDesc(opts.lang)]});
		holidays[0][0] = 'Holidays:';
		echo.holidays = table(holidays);
	}

	if (opts.tachanun) {
		(function(){
			var t = day.tachanun();
			if (t == 0) {
				echo.tachanun = 'No Tachanun.';
			}
			var all = !!(t&4), s = !!(t&2), m = !!(t&1);
			if (s && m) {
				echo.tachanun = 'Ordinary Tachanun.';
			} else if (s) {
				echo.tachanun = 'No Tachanun at Mincha.';
			} else if (m) {
				echo.tachanun = 'No Tachanun at Shacharit.';
			}
			if (!all && t) {
				echo.tachanun += 'Some congregations say Tachanun.';
			}
			echo.tachanun = new String(echo.tachanun);
			echo.tachanun.val = t;
		})();
	}
	if (opts.hallel) {
		(function(){
			var h = day.hallel();
			echo.hallel = new String(h == 2 ? 'Whole Hallel' : h == 1 ? 'Half Hallel.' : 'No Hallel.');
			echo.hallel.val = h;
		})();
	}

	if (opts.dafyomi) {
		echo.dafyomi = 'Daf Yomi: ' + day.dafyomi(opts.lang);
	}

	if (opts.times.length) {
		var times = Hebcal.filter(day.getZemanim(), opts.times);
		echo.times = 'Times:\n' + table(Object.keys(times).map(function(t){
			return [t.split('_').map(function(p){
				return p[0].toUpperCase() + p.slice(1).toLowerCase();
			}).join(' '), times[t]];
		}), {prefix: '  '});
	}

	if (opts.candles) {
		(function(){
			var h = day.holidays(),
				candles = Hebcal.filter(h.map(function(h){return h.candleLighting()}), true),
				havdalah = Hebcal.filter(h.map(function(h){return h.havdalah()}), true),
				tmp;

			if (candles.length) {
				tmp = candles[0].toTimeString();
				echo.candles = 'Candle Lighting: ' + tmp.slice(0, tmp.indexOf('(') - 1);
			}
			if (havdalah.length) {
				tmp = havdalah[0].toTimeString();
				echo.havdalah = 'Havdalah: ' + tmp.slice(0, tmp.indexOf('(') - 1);
			}
		})();
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
		candles: shortargs.c,
		holidays: shortargs.d,
		showgreg: shortargs.g,
		times: shortargs.t,
		tachanun: function(){opts.tachanun = true},
		hallel: function(){opts.hallel = true},
		dafyomi: function(){opts.dafyomi = true},
		omer: function(){opts.omer = true},
		city: function(city){Hebcal.defaultCity = city},
		help: shortargs.h,
		quiet: shortargs.q
	});

	if (!opts.quiet) {
		argv.warn();
	}

	var echo = module.exports(opts), i;
	for (i in echo) {
		console.log(echo[i].toString());
	}
	process.kill();
}