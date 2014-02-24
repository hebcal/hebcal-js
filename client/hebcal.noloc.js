;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

// name, lat, long, Israel
var cities = {
	"Ashdod": [ 31.8, 34.633, true ],
	"Atlanta": [ 33.75, -84.383, false ],
	"Austin": [ 30.266, -97.75, false ],
	"Baghdad": [ 33.233, 44.366, false ],
	"Beer Sheva": [ 31.25, 34.783, true ],
	"Berlin": [ 52.516, 13.4, false ],
	"Baltimore": [ 39.283, -76.6, false ],
	"Bogota": [ 4.6, -74.083, false ],
	"Boston": [ 42.333, -71.066, false ],
	"Buenos Aires": [ -34.616, -58.4, false ],
	"Buffalo": [ 42.883, -78.866, false ],
	"Chicago": [ 41.833, -87.75, false ],
	"Cincinnati": [ 39.1, -84.516, false ],
	"Cleveland": [ 41.5, -81.683, false ],
	"Dallas": [ 32.783, -96.8, false ],
	"Denver": [ 39.733, -104.983, false ],
	"Detroit": [ 42.333, -83.033, false ],
	"Eilat": [ 29.55, 34.95, true ],
	"Gibraltar": [ 36.133, -5.35, false ],
	"Haifa": [ 32.816, 34.983, true ],
	"Hawaii": [ 19.5, -155.5, false ],
	"Houston": [ 29.766, -95.366, false ],
	"Jerusalem": [ 31.783, 35.233, true ],
	"Johannesburg": [ -26.166, 28.033, false ],
	"Kiev": [ 50.466, 30.483, false ],
	"La Paz": [ -16.5, -68.15, false ],
	"Livingston": [ 40.283, -74.3, false ],
	"London": [ 51.5, -0.166, false ],
	"Los Angeles": [ 34.066, -118.25, false ],
	"Miami": [ 25.766, -80.2, false ],
	"Melbourne": [ -37.866, 145.133, false ],
	"Mexico City": [ 19.4, -99.15, false ],
	"Montreal": [ 45.5, -73.6, false ],
	"Moscow": [ 55.75, 37.7, false ],
	"New York": [ 40.716, -74.016, false ],
	"Omaha": [ 41.266, -95.933, false ],
	"Ottawa": [ 45.7, -76.183, false ],
	"Panama City": [ 8.966, -79.533, false ],
	"Paris": [ 48.866, 2.333, false ],
	"Petach Tikvah": [ 32.083, 34.883, true ],
	"Philadelphia": [ 39.95, -75.166, false ],
	"Phoenix": [ 33.45, -112.066, false ],
	"Pittsburgh": [ 40.433, -80, false ],
	"Saint Louis": [ 38.633, -90.2, false ],
	"Saint Petersburg": [ 59.883, 30.25, false ],
	"San Francisco": [ 37.783, -122.416, false ],
	"Seattle": [ 47.6, -122.333, false ],
	"Sydney": [ -33.916, 151.283, false ],
	"Tel Aviv": [ 32.083, 34.766, true ],
	"Tiberias": [ 32.966, 35.533, true ],
	"Toronto": [ 43.633, -79.4, false ],
	"Vancouver": [ 49.266, -123.116, false ],
	"White Plains": [ 41.033, -73.75, false ],
	"Washington DC": [ 38.916, -77, false ]
};

exports.getCity = function getCity(city) {
	city = city.split(/\s+/).map(function(w,i,c){
		if (c.join(' ').toLowerCase() === 'washington dc' && i === 1) { // special case
			return w.toUpperCase();
		}
		return w[0].toUpperCase() + w.slice(1).toLowerCase();
	}).join(' ');
	return cities[city] || [ 0, 0, false ];
};

exports.listCities = function listCities() {
	return Object.keys(cities);
};

exports.addCity = function addCity(city, info) {
	if (!Array.isArray(info)) {
		throw new TypeError('adding non-array city');
	}
	if (info.length == 5) {
		var i = info.slice();
		info = [];
		info[0] = (i[0] * 60 + i[1]) / 60;
		info[1] = (i[2] * 60 + i[3]) / 60;
		info[2] = i[4];
	}
	if (info.length != 3) {
		throw new TypeError('length of city array is not 3');
	}
	city = city.split(/\s+/).map(function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase()}).join(' ');
	cities[city] = info;
};

exports.getLocation = function getLocation(cityInfo) {
	return {
		lat: cityInfo[0],
		long: cityInfo[1]
	};
};

exports.nearest = function nearest(lat, lon) {
	if (Array.isArray(lat)) {
		lat = (lat[0] * 60 + lat[1]) / 60;
	}
	if (Array.isArray(lon)) {
		lon = (lon[0] * 60 + lon[1]) / 60;
	}
	if (typeof lat != 'number') {
		throw new TypeError('incorrect lat type passed to nearest()');
	}
	if (typeof lon != 'number') {
		throw new TypeError('incorrect long type passed to nearest()');
	}

	return exports.listCities().map(function(city){
		var i = exports.getLocation(exports.getCity(city));
		return {
			name: city,
			dist: Math.sqrt( Math.pow(Math.abs(i.lat - lat), 2) + Math.pow(Math.abs(i.long - lon), 2) )
		};
	}).reduce(function(close,city){
		return close.dist < city.dist ? close : city;
	}).name;
};
},{}],2:[function(require,module,exports){
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
window.Hebcal = require('..');

var finished = false, warn = (typeof console != 'undefined' && (console.warn || console.log)) || function(){};

Hebcal.events.on('newListener', function(e){
	if (e === 'ready' && !finished && Hebcal.ready) {
		finished = Hebcal.events.emit('ready');
	}
});

Object.defineProperty(Hebcal, 'onready', {
	configurable: true,

	get: function() {
		warn('Getting deprecated property Hebcal.onready');
		return Hebcal.events.listeners('ready')[0];
	},
	set: function(func) {
		warn('Setting deprecated property Hebcal.onready; use Hebcal.events.on(\'ready\', func) instead');
		Hebcal.events.on('ready', func);
	}
});

Hebcal.ready = true;
finished = Hebcal.events.emit('ready');
},{"..":7}],3:[function(require,module,exports){
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

var monthNames = exports.monthNames = [
	[
		["VOID",null,"VOID"],
		["Nisan",null,"ניסן"],
		["Iyyar",null,"אייר"],
		["Sivan",null,"סיון"],
		["Tamuz",null,"תמוז"],
		["Av",null,"אב"],
		["Elul",null,"אלול"],
		["Tishrei",null,"תשרי"],
		["Cheshvan",null,"חשון"],
		["Kislev",null,"כסלו"],
		["Tevet",null,"טבת"],
		["Sh'vat",null,"שבט"],
		["Adar",null,"אדר"],
		["Nisan",null,"ניסן"]
	], [
		["VOID",null,"VOID"],
		["Nisan",null,"ניסן"],
		["Iyyar",null,"אייר"],
		["Sivan",null,"סיון"],
		["Tamuz",null,"תמוז"],
		["Av",null,"אב"],
		["Elul",null,"אלול"],
		["Tishrei",null,"תשרי"],
		["Cheshvan",null,"חשון"],
		["Kislev",null,"כסלו"],
		["Tevet",null,"טבת"],
		["Sh'vat",null,"שבט"],
		["Adar I",null,"אדר א'"],
		["Adar II",null,"אדר ב'"],
		["Nisan",null,"ניסן"]
	]
];

var days = exports.days = {
	SUN: 0,
	MON: 1,
	TUE: 2,
	WED: 3,
	THU: 4,
	FRI: 5,
	SAT: 6
};

function LANGUAGE(str, opts){
	return (opts === 'h' && str[2] ? str[2] : (opts === 'a' && str[1] ? str[1] : str[0]));
}
exports.LANGUAGE = LANGUAGE;

function LEAP_YR_HEB(x) {
	return (1 + x * 7) % 19 < 7 ? true : false;
}
exports.LEAP_YR_HEB = LEAP_YR_HEB;

function MONTHS_IN_HEB(x) {
	return 12 + LEAP_YR_HEB(x); // boolean is cast to 1 or 0
}
exports.MONTHS_IN_HEB = MONTHS_IN_HEB;

function max_days_in_heb_month(month, year) {
	return 30 - (month == months.IYYAR ||
	month == months.TAMUZ || 
	month == months.ELUL ||
	month == months.TEVET || 
	month == months.ADAR_II ||
	(month == months.ADAR_I && !LEAP_YR_HEB(year)) ||
	(month == months.CHESHVAN && !long_cheshvan(year)) ||
	(month == months.KISLEV && short_kislev(year)));
}
exports.max_days_in_heb_month = max_days_in_heb_month;


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
	var alt_day;

	if ((parts >= 19440) ||
		((2 == (day % 7)) && (parts >= 9924) && !(LEAP_YR_HEB (hYear))) ||
		((1 == (day % 7)) && (parts >= 16789) && LEAP_YR_HEB (hYear - 1)))
		alt_day = day + 1;
	else
		alt_day = day;
	
	if ((alt_day % 7) === 0 ||
		(alt_day % 7) === 3 ||
		(alt_day % 7) === 5)
		return alt_day + 1;
	else
		return alt_day;

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
  /* the Hebrew months are unique to their second letter
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
				0
				: months.NISAN;
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
				default:
					return 0;
			}
		case 'a':
			switch (c.toLowerCase()[1]) {
				case 'v':
					return months.AV;
				case 'd':
					if (c.indexOf('2') > -1 || /ii/i.test(c)) {
						return months.ADAR_II;
					}
					return months.ADAR_I;	/* else assume rishon */
				default:
					return 0;
			}
		case 'ס':
			return months.SIVAN;
		case 'ש':
			return months.SHVAT;
		case 'א':
			switch (c.toLowerCase()[1]) {
				case 'ב':
					return months.AV;
				case 'ד':
					if (c.indexOf('1') > -1 || c.indexOf('א', 1) > 1) {
						return months.ADAR_I;
					}
					return months.ADAR_II;	/* else assume sheni */
				case 'י':
					return months.IYYAR;
				case 'ל':
					return months.ELUL;
				default:
					return 0;
			}
		case 'ת':
			switch (c.toLowerCase()[1]) {
				case 'מ':
					return months.TAMUZ;
				case 'ש':
					return months.TISHREI;
				default:
					return 0;
			}
		default:
			return 0;
	}
}
exports.lookup_hebrew_month = lookup_hebrew_month;

/* Note: Applying this function to d+6 gives us the DAYNAME on or after an
 * absolute day d.  Similarly, applying it to d+3 gives the DAYNAME nearest to
 * absolute date d, applying it to d-1 gives the DAYNAME previous to absolute
 * date d, and applying it to d+7 gives the DAYNAME following absolute date d.

**/
function day_on_or_before(day_of_week, absdate) {
	return absdate - ((absdate - day_of_week) % 7);
}
exports.day_on_or_before = day_on_or_before;

function map(self, fun, thisp, sameprops) {
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
		res = arr.filter(function (v) {
			return v;
		}); // for...in isn't guaranteed to give any meaningful order
		if (typeof self == 'string') {
			res = res.join('');
		}
	}
	return res;
}
exports.map = map;

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
		// can't use obj.filter(arr,true) here because that would infitely recurse
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
}
exports.gematriya = gematriya;

function range(start, end, step) {
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
}
exports.range = range;
},{}],4:[function(require,module,exports){
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
var c = require('./common'), greg = require('./greg');

var shas = [
	// sname, aname, hname, blatt
	[ "Berachot",       "Berachos",         "ברכות",         64  ],
	[ "Shabbat",        "Shabbos",          "שבת",          157 ],
	[ "Eruvin",         "Eruvin",           "ערובין",         105 ],
	[ "Pesachim",       "Pesachim",         "פסחים",         121 ],
	[ "Shekalim",       "Shekalim",         "שקלים",         22  ],
	[ "Yoma",           "Yoma",             "יומא",           88  ],
	[ "Sukkah",         "Sukkah",           "סוכה",          56  ],
	[ "Beitzah",        "Beitzah",          "ביצה",          40  ],
	[ "Rosh Hashana",   "Rosh Hashana",     "ראש השנה",      35  ],
	[ "Taanit",         "Taanis",           "תענית",          31  ],
	[ "Megillah",       "Megillah",         "מגילה",          32  ],
	[ "Moed Katan",     "Moed Katan",       "מועד קטן",       29  ],
	[ "Chagigah",       "Chagigah",         "חגיגה",          27  ],
	[ "Yevamot",        "Yevamos",          "יבמות",          122 ],
	[ "Ketubot",        "Kesubos",          "כתובות",         112 ],
	[ "Nedarim",        "Nedarim",          "נדרים",          91  ],
	[ "Nazir",          "Nazir",            "נזיר",           66  ],
	[ "Sotah",          "Sotah",            "סוטה",          49  ],
	[ "Gitin",          "Gitin",            "גיטין",           90  ],
	[ "Kiddushin",      "Kiddushin",        "קידושין",         82  ],
	[ "Baba Kamma",     "Baba Kamma",       "בבא קמא",      119 ],
	[ "Baba Metzia",    "Baba Metzia",      "בבא מציעא",     119 ],
	[ "Baba Batra",     "Baba Basra",       "בבא בתרא",     176 ],
	[ "Sanhedrin",      "Sanhedrin",        "סנהדרין",        113 ],
	[ "Makkot",         "Makkos",           "מכות",          24  ],
	[ "Shevuot",        "Shevuos",          "שבועות",        49  ],
	[ "Avodah Zarah",   "Avodah Zarah",     "עבודה זרה",     76  ],
	[ "Horayot",        "Horayos",          "הוריות",         14  ],
	[ "Zevachim",       "Zevachim",         "זבכים",         120 ],
	[ "Menachot",       "Menachos",         "מנחות",         110 ],
	[ "Chullin",        "Chullin",          "חולין",          142 ],
	[ "Bechorot",       "Bechoros",         "בכורות",         61  ],
	[ "Arachin",        "Arachin",          "ערכין",          34  ],
	[ "Temurah",        "Temurah",          "תמורה",         34  ],
	[ "Keritot",        "Kerisos",          "כריתות",         28  ],
	[ "Meilah",         "Meilah",           "מעילה",         22  ],
	[ "Kinnim",         "Kinnim",           "כינים",          4   ],
	[ "Tamid",          "Tamid",            "תמיד",          10  ],
	[ "Midot",          "Midos",            "מידות",          4   ],
	[ "Niddah",         "Niddah",           "נידה",           73  ]
].map(function(m){
	return {name: m.slice(0,3), blatt: m[3]};
});

function dafyomi(gregdate) {
	var dafcnt = 40, cno, dno, osday, nsday, total, count, j, cday, blatt, tmp_date;

	if (!(gregdate instanceof Date)) {
		throw new TypeError('non-date given to dafyomi');
	}

	osday = greg.greg2abs(new Date(1923, 8, 11));
	nsday = greg.greg2abs(new Date(1975, 5, 24));
	cday = greg.greg2abs(gregdate);

	if (cday < osday) { // no cycle; dy didn't start yet
		return {name: [], blatt: 0};
	}
	if (cday >= nsday) { // "new" cycle
		cno = 8 + ( (cday - nsday) / 2711 );
		dno = (cday - nsday) % 2711;
	} else { // old cycle
		cno = 1 + ( (cday - osday) / 2702 );
		dno = (cday - osday) / 2702;
	}

	// Find the daf taking note that the cycle changed slightly after cycle 7.

	total = blatt = 0;
	count = -1;

	// Fix Shekalim for old cycles
	if (cno <= 7) {
		shas[4].blatt = 13;
	} else {
		shas[4].blatt = 22;
	}

	// Find the daf
	j = 0;
	while (j < dafcnt) {
		count++;
		total = total + shas[j].blatt - 1;
		if (dno < total) {
			blatt = (shas[j].blatt + 1) - (total - dno);
			// fiddle with the weird ones near the end
			switch (count) {
				case 36:
					blatt = blatt + 21;
					break;
				case 37:
					blatt = blatt + 24;
					break;
				case 38:
					blatt = blatt + 33;
					break;
				default:
					break;
			}
			// Bailout
			j = 1 + dafcnt;
		}
		j++;
	}

	return {name: shas[count].name, blatt: blatt};
}
exports.dafyomi = dafyomi;

function dafname(daf, o) {
	return c.LANGUAGE(daf.name, o) + ' ' + (o === 'h' ? c.gematriya(daf.blatt) : daf.blatt);
}
exports.dafname = dafname;
},{"./common":3,"./greg":5}],5:[function(require,module,exports){
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
exports.monthNames = [
	'',
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

exports.lookupMonthNum = function lookupMonthNum(month) {
	return new Date(month + ' 1').getMonth() + 1;
};

exports.monthLengths = [
	[0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	[0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
];

exports.daysInMonth = function daysInMonth(month, year) { // 1 based months
	return exports.monthLengths[+LEAP(year)][month];
};

exports.shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayOfYear (date) {
	if (!date instanceof Date) {
		throw new TypeError('Argument to greg.dayOfYear not a Date');
	}
	var doy = date.getDate() + 31 * date.getMonth();
	if (date.getMonth() > 1) { // FEB
		doy -= Math.floor((4 * (date.getMonth() + 1) + 23) / 10);
		if (LEAP(date.getFullYear())) {
			doy++;
		}
	}
	return doy;
}
exports.dayOfYear = dayOfYear;

function LEAP (year) {
	return !(year % 4) && ( !!(year % 100) || !(year % 400) );
}
exports.LEAP = LEAP;

exports.greg2abs = function greg2abs(date) { // "absolute date"
	return (dayOfYear(date) + // days this year
			365 * (date.getFullYear() - 1) + // + days in prior years
			( Math.floor((date.getFullYear() - 1) / 4) - // + Julian Leap years
			Math.floor((date.getFullYear() - 1) / 100) + // - century years
			Math.floor((date.getFullYear() - 1) / 400))); // + Gregorian leap years
};


/*
 * See the footnote on page 384 of ``Calendrical Calculations, Part II:
 * Three Historical Calendars'' by E. M. Reingold,  N. Dershowitz, and S. M.
 * Clamen, Software--Practice and Experience, Volume 23, Number 4
 * (April, 1993), pages 383-404 for an explanation.
 */
exports.abs2greg = function abs2greg(theDate) {
// calculations copied from original JS code

	var d0 = theDate - 1;
	var n400 = Math.floor(d0 / 146097);
	var d1 =  Math.floor(d0 % 146097);
	var n100 =  Math.floor(d1 / 36524);
	var d2 = d1 % 36524;
	var n4 =  Math.floor(d2 / 1461);
	var d3 = d2 % 1461;
	var n1 =  Math.floor(d3 / 365);

	var day = ((d3 % 365) + 1);
	var year = (400 * n400 + 100 * n100 + 4 * n4 + n1);

	if (4 == n100 || 4 == n1) {
		return new Date(year, 11, 31);
	}

	year++;


	var d = new Date(year, 0, day); // new Date() is very smart
	d.setFullYear(year);
	return d;


	console.log(year)
	var month = 1, mlen;
	console.log(month)
	console.log(day)
	while ((mlen = exports.monthLengths[+LEAP(year)][month]) < day){
		day -= mlen;
		month++;
	console.log(month)
	console.log(day)
	}
	var d = new Date(year, month-1, day);
	d.setFullYear(year);
	console.log(d)
	return d;
};
},{}],6:[function(require,module,exports){
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
	greg = require('./greg'),
	suncalc = require('suncalc'),
	cities = require('./cities');

suncalc.addTime(-16.1, 'alot_hashacher', undefined);
suncalc.addTime(-11.5, 'misheyakir', undefined);
suncalc.addTime(-10.2, 'misheyakir_machmir', undefined);
suncalc.addTime(-8.5, undefined, 'tzeit');

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
				var d = new HDate(day.getDate(), day.getMonth(), day.getFullYear());
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
			return new HDate(day, month, (new HDate()).getFullYear());
		case 3:
			this.day = 1;
			this.month = 1;
			this.year = typeof year === 'number' ? year :
				year.toString().charCodeAt(0) >= 1488 && year.toString().charCodeAt(0) <= 1514 ? c.gematriya(year.toString()) : parseInt(year, 10);

			this.setMonth(typeof month === 'number' ? month :
				month.charCodeAt(0) >= 1488 && month.charCodeAt(0) <= 1514 && /('|")/.test(month) ? c.gematriya(month) :
					month.charCodeAt(0) >= 48 && month.charCodeAt(0) <= 57 /* number */ ? parseInt(month, 10) : c.lookup_hebrew_month(month));
			this.setDate(typeof day === 'number' ? day :
				day.charCodeAt(0) >= 1488 && day.charCodeAt(0) <= 1514 ? c.gematriya(day) : parseInt(day, 10));
			
			fixMonth(this);
			fixDate(this);

			break;
		default:
			throw new TypeError('HDate called with bad arguments');
	}

	this.il = false;
	this.setLocation.apply(this, HDate.defaultLocation);

	return this;
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
		if (date.month == c.months.TISHREI) {
			date.year -= 1;
		}
		date.month -= 1;
		date.day += c.max_days_in_heb_month(date.month + 1, date.year);
		fixMonth(date);
		fixDate(date);
	}
	if (date.day > c.max_days_in_heb_month(date.month, date.year)) {
		if (date.month == c.months.ELUL) {
			date.year += 1;
		}
		date.month += 1;
		date.day -= c.max_days_in_heb_month(date.month -1, date.year);
		fixMonth(date);
		fixDate(date);
	}
	fixMonth(date);
}

function fixMonth(date) {
	if (date.month < 1) {
		date.year -= 1;
		date.month += c.MONTHS_IN_HEB(date.year + 1);
		fixMonth(date);
		fixDate(date);
	}
	if (date.month > c.MONTHS_IN_HEB(date.year)) {
		date.year += 1;
		date.month -= c.MONTHS_IN_HEB(date.year - 1);
		fixMonth(date);
		fixDate(date);
	}
}

HDate.prototype.getFullYear = function getFullYear() {
	return this.year;
};

HDate.prototype.isLeapYear = function isLeapYear() {
	return c.LEAP_YR_HEB(this.getFullYear());
};

HDate.prototype.getMonth = function getMonth() {
	return this.month;
};

HDate.prototype.getTishreiMonth = function getTishreiMonth() {
	return (this.getMonth() + c.MONTHS_IN_HEB(this.getFullYear()) - 6) % c.MONTHS_IN_HEB(this.getFullYear());
};

HDate.prototype.daysInMonth = function daysInMonth() {
	return c.max_days_in_heb_month(this.getMonth(), this.getFullYear());
};

HDate.prototype.getDate = function getDate() {
	return this.day;
};

HDate.prototype.getDay = function getDay() {
	return this.greg().getDay();
};

HDate.prototype.setFullYear = function setFullYear(year) {
	this.year = year;
	fixMonth(this);
	fixDate(this);
	return this;
};

HDate.prototype.setMonth = function setMonth(month) {
	this.month = month;
	fixMonth(this);
	fixDate(this);
	return this;
};

HDate.prototype.setTishreiMonth = function setTishreiMonth(month) {
	return this.setMonth((month + 6) % c.MONTHS_IN_HEB(this.getFullYear()) || 13);
};

HDate.prototype.setDate = function setDate(date) {
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
	var m, tempabs = d.getDate();
	
	if (d.getMonth() < c.months.TISHREI)
	{
		for (m = c.months.TISHREI; m <= c.MONTHS_IN_HEB(d.getFullYear()); m++)
			tempabs += c.max_days_in_heb_month(m, d.getFullYear());

		for (m = c.months.NISAN; m < d.getMonth(); m++)
			tempabs += c.max_days_in_heb_month(m, d.getFullYear());
	}
	else
	{
		for (m = c.months.TISHREI; m < d.getMonth(); m++)
			tempabs += c.max_days_in_heb_month(m, d.getFullYear());
	}
	
	
	ret = c.hebrew_elapsed_days(d.getFullYear()) - 1373429 + tempabs;
	return ret;
}

function abs2hebrew(d) {
	var mmap = [
		c.months.KISLEV, c.months.TEVET, c.months.SHVAT, c.months.ADAR_I, c.months.NISAN,
		c.months.IYYAR, c.months.SIVAN, c.months.TAMUZ,
		c.months.TISHREI, c.months.TISHREI, c.months.TISHREI, c.months.CHESHVAN
	], hebdate, gregdate, day, month, year;

	if (d >= 10555144) {
		throw new RangeError("parameter to abs2hebrew " + d + " out of range");
	}
	
	gregdate = greg.abs2greg(d);
	hebdate = new HDate(1, c.months.TISHREI, (year = 3760 + gregdate.getFullYear()));
	
	while (hebdate.setFullYear(year + 1), d >= hebrew2abs(hebdate)) {
		year++;
	}

	if (year >= 4635 && year < 10666) {
		// optimize search
		month = mmap[gregdate.getMonth()];
	} else {
		// we're outside the usual range, so assume nothing about hebrew/gregorian calendar drift...
		month = c.months.TISHREI;
	}

	while (d > hebrew2abs(hebdate = new HDate(c.max_days_in_heb_month(month, year), month, year))) {
		month = (month % c.MONTHS_IN_HEB(year)) + 1;
	}

	hebdate.setDate(1);
	
	day = parseInt(d - hebrew2abs(hebdate) + 1, 10);
	/* if (day < 0) {
		throw new RangeError("assertion failure d < hebrew2abs(m,d,y) => " + d + " < " + hebrew2abs(hebdate) + "!");
	} */

	hebdate.setDate(day);
	hebdate.setLocation.apply(hebdate, HDate.defaultLocation);
	
	return hebdate;
}

HDate.prototype.greg = function toGreg() {
	return greg.abs2greg(hebrew2abs(this));
};

HDate.prototype.gregEve = function gregEve() {
	return this.prev().sunset();
};

HDate.prototype.abs = function abs() {
	return hebrew2abs(this);
};

HDate.prototype.toString = function toString(o) {
	return c.LANGUAGE([this.getDate(), null, c.gematriya(this.getDate())], o).toString() + ' ' +
		this.getMonthName(o) + ' ' +
		c.LANGUAGE([this.getFullYear(), null, c.gematriya(this.getFullYear())], o).toString();
};

HDate.prototype.getMonthName = function getMonthName(o) {
	return c.LANGUAGE(c.monthNames[+this.isLeapYear()][this.getMonth()], o);
};

HDate.prototype.setCity = function setCity(city) {
	var c = cities.getCity(city);
	this.il = c[2];
	return this.setLocation(cities.getLocation(c));
};

HDate.prototype.setLocation = function setLocation(lat, lon) {
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

HDate.prototype.sunrise = function sunrise() {
	var g = this.greg(), d = new Date();
	g.setHours(d.getHours());
	g.setMinutes(d.getMinutes());

	return suncalc.getTimes(g, this.lat, this.long).sunrise;
};

HDate.prototype.sunset = function sunset() {
	var g = this.greg(), d = new Date();
	g.setHours(d.getHours());
	g.setMinutes(d.getMinutes());

	return suncalc.getTimes(g, this.lat, this.long).sunset;
};

HDate.prototype.hour = function hour() {
	return (this.sunset() - this.sunrise()) / 12; // ms in hour
};

HDate.prototype.hourMins = function hourMins() {
	// hour in ms / (1000 ms in s * 60 s in m) = mins in halachic hour
	return this.hour() / (1000 * 60);
};

HDate.prototype.nightHour = function nightHour() {
	return (this.sunrise() - this.gregEve()) / 12; // ms in hour
};

HDate.prototype.nightHourMins = function nightHourMins() {
	// hour in ms / (1000 ms in s * 60 s in m) = mins in halachic hour
	return this.nightHour() / (1000 * 60);
};

var zemanim = {
	chatzot: function chatzot(hdate) {
		return new Date(hdate.sunrise().getTime() + (hdate.hour() * 6));
	},
	chatzot_night: function chatzot_night(hdate) {
		return new Date(hdate.sunrise().getTime() - (hdate.nightHour() * 6));
	},
	alot_hashacher: function alot_hashacher(hdate) {
		var g = hdate.greg(), d = new Date();
		g.setHours(d.getHours());
		g.setMinutes(d.getMinutes());
		return suncalc.getTimes(g, hdate.lat, hdate.long).alot_hashacher;
	},
	misheyakir: function misheyakir(hdate) {
		var g = hdate.greg(), d = new Date();
		g.setHours(d.getHours());
		g.setMinutes(d.getMinutes());
		return suncalc.getTimes(g, hdate.lat, hdate.long).misheyakir;
	},
	misheyakir_machmir: function misheyakir_machmir(hdate) {
		var g = hdate.greg(), d = new Date();
		g.setHours(d.getHours());
		g.setMinutes(d.getMinutes());
		return suncalc.getTimes(g, hdate.lat, hdate.long).misheyakir_machmir;
	},
	sof_zman_shma: function sof_zman_shma(hdate) { // Gra
		return new Date(hdate.sunrise().getTime() + (hdate.hour() * 3));
	},
	sof_zman_tfilla: function sof_zman_tfilla(hdate) { // Gra
		return new Date(hdate.sunrise().getTime() + (hdate.hour() * 4));
	},
	mincha_gedola: function mincha_gedola(hdate) {
		return new Date(hdate.sunrise().getTime() + (hdate.hour() * 6.5));
	},
	mincha_ketana: function mincha_ketana(hdate) {
		return new Date(hdate.sunrise().getTime() + (hdate.hour() * 9.5));
	},
	plag_hamincha: function plag(hdate) {
		return new Date(hdate.sunrise().getTime() + (hdate.hour() * 10.75));
	},
	tzeit: function tzeit(hdate) {
		var g = hdate.greg(), d = new Date();
		g.setHours(d.getHours());
		g.setMinutes(d.getMinutes());
		return suncalc.getTimes(g, hdate.lat, hdate.long).tzeit;
	},
	neitz_hachama: function neitz(hdate) {
		return hdate.sunrise();
	},
	shkiah: function shkiah(hdate) {
		return hdate.sunset();
	}
};

HDate.prototype.getZemanim = function getZemanim() {
	return c.map(zemanim, function(z){
		return z(this);
	}, this);
};

HDate.addZeman = function addZeman(zeman, func) {
	zemanim[zeman] = func;
};

HDate.prototype.next = function next() {
	return new HDate(this.getDate() + 1, this.getMonth(), this.getFullYear());
};

HDate.prototype.prev = function prev() {
	if (this.getDate() === 1) {
		if (this.getMonth() === c.months.TISHREI) {
			return new HDate(c.max_days_in_heb_month(c.months.ELUL, this.getFullYear() -1 ), c.months.ELUL, this.getFullYear() - 1);
		} else if (this.getMonth() === c.months.NISAN) {
			return new HDate(c.max_days_in_heb_month(c.MONTHS_IN_HEB(this.getFullYear()), this.getFullYear()), c.MONTHS_IN_HEB(this.getFullYear()), this.getFullYear());
		} else {
			return new HDate(c.max_days_in_heb_month(this.getMonth() - 1, this.getFullYear()), this.getMonth() - 1, this.getFullYear());
		}
	} else {
		return new HDate(this.getDate() - 1, this.getMonth(), this.getFullYear());
	}
};

HDate.prototype.isSameDate = function isSameDate(other) {
	if (other instanceof HDate) {
		if (other.getFullYear() === -1) {
			other = new HDate(other).setFullYear(this.getFullYear());
		}
		return this.abs() === other.abs();
	}
	return false;
};

HDate.prototype.before = function before(day) {
	return new HDate(c.day_on_or_before(day, this.abs() - 1));
};

HDate.prototype.onOrBefore = function onOrBefore(day) {
	return new HDate(c.day_on_or_before(day, this.abs()));
};

HDate.prototype.nearest = function nearest(day) {
	return new HDate(c.day_on_or_before(day, this.abs() + 3));
};

HDate.prototype.onOrAfter = function onOrAfter(day) {
	return new HDate(c.day_on_or_before(day, this.abs() + 6));
};

HDate.prototype.after = function after(day) {
	return new HDate(c.day_on_or_before(day, this.abs() + 7));
};

module.exports = HDate;
},{"./cities":1,"./common":3,"./greg":5,"suncalc":9}],7:[function(require,module,exports){
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
				var m = new Hebcal.Month(i, year);
				Object.defineProperty(m, '__year', {
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

	Object.defineProperty(this, 'il', {
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

	Object.defineProperty(this, 'lat', {
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
	Object.defineProperty(this, 'long', {
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

Hebcal.prototype.isLeapYear = function isLeapYear() {
	return c.LEAP_YR_HEB(this.year);
};

Hebcal.prototype.setCity = function setCity(city) {
	this.months.forEach(function(m){
		m.setCity(city);
	});
	return this;
};

Hebcal.prototype.setLocation = function setLocation(lat, lon) {
	this.months.forEach(function(m){
		m.setLocation(lat, lon);
	});
	return this;
};

Hebcal.prototype.next = function next() {
	return new Hebcal(this.year + 1);
};

Hebcal.prototype.prev = function prev() {
	return new Hebcal(this.year - 1);
};

Hebcal.prototype.getMonth = function getMonth(month) {
	month = typeof month === 'number' ? month :
		month.charCodeAt(0) >= 1488 && month.charCodeAt(0) <= 1514 && /('|")/.test(month) ? c.gematriya(month) :
			month.charCodeAt(0) >= 48 && month.charCodeAt(0) <= 57 /* number */ ? parseInt(month, 10) : c.lookup_hebrew_month(month);
	if (month > this.months.length) {
		return this.next().getMonth(month - this.months.length);
	}
	return this.months[month > 0 ? month - 1 : this.months.length + month];
};

Hebcal.prototype.getDay = function getDay(day) {
	if (day > this.length) {
		return null;
	}
	if (day < 0) {
		return this.getDay(this.length - day);
	}
	var rosh = this.find(29, c.months.ELUL)[0].abs() + 1 - this.find(1, c.months.NISAN)[0].abs(); // number of days between Nisan and Tishrei
	console.log(rosh);
	if (day <= rosh) {
		return this.getMonth(c.months.NISAN).getDay(day);
	}
	return this.getMonth(c.months.TISHREI).getDay(day - rosh);
};

Hebcal.prototype.days = function days() {
	return [].concat.apply([], this.months.map(function(m){
		return m.days;
	}));
};

Hebcal.prototype.map = function map() {
	return [].map.apply(this.days(), arguments);
};

Hebcal.prototype.filter = function filter() {
	return [].filter.apply(this.days(), arguments);
};

Hebcal.prototype.addHoliday = function addHoliday(holiday) {
	if (!(holiday instanceof holidays.Event)) {
		throw new TypeError('non-Event passed to addHoliday()');
	}
	this.holidays.push(holiday);
	return this;
};

Hebcal.prototype.find = function find(day, month) {
	if (arguments.length === 1) {
		if (typeof day === 'string') {
			return find.strings.call(this, day);
		} else if (Array.isArray(day)) {
			return [].concat.apply([], day.map(function(d){
				return this.find[Array.isArray(d) ? 'apply' : 'call'](this, d);
			}, this));
		} else if (day instanceof HDate) {
			return this.find(day.getDate(), day.getMonth());
		} else if (day instanceof Date) {
			return this.find(new HDate(day));
		}
	} else if (arguments.length === 2) {
		if (month instanceof Hebcal.Month) {
			return month.find(day);
		} else if (Array.isArray(month)) {
			return [].concat.apply([], month.map(function(m){
				return this.find(day, m);
			}, this));
		} else if (typeof month === 'string') {
			return this.find(day,
				month.charCodeAt(0) >= 1488 && month.charCodeAt(0) <= 1514 && /('|")/.test(month) ? c.gematriya(month) :
					month.charCodeAt(0) >= 48 && month.charCodeAt(0) <= 57 /* number */ ? parseInt(month, 10) : c.lookup_hebrew_month(month)
			);
		} else if (typeof month === 'number') {
			return this.find(day, this.getMonth(month));
		}
	}
	return [];
};
Hebcal.prototype.find.strings = function strings(str) {
	if (!str.split(/\s+/).join('')) {
		return [];
	} else if (strings[str.replace(/\s/g, '_').toLowerCase()]) {
		return strings[str.replace(/\s/g, '_').toLowerCase()].call(this);
	} else if (new HDate(str).getDate()) {
		return this.find(new HDate(str));
	}
	return this.find.apply(this, str.split(/\s+/));
};
Hebcal.prototype.find.strings.rosh_chodesh = function rosh_chodesh() {
	return this.find('Rosh Chodesh', c.range(1, this.months.length));
};
Hebcal.prototype.find.strings.holidays = function holidays() {
	return [].concat.apply([], this.holidays.map(function(h){
		return this.find(h.date);
	}, this));
};
Hebcal.prototype.find.strings.omer = function omer() {
	return this.find(c.range(15+1, 15+49), c.months.NISAN);
};
Hebcal.prototype.find.strings.today = function today() {
	return this.find(new HDate());
};
Hebcal.prototype.find.strings.yesterday = function yesterday() {
	return [this.find('today')[0].prev()];
};
Hebcal.prototype.find.strings.tomorrow = function tomorrow() {
	return [this.find('today')[0].next()];
};
Hebcal.prototype.find.strings.pesach = function pesach() {
	return this.find(c.range(15, 15+8-this.il), c.months.NISAN);
};
Hebcal.prototype.find.strings.sukkot = function sukkot() {
	return this.find(c.range(15, 15+9-this.il), c.months.TISHREI);
};
Hebcal.prototype.find.strings.succot = Hebcal.prototype.find.strings.succos = Hebcal.prototype.find.strings.sukkos = Hebcal.prototype.find.strings.sukkot;
Hebcal.prototype.find.strings.shavuot = function shavuot() {
	return this.find(c.range(6, 7-this.il), c.months.SIVAN);
};
Hebcal.prototype.find.strings.shavuos = Hebcal.prototype.find.strings.shavuot;
Hebcal.prototype.find.strings.rosh_hashana = function rosh_hashana() {
	return this.find(c.range(1, 2), c.months.TISHREI);
};
Hebcal.prototype.find.strings.rosh_hashanah = Hebcal.prototype.find.strings.rosh_hashana;

// Hebcal properties

Hebcal.addZeman = HDate.addZeman;

Hebcal.cities = cities;

Hebcal.range = c.range;

Hebcal.gematriya = c.gematriya;

Hebcal.holidays = c.filter(holidays, ['masks', 'IGNORE_YEAR', 'Event']); // not getHolidaysForYear()

Object.defineProperty(Hebcal, 'defaultLocation', {
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
Object.defineProperty(Hebcal, 'defaultCity', {
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

Object.defineProperty(Hebcal, 'candleLighting', {
	enumerable: true,
	configurable: true,

	get: function() {
		return holidays.Event.candleLighting;
	},
	set: function(mins) {
		holidays.Event.candleLighting = mins;
	}
});

Object.defineProperty(Hebcal, 'havdalah', {
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

Hebcal.Month = function Month(month, year) {
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
		Object.defineProperty(d, '__month', {
			configurable: true,
			writable: true,
			value: this
		});
		return d;
	}, this);

	this.length = this.days.length;

	Object.defineProperty(this, 'il', {
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

	Object.defineProperty(this, 'lat', {
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
	Object.defineProperty(this, 'long', {
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
};

Hebcal.Month.prototype.isLeapYear = function isLeapYear() {
	return c.LEAP_YR_HEB(this.year);
};

Hebcal.Month.prototype.prev = function prev() {
	if (this.month === 1) { // Nisan
		return this.getYearObject().getMonth(-1);
	} else if (this.month === c.months.TISHREI) {
		return this.getYearObject().prev().getMonth(c.months.ELUL);
	} else {
		return this.getYearObject().getMonth(this.month - 1);
	}
};

Hebcal.Month.prototype.next = function next() {
	if (this.month === c.MONTHS_IN_HEB(this.year)) { // Adar
		return this.getYearObject().getMonth(1);
	} else if (this.month === c.months.ELUL) {
		return this.getYearObject().next().getMonth(c.months.TISHREI);
	} else {
		return this.getYearObject().getMonth(this.month + 1);
	}
};

Hebcal.Month.prototype.getDay = function getDay(day) {
	day = typeof day === 'number' ? day :
		day.charCodeAt(0) >= 1488 && day.charCodeAt(0) <= 1514 && /('|")/.test(day) ? c.gematriya(day) : parseInt(day, 10); // gematriya or number string
	if (day > this.days.length) {
		return this.next().getDay(day - this.days.length);
	}
	return this.days[day > 0 ? day - 1 : this.days.length + day];
};

Hebcal.Month.prototype.getYearObject = function getYearObject() {
	return this.__year || new Hebcal(this.year);
};

Hebcal.Month.prototype.getName = function getName(o) {
	return c.LANGUAGE(c.monthNames[+this.isLeapYear()][this.month],o);
};

Hebcal.Month.prototype.rosh_chodesh = function rosh_chodesh() {
	var prev = this.prev();
	return prev.length === 30 ? [prev.getDay(-1), this.getDay(1)] : [this.getDay(1)];
};

Hebcal.Month.prototype.setCity = function setCity(city) {
	this.days.forEach(function(d){
		d.setCity(city);
	});
	return this;
};

Hebcal.Month.prototype.setLocation = function setLocation(lat, lon) {
	this.days.forEach(function(d){
		d.setLocation(lat, lon);
	});
	return this;
};

Hebcal.Month.prototype.map = function map() {
	return [].map.apply(this.days, arguments);
};

Hebcal.Month.prototype.find = function find(day) {
	if (typeof day === 'number') {
		return [this.getDay(day)];
	} else if (typeof day === 'string') {
		return find.strings.call(this, day);
	} else if (Array.isArray(day)) {
		return [].concat.apply([], day.map(function(d){
			return this.find(d);
		}, this));
	} else if (day instanceof HDate && day.getFullYear() === this.year && day.getMonth() === this.month) {
		return this.find(day.getDate());
	} else if (day instanceof Date) {
		return this.find(new HDate(day));
	}
	return [];
};
Hebcal.Month.prototype.find.strings = function strings(str) {
	if (strings[str.replace(/\s/g, '_').toLowerCase()]) {
		return strings[str.replace(/\s/g, '_').toLowerCase()].call(this);
	} else if (new HDate(str).getDate()) {
		return this.find(new HDate(str));
	}
	var num = str.charCodeAt(0) >= 1488 && str.charCodeAt(0) <= 1514 && /('|")/.test(str) ? c.gematriya(str) :
		str.charCodeAt(0) >= 48 && str.charCodeAt(0) <= 57 /* number */ ? parseInt(str, 10) : null;
	return num ? this.find(num) : [];
};
Hebcal.Month.prototype.find.strings.rosh_chodesh = function rosh_chodesh() {
	return this.rosh_chodesh();
};
Hebcal.Month.prototype.find.strings.shabbat_mevarchim = function shabbat_mevarchim() {
	return this.month === c.months.ELUL ? [] : // No birchat hachodesh in Elul
		this.find(this.getDay(29).onOrBefore(c.days.SAT));
};
Hebcal.Month.prototype.find.strings.shabbos_mevarchim = Hebcal.Month.prototype.find.strings.shabbos_mevorchim = Hebcal.Month.prototype.find.strings.shabbat_mevarchim;

// HDate days

Hebcal.HDate = HDate;

HDate.prototype.getMonthObject = function getMonthObject() {
	return this.__month || new Hebcal.Month(this.getMonth(), this.getFullYear());
};

HDate.prototype.getYearObject = function getYearObject() {
	return this.getMonthObject().getYearObject();
};

var HDatePrev = HDate.prototype.prev; // slightly less overhead when using unaffiliated HDate()s
HDate.prototype.prev = function prev() {
	if (!this.__month) {
		return HDatePrev.call(this);
	}
	if (this.getMonth() === c.months.TISHREI && this.getDate() === 1) { // 1st day RH
		return this.getMonthObject().prev().getDay(-1);
	} else {
		var g = this.greg();
		g.setDate(g.getDate() - 1);
		return this.getYearObject().find(g)[0];
	}
};

var HDateNext = HDate.prototype.next;
HDate.prototype.next = function next() {
	if (!this.__month) {
		return HDateNext.call(this);
	}
	if (this.getMonth() === c.months.ELUL && this.getDate() === this.getMonthObject().length) { // last day
		return this.getMonthObject().next().getDay(1);
	} else {
		var g = this.greg();
		g.setDate(g.getDate() + 1);
		return this.getYearObject().find(g)[0];
	}
};

HDate.prototype.getSedra = function getSedra(o) {
	return (new Sedra(this.getFullYear(), this.il)).getSedraFromHebcalDate(this).map(function(p){
		return c.LANGUAGE(p, o);
	});
};

HDate.prototype.holidays = function holidays() {
	return this.getYearObject().holidays.filter(function(h){
		return this.isSameDate(h.date);
	}, this).map(function(h){
		h.date.setLocation(this);
		return h;
	}, this);
};

HDate.prototype.omer = function omer() {
	if (this.greg().getTime() > new HDate(15, c.months.NISAN, this.getFullYear()).greg().getTime() &&
		this.greg().getTime() < new HDate( 6, c.months.SIVAN, this.getFullYear()).greg().getTime()) {
		return this.abs() - new HDate(16, c.months.NISAN, this.getFullYear()).abs() + 1;
	}
	return 0;
};

HDate.prototype.dafyomi = function daf(o) {
	return dafyomi.dafname(dafyomi.dafyomi(this.greg()), o);
};

HDate.prototype.tachanun = (function() {
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

		var all = __cache.il[year.year] === this.il && __cache.all[year.year] || (__cache.all[year.year] = year.find('Rosh Chodesh').concat(
			year.find(c.range(1, c.max_days_in_heb_month(c.months.NISAN, this.getFullYear())), c.months.NISAN), // all of Nisan
			year.find(15 + 33, c.months.NISAN), // Lag Baomer
			year.find(c.range(1, 8 - this.il), c.months.SIVAN), // Rosh Chodesh Sivan thru Isru Chag
			year.find([9, 15], c.months.AV), // Tisha B'av and Tu B'av
			year.find(-1, c.months.ELUL), // Erev Rosh Hashanah
			year.find([1, 2], c.months.TISHREI), // Rosh Hashanah
			year.find(c.range(9, 24 - this.il), c.months.TISHREI), // Erev Yom Kippur thru Isru Chag
			year.find(c.range(25, 33), c.months.KISLEV), // Chanukah
			year.find(15, c.months.SHVAT), // Tu B'shvat
			year.find([14, 15], year.isLeapYear() ? [c.months.ADAR_I, c.months.ADAR_II] : c.months.ADAR_I) // Purim/Shushan Purim + Katan
		)), some = __cache.il[year.year] === this.il && __cache.some[year.year] || (__cache.some[year.year] = [].concat( // Don't care if it overlaps days in all, because all takes precedence
			year.find(c.range(1, 13), c.months.SIVAN), // Until 14 Sivan
			year.find(c.range(20, 31), c.months.TISHREI), // Until after Rosh Chodesh Cheshvan
			year.find(14, c.months.IYYAR), // Pesach Sheini
			year.holidays.filter(function(h){return c.LANGUAGE(h.desc, 's') == 'Yom HaAtzma\'ut'})[0].date, // Yom HaAtzma'ut, which changes based on day of week
			year.find(29, c.months.IYYAR) // Yom Yerushalayim
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

HDate.prototype.hallel = (function() {
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
			year.find(c.range(25, 33), c.months.KISLEV), // Chanukah
			year.find([15, this.il ? null : 16], c.months.NISAN), // First day(s) of Pesach
			year.find('Shavuot'),
			year.find('Sukkot'),
			year.holidays.filter(function(h){return c.LANGUAGE(h.desc, 's') == 'Yom HaAtzma\'ut'})[0].date, // Yom HaAtzma'ut, which changes based on day of week
			year.find(29, c.months.IYYAR) // Yom Yerushalayim
		));
		var half = __cache.il[year.year] === this.il && __cache.half[year.year] || (__cache.half[year.year] = [].concat(
			year.find('Rosh Chodesh').filter(function(rc){return rc.getMonth() !== c.months.TISHREI}), // Rosh Chodesh, but not Rosh Hashanah
			year.find(c.range(17 - this.il, 23 - this.il), c.months.NISAN) // Last six days of Pesach
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

	Object.defineProperty(events, 'refreshInterval', {
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
				Object.defineProperty(m, '__year', {
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

	Object.defineProperty(this, 'il', {
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

	Object.defineProperty(this, 'lat', {
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
	Object.defineProperty(this, 'long', {
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
};

Hebcal.GregYear.prototype.isLeapYear = function isLeapYear() {
	return this.length === 366;
};

Hebcal.GregYear.prototype.setCity = Hebcal.prototype.setCity;
Hebcal.GregYear.prototype.setLocation = Hebcal.prototype.setLocation;

Hebcal.GregYear.prototype.next = function next() {
	return new Hebcal.GregYear(this.year + 1);
};

Hebcal.GregYear.prototype.prev = function prev() {
	return new Hebcal.GregYear(this.year - 1);
};

Hebcal.GregYear.prototype.getMonth = function getMonth(month) {
	month = typeof month === 'number' ? month : greg.lookupMonthNum(month);
	if (month > this.months.length) {
		return this.next().getMonth(month - this.months.length);
	}
	return this.months[month > 0 ? month - 1 : this.months.length + month];
};

Hebcal.GregYear.prototype.days = Hebcal.prototype.days;
Hebcal.GregYear.prototype.map = Hebcal.prototype.map;
Hebcal.GregYear.prototype.filter = Hebcal.prototype.filter;

Hebcal.GregYear.prototype.addHoliday = Hebcal.prototype.addHoliday;

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
		Object.defineProperty(d, '__gregmonth', {
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

	Object.defineProperty(this, 'il', {
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

	Object.defineProperty(this, 'lat', {
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
	Object.defineProperty(this, 'long', {
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
};

Hebcal.GregMonth.prototype.isLeapYear = function isLeapYear() {
	return greg.LEAP(this.year);
};

Hebcal.GregMonth.prototype.prev = function prev() {
	if (this.month === 1) {
		return this.getYearObject().prev().getMonth(-1);
	} else {
		return this.getYearObject().getMonth(this.month - 1);
	}
};

Hebcal.GregMonth.prototype.next = function next() {
	return this.getYearObject().getMonth(this.month + 1);
};

Hebcal.GregMonth.prototype.getDay = function getDay(day) {
	if (day > this.days.length) {
		return this.next().getDay(day - this.days.length);
	}
	return this.days[day > 0 ? day - 1 : this.days.length + day];
};

Hebcal.GregMonth.prototype.getYearObject = function getYearObject() {
	return this.__year || new Hebcal.GregYear(this.year);
};

Hebcal.GregMonth.prototype.getName = function getName() {
	return greg.monthNames[this.month];
};

Hebcal.GregMonth.prototype.setCity = Hebcal.Month.prototype.setCity;
Hebcal.GregMonth.prototype.setLocation = Hebcal.Month.prototype.setLocation;

Hebcal.GregMonth.prototype.map = Hebcal.Month.prototype.map;

HDate.prototype.getGregMonthObject = function getGregMonthObject() {
	return this.__gregmonth || new Hebcal.GregMonth(this.greg().getMonth(), this.greg().getFullYear());
};

HDate.prototype.getGregYearObject = function getGregYearObject() {
	return this.getGregMonthObject().getYearObject();
};

module.exports = Hebcal;
},{"./cities":1,"./common":3,"./dafyomi":4,"./greg":5,"./hdate":6,"./holidays":8,"./sedra":10,"events":11}],8:[function(require,module,exports){
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
var c = require('./common'), HDate = require('./hdate');

var masks = exports.masks = {
	USER_EVENT         : 1,
	LIGHT_CANDLES      : 2,
	YOM_TOV_ENDS       : 4,
	CHUL_ONLY          : 8, // chutz l'aretz (Diaspora)
	IL_ONLY            : 16, // b'aretz (Israel)
	LIGHT_CANDLES_TZEIS: 32
};

var IGNORE_YEAR = exports.IGNORE_YEAR = -1;

function Event(date, desc, mask) {
	this.date = new HDate(date);
	if (date instanceof Date) {
		this.date.setFullYear(IGNORE_YEAR);
	}
	this.desc = typeof desc === 'string' ? [desc] : desc;

	this.IGNORE_YEAR = date.getFullYear() === IGNORE_YEAR;
	this.USER_EVENT = !!(mask & masks.USER_EVENT);
	this.LIGHT_CANDLES = !!(mask & masks.LIGHT_CANDLES);
	this.YOM_TOV_ENDS = !!(mask & masks.YOM_TOV_ENDS);
	this.CHUL_ONLY = !!(mask & masks.CHUL_ONLY);
	this.IL_ONLY = !!(mask & masks.IL_ONLY);
	this.LIGHT_CANDLES_TZEIS = !!(mask & masks.LIGHT_CANDLES_TZEIS);
}

Event.prototype.is = function is(date, il) {
	if (!(arguments.length > 1)) {
		il = Event.isIL;
	}
	date = new HDate(date);
	if (date.getDate() !== this.date.getDate() || date.getMonth() !== this.date.getMonth()) {
		return false;
	}
	if (!this.IGNORE_YEAR && date.getFullYear() !== this.date.getFullYear()) {
		return false;
	}
	if (il && this.CHUL_ONLY || !il && this.IL_ONLY) {
		return false;
	}
	return true;
};

Event.prototype.masks = function mask() {
	return +(this.USER_EVENT          && masks.USER_EVENT) |
		   +(this.LIGHT_CANDLES       && masks.LIGHT_CANDLES) |
		   +(this.YOM_TOV_ENDS        && masks.YOM_TOV_ENDS) |
		   +(this.CHUL_ONLY           && masks.CHUL_ONLY) |
		   +(this.IL_ONLY             && masks.IL_ONLY) |
		   +(this.LIGHT_CANDLES_TZEIS && masks.LIGHT_CANDLES_TZEIS)
};

Event.prototype.getDesc = function getDesc(o) {
	return c.LANGUAGE(this.desc, o);
};

Event.prototype.candleLighting = function candleLighting() {
	if (this.LIGHT_CANDLES) {
		return new Date(this.date.sunset() - (Event.candleLighting * 60 * 1000));
	} else if (this.LIGHT_CANDLES_TZEIS) {
		return this.date.getZemanim().tzeit;
	}
	return null;
};

Event.prototype.havdalah = function havdalah() {
	if (this.YOM_TOV_ENDS) {
		return new Date(this.date.sunset() + (Event.havdalah * 60 * 1000));
	}
	return null;
};

Event.isIL = false;

Event.candleLighting = 18;

Event.havdalah = 50;

exports.Event = Event;

var standards = [ // standard holidays that don't shift based on year
	// RH 1 is defined later, based on year, because other holidays depend on it
	new Event(
		new HDate(2, c.months.TISHREI, IGNORE_YEAR),
		['Rosh Hashana 2', null, 'ראש השנה ב\''],
		masks.YOM_TOV_ENDS
	), new Event(
		new HDate(9, c.months.TISHREI, IGNORE_YEAR),
		['Erev Yom Kippur', null, 'ערב יום כיפור'],
		masks.LIGHT_CANDLES
	), new Event(
		new HDate(10, c.months.TISHREI, IGNORE_YEAR),
		['Yom Kippur', null, 'יום כיפור'],
		masks.YOM_TOV_ENDS
	), new Event(
		new HDate(14, c.months.TISHREI, IGNORE_YEAR),
		['Erev Sukkot', 'Erev Sukkos', 'ערב סוכות'],
		masks.LIGHT_CANDLES
	), new Event(
		new HDate(15, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 1', 'Sukkos 1', 'סוכות יום א\''],
		masks.LIGHT_CANDLES_TZEIS | masks.CHUL_ONLY
	), new Event(
		new HDate(15, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 1', 'Sukkos 1', 'סוכות יום א\''],
		masks.YOM_TOV_ENDS | masks.IL_ONLY
	), new Event(
		new HDate(16, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 2', 'Sukkos 2', 'סוכות יום ב\''],
		masks.YOM_TOV_ENDS | masks.CHUL_ONLY
	), new Event(
		new HDate(16, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 2 (CH"M)', 'Sukkos 2 (CH"M)', 'סוכות יום ב\' )חה"ם('],
		masks.IL_ONLY
	), new Event(
		new HDate(17, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 3 (CH"M)', 'Sukkos 3 (CH"M)', 'סוכות יום ג\' )חה"ם('],
		0
	), new Event(
		new HDate(18, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 4 (CH"M)', 'Sukkos 4 (CH"M)', 'סוכות יום ד\' )חה"ם('],
		0
	), new Event(
		new HDate(19, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 5 (CH"M)', 'Sukkos 5 (CH"M)', 'סוכות יום ה\' )חה"ם('],
		0
	), new Event(
		new HDate(20, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 6 (CH"M)', 'Sukkos 6 (CH"M)', 'סוכות יום ו\' )חה"ם('],
		0
	), new Event(
		new HDate(21, c.months.TISHREI, IGNORE_YEAR),
		['Sukkot 7 (Hoshana Raba)', 'Sukkos 7 (Hoshana Raba)', 'סוכות יום ז\' )הושנע רבה('],
		masks.LIGHT_CANDLES
	), new Event(
		new HDate(22, c.months.TISHREI, IGNORE_YEAR),
		['Shmini Atzeret', 'Shmini Atzeres', 'שמיני עצרת'],
		masks.LIGHT_CANDLES_TZEIS | masks.CHUL_ONLY
	), new Event(
		new HDate(22, c.months.TISHREI, IGNORE_YEAR),
		['Shmini Atzeret / Simchat Torah', 'Shmini Atzeres / Simchas Torah', 'שמיני עצרת / שמחת תורה'],
		masks.YOM_TOV_ENDS | masks.IL_ONLY
	), new Event(
		new HDate(23, c.months.TISHREI, IGNORE_YEAR),
		['Simchat Torah', 'Simchas Torah', 'שמחת תורה'],
		masks.YOM_TOV_ENDS | masks.CHUL_ONLY
	), new Event(
		new HDate(24, c.months.KISLEV, IGNORE_YEAR),
		['Erev Chanukah', null, 'ערב חנוכה'],
		0
	), new Event(
		new HDate(25, c.months.KISLEV, IGNORE_YEAR),
		['Chanukah: 1st Candle', null, 'חנוכה: נר א\''],
		0
	), new Event(
		new HDate(26, c.months.KISLEV, IGNORE_YEAR),
		['Chanukah: 2nd Candle', null, 'חנוכה: נר ב\''],
		0
	), new Event(
		new HDate(27, c.months.KISLEV, IGNORE_YEAR),
		['Chanukah: 3rd Candle', null, 'חנוכה: נר ג\''],
		0
	), new Event(
		new HDate(28, c.months.KISLEV, IGNORE_YEAR),
		['Chanukah: 4th Candle', null, 'חנוכה: נר ד\''],
		0
	), new Event(
		new HDate(29, c.months.KISLEV, IGNORE_YEAR),
		['Chanukah: 5th Candle', null, 'חנוכה: נר ה\''],
		0
	), new Event(
		new HDate(30, c.months.KISLEV, IGNORE_YEAR), // yes, i know these are wrong
		['Chanukah: 6th Candle', null, 'חנוכה: נר ו\''],
		0
	), new Event(
		new HDate(31, c.months.KISLEV, IGNORE_YEAR), // HDate() corrects the month automatically
		['Chanukah: 7th Candle', null, 'חנוכה: נר ז\''],
		0
	), new Event(
		new HDate(32, c.months.KISLEV, IGNORE_YEAR),
		['Chanukah: 8th Candle', null, 'חנוכה: נר ח\''],
		0
	), new Event(
		new HDate(15, c.months.SHVAT, IGNORE_YEAR),
		['Tu B\'Shvat', null, 'ט"ו בשבט'],
		0
	), new Event(
		new HDate(14, c.months.NISAN, IGNORE_YEAR),
		['Erev Pesach', null, 'ערב פסח'],
		masks.LIGHT_CANDLES
	), new Event(
		new HDate(15, c.months.NISAN, IGNORE_YEAR),
		['Pesach 1', null, 'פסח יום א\''],
		masks.LIGHT_CANDLES_TZEIS | masks.CHUL_ONLY
	), new Event(
		new HDate(15, c.months.NISAN, IGNORE_YEAR),
		['Pesach 1', null, 'פסח יום א\''],
		masks.YOM_TOV_ENDS | masks.IL_ONLY
	), new Event(
		new HDate(16, c.months.NISAN, IGNORE_YEAR),
		['Pesach 2', null, 'פסח יום ב\''],
		masks.YOM_TOV_ENDS | masks.CHUL_ONLY
	), new Event(
		new HDate(16, c.months.NISAN, IGNORE_YEAR),
		['Pesach 2 (CH"M)', null, 'פסח יום ב\' )חה"ם('],
		masks.IL_ONLY
	), new Event(
		new HDate(16, c.months.NISAN, IGNORE_YEAR),
		['Start counting Omer', null, 'התחלת ספירת העומר'],
		0
	), new Event(
		new HDate(17, c.months.NISAN, IGNORE_YEAR),
		['Pesach 3 (CH"M)', null, 'פסח יום ג\' )חה"ם('],
		0
	), new Event(
		new HDate(18, c.months.NISAN, IGNORE_YEAR),
		['Pesach 4 (CH"M)', null, 'פסח יום ד\' )חה"ם('],
		0
	), new Event(
		new HDate(19, c.months.NISAN, IGNORE_YEAR),
		['Pesach 5 (CH"M)', null, 'פסח יום ה\' )חה"ם('],
		0
	), new Event(
		new HDate(20, c.months.NISAN, IGNORE_YEAR),
		['Pesach 6 (CH"M)', null, 'פסח יום ו\' )חה"ם('],
		masks.LIGHT_CANDLES
	), new Event(
		new HDate(21, c.months.NISAN, IGNORE_YEAR),
		['Pesach 7', null, 'פסח יום ז\''],
		masks.LIGHT_CANDLES_TZEIS | masks.CHUL_ONLY
	), new Event(
		new HDate(21, c.months.NISAN, IGNORE_YEAR),
		['Pesach 7', null, 'פסח יום ז\''],
		masks.YOM_TOV_ENDS | masks.IL_ONLY
	), new Event(
		new HDate(22, c.months.NISAN, IGNORE_YEAR),
		['Pesach 8', null, 'פסח יום ח\''],
		masks.YOM_TOV_ENDS | masks.CHUL_ONLY
	), new Event(
		new HDate(14, c.months.IYYAR, IGNORE_YEAR),
		['Pesach Sheni', null, 'פסח שני'],
		0
	), new Event(
		new HDate(18, c.months.IYYAR, IGNORE_YEAR),
		['Lag B\'Omer', null, 'ל"ג בעומר'],
		0
	), new Event(
		new HDate(5, c.months.SIVAN, IGNORE_YEAR),
		['Erev Shavuot', 'Erev Shavuos', 'ערב שבועות'],
		masks.LIGHT_CANDLES
	), new Event(
		new HDate(6, c.months.SIVAN, IGNORE_YEAR),
		['Shavuot 1', 'Shavuos 1', 'שבועות א\''],
		masks.LIGHT_CANDLES_TZEIS | masks.CHUL_ONLY
	), new Event(
		new HDate(6, c.months.SIVAN, IGNORE_YEAR),
		['Shavuot', 'Shavuos', 'שבועות'],
		masks.YOM_TOV_ENDS | masks.IL_ONLY
	), new Event(
		new HDate(7, c.months.SIVAN, IGNORE_YEAR),
		['Shavuot 2', 'Shavuos 2', 'שבועות ב\''],
		masks.YOM_TOV_ENDS | masks.CHUL_ONLY
	), new Event(
		new HDate(29, c.months.ELUL, IGNORE_YEAR),
		['Erev Rosh Hashana', null, 'ערב ראש השנה'],
		masks.LIGHT_CANDLES
	)
];

exports.getHolidaysForYear = function getHolidaysForYear(year) {
	var h = standards.slice(), // clone

		RH = new HDate(1, c.months.TISHREI, year),
		pesach = new HDate(15, c.months.NISAN, year),
		tmpDate;

	h.push(new Event(
		RH,
		['Rosh Hashana 1', null, 'ראש השנה א\''],
		masks.LIGHT_CANDLES_TZEIS
	));

	h.push(new Event(
		new HDate(3 + (RH.getDay() == c.days.THU), c.months.TISHREI, year), // push off to SUN if RH is THU
		['Tzom Gedaliah', null, 'צום גדליה'],
		0
	));

	h.push(new Event( // first SAT after RH
		new HDate(c.day_on_or_before(c.days.SAT, 7 + RH.abs())),
		['Shabbat Shuva', 'Shabbos Shuvah', 'שבת שובה'],
		0
	));

	tmpDate = new HDate(10, c.months.TEVET, year);
	if (tmpDate.getDay() === c.days.SAT) {
		tmpDate = tmpDate.next();
	}
	h.push(new Event(
		tmpDate,
		['Asara B\'Tevet', null, 'עשרה בטבת'],
		0
	));

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, pesach.abs() - 43)),
		['Shabbat Shekalim', 'Shabbos Shekalim', 'שבת שקלים'],
		0
	));

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, pesach.abs() - 30)),
		['Shabbat Zachor', 'Shabbos Zachor', 'שבת זכור'],
		0
	));

	h.push(new Event(
		new HDate(pesach.abs() - (pesach.getDay() == c.days.TUE ? 33 : 31)),
		['Ta\'anit Esther', 'Ta\'anis Esther', 'תענית אסתר'],
		0
	));

	if (c.LEAP_YR_HEB(year)) {
		h.push(new Event(
			new HDate(14, c.months.ADAR_I, year),
			['Purim Katan', null, 'פורים קטן'],
			0
		));

		h.push(new Event(
			new HDate(15, c.months.ADAR_I, year),
			['Shushan Purim Katan', null, 'שושן פורים קטן'],
			0
		));

		h.push(new Event(
			new HDate(13, c.months.ADAR_II, year),
			['Erev Purim', null, 'ערב פורים'],
			0
		));

		h.push(new Event(
			new HDate(14, c.months.ADAR_II, year),
			['Purim', null, 'פורים'],
			0
		));

		h.push(new Event(
			new HDate(15, c.months.ADAR_II, year),
			['Shushan Purim', null, 'שושן פורים'],
			0
		));
	} else {
		h.push(new Event(
			new HDate(13, c.months.ADAR_I, year),
			['Erev Purim', null, 'ערב פורים'],
			0
		));

		h.push(new Event(
			new HDate(14, c.months.ADAR_I, year),
			['Purim', null, 'פורים'],
			0
		));

		h.push(new Event(
			new HDate(15, c.months.ADAR_I, year),
			['Shushan Purim', null, 'שושן פורים'],
			0
		));
	}

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, pesach.abs() - 14) - 7),
		['Shabbat Parah', 'Shabbos Parah', 'שבת פרה'],
		0
	));

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, pesach.abs() - 14)),
		['Shabbat Hachodesh', 'Shabbos Hachodesh', 'שבת החודש'],
		0
	));

	if (pesach.prev().getDay() == c.days.SAT) {
		// if the fast falls on Shabbat, move to Thursday
		h.push(new Event(
			new HDate(c.day_on_or_before(c.days.THU, pesach.abs())),
			['Ta\'anit Bechorot', 'Ta\'anis Bechoros', 'תענית בכורות'],
			0
		));
	} else {
		h.push(new Event(
			new HDate(14, c.months.NISAN, year),
			['Ta\'anit Bechorot', 'Ta\'anis Bechoros', 'תענית בכורות'],
			0
		));
	}

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, pesach.abs() - 1)),
		['Shabbat HaGadol', 'Shabbos HaGadol', 'שבת הגדול'],
		0
	));

	if (year >= 5711) { // Yom HaShoah first observed in 1951
		tmpDate = new HDate(27, c.months.NISAN, year);
		/* When the actual date of Yom Hashoah falls on a Friday, the
		 * state of Israel observes Yom Hashoah on the preceding
		 * Thursday. When it falls on a Sunday, Yom Hashoah is observed
		 * on the following Monday.
		 * http://www.ushmm.org/remembrance/dor/calendar/
		 */

		if (tmpDate.getDay() === c.days.FRI) {
			tmpDate = tmpDate.prev();
		} else if (tmpDate.getDay() === c.days.SUN) {
			tmpDate = tmpDate.next();
		}

		h.push(new Event(
			tmpDate,
			['Yom HaShoah', null, 'יום השואה'],
			0
		));
	}

	if (year >= 5711) { // Yom HaAtzma'ut only celebrated after 1948
		tmpDate = new HDate(1, c.months.IYYAR, year);

		if (pesach.getDay() === c.days.SUN) {
			tmpDate.setDate(2);
		} else if (pesach.getDay() === c.days.SAT) {
			tmpDate.setDate(3);
		} else if (year < 5764) {
			tmpDate.setDate(4);
		} else if (pesach.getDay() === c.days.TUE) {
			tmpDate.setDate(5);
		} else {
			tmpDate.setDate(4);
		}

		h.push(new Event(
			tmpDate,
			['Yom HaZikaron', null, 'יום הזיכרון'],
			0
		));

		h.push(new Event(
			tmpDate.next(),
			['Yom HaAtzma\'ut', null, 'יום העצמאות'],
			0
		));
	}

	if (year >= 5727) { // Yom Yerushalayim only celebrated after 1967
		h.push(new Event(
			new HDate(29, c.months.IYYAR, year),
			['Yom Yerushalayim', null, 'יום ירושלים'],
			0
		));
	}

	tmpDate = new HDate(17, c.months.TAMUZ, year);
	if (tmpDate.getDay() === c.days.SAT) {
		tmpDate = tmpDate.next();
	}
	h.push(new Event(
		tmpDate,
		['Shiva-Asar B\'Tamuz', null, 'צום יז\' בתמוז'],
		0
	));

	tmpDate = new HDate(9, c.months.AV, year);
	if (tmpDate.getDay() === c.days.SAT) {
		tmpDate = tmpDate.next();
	}

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, tmpDate.abs())),
		['Shabbat Chazon', 'Shabbos Chazon', 'שבת חזון'],
		0
	));

	h.push(new Event(
		tmpDate.prev(),
		['Erev Tish\'a B\'Av', null, 'ערב תשעה באב'],
		0
	));

	h.push(new Event(
		tmpDate,
		['Tish\'a B\'Av', null, 'תשעה באב'],
		0
	));

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, tmpDate.abs() + 7)),
		['Shabbat Nachamu', 'Shabbos Nachamu', 'שבת נחמו'],
		0
	));

	h.push(new Event(
		new HDate(c.day_on_or_before(c.days.SAT, new HDate(1, c.months.TISHREI, year + 1).abs() - 4)),
		['Leil Selichot', 'Leil Selichos', 'ליל סליחות'],
		0
	));

	for (var day = 6; day < c.days_in_heb_year(year); day += 7) {
		h.push(new Event(
			new HDate(c.day_on_or_before(c.days.SAT, new HDate(1, c.months.TISHREI, year).abs() + day)),
			['Shabbat', 'Shabbos', 'שבת'],
			masks.YOM_TOV_ENDS
		));

		h.push(new Event(
			new HDate(c.day_on_or_before(c.days.FRI, new HDate(1, c.months.TISHREI, year).abs() + day)),
			['Erev Shabbat', 'Erev Shabbos', 'ערב שבת'],
			masks.LIGHT_CANDLES
		));
	}

	for (var month = 1; month <= c.MONTHS_IN_HEB(year); month++) {
		if ((month === c.months.NISAN ? c.max_days_in_heb_month(c.MONTHS_IN_HEB(year - 1), year - 1) :
				c.max_days_in_heb_month(month - 1, year)) == 30) {
			h.push(new Event(
				new HDate(1, month, year),
				['Rosh Chodesh 2', null, 'ראש חודש ב\''],
				0
			));

			h.push(new Event(
				new HDate(30, month - 1, year),
				['Rosh Chodesh 1', null, 'ראש חודש א\''],
				0
			));
		} else if (month !== c.months.TISHREI) {
			h.push(new Event(
				new HDate(1, month, year),
				['Rosh Chodesh', null, 'ראש חודש'],
				0
			));
		}

		if (month === c.months.ELUL) {
			continue;
		}

		h.push(new Event(
			new HDate(29, month, year).onOrBefore(c.days.SAT),
			['Shabbat Mevarchim', 'Shabbos Mevorchim', 'שבת מברכים'],
			0
		));
	}

	return h;
};
},{"./common":3,"./hdate":6}],9:[function(require,module,exports){
/*
 (c) 2011-2013, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/mooon position and light phases.
 https://github.com/mourner/suncalc
*/

(function () { "use strict";

// shortcuts for easier to read formulas

var PI   = Math.PI,
    sin  = Math.sin,
    cos  = Math.cos,
    tan  = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad  = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(date) {
    return date.valueOf() / dayMs - 0.5 + J1970;
}
function fromJulian(j) {
    return new Date((j + 0.5 - J1970) * dayMs);
}
function toDays(date) {
    return toJulian(date) - J2000;
}


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function getRightAscension(l, b) {
    return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
}
function getDeclination(l, b) {
    return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
}
function getAzimuth(H, phi, dec) {
    return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi));
}
function getAltitude(H, phi, dec) {
    return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
}
function getSiderealTime(d, lw) {
    return rad * (280.16 + 360.9856235 * d) - lw;
}


// general sun calculations

function getSolarMeanAnomaly(d) {
    return rad * (357.5291 + 0.98560028 * d);
}
function getEquationOfCenter(M) {
    return rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M));
}
function getEclipticLongitude(M, C) {
    var P = rad * 102.9372; // perihelion of the Earth
    return M + C + P + PI;
}
function getSunCoords(d) {

    var M = getSolarMeanAnomaly(d),
        C = getEquationOfCenter(M),
        L = getEclipticLongitude(M, C);

    return {
        dec: getDeclination(L, 0),
        ra: getRightAscension(L, 0)
    };
}


var SunCalc = {};


// calculates sun position for a given date and latitude/longitude

SunCalc.getPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c  = getSunCoords(d),
        H  = getSiderealTime(d, lw) - c.ra;

    return {
        azimuth: getAzimuth(H, phi, c.dec),
        altitude: getAltitude(H, phi, c.dec)
    };
};


// sun times configuration (angle, morning name, evening name)

var times = [
    [-0.83, 'sunrise',       'sunset'      ],
    [ -0.3, 'sunriseEnd',    'sunsetStart' ],
    [   -6, 'dawn',          'dusk'        ],
    [  -12, 'nauticalDawn',  'nauticalDusk'],
    [  -18, 'nightEnd',      'night'       ],
    [    6, 'goldenHourEnd', 'goldenHour'  ]
];

// adds a custom time to the times config

SunCalc.addTime = function (angle, riseName, setName) {
    times.push([angle, riseName, setName]);
};


// calculations for sun times

var J0 = 0.0009;

function getJulianCycle(d, lw) {
    return Math.round(d - J0 - lw / (2 * PI));
}
function getApproxTransit(Ht, lw, n) {
    return J0 + (Ht + lw) / (2 * PI) + n;
}
function getSolarTransitJ(ds, M, L) {
    return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
}
function getHourAngle(h, phi, d) {
    return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
}


// calculates sun times for a given date and latitude/longitude

SunCalc.getTimes = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        n  = getJulianCycle(d, lw),
        ds = getApproxTransit(0, lw, n),

        M = getSolarMeanAnomaly(ds),
        C = getEquationOfCenter(M),
        L = getEclipticLongitude(M, C),

        dec = getDeclination(L, 0),

        Jnoon = getSolarTransitJ(ds, M, L);


    // returns set time for the given sun altitude
    function getSetJ(h) {
        var w = getHourAngle(h, phi, dec),
            a = getApproxTransit(w, lw, n);

        return getSolarTransitJ(a, M, L);
    }


    var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
    };

    var i, len, time, angle, morningName, eveningName, Jset, Jrise;

    for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];

        Jset = getSetJ(time[0] * rad);
        Jrise = Jnoon - (Jset - Jnoon);

        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
    }

    return result;
};


// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

function getMoonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
        M = rad * (134.963 + 13.064993 * d), // mean anomaly
        F = rad * (93.272 + 13.229350 * d),  // mean distance

        l  = L + rad * 6.289 * sin(M), // longitude
        b  = rad * 5.128 * sin(F),     // latitude
        dt = 385001 - 20905 * cos(M);  // distance to the moon in km

    return {
        ra: getRightAscension(l, b),
        dec: getDeclination(l, b),
        dist: dt
    };
}

SunCalc.getMoonPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c = getMoonCoords(d),
        H = getSiderealTime(d, lw) - c.ra,
        h = getAltitude(H, phi, c.dec);

    // altitude correction for refraction
    h = h + rad * 0.017 / tan(h + rad * 10.26 / (h + rad * 5.10));

    return {
        azimuth: getAzimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist
    };
};


// calculations for illuminated fraction of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas

SunCalc.getMoonFraction = function (date) {

    var d = toDays(date),
        s = getSunCoords(d),
        m = getMoonCoords(d),

        sdist = 149598000, // distance from Earth to Sun in km

        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi));

    return (1 + cos(inc)) / 2;
};


// export as AMD module / Node module / browser variable

if (typeof define === 'function' && define.amd) {
    define(SunCalc);
} else if (typeof module !== 'undefined') {
    module.exports = SunCalc;
} else {
    window.SunCalc = SunCalc;
}

}());

},{}],10:[function(require,module,exports){
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
/*
 * Many of the following algorithms were taken from hebrew calendar
 * routines by Maimonedes, from his Mishneh Torah, and implemented by
 *  Nachum Dershowitz                Department of Computer Science
 *  (217) 333-4219                   University of Illinois at Urbana-Champaign
 *  nachum@cs.uiuc.edu               1304 West Springfield Avenue
 *                                   Urbana, Illinois 61801
 *
 * The routines were included in the emacs 19 distribution.
 *
 */
var c = require('./common'), HDate = require('./hdate');

var TYPE_NAMES = [
	'INCOMPLETE',
	'REGULAR ',
	'COMPLETE'
],
	INCOMPLETE = 0,
	REGULAR = 1,
	COMPLETE = 2;

function Sedra (hebYr, israel_sw) { /* the hebrew year */
	israel_sw = !!israel_sw;
	var long_c = c.long_cheshvan(hebYr);
	var short_k = c.short_kislev(hebYr);
	var type;
	this.year = hebYr;
	if (long_c && !short_k) {
		type = COMPLETE;
	} else if (!long_c && short_k) {
		type = INCOMPLETE;
	} else {
		type = REGULAR;
	}

	var rosh_hashana = new HDate(1, c.months.TISHREI, hebYr).abs();
	var rosh_hashana_day = rosh_hashana % 7;

	/* find the first saturday on or after Rosh Hashana */
	this.first_saturday = c.day_on_or_before(6, rosh_hashana + 6);
	var leap = +c.LEAP_YR_HEB(hebYr);
	this.type = type;
	this.rosh_hashana_day = rosh_hashana_day;
	this.leap = leap;
	this.israel_sw = israel_sw;

	this.theSedraArray = sedra_years_array
		[leap]
		[ROSH_DAY_INDEX(rosh_hashana_day)]
		[type]
		[+israel_sw];
	if (null === this.theSedraArray) {
		console.log(this);
		throw new TypeError("improper sedra year type calculated.");
	}
}



var parshiot = [
	[ 'Bereshit', 'Bereshis', 'בראשית' ],
	[ 'Noach', null, 'נח' ],
	[ 'Lech-Lecha', null, 'לך-לך' ],
	[ 'Vayera', null, 'וירא' ],
	[ 'Chayei Sara', null, 'חי שרה' ],
	[ 'Toldot', 'Toldos', 'תולדות' ],
	[ 'Vayetzei', null, 'ויצא' ],
	[ 'Vayishlach', null, 'וישלח' ],
	[ 'Vayeshev', null, 'וישב' ],
	[ 'Miketz', null, 'מקץ' ],
	[ 'Vayigash', null, 'ויגש' ],
	[ 'Vayechi', null, 'ויחי' ],
	[ 'Shemot', 'Shemos', 'שמות' ],
	[ 'Vaera', null, 'וארא' ],
	[ 'Bo', null, 'בא' ],
	[ 'Beshalach', null, 'בשלח' ],
	[ 'Yitro', 'Yisro', 'יתרו' ],
	[ 'Mishpatim', null, 'משפטים' ],
	[ 'Terumah', null, 'תרומה' ],
	[ 'Tetzaveh', null, 'תצוה' ],
	[ 'Ki Tisa', 'Ki Sisa', 'כי תשא' ],
	[ 'Vayakhel', null, 'ויקהל' ],
	[ 'Pekudei', null, 'פקודי' ],
	[ 'Vayikra', null, 'ויקרא' ],
	[ 'Tzav', null, 'צו' ],
	[ 'Shmini', null, 'שמיני' ],
	[ 'Tazria', null, 'תזריע' ],
	[ 'Metzora', null, 'מצרע' ],
	[ 'Achrei Mot', 'Achrei Mos', 'אחרי מות' ],
	[ 'Kedoshim', null, 'קדשים' ],
	[ 'Emor', null, 'אמור' ],
	[ 'Behar', null, 'בהר' ],
	[ 'Bechukotai', 'Bechukosai', 'בחקתי' ],
	[ 'Bamidbar', null, 'במדבר' ],
	[ 'Nasso', null, 'נשא' ],
	[ 'Beha\'alotcha', 'Beha\'aloscha', 'בהעלתך' ],
	[ 'Sh\'lach', null, 'שלח לך' ],
	[ 'Korach', null, 'קורח' ],
	[ 'Chukat', 'Chukas', 'חקת' ],
	[ 'Balak', null, 'בלק' ],
	[ 'Pinchas', null, 'פינחס' ],
	[ 'Matot', 'Matos', 'מטות' ],
	[ 'Masei', null, 'מסעי' ],
	[ 'Devarim', null, 'דברים' ],
	[ 'Vaetchanan', 'V\'eschanan', 'ואתחנן' ],
	[ 'Eikev', null, 'עקב' ],
	[ 'Re\'eh', null, 'ראה' ],
	[ 'Shoftim', null, 'שופטים' ],
	[ 'Ki Teitzei', 'Ki Seitzei', 'כי תצא' ],
	[ 'Ki Tavo', 'Ki Savo', 'כי תבוא' ],
	[ 'Nitzavim', null, 'נצבים' ],
	[ 'Vayeilech', null, 'וילך' ],
	[ 'Ha\'Azinu', null, 'האזינו' ]
];


// parsha doubler/undoubler
function D(p) {
	return -p;
}

var RH = [ 'Rosh Hashana', null, 'ראש השנה' ]; //0
var YK = [ 'Yom Kippur', null, 'יום כיפור' ];  //1

var SUKKOT = [ 'Sukkot', 'Succos', 'סוכות' ];  //0
var CHMSUKOT = [ 'Chol hamoed Sukkot', 'Chol hamoed Succos', 'חול המועד סוכות' ];  //0
var SHMINI = [ 'Shmini Atzeret', 'Shmini Atzeres', 'שמיני עצרת' ];  //0
var EOY = [ 'End-of-Year: Simchat-Torah, Sukkot', 'End-of-Year: Simchas-Torah, Succos', 'סופשנה: סוכות וסמחת תורה' ];  //0

var PESACH = [ 'Pesach', null, 'פסח' ]; //25
var CHMPESACH = [ 'Chol hamoed Pesach', null, 'חול המועד פסח' ];  //25
var PESACH7 = [ 'Second days of Pesach', null, 'שביעי של פסח' ]; //25

var SHAVUOT = [ 'Shavuot', 'Shavuos', 'שבועות' ]; //33




// The ordinary year types (keviot)

var types = {};

/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
 * Kislev each have 29 days), and has Passover start on Tuesday. */
//e.g. 5753
types.nonleap_monday_incomplete =
[51, 52, EOY, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, D(21), 23, 24, PESACH, 25, D(26), D(28), 30, D(31), 33, 34,
 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49, D(50)];

/* Hebrew year that starts on Monday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
//e.g. 5756
types.nonleap_monday_complete_diaspora =
[51, 52, EOY, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, D(21), 23, 24, PESACH, 25, D(26), D(28), 30, D(31), 33,
 SHAVUOT, 34, 35, 36, 37, D(38), 40, D(41), 43, 44, 45, 46, 47, 48, 49,
 D(50)];

/* Hebrew year that starts on Monday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types.nonleap_monday_complete_israel = types.nonleap_monday_incomplete

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
//e.g. 5715
types.nonleap_tuesday_regular_diaspora = types.nonleap_monday_complete_diaspora

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
types.nonleap_tuesday_regular_israel = types.nonleap_monday_incomplete

/* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
//e.g. 5701
types.nonleap_thursday_regular_diaspora =
[52, YK, EOY, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, D(21), 23, 24, PESACH, PESACH, 25, D(26), D(28), 30, D(31),
 33, 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49, 50];

/* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
// e.g. 5745
types.nonleap_thursday_regular_israel =
[52, YK, EOY, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, D(21), 23, 24, PESACH, 25, D(26), D(28), 30, 31, 32, 33,
 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49, 50];

/* Hebrew year that starts on Thursday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Sunday. */
//e.g. 5754
types.nonleap_thursday_complete =
[52, YK, CHMSUKOT, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, 21, 22, 23, 24, PESACH7, 25, D(26), D(28), 30, D(31), 33,
 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49, 50];

/* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and Kislev
 * each have 29 days), and has Passover start on Sunday. */
//e.g. 5761
types.nonleap_saturday_incomplete =
[RH, 52, SUKKOT, SHMINI, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
 15, 16, 17, 18, 19, 20, D(21), 23, 24, PESACH7, 25, D(26), D(28), 30, D(31),
 33, 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49,
 50];


/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Tuesday. */
//e.g. 5716
types.nonleap_saturday_complete =
[RH, 52, SUKKOT, SHMINI, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
 16, 17, 18, 19, 20, D(21), 23, 24, CHMPESACH, 25, D(26), D(28), 30,
 D(31), 33, 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47,
 48, 49, D(50)];


/* --  The leap year types (keviot) -- */
/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
 * Kislev each have 29 days), and has Passover start on Thursday. */
//e.g. 5746
types.leap_monday_incomplete_diaspora =
[51, 52, null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, null, 28, 29, 30, 31, 32, 33,
 null, 34, 35, 36, 37, D(38), 40, D(41), 43, 44, 45, 46, 47, 48, 49,
 D(50)];

/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
 * Kislev each have 29 days), and has Passover start on Thursday. */
//e.g. 5746
types.leap_monday_incomplete_israel =
[51, 52, CHMSUKOT, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, CHMPESACH, 28, 29, 30, 31, 32, 33,
 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49, D(50)];

/* Hebrew year that starts on Monday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Saturday. */
//e.g.5752
types.leap_monday_complete_diaspora =
[51, 52, CHMSUKOT, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, PESACH, PESACH, 28, 29, 30, 31, 32,
 33, 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49, 50];

/* Hebrew year that starts on Monday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Saturday. */
//e.g.5752
types.leap_monday_complete_israel =
[51, 52, CHMSUKOT, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, PESACH, 28, 29, 30, 31, 32, 33,
 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
// e.g. 5715
types.leap_tuesday_regular_diaspora = types.leap_monday_complete_diaspora

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
types.leap_tuesday_regular_israel= types.leap_monday_complete_israel;

/* Hebrew year that starts on Thursday, is `incomplete' (Heshvan and
 * Kislev both have 29 days), and has Passover start on Sunday. */
//e.g. 5768
types.leap_thursday_incomplete =
[52, YK, CHMSUKOT, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, PESACH7, 29, 30, 31, 32, 33,
 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

/* Hebrew year that starts on Thursday, is `complete' (Heshvan and
 * Kislev both have 30 days), and has Passover start on Tuesday. */
//eg. 5771
types.leap_thursday_complete =
[52, YK, CHMSUKOT, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, CHMPESACH, 29, 30, 31, 32, 33,
 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, D(50)];

/* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and
 * Kislev each have 29 days), and has Passover start on Tuesday. */
//e.g.5757
types.leap_saturday_incomplete =
[RH, 52, SUKKOT, SHMINI, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, CHMPESACH, 28, 29, 30, 31, 32,
 33, 34, 35, 36, 37, 38, 39, 40, D(41), 43, 44, 45, 46, 47, 48, 49,
 D(50)];

/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types.leap_saturday_complete_diaspora =
[RH, 52, null, null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, null, 28, 29, 30, 31, 32,
 33, null, 34, 35, 36, 37, D(38), 40, D(41), 43, 44, 45, 46, 47, 48, 49,
 D(50)];

/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types.leap_saturday_complete_israel = types.leap_saturday_incomplete;



function ROSH_DAY_INDEX(x) {
	return (x === 1) ? 0 : x / 2;
}

// sedra_years_array[leap][rosh_day][type][israel/diaspora]
var sedra_years_array =  // [2][4][3][2]
[
	[                             // nonleap years
		
		[                           // monday
			[                         // incomplete
				types.nonleap_monday_incomplete,
				types.nonleap_monday_incomplete
			],
			
			[                         // regular
				null, null
			],
			
			[                         // complete
				types.nonleap_monday_complete_diaspora,
				types.nonleap_monday_complete_israel
			]
			
		],
		
		[                           // tuesday
			[                         // incomplete
				null, null
			],
			
			[                         // regular   //e.g. 5715
				types.nonleap_tuesday_regular_diaspora,
				types.nonleap_tuesday_regular_israel 
				
			],
			
			[                         // complete
				null, null
			]
		],
		
		[                           // thursday
			[                         // incomplete
				null, null
			],
			
			[                         // regular  //e.g. 5745
				types.nonleap_thursday_regular_diaspora,
				types.nonleap_thursday_regular_israel
			],
			
			[                         // complete
				types.nonleap_thursday_complete,
				types.nonleap_thursday_complete
			]
		],
		
		[                           // saturday
			[                         // incomplete
				types.nonleap_saturday_incomplete,
				types.nonleap_saturday_incomplete
			],
			
			[                         // regular
				null, null
			],
			
			[                         // complete
				types.nonleap_saturday_complete,
				types.nonleap_saturday_complete  //e.g. 5716
			]
		]
	],
	
	
	[                             // leap years
		[                           // monday
			[                         // incomplete //e.g. 5746
				types.leap_monday_incomplete_diaspora,
				types.leap_monday_incomplete_israel
			],
			
			[                         // regular
				null, null
			],
			
			[                         // complete
				types.leap_monday_complete_diaspora,
				types.leap_monday_complete_israel
			]
		],
		
		[                           // tuesday
			[                         // incomplete
			 null, null
			],
			
			[                         // regular
				types.leap_tuesday_regular_diaspora,
				types.leap_tuesday_regular_israel
			],
			
			[                         // complete
				null, null
			]
		],
		
	[                           // thursday
		[                         // incomplete
			types.leap_thursday_incomplete,
			types.leap_thursday_incomplete
		],
		
		[                         // regular
			null, null
		],
		
		[                         // complete
			types.leap_thursday_complete,
			types.leap_thursday_complete
		]
	],
		
		[                           // saturday
			[                         // incomplete
				types.leap_saturday_incomplete,
				types.leap_saturday_incomplete
			],
			
			[                         // regular
				null, null
			],
			
			[                         // complete
				types.leap_saturday_complete_diaspora,
				types.leap_saturday_complete_israel
			]
		]
	]
];

Sedra.prototype.getSedraFromHebcalDate = function(hDate) {
	return this.getSedraFromAbsDate(hDate.abs());
};

// returns an array describing the parsha on the first saturday on or after absdate
//FIX: ignores holidays on the birthday thru friday.
Sedra.prototype.getSedraFromAbsDate = function(absDate) {

	// find the first saturday on or after today's date
	var absDate = c.day_on_or_before(6, absDate + 6);
	
	var weekNum = (absDate - this.first_saturday) / 7;
	var index = this.theSedraArray[weekNum];
	
	if (null === index)
		return null;
	if (typeof index == 'object'){
		// Shabbat has a chag.  return a description
		return [index];
	}
	if (index >= 0)
		return [parshiot[index]];
	
	var i = D(index);      // undouble the parsha
	return [parshiot[i], parshiot[i + 1]];
};

module.exports = Sedra;
},{"./common":3,"./hdate":6}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[2])


//# sourceMappingURL=hebcal.noloc.js.map
