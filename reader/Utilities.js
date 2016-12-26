var parseRectangle = function(reader, id, xmlNode){
    var coordinates = {};
    coordinates.x1 = reader.getFloat(xmlNode, "x1");
    coordinates.y1 = reader.getFloat(xmlNode, "y1");
    coordinates.x2 = reader.getFloat(xmlNode, "x2");
    coordinates.y2 = reader.getFloat(xmlNode, "y2");

    for (var coord in coordinates) {
        if (coordinates.hasOwnProperty(coord)) {
            if(coordinates[coord] === null || isNaN(coordinates[coord])){
                throw "primitive id: " + id + " has " + coord + " value not recognized";
            }
        }
    }
    return coordinates;
};

var parseTriangle = function(reader, id, xmlNode){
    var coordinates = {};
    coordinates.x1 = reader.getFloat(xmlNode, "x1");
    coordinates.y1 = reader.getFloat(xmlNode, "y1");
    coordinates.z1 = reader.getFloat(xmlNode, "z1");
    coordinates.x2 = reader.getFloat(xmlNode, "x2");
    coordinates.y2 = reader.getFloat(xmlNode, "y2");
    coordinates.z2 = reader.getFloat(xmlNode, "z2");
    coordinates.x3 = reader.getFloat(xmlNode, "x3");
    coordinates.y3 = reader.getFloat(xmlNode, "y3");
    coordinates.z3 = reader.getFloat(xmlNode, "z3");

    for (var coord in coordinates) {
        if (coordinates.hasOwnProperty(coord)) {
            if(coordinates[coord] === null || isNaN(coordinates[coord])){
                throw "primitive id: " + id + " has " + coord + " value not recognized";
            }
        }
    }
    return coordinates;
};

var parseSphere = function(reader, id, xmlNode){
    var data = {};
    data.radius = reader.getFloat(xmlNode, "radius");
    data.slices = reader.getInteger(xmlNode, "slices");
    data.stacks = reader.getInteger(xmlNode, "stacks");

    if(data.radius === null || isNaN(data.radius) || data.radius <= 0){
        throw "primitive id: " + id + " has radius value not recognized";
    }
    if(data.slices === null || isNaN(data.slices) || data.slices <= 0){
        data.slices = 10;
        console.warn("primitive id: " + id + " has slices value not recognized. Assigning default value 10");
    }
    if(data.stacks === null || isNaN(data.stacks) || data.stacks <= 0) {
        data.stacks = 10;
        console.warn("primitive id: " + id + " has stacks value not recognized. Assigning default value 10");
    }
    return data;
};

var parseTorus = function(reader, id, xmlNode){
    var data = {};
    data.innerRadius = reader.getFloat(xmlNode, "inner");
    data.outerRadius = reader.getFloat(xmlNode, "outer");
    data.slices = reader.getInteger(xmlNode, "slices");
    data.loops = reader.getInteger(xmlNode, "loops");

    if(data.innerRadius === null || isNaN(data.innerRadius) || data.innerRadius <= 0){
        throw "primitive id: " + id + " has inner value not recognized";
    }
    if(data.outerRadius === null || isNaN(data.outerRadius) || data.outerRadius <= 0){
        throw "primitive id: " + id + " has outer value not recognized";
    }
    if(data.slices === null || isNaN(data.slices) || data.slices <= 0){
        data.slices = 10;
        console.warn("primitive id: " + id + " has slices value not recognized. Assigning default value 10");
    }
    if(data.loops === null || isNaN(data.loops) || data.loops <= 0) {
        data.loops = 10;
        console.warn("primitive id: " + id + " has loops value not recognized. Assigning default value 10");
    }
    return data;
};

var parseCylinder = function(reader, id, xmlNode){
    var data = {};
    data.baseRadius = reader.getFloat(xmlNode, "base");
    data.topRadius = reader.getFloat(xmlNode, "top");
    data.heightCylinder = reader.getFloat(xmlNode, "height");
    data.slices = reader.getInteger(xmlNode, "slices");
    data.stacks = reader.getInteger(xmlNode, "stacks");

    if(data.baseRadius === null || isNaN(data.baseRadius) || data.baseRadius <= 0){
        throw "primitive id: " + id + " has base value not recognized";
    }
    if(data.topRadius === null || isNaN(data.topRadius) || data.topRadius <= 0){
        throw "primitive id: " + id + " has top value not recognized";
    }
    if(data.heightCylinder === null || isNaN(data.heightCylinder) || data.heightCylinder <= 0){
        throw "primitive id: " + id + " has height value not recognized";
    }
    if(data.slices === null || isNaN(data.slices) || data.slices <= 0){
        data.slices = 10;
        console.warn("primitive id: " + id + " has slices value not recognized. Assigning default value 10");
    }
    if(data.stacks === null || isNaN(data.stacks) || data.stacks <= 0) {
        data.stacks = 10;
        console.warn("primitive id: " + id + " has stacks value not recognized. Assigning default value 10");
    }

    return data;
};

var parsePlane = function(reader, id, xmlNode){
    var data = {};
    data.dimX = reader.getInteger(xmlNode, "dimX");
    data.dimY = reader.getInteger(xmlNode, "dimY");
    data.partsX = reader.getInteger(xmlNode, "partsX");
    data.partsY = reader.getInteger(xmlNode, "partsY");

    if(data.dimX === null || isNaN(data.dimX) || data.dimX < 0){
        throw "primitive id: " + data.id + " has dimX value not recognized";
    }
    if(data.dimY === null || isNaN(data.dimY) || data.dimY < 0){
        throw "primitive id: " + data.id + " has dimY value not recognized";
    }
    if(data.partsX === null || isNaN(data.partsX) || data.partsX <= 0){
        data.partsX = 20;
        console.warn("primitive id: " + data.id + " has partsX value not recognized. Assigning default value 20");
    }
    if(data.partsY === null || isNaN(data.partsY) || data.partsY <= 0) {
        data.partsY = 20;
        console.warn("primitive id: " + data.id + " has partsY value not recognized. Assigning default value 20");
    }
    return data;
};

var parsePatch = function(reader, id, xmlNode){
    var data = {};
    data.orderU = reader.getInteger(xmlNode, "orderU");
    data.orderV = reader.getInteger(xmlNode, "orderV");
    data.partsU = reader.getInteger(xmlNode, "partsU");
    data.partsV = reader.getInteger(xmlNode, "partsV");

    if(data.orderU === null || isNaN(data.orderU) || data.orderU < 0){
        throw "primitive id: " + data.id + " has orderU value not recognized";
    }
    if(data.orderV === null || isNaN(data.orderV) || data.orderV < 0){
        throw "primitive id: " + data.id + " has orderV value not recognized";
    }
    if(data.partsU === null || isNaN(data.partsU) || data.partsU <= 0){
        data.partsU = 20;
        console.warn("primitive id: " + data.id + " has partsU value not recognized. Assigning default value 20");
    }
    if(data.partsV === null || isNaN(data.partsV) || data.partsV <= 0) {
        data.partsV = 20;
        console.warn("primitive id: " + data.id + " has partsV value not recognized. Assigning default value 20");
    }

    var controlNodes = xmlNode.children;
    data.controlVertexes = getControlVertexes(reader, id, data.orderU, data.orderV, controlNodes);

    return data;
};

var parseChessboard = function(reader, id, xmlNode){
    var data = {};
    data.du = reader.getInteger(xmlNode, "du");
    data.dv = reader.getInteger(xmlNode, "dv");
    data.textureref = reader.getString(xmlNode, "textureref");
    data.su = reader.getInteger(xmlNode, "su");
    data.sv = reader.getInteger(xmlNode, "sv");
    data.dimX = reader.getFloat(xmlNode, "dimX");
    data.dimY = reader.getFloat(xmlNode, "dimY");

    if(data.du === null || isNaN(data.du) || data.du < 0){
        throw "primitive id: " + data.id + " has du value not recognized";
    }
    if(data.dv === null || isNaN(data.dv) || data.dv < 0){
        throw "primitive id: " + data.id + " has dv value not recognized";
    }
    if(data.textureref === null){
        throw "primitive id: " + data.id + " has textureref value not recognized";
    }
    if(data.su === null || isNaN(data.su) || data.su < 0){
        data.su = -1;
        console.warn("primitive id: " + data.id + " has su value not recognized. Assigning default value -1");
    }
    if(data.sv === null || isNaN(data.sv) || data.sv < 0) {
        data.sv = -1;
        console.warn("primitive id: " + data.id + " has sv value not recognized. Assigning default value -1");
    }
    if(data.dimX === null || isNaN(data.dimX) || data.dimX < 0){
        data.dimX = 1;
        console.warn("primitive id: " + data.id + " has dimX value not recognized. Assigning default value -1");
    }
    if(data.dimY === null || isNaN(data.dimY) || data.dimY < 0) {
        data.dimY = 1;
        console.warn("primitive id: " + data.id + " has dimY value not recognized. Assigning default value -1");
    }
    data.c1 = getRGBA(reader, id, xmlNode, "c1");
    data.c2 = getRGBA(reader, id, xmlNode, "c2");
    data.cs = getRGBA(reader, id, xmlNode, "cs");

    return data;
};

var getControlVertexes = function(reader, id, orderU, orderV, xmlNode){
    var vertexes = [];
    for (var i = 0; i <= orderU; i++) {
        var middle = [];
        for (var j = 0; j <= orderV; j++) {
            var index = i * (orderV+1) + j;
            var point = getXYZ(reader, xmlNode[index], id);
            var coordinates = [];
            coordinates.push(point.x,point.y,point.z, 1);
            middle.push(coordinates);
        }
        vertexes.push(middle);
    }
    return vertexes;
};

var toRadians = function(degree){
    return Math.PI*degree/180;
};

var getRGBA = function(reader, id, node, tag){
    var dest = {};
    var array = node.getElementsByTagName(tag);
    dest.r = reader.getFloat(array[0], "r");
    dest.g = reader.getFloat(array[0], "g");
    dest.b = reader.getFloat(array[0], "b");
    dest.a = reader.getFloat(array[0], "a");

    for (var value in dest) {
        if (dest.hasOwnProperty(value)) {
            if (dest[value] === null || isNaN(dest[value]) || dest[value] < 0 || dest[value] > 1) {
                dest[value] = 0.1;
                console.warn(tag + " id: " + id + " has " + value + " value not recognized. Assuming default value 0.1");
            }
        }
    }
    return dest;
};

var getXYZ = function(reader, node, id){
    var dest = {};
    dest.x = reader.getFloat(node, "x");
    dest.y = reader.getFloat(node, "y");
    dest.z = reader.getFloat(node, "z");

    for (var coord in dest) {
        if (dest.hasOwnProperty(coord)) {
            if (dest[coord] === null || isNaN(dest[coord])) {
                throw "ID: " + id + " has node " + node.tagName + " with " + coord + " value not recognized";
            }
        }
    }
    return dest;
};

function withinBoard(piece){
    return piece.col < 10 & piece.col > 0 && piece.line < 10 && piece.line > 0;
}

function clearCells(cells){
    for (i = 0; i < cells.length; i++) {
        for ( j = 0; j < cells[i].length; j++) {
            cells[i][j].activate = false;
        }
    }
}
