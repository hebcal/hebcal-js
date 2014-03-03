var map = {
	chatzot: 'chatzot',
	chatzos: 'chatzot',
	midday: 'chatzot',
	mid: 'chatzot',
	chatzot_night: 'chatzot_night',
	midnight: 'chatzot_night',
	alot_hashacher: 'alot_hashacher',
	alot: 'alot_hashacher',
	alos_hashacher: 'alot_hashacher',
	alos: 'alot_hashacher',
	dawn: 'alot_hashacher',
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