/**
 * @param {HTML element} target
 * @param {event type} eventType
 * @param {function} work - what to do when hear event
 * @param {object} [thisObject] - the `this` context for `work`
 */
function ListenerSystem(target, eventType, work, thisObject) {
	this.target = target;
	this.eventType = eventType;
	this.work = work;

	this.active = false;

	if (thisObject == undefined) {
		this.newBind = false;
	}
	else {
		this.thisObject = thisObject;
		this.newBind = true;
	}

	if (this.newBind) {
		this.workBound = work.bind(this.thisObject);
	}
}

ListenerSystem.prototype.start = function() {
	if (this.active) {
		throw {
			name: "State error",
			message: "Not going to start listener system--already active"
		};
	}
	else {
		if (this.newBind) {
			this.target.addEventListener(this.eventType, this.workBound);
		}
		else {
			this.target.addEventListener(this.eventType, this.work);
		}

		this.active = true;
	}
};

ListenerSystem.prototype.stop = function() {
	if (!this.active) {
		throw {
			name: "State error",
			message: "Not going to stop listener system--already inactive"
		};
	}
	else {
		if (this.newBind) {
			this.target.removeEventListener(this.eventType, this.workBound);
		}
		else {
			this.target.removeEventListener(this.eventType, this.work);
		}

		this.active = false;
	}
};

export default ListenerSystem
