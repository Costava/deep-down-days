import Color from './Color.js';

/*
 * @param {number} [x = 0]
 * @param {number} [y = 0]
 * @param {number} [sideLength = 0.5]
 * @param {number} [rotation = 0] - in radians
 * - position of center of player
 */
function Player(x, y, sideLength, rot) {
	this.pos = {};
	this.pos.x = x || 0;
	this.pos.y = y || 0;

	this.vel = {};
	this.vel.x = 0;
	this.vel.y = 0;

	this.setSideLength(sideLength || 0.5);

	// Clockwise from positive x axis
	this.rotation = rot || 0;

	this.setColor(new Color(255, 255, 255, 1));
}

Player.prototype.getRadius = function(rad) {
	return this.halfSideLength / Math.max(Math.abs(Math.sin(rad)), Math.abs(Math.cos(rad)));
};

Player.prototype.setSideLength = function(sl) {
	this.sideLength = sl;
	this.halfSideLength = sl / 2;
};

Player.prototype.setColor = function(c) {
	this.color = c;
	this.fillStyle = c.toString();
};

/*
 * Render player with center at (0, 0)
 * @param {fillStyle for canvas context} color
 */
Player.render = function(ctx, sideLength, fillStyle, rotation) {
	ctx.save();

	ctx.rotate(rotation);
	ctx.fillStyle = fillStyle;
	ctx.fillRect(0, 0, sideLength, sideLength);

	ctx.restore();
};

Player.prototype.render = function(ctx) {
	Player.render(ctx, this.sideLength, this.fillStyle, this.rotation);
};

Player.prototype.draw = function(ctx) {
	ctx.save();

	ctx.translate(this.pos.x - this.halfSideLength, this.pos.y - this.halfSideLength);

	this.render(ctx);

	ctx.restore();
};

export default Player
