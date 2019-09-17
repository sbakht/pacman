
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
  return getPiece(destination, grid) !== Piece.Wall
}

function mvPiece(source, destination, grid) {
  grid[source.x][source.y] = Piece.OpenSpace;
  grid[destination.x][destination.y] = Piece.Player;
  return grid
}

const Actions = {
  mvPlayerLeft: function (playerLocation, grid) {
    const destination = mvLocation(playerLocation, Direction.Left);
    return mvPiece(playerLocation, destination, grid)
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