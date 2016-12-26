function getPrologRequest(requestString, onSuccess, onError, port){
    var requestPort = port || 8081;
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

    request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
    request.onerror = onError || function(){console.log("Error waiting for response");};

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

function makeRequest(scene, row, column, destRow, destColumn){
    var board = createBoard(scene);
    var boardStr = stringBoard(board);
    var requestString = "move(" + boardStr + "," + row;
    var affect = true;

    if(column !== undefined){
        requestString += "," + column;
        if(destRow !== undefined){
            requestString += "," + destRow + "," + destColumn;
        } else {
            affect = false;
        }
    }
    requestString += ")";

    if(scene.affect){
        getPrologRequest(requestString, getProlog);
    } else {
        getPrologRequest(requestString, getPrologMove);
    }
}

function createBoard(scene){
    var board = [];
    var l, cell;

    for (var i = 0; i < 9; i++) {
        board[i] = [];
        for (var j = 0; j < 9; j++)
            board[i].push("o");
    }
    for (l = 0; l < scene.rPieces.length; l++) {
        cell = scene.rPieces[l];
        if(withinBoard(cell))
            board[cell.line-1][cell.col-1] = cell;
    }
    for (l = 0; l < scene.wPieces.length; l++) {
        cell = scene.wPieces[l];
        if(withinBoard(cell))
            board[cell.line-1][cell.col-1] = cell;
    }
    return board;
}

function stringBoard(board){
    var cell,l,i,j;

    var string = "[";
    for (i = board.length-1; i >= 0; i--) {
        var b = board[i];
        string += "[";
        for (j = 0; j < b.length; j++) {
            if(b[j] === "o"){
                string += b[j];
            } else{
                string += "piece(" + b[j].id + "," + b[j].numFloors + ")";
            }
            if(j < b.length-1){
                string += ",";
            }
        }
        string += "]";
        if(i !== 0){
            string += ",";
        }
    }
    string += "]";
    return string;
}
