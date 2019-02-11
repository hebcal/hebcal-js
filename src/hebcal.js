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
	EventEmitter = require('events').EventEmitter,
	gematriya = require('gematriya');

// for minifying optimizations
var defProp = Object.defineProperty,
	TE = TypeError,
	find = 'find',
	strings = 'strings',
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
	NISAN = months.NISAN,
	HebcalProto = Hebcal.prototype,
	MonthProto = Month.prototype,
	GregYearProto = GregYear.prototype,
	GregMonthProto = GregMonth.prototype,
	HDateProto = HDate.prototype;

function getset(g, s) {
	return {
		enumerable: true,
		configurable: true,

		get: g,
		set: s
	};
}

function extend(base, into) {
	for (var i in into) {
		base[i] = into[i];
	}
	return base;
}

// Main Hebcal function

function Hebcal(year, month) {
	var me = this; // whenever this is done, it is for optimizations.
	if (!year) {
		year = (new HDate())[getFullYear](); // this year;
	}
	if (typeof year !== 'number') {
		throw new TE('year to Hebcal() is not a number');
	}
	me.year = year;
	if (month) {
		if (typeof month == 'string') {
			month = c.monthFromName(month);
		}
		if (typeof month == 'number') {
			month = [month];
		}

		if (Array.isArray(month)) {
			me.months = month[map](function(i){
				var m = new Month(i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: me
				});
				return m;
			});

			me.holidays = holidays.year(year);
		} else {
			throw new TE('month to Hebcal is not a valid type');
		}
	} else {
		return new Hebcal(year, c.range(1, c.MONTH_CNT(year)));
	}

	me[length] = c.daysInYear(year);

	defProp(me, 'il', getset(function() {
		return me[getMonth](1).il;
	}, function(il) {
		me.months.forEach(function(m){
			m.il = il;
		});
	}));

	defProp(me, 'lat', getset(function() {
		return me[getMonth](1).lat;
	}, function(lat) {
		me.months.forEach(function(m){
			m.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function() {
		return me[getMonth](1).long;
	}, function(lon) {
		me.months.forEach(function(m){
			m.long = lon;
		});
	}));
}

HebcalProto[isLeapYear] = HDateProto[isLeapYear];

HebcalProto.setCity = function(city) {
	this.months.forEach(function(m){
		m.setCity(city);
	});
	return this;
};

HebcalProto.setLocation = function(lat, lon) {
	this.months.forEach(function(m){
		m.setLocation(lat, lon);
	});
	return this;
};

HebcalProto[next] = function() {
	return new Hebcal(this.year + 1);
};

HebcalProto[prev] = function() {
	return new Hebcal(this.year - 1);
};

HebcalProto[getMonth] = function(month) {
	var months = this.months;
	month = c.monthNum(month);
	if (month > this.months[length]) {
		return this[next]()[getMonth](month - months[length]);
	}
	return months[month > 0 ? month - 1 : months[length] + month];
};

HebcalProto[getDay] = function(day) {
	var me = this;
	if (day > me[length]) {
		return null;
	}
	if (day < 0) {
		return me[getDay](me[length] - day);
	}
	var rosh = me[find](29, months.ELUL)[0].abs() + 1 - me[find](1, NISAN)[0].abs(); // number of days between Nisan and Tishrei
	if (day <= rosh) {
		return me[getMonth](NISAN)[getDay](day);
	}
	return me[getMonth](TISHREI)[getDay](day - rosh);
};

HebcalProto.days = function() {
	return [].concat.apply([], this.months[map](function(m){
		return m.days;
	}));
};

HebcalProto[map] = function() {
	return [][map].apply(this.days(), arguments);
};

HebcalProto.filter = function() {
	return [].filter.apply(this.days(), arguments);
};

HebcalProto.addHoliday = function(holiday) {
	if (!(holiday instanceof holidays.Event)) {
		throw new TE('non-Event passed to addHoliday()');
	}
	this.holidays.add(holiday);
	return this;
};

HebcalProto.findParsha = function(parsha, o) {
	var langs = o ? [o] : ['s','a','h']; // FIXME: abstract this away somewhere
	var days = this.filter(function(d){
		return Math.max.apply(null, langs.map(function(l){
			return d.getSedra(l).indexOf(parsha) + 1;
		}));
	});
	return days[days[length] - 1];
};
HebcalProto.findSedra = HebcalProto.findParsha;

HebcalProto[find] = function find_f(day, month) {
	var me = this;
	if (arguments[length] === 1) {
		if (typeof day == 'string') {
			return find_f[strings].call(me, day);
		} else if (Array.isArray(day)) {
			return [].concat.apply([], day[map](function(d){
				return me[find][Array.isArray(d) ? 'apply' : 'call'](me, d);
			}));
		} else if (day instanceof HDate) {
			return me[find](day.getDate(), day[getMonth]());
		} else if (day instanceof Date) {
			return me[find](new HDate(day));
		}
	} else if (arguments[length] == 2) {
		if (month instanceof Month) {
			return month[find](day);
		} else if (Array.isArray(month)) {
			return [].concat.apply([], month[map](function(m){
				return me[find](day, m);
			}));
		} else if (typeof month == 'string') {
			return me[find](day, c.monthNum(month));
		} else if (typeof month == 'number') {
			return me[find](day, me[getMonth](month));
		}
	}
	return [];
};
HebcalProto[find][strings] = function strings(str) {
	var split = str.split(/\s+/), func = strings[str.replace(/\s/g, '_').toLowerCase()];
	if (!split[length]) {
		return [];
	} else if (func) {
		return func.call(this);
	}
	try {
		return this[find](new HDate(str));
	} catch(e) {
		return split[length] - 1 ? this[find].apply(this, split) : [];
	}
};
HebcalProto[find][strings].rosh_chodesh = function() {
	return this[find]('Rosh Chodesh', c.range(1, this.months[length]));
};
HebcalProto[find][strings].holidays = function() {
	return [].concat.apply([], this.holidays[map](function(h){
		return this[find](h.date);
	}, this));
};
HebcalProto[find][strings].omer = function() {
	return this[find](c.range(15+1, 15+49), NISAN);
};
HebcalProto[find][strings].today = function() {
	return this[find](new HDate());
};
HebcalProto[find][strings].yesterday = function() {
	return [this[find]('today')[0][prev]()];
};
HebcalProto[find][strings].tomorrow = function() {
	return [this[find]('today')[0][next]()];
};
HebcalProto[find][strings].pesach = function() {
	return this[find](c.range(15, 15+8-this.il), NISAN);
};
HebcalProto[find][strings].sukkot = function() {
	return this[find](c.range(15, 15+9-this.il), TISHREI);
};
HebcalProto[find][strings].succot = HebcalProto[find][strings].succos = HebcalProto[find][strings].sukkos = HebcalProto[find][strings].sukkot;
HebcalProto[find][strings].shavuot = function() {
	return this[find](c.range(6, 7-this.il), months.SIVAN);
};
HebcalProto[find][strings].shavuos = HebcalProto[find][strings].shavuot;
HebcalProto[find][strings].rosh_hashana = function() {
	return this[find](c.range(1, 2), TISHREI);
};
HebcalProto[find][strings].rosh_hashanah = HebcalProto[find][strings].rosh_hashana;

// Hebcal properties

Hebcal.addZeman = HDate.addZeman;

Hebcal.cities = cities;

Hebcal.range = c.range;

Hebcal.gematriya = gematriya;

Hebcal.holidays = c.filter(holidays, ['masks', 'Event']); // not year(), atzmaut()

Hebcal.parshiot = Sedra.parshiot;

Hebcal.LANGUAGE = c.LANG;

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

function Month(month, year) {
	var me = this;
	month = c.monthNum(month);
	if (typeof month != 'number') {
		throw new TE('month to Hebcal.Month is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TE('year to Hebcal.Month is not a number');
	}
	me.month = month;
	me.year = year;

	me.days = c.range(1, c.daysInMonth(month, year))[map](function(i){
		var d = new HDate(i, month, year);
		defProp(d, '__month', {
			configurable: true,
			writable: true,
			value: me
		});
		return d;
	});

	me[length] = me.days[length];

	me.holidays = c.filter(holidays.year(year), function(h){
		return h[0].date[getMonth]() == month;
	});

	defProp(me, 'il', getset(function(){
		return me[getDay](1).il;
	}, function(il){
		me.days.forEach(function(d){
			d.il = il;
		});
	}));

	defProp(me, 'lat', getset(function(){
		return me[getDay](1).lat;
	}, function(lat){
		me.days.forEach(function(d){
			d.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function(){
		return me[getDay](1).long;
	}, function(lon){
		me.days.forEach(function(d){
			d.long = lon;
		});
	}));

	return me;
};

Hebcal.Month = Month;

MonthProto[isLeapYear] = HDateProto[isLeapYear];

MonthProto[prev] = function() {
	var me = this, year = me[getYearObject]();
	if (me.month === 1) { // Nisan
		return year[getMonth](-1);
	} else if (me.month === TISHREI) {
		return year[prev]()[getMonth](months.ELUL);
	} else {
		return year[getMonth](me.month - 1);
	}
};

MonthProto[next] = function() {
	var me = this, year = me[getYearObject]();
	if (me.month === c.MONTH_CNT(me.year)) { // Adar
		return year[getMonth](1);
	} else if (me.month === months.ELUL) {
		return year[next]()[getMonth](TISHREI);
	} else {
		return year[getMonth](me.month + 1);
	}
};

MonthProto[getDay] = function(day) {
	var days = this.days;
	day = c.dayYearNum(day);
	if (day > days[length]) {
		return this[next]()[getDay](day - days[length]);
	}
	return days[day > 0 ? day - 1 : days[length] + day];
};

MonthProto[getYearObject] = function() {
	return this.__year || new Hebcal(this.year);
};

MonthProto.getName = function(o) {
	return c.LANG(c.monthNames[+this[isLeapYear]()][this.month], o);
};

MonthProto.rosh_chodesh = function() {
	var prevMonth = this[prev]();
	return prevMonth[length] == 30 ? [prevMonth[getDay](-1), this[getDay](1)] : [this[getDay](1)];
};

MonthProto.setCity = function(city) {
	this.days.forEach(function(d){
		d.setCity(city);
	});
	return this;
};

MonthProto.setLocation = function(lat, lon) {
	this.days.forEach(function(d){
		d.setLocation(lat, lon);
	});
	return this;
};

MonthProto[map] = function() {
	return [][map].apply(this.days, arguments);
};

MonthProto.molad = function() {
	var retMolad = {}, year, m_elapsed, p_elapsed, h_elapsed, parts, m_adj, toInt = parseInt;

    m_adj = this.month - 7;
	year = this.year - 1;
    if (m_adj < 0) {
		m_adj += c.MONTH_CNT(year + 1);
	}

    m_elapsed = toInt(m_adj +
        235 * (year / 19)/* +
        12 * (year % 19) +
        (((year % 19) * 7) + 1) / 19*/);

    p_elapsed = toInt(204 + (793 * (m_elapsed % 1080)));

    h_elapsed = toInt(5 + (12 * m_elapsed) +
        793 * (m_elapsed / 1080)/* +
        p_elapsed / 1080*/ -
        6);

    parts = toInt((p_elapsed % 1080) + 1080 * (h_elapsed % 24));

    retMolad.doy = new HDate(toInt(1 + 29 * m_elapsed + h_elapsed / 24)).getDay();
    retMolad.hour = Math.round(h_elapsed % 24);
    var chalakim = toInt(parts % 1080);
    retMolad.minutes = toInt(chalakim / 18);
    retMolad.chalakim = chalakim % 18;
    var day = this.prev().find.strings.shabbat_mevarchim._calc.call(this)[0].onOrAfter(retMolad.doy).greg();
    day.setHours(retMolad.hour);
    day.setMinutes(retMolad.minutes);
    day.setSeconds(retMolad.chalakim * 3.33);
    retMolad.day = day;

    return retMolad;
};

MonthProto[find] = function find_f(day) {
	var me = this;
	if (typeof day == 'number') {
		return [me[getDay](day)];
	} else if (typeof day == 'string') {
		return find_f[strings].call(me, day);
	} else if (Array.isArray(day)) {
		return [].concat.apply([], day[map](function(d){
			return me[find](d);
		}));
	} else if (day instanceof HDate && day[getFullYear]() == me.year && day[getMonth]() == me.month) {
		return me[find](day.getDate());
	} else if (day instanceof Date) {
		return me[find](new HDate(day));
	}
	return [];
};
MonthProto[find][strings] = function strings(str) {
	var func = strings[str.replace(/\s/g, '_').toLowerCase()];
	if (func) {
		return func.call(this);
	}
	try {
		return this[find](new HDate(str));
	} catch(e) {
		var num = c.dayYearNum(str);
		return num ? this[find](num) : [];
	}
};
MonthProto[find][strings].rosh_chodesh = function() {
	return this.rosh_chodesh();
};
MonthProto[find][strings].shabbat_mevarchim = function sm() {
	return this.month === months.ELUL ? [] : // No birchat hachodesh in Elul
		sm._calc.call(this);
};
MonthProto[find][strings].shabbat_mevarchim._calc = function() {
	return this[find](this[getDay](29).onOrBefore(c.days.SAT));
};
MonthProto[find][strings].shabbos_mevarchim = MonthProto[find][strings].shabbos_mevorchim = MonthProto[find][strings].shabbat_mevarchim;

// HDate days

Hebcal.HDate = HDate;

HDateProto.getMonthObject = function() {
	return this.__month || new Month(this[getMonth](), this[getFullYear]());
};

HDateProto[getYearObject] = function() {
	return this.getMonthObject()[getYearObject]();
};

(function(){
	var orig = {}; // slightly less overhead when using unaffiliated HDate()s
	[prev, next].forEach(function(func){
		orig[func] = HDateProto[func];
		HDateProto[func] = function() {
			var day = orig[func].call(this);
			if (!this.__month) {
				return day;
			}
			return this[getYearObject]()[find](day)[0];
		};
	});
})();

var _getCachedSedraYear = (function(){
	var __cache = {};

	return function(hd) {
		var sedraYear = __cache[hd[getFullYear]()];
		if (!sedraYear || (sedraYear.il != hd.il)) {
			sedraYear = __cache[hd[getFullYear]()] = new Sedra(hd[getFullYear](), hd.il);
		}
		return sedraYear;
	}
})();
HDateProto.getSedra =  function(o) {
	var sedraYear = _getCachedSedraYear(this);
	return sedraYear.get(this)[map](function(p){
		return c.LANG(p, o);
	});
};
HDateProto.getParsha = HDateProto.getSedra;

HDateProto.isSedra =  function() {
	var sedraYear = _getCachedSedraYear(this);
	return sedraYear.isParsha(this);
};
HDateProto.isParsha = HDateProto.isSedra;

HDateProto.holidays = function(all) {
	var me = this, days = me[getYearObject]().holidays[me];
	return days ? days.filter(function(h){
		return all ? true : !h.routine() && h.is(me);
	})[map](function(h){
		h.date.setLocation(me);
		return h;
	}) : [];
};

['candleLighting', 'havdalah'].forEach(function(prop){
	HDateProto[prop] = function(){
		var me = this, hd = me.holidays(true).filter(function(h){
			return h.is(me);
		});
		if (hd.length) {
			hd = c.filter(hd.map(function(h){
				return h[prop]();
			}), true);
		}
		return hd.length ? new Date(Math.max.apply(null, hd)) : null;
	};
});

HDateProto.omer = function() {
	var me = this, greg = me.greg().getTime(), year = me[getFullYear]();
	if (greg > new HDate(15, NISAN, year).greg().getTime() &&
		greg < new HDate( 6, months.SIVAN, year).greg().getTime()) {
		return me.abs() - new HDate(16, NISAN, year).abs() + 1;
	}
	return 0;
};

HDateProto.dafyomi = function(o) {
	return dafyomi.dafname(dafyomi.dafyomi(this.greg()), o);
};

HDateProto.tachanun = (function() {
	var NONE      = tachanun.NONE      = 0,
		MINCHA    = tachanun.MINCHA    = 1,
		SHACHARIT = tachanun.SHACHARIT = 2,
		ALL_CONGS = tachanun.ALL_CONGS = 4;

	var __cache = {
		all: {},
		some: {},
		yes_prev: {},
		il: {}
	};

	function tachanun() {
		var checkNext = !arguments[0], me = this;

		var year = me[getYearObject](), y = year.year;

		function mapAbs(arr) {
			return arr[map](function(d){
				return d.abs();
			});
		}

		var all, some, yes_prev;
		if (__cache.il[y] === me.il) {
			all = __cache.all[y];
			some = __cache.some[y];
			yes_prev = __cache.yes_prev[y];
		} else {
			all = __cache.all[y] = mapAbs(year[find]('Rosh Chodesh').concat(
				year[find](c.range(1, c.daysInMonth(NISAN, y)), NISAN), // all of Nisan
				year[find](15 + 33, NISAN), // Lag Baomer
				year[find](c.range(1, 8 - me.il), months.SIVAN), // Rosh Chodesh Sivan thru Isru Chag
				year[find]([9, 15], months.AV), // Tisha B'av and Tu B'av
				year[find](-1, months.ELUL), // Erev Rosh Hashanah
				year[find]([1, 2], TISHREI), // Rosh Hashanah
				year[find](c.range(9, 24 - me.il), TISHREI), // Erev Yom Kippur thru Isru Chag
				year[find](c.range(25, 33), months.KISLEV), // Chanukah
				year[find](15, months.SHVAT), // Tu B'shvat
				year[find]([14, 15], year[isLeapYear]() ? [months.ADAR_I, months.ADAR_II] : months.ADAR_I) // Purim/Shushan Purim + Katan
			));
			some = __cache.some[y] = mapAbs([].concat( // Don't care if it overlaps days in all, because all takes precedence
				year[find](c.range(1, 13), months.SIVAN), // Until 14 Sivan
				year[find](c.range(20, 31), TISHREI), // Until after Rosh Chodesh Cheshvan
				year[find](14, months.IYYAR), // Pesach Sheini
				holidays.atzmaut(y)[1].date || [], // Yom HaAtzma'ut, which changes based on day of week
				y >= 5727 ? year[find](29, months.IYYAR) : [] // Yom Yerushalayim
			));
			yes_prev = __cache.yes_prev[y] = mapAbs([].concat( // tachanun is said on the previous day at mincha
				year[find](-1, months.ELUL), // Erev Rosh Hashanah
				year[find](9, months.TISHREI), // Erev Yom Kippur
				year[find](14, months.IYYAR) // Pesach Sheini
			));
			__cache.il[y] = me.il;
		}

		all = all.indexOf(me.abs()) > -1;
		some = some.indexOf(me.abs()) > -1;
		yes_prev = yes_prev.indexOf(me.abs()+1) > -1;

		if (all) {
			return NONE;
		}
		var ret = (!some && ALL_CONGS) | (me[getDay]() != 6 && SHACHARIT);
		if (checkNext && !yes_prev) {
			ret |= ((me[next]().tachanun(true) & SHACHARIT) && MINCHA);
		} else {
			ret |= (me[getDay]() != 5 && MINCHA);
		}
		return ret == ALL_CONGS ? NONE : ret;
	}
	return tachanun;
})();

HDateProto.tachanun_uf = function(){
	var ret = this.tachanun();
	return {
		shacharit: !!(ret & this.tachanun.SHACHARIT),
		mincha: !!(ret & this.tachanun.MINCHA),
		all_congs: !!(ret & this.tachanun.ALL_CONGS)
	};
};

HDateProto.hallel = (function() {
	var NONE  = hallel.NONE  = 0,
		HALF  = hallel.HALF  = 1,
		WHOLE = hallel.WHOLE = 2;

	var __cache = {
		whole: {},
		half: {},
		il: {}
	};

	function hallel() {
		var me = this, year = me[getYearObject](), y = year.year;

		var whole = __cache.il[y] == me.il && __cache.whole[y] || (__cache.whole[y] = [].concat(
			year[find](c.range(25, 33), months.KISLEV), // Chanukah
			year[find]([15, me.il ? null : 16], NISAN), // First day(s) of Pesach
			year[find]('Shavuot'),
			year[find]('Sukkot'),
			holidays.atzmaut(y)[1].date || [], // Yom HaAtzma'ut, which changes based on day of week
			y >= 5727 ? year[find](29, months.IYYAR) : [] // Yom Yerushalayim
		)[map](function(d){
			return d.abs();
		}));
		var half = __cache.il[y] == me.il && __cache.half[y] || (__cache.half[y] = [].concat(
			year[find]('Rosh Chodesh').filter(function(rc){return rc[getMonth]() != TISHREI}), // Rosh Chodesh, but not Rosh Hashanah
			year[find](c.range(17 - me.il, 23 - me.il), NISAN) // Last six days of Pesach
		)[map](function(d){
			return d.abs();
		}));
		__cache.il[y] = me.il;

		return (whole.indexOf(me.abs()) > -1 && WHOLE) || (half.indexOf(me.abs()) > -1 && HALF) || NONE;
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
			if (refresh.unref) {
				refresh.unref(); // don't keep the process open
			}
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

function GregYear(year, month) {
	var me = this;
	if (!year) {
		year = (new Date)[getFullYear]();
	}
	if (typeof year === 'string') {
		var d = new Date(year);
		month = year.indexOf(' ') + 1 || year.indexOf('-') + 1 || year.indexOf('/') + 1 ? d[getMonth]() + 1 : c.range(1, 12);
		// Check if a month was passed in the string. Can't just check for default January, because a real January might have been passed.
		return new GregYear(d[getFullYear](), month);
	}
	if (typeof year !== 'number') {
		throw new TE('year to Hebcal.GregYear() is not a number');
	}
	me.year = year;

	if (month) {
		if (typeof month === 'string') { // month name
			month = greg.lookupMonthName(month);
		}
		if (typeof month === 'number') {
			month = [month];
		}

		if (Array.isArray(month)) {
			me.months = month[map](function(i){
				var m = new GregMonth(i, year);
				defProp(m, '__year', {
					configurable: true,
					writable: true,
					value: me
				});
				return m;
			});
		} else {
			throw new TE('month to Hebcal.GregYear() is not a valid type');
		}
	} else {
		return new GregYear(year, c.range(1, 12));
	}

	me.hebyears = [].concat.apply([], me.months[map](function(m){
		return m.hebmonths[map](function(hm){
			return hm.year;
		});
	})).filter(function(val, i, arr){
		return arr.indexOf(val) === i; // keep unique values only
	});

	me.holidays = c.filter(holidays.year(me.hebyears[0]), function(h){
		return h[0].date.greg()[getFullYear]() === year && me.months.filter(function(m){ // don't keep ones that are out of bounds
			return m.month === h[0].date.greg()[getMonth]() + 1;
		})[length];
	});
	if (me.hebyears[1]) {
		extend(me.holidays, c.filter(holidays.year(me.hebyears[1]), function(h){
			return h[0].date.greg()[getFullYear]() === year && me.months.filter(function(m){ // don't keep ones that are out of bounds
				return m.month === h[0].date.greg()[getMonth]() + 1;
			})[length];
		}));
	}

	me[length] = 365 + greg.LEAP(year);

	defProp(me, 'il', getset(function() {
		return me[getMonth](1).il;
	}, function(il) {
		me.months.forEach(function(m){
			m.il = il;
		});
	}));

	defProp(me, 'lat', getset(function() {
		return me[getMonth](1).lat;
	}, function(lat) {
		me.months.forEach(function(m){
			m.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function() {
		return me[getMonth](1).long;
	}, function(lon) {
		me.months.forEach(function(m){
			m.long = lon;
		});
	}));

	return me;
};

Hebcal.GregYear = GregYear;

GregYearProto[isLeapYear] = function() {
	return this[length] == 366;
};

GregYearProto.setCity = HebcalProto.setCity;
GregYearProto.setLocation = HebcalProto.setLocation;

GregYearProto[next] = function() {
	return new GregYear(this.year + 1);
};

GregYearProto[prev] = function() {
	return new GregYear(this.year - 1);
};

GregYearProto[getMonth] = function(month) {
	var months = this.months
	month = typeof month == 'number' ? month : greg.lookupMonthNum(month);
	if (month > months[length]) {
		return this[next]()[getMonth](month - months[length]);
	}
	return months[month > 0 ? month - 1 : months[length] + month];
};

extend(GregYearProto, {
	days: HebcalProto.days,
	map: HebcalProto[map],
	filter: HebcalProto.filter,
	addHoliday: HebcalProto.addHoliday,
});

/*GregYearProto.days = HebcalProto.days;
GregYearProto[map] = HebcalProto[map];
GregYearProto.filter = HebcalProto.filter;

GregYearProto.addHoliday = HebcalProto.addHoliday;*/

function GregMonth(month, year) {
	var me = this;
	if (typeof month == 'string') {
		month = greg.lookupMonthNum(month);
	}
	if (typeof month != 'number') {
		throw new TE('month to Hebcal.GregMonth is not a valid type');
	}
	if (typeof year != 'number') {
		throw new TE('year to Hebcal.GregMonth is not a number');
	}

	me.year = year;
	me.month = month;

	me.days = c.range(1, greg.daysInMonth(month, year))[map](function(i){
		var d = new HDate(new Date(year, month - 1, i));
		defProp(d, '__gregmonth', {
			configurable: true,
			writable: true,
			value: me
		});
		return d;
	});

	me[length] = me.days[length];

	me.hebmonths = [
		{month: me[getDay]( 1)[getMonth](), year: me[getDay]( 1)[getFullYear]()},
		{month: me[getDay](-1)[getMonth](), year: me[getDay](-1)[getFullYear]()}
	].filter(function(val, i, arr){
		return i === 0 || val.month != arr[0].month;
	});

	defProp(me, 'il', getset(function(){
		return me[getDay](1).il;
	}, function(il){
		me.days.forEach(function(d){
			d.il = il;
		});
	}));

	defProp(me, 'lat', getset(function(){
		return me[getDay](1).lat;
	}, function(lat){
		me.days.forEach(function(d){
			d.lat = lat;
		});
	}));
	defProp(me, 'long', getset(function(){
		return me[getDay](1).long;
	}, function(lon){
		me.days.forEach(function(d){
			d.long = lon;
		});
	}));

	return me;
};

Hebcal.GregMonth = GregMonth;

GregMonthProto[isLeapYear] = function() {
	return greg.LEAP(this.year);
};

GregMonthProto[prev] = function() {
	if (this.month === 1) {
		return this[getYearObject]()[prev]()[getMonth](-1);
	} else {
		return this[getYearObject]()[getMonth](this.month - 1);
	}
};

GregMonthProto[next] = function() {
	return this[getYearObject]()[getMonth](this.month + 1);
};

GregMonthProto[getDay] = function(day) {
	if (day > this.days[length]) {
		return this[next]()[getDay](day - this.days[length]);
	}
	return this.days[day > 0 ? day - 1 : this.days[length] + day];
};

GregMonthProto[getYearObject] = function() {
	return this.__year || new GregYear(this.year);
};

GregMonthProto.getName = function() {
	return greg.monthNames[this.month];
};

GregMonthProto.setCity = MonthProto.setCity;
GregMonthProto.setLocation = MonthProto.setLocation;

GregMonthProto[map] = MonthProto[map];

HDateProto.getGregMonthObject = function() {
	return this.__gregmonth || new GregMonth(this.greg()[getMonth]() + 1, this.greg()[getFullYear]());
};

HDateProto.getGregYearObject = function() {
	return this.getGregMonthObject()[getYearObject]();
};

module.exports = Hebcal;
