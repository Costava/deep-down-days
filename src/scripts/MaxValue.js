/**
 * Returns the max value of a number in `base` having `numDigits`
 * e.g. the max value of a 3 digit number in base 2 is 7
 * @param {number} numDigits - should be >= 1
 * @param {number} base - should be >= 2
 * @returns {number}
 */
export default function(numDigits, base) {
	return Math.pow(base, numDigits) - 1;
}
