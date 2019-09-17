const index = require('./index');

const Piece = index.Piece

test('has game pieces', () => {
  expect(Piece.Wall).toBe("Wall");
  expect(Piece.Player).toBe("Player");
  expect(Piece.Food).toBe("Food");
  expect(Piece.OpenSpace).toBe("OpenSpace");
});

test('has Location', () => {
    const loc = index.mkLocation(1,2);
    expect(loc).toEqual({x: 1, y: 2})
})

test('can get new location from direction', () => {
  const loc = index.mkLocation(0,0);
  const mvLocation = index.mvLocation;
  const Direction = index.Direction;
  expect(mvLocation(loc, Direction.Up)).toEqual({x: 0, y: -1});
  expect(mvLocation(loc, Direction.Down)).toEqual({x: 0, y: 1});
  expect(mvLocation(loc, Direction.Left)).toEqual({x: -1, y: 0});
  expect(mvLocation(loc, Direction.Right)).toEqual({x: 1, y: 0});
});

test('get piece from a grid', () => {
  const getPiece = index.getPiece;
  const grid = [[Piece.Wall, Piece.Food],[Piece.Wall, Piece.Player]];
  const loc = index.mkLocation(0,0);
  expect(getPiece(loc, grid)).toBe(Piece.Wall);
})

test('cant move into walls', () => {
  const isValidMove = index.isValidMove;
  const wallLoc = index.mkLocation(1,0);
  const foodLoc = index.mkLocation(0,1);
  const grid = [[Piece.Wall, Piece.Food],[Piece.Wall, Piece.Player]];
  expect(isValidMove(wallLoc, grid)).toBe(false);
  expect(isValidMove(foodLoc, grid)).toBe(true);
});

test('should move player', () => {
  const Actions = index.Actions;
  const playerLocation = index.mkLocation(1,1);

  const grid = [[Piece.Wall, Piece.Food],[Piece.Wall, Piece.Player]];
  const grid1 = Actions.mvPlayerLeft(playerLocation, grid);

  expect(grid1).toEqual([[Piece.Wall, Piece.Player],[Piece.Wall, Piece.OpenSpace]]);
});
