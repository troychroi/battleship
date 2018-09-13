/*

MASTER PLAN

1. map out board
2. player 1 can select a game piece
3. player 1 can place the piece on the board
4. player 1 can change orientation of piece to be placed on the board
5. player 1 can save the piece(s) on the board
6. player 2 sets up board
7. player 1 can attempt a hit
8. player 2 can attempt a hit
9. someone can win


DEVELOPMENT PLAN (unordered list of tasks and/or problems)

x when user saves a ship position on the board, create an actual ship object with its coordinates in an array
x don't allow a ship to place over another saved ship
x don't allow a ship to straddle another ship either!
x when the matrixOrientation is switched to vertical, the last column isn't allowed - fix this!
x when the matrixOrientation is switched to horizontal, the last row takes on the hover, but the point and the siblings are also mirrored in the first row - fix this!
x if you hover over a saved coordinate and then hover on a coordinate right below it (in vertical mode), placementAllowed remains false. we want it to be true in this case

*/

class Board {
	function() {
		let self;		
	}

	constructor(DOM) {
		self = this;
		self.gridmax = gridmaxglobal;
		self.DOM = DOM;
		self.shipsInDOM = DOM.querySelectorAll('[name="ship"]');
		self.rotateshipInDOM = DOM.querySelector('#rotateship');
		self.pieces = [];
		self.pointsInDOM = DOM.querySelectorAll('.square');
		let axisX = []; /* letters across the top of the board */
		let axisY = []; /* numbers down the left side of the board */
		self.matrix = []; /* all available coordinates where shipsInDOM can be placed */
		self.matrixHorizontal = []; /* coordinates mapped from left to right, top to bottom */
		self.matrixVertical = []; /* coordinates mapped from top to bottom, left to right */
		self.matrixOrientation = self.matrixHorizontal; /* set the orientation for selecting coordinates of new ships */
		self.occupiedMatrix = []; /* coordinates occupied by pieces */
		self.shipsInDOM.forEach((ship) => {
			ship.addEventListener('change', setFromSelection);
		});
		var shipSizer = 0;
		var thisShip;
		var placementAllowed = true;
		function setFromSelection(shipChangeEvent) {
			shipSizer = shipChangeEvent.target.value;
			thisShip = shipChangeEvent.target;
		}
		self.rotateshipInDOM.addEventListener('click', function() {
			self.matrixOrientation == self.matrixHorizontal ? self.matrixOrientation = self.matrixVertical : self.matrixOrientation = self.matrixHorizontal
		});
		self.pointsInDOM.forEach((pointInDOM) => {
			// name the event handler so you can remove it on click
			var temporaryShipCoordinates = [];
			pointInDOM.addEventListener('mouseenter', function(event) {
				// reset temporaryShipCoordinates
				temporaryShipCoordinates = [];
				if (self.matrixOrientation == self.matrixHorizontal) {
					for (var i = 0;i < shipSizer;i++) {
						var x = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						var y = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						temporaryShipCoordinates.push([x,y]);
					}
					temporaryShipCoordinates.forEach((point) => {
						if (event.target.hasAttribute('data-save') || self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
							placementAllowed = false;
							console.clear();
							console.log('I made placementAllowed '+placementAllowed+' because',event.target, self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]'));
						}
					});
				} else if (self.matrixOrientation == self.matrixVertical) {
					for (var i = 0;i < shipSizer;i++) {
						x = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						y = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						temporaryShipCoordinates.push([x,y]);
					}
					temporaryShipCoordinates.forEach((point) => {
						if (event.target.hasAttribute('data-save') || self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
							placementAllowed = false;
							console.clear();
							console.log('I made placementAllowed '+placementAllowed+' because',event.target, self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]'));
						}
					});
				}
				if (placementAllowed != false) {
					for (var i = 0;i < shipSizer;i++) {
						if (self.matrixOrientation == self.matrixHorizontal) {
							var x = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
							var y = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
							self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').setAttribute('data-active', 'active');
						} else if (self.matrixOrientation == self.matrixVertical) {
							x = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
							y = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
							self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').setAttribute('data-active', 'active');					
						}
					}
				}
				console.log('end');
				console.log('placementAllowed: '+placementAllowed);
			});
			// name the event handler so you can remove it on click
			pointInDOM.addEventListener('mouseout', function(event) {
				event.target.removeAttribute('data-active');
				if (self.matrixOrientation == self.matrixHorizontal) {
					for (var i = 0;i < thisShip.value;i++) {
						var x = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						var y = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').removeAttribute('data-active');
					}
					temporaryShipCoordinates.forEach((point) => {
						if (!event.target.hasAttribute('data-save') && !self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
							placementAllowed = true;
						}
					});
				} else if (self.matrixOrientation == self.matrixVertical) {
					for (var i = 0;i < thisShip.value;i++) {
						x = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						y = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
						self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').removeAttribute('data-active');
					}
					temporaryShipCoordinates.forEach((point) => {
						if (!event.target.hasAttribute('data-save') || !self.DOM.querySelector('[data-coordinate="'+ point[0] +','+ point[1] +'"]').hasAttribute('data-save')) {
							placementAllowed = true;
						}
					});
				}
				// reset temporaryShipCoordinates
				temporaryShipCoordinates = [];
			});
			pointInDOM.addEventListener('click', function(event) {
				for (var i = 0;i < shipSizer;i++) {
					if (self.matrixOrientation == self.matrixHorizontal) {
						var x = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						var y = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
					} else if (self.matrixOrientation == self.matrixVertical) {
						var x = parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[0]);
						var y = i+parseInt(pointInDOM.attributes['data-coordinate'].nodeValue.split(',')[1]);
					}
				}
				if (!event.target.hasAttribute('data-save') && !self.DOM.querySelector('[data-coordinate="'+ x +','+ y +'"]').hasAttribute('data-save')) {
					var savedShipPoints = [];
					self.DOM.querySelectorAll('[data-active="active"]').forEach((activePoint) => {
						self.occupiedMatrix.push(activePoint.attributes['data-coordinate'].nodeValue);
						savedShipPoints.push(activePoint.attributes['data-coordinate'].nodeValue);
						activePoint.removeAttribute('data-active');
						activePoint.setAttribute('data-save', 'saved');
						activePoint.setAttribute('data-ship', thisShip.attributes['data-piece'].nodeValue);
					});
					console.log(self.occupiedMatrix);
					thisShip.checked = false;
					thisShip.setAttribute('disabled', 'disabled');
					thisShip.removeEventListener('change', setFromSelection);
					shipSizer = 0;
					var newPiece = new Piece(savedShipPoints, thisShip.attributes['data-piece'].nodeValue);
					self.pieces.push(newPiece);
					console.log(self.pieces);
				}
			});
		});
		// create two arrays containing equal number of numbers based on gridmax, which is set by gridmaxglobal
		for (var it = 0;it < self.gridmax;it++) {
			axisY.push(it+1);
			axisX.push(it+1);
		}
		for(var i = 0; i < axisY.length; i++) {
			for(var j = 0; j < axisX.length; j++) {
				self.matrix.push([axisY[j], axisX[i]]); /* push to main matrix */
				self.matrixHorizontal.push([axisY[j], axisX[i]]); /* push coordinates to alt matrixes */
				self.matrixVertical.push([axisY[i], axisX[j]]); /* push coordinates to alt matrixes */
				translate.push(String.fromCharCode(97+axisY[j]) + axisX[i]); /* push possible numer-letter combinations to array */
				translate.push(axisX[i] + String.fromCharCode(97+axisY[j])); /* push possible numer-letter combinations to array */
			}
		}
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

var playerBoard = new Board(document.querySelector('#app .board.player'));
