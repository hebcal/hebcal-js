var argv = process.argv.slice(2), warnings = [], a, parts;

exports.parse = function(shortargs, longargs) {
	for (var i = 0; i < argv.length; i++) {
		a = argv[i];
		if (a[1] == '-') {
			parts = a.slice(2).split('=');
			if (!parts[1] && argv[i + 1] && argv[i + 1][0] != '-') {
				parts[1] = argv[++i];
			}
			if (longargs[parts[0]]) {
				longargs[parts[0]](parts[1]);
			} else {
				warnings.push('Unknown argument: ' + a);
			}
		} else {
			if (a.length == 2) {
				parts = a.slice(1).split('=');
				if (!parts[1] && argv[i + 1] && argv[i + 1][0] != '-') {
					parts[1] = argv[++i];
				}
				if (shortargs[parts[0]]) {
					shortargs[parts[0]](parts[1]);
				} else {
					warnings.push('Unknown argument: ' + a);
				}
			} else {
				a.slice(1).split('').forEach(function(p){
					if (shortargs[p]) {
						shortargs[p]();
					} else {
						warnings.push('Unknown argument: -' + p);
					}
				});
			}
		}
	}
};

exports.warn = function(){
	if (!warnings.length) {return}
	warnings.forEach(function(w){console.warn(w)});
};