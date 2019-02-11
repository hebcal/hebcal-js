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
var gematriya = require('gematriya');

var charCodeAt = 'charCodeAt';

var months = exports.months = {
	NISAN   : 1,
	IYYAR   : 2,
	SIVAN   : 3,
	TAMUZ   : 4,
	AV      : 5,
	ELUL    : 6,
	TISHREI : 7,
	CHESHVAN: 8,
	KISLEV  : 9,
	TEVET   : 10,
	SHVAT   : 11,
	ADAR_I  : 12,
	ADAR_II : 13
};

var monthNames = [
	["", 0, ""],
	["Nisan", 0, "ניסן"],
	["Iyyar", 0, "אייר"],
	["Sivan", 0, "סיון"],
	["Tamuz", 0, "תמוז"],
	["Av", 0, "אב"],
	["Elul", 0, "אלול"],
	["Tishrei", 0, "תשרי"],
	["Cheshvan", 0, "חשון"],
	["Kislev", 0, "כסלו"],
	["Tevet", 0, "טבת"],
	["Sh'vat", 0, "שבט"]
];
exports.monthNames = [
	monthNames.concat([["Adar", 0, "אדר"],["Nisan", 0, "ניסן"]]),
	monthNames.concat([["Adar 1", 0, "אדר א'"],["Adar 2", 0, "אדר ב'"],["Nisan", 0, "ניסן"]])
];

exports.days = {
	SUN: 0,
	MON: 1,
	TUE: 2,
	WED: 3,
	THU: 4,
	FRI: 5,
	SAT: 6
};

exports.LANG = function(str, opts){
	return opts == 'h' && str[2] || (opts == 'a' && str[1] || str[0]);
};

function LEAP(x) {
	return (1 + x * 7) % 19 < 7;
}
exports.LEAP = LEAP;

exports.MONTH_CNT = function(x) {
	return 12 + LEAP(x); // boolean is cast to 1 or 0
};

exports.daysInMonth = function(month, year) {
	return 30 - (month == months.IYYAR ||
	month == months.TAMUZ ||
	month == months.ELUL ||
	month == months.TEVET ||
	month == months.ADAR_II ||
	(month == months.ADAR_I && !LEAP(year)) ||
	(month == months.CHESHVAN && !lngChesh(year)) ||
	(month == months.KISLEV && shrtKis(year)));
};

exports.monthNum = function(month) {
	return typeof month === 'number' ? month :
		month[charCodeAt](0) >= 1488 && month[charCodeAt](0) <= 1514 && /('|")/.test(month) ? gematriya(month) :
			month[charCodeAt](0) >= 48 && month[charCodeAt](0) <= 57 /* number */ ? parseInt(month, 10) : monthFromName(month);
};

exports.dayYearNum = function(str) {
	return typeof str === 'number' ? str :
		str[charCodeAt](0) >= 1488 && str[charCodeAt](0) <= 1514 ? gematriya(str, true) : parseInt(str, 10);
};

/* Days from sunday prior to start of Hebrew calendar to mean
   conjunction of Tishrei in Hebrew YEAR
 */
function hebElapsedDays(hYear){
	// borrowed from original JS
	var m_elapsed = 235 * Math.floor((hYear - 1) / 19) +
		12 * ((hYear - 1) % 19) +
		Math.floor(((((hYear - 1) % 19) * 7) + 1) / 19);

	var p_elapsed = 204 + (793 * (m_elapsed % 1080));

	var h_elapsed = 5 + (12 * m_elapsed) +
		793 * Math.floor(m_elapsed / 1080) +
		Math.floor(p_elapsed / 1080);

	var parts = (p_elapsed % 1080) + 1080 * (h_elapsed % 24);

	var day = 1 + 29 * m_elapsed + Math.floor(h_elapsed / 24);
	var alt_day = day + ((parts >= 19440) ||
		((2 == (day % 7)) && (parts >= 9924) && !(LEAP (hYear))) ||
		((1 == (day % 7)) && (parts >= 16789) && LEAP (hYear - 1)));

	return alt_day + ((alt_day % 7) === 0 ||
		(alt_day % 7) == 3 ||
		(alt_day % 7) == 5);
}
exports.hebElapsedDays = hebElapsedDays;

/* Number of days in the hebrew YEAR */
function daysInYear(year)
{
	return hebElapsedDays(year + 1) - hebElapsedDays(year);
}
exports.daysInYear = daysInYear;

/* true if Cheshvan is long in Hebrew YEAR */
function lngChesh(year) {
	return (daysInYear(year) % 10) == 5;
}
exports.lngChesh = lngChesh;

/* true if Kislev is short in Hebrew YEAR */
function shrtKis(year) {
	return (daysInYear(year) % 10) == 3;
}
exports.shrtKis = shrtKis;

function monthFromName(c) {
	/*
	the Hebrew months are unique to their second letter
	N         Nisan  (November?)
	I         Iyyar
	E        Elul
	C        Cheshvan
	K        Kislev
	1        1Adar
	2        2Adar
	Si Sh     Sivan, Shvat
	Ta Ti Te Tamuz, Tishrei, Tevet
	Av Ad    Av, Adar

	אב אד אי אל   אב אדר אייר אלול
	ח            חשון
	ט            טבת
	כ            כסלו
	נ            ניסן
	ס            סיון
	ש            שבט
	תמ תש        תמוז תשרי
	*/
	switch (c.toLowerCase()[0]) {
		case 'n':
		case 'נ':
			return (c.toLowerCase()[1] == 'o') ?    /* this catches "november" */
				0 : months.NISAN;
		case 'i':
			return months.IYYAR;
		case 'e':
			return months.ELUL;
		case 'c':
		case 'ח':
			return months.CHESHVAN;
		case 'k':
		case 'כ':
			return months.KISLEV;
		case 's':
			switch (c.toLowerCase()[1]) {
				case 'i':
					return months.SIVAN;
				case 'h':
					return months.SHVAT;
				default:
					return 0;
			}
		case 't':
			switch (c.toLowerCase()[1]) {
				case 'a':
					return months.TAMUZ;
				case 'i':
					return months.TISHREI;
				case 'e':
					return months.TEVET;
			}
			break;
		case 'a':
			switch (c.toLowerCase()[1]) {
				case 'v':
					return months.AV;
				case 'd':
					if (/(1|[^i]i|a|א)$/i.test(c)) {
						return months.ADAR_I;
					}
					return months.ADAR_II; // else assume sheini
			}
			break;
		case 'ס':
			return months.SIVAN;
		case 'ט':
			return months.TEVET;
		case 'ש':
			return months.SHVAT;
		case 'א':
			switch (c.toLowerCase()[1]) {
				case 'ב':
					return months.AV;
				case 'ד':
					if (/(1|[^i]i|a|א)$/i.test(c)) {
						return months.ADAR_I;
					}
					return months.ADAR_II; // else assume sheini
				case 'י':
					return months.IYYAR;
				case 'ל':
					return months.ELUL;
			}
			break;
		case 'ת':
			switch (c.toLowerCase()[1]) {
				case 'מ':
					return months.TAMUZ;
				case 'ש':
					return months.TISHREI;
			}
			break;
	}
	return 0;
};
exports.monthFromName = monthFromName;

/* Note: Applying this function to d+6 gives us the DAYNAME on or after an
 * absolute day d.  Similarly, applying it to d+3 gives the DAYNAME nearest to
 * absolute date d, applying it to d-1 gives the DAYNAME previous to absolute
 * date d, and applying it to d+7 gives the DAYNAME following absolute date d.

**/
exports.dayOnOrBefore = function(day_of_week, absdate) {
	return absdate - ((absdate - day_of_week) % 7);
};

exports.map = function(self, fun, thisp) {
	// originally written for http://github.com/Scimonster/localbrowse
	if (self === null || typeof fun != 'function') {
		throw new TypeError();
	}
	var t = Object(self);
	var res = {};
	for (var i in t) {
		if (t.hasOwnProperty(i)) {
			res[i] = fun.call(thisp, t[i], i, t);
		}
	}
	if (Array.isArray(self) || typeof self == 'string') { // came as an array, return an array
		var arr = [];
		for (i in res) {
			arr[Number(i)] = res[i];
		}
		res = filter(arr, true); // for...in isn't guaranteed to give any meaningful order
		if (typeof self == 'string') {
			res = res.join('');
		}
	}
	return res;
};

function filter(self, fun, thisp) {
	if (self === null) {
		throw new TypeError('self is null');
	}
	switch (typeof fun) {
		case 'function':
			break; // do nothing
		case 'string':
		case 'number':
			return self[fun]; // str/num is just the property
		case 'boolean':
			// boolean shortcuts to filter only truthy/falsy values
			if (fun) {
				fun = function (v) {
					return v;
				};
			} else {
				fun = function (v) {
					return !v;
				};
			}
			break;
		case 'object':
			var funOrig = fun; // save it
			if (fun instanceof RegExp) { // test the val against the regex
				fun = function (v) {
					return funOrig.test(v);
				};
				break;
			} else if (Array.isArray(fun)) { // keep these keys
				fun = function (v, k) {
					return funOrig.indexOf(k) > -1;
				};
				break;
			}
		default:
			throw new TypeError('fun is not a supported type');
	}
	var res = {};
	var t = Object(self);
	for (var i in t) {
		if (t.hasOwnProperty(i)) {
			var val = t[i]; // in case fun mutates it
			if (fun.call(thisp, val, i, t)) {
				// define property on res in the same manner as it was originally defined
				var props = Object.getOwnPropertyDescriptor(t, i);
				props.value = val;
				Object.defineProperty(res, i, props);
			}
		}
	}
	if (Array.isArray(self) || typeof self == 'string') { // came as an array, return an array
		var arr = [];
		for (i in res) {
			arr[Number(i)] = res[i];
		}
		res = arr.filter(function (v) {
			return v;
		}); // for...in isn't guaranteed to give any meaningful order
		// can't use c.filter(arr,true) here because that would infitely recurse
		if (typeof self == 'string') {
			res = res.join('');
		}
	}
	return res;
}
exports.filter = filter;

exports.range = function(start, end, step) {
	step = step || 1;
	if (step < 0) {
		step = 0 - step;
	}

	var arr = [], i = start;
	if (start < end) {
		for (; i <= end; i += step) {
			arr.push(i);
		}
	} else {
		for (; i >= end; i -= step) {
			arr.push(i);
		}
	}
	return arr;
};
