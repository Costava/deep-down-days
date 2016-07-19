function Patrol(x, y, radius, a, b, speed) {
	this.pos = {x: x, y: y};

	this.radius = radius;
	this.a = a;
	this.b = b;
	this.speed = speed;

	this.done = {x: false, y: false};

	this.target = b;
}

Patrol.prototype.move = function() {
	var diff = {x: this.target.x - this.pos.x, y: this.target.y - this.pos.y};
	var absDiff = {x: Math.abs(diff.x), y: Math.abs(diff.y)};

	['x', 'y'].forEach(function(c) {
		if (absDiff[c] < this.speed) {
			this.pos[c] = this.target[c];
			this.done[c] = true;
		}
		else {
			this.pos[c] += this.speed * diff[c] / absDiff[c];
		}
	}.bind(this));

	if (this.done.x && this.done.y) {
		this.target = (this.target === this.a) ? this.b : this.a;

		this.done.x = false;
		this.done.y = false;
	}
};

Patrol.render = function(ctx, radius) {
	ctx.save();

	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);

	ctx.globalCompositeOperation = 'difference';
	ctx.fillStyle = '#fff';
	ctx.fill();

	ctx.closePath();
	ctx.restore();
};

Patrol.prototype.render = function(ctx) {
	Patrol.render(ctx, this.radius);
};

Patrol.prototype.draw = function(ctx){
	ctx.save();

	ctx.translate(this.pos.x, this.pos.y);
	this.render(ctx);

	ctx.restore();
};

export default Patrol
