var map = {
	chatzot: 'chatzot',
	chatzos: 'chatzot',
	midday: 'chatzot',
	mid: 'chatzot',
	noon: 'chatzot',
	chatzot_night: 'chatzot_night',
	midnight: 'chatzot_night',
	alot_hashachar: 'alot_hashachar',
	alot_hashacher: 'alot_hashachar',
	alot: 'alot_hashachar',
	alos_hashachar: 'alot_hashachar',
	alos_hashacher: 'alot_hashachar',
	alos: 'alot_hashachar',
	dawn: 'alot_hashachar',
	misheyakir: 'misheyakir',
	tefillin: 'misheyakir',
	tallit: 'misheyakir',
	tallis: 'misheyakir',
	misheyakir_machmir: 'misheyakir_machmir',
	sof_zman_shma: 'sof_zman_shma',
	shma: 'sof_zman_shma',
	sof_zman_tfilla: 'sof_zman_tfilla',
	tfilla: 'sof_zman_tfilla',
	mincha_gedola: 'mincha_gedola',
	mincha_ketana: 'mincha_ketana',
	plag_hamincha: 'plag_hamincha',
	plag: 'plag_hamincha',
	tzeit: 'tzeit',
	tzeis: 'tzeit',
	nightfall: 'tzeit',
	neitz_hachama: 'neitz_hachama',
	neitz: 'neitz_hachama',
	sunrise: 'neitz_hachama',
	rise: 'neitz_hachama',
	shkiah: 'shkiah',
	sunset: 'shkiah',
	set: 'shkiah'
};

module.exports = function(time){
	return map[time.trim().toLowerCase().replace(/\s+/g,'_')];
};

module.exports.add = function(time, replace) {
	map[time] = replace;
};

module.exports.map = map;

module.exports.arr = [
	[ 'chatzot', 'chatzot', 'chatzos', 'midday', 'mid' ],
	[ 'chatzot night', 'chatzot night', 'midnight' ],
	[ 'alot hashachar', 'alot hashachar', 'alot hashacher', 'alot', 'alos hashachar', 'alos hashacher', 'alos', 'dawn' ],
	[ 'misheyakir', 'misheyakir', 'tefillin', 'tallit', 'tallis' ],
	[ 'misheyakir machmir', 'misheyakir machmir' ],
	[ 'sof zman shma', 'sof zman shma', 'shma' ],
	[ 'sof zman tfilla', 'sof zman tfilla', 'tfilla' ],
	[ 'mincha gedola', 'mincha gedola' ],
	[ 'mincha ketana', 'mincha ketana' ],
	[ 'plag hamincha', 'plag hamincha', 'plag' ],
	[ 'tzeit', 'tzeit', 'tzeis', 'nightfall' ],
	[ 'neitz hachama', 'neitz hachama', 'neitz', 'sunrise', 'rise' ],
	[ 'shkiah', 'shkiah', 'sunset', 'set' ]
];