function getPrologRequest(requestString, onSuccess, onError, port){
    var requestPort = port || 8081;
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

    request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
    request.onerror = onError || function(){console.log("Error waiting for response");};

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

function makeRequest(board, row, column, destRow, destColumn){
    var boardString = boardString(board);
    var requestString = "move(" + boardString + "," + row;
    var affect = true;

    if(column !== undefined){
        requestString = "," + column;

        if(destRow !== undefined){
            requestString += "," + destRow + "," + destColumn;
        } else {
            affect = false;
        }
    }
    requestString += ")";

    if(affect){
        getPrologRequest(requestString, handleAffectedReply);
    } else {
        getPrologRequest(requestString, handlePossibleReply);
    }
}

//Handle the Reply when it wants to get pieces affected by the move
function handleAffectedReply(data){
    console.log(data);
    document.querySelector("#query_result").innerHTML=data.target.response;

}

//Handle the Reply when it wants to get possible movements of the piece
function handlePossibleReply(data){
    console.log(data);
    document.querySelector("#query_result").innerHTML=data.target.response;

}

function boardString(board){
    var string = "[";
    for (var i = 0; i < board.length; i++) {
        var b = board[i];
        string += "[";
        for (var j = 0; j < b.length; j++) {
            string += b[j];
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
