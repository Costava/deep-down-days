/**
 * @param {object} o
 * - @property {array} urls - array of string paths to audio file
 * - @property {number} [volume=0.5] - value in [0, 1]
 * - @property {function} [onload=function() {}] - load callback
 * - @property {function} [onloaderror=function() {}] - load error callback
 * - @property {number} [fadeInDuration=500] - milliseconds
 * - @property {number} [fadeOutDuration=600] - milliseconds
 * - @property {function} [fadeInCallback=function() {}]
 * - @property {function} [fadeOutCallback=function() {}]
 */
function AudioLooper(o) {
	this.urls = o.urls;

	//////////

	if (typeof o.volume === 'number' && o.volume >= 0 && o.volume <= 1) {
		this.volume = o.volume;
	}
	else {
		this.volume = 0.5;
	}

	//////////

	if (typeof o.onload === 'function') {
		this.onload = o.onload;
	}
	else {
		this.onload = function() {};
	}

	//////////

	if (typeof o.onloaderror === 'function') {
		this.onloaderror = o.onloaderror;
	}
	else {
		this.onloaderror = function() {};
	}

	//////////

	if (typeof o.fadeInDuration === 'number' && o.fadeInDuration >= 0) {
		this.fadeInDuration = o.fadeInDuration;
	}
	else {
		this.fadeInDuration = 500;
	}

	//////////

	if (typeof o.fadeOutDuration === 'number' && o.fadeOutDuration >= 0) {
		this.fadeOutDuration = o.fadeOutDuration;
	}
	else {
		this.fadeOutDuration = 600;
	}

	//////////

	if (typeof o.fadeInCallback === 'function') {
		this.fadeInCallback = o.fadeInCallback;
	}
	else {
		this.fadeInCallback = function() {};
	}

	//////////

	if (typeof o.fadeOutCallback === 'function') {
		this.fadeOutCallback = o.fadeOutCallback;
	}
	else {
		this.fadeOutCallback = function() {};
	}

	//////////

	this.howl = new Howl({
		src: this.urls,
		autoplay: false,
		loop: true,
		volume: this.volume,
		onload: this.onload,
		onloaderror: this.onloaderror
	});

	this.playing = false;
	this.fading = false;
}

AudioLooper.prototype.play = function() {
	if (!this.playing && !this.fading) {
		this.playing = true;

		this.howl.play();
	}
	else {
		console.log("AudioLooper will not play--already playing and/or fading");
	}
};

AudioLooper.prototype.pause = function() {
	if (this.playing && !this.fading) {
		this.playing = false;

		this.howl.pause();
	}
	else {
		console.log("AudioLooper will not pause--either not playing or is fading");
	}
};

AudioLooper.prototype.stop = function() {
	this.playing = false;
	this.fading = false;

	this.howl.stop();
};

AudioLooper.prototype.fadeIn = function() {
	if (!this.playing) {
		this.howl.volume(0);
		this.howl.play();

		this.howl.off('fade');

		this.howl.on('fade', function() {
			this.fading = false;

			this.fadeInCallback();
		}.bind(this));

		this.howl.fade(
			0,
			this.volume,
			this.fadeInDuration
		);

		this.playing = true;
		this.fading = true;
	}
	else {
		console.log("AudioLooper will not fade in--already playing");
	}
};

AudioLooper.prototype.fadeOut = function() {
	if (this.playing) {
		this.howl.off('fade');

		this.howl.on('fade', function() {
			this.howl.pause();

			this.playing = false;
			this.fading = false;

			this.fadeOutCallback();
		}.bind(this));

		this.howl.fade(
			this.howl.volume(),
			0.1,
			this.fadeOutDuration
		);

		this.fading = true;
	}
	else {
		console.log("AudioLooper will not fade out--not playing");
	}
};

export default AudioLooper
