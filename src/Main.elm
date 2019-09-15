module Main exposing (..)

import Browser
import Html exposing (Html, text, div, h1, img, span)
import Html.Attributes exposing (src, class)
import Array exposing (Array, fromList)
import Keyboard exposing (Key(..))
import Keyboard.Arrows

gWidth: Int
gWidth = Maybe.withDefault 0 <| List.maximum <| List.map String.length (String.lines gridSource)
gHeight = List.length <| String.lines gridSource


---- MODEL ----


type alias Model =
    { pressedKeys : List Key, playerLocation: Point, grid: Grid}


init : ( Model, Cmd Msg )
init =
    ( {pressedKeys = [], playerLocation = (3,5), grid = grid}, Cmd.none )

type Piece = SolidPiece SolidPiece | TraversablePiece TraversablePiece | AlivePiece AlivePiece

type SolidPiece = Wall
type TraversablePiece = OpenSpace | Food | HiddenWall
type AlivePiece = Player

type alias Grid = Array (Array Cell)

type alias Cell = (Piece, Maybe AlivePiece)

grid : Grid
grid = fromList <| List.map fromList (mkGrid gridSource)

mkGrid : String -> List (List Cell)
mkGrid str = List.foldr (List.map2 (\a b -> (pieceToCell <| charToPiece a) :: b) ) (List.repeat gWidth []) (List.map String.toList <| String.lines str)

gridSource = String.dropRight 1 <| String.dropLeft 1 <| """
WWWWWWWWWWW
FFFWFFFFFFW
FFFWFFFFFFW
FFFHFFFFFFW
WWWWFFFFFFW
OOOPFFFFFFW
"""

charToPiece : Char -> Piece
charToPiece c = case c of
    'W' -> SolidPiece Wall
    'P' -> AlivePiece Player
    'O' -> TraversablePiece OpenSpace
    'F' -> TraversablePiece Food
    'H' -> TraversablePiece HiddenWall
    _ -> SolidPiece Wall

pieceToCell : Piece -> Cell
pieceToCell p = case p of
    AlivePiece Player -> (TraversablePiece OpenSpace, Just Player)
    _ -> (p, Nothing)

---- UPDATE ----

pieceToChar : Piece -> String
pieceToChar p = case p of
    SolidPiece Wall -> "☐"
    AlivePiece Player -> "P"
    TraversablePiece OpenSpace -> "O"
    TraversablePiece Food -> "F"
    TraversablePiece HiddenWall -> "☐"

cellToChar : Cell -> String
cellToChar cell = case cell of
    (_, Just Player) -> "P"
    (x,_) -> pieceToChar x

type Msg
    = KeyMsg Keyboard.Msg

type alias Point = (Int, Int)

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        KeyMsg keyMsg ->
            let
                pressedKeys = Keyboard.update keyMsg model.pressedKeys


                possibleDestination : Point
                possibleDestination = case Keyboard.Arrows.wasdDirection pressedKeys of
                    Keyboard.Arrows.North -> mvLocUp model.playerLocation
                    Keyboard.Arrows.East -> mvLocRight model.playerLocation
                    Keyboard.Arrows.South -> mvLocDown model.playerLocation
                    Keyboard.Arrows.West -> mvLocLeft model.playerLocation
                    _ -> model.playerLocation

                validMove : Bool
                validMove = isValidMove (AlivePiece Player) (mbGetPiece possibleDestination model.grid)

                newGrid = mkValidMove model.playerLocation possibleDestination (AlivePiece Player) model.grid
            in
                (
                    if validMove then
                        { model | pressedKeys = pressedKeys, grid = newGrid, playerLocation = possibleDestination}
                    else
                        { model | pressedKeys = pressedKeys, grid = newGrid}
                , Cmd.none
                )

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map KeyMsg Keyboard.subscriptions ]

mvLocLeft : Point -> Point
mvLocLeft (x,y) = case x of
    0 -> (0, y)
    _ -> (x - 1, y)

mvLocRight : Point -> Point
mvLocRight (x,y) = case x == (gWidth - 1) of
    True -> (x, y)
    False -> (x + 1, y)

mvLocUp : Point -> Point
mvLocUp (x,y) = case y of
    0 -> (x, 0)
    _ -> (x, y - 1)

mvLocDown : Point -> Point
mvLocDown (x,y) = case y == (gHeight - 1) of
    True -> (x, y)
    False -> (x, y + 1)

setPiece : Point -> Piece -> Grid -> Grid
setPiece (x,y) piece gr = case piece of
    AlivePiece Player ->
        setPlayerPiece (x,y) gr
    _ -> case Array.get x gr of
        Just oldInner ->
            let
                newInner = Array.set y (piece, Nothing) oldInner
            in
                Array.set x newInner gr
        Nothing ->
           gr

setPlayerPiece : Point -> Grid -> Grid
setPlayerPiece (x,y) gr =
    case Array.get x gr of
        Just oldInner ->
            case Array.get y oldInner of
                Just (piece, _) ->
                    let
                        newInner = Array.set y (piece, Just Player) oldInner
                    in
                        Array.set x newInner gr
                Nothing ->
                    gr
        Nothing ->
           gr

mvPiece : Point -> Point -> Piece -> Grid -> Grid
mvPiece (x1,y1) (x2,y2) piece gr = setPiece (x2,y2) piece <| setPiece (x1,y1) (mkWalkedPiece <| mbGetPiece (x1,y1) gr) gr

setWalkedCell : Point -> Grid -> Grid
setWalkedCell (x,y) gr = case Array.get x gr of
        Just oldInner ->
            case Array.get y oldInner of
                Just (piece, _) ->
                    let
                        newInner = Array.set y (piece, Just Player) oldInner
                    in
                        Array.set x newInner gr
                Nothing ->
                    gr
        Nothing ->
           gr

mkWalkedPiece : Maybe Cell -> Piece
mkWalkedPiece mbCell = case mbCell of
    Just (TraversablePiece HiddenWall, _) -> TraversablePiece HiddenWall
    Just _ -> TraversablePiece OpenSpace
    Nothing -> TraversablePiece OpenSpace

mbGetPiece : Point -> Grid -> Maybe Cell
mbGetPiece (x,y) gr =
    case Array.get x gr of
        Just inner ->
            Array.get y inner
        Nothing ->
            Nothing

mkValidMove : Point -> Point -> Piece -> Grid -> Grid
mkValidMove origin destination piece gr = if isValidMove piece (mbGetPiece destination gr) then
        mvPiece origin destination piece gr
    else
        gr



isValidMove : Piece -> Maybe Cell -> Bool
isValidMove p1 p2 = case p2 of
    Nothing -> False
    Just (SolidPiece _, _) -> False
    _ -> True


---- VIEW ----


view : Model -> Html Msg
view model =
    div []
        [ img [ src "/logo.svg" ] []
        , h1 [] [ text "Your Elm App is working!" ]
        , viewGrid model.grid
        , div [] [text <| Debug.toString <| Keyboard.Arrows.wasdDirection model.pressedKeys]
        ]

viewGrid : Grid -> Html Msg
viewGrid =  div [class "grid" ] << Array.toList << Array.map (viewGridColumn)

viewGridColumn : Array Cell -> Html Msg
viewGridColumn = div [class "grid-column"] << Array.toList << Array.map (viewPiece)

viewPiece : Cell -> Html Msg
viewPiece cell = span [] [text (cellToChar cell)]

---- PROGRAM ----


main : Program () Model Msg
main =
    Browser.element
        { view = view
        , init = \_ -> init
        , update = update
        , subscriptions = subscriptions
        }
