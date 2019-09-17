const index = require('./index');

const Piece = index.Piece

test('has game pieces', () => {
  expect(Piece.Wall).toBe("Wall");
  expect(Piece.Player).toBe("Player");
  expect(Piece.Food).toBe("Food");
});

test('has Location', () => {
    const loc = index.mkLocation(1,2);
    expect(loc).toEqual({x: 1, y: 2})
})

test('can go up', () => {

});