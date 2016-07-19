import maxChildSize from './MaxChildSize.js';

function App() {
	this.resizeTasks = [];
}

App.prototype.resizeComponents = function() {
	var maxSize = maxChildSize(
		this.aspectWidth,
		this.aspectHeight,
		this.appSpace.offsetWidth,
		this.appSpace.offsetHeight
	);

	var cssWidth = `${maxSize.width}px`;
	var cssHeight = `${maxSize.height}px`;

	this.appContainer.style.width = cssWidth;
	this.appContainer.style.height = cssHeight;

	this.appCanvas.style.width = cssWidth;
	this.appCanvas.style.height = cssHeight;

	this.appCanvas.width = maxSize.width;
	this.appCanvas.height = maxSize.height;
};

/**
 * Execute all resize tasks sequentially in series
 */
App.prototype.handleResize = function() {
	var length = this.resizeTasks.length;

	for (var i = 0; i < length; i++) {
		this.resizeTasks[i]();
	}
};

App.prototype.bindHandleResize = function(target) {
	this.bindHandleResizeTarget = target;

	this.handleResizeBound = this.handleResize.bind(this);

	this.bindHandleResizeTarget.addEventListener('resize', this.handleResizeBound);
};

App.prototype.unbindHandleResize = function() {
	this.bindHandleResizeTarget.removeEventListener('resize', this.handleResizeBound);
};

export default App
