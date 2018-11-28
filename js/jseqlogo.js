function sequence_logo(element, width, height, columns, options) {
	// set canvas size
	element.width = width;
	element.height = height;

	// Get setttings from options or default values.
	var defaults = {
		"colors": {"A": "green", "C": "blue", "G": "orange", "T": "red", "U": "red"},
		"ylabel": "bits",
		"textcolor": "black",
		"bgcolor": "white",
		"border": 28,
		"padding": 6,
		"labelfont": "14px Arial,sans-serif",
		"letterfont": "30px Arial,sans-serif",
		"fontpixelheight": 24,
		"ymax": 0,
		"sort": true
	};

	var settings = {};
	for(var p in defaults) {
		settings[p] = (options[p] == null) ? defaults[p] : options[p];
	}

	// collect stats on columns
	var ymax = settings.ymax;
	for (var col = 0; col < columns.length; col++) {
		var totalweight = 0.0;
		var column = columns[col];
		for(var i = 0; i < column.length; ++i) {
			totalweight += column[i][1];
		}
		if (totalweight > ymax) ymax = totalweight;
	}
	var ctx = element.getContext("2d");
	ctx.save();

	// draw the background
	ctx.fillStyle = settings.bgcolor;
	ctx.fillRect(0, 0, width, height);

	// draw the letters
	var columnx = settings.border;
	var columndelta = (width - settings.border) / columns.length;
	var yheight = height - settings.border;
	ctx.font = settings.letterfont;

	for (var col = 0; col < columns.length; col++) {
		var totalweight = 0.0;
		var column = columns[col].slice();
		if(settings.sort) {
			column.sort(function(a, b) { return a[1] - b[1]; });
		}
		var lettery = yheight;
		for (var i = 0; i < column.length; i++) {
			var letter = column[i][0];
			var weight = column[i][1];
			totalweight += weight;
			ctx.save();
			ctx.fillStyle = settings.colors[letter];
			ctx.translate(columnx, lettery);
			var scaley = (yheight * weight) / (settings.fontpixelheight * ymax);
			var mt = ctx.measureText(letter);
			var letterwidth = mt.width;
			var scalex = columndelta / letterwidth;
			ctx.scale(scalex, scaley);
			ctx.fillText(letter, 0, 0);
			ctx.restore();
			lettery -= (weight * yheight) / ymax;
		}
		ctx.save();
		ctx.fillStyle = settings.textcolor;
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.font = settings.labelfont;
		ctx.fillText((col + 1).toString(), columnx + columndelta/2, height-settings.border+settings.padding);
		ctx.restore();
		columnx += columndelta;
	}
	
	// axis lines
	ctx.beginPath();
	ctx.moveTo((settings.border-(settings.padding*(2/3))), height-(settings.border-(settings.padding*(2/3))));
	ctx.lineTo(width, height-(settings.border-(settings.padding*(2/3))));
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo((settings.border-(settings.padding*(2/3)))+1, height-(settings.border-(settings.padding*(2/3))));
	ctx.lineTo((settings.border-(settings.padding*(2/3)))+1, 0);
	ctx.stroke();

	// y-axis labels
	ctx.fillStyle = settings.textcolor;
	ctx.font = settings.labelfont;
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.fillText(ymax.toPrecision(1), settings.border-settings.padding, 0);
	ctx.textBaseline = "bottom";
	ctx.fillText("0", settings.border-settings.padding, height-settings.border);
	ctx.translate(settings.border-settings.padding, (height-settings.border)/2);
	ctx.rotate(-Math.PI/2);
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	ctx.fillText(settings.ylabel, 0, 0);

	ctx.restore();
	return element;
}

function PWM2jseqcol(PWM) {
	// Convert an array of position weight matrix
	// to the column format used in jseqlogo, validates 
	// that nucleotide array are same length
	//
	// PWM format: 
	//		{ A: [0.5, 0.2, 0, 0], C: [0.5, 0.1, 0.8, 0], T: [0, 0.7, 0.2, 0.3], G: [0, 0, 0, 0.7] };
	//
	// jseqlogo format:
	//		[ 
	//			[["A", 1.0], ["C", 1.0],  ["G", 0], ["T", 0]],
  //      [["A", 0.4], ["C", 0.2], ["G", 0],  ["T", 1.4]],
  //      [["A", 0], ["C", 1.6],  ["G", 0],  ["T", 0.4]],
  //      [["A", 0], ["C", 0],  ["G", 1.4],  ["T", 0.6]],
	//		];
	var jseqcol = [];
	if(PWM["A"].length == PWM["C"].length && PWM["C"].length == PWM["G"].length && PWM["G"].length == PWM["T"].length) {
		for(i=0;i < PWM["A"].length; i++) {
			var templist = [["A", (PWM["A"][i])*2], ["C", (PWM["C"][i]*2)], ["G", (PWM["G"][i]*2)], ["T", (PWM["T"][i]*2)]];
			jseqcol.push(templist);
		}
			return jseqcol;
	} else {
		return null;
	}
}