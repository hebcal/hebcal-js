var argv = process.argv.slice(2), warnings = [];

exports.parse = function(shortargs, longargs) {
	argv.forEach(function(a){
		var parts;
		if (a[1] == '-') {
			parts = a.slice(2).split('=');
			if (longargs[parts[0]]) {
				longargs[parts[0]](parts[1]);
			} else {
				warnings.push('Unknown argument: ' + a);
			}
		} else {
			parts = a.slice(1).split('=');
			if (parts[1]) {
				if (shortargs[parts[0]]) {
					shortargs[parts[0]](parts[1]);
				} else {
					warnings.push('Unknown argument: ' + a);
				}
			} else {
				parts[0].split('').forEach(function(p){
					if (shortargs[p]) {
						shortargs[p]();
					} else {
						warnings.push('Unknown argument: -' + p);
					}
				});
			}
		}
	});
};

exports.warn = function(){
	if (!warnings.length) {return}
	warnings.forEach(function(w){console.warn(w)});
};