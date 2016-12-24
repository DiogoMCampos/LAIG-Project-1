function getPrologRequest(requestString, onSuccess, onError, port)
{
    var requestPort = port || 8081;
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:'+requestPort+'/'+requestString, true);

    request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
    request.onerror = onError || function(){console.log("Error waiting for response");};

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

function makeRequest(board, row, column)
{
    var requestString, closing;
    var side = row;
    if(column === undefined){
        requestString = "computer(";
        closing = "," + side + ")";
    } else{
        requestString = "player(";
        closing = "," + column + "," + line + ")";
    }
    // Get Parameter Values
    var boardString = boardString(board);

    requestString += boardString + closing;
    // Make Request
    getPrologRequest(requestString, handleReply);
}

//Handle the Reply
function handleReply(data){
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
