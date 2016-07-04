var Hebcal = require('..'),
	argv = require('../lib/argv'),
	table = require('../lib/table'),
	suntimes = require('../lib/suntimes'),
	printObj = require('../lib/printObj'),
	dayInfo = require('./day'),
	main = require.main == module;

var helpString = [
	"Print out a calendar for a Hebrew week.",
	"Options:\n" + table([
		[""  , "--always", "Always display Tachanun and Hallel, even on ordinary days (only with the --tachanun and/or --hallel flags)"],
		["-a", "--ashkenazis", "Use Ashkenazis Hebrew"],
		["-b", "--table", "Print output in a tabular format"],
		["-c", "--candles", "Print candle-lighting and havdalah times"],
		["",   "--candleLighting=NUM", "Set the time for candle-lighting to NUM minutes before sunset"],
		["",   "--city=CITY", "Set the city to the given CITY"],
		["",   "--day=DATE", "Print the week of DATE"],
		["-d", "--holidays", "Print holidays occurring on each date"],
		["",   "--dafyomi", "Print Daf Yomi for each day"],
		["-g", "--greg", "Print the Gregorian date for each day"],
		["",   "--hallel", "Print what Hallel is said on each date"],
		["",   "--havdalah=NUM", "Set the time for havdalah to NUM minutes after sunset"],
		["-h", "--help=SUBJECT", "With no subject, print this message and exit. The only subject available right now is times."],
		["-i", "--ivrit", "Use Israeli Hebrew, in Hebrew characters"],
		["",   "--omer", "Print Sefirat Haomer for each day, if applicable"],
		["-p", "--parsha", "Print the parsha on Shabbat"],
		["-q", "--quiet", "Don't print errors"],
		["-t", "--times=LIST", "Print halachick times for the week. LIST should be a comma-separated list of times. If no list is provided, print all times. For a list of time names, run node week --help=times"],
		["",   "--tachanun", "Print what Tachanun is said on each date"],
	], {prefix: '    '}),
	"Required parameters to long arguments are also required to the short forms.",
	"To print out this week with holidays, candle-lighting times for Jerusalem, parshiot, and the Gregorian dates in a table, you could use:\n    node week -bdcpg --city=Jerusalem",
	"Table formatting is not guaranteed to be good; in fact it's nearly guaranteed to be messed up at least twice.",
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
	c: function(){opts.candles = true},
	b: function(){opts.table = true},
	O: function(){opts.only = true},
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

	var day = new Hebcal.HDate(opts.day).onOrBefore(0).prev(),
		week = [],
		echo = {},
		i;

	for (i = 0; i < 7; i++) {
		week.push(day = day.next());
	}

	echo.week = 'Week of ' +
		week[0].toString(opts.lang) + ' - ' + week[6].toString(opts.lang) +
		(opts.greg ? ' / ' + week[0].greg().toDateString() + ' - ' + week[6].greg().toDateString() : '');

	if (opts.table) {
		echo.table = Hebcal.range(1,7).map(function(){
			return Hebcal.range(1,7).map(function(){
				return '';
			});
		});
		week.forEach(function(day,num){
			var i = 0, o = JSON.parse(JSON.stringify(opts)); // clone
			o.day = day.toString();
			o.parsha = false;
			o.times = [];
			day = dayInfo(o);
			echo.table[i++][num] = day.day.split(' / ')[0];
			if (o.greg) {
				echo.table[i++][num] = day.day.split(' / ')[1];
			}
			if (day.holidays) {
				echo.table[i++][num] = day.holidays;
			}
			if (day.tachanun && ((day.tachanun.val != 7 && !(day.tachanun.val == 5 && week[num].getDay() == 6)) || o.always)) {
				echo.table[i++][num] = day.tachanun.toString();
			}
			if (day.hallel && (day.hallel.val != 0 || o.always)) {
				echo.table[i++][num] = day.hallel.toString();
			}
			if (day.candles) {
				echo.table[i++][num] = day.candles;
			}
			if (day.havdalah) {
				echo.table[i++][num] = day.havdalah;
			}
		});
		echo.table = table(echo.table.filter(function(e){
			return e.join('');
		}), {sep:' | ', vert:'-'});
	} else {
		week.forEach(function(day,num){
			var o = JSON.parse(JSON.stringify(opts)); // clone
			o.day = day.toString();
			o.parsha = false;
			o.times = [];
			day = dayInfo(o);
			if (o.only && !day.holidays) {
				return;
			}
			if (!opts.always) {
				if (day.tachanun && day.tachanun.val == 7) {
					delete day.tachanun;
				}
				if (day.hallel && day.hallel.val == 0) {
					delete day.hallel;
				}
			}
			var e = '';
			for (i in day) {
				e += day[i] + '\n';
			}
			echo['day' + num] = e.trim();
		});
	}

	if (opts.parsha) {
		echo.parsha = 'Parsha: ' + day.getParsha(opts.lang).join(', ');
	}

	if (opts.times.length) {
		echo.times = [];
		opts.times.forEach(function(t){
			echo.times.push([t.split('_').map(function(p){
				return p[0].toUpperCase() + p.slice(1).toLowerCase();
			}).join(' '), week[0].getZemanim()[t].toTimeString(), '-', week[6].getZemanim()[t].toTimeString()]);
		});
		echo.times = 'Times:\n' + table(echo.times, {prefix: '  '});
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
		candleLighting: function(time){Hebcal.candleLighting = time},
		havdalah: function(time){Hebcal.havdalah = time},
		help: shortargs.h,
		quiet: shortargs.q,
		table: shortargs.b,
		"only-events": shortargs.O,
		always: function(){opts.always = true}
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