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