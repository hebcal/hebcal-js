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

	The JavaScript code was completely rewritten in 2014 by Eyal Schachter
 */
var c = require('./common'),
	greg = require('./greg'),
	suncalc = require('suncalc'),
	cities = require('./cities');

suncalc.addTime(-16.1, 'alot_hashacher', 0);
suncalc.addTime(-11.5, 'misheyakir', 0);
suncalc.addTime(-10.2, 'misheyakir_machmir', 0);
suncalc.addTime(-8.5, 0, 'tzeit');

// for minifying optimizations
var prototype = 'prototype',
	getFullYear = 'getFullYear',
	getMonth = 'getMonth',
	getDate = 'getDate',
	getTime = 'getTime',
	abs = 'abs',
	hour = 'hour',
	TISHREI = c.months.TISHREI,
	MONTHS_IN_HEB = c.MONTHS_IN_HEB,
	max_days_in_heb_month = c.max_days_in_heb_month,
	day_on_or_before = c.day_on_or_before;

function HDate(day, month, year) {
	switch (arguments.length) {
		case 0:
			return new HDate(new Date());
		case 1:
			if (typeof day === 'undefined') {
				return new HDate();
			} else if (day instanceof Date) {
				// we were passed a Gregorian date, so convert it
				var d = abs2hebrew(greg.greg2abs(day));
				if (d.sunset() < day) {
					d = d.next();
				}
				return d;
			} else if (day instanceof HDate) {
				var d = new HDate(day[getDate](), day[getMonth](), day[getFullYear]());
				d.il = day.il;
				d.setLocation(d.lat, d.long);
				return d;
			} else if (typeof day === 'string' && /\s/.test(day)) {
				var s = day.split(/\s+/);
				if (s.length === 2) {
					return new HDate(s[0], s[1]);
				} else if (s.length === 3) {
					return new HDate(s[0], s[1], s[2]);
				} else if (s.length === 4) { // should only be if s[1] is Adar
					if (/i/i.test(s[2])) { // Using I[I] syntax
						s[2] = s[2].length;
					} // otherwise using 1|2 syntax
					return new HDate(s[0], s[1] + s[2], s[3]);
				}
			} else if (typeof day === 'number') { // absolute date
				return abs2hebrew(day);
			}
			throw new TypeError('HDate called with bad argument');
		case 2:
			return new HDate(day, month, (new HDate)[getFullYear]());
		case 3:
			this.day = this.month = 1;
			this.year = c.dayYearNum(year);

			this.setMonth(c.monthNum(month));
			this.setDate(c.dayYearNum(day));
			break;
		default:
			throw new TypeError('HDate called with bad arguments');
	}

	return this.setLocation.apply(this, HDate.defaultLocation);
}

HDate.defaultLocation = [0, 0];
Object.defineProperty(HDate, 'defaultCity', {
	enumerable: true,
	configurable: true,

	get: function() {
		return cities.nearest(HDate.defaultLocation[0], HDate.defaultLocation[1]);
	},
	set: function(city) {
		var loc = cities.getLocation(cities.getCity(city));
		HDate.defaultLocation = [loc.lat, loc.long];
	}
});

function fixDate(date) {
	if (date.day < 1) {
		if (date.month == TISHREI) {
			date.year -= 1;
		}
		date.day += max_days_in_heb_month(date.month, date.year);
		date.month -= 1;
		fixMonth(date);
		fixDate(date);
	}
	if (date.day > max_days_in_heb_month(date.month, date.year)) {
		if (date.month == c.months.ELUL) {
			date.year += 1;
		}
		date.day -= max_days_in_heb_month(date.month, date.year);
		date.month += 1;
		fixMonth(date);
		fixDate(date);
	}
	fixMonth(date);
}

function fixMonth(date) {
	if (date.month < 1) {
		date.month += MONTHS_IN_HEB(date.year);
		date.year -= 1;
		fixMonth(date);
		fixDate(date);
	}
	if (date.month > MONTHS_IN_HEB(date.year)) {
		date.month -= MONTHS_IN_HEB(date.year);
		date.year += 1;
		fixMonth(date);
		fixDate(date);
	}
}

HDate[prototype][getFullYear] = function getFullYear() {
	return this.year;
};

HDate[prototype].isLeapYear = function isLeapYear() {
	return c.LEAP_YR_HEB(this[getFullYear]());
};

HDate[prototype][getMonth] = function getMonth() {
	return this.month;
};

HDate[prototype].getTishreiMonth = function getTishreiMonth() {
	return (this[getMonth]() + MONTHS_IN_HEB(this[getFullYear]()) - 6) % MONTHS_IN_HEB(this[getFullYear]());
};

HDate[prototype].daysInMonth = function daysInMonth() {
	return max_days_in_heb_month(this[getMonth](), this[getFullYear]());
};

HDate[prototype][getDate] = function getDate() {
	return this.day;
};

HDate[prototype].getDay = function getDay() {
	return this.greg().getDay();
};

HDate[prototype].setFullYear = function setFullYear(year) {
	this.year = year;
	fixMonth(this);
	fixDate(this);
	return this;
};

HDate[prototype].setMonth = function setMonth(month) {
	this.month = month;
	fixMonth(this);
	fixDate(this);
	return this;
};

HDate[prototype].setTishreiMonth = function setTishreiMonth(month) {
	return this.setMonth((month + 6) % MONTHS_IN_HEB(this[getFullYear]()) || 13);
};

HDate[prototype].setDate = function setDate(date) {
	this.day = date;
	fixMonth(this);
	fixDate(this);
	return this;
};

/* convert hebrew date to absolute date */
/* Absolute date of Hebrew DATE.
   The absolute date is the number of days elapsed since the (imaginary)
   Gregorian date Sunday, December 31, 1 BC. */
function hebrew2abs(d) {
	var m, tempabs = d[getDate]();
	
	if (d[getMonth]() < TISHREI) {
		for (m = TISHREI; m <= MONTHS_IN_HEB(d[getFullYear]()); m++) {
			tempabs += max_days_in_heb_month(m, d[getFullYear]());
		}

		for (m = c.months.NISAN; m < d[getMonth](); m++) {
			tempabs += max_days_in_heb_month(m, d[getFullYear]());
		}
	} else {
		for (m = TISHREI; m < d[getMonth](); m++) {
			tempabs += max_days_in_heb_month(m, d[getFullYear]());
		}
	}
	
	return c.hebrew_elapsed_days(d[getFullYear]()) - 1373429 + tempabs;
}

function abs2hebrew(d) {
	var mmap = [
		c.months.KISLEV, c.months.TEVET, c.months.SHVAT, c.months.ADAR_I, c.months.NISAN,
		c.months.IYYAR, c.months.SIVAN, c.months.TAMUZ, TISHREI, TISHREI, TISHREI, c.months.CHESHVAN
	], hebdate, gregdate, month, year;

	if (d >= 10555144) {
		throw new RangeError("parameter to abs2hebrew " + d + " out of range");
	}
	
	gregdate = greg.abs2greg(d);
	hebdate = new HDate(1, TISHREI, (year = 3760 + gregdate[getFullYear]()));
	
	while (d >= hebrew2abs(hebdate.setFullYear(year + 1))) {
		year++;
	}

	if (year >= 4635 && year < 10666) {
		// optimize search
		month = mmap[gregdate[getMonth]()];
	} else {
		// we're outside the usual range, so assume nothing about hebrew/gregorian calendar drift...
		month = TISHREI;
	}

	while (d > hebrew2abs(hebdate = new HDate(max_days_in_heb_month(month, year), month, year))) {
		month = (month % MONTHS_IN_HEB(year)) + 1;
	}
	
	/* if (day < 0) {
		throw new RangeError("assertion failure d < hebrew2abs(m,d,y) => " + d + " < " + hebrew2abs(hebdate) + "!");
	} */

	return hebdate.setLocation.apply(hebdate.setDate(d - hebrew2abs(hebdate.setDate(1)) + 1), HDate.defaultLocation);
}

HDate[prototype].greg = function toGreg() {
	return greg.abs2greg(hebrew2abs(this));
};

HDate[prototype].gregEve = function gregEve() {
	return this.prev().sunset();
};

HDate[prototype][abs] = function abs() {
	return hebrew2abs(this);
};

HDate[prototype].toString = function toString(o) {
	return c.LANGUAGE([this[getDate](), null, c.gematriya(this[getDate]())], o) + ' ' +
		this.getMonthName(o) + ' ' +
		c.LANGUAGE([this[getFullYear](), null, c.gematriya(this[getFullYear]())], o);
};

HDate[prototype].getMonthName = function getMonthName(o) {
	return c.LANGUAGE(c.monthNames[+this.isLeapYear()][this[getMonth]()], o);
};

HDate[prototype].setCity = function setCity(city) {
	return this.setLocation(cities.getLocation(cities.getCity(city)));
};

HDate[prototype].setLocation = function setLocation(lat, lon) {
	if (typeof lat == 'object' && !Array.isArray(lat)) {
		lon = lat.long;
		lat = lat.lat;
	}
	if (Array.isArray(lat)) {
		lat = (lat[0] * 60 + lat[1]) / 60;
	}
	if (Array.isArray(lon)) {
		lon = (lon[0] * 60 + lon[1]) / 60;
	}
	if (typeof lat != 'number') {
		throw new TypeError('incorrect lat type passed to HDate.setLocation()');
	}
	if (typeof lon != 'number') {
		throw new TypeError('incorrect long type passed to HDate.setLocation()');
	}

	this.lat = lat;
	this.long = lon;

	this.il = cities.getCity(cities.nearest(this.lat, this.long))[2];

	return this;
};

HDate[prototype].sunrise = function sunrise() {
	return suncalc.getTimes(this.greg(), this.lat, this.long).sunrise;
};

HDate[prototype].sunset = function sunset() {
	return suncalc.getTimes(this.greg(), this.lat, this.long).sunset;
};

HDate[prototype][hour] = function hour() {
	return (this.sunset() - this.sunrise()) / 12; // ms in hour
};

HDate[prototype].hourMins = function hourMins() {
	// hour in ms / (1000 ms in s * 60 s in m) = mins in halachic hour
	return this[hour]() / (1000 * 60);
};

HDate[prototype].nightHour = function nightHour() {
	return (this.sunrise() - this.gregEve()) / 12; // ms in hour
};

HDate[prototype].nightHourMins = function nightHourMins() {
	// hour in ms / (1000 ms in s * 60 s in m) = mins in halachic hour
	return this.nightHour() / (1000 * 60);
};

var zemanim = {
	chatzot: function chatzot(hdate) {
		return new Date(hdate.sunrise()[getTime]() + (hdate[hour]() * 6));
	},
	chatzot_night: function chatzot_night(hdate) {
		return new Date(hdate.sunrise()[getTime]() - (hdate.nightHour() * 6));
	},
	alot_hashacher: function alot_hashacher(hdate) {
		return suncalc.getTimes(hdate.greg(), hdate.lat, hdate.long).alot_hashacher;
	},
	misheyakir: function misheyakir(hdate) {
		return suncalc.getTimes(hdate.greg(), hdate.lat, hdate.long).misheyakir;
	},
	misheyakir_machmir: function misheyakir_machmir(hdate) {
		return suncalc.getTimes(hdate.greg(), hdate.lat, hdate.long).misheyakir_machmir;
	},
	sof_zman_shma: function sof_zman_shma(hdate) { // Gra
		return new Date(hdate.sunrise()[getTime]() + (hdate[hour]() * 3));
	},
	sof_zman_tfilla: function sof_zman_tfilla(hdate) { // Gra
		return new Date(hdate.sunrise()[getTime]() + (hdate[hour]() * 4));
	},
	mincha_gedola: function mincha_gedola(hdate) {
		return new Date(hdate.sunrise()[getTime]() + (hdate[hour]() * 6.5));
	},
	mincha_ketana: function mincha_ketana(hdate) {
		return new Date(hdate.sunrise()[getTime]() + (hdate[hour]() * 9.5));
	},
	plag_hamincha: function plag(hdate) {
		return new Date(hdate.sunrise()[getTime]() + (hdate[hour]() * 10.75));
	},
	tzeit: function tzeit(hdate) {
		return suncalc.getTimes(hdate.greg(), hdate.lat, hdate.long).tzeit;
	},
	neitz_hachama: function neitz(hdate) {
		return hdate.sunrise();
	},
	shkiah: function shkiah(hdate) {
		return hdate.sunset();
	}
};

HDate[prototype].getZemanim = function getZemanim() {
	return c.map(zemanim, function(z){
		return z(this);
	}, this);
};

HDate.addZeman = function addZeman(zeman, func) {
	zemanim[zeman] = func;
};

HDate[prototype].next = function next() {
	return new HDate(this[getDate]() + 1, this[getMonth](), this[getFullYear]());
};

HDate[prototype].prev = function prev() {
	if (this[getDate]() === 1) {
		if (this[getMonth]() === TISHREI) {
			return new HDate(max_days_in_heb_month(c.months.ELUL, this[getFullYear]() -1 ), c.months.ELUL, this[getFullYear]() - 1);
		} else if (this[getMonth]() === c.months.NISAN) {
			return new HDate(max_days_in_heb_month(MONTHS_IN_HEB(this[getFullYear]()), this[getFullYear]()), MONTHS_IN_HEB(this[getFullYear]()), this[getFullYear]());
		} else {
			return new HDate(max_days_in_heb_month(this[getMonth]() - 1, this[getFullYear]()), this[getMonth]() - 1, this[getFullYear]());
		}
	} else {
		return new HDate(this[getDate]() - 1, this[getMonth](), this[getFullYear]());
	}
};

HDate[prototype].isSameDate = function isSameDate(other) {
	if (other instanceof HDate) {
		if (other[getFullYear]() === -1) {
			other = new HDate(other).setFullYear(this[getFullYear]());
		}
		return this[abs]() === other[abs]();
	}
	return false;
};

HDate[prototype].before = function before(day) {
	return new HDate(day_on_or_before(day, this[abs]() - 1));
};

HDate[prototype].onOrBefore = function onOrBefore(day) {
	return new HDate(day_on_or_before(day, this[abs]()));
};

HDate[prototype].nearest = function nearest(day) {
	return new HDate(day_on_or_before(day, this[abs]() + 3));
};

HDate[prototype].onOrAfter = function onOrAfter(day) {
	return new HDate(day_on_or_before(day, this[abs]() + 6));
};

HDate[prototype].after = function after(day) {
	return new HDate(day_on_or_before(day, this[abs]() + 7));
};

module.exports = HDate;