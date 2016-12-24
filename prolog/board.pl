:-use_module(library(lists)).
:-use_module(library(random)).
:-include('interface.pl').
:-include('utilities.pl').
:-include('movement.pl').

test:-boardStart(X), possibleMoves(X, 1, 1, _, Moves), write(Moves),nl.

boardStartIndex(1).

getPiece([X|Xs], ColumnIndex, LineIndex, Piece) :-
    getListElement(10-LineIndex, [X|Xs], 1, Line),
    getListElement(ColumnIndex, Line, 1, Piece),
    isPiece(Piece).

pushOpponents([], _) :- fail.
pushOpponents([_-_-Color-_|Rest],  Player) :-
    (Color \== Player ->
        true
    ;   pushOpponents(Rest, Player)).

housesAffected(_, _, _, _, _, 0, Affected, Affected, _).
housesAffected([X|Xs], Column, Line, HorMove, VertMove, Amount, Affected, Total, [Pieces|Rest]) :-
    boardSize(Size),
    withinBoard(Column, Line, Size) ->
        NewColumn is Column + HorMove,
        NewLine is Line + VertMove,
        (getPiece([X|Xs], Column, Line, Object) ->
            ((Affected - 1) >= 0 ->
                NewAffected is Affected - 1,
                NewAmount is Amount,
                pieceColor(Object, Color),
                returnResult(Pieces, Column-Line-Color-Amount),
                housesAffected([X|Xs], NewColumn, NewLine, HorMove, VertMove, NewAmount, NewAffected, Total, Rest)
            ;   !, fail)
        ;   NewAmount is Amount - 1,
            NewAffected is Affected,
            housesAffected([X|Xs], NewColumn, NewLine, HorMove, VertMove, NewAmount, NewAffected, Total, [Pieces|Rest]))
    ;   Total is Affected.

/* Saves all pieces coordinates from one player still in the game in a list. Returns num remaining pieces too*/
getPiecesCoordinates(Board, Column, Line, Side, [PieceCoords|Locals], PiecesLeft, PiecesTotal) :-
    boardSize(Size),
    (Column + 1 > Size ->
        NewCol is 1,
        NewLine is Line + 1
    ;   NewCol is Column + 1,
        NewLine is Line),
    (Line =< Size ->
        (getPiece(Board, Column, Line, Piece) ->
            pieceColor(Piece, Color),
            (Color == Side ->
                pieceHeight(Piece,Height),
                returnResult(PieceCoords, Column-Line-Height),
                NewPiecesLeft is PiecesLeft + 1,
                getPiecesCoordinates(Board, NewCol, NewLine, Side, Locals, NewPiecesLeft, PiecesTotal)
            ;   getPiecesCoordinates(Board, NewCol, NewLine, Side, [PieceCoords|Locals], PiecesLeft, PiecesTotal))
        ;   getPiecesCoordinates(Board, NewCol, NewLine, Side, [PieceCoords|Locals], PiecesLeft, PiecesTotal))
    ;   returnResult(PiecesLeft, PiecesTotal)).

verifyMove(Board,InC, InL, DeC, DeL, HorMove, VertMove, Player, PiecesAffected) :-
    boardSize(Size),
    withinBoard(InC, InL, Size),
    withinBoard(DeC, DeL, Size),
    isOrthogonal(InC, InL, DeC, DeL, HorMove, VertMove, Amount),
    getPiece(Board, InC, InL, Piece),
    pieceColor(Piece, Color),
    Color == Player,
    pieceHeight(Piece, Height),
    Height >= Amount,
    housesAffected(Board, InC, InL, HorMove, VertMove, Amount, Height + 1, InverseTotal, InvertedAffected),
    reverse(InvertedAffected, [_|PiecesAffected]),!,
    TotalAffected is Height + 1 -InverseTotal,
    (TotalAffected == 1 ->
        true
    ;   pushOpponents(PiecesAffected, Player)).

listPossible(Column, Line, HorMove, VertMove, Amount, [Move|Rest]) :-
    Amount > 0 ->
        NewAmount is Amount-1,
        DestCol is Column + HorMove * Amount,
        DestLin is Line + VertMove * Amount,
        returnResult(Column-Line-DestCol-DestLin, Move),
        listPossible(Column, Line, HorMove, VertMove, NewAmount, Rest)
    ;   true.

getPossibleDirection(_, _, _, _, _, 0,_, Total, Moves) :- Total is 0, returnResult(Moves, []).
getPossibleDirection(Board, Column, Line, HorMove, VertMove, Amount, PieceColor, Total, Moves) :-
    DestCol is Column + (HorMove * Amount),
    DestLin is Line + (VertMove * Amount),
    NewAmount is Amount - 1,
    (verifyMove(Board,Column,Line, DestCol, DestLin, _,_, PieceColor,_) ->
        Total is Amount,
        listPossible(Column, Line, HorMove, VertMove, Amount, Moves)
    ;   getPossibleDirection(Board, Column, Line, HorMove, VertMove, NewAmount,PieceColor, Total, Moves)).

possibleMoves(Board, Column, Line, Total, Possible) :-
    getPiece(Board, Column, Line, Piece),
    pieceHeight(Piece, Height),
    pieceColor(Piece, Color),
    getPossibleDirection(Board, Column, Line, -1,  0, Height, Color, Total1, Inverted1),
    getPossibleDirection(Board, Column, Line,  1,  0, Height, Color, Total2, Inverted2),
    getPossibleDirection(Board, Column, Line,  0, -1, Height, Color, Total3, Inverted3),
    getPossibleDirection(Board, Column, Line,  0,  1, Height, Color, Total4, Inverted4),
    Total is Total1 + Total2 + Total3 + Total4,
    (Total1 > 0 ->
        reverse(Inverted1, [_|Moves1])
    ;   returnResult(Moves1,[])),
    (Total2 > 0 ->
        reverse(Inverted2, [_|Moves2])
    ;   returnResult(Moves2,[])),
    (Total3 > 0 ->
        reverse(Inverted3, [_|Moves3])
    ;   returnResult(Moves3,[])),
    (Total4 > 0 ->
        reverse(Inverted4, [_|Moves4])
    ;   returnResult(Moves4,[])),
    append(Moves1, Moves2, SumMoves1),
    append(Moves3, Moves4, SumMoves2),
    append(SumMoves1, SumMoves2, Possible).

listAllMoves(_, [], TotalMoves, TotalMoves, Moves, Moves).
listAllMoves(Board, [Column-Line-_|Rest], NumTotal, TotalMoves, Moves, AllMoves) :-
    possibleMoves(Board, Column, Line, NumPossible, Possible),!,
    (NumPossible > 0 ->
        NewTotal is NumTotal + NumPossible,
        append(Moves, Possible, NewMoves),
        listAllMoves(Board, Rest, NewTotal, TotalMoves, NewMoves, AllMoves)
    ;   listAllMoves(Board, Rest, NumTotal, TotalMoves, NewMoves, AllMoves)).

allPossibleMoves(Board, Side, Total, Moves) :-
    getPiecesCoordinates(Board, 1, 1, Side, Over, 0, _),
    reverse(Over, [_|Coords]),
    listAllMoves(Board, Coords, 0, Total, [], Moves).

generateRandomMove(Board, Side, InC, InL, DeC, DeL) :-
    allPossibleMoves(Board, Side, NumMoves, AllMoves),
    random(0, NumMoves, Option),!,
    getListElement(Option, AllMoves, 0, InC-InL-DeC-DeL).

getComputerMove(Board, Color, HorMove, VertMove, PiecesToMove):-
    generateRandomMove(Board, Color, InC, InL, DeC, DeL),
    isOrthogonal(InC, InL, DeC, DeL, HorMove, VertMove, Amount),
    getPiece(Board, InC, InL, Piece),
    pieceHeight(Piece, Height),
    Affected is Height +1,
    housesAffected(Board, InC, InL, HorMove, VertMove, Amount, Affected, _, Pieces),
    reverse(Pieces, [_|PiecesToMove]).

analyseMove(Board, Player, HorMove, VertMove, PiecesAffected) :-
    askMove(InC, InL, DeC, DeL),
    letters(A),
    convertLetterToIndex(InC, A, 1, InColInd),
    convertLetterToIndex(DeC, A, 1, DeColInd),
    verifyMove(Board, InColInd, InL, DeColInd, DeL, HorMove, VertMove,Player, PiecesAffected).

updatePoints(_-P1Points,_-P2Points,[], P1Points, P2Points).
updatePoints(P1Color-P1Points, P2Color-P2Points, [Removed|Rest], NewP1Points, NewP2Points) :-
    pieceColor(Removed,Color),
    pieceHeight(Removed,Height),
    (Color == P1Color ->
        NewPoints is P1Points+Height,
        updatePoints(P1Color-NewPoints, P2Color-P2Points, Rest, NewP1Points, NewP2Points)
    ;   NewPoints is P2Points+Height,
        updatePoints(P1Color-P1Points, P2Color-NewPoints, Rest, NewP1Points, NewP2Points)).

finish(_-P1Points, _-P2Points) :-
    (P1Points >= 7; P2Points >= 7) ->
        true
    ;   fail.

vsComputer(Board, P1Color-P1Points,ComColor-ComPoints):-
    (analyseMove(Board, P1Color, HorMove, VertMove, PiecesToMove) ->
        move(Board, NewBoard, HorMove, VertMove, PiecesToMove, PiecesRemoved),
        updatePoints(P1Color-P1Points,ComColor-ComPoints, PiecesRemoved, NewP1P, NewComP),
        (finish(P1Color-NewP1P, ComColor-NewComP)->
            displayGameOver
        ;   (getComputerMove(NewBoard, ComColor, ComHor, ComVert, ComPieces),
            move(NewBoard, AfterBoard, ComHor, ComVert, ComPieces, ComRemoved),
            updatePoints(P1Color-NewP1P,ComColor-NewComP, ComRemoved, AfterP1P, AfterComP),
            (finish(P1Color-AfterP1P, ComColor-AfterComP) ->
                displayGameOver
            ;   displayBoard(AfterBoard, 9,9),
                vsComputer(AfterBoard, P1Color-AfterP1P,ComColor-AfterComP))))
    ;   vsComputer(Board, P1Color-P1Points,ComColor-ComPoints)).

vsHuman(Board, P1Color-P1Pts,P2Color-P2Pts) :-
    (analyseMove(Board, P1Color, HorMove, VertMove, PiecesToMove) ->
        move(Board, NewBoard, HorMove, VertMove, PiecesToMove, PiecesRemoved),
        updatePoints(P1Color-P1Pts,P2Color-P2Pts, PiecesRemoved, NewP1P, NewP2P),
        (finish(P1Color-NewP1P, P2Color-NewP2P)->
            displayGameOver
        ;(nl,displayBoard(NewBoard, 9,9),
        vsHuman(NewBoard, P2Color-NewP2P, P1Color-NewP1P)))
    ;   vsHuman(Board, P1Color-P1Pts,P2Color-P2Pts)).

comVScom(Board, P1Color-P1Pts,P2Color-P2Pts) :-
    (getComputerMove(Board, P1Color, HorMove, VertMove, PiecesToMove) ->
        write(HorMove-VertMove),nl,
        write(PiecesToMove),nl,
        move(Board, NewBoard, HorMove, VertMove, PiecesToMove, PiecesRemoved),
        updatePoints(P1Color-P1Pts,P2Color-P2Pts, PiecesRemoved, NewP1P, NewP2P),
        nl,displayBoard(NewBoard, 9,9),
        (finish(P1Color-NewP1P, P2Color-NewP2P)->
            displayGameOver
        ;comVScom(NewBoard, P2Color-NewP2P, P1Color-NewP1P))
    ;   comVScom(Board, P1Color-P1Pts,P2Color-P2Pts)).

singlePlayer :-
    setupGame(Board),
    vsComputer(Board, w-0, r-0).

multiPlayer :-
    setupGame(Board),
    vsHuman(Board, w-0, r-0).

noPlayer :-
    setupGame(Board),
    comVScom(Board, w-0, r-0).

/* main function */
oshi :-
    displayMenu,
    navigatingMenu(Choice),
    (Choice == 1 -> singlePlayer, oshi
    ;Choice == 2 -> multiPlayer, oshi
    ;Choice == 3 -> noPlayer, oshi
    ;Choice == 4 -> displayRules, oshi
    ;Choice == 5 -> write('Exiting Oshi. Hope you enjoyed yourself.\n\n')
    ;oshi).
