import Player from './Player.js';
import Loop from './Loop';
import SRNG from './SeededRNG';
import clamp from './Clamp';
import Color from './Color';
import Tile from './Tile';
import Backdrop from './Backdrop';
import Patrol from './Patrol.js';
import V2 from './Vector2.js';

function Game(c, ctx) {
	this.c = c;
	this.ctx = ctx;

	this.panelsC = document.createElement('canvas');
	this.panelsCtx = this.panelsC.getContext('2d');

	this.tilesC = document.createElement('canvas');
	this.tilesCtx = this.tilesC.getContext('2d');

	this.playerSideLength = 0.1;
	this.playerWalkSpeed = 0.017;
	this.playerRunSpeed = 0.029;
	// 0 is no slidiness
	this.playerXMoveFactor = 0.6;

	// speed multiplier when in air
	this.playerAirFactor = 0.8;

	this.maxJumpCycles = 10;
	// this.jumpCycles;// Set to 0 at game start

	this.jumpRate = 0.0059;
	this.fallRate = 0.0030;

	this.killBounce = 0.0500;

	this.numPanels = {min: 3, max: 14};
	this.panelWidthLimits = {min: 0.12, max: 0.70};
	this.panelHeightLimits = {min: 0.06, max: 0.18};

	this.numTileRows = {min: 1, max: 5};

	// For parallax effect
	this.tileFactor = 0.5;

	this.limits = {};

	// How many percent of canvas height to change each frame
	this.outCircleFactor = 0.80;

	// Rate of change of red at death
	this.overRedOpacityRate = 0.015;

	this.fadeInFactor = 0.9;

	this.isDyingCallback = function() {};

	// this.numScratches = 12;
	// this.scratchWidth = {min: 0.06, max: 0.16};
	// this.scratchHeight = {min: 0.06, max: 0.16};
	// this.scratchPlayerOffset = {min: -0.15, max: 0.15};
	// // this.scratchShiftOffset = {min: -0.08, max: 0.08};

	this.nightmareMode = false;

	this.gameLoop = new Loop(this.gameWork.bind(this));
	this.dieLoop = new Loop(this.dieWork.bind(this));
	this.fadeInLoop = new Loop(this.fadeInWork.bind(this));

	this.drawFinalFrameBound = this.drawFinalFrame.bind(this);

	// this.aspectWidth
	// this.aspectHeight

	// this.kb
	// this.keys

	//// Set at game start

	// this.playerCamMinOffset
	// this.playerCamMaxOffset

	// this.numPanelGroups;
	// this.numTileColumns;

	// this.streak
	// this.highestStreak
}

/**
 * Return random Backdrop
 * @param {SeededRNG} srng
 */
Game.prototype.randomBackdrop = function(srng) {
	var backdrop = new Backdrop();

	backdrop.numPanels = srng.randomInt(this.numPanels.min, this.numPanels.max);

	for (var i = 0; i < backdrop.numPanels; i++) {
		var color = Color.random(srng.randomInt.bind(srng));

		backdrop.panelColors.push(color);
	}

	backdrop.panelWidth = srng.randomInRange(this.panelWidthLimits.min, this.panelWidthLimits.max);
	backdrop.panelHeight = srng.randomInRange(this.panelHeightLimits.min, this.panelHeightLimits.max);

	backdrop.numTileRows = srng.randomInt(this.numTileRows.min, this.numTileRows.max);

	backdrop.tileLength = (1 - 2 * backdrop.panelHeight) / backdrop.numTileRows;

	backdrop.tile = Tile.random(srng);

	return backdrop;
};

Game.prototype.bakeBackdrop = function(backdrop) {
	this.panelHeight = Math.round(backdrop.panelHeight * this.c.height);
	this.tileColumnHeight = this.c.height - 2 * this.panelHeight;

	this.panelGroupWidth = backdrop.numPanels * backdrop.panelWidth;

	// The numbers in order to fill screen and enough to wrap
	this.numPanelGroups = 1 + Math.ceil(
		(this.aspectWidth / this.aspectHeight) / this.panelGroupWidth
	);

	this.numTileColumns = 1 + Math.ceil(
		(this.aspectWidth / this.aspectHeight) / backdrop.tileLength
	);

	this.panelsC.width = Math.floor(this.numPanelGroups * this.panelGroupWidth * this.c.height);
	this.panelsC.height = this.panelHeight;

	this.tilesC.width = Math.floor(this.numTileColumns * backdrop.tileLength * this.c.height);
	this.tilesC.height = this.tileColumnHeight;

	this.panelsCtx.save();
		this.panelsCtx.scale(this.panelHeight, this.panelHeight);

		var pGWidth = (backdrop.panelWidth / backdrop.panelHeight) * backdrop.numPanels;

		for (var i = 0; i < this.numPanelGroups; i++) {
			backdrop.renderPanelGroup(this.panelsCtx);

			this.panelsCtx.translate(pGWidth, 0);
		}
	this.panelsCtx.restore();

	this.tilesCtx.save();
		this.tilesCtx.scale(this.tileColumnHeight, this.tileColumnHeight);

		var width = 1 / backdrop.numTileRows;

		for (var i = 0; i < this.numTileColumns; i++) {
			backdrop.renderTileColumn(this.tilesCtx);

			this.tilesCtx.translate(width, 0);
		}
	this.tilesCtx.restore();
};

Game.prototype.prepLevel = function(lvl) {
	this.backdrop = this.randomBackdrop(this.srng);

	this.bakeBackdrop(this.backdrop);

	this.camera = {};
	this.camera.pos = {x: 0, y: 0};
	this.camera.limits = {};
	this.camera.limits.x = {min: 0, max: 9};

	this.limits.x = {};
	this.limits.x.min = 0;
	this.limits.x.max = this.camera.limits.x.max + this.aspectWidth / this.aspectHeight;
	this.limits.y = {};
	this.limits.y.min = this.backdrop.panelHeight;
	this.limits.y.max = 1 - this.backdrop.panelHeight;

	// For player
	this.ceilingY = this.limits.y.min + this.playerSideLength / 2;
	this.groundY = this.limits.y.max - this.playerSideLength / 2;

	this.player = new Player(
		this.backdrop.panelWidth / 2,
		this.groundY,
		this.playerSideLength,
		0
	);

	this.playerGrounded = true;

	this.patrols = [];
	this.numPatrols = Math.min(3 + 4 * lvl, 32);

	for (var i = 0; i < this.numPatrols; i++) {
		var radius = this.playerSideLength * this.srng.randomInRange(0.4, Math.min(0.3 + 0.1 * lvl, 0.8));

		var x = this.srng.randomInRange(
			3 * this.backdrop.panelWidth + radius,
			this.limits.x.max
		);
		var y = this.limits.y.max - radius;

		var x2 = this.srng.randomInRange(
			2 * this.backdrop.panelWidth + radius,
			this.limits.x.max
		);
		var y2 = this.limits.y.max - radius;

		var speed = this.playerWalkSpeed * this.srng.randomInRange(0.2, Math.min(0.1 + 0.1 * lvl, 0.6));

		var patrol = new Patrol(x, y, radius, {x: x2, y: y2}, {x: x, y: y}, speed);

		this.patrols.push(patrol);
	}
};

Game.prototype.startGame = function(str) {
	this.srng = new SRNG(str);

	this.kills = 0;

	this.level = 1;

	this.streak = 0;
	this.highestStreak = 0;

	this.fadeInLoop.timestepper.reset();
	this.gameLoop.timestepper.reset();

	this.playerCamMinOffset = (this.aspectWidth / this.aspectHeight) * 0.45;
	this.playerCamMaxOffset = (this.aspectWidth / this.aspectHeight) * 0.55;

	this.jumpCycles = 0;

	this.prepLevel(this.level);

	this.dead = false;

	this.fadeInLoop.stopCallback = function() {
		this.gameLoop.start();
	}.bind(this);

	this.fadeInOpacity = 1;

	this.fadeInLoop.start();
};

Game.prototype.drawTiles = function() {
	this.tileXOffset = (this.camera.pos.x * this.tileFactor) % this.backdrop.tileLength;

	// Draw tiles
	this.ctx.save();
		this.ctx.translate(-this.tileXOffset * this.c.height, 0);

		this.ctx.drawImage(
			this.tilesC,
			0,
			0,
			this.tilesC.width,
			this.tilesC.height,
			0,
			this.panelsC.height,
			this.tilesC.width,
			this.tilesC.height
		);
	this.ctx.restore();
};

Game.prototype.drawPanels = function() {
	this.panelXOffset = this.camera.pos.x % this.panelGroupWidth;

	// Draw panels
	this.ctx.save();
		this.ctx.translate(-this.panelXOffset * this.c.height, 0);

		this.ctx.drawImage(
			this.panelsC,
			0,
			0,
			this.panelsC.width,
			this.panelsC.height,
			0,
			0,
			this.panelsC.width,
			this.panelsC.height
		);

		this.ctx.translate(0, this.c.height);
		this.ctx.scale(1, -1);

		this.ctx.drawImage(
			this.panelsC,
			0,
			0,
			this.panelsC.width,
			this.panelsC.height,
			0,
			0,
			this.panelsC.width,
			this.panelsC.height
		);
	this.ctx.restore();
};

Game.prototype.drawBackdrop = function() {
	this.drawTiles();

	this.drawPanels();
};

Game.prototype.drawPlayer = function() {
	// Draw player
	this.ctx.save();
		this.ctx.scale(this.c.height, this.c.height);

		this.ctx.translate(-this.camera.pos.x, -this.camera.pos.y);

		this.player.draw(this.ctx);
	this.ctx.restore();
};

Game.prototype.drawPatrols = function() {
	this.ctx.save();
		this.ctx.scale(this.c.height, this.c.height);

		this.ctx.translate(-this.camera.pos.x, -this.camera.pos.y);

		var numPatrols = this.patrols.length;

		for (var i = 0; i < numPatrols; i++) {
			this.patrols[i].draw(this.ctx);
		}
	this.ctx.restore();
};

Game.prototype.gameWork = function() {
	var dir = 0;
	if (this.kb.keydown[this.keys.RIGHT.ID] === true) {
		dir += 1;
	}
	if (this.kb.keydown[this.keys.LEFT.ID] === true) {
		dir -= 1;
	}

	var pSpeed;
	if (this.kb.keydown[this.keys.MOD.ID] === true) {
		pSpeed = this.playerRunSpeed;
	}
	else {
		pSpeed =  this.playerWalkSpeed;
	}

	var airFac = (this.playerGrounded) ? 1 : this.playerAirFactor;

	this.player.vel.x += dir * pSpeed * airFac;

	this.player.vel.x *= this.playerXMoveFactor;
	this.player.pos.x += this.player.vel.x;

	if (this.player.pos.x < 0) {
		this.player.pos.x = 0;
	}

	if (this.kb.keydown[this.keys.UP.ID] === true ||
	    this.kb.keydown[this.keys.ACTION.ID] === true ||
	    this.kb.keydown[this.keys.CONFIRM.ID] === true
	) {
		if (this.jumpCycles < this.maxJumpCycles) {
			this.jumpCycles += 1;
			this.player.vel.y -= this.jumpRate;
		}
	}

	this.player.vel.y += this.fallRate;
	this.player.pos.y += this.player.vel.y;

	if (this.player.pos.y >= this.groundY) {
		this.player.pos.y = this.groundY;
		this.player.vel.y = 0;
		this.jumpCycles = 0;
		this.streak = 0;

		this.playerGrounded = true;
	}
	else {
		this.playerGrounded = false;

		if (this.player.pos.y <= this.ceilingY) {
			this.player.pos.y = this.ceilingY;
			this.player.vel.y = 0;
		}
	}

	this.playerCamDiff = this.player.pos.x - this.camera.pos.x;

	if (this.playerCamDiff < this.playerCamMinOffset) {
		this.camera.pos.x = this.player.pos.x - this.playerCamMinOffset;
	}
	else if (this.playerCamDiff > this.playerCamMaxOffset) {
		this.camera.pos.x = this.player.pos.x - this.playerCamMaxOffset;
	}

	this.camera.pos.x = clamp(
		this.camera.pos.x,
		this.camera.limits.x.min,
		this.camera.limits.x.max
	);

	var numPatrols = this.patrols.length;
	for (var i = 0; i < numPatrols; i++) {
		this.patrols[i].move();
	}

	var bounces = 0;
	this.patrols.forEach(function(patrol) {
		var angle = Math.atan2(patrol.pos.y - this.player.pos.y, patrol.pos.x - this.player.pos.x);

		var hitDistance = this.player.getRadius(angle) + patrol.radius;
		var distance = V2.distance(this.player.pos, patrol.pos);

		if (distance < hitDistance) {
			var playerVelAngle = Math.atan2(this.player.vel.y, this.player.vel.x);

			if (this.player.pos.y < patrol.pos.y && playerVelAngle > 0 && playerVelAngle < Math.PI) {
				bounces += 1;
				this.kills += 1;

				this.patrols.splice(this.patrols.indexOf(patrol), 1);
			}
			else {
				this.dead = true;
			}
		}
	}.bind(this));

	if (bounces > 0) {
		this.player.vel.y = bounces * -this.killBounce;

		this.streak += bounces;

		if (this.streak > this.highestStreak) {
			this.highestStreak = this.streak;
		}
	}

	/* Draw random rectangles * /
	for (var i = 0; i < 8; ++i) {
		var x = this.srng.randomInRange(0, 1);
		var y = this.srng.randomInRange(0, 1);

		var width = this.srng.randomInRange(0.02, 0.14);
		var height = this.srng.randomInRange(0.02, 0.14);

		var r = this.srng.randomInt(0, 255);
		var g = this.srng.randomInt(0, 255);
		var b = this.srng.randomInt(0, 255);
		var a = this.srng.randomInRange(0.1, 1);

		this.ctx.save();
			this.ctx.scale(this.c.width, this.c.height);
			this.ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
			this.ctx.rotate(Math.random() * Math.PI * 2);
			this.ctx.fillRect(x, y, width, height);
		this.ctx.restore();
	}
	/* End */

	/* Terrible scaling draw * /
	this.ctx.save();
		this.ctx.translate(this.c.width / 2, this.c.height / 2);
		var factor = Math.sin(new Date().getTime() / 7000);
		var scale = 0.75 + 0.25 * factor;
		this.ctx.scale(scale, scale);
		this.ctx.translate(-this.c.width / 2, -this.c.height / 2);

		this.drawBackdrop();
		this.drawPlayer();
		this.drawPatrols();
	this.ctx.restore();
	/* End */

	if (this.nightmareMode) {
		this.ctx.save();
			var timeVar = new Date().getTime();

			this.ctx.translate(this.c.width / 2, this.c.height / 2);
			this.ctx.rotate((Math.PI / 32) * Math.sin(timeVar / 1200));
			var scale = 0.65 + 0.25 * Math.cos(timeVar / 600);
			this.ctx.scale(scale, scale);
			this.ctx.translate(-this.c.width / 2, -this.c.height / 2);

			// this.ctx.translate(Math.cos(timeVar / 1300) * 0.05 * this.c.width, Math.sin(timeVar / 1400) * 0.05 * this.c.height);

			this.drawBackdrop();
			this.drawPlayer();
			this.drawPatrols();
		this.ctx.restore();
	}
	else {
		this.drawBackdrop();
		this.drawPlayer();
		this.drawPatrols();
	}

	// // Draw scratches
	// this.ctx.save();
	// 	// this.ctx.scale(this.c.height, this.c.height);
	// 	this.ctx.scale(this.c.width, this.c.height);
	//
	// 	// this.ctx.translate(-this.camera.pos.x, -this.camera.pos.y);
	// 	// // Move to center of player
	// 	// this.ctx.translate(this.player.pos.x, this.player.pos.y);
	//
	// 	for (var i = 0; i < this.numScratches; ++i) {
	// 		this.ctx.save();
	// 			// console.log(this.player.pos);
	//
	// 			// var sourceX = this.srng.randomInRange(this.scratchPlayerOffset.min, this.scratchPlayerOffset.max);
	// 			// var sourceY = this.srng.randomInRange(this.scratchPlayerOffset.min, this.scratchPlayerOffset.max);
	// 			// var sourceX = this.srng.randomInRange(0, this.c.width / this.c.height);
	// 			// var sourceY = this.srng.randomInRange(0, 1);
	// 			// var sourceX = this.player.pos.x + this.srng.randomInRange(this.scratchPlayerOffset.min, this.scratchPlayerOffset.max);
	// 			// var sourceY = this.player.pos.y + this.srng.randomInRange(this.scratchPlayerOffset.min, this.scratchPlayerOffset.max);
	// 			// var sourceX = this.srng.randomInRange(0, this.c.width / this.c.height);
	// 			// var sourceY = this.srng.randomInRange(0.2, 0.8);
	// 			var sourceX = this.srng.randomInRange(0.4, 0.6);
	// 			var sourceY = this.srng.randomInRange(0.4, 0.6);
	//
	// 			var width = this.srng.randomInRange(this.scratchWidth.min, this.scratchWidth.max);
	// 			var height = this.srng.randomInRange(this.scratchHeight.min, this.scratchHeight.max);
	//
	// 			// this.ctx.translate(-width / 2, -height / 2);
	//
	// 			// var xShift = this.srng.randomInRange(this.scratchShiftOffset.min, this.scratchShiftOffset.max);
	// 			// var yShift = this.srng.randomInRange(this.scratchShiftOffset.min, this.scratchShiftOffset.max);
	//
	// 			// var destX = this.srng.randomInRange(0, this.c.width / this.c.height);
	// 			// var destY = this.srng.randomInRange(0, 1);
	// 			var destX = this.srng.randomInRange(0, 1);
	// 			var destY = this.srng.randomInRange(0, 1);
	//
	// 			// console.log(sourceX, sourceY, width, height, destX, destY);
	//
	// 			this.ctx.drawImage(
	// 				this.c,
	// 				sourceX, sourceY,
	// 				width, height,
	// 				destX, destY,
	// 				width, height
	// 			);
	//
	// 			// this.ctx.fillRect(0.5, 0.5, 0.5, 0.5);
	// 		this.ctx.restore();
	// 	}
	// this.ctx.restore();

	if (this.dead) {
		this.isDyingCallback();

		this.die();
	}
	else if (this.player.pos.x > this.limits.x.max) {
		this.gameLoop.stopCallback = function() {
			this.level += 1;
			this.prepLevel(this.level);

			this.fadeInLoop.stopCallback = function() {
				this.gameLoop.start();
			}.bind(this);

			this.fadeInOpacity = 1;

			this.fadeInLoop.start();
		}.bind(this);

		this.gameLoop.stop();
	}
};

Game.prototype.die = function() {
	// Calculate speed stat. Levels/min
	this.totalTime = this.fadeInLoop.timestepper.totalTime + this.gameLoop.timestepper.totalTime;
	this.speed = (this.level - 1) / ((this.totalTime / 1000) / 60);

	this.outCircleRadius = this.c.width;
	// Where player is on canvas
	this.playerX = this.player.pos.x - this.camera.pos.x;

	this.overRedOpacity = 0;

	// if fade in is still happening
	if (this.fadeInLoop.looping) {
		this.fadeInLoop.stopCallback = function() {
			this.dieLoop.start();
		}.bind(this);

		this.fadeInLoop.stop();
	}
	else {
		this.gameLoop.stopCallback = function() {
			this.dieLoop.start();
		}.bind(this);

		this.gameLoop.stop();
	}
};

Game.prototype.dieWork = function() {
	this.outCircleRadius *= this.outCircleFactor + (0.99 - this.outCircleFactor) * (1 - (this.outCircleRadius / this.c.width));

	this.overRedOpacity += this.overRedOpacityRate;
	this.overRedOpacity = Math.min(0.6, this.overRedOpacity);

	this.ctx.save();
		this.ctx.globalCompositeOperation = 'hard-light';

		this.drawBackdrop();
		this.drawPlayer();
		this.drawPatrols();

		this.ctx.fillStyle = `rgba(152, 8, 8, ${this.overRedOpacity})`;
		this.ctx.fillRect(0, 0, this.c.width, this.c.height);

		this.ctx.beginPath();
			this.ctx.rect(0, 0, this.c.width, this.c.height);
			this.ctx.arc(
				this.playerX * this.c.height,
				this.player.pos.y * this.c.height,
				this.outCircleRadius,
				0, 2 * Math.PI,
				true// Counter-clockwise
			);
			this.ctx.fillStyle = '#000';
			this.ctx.fill();
		this.ctx.closePath();
	this.ctx.restore();

	if (this.outCircleRadius < 2 * this.player.sideLength * this.c.height) {
		this.dieLoop.stop();
	}
};

Game.prototype.fadeInWork = function() {
	this.fadeInOpacity *= this.fadeInFactor;

	if (this.fadeInOpacity < 0) {
		this.fadeInOpacity = 0;
	}

	this.gameWork();

	this.ctx.save();
		this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeInOpacity})`;
		this.ctx.fillRect(0, 0, this.c.width, this.c.height);
	this.ctx.restore();

	if (this.fadeInOpacity < 0.05) {
		this.fadeInLoop.stop();
	}
};

Game.prototype.drawFinalFrame = function() {
	this.ctx.save();
		this.ctx.scale(this.c.width, this.c.height);
		this.ctx.drawImage(this.finalFrame, 0, 0, 1, 1);
	this.ctx.restore();
};


Game.prototype.handleResize = function() {
	if (this.backdrop != undefined) {
		this.bakeBackdrop(this.backdrop);
	}
};

export default Game
