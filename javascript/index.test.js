const index = require('./index');

const Piece = index.Piece
const toCells = index.toCells;

function nuller(piece) {
    return {piece, alive: null}
}

function playerOn(piece) {
    return {piece, alive: Piece.Player};
}

test('has game pieces', () => {
  expect(Piece.Wall).toBe("Wall");
  expect(Piece.Player).toBe("Player");
  expect(Piece.Food).toBe("Food");
  expect(Piece.OpenSpace).toBe("OpenSpace");
  expect(Piece.HiddenWall).toBe("HiddenWall");
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
  const grid = toCells([[Piece.Wall, Piece.Food],[Piece.Wall, Piece.Player]]);
  const loc = index.mkLocation(0,0);
  expect(getPiece(loc, grid)).toEqual(nuller(Piece.Wall));
})

test('cant move into walls', () => {
  const isValidMove = index.isValidMove;
  const wallLoc = index.mkLocation(1,0);
  const foodLoc = index.mkLocation(0,1);
  const grid = toCells([[Piece.Wall, Piece.Food],[Piece.Wall, Piece.Player]]);
  expect(isValidMove(wallLoc, grid)).toBe(false);
  expect(isValidMove(foodLoc, grid)).toBe(true);
});

test('should move player onto moveable spaces', () => {
  const Actions = index.Actions;
  const playerLocation = index.mkLocation(1,1);
  const grid = toCells([[Piece.Wall, Piece.Food],[Piece.Wall, Piece.Player]]);

  const initModel = {
    playerLocation,
    grid,
  };

  const model1 = Actions.mvPlayerLeft(initModel);
  const model2 = Actions.mvPlayerRight(model1);

  expect(model1.grid).toEqual([[nuller(Piece.Wall), playerOn(Piece.Food)],[nuller(Piece.Wall), nuller(Piece.OpenSpace)]]);
  expect(model1.playerLocation).toEqual({x: 0, y: 1});

  expect(model2.grid).toEqual([[nuller(Piece.Wall), nuller(Piece.OpenSpace)],[nuller(Piece.Wall), playerOn(Piece.OpenSpace)]]);
  expect(model2.playerLocation).toEqual({x: 1, y: 1});
});

test('should not be able to go out of bounds', () => {
  const Actions = index.Actions;
  const playerLocation = index.mkLocation(1,1);
  const grid = [[Piece.Player]];

  const initModel = {
    playerLocation,
    grid,
  };

  const rightBound = Actions.mvPlayerRight(initModel);
  const downBound = Actions.mvPlayerDown(initModel);
  const leftBound = Actions.mvPlayerLeft(initModel);
  const upBound = Actions.mvPlayerUp(initModel);

  expect(rightBound).toEqual(initModel);
  expect(downBound).toEqual(initModel);
  expect(leftBound).toEqual(initModel);
  expect(upBound).toEqual(initModel);
});

//test('should not be able to go out of bounds', () => {
//  const Actions = index.Actions;
//  const playerLocation = index.mkLocation(0,0);
//  const grid = [[Piece.Player, Piece.HiddenWall, Piece.OpenSpace]];
//
//  const initModel = {
//    playerLocation,
//    grid,
//  };
//
//  const model = Actions.mvPlayerDown(Actions.mvPlayerDown(initModel));
//
//  expect(model.grid).toEqual([[Piece.OpenSpace, Piece.HiddenWall, Piece.Player]]);
//  expect(model.playerLocation).toEqual({x: 0, y: 2})
//});
