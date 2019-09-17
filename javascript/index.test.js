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

test('should move player onto moveable spaces', () => {
  const Actions = index.Actions;
  const playerLocation = index.mkLocation(1,1);
  const grid = [[Piece.Wall, Piece.Food],[Piece.Wall, Piece.Player]];

  const initModel = {
    playerLocation,
    grid,
  };

  const model1 = Actions.mvPlayerLeft(initModel);
  const model2 = Actions.mvPlayerRight(model1);

  expect(model1.grid).toEqual([[Piece.Wall, Piece.Player],[Piece.Wall, Piece.OpenSpace]]);
  expect(model1.playerLocation).toEqual({x: 0, y: 1});

  expect(model2.grid).toEqual([[Piece.Wall, Piece.OpenSpace],[Piece.Wall, Piece.Player]]);
  expect(model2.playerLocation).toEqual({x: 1, y: 1});
});

test('should not be able to go out of bounds', () => {
  const Actions = index.Actions;
  const playerLocation = index.mkLocation(1,1);
  const grid = [[Piece.OpenSpace, Piece.OpenSpace],[Piece.OpenSpace, Piece.Player]];

  const initModel = {
    playerLocation,
    grid,
  };

  const rightBound = Actions.mvPlayerRight(initModel);
  const downBound = Actions.mvPlayerDown(initModel);
  const leftBound = Actions.mvPlayerLeft(Actions.mvPlayerLeft(initModel));
  const upBound = Actions.mvPlayerUp(Actions.mvPlayerUp(initModel));

  expect(rightBound).toEqual(initModel);
  expect(downBound).toEqual(initModel);
  expect(leftBound).toEqual({playerLocation: {x: 0, y: 1}, grid: [[Piece.OpenSpace, Piece.Player], [Piece.OpenSpace, Piece.OpenSpace]]});
  expect(upBound).toEqual({playerLocation: {x: 1, y: 0}, grid: [[Piece.OpenSpace, Piece.OpenSpace], [Piece.Player, Piece.OpenSpace]]});
});
