module.exports = function(arr, opts){
	opts = opts || {};
	var lengths = arr.map(function(v){
		return v.map(function(s){return s.toString()});
	}).reduce(function(longest, col){
		return longest.map(function(l, i){
			return col[i].length > l.length ? col[i] : l;
		});
	}).map(function(l){return l.length});
	return arr.map(function(col){
		return (opts.prefix || '') + col.map(function(box, i){
			return pad(box, lengths[i], opts.pad || ' ');
		}).join(opts.sep || ' ') + (opts.suffix || '');
	}).join('\n');
};

function pad(str, length, c) {
	return str.length >= length ? str : pad(str + c, length, c);
}