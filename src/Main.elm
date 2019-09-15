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

type Piece = Wall | Player | OpenSpace | Food | HiddenWall

type alias Grid = Array (Array Piece)

grid : Grid
grid = fromList <| List.map fromList (mkGrid gridSource)

mkGrid : String -> List (List Piece)
mkGrid str = List.foldr (List.map2 (\a b -> charToPiece a :: b) ) (List.repeat gWidth []) (List.map String.toList <| String.lines str)

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
    'W' -> Wall
    'P' -> Player
    'O' -> OpenSpace
    'F' -> Food
    'H' -> HiddenWall
    _ -> Wall

---- UPDATE ----

pieceToChar : Piece -> String
pieceToChar p = case p of
    Wall -> "☐"
    Player -> "P"
    OpenSpace -> "O"
    Food -> "F"
    HiddenWall -> "☐"

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
                validMove = isValidMove Player (mbGetPiece possibleDestination model.grid)

                newGrid = mkValidMove model.playerLocation possibleDestination Player model.grid
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
setPiece (x,y) piece gr =
    case Array.get x gr of
        Just oldInner ->
            let
                newInner = Array.set y piece oldInner
            in
                Array.set x newInner gr
        Nothing ->
           gr

mvPiece : Point -> Point -> Piece -> Grid -> Grid
mvPiece (x1,y1) (x2,y2) piece gr = setPiece (x2,y2) piece <| setPiece (x1,y1) OpenSpace gr

mbGetPiece : Point -> Grid -> Maybe Piece
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



isValidMove : Piece -> Maybe Piece -> Bool
isValidMove p1 p2 = case p2 of
    Nothing -> False
    Just Wall -> False
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

viewGridColumn : Array Piece -> Html Msg
viewGridColumn = div [class "grid-column"] << Array.toList << Array.map (viewPiece)

viewPiece : Piece -> Html Msg
viewPiece p = span [] [text (pieceToChar p)]

---- PROGRAM ----


main : Program () Model Msg
main =
    Browser.element
        { view = view
        , init = \_ -> init
        , update = update
        , subscriptions = subscriptions
        }
