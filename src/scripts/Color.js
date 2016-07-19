function Color(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

/**
 * Returns a random color object
 * @param {function} randomIntF
 * - should return an integer [min, max] from args (min , max)
 * @param {number} [alpha=1] - alpha value of color
 */
Color.random = function(randomIntF, alpha) {
	var r = randomIntF(0, 255);
	var g = randomIntF(0, 255);
	var b = randomIntF(0, 255);

	var a;
	if (typeof alpha == 'number') {
		a = alpha;
	}
	else {
		a = 1;
	}

	return new Color(r, g, b, a);
}

/**
 * @param {boolean} [excludeA=false]
 */
Color.prototype.toString = function(excludeA) {
	if (excludeA === true) {
		return `rgb(${this.r}, ${this.g}, ${this.b})`;
	}

	return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
};

/**
 * @param {boolean} [invertA=false]
 */
Color.prototype.inverse = function(invertA) {
	if (invertA === true) {
		return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1 - this.a);
	}

	return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
};

Color.prototype.clamp = function() {
	var clone = this.clone();

	['r', 'g', 'b'].forEach(function(component) {
		clone[component] = Math.max(Math.min(clone[component], 255), 0);
	});

	this.a = Math.max(Math.min(this.a, 1), 0);

	return clone;
};

/**
 * Returns a new color with each component equal to f(component)
 * @param {function} f - e.g. Math.floor, Math.round
 * @param {boolean} [includeA=false] - whether to operate on alpha
 * @returns {object} A new color
 */
Color.prototype.operate = function(f, includeA) {
	var clone = this.clone();

	['r', 'g', 'b'].forEach(function(component) {
		clone[component] = f(clone[component]);
	});

	if (includeA === true) {
		clone.a = f(clone.a);
	}

	return clone;
};

Color.prototype.clone = function() {
	return new Color(this.r, this.g, this.b, this.a);
};

export default Color
