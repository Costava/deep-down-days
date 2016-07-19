import SparkMD5 from 'spark-md5';

/**
 * Returns arbitrary length hash string
 * A seed is hashed for the first hash
 * The hash is continually rehashed as needed to continue supplying hash strings
 * The same seed always gives the same results
 * @param {string} [seed=""] - initial string to hash
 */
function HashStream(seed) {
	if (typeof seed === 'string') {
		this.seed = seed;
	}
	else {
		this.seed = "";
	}

	this.currentHash = SparkMD5.hash(this.seed);
	this.currentHashLeft = this.currentHash;

	// The total number of hashes/rehashes done
	// Initial hash of seed is included in the count
	this.numHashes = 1;
}

HashStream.HASH_LENGTH = 32;

/**
 * Reset to same as just instantiated
 */
HashStream.prototype.reset = function() {
	this.currentHash = SparkMD5.hash(this.seed);
	this.currentHashLeft = this.currentHash;

 	this.numHashes = 1;
};

/**
 * Rehash current hash to get new current hash
 */
HashStream.prototype.rehash = function() {
	this.currentHash = SparkMD5.hash(this.currentHash);
	this.currentHashLeft = this.currentHash;

	this.numHashes += 1;
};

/**
 * Returns a hash string of {number} length
 * @param {number} length
 * - "Non-NumberLength" thrown if not typeof number
 * - "NegativeLength" thrown if non-negative/outside of [0, infinity)
 */
HashStream.prototype.getHash = function(length) {
	if (typeof length !== 'number') {
		throw "Non-NumberLength";
	}
	else if (length < 0) {
		throw "NegativeLength";
	}
	else if (length === 0) {
		return "";
	}

	var hash;

	if (this.currentHashLeft.length >= length) {
		hash = this.currentHashLeft.substr(0, length);

		this.currentHashLeft = this.currentHashLeft.substr(length, this.currentHashLeft.length);
	}
	else {
		hash = this.currentHashLeft;

		// Will be positive since inside we are inside 'else'
		var numStillNeeded = length - hash.length;

		var fullHashesNeeded = Math.floor(numStillNeeded / HashStream.HASH_LENGTH);

		if (fullHashesNeeded > 0) {
			for (var i = 0; i < fullHashesNeeded; i++) {// fullHashForLoop
				this.rehash();

				hash += this.currentHash;
			}

			numStillNeeded -= fullHashesNeeded * HashStream.HASH_LENGTH;

			if (numStillNeeded > 0) {
				this.rehash();

				hash += this.currentHashLeft.substr(0, numStillNeeded);

				this.currentHashLeft = this.currentHashLeft.substr(numStillNeeded, this.currentHashLeft.length);
			}
			else {
				// Is here instead of putting this
				//  at the end of every fullHashForLoop iteration
				//  or
				//  after the for loop
				this.currentHashLeft = "";
			}
		}
		else {
			this.rehash();

			hash += this.currentHashLeft.substr(0, numStillNeeded);

			this.currentHashLeft = this.currentHashLeft.substr(numStillNeeded, this.currentHashLeft.length);
		}
	}

	return hash;
};

export default HashStream

////////// Usage:
/* * /
var hf = new HashStream("this is my seed");
console.log("Some hash strings of arbitrary length:");
console.log("-  4: " + hf.getHash(4));//  "9b49"
console.log("- 11: " + hf.getHash(11));// "0c84b084af1"
console.log("- 40: " + hf.getHash(40));// "d153ebfa73d4ce9e349e303aed2d7274cb0f9f81"
console.log("-  0: " + hf.getHash(0));//  ""

// You can verify that the above are expected by comparing what hashes
//  these values are taken from
hf.reset();// as if it was just instantiated
console.log("The 'source' hashes:");
console.log("- 1: " + hf.currentHash);// "9b490c84b084af1d153ebfa73d4ce9e3"
hf.rehash();
console.log("- 2: " + hf.currentHash);// "49e303aed2d7274cb0f9f8129063564a"

// These calls have errors
console.log("Some errors:");
try {
	hf.getHash(true);
}
catch(e) {
	console.log(e);// Non-NumberLength
}

try {
	hf.getHash(-5);
}
catch(e) {
	console.log(e);// NegativeLength
}
/* */
