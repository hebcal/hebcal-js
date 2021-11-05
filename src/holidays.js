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
	gematriya = require('gematriya');

var __cache = {};

// for byte optimizations

var dayOnOrBefore = c.dayOnOrBefore,
	months = c.months,
	days = c.days,
	TISHREI = months.TISHREI,
	KISLEV = months.KISLEV,
	NISAN = months.NISAN,
	SAT = days.SAT,
	getDay = 'getDay',
	abs = 'abs',
	Shabbat = 'Shabbat',
	Shabbos = 'Shabbos';

function Chanukah(day) {
	return ['Chanukah: Candle ' + day, 0, 'חנוכה: נר ' + gematriya(day)];
}

function CHM(desc) {
	return [desc[0] + ' (CH"M)', desc[1] ? desc[1] + ' (CH"M)' : desc[1], desc[2] ? desc[2] + ' (חוה"מ)' : desc[2]];
}

function Sukkot(day) {
	return ['Sukkot: ' + day, 'Succos: ' + day, 'סוכות יום ' + gematriya(day)];
}

function Pesach(day) {
	return ['Pesach: ' + day, 0, 'פסח יום ' + gematriya(day)];
}

var USER_EVENT          = 1,
	LIGHT_CANDLES       = 2,
	YOM_TOV_ENDS        = 4,
	CHUL_ONLY           = 8, // chutz l'aretz (Diaspora)
	IL_ONLY             = 16, // b'aretz (Israel)
	LIGHT_CANDLES_TZEIS = 32;

exports.masks = {
	USER_EVENT         : USER_EVENT,
	LIGHT_CANDLES      : LIGHT_CANDLES,
	YOM_TOV_ENDS       : YOM_TOV_ENDS,
	CHUL_ONLY          : CHUL_ONLY,
	IL_ONLY            : IL_ONLY,
	LIGHT_CANDLES_TZEIS: LIGHT_CANDLES_TZEIS
};

function Event(date, desc, mask) {
	var me = this;
	me.date = new HDate(date);
	me.desc = typeof desc != 'object' ? [desc] : desc;

	me.USER_EVENT          = !!( mask & USER_EVENT           );
	me.LIGHT_CANDLES       = !!( mask & LIGHT_CANDLES        );
	me.YOM_TOV_ENDS        = !!( mask & YOM_TOV_ENDS         );
	me.CHUL_ONLY           = !!( mask & CHUL_ONLY            );
	me.IL_ONLY             = !!( mask & IL_ONLY              );
	me.LIGHT_CANDLES_TZEIS = !!( mask & LIGHT_CANDLES_TZEIS  );
}

Event.prototype.is = function(date, il) {
	date = new HDate(date), myDate = this.date;
	if (arguments.length < 2) {
		//il = Event.isIL;
		il = date.il;
	}
	if (date.getDate() != myDate.getDate() || date.getMonth() != myDate.getMonth()) {
		return false;
	}
	if (date.getFullYear() != myDate.getFullYear()) {
		return false;
	}
	if (il && this.CHUL_ONLY || !il && this.IL_ONLY) {
		return false;
	}
	return true;
};

Event.prototype.masks = function() {
	var me = this;
	return (me.USER_EVENT          && USER_EVENT)    |
		   (me.LIGHT_CANDLES       && LIGHT_CANDLES) |
		   (me.YOM_TOV_ENDS        && YOM_TOV_ENDS)  |
		   (me.CHUL_ONLY           && CHUL_ONLY)     |
		   (me.IL_ONLY             && IL_ONLY)       |
		   (me.LIGHT_CANDLES_TZEIS && LIGHT_CANDLES_TZEIS);
};

Event.prototype.getDesc = function(o) {
	return c.LANG(this.desc, o);
};

Event.prototype.candleLighting = function() {
	var date = this.date;
	if (this.LIGHT_CANDLES) {
		return new Date(date.sunset() - (Event.candleLighting * 60 * 1000));
	} else if (this.LIGHT_CANDLES_TZEIS) {
		return date.getZemanim().tzeit;
	}
	return null;
};

Event.prototype.havdalah = function() {
	if (this.YOM_TOV_ENDS) {
		return new Date(this.date.sunset().getTime() + (Event.havdalah * 60 * 1000));
	}
	return null;
};

Event.prototype.routine = (function(){
	function routine(){
		return !!~routine.names.indexOf(this.getDesc('s'));
	}
	routine.names = [Shabbat, 'Erev ' + Shabbat];
	return routine;
})();

Event.isIL = false;

Event.candleLighting = 18;

Event.havdalah = 42;

exports.Event = Event;

exports.year = function(year) {
	if (__cache[year]) {
		return __cache[year];
	}

	var	RH = new HDate(1, TISHREI, year),
		pesach = new HDate(15, NISAN, year),
		tmpDate;

	var h = {};

	function add(ev) {
		if (Array.isArray(ev)) {
			ev.forEach(function(e){
				add(e);
			});
		} else {
			if (h[ev.date]) {
				h[ev.date].push(ev);
			} else {
				h[ev.date] = [ev];
			}
		}
	}

	Object.defineProperty(h, 'add', {value: add});

	add([ // standard holidays that don't shift based on year
		new Event(
			RH,
			['Rosh Hashana 1', 0, 'ראש השנה א\''],
			LIGHT_CANDLES_TZEIS
		), new Event(
			new HDate(2, TISHREI, year),
			['Rosh Hashana 2', 0, 'ראש השנה ב\''],
			YOM_TOV_ENDS
		), new Event(
			new HDate(3 + (RH[getDay]() == days.THU), TISHREI, year), // push off to SUN if RH is THU
			['Tzom Gedaliah', 0, 'צום גדליה'],
			0
		), new Event(
			new HDate(9, TISHREI, year),
			['Erev Yom Kippur', 0, 'ערב יום כיפור'],
			LIGHT_CANDLES
		), new Event( // first SAT after RH
			new HDate(dayOnOrBefore(SAT, 7 + RH[abs]())),
			[Shabbat + ' Shuva', Shabbos + ' Shuvah', 'שבת שובה'],
			0
		), new Event(
			new HDate(10, TISHREI, year),
			['Yom Kippur', 0, 'יום כיפור'],
			YOM_TOV_ENDS
		), new Event(
			new HDate(14, TISHREI, year),
			['Erev Sukkot', 'Erev Succos', 'ערב סוכות'],
			LIGHT_CANDLES
		), new Event(
			new HDate(15, TISHREI, year),
			Sukkot(1),
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(15, TISHREI, year),
			Sukkot(1),
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(16, TISHREI, year),
			Sukkot(2),
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(16, TISHREI, year),
			CHM(Sukkot(2)),
			IL_ONLY
		), new Event(
			new HDate(17, TISHREI, year),
			CHM(Sukkot(3)),
			0
		), new Event(
			new HDate(18, TISHREI, year),
			CHM(Sukkot(4)),
			0
		), new Event(
			new HDate(19, TISHREI, year),
			CHM(Sukkot(5)),
			0
		), new Event(
			new HDate(20, TISHREI, year),
			CHM(Sukkot(6)),
			0
		), new Event(
			new HDate(21, TISHREI, year),
			['Sukkot: 7 (Hoshana Raba)', 'Succos: 7 (Hoshana Raba)', 'סוכות יום ז\' (הושענא רבה)'],
			LIGHT_CANDLES
		), new Event(
			new HDate(22, TISHREI, year),
			['Shmini Atzeret', 'Shmini Atzeres', 'שמיני עצרת'],
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(22, TISHREI, year),
			['Shmini Atzeret / Simchat Torah', 'Shmini Atzeres / Simchas Torah', 'שמיני עצרת / שמחת תורה'],
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(23, TISHREI, year),
			['Simchat Torah', 'Simchas Torah', 'שמחת תורה'],
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(24, KISLEV, year),
			['Erev Chanukah', 0, 'ערב חנוכה'],
			0
		), new Event(
			new HDate(25, KISLEV, year),
			Chanukah(1),
			0
		), new Event(
			new HDate(26, KISLEV, year),
			Chanukah(2),
			0
		), new Event(
			new HDate(27, KISLEV, year),
			Chanukah(3),
			0
		), new Event(
			new HDate(28, KISLEV, year),
			Chanukah(4),
			0
		), new Event(
			new HDate(29, KISLEV, year),
			Chanukah(5),
			0
		), new Event(
			new HDate(30, KISLEV, year), // yes, i know these are wrong
			Chanukah(6),
			0
		), new Event(
			new HDate(31, KISLEV, year), // HDate() corrects the month automatically
			Chanukah(7),
			0
		), new Event(
			new HDate(32, KISLEV, year),
			Chanukah(8),
			0
		), new Event(
			new HDate(15, months.SHVAT, year),
			["Tu B'Shvat", 0, 'ט"ו בשבט'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 43)),
			[Shabbat + ' Shekalim', Shabbos + ' Shekalim', 'שבת שקלים'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 30)),
			[Shabbat + ' Zachor', Shabbos + ' Zachor', 'שבת זכור'],
			0
		), new Event(
			new HDate(pesach[abs]() - (pesach[getDay]() == days.TUE ? 33 : 31)),
			["Ta'anit Esther", "Ta'anis Esther", 'תענית אסתר'],
			0
		), new Event(
			new HDate(13, months.ADAR_II, year),
			['Erev Purim', 0, 'ערב פורים'],
			0
		), new Event(
			new HDate(14, months.ADAR_II, year),
			['Purim', 0, 'פורים'],
			0
		), new Event(
			new HDate(15, months.ADAR_II, year),
			['Shushan Purim', 0, 'שושן פורים'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 14) - 7),
			[Shabbat + ' Parah', Shabbos + ' Parah', 'שבת פרה'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 14)),
			[Shabbat + ' Hachodesh', Shabbos + ' Hachodesh', 'שבת החודש'],
			0
		), new Event(
			new HDate(dayOnOrBefore(SAT, pesach[abs]() - 1)),
			[Shabbat + ' HaGadol', Shabbos + ' HaGadol', 'שבת הגדול'],
			0
		), new Event(
			// if the fast falls on Shabbat, move to Thursday
			pesach.prev()[getDay]() == SAT ? pesach.onOrBefore(days.THU) : new HDate(14, NISAN, year),
			["Ta'anit Bechorot", "Ta'anis Bechoros", 'תענית בכורות'],
			0
		), new Event(
			new HDate(14, NISAN, year),
			['Erev Pesach', 0, 'ערב פסח'],
			LIGHT_CANDLES
		), new Event(
			new HDate(15, NISAN, year),
			Pesach(1),
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(15, NISAN, year),
			Pesach(1),
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(16, NISAN, year),
			Pesach(2),
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(16, NISAN, year),
			CHM(Pesach(2)),
			IL_ONLY
		), new Event(
			new HDate(16, NISAN, year),
			['Start counting Omer', 0, 'התחלת ספירת העומר'],
			0
		), new Event(
			new HDate(17, NISAN, year),
			CHM(Pesach(3)),
			0
		), new Event(
			new HDate(18, NISAN, year),
			CHM(Pesach(4)),
			0
		), new Event(
			new HDate(19, NISAN, year),
			CHM(Pesach(5)),
			0
		), new Event(
			new HDate(20, NISAN, year),
			CHM(Pesach(6)),
			LIGHT_CANDLES
		), new Event(
			new HDate(21, NISAN, year),
			Pesach(7),
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(21, NISAN, year),
			Pesach(7),
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(22, NISAN, year),
			Pesach(8),
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(14, months.IYYAR, year),
			['Pesach Sheni', 0, 'פסח שני'],
			0
		), new Event(
			new HDate(18, months.IYYAR, year),
			["Lag B'Omer", 0, 'ל"ג בעומר'],
			0
		), new Event(
			new HDate(5, months.SIVAN, year),
			['Erev Shavuot', 'Erev Shavuos', 'ערב שבועות'],
			LIGHT_CANDLES
		), new Event(
			new HDate(6, months.SIVAN, year),
			['Shavuot 1', 'Shavuos 1', 'שבועות א\''],
			LIGHT_CANDLES_TZEIS | CHUL_ONLY
		), new Event(
			new HDate(6, months.SIVAN, year),
			['Shavuot', 'Shavuos', 'שבועות'],
			YOM_TOV_ENDS | IL_ONLY
		), new Event(
			new HDate(7, months.SIVAN, year),
			['Shavuot 2', 'Shavuos 2', 'שבועות ב\''],
			YOM_TOV_ENDS | CHUL_ONLY
		), new Event(
			new HDate(dayOnOrBefore(SAT, new HDate(1, TISHREI, year + 1)[abs]() - 4)),
			['Leil Selichot', 'Leil Selichos', 'ליל סליחות'],
			0
		), new Event(
			new HDate(29, months.ELUL, year),
			['Erev Rosh Hashana', 0, 'ערב ראש השנה'],
			LIGHT_CANDLES
		)
	]);

	tmpDate = new HDate(10, months.TEVET, year);
	if (tmpDate[getDay]() == SAT) {
		tmpDate = tmpDate.next();
	}
	add(new Event(
		tmpDate,
		["Asara B'Tevet", 0, 'עשרה בטבת'],
		0
	));

	if (c.LEAP(year)) {
		add(new Event(
			new HDate(14, months.ADAR_I, year),
			['Purim Katan', 0, 'פורים קטן'],
			0
		));

		add(new Event(
			new HDate(15, months.ADAR_I, year),
			['Shushan Purim Katan', 0, 'שושן פורים קטן'],
			0
		));
	}

	if (year >= 5711) { // Yom HaShoah first observed in 1951
		tmpDate = new HDate(27, NISAN, year);
		/* When the actual date of Yom Hashoah falls on a Friday, the
		 * state of Israel observes Yom Hashoah on the preceding
		 * Thursday. When it falls on a Sunday, Yom Hashoah is observed
		 * on the following Monday.
		 * http://www.ushmm.org/remembrance/dor/calendar/
		 */

		if (tmpDate[getDay]() == days.FRI) {
			tmpDate = tmpDate.prev();
		} else if (tmpDate[getDay]() == days.SUN) {
			tmpDate = tmpDate.next();
		}

		add(new Event(
			tmpDate,
			['Yom HaShoah', 0, 'יום השואה'],
			0
		));
	}

	add(atzmaut(year));

	if (year >= 5727) { // Yom Yerushalayim only celebrated after 1967
		add(new Event(
			new HDate(28, months.IYYAR, year),
			['Yom Yerushalayim', 0, 'יום ירושלים'],
			0
		));
	}

	tmpDate = new HDate(17, months.TAMUZ, year);
	if (tmpDate[getDay]() == SAT) {
		tmpDate = tmpDate.next();
	}
	add(new Event(
		tmpDate,
		["Shiva-Asar B'Tamuz", 0, "צום יז' בתמוז"],
		0
	));

	tmpDate = new HDate(9, months.AV, year);
	if (tmpDate[getDay]() == SAT) {
		tmpDate = tmpDate.next();
	}

	add(new Event(
		new HDate(dayOnOrBefore(SAT, tmpDate[abs]())),
		[Shabbat + ' Chazon', Shabbos + ' Chazon', 'שבת חזון'],
		0
	));

	add(new Event(
		tmpDate.prev(),
		["Erev Tish'a B'Av", 0, 'ערב תשעה באב'],
		0
	));

	add(new Event(
		tmpDate,
		["Tish'a B'Av", 0, 'תשעה באב'],
		0
	));

	add(new Event(
		new HDate(dayOnOrBefore(SAT, tmpDate[abs]() + 7)),
		[Shabbat + ' Nachamu', Shabbos + ' Nachamu', 'שבת נחמו'],
		0
	));

	for (var day = 6; day < c.daysInYear(year) + 7; day += 7) {
		add(new Event(
			new HDate(dayOnOrBefore(SAT, new HDate(1, TISHREI, year)[abs]() + day)),
			[Shabbat, Shabbos, 'שבת'],
			YOM_TOV_ENDS
		));

		add(new Event(
			new HDate(dayOnOrBefore(days.FRI, new HDate(1, TISHREI, year)[abs]() + day)),
			['Erev ' + Shabbat, 'Erev ' + Shabbos, 'ערב שבת'],
			LIGHT_CANDLES
		));
	}

	for (var month = 1; month <= c.MONTH_CNT(year); month++) {
		if ((month == NISAN ? c.daysInMonth(c.MONTH_CNT(year - 1), year - 1) :
				c.daysInMonth(month - 1, year)) == 30) {
			add(new Event(
				new HDate(1, month, year),
				['Rosh Chodesh 2', 0, "ראש חודש ב'"],
				0
			));

			add(new Event(
				new HDate(30, month - 1, year),
				['Rosh Chodesh 1', 0, "ראש חודש א'"],
				0
			));
		} else if (month !== TISHREI) {
			add(new Event(
				new HDate(1, month, year),
				['Rosh Chodesh', 0, 'ראש חודש'],
				0
			));
		}

		if (month == months.ELUL) {
			continue;
		}

		add(new Event(
			new HDate(29, month, year).onOrBefore(SAT),
			[Shabbat + ' Mevarchim', Shabbos + ' Mevorchim', 'שבת מברכים'],
			0
		));
	}

	return __cache[year] = h;
};

function atzmaut(year) {
	if (year >= 5708) { // Yom HaAtzma'ut only celebrated after 1948
		var tmpDate = new HDate(1, months.IYYAR, year), pesach = new HDate(15, NISAN, year);

		if (pesach[getDay]() == days.SUN) {
			tmpDate.setDate(2);
		} else if (pesach[getDay]() == SAT) {
			tmpDate.setDate(3);
		} else if (year < 5764) {
			tmpDate.setDate(4);
		} else if (pesach[getDay]() == days.TUE) {
			tmpDate.setDate(5);
		} else {
			tmpDate.setDate(4);
		}

		return [new Event(
			tmpDate,
			['Yom HaZikaron', 0, 'יום הזיכרון'],
			0
		), new Event(
			tmpDate.next(),
			["Yom HaAtzma'ut", 0, 'יום העצמאות'],
			0
		)];
	}
	return [];
}
exports.atzmaut = atzmaut;
