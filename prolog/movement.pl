getOutsideBoard([], _).
getOutsideBoard([Pair|PairRest], [Removed|RemovedRest]) :-
    getFirstValuePair(Pair, Place),
    (Place > 9 ->
        getSecondValuePair(Pair, Piece),
        Removed = Piece,
        getOutsideBoard(PairRest, RemovedRest)
    ;   (Place < 1 ->
            getSecondValuePair(Pair, Piece),
            Removed = Piece,
            getOutsideBoard(PairRest, RemovedRest)))
    ;  getOutsideBoard(PairRest, [Removed|RemovedRest]).

createHorOriginPair(Column-_-_-Amount, Column-Amount).
createVerOriginPair(_-Line-_-Amount, Line-Amount).
createDestPair(Column-Piece, Column, Piece).

createHorizontalPairs([],[]).
createHorizontalPairs([Move|Rest], [P|Ps]) :-
    createHorOriginPair(Move, P),
    createHorizontalPairs(Rest, Ps).

createVerticalPairs([],[]).
createVerticalPairs([Move|Rest], [P|Ps]) :-
    createVerOriginPair(Move, P),
    createVerticalPairs(Rest, Ps).

getMoveLine([_-Line-_-_|_], Line).
getMoveColumn([Column-_-_-_|_], Column).

deletePieces(_, _, _, [], Pieces, Pieces, 0).
deletePieces(X, Comparable, Direction, [Piece|Rest], Pieces, NewPieces, Deleted) :-
    getFirstValuePair(Piece, Value),
    Comparable == Value ->
        getSecondValuePair(Piece, Amount),
        (Direction > 0 ->
            Dest is Value + Amount
        ;   Dest is Value - Amount),
        createDestPair(Pair, Dest, X),
        addToList(Pair, Pieces, NewPieces),
        Deleted is 1
    ;   deletePieces(X, Comparable, Direction, Rest, Pieces, NewPieces, Deleted).

addPieces(_, o, _, [], 1).
addPieces(X, X, _, [], 0).
addPieces(X, N, Comparable, [Piece|Rest], Deleted) :-
    getFirstValuePair(Piece, Value),
    Comparable == Value ->
        getSecondValuePair(Piece, Object),
        N = Object
    ;   addPieces(X, N, Comparable, Rest, Deleted).

moveHorAuxiliar(_,_,_,_,0,_,_).
moveHorAuxiliar([X|Xs], [N|Ns], MovePairs, MoveLine, CurrLine, Direction, Removed) :-
    (CurrLine == MoveLine ->
        (Direction > 0 ->
            moveLineHorizontal(X, N, 1, Direction, MovePairs, [], Removed)
        ;   reverse(X, TempLine),
            moveLineHorizontal(TempLine, TempN, 9, Direction, MovePairs, [], Removed),
            reverse(TempN, N))
    ;   returnResult(X, N)),
    NextLine is CurrLine - 1,
    moveHorAuxiliar(Xs, Ns, MovePairs, MoveLine, NextLine, Direction, Removed).

moveLineHorizontal([],_,_,_,_, Pieces, Pieces).
moveLineHorizontal([X|Xs], [N|Ns], CurrC, Direction, PiecesToMove, Pieces, Removed) :-
    deletePieces(X, CurrC, Direction, PiecesToMove, Pieces, NewPieces, Deleted),
    addPieces(X, N, CurrC, NewPieces, Deleted),
    (Direction > 0 ->
        NextC is CurrC + 1
    ;   NextC is CurrC - 1),
    moveLineHorizontal(Xs, Ns, NextC, Direction, PiecesToMove, NewPieces, Removed).

moveVerAuxiliar([],_,_,_,_,_,Pieces, Pieces).
moveVerAuxiliar([X|Xs], [N|Ns], MovePairs, MoveColumn, CurrLine, Direction, Pieces, Removed) :-
    moveLineVertical(X, N, 1, CurrLine, MoveColumn, Direction, MovePairs, Pieces, NewPieces),
    (Direction > 0 ->
        NextLine is CurrLine + 1
    ;   NextLine is CurrLine - 1),
    moveVerAuxiliar(Xs, Ns, MovePairs, MoveColumn, NextLine, Direction, NewPieces, Removed).

moveLineVertical([],_,_,_,_,_,_,Pieces,Pieces).
moveLineVertical([X|Xs], [N|Ns], CurrC, CurrL, MoveColumn, Direction, PiecesToMove, Pieces, NewPieces) :-
(CurrC =\= MoveColumn ->
    N = X,
    NextPieces = Pieces
;   deletePieces(X, CurrL, Direction, PiecesToMove, Pieces, NextPieces, Deleted),
    addPieces(X, N, CurrL, NextPieces, Deleted)),
NextC is CurrC + 1,
moveLineVertical(Xs, Ns, NextC, CurrL, MoveColumn, Direction, PiecesToMove, NextPieces, NewPieces).

moveHorizontal(X, N, MoveList, Direction, Removed) :-
    createHorizontalPairs(MoveList, Pairs),
    getMoveLine(MoveList, MoveLine),
    moveHorAuxiliar(X, N, Pairs, MoveLine, 9, Direction, MovedList),
    getOutsideBoard(MovedList, Outside), reverse(Outside, [_|Removed]).

moveVertical(X, N, MoveList, Direction, Removed) :-
    createVerticalPairs(MoveList, Pairs),
    getMoveColumn(MoveList, MoveColumn),
    (Direction > 0 ->
        reverse(X, TempX),
        moveVerAuxiliar(TempX, TempN, Pairs, MoveColumn, 1, Direction, [], MovedList),
        reverse(TempN, N),
        getOutsideBoard(MovedList, Outside), reverse(Outside, [_|Removed])
    ;   moveVerAuxiliar(X, N, Pairs, MoveColumn, 9, Direction, [], MovedList)),
        getOutsideBoard(MovedList, Outside), reverse(Outside, [_|Removed]).

move(Board, NewBoard, HorMove, VertMove, PiecesToMove, PiecesRemoved) :-
    HorMove == 0 ->
        moveVertical(Board, NewBoard, PiecesToMove, VertMove, PiecesRemoved)
    ;   moveHorizontal(Board, NewBoard, PiecesToMove, HorMove, PiecesRemoved).
