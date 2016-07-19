function Timestepper(work) {
	this.work = work;

	// Time between executing work
	this.interval = Timestepper.DEF_INTERVAL;

	// Max number of times work can be done in one evaluation (from time piling up)
	// Prevents spiral of death (when trying to catch up continually puts it behind)
	this.maxIntervals = Timestepper.DEF_MAX_INTERVALS;

	this.time = 0;// Milliseconds
	this.totalTime = 0;// Milliseconds
}

Timestepper.DEF_INTERVAL = 20;// Milliseconds
Timestepper.DEF_MAX_INTERVALS = 10;

/**
 * @param {number} dt - Milliseconds.
 */
Timestepper.prototype.accumulate = function(dt) {
	this.time += dt;
	this.totalTime += dt;
};


Timestepper.prototype.try = function() {
	var numIntervals = 0;
	while (this.time >= this.interval && numIntervals < this.maxIntervals) {
		this.time -= this.interval;

		numIntervals += 1;

		this.work();
	}
};

/**
 * @param {number} dt - Milliseconds.
 */
Timestepper.prototype.go = function(dt) {
	this.accumulate(dt);

	this.try();
};

Timestepper.prototype.reset = function() {
	this.time = 0;
	this.totalTime = 0;
};

export default Timestepper
