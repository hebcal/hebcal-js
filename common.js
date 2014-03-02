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
	monthNames.concat([["Adar I", 0, "אדר א'"],["Adar II", 0, "אדר ב'"],["Nisan", 0, "ניסן"]])
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

exports.LANGUAGE = function LANGUAGE(str, opts){
	return opts == 'h' && str[2] || (opts == 'a' && str[1] || str[0]);
};

function LEAP_YR_HEB(x) {
	return (1 + x * 7) % 19 < 7 ? true : false;
}
exports.LEAP_YR_HEB = LEAP_YR_HEB;

exports.MONTHS_IN_HEB = function MONTHS_IN_HEB(x) {
	return 12 + LEAP_YR_HEB(x); // boolean is cast to 1 or 0
};

exports.max_days_in_heb_month = function max_days_in_heb_month(month, year) {
	return 30 - (month == months.IYYAR ||
	month == months.TAMUZ || 
	month == months.ELUL ||
	month == months.TEVET || 
	month == months.ADAR_II ||
	(month == months.ADAR_I && !LEAP_YR_HEB(year)) ||
	(month == months.CHESHVAN && !long_cheshvan(year)) ||
	(month == months.KISLEV && short_kislev(year)));
};

exports.monthNum = function monthNum(month) {
	return typeof month === 'number' ? month :
		month[charCodeAt](0) >= 1488 && month[charCodeAt](0) <= 1514 && /('|")/.test(month) ? gematriya(month) :
			month[charCodeAt](0) >= 48 && month[charCodeAt](0) <= 57 /* number */ ? parseInt(month, 10) : lookup_hebrew_month(month);
};

exports.dayYearNum = function dayYearNum(str) {
	return typeof str === 'number' ? str :
		str[charCodeAt](0) >= 1488 && str[charCodeAt](0) <= 1514 ? gematriya(str) : parseInt(str, 10);
};

/* Days from sunday prior to start of hebrew calendar to mean
   conjunction of tishrei in hebrew YEAR 
 */
function hebrew_elapsed_days(hYear){
	// borrowed from original JS
	var yearl = hYear;
	var m_elapsed = 235 * Math.floor((yearl - 1) / 19) +
		12 * ((yearl - 1) % 19) +
		Math.floor(((((yearl - 1) % 19) * 7) + 1) / 19);
	
	var p_elapsed = 204 + (793 * (m_elapsed % 1080));
	
	var h_elapsed = 5 + (12 * m_elapsed) +
		793 * Math.floor(m_elapsed / 1080) +
		Math.floor(p_elapsed / 1080);
	
	var parts = (p_elapsed % 1080) + 1080 * (h_elapsed % 24);
	
	var day = 1 + 29 * m_elapsed + Math.floor(h_elapsed / 24);
	var alt_day = day + ((parts >= 19440) ||
		((2 == (day % 7)) && (parts >= 9924) && !(LEAP_YR_HEB (hYear))) ||
		((1 == (day % 7)) && (parts >= 16789) && LEAP_YR_HEB (hYear - 1)));

	return alt_day + ((alt_day % 7) === 0 ||
		(alt_day % 7) == 3 ||
		(alt_day % 7) == 5);
}
exports.hebrew_elapsed_days = hebrew_elapsed_days;

/* Number of days in the hebrew YEAR */
function days_in_heb_year(year)
{
	return hebrew_elapsed_days(year + 1) - hebrew_elapsed_days(year);
}
exports.days_in_heb_year = days_in_heb_year;

/* true if Cheshvan is long in hebrew YEAR */
function long_cheshvan(year) {
	return (days_in_heb_year(year) % 10) == 5;
}
exports.long_cheshvan = long_cheshvan;

/* true if Kislev is short in hebrew YEAR */
function short_kislev(year) {
	return (days_in_heb_year(year) % 10) == 3;
}
exports.short_kislev = short_kislev;

function lookup_hebrew_month(c) {
	/*
	the Hebrew months are unique to their second letter
	N         nisan  (november?)
	I         iyyar
	E        Elul
	C        Cheshvan
	K        Kislev
	1        1Adar
	2        2Adar   
	Si Sh     sivan, Shvat
	Ta Ti Te Tamuz, Tishrei, Tevet
	Av Ad    Av, Adar

	אב אד אי אל   אב אדר אייר אלול
	ח            חשון
	ט            טבת
	כ            כסלב
	נ            ניסן
	ס            סיון
	ש            שבט
	תמ תש        תמוז תשרי
	*/
	switch (c.toLowerCase()[0]) {
		case 'n':
		case 'נ':
			return (c.toLowerCase()[1] == 'o') ?	/* this catches "november" */
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
					if (c.indexOf('2') > -1 || /ii/i.test(c) || /b/i.test(c)) {
						return months.ADAR_II;
					}
					return months.ADAR_I; // else assume rishon
			}
			break;
		case 'ס':
			return months.SIVAN;
		case 'ש':
			return months.SHVAT;
		case 'א':
			switch (c.toLowerCase()[1]) {
				case 'ב':
					return months.AV;
				case 'ד':
					if (c.indexOf('2') > -1 || c.indexOf('ב', 1) > 1) {
						return months.ADAR_II;
					}
					return months.ADAR_I; // else assume rishon
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
exports.lookup_hebrew_month = lookup_hebrew_month;

/* Note: Applying this function to d+6 gives us the DAYNAME on or after an
 * absolute day d.  Similarly, applying it to d+3 gives the DAYNAME nearest to
 * absolute date d, applying it to d-1 gives the DAYNAME previous to absolute
 * date d, and applying it to d+7 gives the DAYNAME following absolute date d.

**/
exports.day_on_or_before = function day_on_or_before(day_of_week, absdate) {
	return absdate - ((absdate - day_of_week) % 7);
};

exports.map = function map(self, fun, thisp, sameprops) {
	// originally written for http://github.com/Scimonster/localbrowse
	if (self === null || typeof fun != 'function') {
		throw new TypeError();
	}
	var t = Object(self);
	var res = {};
	for (var i in t) {
		if (t.hasOwnProperty(i)) {
			var val = fun.call(thisp, t[i], i, t);
			if (sameprops) {
				// the new property should have the same enumerate/write/etc as the original
				var props = Object.getOwnPropertyDescriptor(t, i);
				props.value = val;
				Object.defineProperty(res, i, props);
			} else {
				res[i] = val;
			}
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

function gematriya(num, limit) {
	if (typeof num !== 'number' && typeof num !== 'string') {
		throw new TypeError('non-number or string given to gematriya()');
	}
	var str = typeof num === 'string';
	if (str) {
		num = num.replace(/('|")/g,'');
	}
	if (!str && limit && limit - num.toString().length < 0) {
		num = num.toString().split('').reverse().slice(0, limit - num.toString().length).reverse().join('');
	}
	num = num.toString().split('').reverse();
	var letters = {
		0: '',
		1: 'א',
		2: 'ב',
		3: 'ג',
		4: 'ד',
		5: 'ה',
		6: 'ו',
		7: 'ז',
		8: 'ח',
		9: 'ט',
		10: 'י',
		20: 'כ',
		30: 'ל',
		40: 'מ',
		50: 'נ',
		60: 'ס',
		70: 'ע',
		80: 'פ',
		90: 'צ',
		100: 'ק',
		200: 'ר',
		300: 'ש',
		400: 'ת',
		500: 'תק',
		600: 'תר',
		700: 'תש',
		800: 'תת',
		900: 'תתק',
		1000: 'תתר'
	}, numbers = {
		'א': 1,
		'ב': 2,
		'ג': 3,
		'ד': 4,
		'ה': 5,
		'ו': 6,
		'ז': 7,
		'ח': 8,
		'ט': 9,
		'י': 10,
		'כ': 20,
		'ל': 30,
		'מ': 40,
		'נ': 50,
		'ס': 60,
		'ע': 70,
		'פ': 80,
		'צ': 90,
		'ק': 100,
		'ר': 200,
		'ש': 300,
		'ת': 400,
		'תק': 500,
		'תר': 600,
		'תש': 700,
		'תת': 800,
		'תתק': 900,
		'תתר': 1000
	};

	num = num.map(function g(n,i){
		if (str) {
			return numbers[n] < numbers[num[i - 1]] && numbers[n] < 100 ? numbers[n] * 1000 : numbers[n];
		} else {
			if (parseInt(n, 10) * Math.pow(10, i) > 1000) {
				return g(n, i-3);
			}
			return letters[parseInt(n, 10) * Math.pow(10, i)];
		}
	});

	if (str) {
		return num.reduce(function(o,t){
			return o + t;
		}, 0);
	} else {
		num = num.reverse().join('').replace(/יה/g,'טו').replace(/יו/g,'טז').split('');

		if (num.length === 1) {
			num.push("'");
		} else if (num.length > 1) {
			num.splice(-1, 0, '"');
		}

		return num.join('');
	}
};
exports.gematriya = gematriya;

exports.range = function range(start, end, step) {
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