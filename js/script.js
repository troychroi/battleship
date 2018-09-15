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
o seperate sequence of gameplay into individual parts:
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


*/

class Board {
	function() {
		let self;		
	}

	constructor(DOM) {
		self = this;
		self.gridmax = gridmaxglobal;
		self.DOM = DOM;
		self.shipsInDOM = DOM.querySelectorAll('[name="ship"]'); /* radio buttons in the DOM with attributes[name(ship),value(#-of-points),data-piece(type-of-ship)] */
		self.rotateshipInDOM = DOM.querySelector('#rotateship'); /* button in DOM that toggles the horizontal or vertical orientation of the ship being placed */
		self.pieces = []; /* saved game pieces are pushed here */
		self.pointsInDOM = DOM.querySelectorAll('.square');
		let axisX = []; /* letters across the top of the board */
		let axisY = []; /* numbers down the left side of the board */
		self.matrix = []; /* all available coordinates where shipsInDOM can be placed */
		self.matrixHorizontal = []; /* coordinates mapped from left to right, top to bottom */
		self.matrixVertical = []; /* coordinates mapped from top to bottom, left to right */
		self.matrixOrientation = self.matrixHorizontal; /* set the orientation for selecting coordinates of new ships */
		self.occupiedMatrix = []; /* coordinates occupied by pieces */
		
		// START SELECTION PROCESS
		self.startSelectionProcessInDOM = self.DOM.querySelector('#startselection');
		self.startSelectionProcessInDOM.addEventListener('click', self.startSelectionProcess);
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
				self.matrixHorizontal.push([axisY[j], axisX[i]]); /* push coordinates to alt matrixes */
				self.matrixVertical.push([axisY[i], axisX[j]]); /* push coordinates to alt matrixes */
				translate.push(String.fromCharCode(97+axisY[j]) + axisX[i]); /* push possible numer-letter combinations to array */
				translate.push(axisX[i] + String.fromCharCode(97+axisY[j])); /* push possible numer-letter combinations to array */
			}
		}
	}

	endSelectionProcess() {
		self.startSelectionProcessInDOM.removeEventListener('click', startSelectionProcess);
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
			self.matrixOrientation == self.matrixHorizontal ? self.matrixOrientation = self.matrixVertical : self.matrixOrientation = self.matrixHorizontal
		});
		self.pointsInDOM.forEach((pointInDOM) => {
			let temporaryShipCoordinates = [];
			var x;
			var y;
			function hoverShipOverBoard(callback) {
				for (let i = 0;i < shipSizer;i++) {
					if (self.matrixOrientation == self.matrixHorizontal) {
						x = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						y = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						if (typeof callback === "function") {
							callback();
						}
					} else if (self.matrixOrientation == self.matrixVertical) {
						x = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						y = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						if (typeof callback === "function") {
							callback();
						}
					}
				}
			}
			function mouseIn(event) {
				// reset temporaryShipCoordinates
				temporaryShipCoordinates = [];
				// POSSIBLE DUPLICATION
				hoverShipOverBoard(() => {
					temporaryShipCoordinates.push([x,y]);
				});
				temporaryShipCoordinates.forEach((point) => {
					if (self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
						placementAllowed = false;
					}
				});
				if (placementAllowed != false) {
					hoverShipOverBoard(() => {
						self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').setAttribute('data-active', 'active');
					});
				}
			}
			pointInDOM.addEventListener('mouseenter', mouseIn);
			function mouseExit(event) {
				event.target.removeAttribute('data-active');
				// POSSIBLE DUPLICATION
				hoverShipOverBoard(() => {
					self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').removeAttribute('data-active');
				});
				temporaryShipCoordinates.forEach((point) => {
					if (!self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
						placementAllowed = true;
					}
				});
				// reset temporaryShipCoordinates
				temporaryShipCoordinates = [];
			}
			pointInDOM.addEventListener('mouseout', mouseExit);
			function pointInDOMClickHandler(event) {
				// POSSIBLE DUPLICATION
				hoverShipOverBoard();
				if (!event.target.hasAttribute('data-save') && !self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').hasAttribute('data-save')) {
					let savedShipPoints = [];
					self.DOM.querySelectorAll('[data-active="active"]').forEach((activePoint) => {
						self.occupiedMatrix.push(activePoint.attributes['data-coordinate'].nodeValue);
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
		});
	}

	hit(coordinate) {
		if (self.occupiedMatrix.includes(coordinate)) {
			console.log('you hit a piece');
		} else {
			console.log('you missed me!');
		}
		// hit the board. if it hits a piece, trigger hit on piece. if misses a piece do nothing. then switch turns
	}

	constructBoard() {
		// place the ships on the board without overlapping one another
	}
}

var piecesHarbor = {
	5: "Carrier",
	4: "Battleship",
	3: "Cruiser",
	3: "Submarine",
	2: "Destroyer"
}

var translate = []; /* array that will contain all the possible call-out coordinates, mapped to their real-matrix coordinates */

class Piece {
	constructor(points, name) {
		var min = 2;
		var max = 5;
		this.hits = []; /* the successful hits on the piece */
		this.points = points; /* the coordinates of the piece on the board */
		this.name = name;
		this.alive = true; /* when all points have been hit, this will be false */
	}

	hit(coordinate) {
		if (translate.includes(this.points)) {
			if (this.points.includes(coordinate)) {
				this.hits.push(coordinate);
				console.log('you hit me!');
				document.querySelectorAll('.board [data-coordinate="'+ coordinate +'"]').forEach((point) => {
					point.setAttribute('data-hit', true);
				});
				if (this.hits.sort().toString() == this.points.sort().toString()) {
					this.alive = false;
					console.log('you sunk my ' + this.name);
				}
			} else {
				console.log('missed me!');
			}
		} else {
			console.log('call your hit in this format: 1A or A1', 'minimum is 1 and a, and maximum is 10 and j');
		}
	}
}


// initialize game

var gridmaxglobal = 10;

var player1Board = new Board(document.querySelector('#app .board.player'));
