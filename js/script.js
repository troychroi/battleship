/*

MASTER PLAN

1. map out board for player 1
2. player 1 can select a game piece
3. player 1 can place the piece on the board
4. player 1 can change orientation of piece to be placed on the board
5. player 1 can save the piece(s) on the board

6. map out board for player 2
7. player 2 can select a game piece
8. player 2 can place the piece on the board
9. player 2 can change orientation of piece to be placed on the board
10. player 2 can save the piece(s) on the board

11. player 1 can attempt a hit
12. player 2 can attempt a hit
13. someone can win


DEVELOPMENT PLAN (unordered list of tasks and/or problems)

x when user saves a ship position on the board, create an actual ship object with its coordinates in an array
x don't allow a ship to place over another saved ship
x don't allow a ship to straddle another ship either!
x when the matrixOrientation is switched to vertical, the last column isn't allowed - fix this!
x when the matrixOrientation is switched to horizontal, the last row takes on the hover, but the point and the siblings are also mirrored in the first row - fix this!
x if you hover over a saved coordinate and then hover on a coordinate right below it (in vertical mode), placementAllowed remains false. we want it to be true in this case
-----------------
o seperate sequence of gameplay into individual parts (trigger each part of the sequence outside of class declarations):
	x start game setup
	o end game setup
	o player 1 setup board
	o if player 1 has no more ships to place:
		- player 2 setup board
	o if player 2 has no more ships to place:
		- start game play
			while player 2 has alive ships:
				- player 1 turn
			else:
				- player 1 wins
			while player 1 has alive ships:
				- player 2 turn
			else:
				- player 2 wins
		- reveal both players' boards
		- start a new game?
o generate DOM rather than hard-coding it in index.html
o move the ship placement sequencing out of the class Board declaration

x use document.createElement to generate Board pointsInDom
o convert Objects to strings for the templating in GENERATE BOARDS

*/

class Board {
	function() {
		let self;		
	}

	constructor(DOM) {
		self = this;
		self.gridmax = gridmaxglobal;
		self.DOM = DOM;
		self.shipsInDOM = []; /* radio buttons in the DOM with attributes[name(ship),value(#-of-points),data-piece(type-of-ship)] */
		for (let i = 0; i < Object.keys(piecesHarbor).length; i++) {
			let ship = Object.entries(piecesHarbor)[i];
			let shipKey = ship[0];
			let shipValue = ship[1];
			console.log(shipKey,shipValue);
			let shipInDom = document.createElement('input');
			shipInDom.setAttribute('name', 'ship');
			shipInDom.setAttribute('value', shipValue);
			shipInDom.setAttribute('data-piece', shipKey);
			self.shipsInDOM.push(shipInDom);
		}
		console.log(self.shipsInDOM);
		self.rotateshipInDOM = document.createElement('button');
		self.rotateshipInDOM.setAttribute('data-rotate', 'rotateship');
		self.pieces = []; /* saved game pieces are pushed here */
		self.pointsInDOM = [];
		let axisX = []; /* numbers across the top of the board */
		let axisY = []; /* letters down the left side of the board */
		self.matrix = []; /* all available coordinates where shipsInDOM can be placed */
		self.matrixHorizontal = []; /* coordinates mapped from left to right, top to bottom */
		self.matrixVertical = []; /* coordinates mapped from top to bottom, left to right */
		self.matrixOrientation = self.matrixHorizontal; /* set the orientation for selecting coordinates of new ships */
		
		// START SELECTION PROCESS
		self.startSelectionProcessInDOM = document.createElement('button');
		self.startSelectionProcessInDOM.setAttribute('data-start', 'startselection');
		self.startSelectionProcessInDOM.addEventListener('click', self.startSelectionProcess);
		self.startSelectionProcessInDOM.innerHTML = 'Start Selecting Ships';
		// END SELECTION PROCESS

		// create two arrays containing equal number of numbers based on gridmax, which is set by gridmaxglobal
		for (let it = 0;it < self.gridmax;it++) {
			axisY.push(it+1);
			axisX.push(it+1);
		}

		// generate the gameboard coordinates
		for(let i = 0; i < axisY.length; i++) {
			for(let j = 0; j < axisX.length; j++) {
				self.matrix.push([axisY[j], axisX[i]]); /* push to main matrix */
				self.matrixHorizontal.push([axisY[j], axisX[i]]); /* push coordinates to oriented matrixes */
				self.matrixVertical.push([axisY[i], axisX[j]]); /* push coordinates to oriented matrixes */
				translate.push(String.fromCharCode(97+axisY[j]) + axisX[i]); /* push possible numer-letter combinations to array */
				translate.push(axisX[i] + String.fromCharCode(97+axisY[j])); /* push possible numer-letter combinations to array */
			}
		}

		for(let i = 0; i < axisY.length; i++) {
			for(let j = 0; j < axisX.length; j++) {
				let pointForDOM = document.createElement('div');
				pointForDOM.classList.add('square');
				pointForDOM.setAttribute('data-coordinate', j +','+ i);
				self.pointsInDOM.push(pointForDOM);
			}
		}


	}

	endSelectionProcess() {
		self.startSelectionProcessInDOM.removeEventListener('click', self.startSelectionProcess);
		if (self.pieces.length == self.shipsInDOM.length) {
			self.pointsInDOM.forEach((pointInDOM) => {
				pointInDOM.removeEventListener('click', pointInDOMClickHandler);
				pointInDOM.removeEventListener('mouseenter', mouseIn);
				pointInDOM.removeEventListener('mouseout', mouseExit);
			});
		}
	}
	startSelectionProcess(event) {
		event.target.style.display = 'none';
		self.DOM.querySelector('.ships .controls').style.display = 'block';
		self.shipsInDOM.forEach((ship) => {
			ship.addEventListener('change', setFromSelection);
		});
		let shipSizer = 0;
		let thisShip;
		let placementAllowed = true;
		function setFromSelection(shipChangeEvent) {
			shipSizer = shipChangeEvent.target.value;
			thisShip = shipChangeEvent.target;
		}
		self.rotateshipInDOM.addEventListener('click', function() {
			self.matrixOrientation === self.matrixHorizontal ? self.matrixOrientation = self.matrixVertical : self.matrixOrientation = self.matrixHorizontal
		});
		self.pointsInDOM.forEach((pointInDOM) => {
			let temporaryShipCoordinates = [];
			let x;
			let y;
			function hoverShipOverBoard(uniqueFunction) {
				for (let i = 0;i < shipSizer;i++) {
					if (self.matrixOrientation === self.matrixHorizontal) {
						x = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						y = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						if (typeof uniqueFunction === "function") {
							uniqueFunction();
						}
					} else if (self.matrixOrientation === self.matrixVertical) {
						x = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						y = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						if (typeof uniqueFunction === "function") {
							uniqueFunction();
						}
					}
				}
			}
			function mouseIn(event) {
				// reset temporaryShipCoordinates
				temporaryShipCoordinates = [];
				hoverShipOverBoard(() => {
					temporaryShipCoordinates.push([x,y]);
				});
				temporaryShipCoordinates.forEach((point) => {
					if (self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]') && self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
						placementAllowed = false;
					}
				});
				if (placementAllowed !== false && self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]')) {
					hoverShipOverBoard(() => {
						self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').setAttribute('data-active', 'active');
					});
				}
			}
			pointInDOM.addEventListener('mouseenter', mouseIn);
			function mouseExit(event) {
				event.target.removeAttribute('data-active');
				if (self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]')) {
					hoverShipOverBoard(() => {
						self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').removeAttribute('data-active');
					});
					temporaryShipCoordinates.forEach((point) => {
						if (!self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
							placementAllowed = true;
						}
					});
				}
				// reset temporaryShipCoordinates
				temporaryShipCoordinates = [];
			}
			pointInDOM.addEventListener('mouseout', mouseExit);
			function pointInDOMClickHandler(event) {
				hoverShipOverBoard();
				if (!event.target.hasAttribute('data-save') && self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]') && !self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').hasAttribute('data-save')) {
					let savedShipPoints = [];
					self.DOM.querySelectorAll('[data-active="active"]').forEach((activePoint) => {
						savedShipPoints.push(activePoint.attributes['data-coordinate'].nodeValue);
						activePoint.removeAttribute('data-active');
						activePoint.setAttribute('data-save', 'saved');
						activePoint.setAttribute('data-ship', thisShip.attributes['data-piece'].nodeValue);
					});
					thisShip.checked = false;
					thisShip.setAttribute('disabled', 'disabled');
					thisShip.removeEventListener('change', setFromSelection);
					shipSizer = 0;
					let newPiece = new Piece(savedShipPoints, thisShip.attributes['data-piece'].nodeValue);
					self.pieces.push(newPiece);
				}
				pointInDOM.removeEventListener('mouseenter', mouseIn);
				pointInDOM.removeEventListener('mouseout', mouseExit);
			}
			pointInDOM.addEventListener('click', pointInDOMClickHandler);
			if (self.pieces.length == self.shipsInDOM.length) {
				pointInDOM.addEventListener('click', self.endSelectionProcess, {
				  once: true,
				  passive: true,
				  capture: true
				});
			}	
		});
	}

	hit(coordinate) {
		// hit the board. if it hits a piece, trigger hit on piece. if misses a piece do nothing. then switch turns
	}
}

var piecesHarbor = {
	"Carrier": 5,
	"Battleship": 4,
	"Cruiser": 3,
	"Submarine": 3,
	"Destroyer": 2
}

var translate = []; /* array that will contain all the possible call-out coordinates, mapped to their real-matrix coordinates */

class Piece {
	function() {
		let self;		
	}

	constructor(points, name) {
		self.hits = []; /* the successful hits on the piece */
		self.points = points; /* the coordinates of the piece on the board */
		self.name = name;
		self.alive = true; /* when all points have been hit, this will be false */
	}

	hit(coordinate) {
		if (translate.includes(self.points)) {
			if (self.points.includes(coordinate)) {
				self.hits.push(coordinate);
				console.log('you hit me!');
				document.querySelectorAll('.board [data-coordinate="'+ coordinate +'"]').forEach((point) => {
					point.setAttribute('data-hit', true);
				});
				if (self.hits.sort().toString() == self.points.sort().toString()) {
					self.alive = false;
					console.log('you sunk my ' + self.name);
				}
			} else {
				console.log('missed me!');
			}
		} else {
			console.log('call your hit in this format: 1A or A1', 'minimum is 1 and a, and maximum is 10 and j');
		}
	}
}

class Player {
	function() {
		let self;		
	}

	constructor(name) {
		self = this;
		self.name = name;
		console.log(self.name);
		self.board = new Board(document.querySelector('#app .board.player.'+self.name));
		self.opponentBoard = document.querySelector('#app .board.opponent.'+self.name);
	}
}

// initialize game

var app = document.getElementById('app');

var gridmaxglobal = 10;

var player1 = new Player('player1');
var player2 = new Player('player2');


var players = [player1, player2];

// GENERATE BOARDS

players.forEach((player) => {
	// Generate opponent board to be used as a reference of hits and misses
	let playerOpponentBoard = document.createElement('div');
	playerOpponentBoard.classList.add('board','opponent',player.name);
	let playerOpponentBoardLegendPointsNumbersTemplate = ``;
	let playerOpponentBoardLegendPointsLettersTemplate = ``;
	// generate the gameboard coordinates
	for(let i = 1; i <= gridmaxglobal; i++) {
		playerOpponentBoardLegendPointsNumbersTemplate += '<div class="point">'+ i +'</div>';
		playerOpponentBoardLegendPointsLettersTemplate += '<div class="point">'+ String.fromCharCode(96+i) +'</div>';
	}
	let playerOpponentBoardLegendTemplate = `
		<div class="legend axis-x">
			`+ playerOpponentBoardLegendPointsNumbersTemplate +`
		</div>
		<div class="legend axis-y">
			`+ playerOpponentBoardLegendPointsLettersTemplate +`
		</div>
	`;
	console.log(playerOpponentBoardLegendTemplate);
	let playerOpponentBoardSquaresTemplate = ``;
	let axisX = []; /* numbers across the top of the board */
	let axisY = []; /* letters down the left side of the board */
	for (let it = 0;it < self.gridmax;it++) {
		axisY.push(it+1);
		axisX.push(it+1);
	}
	for(let i = 0; i < axisY.length; i++) {
		for(let j = 0; j < axisX.length; j++) {
			playerOpponentBoardSquaresTemplate += '<div class="square" data-coordinate="'+ j +','+ i +'"></div>';
		}
	}
	let playerOpponentBoardComplete = playerOpponentBoardLegendTemplate+playerOpponentBoardSquaresTemplate;
	playerOpponentBoard.innerHTML = playerOpponentBoardComplete;

	// Generate player board, to be used for placing ships and keeping track of hits and misses from opponent

	let playerOwnBoard = document.createElement('div');
	playerOwnBoard.classList.add('board','player',player.name);
	let shipsInDOMTemplate = ``;
	player.board.shipsInDOM.forEach((ship) => {
		let stars = '';
		for(let i = 0; i < ship.attributes['value'].nodeValue; i++) {
			stars += '*';
		}
		shipsInDOMTemplate += ship.outerHTML + '<label>' + stars + '</label';
	});
	console.log(shipsInDOMTemplate);
	let playerOwnBoardShipsTemplate = `
		<div class="ships">
			`+ player.board.startSelectionProcessInDOM.outerHTML +`
			<div class="controls">
				<h2>Your Ships</h2>
				<fieldset>
					`+ shipsInDOMTemplate +`
				</fieldset>
				`+ player.board.rotateshipInDOM.outerHTML +`
			</div>
		</div>	
	`;
	let playerOwnBoardLegendPointsNumbersTemplate = ``;
	let playerOwnBoardLegendPointsLettersTemplate = ``;
	// generate the gameboard coordinates
	for(let i = 1; i <= gridmaxglobal; i++) {
		playerOwnBoardLegendPointsNumbersTemplate += '<div class="point">'+ i +'</div>';
		playerOwnBoardLegendPointsLettersTemplate += '<div class="point">'+ String.fromCharCode(96+i) +'</div>';
	}
	let playerOwnBoardSquaresTemplate = '';
	player.board.pointsInDOM.forEach((point) => {
		playerOwnBoardSquaresTemplate += point.outerHTML;
	});
	let playerOwnBoardLegendTemplate = `
		<div class="legend axis-x">
			`+ playerOwnBoardLegendPointsNumbersTemplate +`
		</div>
		<div class="legend axis-y">
			`+ playerOwnBoardLegendPointsLettersTemplate +`
		</div>
	`;

	let playerOwnBoardComplete = playerOwnBoardLegendTemplate+playerOwnBoardShipsTemplate+playerOwnBoardSquaresTemplate;
	playerOwnBoard.innerHTML = playerOwnBoardComplete;
	console.log(playerOpponentBoard, playerOwnBoard);
	app.appendChild(playerOpponentBoard);
	app.appendChild(playerOwnBoard);
});