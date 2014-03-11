module.exports = function table(arr, opts){
	opts = opts || {};
	opts.length = opts.length || process.stdout.columns || 100;
	opts.prefix = opts.prefix || '';
	opts.suffix = opts.suffix || '';
	opts.sep = opts.sep || ' ';
	opts.vert = opts.vert || '';
	opts.pad = opts.pad || ' ';

	noUndef(arr);
	var lengths = getLengths(arr);
//	console.log(lengths)

	return arr.map(function doRow(row){
//		console.log(row)
		var maxLength = Math.ceil((opts.length -
							opts.prefix.length -
							opts.suffix.length -
							(opts.sep.length * row.length)) / row.length);
//		console.log(maxLength)

		var t = opts.prefix + row.map(function(box, i){
			return pad(box, Math.min(lengths[i], maxLength), opts.pad);
		}).join(opts.sep) + opts.suffix;

//		console.log(t)
//		console.log(t.length)

		if (hasNL(t)) {
			var tmp = row.map(function(box){
				return box.split('\n');
			});
			noUndef(tmp);
//			console.log(tmp)

			var o = JSON.parse(JSON.stringify(opts));
			o.vert = '';

			return table(getCols(tmp), o);
		}

		if (t.length > opts.length) {
			return doRow(row.map(function(box, i){
				box = pad(box, Math.min(lengths[i], maxLength), opts.pad);
				var len = box.length;
//				console.log(box)
				if (hasNL(box)) {
					len = Math.max.apply(null, getLengths([box.split('\n')]));
				}
//				console.log(len)
				if (len > maxLength) {
					return box.slice(0, maxLength) + '\n' + box.slice(maxLength);
				}
				return box;
			}));
		}
		return t;
	}).join('\n' + (opts.vert ? pad(opts.vert, opts.length, opts.vert) + '\n' : ''));
};

function noUndef(arr) {
	var i, j, a = [];
	for (i = 0; i < arr.length; i++) {
		a.push((arr[i] && arr[i].length) || 0);
	}
	var longest = Math.max.apply(null, a);
	for (i = 0; i < arr.length; i++) {
		arr[i].length = longest;
		for (j = 0; j < arr[i].length; j++) {
			arr[i][j] = arr[i][j] || ' ';
		}
	}
}

function hasNL(str) {
	return str.indexOf('\n') > -1;
}

function pad(str, length, c) {
	return str.length >= length ? str : pad(str + c, length, c);
}

function getCols(table) {
	// convert [row1, row2, row3] to [col1, col2, col3]
	return table[0].map(function(box,i){
		return table.map(function(row){
			return row[i];
		});
	})
}
module.exports.getCols = getCols;

function getLengths(table) {
	// return the length of each column
	table = getCols(table);
	return table.map(function(col){
		return Math.max.apply(null, col.map(function(box){
			if (box == undefined) {box = ''}
			return box.toString().length;
		}));
	});
}
module.exports.getLengths = getLengths;