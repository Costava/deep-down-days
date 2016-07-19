console.log('main');

//////////

import App from './App';
import Game from './Game';
import Keyboard from './Keyboard';
import DefaultKeys from './DefaultKeys';
import Color from './Color';
import Menu from './Menu';
import ListenerSystem from './ListenerSystem';
import AudioLooper from './AudioLooper';
import Loop from './Loop';
import SRNG from './SeededRNG';

//////////

var app = new App();

app.volume = 0.5;

app.c = document.querySelector('.js-app-canvas');
app.ctx = app.c.getContext('2d');

app.appSpace = document.querySelector('.js-app-space');
app.appContainer = document.querySelector('.js-app-container');
app.appCanvas = document.querySelector('.js-app-canvas');

app.game = new Game(app.c, app.ctx);

app.game.dieLoop.stopCallback = function() {
	// Update stats
	document.querySelector('.js-level').innerHTML = app.game.level;
	document.querySelector('.js-kills').innerHTML = app.game.kills;

	var speedStat = app.game.speed.toFixed(2);
	if (speedStat == 0) {
		speedStat = 0;// So that it says 0 instead of 0.00
	}
	document.querySelector('.js-speed').innerHTML = speedStat;

	document.querySelector('.js-highest-streak').innerHTML = app.game.highestStreak;

	// Save canvas to image
	// `createImageBitmap` returns a promise
	createImageBitmap(app.game.c).then(function(image) {
		app.game.finalFrame = image;

		app.menus.end.show();
	});
};

app.game.isDyingCallback = function() {
	app.audioLoopers.silverAndGold.fadeOut();
};

app.aspectWidth = 5;
app.aspectHeight = 2;
app.game.aspectWidth = app.aspectWidth;
app.game.aspectHeight = app.aspectHeight;

app.kb = new Keyboard(window);
app.game.kb = app.kb;

app.keys = DefaultKeys
app.game.keys = app.keys;

app.resizeTasks.push(app.resizeComponents.bind(app));
app.resizeTasks.push(app.game.handleResize.bind(app.game));
app.bindHandleResize(window);
app.resizeComponents();// Initial call
app.game.handleResize();// Initial call

//////////

app.audioLoadSuccesses = 0;
app.audioLoadFailures = 0;
app.totalAudioLoopers = 2;

app.audioLoopers = {};

app.audioLoopers.silverAndGold = new AudioLooper({
	urls: [
		'audio/AJ_-_08_-_Silver_and_Gold.ogg',
		'audio/AJ_-_08_-_Silver_and_Gold.m4a'
	],
	onload: function() {
		app.audioLoadSuccesses += 1;
	},
	onloaderror: function() {
		app.audioLoadFailures += 1;
	}
});

app.audioLoopers.bambooShootsAndLadders = new AudioLooper({
	urls: [
		'audio/Daniela_Salvia_-_04_-_Bamboo_Shoots_and_Ladders.ogg',
		'audio/Daniela_Salvia_-_04_-_Bamboo_Shoots_and_Ladders.m4a'
	],
	onload: function() {
		app.audioLoadSuccesses += 1;
	},
	onloaderror: function() {
		app.audioLoadFailures += 1;
	}
});

//////////

app.mainTitle = document.querySelector('.js-main-title');
app.mainTitleNonNightmareText = '<div>Deep Down Days</div>';
app.mainTitleNightmareText =    '<div>Deep Down Days</div><div class="nightmare-subtitle">Nightmare Mode</div>';

app.nightmareSVGPath = document.querySelector('.nightmare').querySelector('path');
app.nonNightmareSVGColor = '#000000';
app.nightmareSVGColor =    '#ff3333';

app.srng = new SRNG(String(new Date().getTime()));

app.globalCompositeOperations = [
	'source-over', 'source-over', 'source-over', 'source-over', 'source-over',
	'lighter', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
	'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
	'exculsion', 'hue', 'saturation', 'color', 'luminosity'
];
app.GCOsLastIndex = app.globalCompositeOperations.length - 1;

app.setNonNightmareTitle = function() {
	app.mainTitle.innerHTML = app.mainTitleNonNightmareText;
};

app.setNightmareTitle = function() {
	app.mainTitle.innerHTML = app.mainTitleNightmareText;
};

app.nightmareIntervalFunction = function() {
	app.ctx.globalCompositeOperation = app.globalCompositeOperations[app.srng.randomInt(0, app.GCOsLastIndex)];
};
app.nightmareIntervalTime = 40;

// app.nightmareInterval

app.setNightmareInterval = function() {
	app.nightmareInterval = window.setInterval(app.nightmareIntervalFunction, app.nightmareIntervalTime);
};
app.clearNightmareInterval = function() {
	if (app.nightmareInterval != undefined) {
		window.clearInterval(app.nightmareInterval);
	}
};

app.turnOnNightmareMode = function() {
	app.setNightmareTitle();
	app.setNightmareInterval();

	app.mainTitle.innerHTML = app.mainTitleNightmareText;

	app.nightmareSVGPath.style.fill = app.nightmareSVGColor;

	app.nightmareMode = true;
	app.game.nightmareMode = true;
};

app.turnOffNightmareMode = function() {
	app.setNonNightmareTitle();
	app.clearNightmareInterval();

	app.mainTitle.innerHTML = app.mainTitleNonNightmareText;

	app.nightmareSVGPath.style.fill = app.nonNightmareSVGColor;

	app.ctx.globalCompositeOperation = 'source-over';

	app.nightmareMode = false;
	app.game.nightmareMode = false;
};

app.toggleNightmareMode = function() {
	if (app.nightmareMode) {
		app.turnOffNightmareMode();
	}
	else {
		app.turnOnNightmareMode();
	}
};

//////////

app.nightmareMode = false;

app.turnOffNightmareMode();
// ^ Initial run
//   Gives correct color to SVG

//////////

app.useLoadingColorA = true;
app.loadingColorA = 'rgb(10, 240, 40)';
app.loadingColorB = 'rgb(10, 40, 240)';
app.loadingTextElement = document.querySelector('.js-loading-text');
app.loadingMenuWork = function() {
	if (this.audioLoadFailures > 0) {
		// Failure

		this.loadingTextElement.innerHTML = "Failed to load audio.";

		app.loadingMenuLoop.stopCallback = function() {
			console.log("Failed to load audio.");
		};

		app.loadingMenuLoop.stop();
	}
	else if (this.audioLoadSuccesses === this.totalAudioLoopers) {
		// Success

		app.loadingMenuLoop.stopCallback = function() {
			app.menus.loading.hide();

			app.menus.main.show();
		};

		app.loadingMenuLoop.stop();
	}
	else {
		// Keep waiting

		if (this.useLoadingColorA) {
			this.loadingTextElement.style.color = this.loadingColorA;
		}
		else {
			this.loadingTextElement.style.color = this.loadingColorB;
		}

		this.useLoadingColorA = !this.useLoadingColorA;
	}
};

app.loadingMenuLoop = new Loop(app.loadingMenuWork.bind(app));

app.mainMenuSpeed = 0.025;
app.tileFactor = 0.5;
app.mainMenuTitle = document.querySelector('.js-main-title');
// app.mainMenuOldTime;
// app.mainMenuNewTime;
// app.mainMenuTime;// In milliseconds
app.mainMenuWork = function() {
	app.mainMenuNewTime = new Date().getTime();
	app.mainMenuTime += app.mainMenuNewTime - app.mainMenuOldTime;
	app.mainMenuOldTime = app.mainMenuNewTime;

	if (app.mainMenuTime > 3600) {
		// Change main menu title's color
		var r = app.game.srng.randomInt(50, 255);
		var g = app.game.srng.randomInt(50, 255);
		var b = app.game.srng.randomInt(50, 255);
		app.mainMenuTitle.style.color = `rgb(${r}, ${g}, ${b})`;

		// New backdrop
		app.game.backdrop = app.game.randomBackdrop(app.game.srng);
		app.game.bakeBackdrop(app.game.backdrop);

		// Reset time
		app.mainMenuTime = 0;
	}

	//////////

	app.panelGroupOffset += app.mainMenuSpeed;
	app.panelGroupOffset %= app.game.panelGroupWidth;

	app.tileOffset += app.mainMenuSpeed * app.tileFactor;
	app.tileOffset %= app.game.backdrop.tileLength;

	// Draw panels
	app.game.ctx.save();
		app.game.ctx.translate(-app.panelGroupOffset * app.game.c.height, 0);

		app.game.ctx.drawImage(
			app.game.panelsC,
			0,
			0,
			app.game.panelsC.width,
			app.game.panelsC.height,
			0,
			0,
			app.game.panelsC.width,
			app.game.panelsC.height
		);

		app.game.ctx.translate(0, app.game.c.height);
		app.game.ctx.scale(1, -1);

		app.game.ctx.drawImage(
			app.game.panelsC,
			0,
			0,
			app.game.panelsC.width,
			app.game.panelsC.height,
			0,
			0,
			app.game.panelsC.width,
			app.game.panelsC.height
		);
	app.game.ctx.restore();

	// Draw tiles
	app.game.ctx.save();
		app.game.ctx.translate(-app.tileOffset * app.game.c.height, 0);

		app.game.ctx.drawImage(
			app.game.tilesC,
			0,
			0,
			app.game.tilesC.width,
			app.game.tilesC.height,
			0,
			app.game.panelsC.height,
			app.game.tilesC.width,
			app.game.tilesC.height
		);
	app.game.ctx.restore();
};

app.mainMenuLoop = new Loop(app.mainMenuWork.bind(app));

//////////

app.menus = {};

app.menus.loading = new Menu(
	'loading',
	document.querySelector('.js-loading-menu'),
	1000, -1000,
	[],// Listener systems
	function() {// Show work
		app.loadingMenuLoop.start();
	},
	function() {// Hide work

	}
);

app.menus.main = new Menu(
	'main',
	document.querySelector('.js-main-menu'),
	1000, -1000,
	[
		new ListenerSystem(
			document.querySelector('.js-main-play'),
			'click',
			function() {
				app.mainMenuLoop.stopCallback = function() {
					app.startInstructions();

					app.audioLoopers.silverAndGold.fadeIn();

					app.game.startGame(String(new Date().getTime()));
				};

				app.menus.main.hide();
			}
		),
		new ListenerSystem(
			document.querySelector('.js-main-about'),
			'click',
			function() {
				app.menus.about.show();
			}
		),
		new ListenerSystem(
			document.querySelector('.js-nightmare-wrapper'),
			'click',
			function() {
				app.toggleNightmareMode();
			}
		),
		new ListenerSystem(
			document.body,
			'keydown',
			function(e) {
				if (Keyboard.getKeyIdentifier(e) == app.keys.LEFT.ID) {
					app.mainMenuLoop.stopCallback = function() {
						app.startInstructions();

						app.audioLoopers.silverAndGold.fadeIn();

						app.game.startGame(String(new Date().getTime()));
					};

					app.menus.main.hide();
				}
				else if (Keyboard.getKeyIdentifier(e) == app.keys.RIGHT.ID) {
					app.menus.about.show();
				}
				else if (Keyboard.getKeyIdentifier(e) == app.keys.DOWN.ID) {
					app.toggleNightmareMode();
				}
			}
		)
	],
	function() {
		app.mainMenuOldTime = new Date().getTime();
		app.mainMenuTime = 0;

		app.game.srng = new SRNG(String(new Date().getTime()));

		app.game.backdrop = app.game.randomBackdrop(app.game.srng);
		app.game.bakeBackdrop(app.game.backdrop);

		app.panelGroupOffset = 0;
		app.tileOffset = 0;

		app.audioLoopers.bambooShootsAndLadders.fadeIn();

		app.mainMenuLoop.start();
	},
	function() {
		app.audioLoopers.bambooShootsAndLadders.fadeOut();

		app.mainMenuLoop.stop();
	}
);

app.menus.about = new Menu(
	'about',
	document.querySelector('.js-about-menu'),
	2000, -1000,
	[
		new ListenerSystem(
			document.querySelector('.js-about-return'),
			'click',
			function() {
				app.menus.about.hide();
			}
		),
		new ListenerSystem(
			document.body,
			'keydown',
			function(e) {
				if (Keyboard.getKeyIdentifier(e) == app.keys.CANCEL.ID ||
				    Keyboard.getKeyIdentifier(e) == app.keys.DOWN.ID) {
					app.menus.about.hide();
				}
			}
		)
	],
	function() {// when show about menu
		// Stop main menu listener systems so that the game cannot be started
		//  with the shortcut while the about menu is still up
		app.menus.main.stopListenerSystems();
	},
	function() {// when hide about menu
		app.menus.main.startListenerSystems();
	}
);

app.menus.end = new Menu(
	'end',
	document.querySelector('.js-end-menu'),
	2000, -1000,
	[
		new ListenerSystem(
			document.querySelector('.js-end-again'),
			'click',
			function() {
				app.menus.end.hide();

				app.startInstructions();

				app.audioLoopers.silverAndGold.fadeIn();

				app.game.startGame(String(new Date().getTime()));
			}
		),
		new ListenerSystem(
			document.querySelector('.js-end-main'),
			'click',
			function() {
				app.menus.end.hide();

				app.menus.main.show();
			}
		),
		new ListenerSystem(
			document.body,
			'keydown',
			function(e) {
				if (Keyboard.getKeyIdentifier(e) == app.keys.LEFT.ID) {
					app.menus.end.hide();

					app.startInstructions();

					app.audioLoopers.silverAndGold.fadeIn();

					app.game.startGame(String(new Date().getTime()));
				}
				else if (Keyboard.getKeyIdentifier(e) == app.keys.CANCEL.ID ||
				         Keyboard.getKeyIdentifier(e) == app.keys.RIGHT.ID) {
					app.menus.end.hide();

					app.menus.main.show();
				}
			}
		)
	],
	function() {// Show work
		window.addEventListener('resize', app.game.drawFinalFrameBound);
	},
	function() {// Hide work
		window.removeEventListener('resize', app.game.drawFinalFrameBound);
	}
);

//////////

app.instructions = document.querySelector('.js-instructions');

app.showInstructions = function() {
	this.instructions.style['margin-top'] = '0';
};

app.hideInstructions = function() {
	this.instructions.style['margin-top'] = '-100%';
};

app.startInstructions = function() {
	this.showInstructions();

	if (this.instructionsHideTimeout != undefined) {
		clearTimeout(this.instructionsHideTimeout);
	}

	this.instructionsHideTimeout = setTimeout(function() {
		this.hideInstructions();
	}.bind(this), 4000);
};

//////////

app.kb.startListen();

app.menus.loading.show();
