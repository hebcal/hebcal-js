var Hebcal = require('..'),
	argv = require('../lib/argv'),
	table = require('../lib/table'),
	suntimes = require('../lib/suntimes'),
	printObj = require('../lib/printObj'),
	dayInfo = require('./day'),
	weekInfo = require('./week'),
	main = require.main == module;

var helpString = [
	"Print out a calendar for a Hebrew month.",
	"Options:\n" + table([
		[""  , "--always", "Always display Tachanun and Hallel, even on ordinary days (only with the --tachanun and/or --hallel flags)"],
		["-a", "--ashkenazis", "Use Ashkenazis Hebrew"],
		["-c", "--candles", "Print candle-lighting and havdalah times"],
		["",   "--candleLighting=NUM", "Set the time for candle-lighting to NUM minutes before sunset"],
		["",   "--city=CITY", "Set the city to the given CITY"],
		["-d", "--holidays", "Print holidays occurring on each date"],
		["",   "--dafyomi", "Print Daf Yomi for each day"],
		["-g", "--greg", "Print the Gregorian date for each day"],
		["",   "--hallel", "Print what Hallel is said on each date"],
		["",   "--havdalah=NUM", "Set the time for havdalah to NUM minutes after sunset"],
		["-h", "--help", "Print this message and exit"],
		["-i", "--ivrit", "Use Israeli Hebrew, in Hebrew characters"],
		["-m", "--month=MONTH_NAME_OR_NUMBER", "Set the current month to the given one"],
		["",   "--omer", "Print Sefirat Haomer for each day, if applicable"],
		["-p", "--parsha", "Print the parsha on Shabbat"],
		["-q", "--quiet", "Don't print errors"],
		["-t", "--table", "Print output in a tabular format (recommended)"],
		["",   "--tachanun", "Print what Tachanun is said on each date"],
		["-y", "--year=NUM", "Set the current year to the given one"]
	], {prefix: '    '}),
	"Required parameters to long arguments are also required to the short forms.",
	"To print out this month with holidays, candle-lighting times for Jerusalem, parshiot, and the Gregorian dates in a table, you could use:\n    node month -tdcpg --city=Jerusalem",
	"Table formatting is not guaranteed to be good; in fact it's nearly guaranteed to be messed up at least twice.",
	"For information using Hebcal programatically, see https://github.com/hebcal/hebcal and https://github.com/hebcal/hebcal-js"
];

if (process.env.HEBCAL_CITY) {
	Hebcal.defaultCity = process.env.HEBCAL_CITY;
}

var opts = {
	lang: 's',
	month: new Hebcal.HDate().getMonth(),
	year: new Hebcal.HDate().getFullYear()
}, shortargs = {
	a: function(){opts.lang = 'a'},
	i: function(){opts.lang = 'h'},
	p: function(){opts.parsha = true},
	d: function(){opts.holidays = true},
	g: function(){opts.greg = true},
	c: function(){opts.candles = true},
	t: function(){opts.table = true},
	O: function(){opts.only = true},
	m: function(month){opts.month = month},
	y: function(year){opts.year = year},
	h: function(){
		console.log(printObj(helpString));
		process.kill();
	},
	q: function(){opts.quiet = true}
};

module.exports = function(o) {
	o = o || opts;

	var day = new Hebcal.HDate(1, o.month, o.year).getMonthObject().getDay(1).onOrBefore(0),
		monthNum = new Hebcal.HDate(1, o.month, o.year).getMonth(),
		month = [day],
		echo = {},
		i,
		tmpO;

	while (day.onOrAfter(6).getMonth() == monthNum) {
		month.push(day = day.next());
	}
	while (day.onOrBefore(0).getMonth() == monthNum) {
		month.push(day = day.next());
	}
	month.pop();

	echo.month = 'Month of ' + month[10].getMonthName(o.lang);

	if (o.table) {
		echo.table = Hebcal.range(1, month.length / 7).map(function(){
			return Hebcal.range(1,7).map(function(){
				return '';
			});
		});

		month.forEach(function(d,i){
			tmpO = JSON.parse(JSON.stringify(o)); // clone
			tmpO.day = d.toString();
			tmpO.parsha = i % 7 == 6 && o.parsha;
			var info = dayInfo(tmpO);
			info.day = info.day.replace(' / ', '\n');
			if (!(info.tachanun && ((info.tachanun.val != 7 && !(info.tachanun.val == 5 && i % 7 == 6)) || tmpO.always))) {
				delete info.tachanun;
			}
			if (!(info.hallel && (info.hallel.val != 0 || tmpO.always))) {
				delete info.hallel;
			}
			echo.table[~~(i / 7)][i % 7] = printObj(info);
		});

		echo.table = table(echo.table, {sep: ' | ', vert: '-'});
	} else {
		for (i = 0; day = month[i]; i += 7) {
			tmpO = JSON.parse(JSON.stringify(o)); // clone
			tmpO.day = day.toString();
			echo['week' + (i / 7)] = printObj(weekInfo(tmpO));
		}
	}

	return echo;
};

if (main) {
	argv.parse(shortargs, {
		month: shortargs.m,
		year: shortargs.y,
		ashkenazis: shortargs.a,
		ivrit: shortargs.i,
		parsha: shortargs.p,
		candles: shortargs.c,
		holidays: shortargs.d,
		greg: shortargs.g,
		tachanun: function(){opts.tachanun = true},
		hallel: function(){opts.hallel = true},
		dafyomi: function(){opts.dafyomi = true},
		omer: function(){opts.omer = true},
		city: function(city){Hebcal.defaultCity = city},
		candleLighting: function(time){Hebcal.candleLighting = time},
		havdalah: function(time){Hebcal.havdalah = time},
		help: shortargs.h,
		quiet: shortargs.q,
		table: shortargs.t,
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