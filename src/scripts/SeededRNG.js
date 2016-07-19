import HashStream from './HashStream';
import maxValue from './MaxValue';

/**
 * Seeded Random Number Generator
 * @param {string} seed
 * @param {number} [resolution=1e-9]
 * - if set, must be a number greater than 0
 * - this.nominalResolution is set to resolution
 * - this.random() returns a multiple of this.actualResolution in range [0, 1]
 *   this.actualResolution will be made to be less than this.nominalResolution
 *   this.actualResolution is found by 1 / the max value of hash string pulled
 *   from the hash stream
 */
function SeededRNG(seed, resolution) {
	this.hashStream = new HashStream(seed);

	if (resolution === undefined) {
		this.setResolution(SeededRNG.DEFAULT_NOMINAL_RESOLUTION);
	}
	else {
		this.setResolution(resolution);
	}
}

SeededRNG.DEFAULT_NOMINAL_RESOLUTION = 1e-9;

SeededRNG.prototype.reset = function() {
	this.hashStream.reset();
};

SeededRNG.prototype.setResolution = function(resolution) {
	if (typeof resolution !== 'number') {
		throw "Non-NumberResolution";
	}
	else if (resolution <= 0) {
		throw "NonpositiveResolution"
	}

	this.nominalResolution = resolution;

	var pullLength = 1;

	while (1 / maxValue(pullLength, 16) > this.nominalResolution) {
		pullLength += 1;
	}

	this.pullLength = pullLength;
	this.pullMaxValue = maxValue(this.pullLength, 16);
	this.actualResolution = 1 / maxValue(this.pullLength, 16);
};

/**
 * Returns a random number [0, 1]
 */
SeededRNG.prototype.random = function() {
	var hash = this.hashStream.getHash(this.pullLength);
	var val = parseInt(hash, 16);

	return val / this.pullMaxValue;
};

/**
 * Returns a random integer in range [min, max]
 */
SeededRNG.prototype.randomInt = function(min, max) {
	var range = max - min;

	return Math.round(this.random() * range) + min;
};

/**
 * Returns a random number in range [min, max]
 */
SeededRNG.prototype.randomInRange = function(min, max) {
	// console.log("inside srng.rIR this:", this);
	var range = max - min;

	return this.random() * range + min;
};

export default SeededRNG
