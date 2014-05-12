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

	Danny Sadinoff can be reached at danny@sadinoff.com

	Michael Radwin has made significant contributions as a result of
	maintaining hebcal.com.

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter.
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
	TE = TypeError,
	find = 'find',
	strings = 'strings',
	Month = 'Month',
	GregYear = 'GregYear',
	GregMonth = 'GregMonth',
	getYearObject = 'getYearObject',
	map = 'map',
	getDay = 'getDay',
	getMonth = 'getMonth',
	getFullYear = 'getFullYear',
	isLeapYear = 'isLeapYear',
	length = 'length',
	next = 'next',
	prev = 'prev',
	months = c.months,
	TISHREI = months.TISHREI,
	NISAN = months.NISAN;

function getset(g, s) {
	return {
		enumerable: true,
		configurable: true,

		get: g,
		set: s
	};
}

// Main Hebcal function

function Hebcal(year, month) {
	if (!year) {
		year = (new HDate())[getFullYear](); // this year;
	}
	if (typeof year !== 'number') {
		throw new TE('year to Hebcal() is not a number');
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
			this.months = month[map](function(i){
				var m = new Hebcal[Month](i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: this
				});
				return m;
			}, this);

			this.holidays = [].concat.apply([], this.months[map](function(m){return m.holidays}));
		} else {
			throw new TE('month to Hebcal is not a valid type');
		}
	} else {
		return new Hebcal(year, c.range(1, c.MONTHS_IN_HEB(year)));
	}

	this[length] = c.days_in_heb_year(year);

	defProp(this, 'il', getset(function() {
		return this[getMonth](1).il;
	}, function(il) {
		this.months.forEach(function(m){
			m.il = il;
		});
	}));

	defProp(this, 'lat', getset(function() {
		return this[getMonth](1).lat;
	}, function(lat) {
		this.months.forEach(function(m){
			m.lat = lat;
		});
	}));
	defProp(this, 'long', getset(function() {
		return this[getMonth](1).long;
	}, function(lon) {
		this.months.forEach(function(m){
			m.long = lon;
		});
	}));
}

Hebcal[prototype][isLeapYear] = HDate[prototype][isLeapYear];

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

Hebcal[prototype][next] = function next() {
	return new Hebcal(this.year + 1);
};

Hebcal[prototype][prev] = function prev() {
	return new Hebcal(this.year - 1);
};

Hebcal[prototype][getMonth] = function getMonth(month) {
	month = c.monthNum(month);
	if (month > this.months[length]) {
		return this[next]()[getMonth](month - this.months[length]);
	}
	return this.months[month > 0 ? month - 1 : this.months[length] + month];
};

Hebcal[prototype][getDay] = function getDay(day) {
	if (day > this[length]) {
		return null;
	}
	if (day < 0) {
		return this[getDay](this[length] - day);
	}
	var rosh = this[find](29, months.ELUL)[0].abs() + 1 - this[find](1, NISAN)[0].abs(); // number of days between Nisan and Tishrei
	if (day <= rosh) {
		return this[getMonth](NISAN)[getDay](day);
	}
	return this[getMonth](TISHREI)[getDay](day - rosh);
};

Hebcal[prototype].days = function days() {
	return [].concat.apply([], this.months[map](function(m){
		return m.days;
	}));
};

Hebcal[prototype][map] = function() {
	return [][map].apply(this.days(), arguments);
};

Hebcal[prototype].filter = function filter() {
	return [].filter.apply(this.days(), arguments);
};

Hebcal[prototype].addHoliday = function addHoliday(holiday) {
	if (!(holiday instanceof holidays.Event)) {
		throw new TE('non-Event passed to addHoliday()');
	}
	this.holidays.push(holiday);
	return this;
};

Hebcal[prototype].findParsha = function findParsha(parsha, o) {
	var days = this.filter(function(d){
		return d.getSedra(o).indexOf(parsha) + 1;
	});
	return days[days[length] - 1];
};
Hebcal[prototype].findSedra = Hebcal[prototype].findParsha;

Hebcal[prototype][find] = function find_f(day, month) {
	if (arguments[length] === 1) {
		if (typeof day === 'string') {
			return find_f[strings].call(this, day);
		} else if (Array.isArray(day)) {
			return [].concat.apply([], day[map](function(d){
				return this[find][Array.isArray(d) ? 'apply' : 'call'](this, d);
			}, this));
		} else if (day instanceof HDate) {
			return this[find](day.getDate(), day[getMonth]());
		} else if (day instanceof Date) {
			return this[find](new HDate(day));
		}
	} else if (arguments[length] === 2) {
		if (month instanceof Hebcal[Month]) {
			return month[find](day);
		} else if (Array.isArray(month)) {
			return [].concat.apply([], month[map](function(m){
				return this[find](day, m);
			}, this));
		} else if (typeof month === 'string') {
			return this[find](day, c.monthNum(month));
		} else if (typeof month === 'number') {
			return this[find](day, this[getMonth](month));
		}
	}
	return [];
};
Hebcal[prototype][find][strings] = function strings(str) {
	var split = str.split(/\s+/);
	if (!split[length]) {
		return [];
	} else if (strings[str.replace(/\s/g, '_').toLowerCase()]) {
		return strings[str.replace(/\s/g, '_').toLowerCase()].call(this);
	}
	try {
		return this[find](new HDate(str));
	} catch(e) {
		return split[length] - 1 ? this[find].apply(this, split) : [];
	}
};
Hebcal[prototype][find][strings].rosh_chodesh = function rosh_chodesh() {
	return this[find]('Rosh Chodesh', c.range(1, this.months[length]));
};
Hebcal[prototype][find][strings].holidays = function holidays() {
	return [].concat.apply([], this.holidays[map](function(h){
		return this[find](h.date);
	}, this));
};
Hebcal[prototype][find][strings].omer = function omer() {
	return this[find](c.range(15+1, 15+49), NISAN);
};
Hebcal[prototype][find][strings].today = function today() {
	return this[find](new HDate());
};
Hebcal[prototype][find][strings].yesterday = function yesterday() {
	return [this[find]('today')[0][prev]()];
};
Hebcal[prototype][find][strings].tomorrow = function tomorrow() {
	return [this[find]('today')[0][next]()];
};
Hebcal[prototype][find][strings].pesach = function pesach() {
	return this[find](c.range(15, 15+8-this.il), NISAN);
};
Hebcal[prototype][find][strings].sukkot = function sukkot() {
	return this[find](c.range(15, 15+9-this.il), TISHREI);
};
Hebcal[prototype][find][strings].succot = Hebcal[prototype][find][strings].succos = Hebcal[prototype][find][strings].sukkos = Hebcal[prototype][find][strings].sukkot;
Hebcal[prototype][find][strings].shavuot = function shavuot() {
	return this[find](c.range(6, 7-this.il), months.SIVAN);
};
Hebcal[prototype][find][strings].shavuos = Hebcal[prototype][find][strings].shavuot;
Hebcal[prototype][find][strings].rosh_hashana = function rosh_hashana() {
	return this[find](c.range(1, 2), TISHREI);
};
Hebcal[prototype][find][strings].rosh_hashanah = Hebcal[prototype][find][strings].rosh_hashana;

// Hebcal properties

Hebcal.addZeman = HDate.addZeman;

Hebcal.cities = cities;

Hebcal.range = c.range;

Hebcal.gematriya = c.gematriya;

Hebcal.holidays = c.filter(holidays, ['masks', 'Event']); // not year(), atzmaut()

Hebcal.parshiot = Sedra.parshiot;

Hebcal.LANGUAGE = c.LANGUAGE;

Hebcal[map] = c[map];

Hebcal.filter = c.filter;

defProp(Hebcal, 'defaultLocation', getset(function(){
	return HDate.defaultLocation;
}, function(loc){
	Hebcal.events.emit('locationChange', HDate.defaultLocation);
	HDate.defaultLocation = loc;
}));
defProp(Hebcal, 'defaultCity', getset(function(){
	return HDate.defaultCity;
}, function(city){
	Hebcal.defaultLocation = cities.getCity(city).slice(0, 2); // call the event
}));

defProp(Hebcal, 'candleLighting', getset(function(){
	return holidays.Event.candleLighting;
}, function(mins){
	holidays.Event.candleLighting = mins;
}));

defProp(Hebcal, 'havdalah', getset(function(){
	return holidays.Event.havdalah;
}, function(mins){
	holidays.Event.havdalah = mins;
}));

// Months

Hebcal[Month] = function Month(month, year) {
	month = c.monthNum(month);
	if (typeof month != 'number') {
		throw new TE('month to Hebcal.Month is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TE('year to Hebcal.Month is not a number');
	}
	this.month = month;
	this.year = year;

	this.days = c.range(1, c.max_days_in_heb_month(month, year))[map](function(i){
		var d = new HDate(i, month, year);
		defProp(d, '__month', {
			configurable: true,
			writable: true,
			value: this
		});
		return d;
	}, this);

	this[length] = this.days[length];

	this.holidays = holidays.year(year).filter(function(h){
		return h.date[getMonth]() === month;
	}, this);

	defProp(this, 'il', getset(function(){
		return this[getDay](1).il;
	}, function(il){
		this.days.forEach(function(d){
			d.il = il;
		});
	}));

	defProp(this, 'lat', getset(function(){
		return this[getDay](1).lat;
	}, function(lat){
		this.days.forEach(function(d){
			d.lat = lat;
		});
	}));
	defProp(this, 'long', getset(function(){
		return this[getDay](1).long;
	}, function(lon){
		this.days.forEach(function(d){
			d.long = lon;
		});
	}));

	return this;
};

Hebcal[Month][prototype][isLeapYear] = HDate[prototype][isLeapYear];

Hebcal[Month][prototype][prev] = function() {
	if (this.month === 1) { // Nisan
		return this[getYearObject]()[getMonth](-1);
	} else if (this.month === TISHREI) {
		return this[getYearObject]()[prev]()[getMonth](months.ELUL);
	} else {
		return this[getYearObject]()[getMonth](this.month - 1);
	}
};

Hebcal[Month][prototype][next] = function() {
	if (this.month === c.MONTHS_IN_HEB(this.year)) { // Adar
		return this[getYearObject]()[getMonth](1);
	} else if (this.month === months.ELUL) {
		return this[getYearObject]()[next]()[getMonth](TISHREI);
	} else {
		return this[getYearObject]()[getMonth](this.month + 1);
	}
};

Hebcal[Month][prototype][getDay] = function(day) {
	day = c.dayYearNum(day);
	if (day > this.days[length]) {
		return this[next]()[getDay](day - this.days[length]);
	}
	return this.days[day > 0 ? day - 1 : this.days[length] + day];
};

Hebcal[Month][prototype][getYearObject] = function getYearObject() {
	return this.__year || new Hebcal(this.year);
};

Hebcal[Month][prototype].getName = function getName(o) {
	return c.LANGUAGE(c.monthNames[+this[isLeapYear]()][this.month], o);
};

Hebcal[Month][prototype].rosh_chodesh = function rosh_chodesh() {
	var prevMonth = this[prev]();
	return prevMonth[length] === 30 ? [prevMonth[getDay](-1), this[getDay](1)] : [this[getDay](1)];
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

Hebcal[Month][prototype][map] = function() {
	return [][map].apply(this.days, arguments);
};

Hebcal[Month][prototype].molad = function() {
	console.warn('this method is broken!');
	var retMolad = {}, year, m_elapsed, p_elapsed, h_elapsed, parts, m_adj;

    m_adj = this.month - 7;
	year = this.year - 1;
    if (m_adj < 0) {
		m_adj += c.MONTHS_IN_HEB(year + 1);
	}
	console.log(m_adj, year)

    m_elapsed = parseInt(m_adj +
        235 * (year / 19)/* +
        12 * (year % 19) +
        (((year % 19) * 7) + 1) / 19*/);
		console.log(m_elapsed)

    p_elapsed = parseInt(204 + (793 * (m_elapsed % 1080)));
	console.log(p_elapsed)

    h_elapsed = parseInt(5 + (12 * m_elapsed) +
        793 * (m_elapsed / 1080)/* +
        p_elapsed / 1080*/ -
        6);
		console.log(h_elapsed)

    parts = parseInt((p_elapsed % 1080) + 1080 * (h_elapsed % 24));
	console.log(parts)

    retMolad.day = parseInt(1 + 29 * m_elapsed + h_elapsed / 24);
    retMolad.hour = Math.round(h_elapsed % 24);
    retMolad.chalakim = parseInt(parts % 1080);

    return retMolad;
};

Hebcal[Month][prototype][find] = function find_f(day) {
	if (typeof day === 'number') {
		return [this[getDay](day)];
	} else if (typeof day === 'string') {
		return find_f[strings].call(this, day);
	} else if (Array.isArray(day)) {
		return [].concat.apply([], day[map](function(d){
			return this[find](d);
		}, this));
	} else if (day instanceof HDate && day[getFullYear]() === this.year && day[getMonth]() === this.month) {
		return this[find](day.getDate());
	} else if (day instanceof Date) {
		return this[find](new HDate(day));
	}
	return [];
};
Hebcal[Month][prototype][find][strings] = function strings(str) {
	if (strings[str.replace(/\s/g, '_').toLowerCase()]) {
		return strings[str.replace(/\s/g, '_').toLowerCase()].call(this);
	}
	try {
		return this[find](new HDate(str));
	} catch(e) {
		var num = c.dayYearNum(str);
		return num ? this[find](num) : [];
	}
};
Hebcal[Month][prototype][find][strings].rosh_chodesh = function rosh_chodesh() {
	return this.rosh_chodesh();
};
Hebcal[Month][prototype][find][strings].shabbat_mevarchim = function shabbat_mevarchim() {
	return this.month === months.ELUL ? [] : // No birchat hachodesh in Elul
		this[find](this[getDay](29).onOrBefore(c.days.SAT));
};
Hebcal[Month][prototype][find][strings].shabbos_mevarchim = Hebcal[Month][prototype][find][strings].shabbos_mevorchim = Hebcal[Month][prototype][find][strings].shabbat_mevarchim;

// HDate days

Hebcal.HDate = HDate;

HDate[prototype].getMonthObject = function getMonthObject() {
	return this.__month || new Hebcal[Month](this[getMonth](), this[getFullYear]());
};

HDate[prototype][getYearObject] = function() {
	return this.getMonthObject()[getYearObject]();
};

(function(){
	var orig = {}; // slightly less overhead when using unaffiliated HDate()s
	[prev, next].forEach(function(func){
		orig[func] = HDate[prototype][func];
		HDate[prototype][func] = function() {
			var day = orig[func].call(this);
			if (!this.__month) {
				return day;
			}
			return this[getYearObject]()[find](day)[0];
		};
	});
})();

HDate[prototype].getSedra = (function(){
	var __cache = {};

	return function(o) {
		var sedraYear = __cache[this[getFullYear]()];
		if (!sedraYear || (sedraYear.il != this.il)) {
			sedraYear = __cache[this[getFullYear]()] = new Sedra(this[getFullYear](), this.il);
		}
		return sedraYear.get(this)[map](function(p){
			return c.LANGUAGE(p, o);
		});
	}
})();
HDate[prototype].getParsha = HDate[prototype].getSedra;

HDate[prototype].holidays = function(all) {
	return this[getYearObject]().holidays.filter(function(h){
		return this.isSameDate(h.date) && (all ? true : !h.routine() && h.is(this));
	}, this)[map](function(h){
		h.date.setLocation(this);
		return h;
	}, this);
};

['candleLighting', 'havdalah'].forEach(function(prop){
	HDate[prototype][prop] = function(){
		var hd = this.holidays(true).filter(function(h){
			return h.is(this);
		}, this);
		if (hd.length) {
			hd = c.filter(hd.map(function(h){
				return h[prop]();
			}), true);
		}
		return hd.length ? new Date(Math.max.apply(null, hd)) : null;
	};
});

HDate[prototype].omer = function omer() {
	if (this.greg().getTime() > new HDate(15, NISAN, this[getFullYear]()).greg().getTime() &&
		this.greg().getTime() < new HDate( 6, months.SIVAN, this[getFullYear]()).greg().getTime()) {
		return this.abs() - new HDate(16, NISAN, this[getFullYear]()).abs() + 1;
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
		var checkNext = !arguments[0];

		var year = this[getYearObject](), y = this[getFullYear]();

		var all = __cache.il[year.year] === this.il && __cache.all[year.year] || (__cache.all[year.year] = year[find]('Rosh Chodesh').concat(
			year[find](c.range(1, c.max_days_in_heb_month(NISAN, y)), NISAN), // all of Nisan
			year[find](15 + 33, NISAN), // Lag Baomer
			year[find](c.range(1, 8 - this.il), months.SIVAN), // Rosh Chodesh Sivan thru Isru Chag
			year[find]([9, 15], months.AV), // Tisha B'av and Tu B'av
			year[find](-1, months.ELUL), // Erev Rosh Hashanah
			year[find]([1, 2], TISHREI), // Rosh Hashanah
			year[find](c.range(9, 24 - this.il), TISHREI), // Erev Yom Kippur thru Isru Chag
			year[find](c.range(25, 33), months.KISLEV), // Chanukah
			year[find](15, months.SHVAT), // Tu B'shvat
			year[find]([14, 15], year[isLeapYear]() ? [months.ADAR_I, months.ADAR_II] : months.ADAR_I) // Purim/Shushan Purim + Katan
		)[map](function(d){
			return d.abs();
		})), some = __cache.il[year.year] === this.il && __cache.some[year.year] || (__cache.some[year.year] = [].concat( // Don't care if it overlaps days in all, because all takes precedence
			year[find](c.range(1, 13), months.SIVAN), // Until 14 Sivan
			year[find](c.range(20, 31), TISHREI), // Until after Rosh Chodesh Cheshvan
			year[find](14, months.IYYAR), // Pesach Sheini
			holidays.atzmaut(y)[1] || [], // Yom HaAtzma'ut, which changes based on day of week
			y >= 5727 ? year[find](29, months.IYYAR) : [] // Yom Yerushalayim
		)[map](function(d){
			return d.abs();
		}));
		__cache.il[year.year] = this.il;

		all = all.indexOf(this.abs()) > -1;
		some = some.indexOf(this.abs()) > -1;

		if (all) {
			return NONE;
		}
		var ret = (!some && ALL_CONGS) | (this[getDay]() != 6 && SHACHARIT);
		if (checkNext) {
			ret |= ((this[next]().tachanun(true) & SHACHARIT) && MINCHA);
		} else {
			ret |= (this[getDay]() != 5 && MINCHA);
		}
		return ret == ALL_CONGS ? NONE : ret;
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
		var year = this[getYearObject]();

		var whole = __cache.il[year.year] == this.il && __cache.whole[year.year] || (__cache.whole[year.year] = [].concat(
			year[find](c.range(25, 33), months.KISLEV), // Chanukah
			year[find]([15, this.il ? null : 16], NISAN), // First day(s) of Pesach
			year[find]('Shavuot'),
			year[find]('Sukkot'),
			holidays.atzmaut(y)[1] || [], // Yom HaAtzma'ut, which changes based on day of week
			y >= 5727 ? year[find](29, months.IYYAR) : [] // Yom Yerushalayim
		)[map](function(d){
			return d.abs();
		}));
		var half = __cache.il[year.year] == this.il && __cache.half[year.year] || (__cache.half[year.year] = [].concat(
			year[find]('Rosh Chodesh').filter(function(rc){return rc[getMonth]() != TISHREI}), // Rosh Chodesh, but not Rosh Hashanah
			year[find](c.range(17 - this.il, 23 - this.il), NISAN) // Last six days of Pesach
		)[map](function(d){
			return d.abs();
		}));
		__cache.il[year.year] = this.il;

		return (whole.indexOf(this.abs()) > -1 && WHOLE) || (half.indexOf(this.abs()) > -1 && HALF) || NONE;
	}
	return hallel;
})();

// Events

(function(events){
	var refreshInterval, refresh, today = new HDate();

	defProp(events, 'refreshInterval', getset(function(){
		return refreshInterval;
	}, function(ms){
		if (refresh) {
			refresh = clearInterval(refresh);
		}
		refreshInterval = ms;
		if (ms) {
			refresh = setInterval(checkTimes, ms);
		}
	}));

	events.beforeZeman = 1000 * 60 * 10; // 10 minutes

	function checkTimes() {
		var now = new HDate();

		if (!today.isSameDate(now)) {
			events.emit('dayChange');
			today = now;
		}

		function close(obj, compare) {
			return c.filter(c[map](obj, function(time){
				return time - nowGreg;
			}), function(time) {
				return time > 0 && time - compare < 0;
			});
		}

		var nowGreg = new Date(),
			almostTime = close(now.getZemanim(), events.beforeZeman),
			customTimes = close(events.customs, events.refreshInterval);

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

Hebcal[GregYear] = function GregYearConstructor(year, month) {
	if (!year) {
		year = (new Date)[getFullYear]();
	}
	if (typeof year === 'string') {
		var d = new Date(year);
		month = year.indexOf(' ') + 1 || year.indexOf('-') + 1 || year.indexOf('/') + 1 ? d[getMonth]() + 1 : c.range(1, 12);
		// Check if a month was passed in the string. Can't just check for default January, because a real January might have been passed.
		return new Hebcal[GregYear](d[getFullYear](), month);
	}
	if (typeof year !== 'number') {
		throw new TE('year to Hebcal.GregYear() is not a number');
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
			this.months = month[map](function(i){
				var m = new Hebcal[GregMonth](i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: this
				});
				return m;
			}, this);
		} else {
			throw new TE('month to Hebcal.GregYear() is not a valid type');
		}
	} else {
		return new Hebcal[GregYear](year, c.range(1, 12));
	}

	this.hebyears = [].concat.apply([], this.months[map](function(m){
		return m.hebmonths[map](function(hm){
			return hm.year;
		});
	})).filter(function(val, i, arr){
		return arr.indexOf(val) === i; // keep unique values only
	});

	this.holidays = holidays.year(this.hebyears[0]).filter(function(h){
		return h.date.greg()[getFullYear]() === year && this.months.filter(function(m){ // don't keep ones that are out of bounds
			return m.month === h.date.greg()[getMonth]() + 1;
		})[length];
	}, this);
	if (this.hebyears[1]) {
		this.holidays = this.holidays.concat(holidays.year(this.hebyears[1]).filter(function(h){
			return h.date.greg()[getFullYear]() === year && this.months.filter(function(m){ // don't keep ones that are out of bounds
				return m.month === h.date.greg()[getMonth]() + 1;
			})[length];
		}, this));
	}

	this[length] = 365 + greg.LEAP(year);

	defProp(this, 'il', getset(function() {
		return this[getMonth](1).il;
	}, function(il) {
		this.months.forEach(function(m){
			m.il = il;
		});
	}));

	defProp(this, 'lat', getset(function() {
		return this[getMonth](1).lat;
	}, function(lat) {
		this.months.forEach(function(m){
			m.lat = lat;
		});
	}));
	defProp(this, 'long', getset(function() {
		return this[getMonth](1).long;
	}, function(lon) {
		this.months.forEach(function(m){
			m.long = lon;
		});
	}));

	return this;
};

Hebcal[GregYear][prototype][isLeapYear] = function isLeapYear() {
	return this[length] === 366;
};

Hebcal[GregYear][prototype].setCity = Hebcal[prototype].setCity;
Hebcal[GregYear][prototype].setLocation = Hebcal[prototype].setLocation;

Hebcal[GregYear][prototype][next] = function next() {
	return new Hebcal[GregYear](this.year + 1);
};

Hebcal[GregYear][prototype][prev] = function prev() {
	return new Hebcal[GregYear](this.year - 1);
};

Hebcal[GregYear][prototype][getMonth] = function getMonth(month) {
	month = typeof month === 'number' ? month : greg.lookupMonthNum(month);
	if (month > this.months[length]) {
		return this[next]()[getMonth](month - this.months[length]);
	}
	return this.months[month > 0 ? month - 1 : this.months[length] + month];
};

Hebcal[GregYear][prototype].days = Hebcal[prototype].days;
Hebcal[GregYear][prototype][map] = Hebcal[prototype][map];
Hebcal[GregYear][prototype].filter = Hebcal[prototype].filter;

Hebcal[GregYear][prototype].addHoliday = Hebcal[prototype].addHoliday;

Hebcal[GregMonth] = function GregMonth(month, year) {
	if (typeof month == 'string') {
		month = greg.lookupMonthNum(month);
	}
	if (typeof month != 'number') {
		throw new TE('month to Hebcal.GregMonth is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TE('year to Hebcal.GregMonth is not a number');
	}

	this.year = year;
	this.month = month;

	this.days = c.range(1, greg.daysInMonth(month, year))[map](function(i){
		var d = new HDate(new Date(year, month - 1, i));
		defProp(d, '__gregmonth', {
			configurable: true,
			writable: true,
			value: this
		});
		return d;
	}, this);

	this[length] = this.days[length];

	this.hebmonths = [
		{month: this[getDay]( 1)[getMonth](), year: this[getDay]( 1)[getFullYear]()},
		{month: this[getDay](-1)[getMonth](), year: this[getDay](-1)[getFullYear]()}
	].filter(function(val, i, arr){
		return i === 0 || val.month !== arr[0].month;
	});

	defProp(this, 'il', getset(function(){
		return this[getDay](1).il;
	}, function(il){
		this.days.forEach(function(d){
			d.il = il;
		});
	}));

	defProp(this, 'lat', getset(function(){
		return this[getDay](1).lat;
	}, function(lat){
		this.days.forEach(function(d){
			d.lat = lat;
		});
	}));
	defProp(this, 'long', getset(function(){
		return this[getDay](1).long;
	}, function(lon){
		this.days.forEach(function(d){
			d.long = lon;
		});
	}));

	return this;
};

Hebcal[GregMonth][prototype][isLeapYear] = function isLeapYear() {
	return greg.LEAP(this.year);
};

Hebcal[GregMonth][prototype][prev] = function prev() {
	if (this.month === 1) {
		return this[getYearObject]()[prev]()[getMonth](-1);
	} else {
		return this[getYearObject]()[getMonth](this.month - 1);
	}
};

Hebcal[GregMonth][prototype][next] = function next() {
	return this[getYearObject]()[getMonth](this.month + 1);
};

Hebcal[GregMonth][prototype][getDay] = function getDay(day) {
	if (day > this.days[length]) {
		return this[next]()[getDay](day - this.days[length]);
	}
	return this.days[day > 0 ? day - 1 : this.days[length] + day];
};

Hebcal[GregMonth][prototype][getYearObject] = function getYearObject() {
	return this.__year || new Hebcal[GregYear](this.year);
};

Hebcal[GregMonth][prototype].getName = function getName() {
	return greg.monthNames[this.month];
};

Hebcal[GregMonth][prototype].setCity = Hebcal[Month][prototype].setCity;
Hebcal[GregMonth][prototype].setLocation = Hebcal[Month][prototype].setLocation;

Hebcal[GregMonth][prototype][map] = Hebcal[Month][prototype][map];

HDate[prototype].getGregMonthObject = function getGregMonthObject() {
	return this.__gregmonth || new Hebcal[GregMonth](this.greg()[getMonth]() + 1, this.greg()[getFullYear]());
};

HDate[prototype].getGregYearObject = function getGregYearObject() {
	return this.getGregMonthObject()[getYearObject]();
};

module.exports = Hebcal;
