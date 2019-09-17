
const Piece = {
    Wall: "Wall",
    Food: "Food",
    Player: "Player",
};

function mkLocation(x,y) {
    return {x, y};
}

module.exports = {
    Piece,
    mkLocation
}