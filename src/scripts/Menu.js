/**
 * @param {string} name
 * @param {HTML element} element
 * @param {number} showZ - z-index of menu when shown
 * @param {number} hideZ - z-index of menu when hidden
 * @param {array} [listenerSystems = []]
 * @param {function} [showWork = function(){}]
 * @param {function} [hideWork = function(){}]
 */
function Menu(name, element, showZ, hideZ, listenerSystems, showWork, hideWork) {
	this.name = name;
	this.element = element;
	this.showZ = showZ;
	this.hideZ = hideZ;
	this.listenerSystems = listenerSystems || [];
	this.listenerSystemsActive = false;
	this.showWork = showWork || function(){};
	this.hideWork = hideWork || function(){};
}

Menu.prototype.show = function() {
	this.element.style['z-index'] = this.showZ;
	this.element.style.visibility = 'visible';

	this.startListenerSystems();

	this.showWork();
};

Menu.prototype.hide = function() {
	this.element.style['z-index'] = this.hideZ;
	this.element.style.visibility = 'hidden';

	this.stopListenerSystems();

	this.hideWork();
};

Menu.prototype.startListenerSystems = function() {
	if (this.listenerSystemsActive) {
		throw {
			name: "State error",
			message: "Not going to start listener systems--already active"
		};
	}
	else {
		this.listenerSystems.forEach(function(ls) {
			ls.start();
		});

		this.listenerSystemsActive = true;
	}
};

Menu.prototype.stopListenerSystems = function() {
	if (!this.listenerSystemsActive) {
		throw {
			name: "State error",
			message: "Not going to stop listener systems--already inactive"
		};
	}
	else {
		this.listenerSystems.forEach(function(ls) {
			ls.stop();
		});

		this.listenerSystemsActive = false;
	}
};

export default Menu
