var Hebcal = require('..'),
	argv = require('../lib/argv'),
	table = require('../lib/table'),
	suntimes = require('../lib/suntimes'),
	printObj = require('../lib/printObj'),
	main = require.main == module;

var helpString = [
	"Print out information for a Hebrew day.",
	"Options:\n" + table([
		["-a", "--ashkenazis", "Use Ashkenazis Hebrew"],
		["-c", "--candles", "Print candle-lighting and havdalah times"],
		["",   "--candleLighting=NUM", "Set the time for candle-lighting to NUM minutes before sunset"],
		["",   "--city=CITY", "Set the city to the given CITY"],
		["",   "--day=DATE", "Print the information for DATE"],
		["-d", "--holidays", "Print holidays"],
		["",   "--dafyomi", "Print Daf Yomi"],
		["-g", "--greg", "Print the Gregorian date"],
		["",   "--hallel", "Print what Hallel is said"],
		["",   "--havdalah=NUM", "Set the time for havdalah to NUM minutes after sunset"],
		["-h", "--help=SUBJECT", "With no subject, print this message and exit. The only subject available right now is times."],
		["-i", "--ivrit", "Use Israeli Hebrew, in Hebrew characters"],
		["",   "--omer", "Print Sefirat Haomer, if applicable"],
		["-p", "--parsha", "Print the parsha on Shabbat"],
		["-q", "--quiet", "Don't print errors"],
		["-t", "--times=LIST", "Print halachick times for the day. LIST should be a comma-separated list of times. If no list is provided, print all times. For a list of time names, run node day --help=times"],
		["",   "--tachanun", "Print what Tachanun is said"],
	], {prefix: '    '}),
	"Required parameters to long arguments are also required to the short forms.",
	"To print out this day with holidays, halachick times for Jerusalem, parshiot, and the Gregorian date, you could use:\n    node day -dcpgt --city=Jerusalem",
	"For information using Hebcal programatically, see https://github.com/hebcal/hebcal and https://github.com/hebcal/hebcal-js"
];

if (process.env.HEBCAL_CITY) {
	Hebcal.defaultCity = process.env.HEBCAL_CITY;
}

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
	h: function(subject){
		switch (subject) {
			case undefined:
				console.log(printObj(helpString));
				break;
			case 'times':
				console.log(printObj([
					"Each row is a list of synonyms for the times:",
					table(suntimes.arr, {vert: ' '}),
					"Time names are case insensitive."
				]));
				break;
			default:
				console.error("Unknown option to --help: " + subject);
		}
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
			var candles = day.candleLighting(),
				havdalah = day.havdalah(),
				tmp;

			if (candles) {
				tmp = candles.toTimeString();
				echo.candles = 'Candle Lighting: ' + tmp.slice(0, tmp.indexOf('(') - 1);
			}
			if (havdalah) {
				tmp = havdalah.toTimeString();
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
		greg: shortargs.g,
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

	try {
		console.log(printObj(module.exports(opts)));
	} catch(e) {
		if (!opts.quiet) {
			throw e;
		}
	}
	process.exit();
}