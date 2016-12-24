getFirstValuePair(Value-_, Value).
getSecondValuePair(_-Value, Value).

addToList(Element, List, [Element|List]).

getListElement(Index, [X|Xs], Iterator, Result) :-
    Index =\= Iterator ->
        NewIterator is Iterator+1,
        getListElement(Index, Xs, NewIterator, Result)
    ;   returnResult(X, Result).

returnResult(Result, Result).

withinBoard(X, Y, Size) :-
    X > 0,
    X =< Size,
    Y > 0,
    Y =< Size.

isPiece(piece(_,_)).

convertLetterToIndex(Column, [X|Xs], Index, Result) :-
    Column \== X ->
        NewIndex is Index+1,
        convertLetterToIndex(Column, Xs, NewIndex, Result);
    returnResult(Index, Result).

isOrthogonal(InC, InL, DeC, DeL, HorMove, VertMove, Amount) :-
    (InC == DeC ->
        HorMove is 0,
        (InL > DeL ->
            Amount is InL - DeL,
            VertMove is -1
        ;   InL < DeL ->
                Amount is DeL - InL,
                VertMove is 1))
    ;   (InL == DeL ->
        VertMove is 0,
        (InC > DeC ->
            Amount is InC - DeC,
            HorMove is -1
        ;   InC < DeC ->
                Amount is DeC - InC,
                HorMove is 1)).
