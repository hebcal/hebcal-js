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

var concat = 'concat', range = c.range; // for client optimization

var INCOMPLETE = 0,
	REGULAR = 1,
	COMPLETE = 2;

function Sedra(hebYr, il) { // the Hebrew year
	il = !!il;
	var long_c = c.lngChesh(hebYr);
	var short_k = c.shrtKis(hebYr);
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
	var rosh_hashana_day = (rosh_hashana % 7) + 1;

	// find the first Saturday on or after Rosh Hashana
	this.first_saturday = c.dayOnOrBefore(6, rosh_hashana + 6);
	var leap = +c.LEAP(hebYr);
	this.type = type;
	this.rosh_hashana_day = rosh_hashana_day;
	this.leap = leap;
	this.il = il;

	var core = "" + leap + rosh_hashana_day + type;
	if (types[core]) {
		this.theSedraArray = types[core];
	} else {
		this.theSedraArray = types[core + (+il)]; // cast to num, then concat
	}

	if (!this.theSedraArray) {
		console.log(this);
		throw new TypeError("improper sedra year type calculated.");
	}
}

var parshiot = Sedra.parshiot = [
	[ 'Bereshit', 'Bereshis', 'בראשית' ], // 0
	[ 'Noach', 0, 'נח' ],
	[ 'Lech-Lecha', 0, 'לך-לך' ],
	[ 'Vayera', 0, 'וירא' ],
	[ 'Chayei Sara', 0, 'חיי שרה' ],
	[ 'Toldot', 'Toldos', 'תולדות' ],
	[ 'Vayetzei', 0, 'ויצא' ],
	[ 'Vayishlach', 0, 'וישלח' ],
	[ 'Vayeshev', 0, 'וישב' ],
	[ 'Miketz', 0, 'מקץ' ],
	[ 'Vayigash', 0, 'ויגש' ], // 10
	[ 'Vayechi', 0, 'ויחי' ],
	[ 'Shemot', 'Shemos', 'שמות' ],
	[ 'Vaera', 0, 'וארא' ],
	[ 'Bo', 0, 'בא' ],
	[ 'Beshalach', 0, 'בשלח' ],
	[ 'Yitro', 'Yisro', 'יתרו' ],
	[ 'Mishpatim', 0, 'משפטים' ],
	[ 'Terumah', 0, 'תרומה' ],
	[ 'Tetzaveh', 0, 'תצוה' ],
	[ 'Ki Tisa', 'Ki Sisa', 'כי תשא' ], // 20
	[ 'Vayakhel', 0, 'ויקהל' ],
	[ 'Pekudei', 0, 'פקודי' ],
	[ 'Vayikra', 0, 'ויקרא' ],
	[ 'Tzav', 0, 'צו' ],
	[ 'Shmini', 0, 'שמיני' ],
	[ 'Tazria', 0, 'תזריע' ],
	[ 'Metzora', 0, 'מצורע' ],
	[ 'Achrei Mot', 'Achrei Mos', 'אחרי מות' ],
	[ 'Kedoshim', 0, 'קדשים' ],
	[ 'Emor', 0, 'אמור' ], // 30
	[ 'Behar', 0, 'בהר' ],
	[ 'Bechukotai', 'Bechukosai', 'בחקתי' ],
	[ 'Bamidbar', 0, 'במדבר' ],
	[ 'Nasso', 0, 'נשא' ],
	[ 'Beha\'alotcha', 'Beha\'aloscha', 'בהעלתך' ],
	[ 'Sh\'lach', 0, 'שלח לך' ],
	[ 'Korach', 0, 'קורח' ],
	[ 'Chukat', 'Chukas', 'חקת' ],
	[ 'Balak', 0, 'בלק' ],
	[ 'Pinchas', 0, 'פינחס' ], // 40
	[ 'Matot', 'Matos', 'מטות' ],
	[ 'Masei', 0, 'מסעי' ],
	[ 'Devarim', 0, 'דברים' ],
	[ 'Vaetchanan', 'V\'eschanan', 'ואתחנן' ],
	[ 'Eikev', 0, 'עקב' ],
	[ 'Re\'eh', 0, 'ראה' ],
	[ 'Shoftim', 0, 'שופטים' ],
	[ 'Ki Teitzei', 'Ki Seitzei', 'כי תצא' ],
	[ 'Ki Tavo', 'Ki Savo', 'כי תבוא' ],
	[ 'Nitzavim', 0, 'נצבים' ], // 50
	[ 'Vayeilech', 0, 'וילך' ],
	[ 'Ha\'Azinu', 0, 'האזינו' ]
];


// parsha doubler/undoubler
function D(p) {
	return -p;
}

// these are wrapped to protect them from [].concat()
var RH = [[ 'Rosh Hashana', 0, 'ראש השנה' ]]; //0
var YK = [[ 'Yom Kippur', 0, 'יום כיפור' ]];  //1

var SUKKOT = [[ 'Sukkot', 'Succos', 'סוכות' ]];  //0
var CHMSUKOT = [[ 'Chol hamoed Sukkot', 'Chol hamoed Succos', 'שבת חול המועד סוכות' ]];  //0
var SHMINI = [[ 'Shmini Atzeret', 'Shmini Atzeres', 'שמיני עצרת' ]];  //0

var PESACH = [[ 'Pesach', 0, 'פסח' ]]; //25
var CHMPESACH = [[ 'Chol hamoed Pesach', 0, 'חול המועד פסח' ]];  //25
var PESACH7 = [[ 'Second days of Pesach', 0, 'שביעי של פסח' ]]; //25

var SHAVUOT = [[ 'Shavuot', 'Shavuos', 'שבועות' ]]; //33



// The ordinary year types (keviot)

// names are leap/nonleap - day - incomplete/regular/complete - diaspora/Israel

var types = {

	/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Tuesday. */
	//e.g. 5753
	'020' : [51, 52][concat](CHMSUKOT, range(0, 20), D(21), 23, 24, PESACH, 25,
		D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Monday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Thursday. */
	//e.g. 5756
	'0220' : [51, 52][concat](CHMSUKOT, range(0, 20), D(21), 23, 24, PESACH, 25, D(26), D(28),
		30, D(31), 33, SHAVUOT, range(34, 37), D(38), 40, D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
	 * days and Kislev has 30 days), and has Passover start on Saturday. */
	//e.g. 5701
	'0510' : [52][concat](YK, CHMSUKOT, range(0, 20), D(21), 23, 24, PESACH, PESACH,
		25, D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Thursday, is `regular' (Heshvan has 29
	 * days and Kislev has 30 days), and has Passover start on Saturday. */
	// e.g. 5745
	'0511' : [52][concat](YK, CHMSUKOT, range(0, 20), D(21), 23, 24, PESACH,
		25, D(26), D(28), range(30, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Thursday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Sunday. */
	//e.g. 5754
	'052' : [52][concat](YK, CHMSUKOT, range(0, 24), PESACH7, 25, D(26),
		D(28), 30, D(31), range(33, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and Kislev
	 * each have 29 days), and has Passover start on Sunday. */
	//e.g. 5761
	'070' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 20), D(21), 23, 24, PESACH7,
		25, D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 50)
	),


	/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Tuesday. */
	//e.g. 5716
	'072' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 20), D(21), 23, 24, CHMPESACH, 25,
		D(26), D(28), 30, D(31), range(33, 40), D(41), range(43, 49), D(50)
	),


	/* --  The leap year types (keviot) -- */
	/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Thursday. */
	//e.g. 5746
	'1200' : [51, 52][concat](CHMSUKOT, range(0, 27), CHMPESACH, range(28, 33),
		SHAVUOT, range(34, 37), D(38), 40, D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Monday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Thursday. */
	//e.g. 5746
	'1201' : [51, 52][concat](CHMSUKOT, range(0, 27), CHMPESACH,
		range(28, 40), D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Monday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Saturday. */
	//e.g.5752
	'1220' : [51, 52][concat](CHMSUKOT, range(0, 27), PESACH,
		PESACH, range(28, 40), D(41), range(43, 50)
	),

	/* Hebrew year that starts on Monday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Saturday. */
	//e.g.5752
	'1221' : [51, 52][concat](CHMSUKOT, range(0, 27), PESACH, range(28, 50)),

	/* Hebrew year that starts on Thursday, is `incomplete' (Heshvan and
	 * Kislev both have 29 days), and has Passover start on Sunday. */
	//e.g. 5768
	'150' : [52][concat](YK, CHMSUKOT, range(0, 28), PESACH7, range(29, 50)),

	/* Hebrew year that starts on Thursday, is `complete' (Heshvan and
	 * Kislev both have 30 days), and has Passover start on Tuesday. */
	//eg. 5771
	'152' : [52][concat](YK, CHMSUKOT, range(0, 28), CHMPESACH, range(29, 49), D(50)),

	/* Hebrew year that starts on Saturday, is `incomplete' (Heshvan and
	 * Kislev each have 29 days), and has Passover start on Tuesday. */
	//e.g.5757
	'170' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 27), CHMPESACH,
		range(28, 40), D(41), range(43, 49), D(50)
	),

	/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
	 * Kislev each have 30 days), and has Passover start on Thursday. */
	'1720' : [][concat](RH, 52, SUKKOT, SHMINI, range(0, 27), CHMPESACH, range(28, 33),
		SHAVUOT, range(34, 37), D(38), 40, D(41), range(43, 49), D(50)
	)
};

/* Hebrew year that starts on Monday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types['0221'] = types['020'];

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
//e.g. 5715
types['0310'] = types['0220'];

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Thursday. */
types['0311'] = types['020'];

/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
// e.g. 5715
types['1310'] = types['1220'];
/* Hebrew year that starts on Tuesday, is `regular' (Heshvan has 29
 * days and Kislev has 30 days), and has Passover start on Saturday. */
types['1311'] = types['1221'];

/* Hebrew year that starts on Saturday, is `complete' (Heshvan and
 * Kislev each have 30 days), and has Passover start on Thursday. */
types['1721'] = types['170'];


Sedra.prototype.get = function(hDate) {
	return abs(this, hDate.abs()).parsha;
};

Sedra.prototype.isParsha = function(hDate) {
	return !abs(this, hDate.abs()).chag;
};

// returns an array describing the parsha on the first Saturday on or after absdate
function abs(year, absDate) {

	// find the first saturday on or after today's date
	absDate = c.dayOnOrBefore(6, absDate + 6);

	var weekNum = (absDate - year.first_saturday) / 7;
	var index = year.theSedraArray[weekNum];

	if (undefined === index) {
		return abs(new Sedra(year.year + 1, year.il), absDate); // must be next year
	}
	if (typeof index == 'object') {
		// Shabbat has a chag. Return a description
		return {parsha: [index], chag: true};
	}
	if (index >= 0) {
		return {parsha: [parshiot[index]], chag: false};
	}

	index = D(index); // undouble the parsha
	return {parsha: [parshiot[index], parshiot[index + 1]], chag: false};
}

module.exports = Sedra;
