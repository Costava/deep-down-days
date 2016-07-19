import Timestepper from './Timestepper';

function Loop(work) {
	this.work = work;

	this.looping = false;
	this.stopped = true;

	this.stopCallback = function() {};

	this.timestepper = new Timestepper(work);

	this.loopCallBound = this.loopCall.bind(this);
}

Loop.prototype.loopCall = function() {
	this.newTime = new Date().getTime();
	this.dt = this.newTime - this.oldTime;

	this.timestepper.go(this.dt);

	this.oldTime = this.newTime;

	if (this.looping) {
		window.requestAnimationFrame(this.loopCallBound);
	}
	else {
		this.stopped = true;

		this.stopCallback();
	}
};

Loop.prototype.start = function() {
	this.oldTime = new Date().getTime();

	this.looping = true;
	this.stopped = false;

	this.loopCallBound();
};

Loop.prototype.stop = function() {
	this.looping = false;
};

export default Loop
