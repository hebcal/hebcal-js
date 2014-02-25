/*
	Hebcal - A Jewish Calendar Generator
	Copyright (C) 1994-2004  Danny Sadinoff
	Portions Copyright (c) 2002 Michael J. Radwin. All Rights Reserved.

	https://github.com/hebcal/hebcal-js

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	Danny Sadinoff can be reached at 
	danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter
 */
var c = require('./common'),
	HDate = require('./hdate'),
	holidays = require('./holidays'),
	Sedra = require('./sedra'),
	dafyomi = require('./dafyomi'),
	cities = require('./cities'),
	greg = require('./greg'),
	EventEmitter = require('events').EventEmitter;

// for minifying optimizations
var prototype = 'prototype',
	defProp = Object.defineProperty,
	find = 'find',
	strings = 'strings',
	Month = 'Month';

// Main Hebcal function

function Hebcal(year, month) {
	if (!year) {
		year = (new HDate()).getFullYear(); // this year;
	}
	if (typeof year !== 'number') {
		throw new TypeError('year to Hebcal() is not a number');
	}
	this.year = year;
	if (month) {
		if (typeof month == 'string') {
			month = c.lookup_hebrew_month(month);
		}
		if (typeof month == 'number') {
			month = [month];
		}

		if (Array.isArray(month)) {
			this.months = month.map(function(i){
				var m = new Hebcal[Month](i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: this
				});
				return m;
			}, this);

			this.holidays = holidays.getHolidaysForYear(year < 1 ? (new HDate()).getFullYear() : year).filter(function(h){
				return this.months.filter(function(m){ // don't keep ones that are out of bounds
					return m.month === h.date.getMonth();
				}).length;
			}, this);
		} else {
			throw new TypeError('month to Hebcal is not a valid type');
		}
	} else {
		return new Hebcal(year, c.range(1, c.MONTHS_IN_HEB(year)));
	}

	this.length = c.days_in_heb_year(year);

	defProp(this, 'il', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getMonth(1).il;
		},
		set: function(il) {
			this.months.forEach(function(m){
				m.il = il;
			});
		}
	});

	defProp(this, 'lat', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getMonth(1).lat;
		},
		set: function(lat) {
			this.months.forEach(function(m){
				m.lat = lat;
			});
		}
	});
	defProp(this, 'long', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getMonth(1).long;
		},
		set: function(lon) {
			this.months.forEach(function(m){
				m.long = lon;
			});
		}
	});
}

Hebcal[prototype].isLeapYear = function isLeapYear() {
	return c.LEAP_YR_HEB(this.year);
};

Hebcal[prototype].setCity = function setCity(city) {
	this.months.forEach(function(m){
		m.setCity(city);
	});
	return this;
};

Hebcal[prototype].setLocation = function setLocation(lat, lon) {
	this.months.forEach(function(m){
		m.setLocation(lat, lon);
	});
	return this;
};

Hebcal[prototype].next = function next() {
	return new Hebcal(this.year + 1);
};

Hebcal[prototype].prev = function prev() {
	return new Hebcal(this.year - 1);
};

Hebcal[prototype].getMonth = function getMonth(month) {
	month = typeof month === 'number' ? month :
		month.charCodeAt(0) >= 1488 && month.charCodeAt(0) <= 1514 && /('|")/.test(month) ? c.gematriya(month) :
			month.charCodeAt(0) >= 48 && month.charCodeAt(0) <= 57 /* number */ ? parseInt(month, 10) : c.lookup_hebrew_month(month);
	if (month > this.months.length) {
		return this.next().getMonth(month - this.months.length);
	}
	return this.months[month > 0 ? month - 1 : this.months.length + month];
};

Hebcal[prototype].getDay = function getDay(day) {
	if (day > this.length) {
		return null;
	}
	if (day < 0) {
		return this.getDay(this.length - day);
	}
	var rosh = this[find](29, c.months.ELUL)[0].abs() + 1 - this[find](1, c.months.NISAN)[0].abs(); // number of days between Nisan and Tishrei
	if (day <= rosh) {
		return this.getMonth(c.months.NISAN).getDay(day);
	}
	return this.getMonth(c.months.TISHREI).getDay(day - rosh);
};

Hebcal[prototype].days = function days() {
	return [].concat.apply([], this.months.map(function(m){
		return m.days;
	}));
};

Hebcal[prototype].map = function map() {
	return [].map.apply(this.days(), arguments);
};

Hebcal[prototype].filter = function filter() {
	return [].filter.apply(this.days(), arguments);
};

Hebcal[prototype].addHoliday = function addHoliday(holiday) {
	if (!(holiday instanceof holidays.Event)) {
		throw new TypeError('non-Event passed to addHoliday()');
	}
	this.holidays.push(holiday);
	return this;
};

Hebcal[prototype][find] = function find_f(day, month) {
	if (arguments.length === 1) {
		if (typeof day === 'string') {
			return find_f[strings].call(this, day);
		} else if (Array.isArray(day)) {
			return [].concat.apply([], day.map(function(d){
				return this[find][Array.isArray(d) ? 'apply' : 'call'](this, d);
			}, this));
		} else if (day instanceof HDate) {
			return this[find](day.getDate(), day.getMonth());
		} else if (day instanceof Date) {
			return this[find](new HDate(day));
		}
	} else if (arguments.length === 2) {
		if (month instanceof Hebcal[Month]) {
			return month[find](day);
		} else if (Array.isArray(month)) {
			return [].concat.apply([], month.map(function(m){
				return this[find](day, m);
			}, this));
		} else if (typeof month === 'string') {
			return this[find](day,
				month.charCodeAt(0) >= 1488 && month.charCodeAt(0) <= 1514 && /('|")/.test(month) ? c.gematriya(month) :
					month.charCodeAt(0) >= 48 && month.charCodeAt(0) <= 57 /* number */ ? parseInt(month, 10) : c.lookup_hebrew_month(month)
			);
		} else if (typeof month === 'number') {
			return this[find](day, this.getMonth(month));
		}
	}
	return [];
};
Hebcal[prototype][find][strings] = function strings(str) {
	if (!str.split(/\s+/).join('')) {
		return [];
	} else if (strings[str.replace(/\s/g, '_').toLowerCase()]) {
		return strings[str.replace(/\s/g, '_').toLowerCase()].call(this);
	} else if (new HDate(str).getDate()) {
		return this[find](new HDate(str));
	}
	return this[find].apply(this, str.split(/\s+/));
};
Hebcal[prototype][find][strings].rosh_chodesh = function rosh_chodesh() {
	return this[find]('Rosh Chodesh', c.range(1, this.months.length));
};
Hebcal[prototype][find][strings].holidays = function holidays() {
	return [].concat.apply([], this.holidays.map(function(h){
		return this[find](h.date);
	}, this));
};
Hebcal[prototype][find][strings].omer = function omer() {
	return this[find](c.range(15+1, 15+49), c.months.NISAN);
};
Hebcal[prototype][find][strings].today = function today() {
	return this[find](new HDate());
};
Hebcal[prototype][find][strings].yesterday = function yesterday() {
	return [this[find]('today')[0].prev()];
};
Hebcal[prototype][find][strings].tomorrow = function tomorrow() {
	return [this[find]('today')[0].next()];
};
Hebcal[prototype][find][strings].pesach = function pesach() {
	return this[find](c.range(15, 15+8-this.il), c.months.NISAN);
};
Hebcal[prototype][find][strings].sukkot = function sukkot() {
	return this[find](c.range(15, 15+9-this.il), c.months.TISHREI);
};
Hebcal[prototype][find][strings].succot = Hebcal[prototype][find][strings].succos = Hebcal[prototype][find][strings].sukkos = Hebcal[prototype][find][strings].sukkot;
Hebcal[prototype][find][strings].shavuot = function shavuot() {
	return this[find](c.range(6, 7-this.il), c.months.SIVAN);
};
Hebcal[prototype][find][strings].shavuos = Hebcal[prototype][find][strings].shavuot;
Hebcal[prototype][find][strings].rosh_hashana = function rosh_hashana() {
	return this[find](c.range(1, 2), c.months.TISHREI);
};
Hebcal[prototype][find][strings].rosh_hashanah = Hebcal[prototype][find][strings].rosh_hashana;

// Hebcal properties

Hebcal.addZeman = HDate.addZeman;

Hebcal.cities = cities;

Hebcal.range = c.range;

Hebcal.gematriya = c.gematriya;

Hebcal.holidays = c.filter(holidays, ['masks', 'IGNORE_YEAR', 'Event']); // not getHolidaysForYear()

defProp(Hebcal, 'defaultLocation', {
	enumerable: true,
	configurable: true,

	get: function() {
		return HDate.defaultLocation;
	},
	set: function(loc) {
		Hebcal.events.emit('locationChange', HDate.defaultLocation);
		HDate.defaultLocation = loc;
	}
});
defProp(Hebcal, 'defaultCity', {
	enumerable: true,
	configurable: true,

	get: function() {
		return HDate.defaultCity;
	},
	set: function(city) {
		var loc = cities.getLocation(cities.getCity(city));
		Hebcal.defaultLocation = [loc.lat, loc.long]; // call the event
	}
});

defProp(Hebcal, 'candleLighting', {
	enumerable: true,
	configurable: true,

	get: function() {
		return holidays.Event.candleLighting;
	},
	set: function(mins) {
		holidays.Event.candleLighting = mins;
	}
});

defProp(Hebcal, 'havdalah', {
	enumerable: true,
	configurable: true,

	get: function() {
		return holidays.Event.havdalah;
	},
	set: function(mins) {
		holidays.Event.havdalah = mins;
	}
});

// Months

Hebcal[Month] = function Month(month, year) {
	if (typeof month == 'string') {
		month = c.lookup_hebrew_month(month);
	}
	if (typeof month != 'number') {
		throw new TypeError('month to Hebcal.Month is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TypeError('year to Hebcal.Month is not a number');
	}
	this.month = month;
	this.year = year;

	this.days = c.range(1, c.max_days_in_heb_month(month, year)).map(function(i){
		var d = new HDate(i, month, year);
		defProp(d, '__month', {
			configurable: true,
			writable: true,
			value: this
		});
		return d;
	}, this);

	this.length = this.days.length;

	defProp(this, 'il', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getDay(1).il;
		},
		set: function(il) {
			this.days.forEach(function(d){
				d.il = il;
			});
		}
	});

	defProp(this, 'lat', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getDay(1).lat;
		},
		set: function(lat) {
			this.days.forEach(function(d){
				d.lat = lat;
			});
		}
	});
	defProp(this, 'long', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getDay(1).long;
		},
		set: function(lon) {
			this.days.forEach(function(d){
				d.long = lon;
			});
		}
	});

	return this;
};

Hebcal[Month][prototype].isLeapYear = function isLeapYear() {
	return c.LEAP_YR_HEB(this.year);
};

Hebcal[Month][prototype].prev = function prev() {
	if (this.month === 1) { // Nisan
		return this.getYearObject().getMonth(-1);
	} else if (this.month === c.months.TISHREI) {
		return this.getYearObject().prev().getMonth(c.months.ELUL);
	} else {
		return this.getYearObject().getMonth(this.month - 1);
	}
};

Hebcal[Month][prototype].next = function next() {
	if (this.month === c.MONTHS_IN_HEB(this.year)) { // Adar
		return this.getYearObject().getMonth(1);
	} else if (this.month === c.months.ELUL) {
		return this.getYearObject().next().getMonth(c.months.TISHREI);
	} else {
		return this.getYearObject().getMonth(this.month + 1);
	}
};

Hebcal[Month][prototype].getDay = function getDay(day) {
	day = typeof day === 'number' ? day :
		day.charCodeAt(0) >= 1488 && day.charCodeAt(0) <= 1514 && /('|")/.test(day) ? c.gematriya(day) : parseInt(day, 10); // gematriya or number string
	if (day > this.days.length) {
		return this.next().getDay(day - this.days.length);
	}
	return this.days[day > 0 ? day - 1 : this.days.length + day];
};

Hebcal[Month][prototype].getYearObject = function getYearObject() {
	return this.__year || new Hebcal(this.year);
};

Hebcal[Month][prototype].getName = function getName(o) {
	return c.LANGUAGE(c.monthNames[+this.isLeapYear()][this.month],o);
};

Hebcal[Month][prototype].rosh_chodesh = function rosh_chodesh() {
	var prev = this.prev();
	return prev.length === 30 ? [prev.getDay(-1), this.getDay(1)] : [this.getDay(1)];
};

Hebcal[Month][prototype].setCity = function setCity(city) {
	this.days.forEach(function(d){
		d.setCity(city);
	});
	return this;
};

Hebcal[Month][prototype].setLocation = function setLocation(lat, lon) {
	this.days.forEach(function(d){
		d.setLocation(lat, lon);
	});
	return this;
};

Hebcal[Month][prototype].map = function map() {
	return [].map.apply(this.days, arguments);
};

Hebcal[Month][prototype][find] = function find_f(day) {
	if (typeof day === 'number') {
		return [this.getDay(day)];
	} else if (typeof day === 'string') {
		return find_f[strings].call(this, day);
	} else if (Array.isArray(day)) {
		return [].concat.apply([], day.map(function(d){
			return this[find](d);
		}, this));
	} else if (day instanceof HDate && day.getFullYear() === this.year && day.getMonth() === this.month) {
		return this[find](day.getDate());
	} else if (day instanceof Date) {
		return this[find](new HDate(day));
	}
	return [];
};
Hebcal[Month][prototype][find][strings] = function strings(str) {
	if (strings[str.replace(/\s/g, '_').toLowerCase()]) {
		return strings[str.replace(/\s/g, '_').toLowerCase()].call(this);
	} else if (new HDate(str).getDate()) {
		return this[find](new HDate(str));
	}
	var num = str.charCodeAt(0) >= 1488 && str.charCodeAt(0) <= 1514 && /('|")/.test(str) ? c.gematriya(str) :
		str.charCodeAt(0) >= 48 && str.charCodeAt(0) <= 57 /* number */ ? parseInt(str, 10) : null;
	return num ? this[find](num) : [];
};
Hebcal[Month][prototype][find][strings].rosh_chodesh = function rosh_chodesh() {
	return this.rosh_chodesh();
};
Hebcal[Month][prototype][find][strings].shabbat_mevarchim = function shabbat_mevarchim() {
	return this.month === c.months.ELUL ? [] : // No birchat hachodesh in Elul
		this[find](this.getDay(29).onOrBefore(c.days.SAT));
};
Hebcal[Month][prototype][find][strings].shabbos_mevarchim = Hebcal[Month][prototype][find][strings].shabbos_mevorchim = Hebcal[Month][prototype][find][strings].shabbat_mevarchim;

// HDate days

Hebcal.HDate = HDate;

HDate[prototype].getMonthObject = function getMonthObject() {
	return this.__month || new Hebcal[Month](this.getMonth(), this.getFullYear());
};

HDate[prototype].getYearObject = function getYearObject() {
	return this.getMonthObject().getYearObject();
};

var HDatePrev = HDate[prototype].prev; // slightly less overhead when using unaffiliated HDate()s
HDate[prototype].prev = function prev() {
	if (!this.__month) {
		return HDatePrev.call(this);
	}
	if (this.getMonth() === c.months.TISHREI && this.getDate() === 1) { // 1st day RH
		return this.getMonthObject().prev().getDay(-1);
	} else {
		var g = this.greg();
		g.setDate(g.getDate() - 1);
		return this.getYearObject()[find](g)[0];
	}
};

var HDateNext = HDate[prototype].next;
HDate[prototype].next = function next() {
	if (!this.__month) {
		return HDateNext.call(this);
	}
	if (this.getMonth() === c.months.ELUL && this.getDate() === this.getMonthObject().length) { // last day
		return this.getMonthObject().next().getDay(1);
	} else {
		var g = this.greg();
		g.setDate(g.getDate() + 1);
		return this.getYearObject()[find](g)[0];
	}
};

HDate[prototype].getSedra = function getSedra(o) {
	return (new Sedra(this.getFullYear(), this.il)).getFromHDate(this).map(function(p){
		return c.LANGUAGE(p, o);
	});
};

HDate[prototype].holidays = function holidays() {
	return this.getYearObject().holidays.filter(function(h){
		return this.isSameDate(h.date);
	}, this).map(function(h){
		h.date.setLocation(this);
		return h;
	}, this);
};

HDate[prototype].omer = function omer() {
	if (this.greg().getTime() > new HDate(15, c.months.NISAN, this.getFullYear()).greg().getTime() &&
		this.greg().getTime() < new HDate( 6, c.months.SIVAN, this.getFullYear()).greg().getTime()) {
		return this.abs() - new HDate(16, c.months.NISAN, this.getFullYear()).abs() + 1;
	}
	return 0;
};

HDate[prototype].dafyomi = function daf(o) {
	return dafyomi.dafname(dafyomi.dafyomi(this.greg()), o);
};

HDate[prototype].tachanun = (function() {
	var NONE      = tachanun.NONE      = 0,
		MINCHA    = tachanun.MINCHA    = 1,
		SHACHARIT = tachanun.SHACHARIT = 2,
		ALL_CONGS = tachanun.ALL_CONGS = 4;

	var __cache = {
		all: {},
		some: {},
		il: {}
	};

	function tachanun() {
		var checkPrev = !arguments[0];

		var year = (this.getMonthObject() && this.getYearObject()) || new Hebcal(this.getFullYear());

		var all = __cache.il[year.year] === this.il && __cache.all[year.year] || (__cache.all[year.year] = year[find]('Rosh Chodesh').concat(
			year[find](c.range(1, c.max_days_in_heb_month(c.months.NISAN, this.getFullYear())), c.months.NISAN), // all of Nisan
			year[find](15 + 33, c.months.NISAN), // Lag Baomer
			year[find](c.range(1, 8 - this.il), c.months.SIVAN), // Rosh Chodesh Sivan thru Isru Chag
			year[find]([9, 15], c.months.AV), // Tisha B'av and Tu B'av
			year[find](-1, c.months.ELUL), // Erev Rosh Hashanah
			year[find]([1, 2], c.months.TISHREI), // Rosh Hashanah
			year[find](c.range(9, 24 - this.il), c.months.TISHREI), // Erev Yom Kippur thru Isru Chag
			year[find](c.range(25, 33), c.months.KISLEV), // Chanukah
			year[find](15, c.months.SHVAT), // Tu B'shvat
			year[find]([14, 15], year.isLeapYear() ? [c.months.ADAR_I, c.months.ADAR_II] : c.months.ADAR_I) // Purim/Shushan Purim + Katan
		)), some = __cache.il[year.year] === this.il && __cache.some[year.year] || (__cache.some[year.year] = [].concat( // Don't care if it overlaps days in all, because all takes precedence
			year[find](c.range(1, 13), c.months.SIVAN), // Until 14 Sivan
			year[find](c.range(20, 31), c.months.TISHREI), // Until after Rosh Chodesh Cheshvan
			year[find](14, c.months.IYYAR), // Pesach Sheini
			year.holidays.filter(function(h){return c.LANGUAGE(h.desc, 's') == 'Yom HaAtzma\'ut'})[0].date, // Yom HaAtzma'ut, which changes based on day of week
			year[find](29, c.months.IYYAR) // Yom Yerushalayim
		));
		__cache.il[year.year] = this.il;

		all = c.filter(all.map(function(d){
			return this.isSameDate(d);
		}, this), true).length;
		some = c.filter(some.map(function(d){
			return this.isSameDate(d);
		}, this), true).length;

		if (all) {
			return NONE;
		}
		if (checkPrev) {
			return (!some && ALL_CONGS) | (this.getDay() != 6 && SHACHARIT) | ((this.next().tachanun(true) & SHACHARIT) && MINCHA);
		}
		return (!some && ALL_CONGS) | (this.getDay() != 6 && SHACHARIT) | (this.getDay() != 5 && MINCHA);
	}
	return tachanun;
})();

HDate[prototype].hallel = (function() {
	var NONE  = hallel.NONE  = 0,
		HALF  = hallel.HALF  = 1,
		WHOLE = hallel.WHOLE = 2;

	var __cache = {
		whole: {},
		half: {},
		il: {}
	};

	function hallel() {
		var year = (this.getMonthObject() && this.getYearObject()) || new Hebcal(this.getFullYear());

		var whole = __cache.il[year.year] === this.il && __cache.whole[year.year] || (__cache.whole[year.year] = [].concat(
			year[find](c.range(25, 33), c.months.KISLEV), // Chanukah
			year[find]([15, this.il ? null : 16], c.months.NISAN), // First day(s) of Pesach
			year[find]('Shavuot'),
			year[find]('Sukkot'),
			year.holidays.filter(function(h){return c.LANGUAGE(h.desc, 's') == 'Yom HaAtzma\'ut'})[0].date, // Yom HaAtzma'ut, which changes based on day of week
			year[find](29, c.months.IYYAR) // Yom Yerushalayim
		));
		var half = __cache.il[year.year] === this.il && __cache.half[year.year] || (__cache.half[year.year] = [].concat(
			year[find]('Rosh Chodesh').filter(function(rc){return rc.getMonth() !== c.months.TISHREI}), // Rosh Chodesh, but not Rosh Hashanah
			year[find](c.range(17 - this.il, 23 - this.il), c.months.NISAN) // Last six days of Pesach
		));
		__cache.il[year.year] = this.il;

		return (c.filter(whole.map(function(d){
			return this.isSameDate(d);
		}, this), true).length && WHOLE) || (c.filter(half.map(function(d){
			return this.isSameDate(d);
		}, this), true).length && HALF) || NONE;
	}
	return hallel;
})();

// Events

(function(events){
	var refreshInterval, refresh, today = new HDate();

	defProp(events, 'refreshInterval', {
		configurable: true,
		enumerable: true,

		get: function() {
			return refreshInterval;
		},
		set: function(ms) {
			if (refresh) {
				refresh = clearInterval(refresh);
			}
			refreshInterval = ms;
			if (ms) {
				refresh = setInterval(checkTimes, ms);
			}
		}
	});

	events.beforeZeman = 1000 * 60 * 10; // 10 minutes

	function checkTimes() {
		var now = new HDate();

		if (!today.isSameDate(now)) {
			events.emit('dayChange');
			today = now;
		}

		var nowGreg = new Date(), almostTime = c.filter(c.map(now.getZemanim(), function(time){
			return time - nowGreg;
		}), function(time) {
			return time > 0 && time - events.beforeZeman < 0;
		}), customTimes = c.filter(c.map(events.customs, function(time){
			return time - nowGreg;
		}), function(time) {
			return time > 0 && time - events.refreshInterval < 0;
		});
		for (var zeman in almostTime) {
			events.emit('almostZeman', zeman, almostTime[zeman]);
			if (almostTime[zeman] < events.refreshInterval) {
				events.emit('atZeman', zeman);
			}
		}
		for (var custom in customTimes) {
			events.emit('custom', custom);
		}
	}
	checkTimes();

	events.refreshInterval = 1000 * 60 * 5; // 5 minutes
	// set the interval

	events.customs = {};
})(Hebcal.events = new EventEmitter());

// Gregorian years

Hebcal.GregYear = function GregYear(year, month) {
	if (!year) {
		year = (new Date).getFullYear();
	}
	if (typeof year === 'string') {
		var d = new Date(year);
		month = year.indexOf(' ') + 1 || year.indexOf('-') + 1 || year.indexOf('/') + 1 ? d.getMonth() + 1 : c.range(1, 12);
		// Check if a month was passed in the string. Can't just check for default January, because a real January might have been passed.
		return new Hebcal.GregYear(d.getFullYear(), month);
	}
	if (typeof year !== 'number') {
		throw new TypeError('year to Hebcal.GregYear() is not a number');
	}
	this.year = year;

	if (month) {
		if (typeof month === 'string') { // month name
			month = greg.lookupMonthName(month);
		}
		if (typeof month === 'number') {
			month = [month];
		}

		if (Array.isArray(month)) {
			this.months = month.map(function(i){
				var m = new Hebcal.GregMonth(i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: this
				});
				return m;
			}, this);
		} else {
			throw new TypeError('month to Hebcal.GregYear() is not a valid type');
		}
	} else {
		return new Hebcal.GregYear(year, c.range(1, 12));
	}

	this.hebyears = [].concat.apply([], this.months.map(function(m){
		return m.hebmonths.map(function(hm){
			return hm.year;
		});
	})).filter(function(val, i, arr){
		return arr.indexOf(val) === i; // keep unique values only
	});

	this.holidays = holidays.getHolidaysForYear(this.hebyears[0]).filter(function(h){
		return h.date.greg().getFullYear() === year && this.months.filter(function(m){ // don't keep ones that are out of bounds
			return m.month === h.date.greg().getMonth() + 1;
		}).length;
	}, this);
	if (this.hebyears[1]) {
		this.holidays = this.holidays.concat(holidays.getHolidaysForYear(this.hebyears[1]).filter(function(h){
			return h.date.greg().getFullYear() === year && this.months.filter(function(m){ // don't keep ones that are out of bounds
				return m.month === h.date.greg().getMonth() + 1;
			}).length;
		}, this));
	}

	this.length = 365 + greg.LEAP(year);

	defProp(this, 'il', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getMonth(1).il;
		},
		set: function(il) {
			this.months.forEach(function(m){
				m.il = il;
			});
		}
	});

	defProp(this, 'lat', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getMonth(1).lat;
		},
		set: function(lat) {
			this.months.forEach(function(m){
				m.lat = lat;
			});
		}
	});
	defProp(this, 'long', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getMonth(1).long;
		},
		set: function(lon) {
			this.months.forEach(function(m){
				m.long = lon;
			});
		}
	});

	return this;
};

Hebcal.GregYear[prototype].isLeapYear = function isLeapYear() {
	return this.length === 366;
};

Hebcal.GregYear[prototype].setCity = Hebcal[prototype].setCity;
Hebcal.GregYear[prototype].setLocation = Hebcal[prototype].setLocation;

Hebcal.GregYear[prototype].next = function next() {
	return new Hebcal.GregYear(this.year + 1);
};

Hebcal.GregYear[prototype].prev = function prev() {
	return new Hebcal.GregYear(this.year - 1);
};

Hebcal.GregYear[prototype].getMonth = function getMonth(month) {
	month = typeof month === 'number' ? month : greg.lookupMonthNum(month);
	if (month > this.months.length) {
		return this.next().getMonth(month - this.months.length);
	}
	return this.months[month > 0 ? month - 1 : this.months.length + month];
};

Hebcal.GregYear[prototype].days = Hebcal[prototype].days;
Hebcal.GregYear[prototype].map = Hebcal[prototype].map;
Hebcal.GregYear[prototype].filter = Hebcal[prototype].filter;

Hebcal.GregYear[prototype].addHoliday = Hebcal[prototype].addHoliday;

Hebcal.GregMonth = function GregMonth(month, year) {
	if (typeof month == 'string') {
		month = greg.lookupMonthNum(month);
	}
	if (typeof month != 'number') {
		throw new TypeError('month to Hebcal.GregMonth is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TypeError('year to Hebcal.GregMonth is not a number');
	}

	this.year = year;
	this.month = month;

	this.days = c.range(1, greg.daysInMonth(month, year)).map(function(i){
		var d = new HDate(new Date(year, month - 1, i));
		defProp(d, '__gregmonth', {
			configurable: true,
			writable: true,
			value: this
		});
		return d;
	}, this);

	this.length = this.days.length;

	this.hebmonths = [
		{month: this.getDay( 1).getMonth(), year: this.getDay( 1).getFullYear()},
		{month: this.getDay(-1).getMonth(), year: this.getDay(-1).getFullYear()}
	].filter(function(val, i, arr){
		return i === 0 || val.month !== arr[0].month;
	});

	defProp(this, 'il', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getDay(1).il;
		},
		set: function(il) {
			this.days.forEach(function(d){
				d.il = il;
			});
		}
	});

	defProp(this, 'lat', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getDay(1).lat;
		},
		set: function(lat) {
			this.days.forEach(function(d){
				d.lat = lat;
			});
		}
	});
	defProp(this, 'long', {
		enumerable: true,
		configurable: true,

		get: function() {
			return this.getDay(1).long;
		},
		set: function(lon) {
			this.days.forEach(function(d){
				d.long = lon;
			});
		}
	});

	return this;
};

Hebcal.GregMonth[prototype].isLeapYear = function isLeapYear() {
	return greg.LEAP(this.year);
};

Hebcal.GregMonth[prototype].prev = function prev() {
	if (this.month === 1) {
		return this.getYearObject().prev().getMonth(-1);
	} else {
		return this.getYearObject().getMonth(this.month - 1);
	}
};

Hebcal.GregMonth[prototype].next = function next() {
	return this.getYearObject().getMonth(this.month + 1);
};

Hebcal.GregMonth[prototype].getDay = function getDay(day) {
	if (day > this.days.length) {
		return this.next().getDay(day - this.days.length);
	}
	return this.days[day > 0 ? day - 1 : this.days.length + day];
};

Hebcal.GregMonth[prototype].getYearObject = function getYearObject() {
	return this.__year || new Hebcal.GregYear(this.year);
};

Hebcal.GregMonth[prototype].getName = function getName() {
	return greg.monthNames[this.month];
};

Hebcal.GregMonth[prototype].setCity = Hebcal[Month][prototype].setCity;
Hebcal.GregMonth[prototype].setLocation = Hebcal[Month][prototype].setLocation;

Hebcal.GregMonth[prototype].map = Hebcal[Month][prototype].map;

HDate[prototype].getGregMonthObject = function getGregMonthObject() {
	return this.__gregmonth || new Hebcal.GregMonth(this.greg().getMonth(), this.greg().getFullYear());
};

HDate[prototype].getGregYearObject = function getGregYearObject() {
	return this.getGregMonthObject().getYearObject();
};

module.exports = Hebcal;