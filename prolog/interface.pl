board([[o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o]]).

boardStart([[piece(r, 3),o, o, o, o, o, o, o, piece(r, 3)],
            [o, o, piece(r, 2), piece(r, 1), piece(r, 1), piece(r, 1), piece(r, 2), o, o],
            [o, o, o, o, piece(r, 1), o, o, o, o],
            [o, o, o, o, o, o, o, o, o],
            [o, o, o, o, o, o, o, o, o],
            [o, o, o, o, o, o, o, o, o],
            [o, o, o, o, piece(w, 1), o, o, o, o],
            [o, o, piece(w, 2), piece(w, 1), piece(w, 1), piece(w, 1), piece(w, 2), o, o],
            [piece(w, 3), o, o, o, o, o, o, o, piece(w, 3)]]).

boardMidGame([[o, o, o, o, o, o, o, o, o],
              [o, piece(r, 1), o, o, o, o, o, o, o],
              [o, o, o, o, piece(r, 1), o, o, o, o],
              [o, o, o, piece(r, 3), o, o, o, o, o],
              [o, o, o, o, o, o, piece(w, 2), o, o],
              [o, o, o, piece(w, 3), o, piece(r, 1), o, o, o],
              [o, o, piece(r, 3), o, o, o, o, o, o],
              [o, o, o, o, o, piece(w, 3), piece(w, 1), piece(r, 2), piece(r, 2)],
              [o, o, piece(w, 1), piece(w, 1), o, o, o, o, piece(w, 2)]]).

boardEndGame([[o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, piece(r, 1), o, o, o, o],
    [o, o, o, o, o, o, o, o, o],
    [o, o, o, o, o, o, piece(w, 2), o, o],
    [o, o, o, o, o, piece(r, 1), o, o, o],
    [o, o, piece(r, 3), o, o, o, o, o, o],
    [o, o, o, o, o, piece(w, 3), o, piece(r, 2), piece(r, 2)],
    [o, o, piece(w, 1), piece(w, 1), o, o, o, o, o]]).

letters(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']).

pieceHeight(piece(_, Height), Height).
pieceColor(piece(Color, _), Color).
boardSize(9).

translate(o) :- write(' ').
translate(piece(w, 3)) :- write('O').
translate(piece(w, 2)) :- write('o').
translate(piece(w, 1)) :- write('.').
translate(piece(r, 3)) :- write('X').
translate(piece(r, 2)) :- write('x').
translate(piece(r, 1)) :- write('*').

displayCol(_, 0) :- nl.
displayCol([X|Xs], I) :-
    Next is I-1,
    write('  '),
    write(X),
    write(' '),
    displayCol(Xs, Next).

displayLine(_, _, 0) :-
    write(' | '),
    nl.
displayLine([X|Xs], N, R) :-
    R1 is R-1,
    write(' | '),
    translate(X),
    displayLine(Xs, N, R1).

displaySeparator(_, 0) :- write('+').
displaySeparator(N, R) :-
    R1 is R-1,
    write('+---'),
    displaySeparator(N, R1).

displayBoard(_, N, 0) :-
    write('   '),
    displaySeparator(N, N),
    nl,
    write('   '),
    letters(A),
    displayCol(A, N).
displayBoard([L|Ls], N, R) :-
    R1 is R-1,
    write('   '),
    displaySeparator(N, N),
    nl,
    write(' '),
    write(R),
    displayLine(L, N, N),
    displayBoard(Ls, N, R1).

setupGame(X) :-
    boardStart(X),
    boardSize(Size),
    displayBoard(X, Size,Size).

midGame(X) :-
    boardMidGame(X),
    boardSize(Size),
    displayBoard(X, Size, Size).

end(X) :-
    boardEndGame(X),
    boardSize(Size),
    displayBoard(X, Size,Size).

askPlayerMove(InC, InL, DeC, DeL) :-
    flush_output,
    write('Coordinates of the piece to move (ex: \'D3\'.)'),
    nl,
    read(Input),
    atom_chars(Input, [InC|InLString]),
    number_chars(InL, InLString),
    write('Coordinates of the pieces destination (ex: \'F3\'.)'),
    nl,
    read(Dest),
    atom_chars(Dest, [DeC|DeLString]),
    number_chars(DeL, DeLString).

askMove(A,B,C,D) :- catch(askPlayerMove(A,B,C,D), _, askMove(A,B,C,D)).

navigatingMenu(Choice) :-
    flush_output,
    catch(read(Input), _, navigatingMenu(Choice)),
    integer(Input) -> Choice is Input
    ;navigatingMenu(Choice).

displayGameOver :-
    write('\nGame over pleasy come again.\n').

displayRules :-
    write('In Oshi the goal is to knock the opponents piece\'s off the board.\n'),
    write('The first player to take out 7 points worth of pieces wins.\n'),
    write('Each piece\'s points corresponds to the number of floors it contains.\n'),
    write('Each side has 2 pieces of 3 floors, 2 of 2 floors and 4 pieces of 1 floor.\n'),
    write('A player can only move one piece per turn. It must be horizontal or vertical but not both.\n'),
    write('The piece can move a maximum of houses equal to its number of floors.\n'),
    write('You can push your opponent\'s pieces, or a combination of both.\n'),
    write('Each time you push one of your opponent\'s pieces off the board, you claim it and place it off to the side of your side of the game board.\n'),
    write('If you push a combination of your pieces and your opponent\'s pieces off the board, \nyou claim you opponent\'s pieces and he or she claims yours.\n'),
    write('Each piece can push a number of other pieces equal to its number of floors.\n'),
    write('\n').

displayMenu :-
    write('\nWelcome to Oshi'), nl,
    write('Please select one of the options from 1 to 4'),nl,
    write('1. VS Computer          2. VS Player         3. Com VS Com           4. Rules            5. Exit\n\n').
