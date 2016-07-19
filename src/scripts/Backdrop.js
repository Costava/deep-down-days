import Tile from './Tile';

function Backdrop() {
	// this.numPanels;
	this.panelColors = [];

	// this.panelWidth;
	// this.panelHeight;

	// this.numTileRows;
	// this.tileLength;

	// this.tile;
}

/**
 * Render a panel group having height 1
 * @param {canvas 2D context} ctx
 * @param {object} o
 * - {number} .numPanels
 * - {array of Color objects} .panelColors
 * - {number} .panelWidth
 * - {number} .panelHeight
 */
Backdrop.renderPanelGroup = function(ctx, o) {
	ctx.save();

	var width = o.panelWidth / o.panelHeight;

	for (var i = 0; i < o.numPanels; i++) {
		var colorIndex = i % o.panelColors.length;
		ctx.fillStyle = o.panelColors[colorIndex].toString();
		ctx.fillRect(i * width, 0, width, 1);
	}

	ctx.restore();
};

Backdrop.prototype.renderPanelGroup = function(ctx) {
	Backdrop.renderPanelGroup(ctx, this);
};

/**
 * Render a column of tiles having total height 1
 */
Backdrop.renderTileColumn = function(ctx, o) {
	ctx.save();

	var scaleFactor = 1 / o.numTileRows;

	ctx.scale(scaleFactor, scaleFactor);

	for (var r = 0; r < o.numTileRows; r++) {
		o.tile.render(ctx);

		ctx.translate(0, 1);
	}

	ctx.restore();
};

Backdrop.prototype.renderTileColumn = function(ctx) {
	Backdrop.renderTileColumn(ctx, this);
};

export default Backdrop
