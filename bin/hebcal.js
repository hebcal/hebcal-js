#!/usr/bin/env node

var Hebcal = require('..'),
	argv = require('../lib/argv'),
	table = require('../lib/table'),
	suntimes = require('../lib/suntimes'),
	printObj = require('../lib/printObj'),
	dayInfo = require('./day'),
	weekInfo = require('./week'),
	monthInfo = require('./month'),
	fs = require('fs');

var helpString = [
	"Print out information about a Hebrew date range. With no arguments, it just prints the current Hebrew date.",
	"Options:\n" + table([
		[""  , "--always", "Always display Tachanun and Hallel, even on ordinary days (only with the --tachanun and/or --hallel flags)"],
		["-a", "--ashkenazis", "Use Ashkenazis Hebrew"],
		["-c", "--candles", "Print candle-lighting and havdalah times"],
		["",   "--candleLighting=NUM", "Set the time for candle-lighting to NUM minutes before sunset"],
		["",   "--city=CITY", "Set the city to the given CITY"],
		["",   "--day=DATE", "Print times for the given DATE. See hebcaljs -h dates for acceptable parameters"],
		["",   "--dafyomi", "Print Daf Yomi for each day"],
		["-g", "--greg", "Print the Gregorian date for each day"],
		["",   "--hallel", "Print what Hallel is said on each date"],
		["",   "--havdalah=NUM", "Set the time for havdalah to NUM minutes after sunset"],
		["-h", "--help=SUBJECT", "With no subject, print this message and exit. For a list of subjects, see below."],
		["-H", "--holidays", "Print holidays occurring on each date"],
		["-i", "--ivrit", "Use Israeli Hebrew, in Hebrew characters"],
		["-m", "--month[=MONTH_NAME_OR_NUMBER]", "Print information for an entire month\n\tDefaults to the current month"],
		["",   "--omer", "Print Sefirat Haomer for each day, if applicable"],
		["-O", "--only-events", "Only print if there is an event on the day"],
		["-p", "--parsha", "Print the parsha on Shabbat"],
		["-q", "--quiet", "Don't print errors"],
		["-t", "--table", "Print output in a tabular format"],
		["-T", "--times=LIST", "Print halachick times for the week. LIST should be a comma-separated list of times.\n\tIf no list is provided, print all times. For a list of time names, run node week --help=times"],
		["",   "--tachanun", "Print what Tachanun is said on each date"],
		["-v", "--version", "Print version information and exit"],
		["-w", "--week=DAY", "Print information for an entire week"],
		["-y", "--year=NUM", "Print information for an entire year"]
	], {prefix: '    '}),
	"Required parameters to long arguments are also required to the short forms.",
	"The -O and -t flags cannot be used at the same time. Only one of -w -m -y can be used at a time. -T is ignored with -m or -y.",
	"Table formatting is not guaranteed to be good; in fact it's nearly guaranteed to be messed up at least twice.",
	"Help subjects: times, dates, cities, warranty, license. Warning: license prints the ENTIRE text of the GPL3; it is very long.",
	"For information using Hebcal programatically, see https://github.com/hebcal/hebcal and https://github.com/hebcal/hebcal-js"
];

if (process.env.HEBCAL_CITY) {
	Hebcal.defaultCity = process.env.HEBCAL_CITY;
}

var opts = {
	lang: 's',
	type: 0,
	day: new Hebcal.HDate
}, shortargs = {
	a: function(){opts.lang = 'a'},
	i: function(){opts.lang = 'h'},
	p: function(){opts.parsha = true},
	H: function(){opts.holidays = true},
	g: function(){opts.greg = true},
	c: function(){opts.candles = true},
	T: function(times){
		if (!times) {
			times = Object.keys(new Hebcal.HDate().getZemanim()).join(',');
		}
		opts.times = times.split(',').map(function(str){return suntimes(str)});
	},
	t: function(){opts.table = true},
	O: function(){opts.only = true},
	w: function(week){
		if (week) {
			opts.day = new Hebcal.HDate(week);
		}
		opts.type = 1;
	},
	m: function(month){
		if (month) {
			opts.day = new Hebcal.HDate(1, month);
		}
		opts.type = 2;
	},
	y: function(year){
		if (year) {
			opts.day = new Hebcal.HDate(1, 'tishrei', year);
		}
		opts.type = 3;
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
			case 'dates':
				console.log(
					"Some examples of acceptable date syntax.\n" +
					"Anything with a space must be surrounded in quotes.\n\n" +
					"tomorrow\n" +
					"yesterday\n" +
					"14 Adar\n" +
					"15 Nisan 5773\n" +
					"א' תשרי\n" +
					"65 Elul 5770"
				);
				break;
			case 'cities':
				var cities = [], length = 5;
				Hebcal.cities.listCities().forEach(function(c,i){
					if (!(i % length)) {
						cities[~~(i / length)] = [c];
					} else {
						cities[~~(i / length)].push(c);
					}
				});
				console.log(printObj([
					"A list of cities supported by the --city flag:",
					table(cities),
					"City names are case insensitive.",
					"The city will default to the environment variable HEBCAL_CITY if it is set."
				]));
				break;
			case 'warranty':
				console.log(
					"This program is free software: you can redistribute it and/or modify\n" +
					"it under the terms of the GNU General Public License as published by\n" +
					"the Free Software Foundation, either version 3 of the License, or\n" +
					"(at your option) any later version.\n\n" +
					"This program is distributed in the hope that it will be useful,\n" +
					"but WITHOUT ANY WARRANTY; without even the implied warranty of\n" +
					"MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n" +
					"GNU General Public License for more details.\n\n" +
					"You should have received a copy of the GNU General Public License\n" +
					"along with this program. If not, see <http://www.gnu.org/licenses/>."
				);
				break;
			case 'license':
				console.log(fs.readFileSync('../COPYING').toString());
				break;
			default:
				console.error("Unknown option to --help: " + subject);
		}
		process.kill();
	},
	v: function(){
		console.log('Hebcal JS ' + require('../package.json').version);
		process.kill();
	},
	q: function(){opts.quiet = true}
};

argv.parse(shortargs, {
	week: shortargs.w,
	month: shortargs.m,
	year: shortargs.y,
	day: function(day){opts.day = new Hebcal.HDate(day)},
	ashkenazis: shortargs.a,
	ivrit: shortargs.i,
	parsha: shortargs.p,
	candles: shortargs.c,
	times: shortargs.T,
	holidays: shortargs.H,
	greg: shortargs.g,
	tachanun: function(){opts.tachanun = true},
	hallel: function(){opts.hallel = true},
	dafyomi: function(){opts.dafyomi = true},
	omer: function(){opts.omer = true},
	city: function(city){Hebcal.defaultCity = city},
	candleLighting: function(time){Hebcal.candleLighting = time},
	havdalah: function(time){Hebcal.havdalah = time},
	help: shortargs.h,
	version: shortargs.v,
	quiet: shortargs.q,
	table: shortargs.t,
	"only-events": shortargs.O,
	always: function(){opts.always = true}
});

module.exports = function(o) {
	o = o || opts;

	switch (o.type) {
		case 0: // just today
			return dayInfo(o);
		case 1: // week
			return weekInfo(o);
		case 2: // month
			o.month = o.day.getMonth();
			o.year = o.day.getFullYear();
			return monthInfo(o);
		case 3:
			var year = o.day.getYearObject();
			o.year = year.year;
			return year.months.map(function(m){
				o.month = m.month;
				return printObj(monthInfo(o));
			});
	}
};

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