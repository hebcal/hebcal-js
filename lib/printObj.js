module.exports = function(obj) {
	var echo = '', i;
	for (i in obj) {
		echo += obj[i] + '\n\n';
	}
	return echo.trim();
};