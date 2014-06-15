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

function getCity(city) {
	city = city.split(/\s+/).map(function(w,i,c){
		if (c.join(' ').toLowerCase() === 'washington dc' && i === 1) { // special case
			return w.toUpperCase();
		}
		return w[0].toUpperCase() + w.slice(1).toLowerCase();
	}).join(' ');
	return cities[city] || [ 0, 0, false ];
}
exports.getCity = getCity;

function listCities() {
	return Object.keys(cities);
}
exports.listCities = listCities;

exports.addCity = function(city, info) {
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

exports.nearest = function(lat, lon) {
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

	return listCities().map(function(city){
		var i = getCity(city);
		return {
			name: city,
			dist: Math.sqrt( Math.pow(Math.abs(i[0] - lat), 2) + Math.pow(Math.abs(i[1] - lon), 2) )
		};
	}).reduce(function(close,city){
		return close.dist < city.dist ? close : city;
	}).name;
};