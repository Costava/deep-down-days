import SRNG from './SeededRNG';
import Color from './Color';

function Tile() {
	this.colors = [];// 6 Color objects
	this.dims = [];// 4 values in range [0, 1]

	// whether to draw side rect on top
	this.aSideDominant = true;
	this.bSideDominant = true;

	this.rects = [];
}

Tile.COLORS_LENGTH = 6;
Tile.DIMS_LENGTH = 4;

Tile.random = function(srng) {
	var tile = new Tile();

	// Randomize traits
	for (var i = 0; i < Tile.COLORS_LENGTH; i++) {
		var color = Color.random(srng.randomInt.bind(srng), 1);

		tile.colors.push(color);
	}

	for (var i = 0; i < Tile.DIMS_LENGTH; i++) {
		tile.dims.push(srng.random());
	}

	tile.aSideDominant = srng.random() < 0.5;
	tile.bSideDominant = srng.random() < 0.5;

	tile.generateRects();

	return tile;
};

Tile.prototype.generateRects = function() {
	this.rects = [];

	// whole background
	this.rects.push({
		x: 0,
		y: 0,
		width: 1,
		height: 1,
		color: this.colors[0]
	});
	// top left quadrant
	this.rects.push({
		x: 0,
		y: 0,
		width: 0.5,
		height: 0.5,
		color: this.colors[1]
	});
	// bottom right quadrant
	this.rects.push({
		x: 0.5,
		y: 0.5,
		width: 0.5,
		height: 0.5,
		color: this.colors[1]
	});

	// Put "decoration" rects on top left and bottom right quadrants
	[0, 0.5].forEach(function(value) {
		var aSideRect = {
			x: value,
			y: value,
			width: this.dims[0] * 0.5,
			height: 0.5,
			color: this.colors[2]
		};
		var aTopRect = {
			x: value,
			y: value,
			width: 0.5,
			height: this.dims[1] * 0.5,
			color: this.colors[3]
		};
		if (this.aSideDominant) {
			this.rects.push(aTopRect);
			this.rects.push(aSideRect);
			// push aSideRect after so that it is drawn later and on top
		}
		else {
			this.rects.push(aSideRect);
			this.rects.push(aTopRect);
		}
	}.bind(this));

	// Put "decoration" rects on bottom left and top right quadrants
	[0, 0.5].forEach(function(value) {
		var bSideRect = {
			x: value,
			y: 0.5 - value,
			width: this.dims[2] * 0.5,
			height: 0.5,
			color: this.colors[4]
		};
		var bTopRect = {
			x: value,
			y: 0.5 - value,
			width: 0.5,
			height: this.dims[3] * 0.5,
			color: this.colors[5]
		};
		if (this.bSideDominant) {
			this.rects.push(bTopRect);
			this.rects.push(bSideRect);
			// push aSideRect after so that it is drawn later and on top
		}
		else {
			this.rects.push(bSideRect);
			this.rects.push(bTopRect);
		}
	}.bind(this));
};

/**
 * Render tile with sidelength 1 on canvas
 */
Tile.prototype.render = function(ctx) {
	this.rects.forEach(function(rect) {
		ctx.save();

		ctx.translate(rect.x, rect.y);
		ctx.beginPath();
		ctx.rect(0, 0, rect.width, rect.height);
		ctx.fillStyle = rect.color.toString();
		ctx.fill();
		ctx.closePath();

		ctx.restore();
	});
};

export default Tile
