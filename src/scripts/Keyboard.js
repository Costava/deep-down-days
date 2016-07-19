/**
 * Track the state of keys (down/up)
 *
 * Do not change the target when `listening` is true
 * @param {DOM element} target - element to listen to for key events
 */
function Keyboard(target) {
	this.target = target;
	this.keydown = {};

	this.listening = false;

	this.keydownEvent = this.handleKeydown.bind(this);
	this.keyupEvent = this.handleKeyup.bind(this);
}

Keyboard.prototype.clear = function() {
	this.keydown = {};
};

Keyboard.getKeyIdentifier = function(e) {
	return e.keyCode;
};

Keyboard.prototype.handleKeydown = function(e) {
	var key = Keyboard.getKeyIdentifier(e);

	this.keydown[key] = true;
};

Keyboard.prototype.handleKeyup = function(e) {
	var key = Keyboard.getKeyIdentifier(e);

	this.keydown[key] = false;
};

Keyboard.prototype.startListen = function() {
	this.listening = true;

	this.target.addEventListener('keydown', this.keydownEvent);
	this.target.addEventListener('keyup', this.keyupEvent);
};

Keyboard.prototype.stopListen = function() {
	this.target.removeEventListener('keydown', this.keydownEvent);
	this.target.removeEventListener('keyup', this.keyupEvent);

	this.listening = false;
};

export default Keyboard
