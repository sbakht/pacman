function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

const Piece = {
    Wall: "Wall",
    Food: "Food",
    Player: "Player",
    OpenSpace: "OpenSpace",
};

// mkLocation: Int -> Int -> Location
function mkLocation(x,y) {
    return {x, y};
}

const Direction = {
  Up: 'Up',
    Down: 'Down',
    Left: 'Left',
    Right: 'Right',
};

// getPiece: Location -> Grid -> Piece
function getPiece({x, y}, grid) {
  return grid[x][y];
}

function mvLocation({x, y}, direction) {
  switch (direction) {
    case Direction.Up:
      return {x, y: y-1};
    case Direction.Down:
      return {x, y: y+1};
    case Direction.Left:
      return {x: x-1, y};
    case Direction.Right:
      return {x: x+1, y}
  }
}

// isValidMove: Location -> Grid -> Bool
function isValidMove(destination, grid) {
  const gridWidth = grid.length;
  const gridHeight = grid[0].length;
  if(destination.x < 0 || destination.x >= grid.length || destination.y < 0 || destination.y >= gridHeight) {
    return false;
  }
  return getPiece(destination, grid) !== Piece.Wall
}

function mvPiece(source, destination, oldGrid) {
  const grid = clone(oldGrid);
  grid[source.x][source.y] = Piece.OpenSpace;
  grid[destination.x][destination.y] = Piece.Player;
  return grid
}

function mvPlayer({playerLocation, grid}, direction) {
  const destination = mvLocation(playerLocation, direction);
  if(isValidMove(destination, grid)) {
    return {playerLocation: destination, grid: mvPiece(playerLocation, destination, grid)}
  }
  return {playerLocation, grid};
}

const Actions = {
  // mvPlayerLeft -> Model -> Model
  mvPlayerLeft: function (model) {
    return mvPlayer(model, Direction.Left)
  },
  mvPlayerRight: function (model) {
    return mvPlayer(model, Direction.Right)
  },
  mvPlayerUp: function (model) {
    return mvPlayer(model, Direction.Up)
  },
  mvPlayerDown: function (model) {
    return mvPlayer(model, Direction.Down)
  }
}

module.exports = {
    Piece,
    Direction,
    mkLocation,
    mvLocation,
    getPiece,
    isValidMove,
    mvPiece,
    Actions,
}