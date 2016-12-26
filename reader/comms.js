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

    getPrologRequest(requestString, getProlog);

    // if(affect){
    //     getPrologRequest(requestString, handleAffectedReply);
    // } else {
    //     getPrologRequest(requestString, handlePossibleReply);
    // }
}

//Handle the Reply when it wants to get pieces affected by the move
function handleAffectedReply(data){

    var response = data.target.response;
    var pos = response.indexOf("[")+1;
    var slice = response.slice(pos, response.length-1);

    var npos = slice.indexOf("[")+1;
    var pieces = slice.slice(npos, slice.length-1);
    var mov = slice.slice(0, npos-2);
    var movArr = mov.split(",");
    console.log(movArr);
    var arr = pieces.split(",");
    console.log(arr);

}

//Handle the Reply when it wants to get possible movements of the piece
function handlePossibleReply(data){
    console.log(data);
    document.querySelector("#query_result").innerHTML=data.target.response;

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
        board[cell.line-1][cell.col-1] = cell;
    }
    for (l = 0; l < scene.wPieces.length; l++) {
        cell = scene.wPieces[l];
        board[cell.line-1][cell.col-1] = cell;
    }
    return board;
}

function stringBoard(board){
    var cell,l,i,j;

    var string = "[";
    for (i = 0; i < board.length; i++) {
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
        if(i < board.length-1){
            string += ",";
        }
    }
    string += "]";
    return string;
}
