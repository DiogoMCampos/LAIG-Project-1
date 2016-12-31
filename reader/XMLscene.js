var response, ready = false;

function XMLscene(inter) {
    CGFscene.call(this);
    this.primitives = {};
    this.transformations = {};
    this.components = {};
    this.cameras = [];
    this.textures = {};
    this.materials = {};
    this.cameraIndex = 0;
    this.interface = inter;
    this.appearance = null;
    this.cameraAnimations = [];
    this.affect = true;
    this.animationSpeed = 100;

    this.time = 300;
    this.log = [];
    this.undo = function() {
        if(this.end || this.mode === this.MODES.P0){
            return;
        }
        if (this.cameraAnimations.length !== 0 && this.cameraAnimations[0].on){
            alert("Wait until he rotation is complete");
            return;
        }
        if (this.log.length > 0) {
            this.undoMovement(this.log[this.log.length - 1], this.log.length);
            this.log.pop();
            this.affect = true;
            if(this.mode === this.MODES.P1){
                this.undoMovement(this.log[this.log.length - 1], this.log.length);
                this.log.pop();
            }
        } else {
            alert("Can't go back anymore");
        }
    };
    this.iterator = 0;

    this.HOUSE_SPACING = 0.8333333;

    this.PRIMITIVES = {
        RECTANGLE: "rectangle",
        TRIANGLE: "triangle",
        CYLINDER: "cylinder",
        SPHERE: "sphere",
        TORUS: "torus",
        PLANE: "plane",
        PATCH: "patch",
        CHESSBOARD: "chessboard",
        VEHICLE: "vehicle",
    };

    this.createGame = {
        difficulty: "easy",
        mode: "P1 VS P2",
        timeAvailable: 300,
    };

    this.MODES = {
        P1: 1,
        P2: 2,
        P0: 0,
    };

    this.fixedCamera = true;

    this.rules = function(){
        alert("MOVING \n\nMove one piece per turn."+

        "Pieces move orthogonally (forward, backward, left or right) never diagonally and only in one direction each turn.\n" +

        "When you move one of your pieces, you cannot end its move in the same space it occupied at the beginning of your previous turn.\n\n"+

        "1 floor pieces moves 1 space.\n"+
        "2 floor pieces moves up to 2 spaces.\n"+
        "3 floor pieces moves up to 3 spaces.\n\n"+

        "WINNING\n\n"+
        "A player wins as soon as he or she has claimed 7 or more points' worth of his or her opponent's game pieces.\n");
    };

    this.scenes = "beach";

    this.TRANSFORMATIONS = {
        ROTATE: "rotate",
        TRANSLATE: "translate",
        SCALE: "scale",
        REFERENCE: "transformationref"
    };
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(10000.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.beginTime = -1;
    this.UPDATE_PERIOD = 20;
    this.updateCounter = 0;
    this.setUpdatePeriod(this.UPDATE_PERIOD);
    this.setPickEnabled(true);

    this.initShaders();

    this.cells = [];
    this.board = [];
    for (var i = 0; i < 9; i++) {
        this.cells[i] = [];
        this.board[i] = [];
        for (var j = 0; j < 9; j++) {
            var place = new MyPlace(this, i, j);
            this.cells[i].push(place);
        }
    }

    this.mode = "P1 VS P2";
    this.difficulty = "easy";
    this.time = 300;
    this.newGame();
    this.z=0;
};

// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() {
    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.axis = new CGFaxis(this, this.axisLength);
    this.enableTextures(true);
    this.setCameras();
    //this.interface.setActiveCamera(this.camera);
    this.interface.addScene(this);
    this.setDefaultAppearance();
};

XMLscene.prototype.initShaders = function() {

    this.shader = new CGFshader(this.gl, "shaders/varying.vert", "shaders/varying.frag");
};


XMLscene.prototype.setCameras = function() {
    var toVec = vec3.fromValues(0, 0, 0);

    var cameraList = [
        {distance: 5, height: 4},
        {distance: 3, height: 7},
        {distance: 8, height: 8},
        {distance: 12, height: 12}
    ];

    for (var i = 0; i < cameraList.length; i++) {
        var cameraAnimation = new CameraAnimation(cameraList[i].distance, cameraList[i].height);
        var startingVec = cameraAnimation.currPosition;
        var camera = new CGFcamera(Math.PI / 2, 0.1, 500, startingVec, toVec);
        this.cameras.push(camera);
        this.cameraAnimations.push(cameraAnimation);
    }

    this.camera = this.cameras[this.cameraIndex];
};

XMLscene.prototype.setDefaultAppearance = function() {
    this.appearance = new CGFappearance(this);
    this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
    this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
    this.appearance.setSpecular(0.0, 0.0, 0.0, 1);
    this.appearance.setShininess(120);
};

XMLscene.prototype.update = function(currTime) {
    //For relative time to the first update
    if(!this.end){
        this.updateCounter += this.UPDATE_PERIOD *8/5;
        if(this.updateCounter >= 1000){
            this.time--;
            if(this.time === 0){
                alert("you lost");
                this.end = true;
            }
            this.updateCounter = 0;
        }
    }
    if (this.graph.loadedOk) //updating only starts when the XML is parsed!!
    {
        if (this.beginTime === -1) {
            this.beginTime = currTime;
        } else {
            this.currTime = currTime - this.beginTime;
        }
    }
    if (this.fixedCamera) {
        if(this.tempCamera){
            var temp = this.tempCamera;
            this.camera = new CGFcamera(temp.fov, temp.near, temp.far, temp.position, temp.target);
            this.cameras[this.cameraIndex] = this.camera;
            this.interface.setActiveCamera(undefined);
            this.tempCamera = undefined;
        }
    } else {
        if(!this.tempCamera){
            this.cloneCamera();
            this.interface.setActiveCamera(this.camera);
        }
    }

    this.rotateCamera(currTime);
};

XMLscene.prototype.cloneCamera = function(){
    this.tempCamera = {};
    var temp = this.tempCamera;

    temp.position = [];
    var i;
    for (i = 0; i < this.camera.position.length; i++) {
        temp.position.push(this.camera.position[i]);
    }
    temp.target = [];
    for (i = 0; i < this.camera.target.length; i++) {
        temp.target.push(this.camera.target[i]);
    }
    temp.fov = this.camera.fov;
    temp.near = this.camera.near;
    temp.far = this.camera.far;
};

XMLscene.prototype.updateLights = function() {
    for (var j = 0; j < this.lightsOn.length; j++) {
        if (!this.lightsOn[j]) {
            this.lights[j].enabled = false;
        } else {
            this.lights[j].enabled = true;
        }
        this.lights[j].update();
    }
};

XMLscene.prototype.display = function() {
    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    if (this.graph.loadedOk) {

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        this.logPicking();
        this.clearPickRegistration();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.updateLights();
        // Draw axis
        // this.axis.display();
        // ---- END Background, camera and axis setup
        // this.setActiveShader(this.shaders[this.selectedShader]);
        var root = this.components[this.root];
        this.registerForPick(10000, root);
        this.recursiveDisplay(this.root, root.materials[root.materialsIndex], root.textureID);
        // this.setActiveShader(this.defaultShader);

        if (!this.end){
            this.finishGame();
        } else{
            this.showAllMoves();
        }
        this.displayPieces();
        this.analyzeProlog();
        this.displayPlaces();
        this.displayTaken();
    }
};

XMLscene.prototype.displayPieces = function() {
    this.block = false;
    for (var j = 0; j < 2; j++) {
        var array, side;
        if (j === 0) {
            array = this.rPieces;
            side = "r";
        } else {
            array = this.wPieces;
            side = "w";
        }
        for (var i = 0; i < array.length; i++) {
            var piece = array[i];
            this.pushMatrix();
                this.materials.black.apply();
                this.translate(-this.HOUSE_SPACING * 4, 0.2, this.HOUSE_SPACING * 4);
                this.translate(this.HOUSE_SPACING * (piece.originalCol - 1), (piece.numFloors - 1) * 0.2, -this.HOUSE_SPACING * (piece.originalLine - 1));
                this.applyAnimations(piece.animations);
                this.registerForPick(i + 10 * j, piece);
                if(withinBoard(piece)){
                    piece.display();
                }
            this.popMatrix();
        }
    }
};

XMLscene.prototype.displayPlaces = function() {
    var o = 5000;
    for (var j = 0; j < this.cells.length; j++) {
        for (var i = 0; i < this.cells[j].length; i++) {
            var cell = this.cells[i][j];
            if (cell.activate) {
                this.pushMatrix();
                this.materials.possible.apply();
                this.translate(-this.HOUSE_SPACING * 4, 0.2, this.HOUSE_SPACING * 4);
                this.translate(this.HOUSE_SPACING * i, 0, -this.HOUSE_SPACING * j);
                this.registerForPick(o++, cell);
                cell.display();
                this.popMatrix();
            }
        }
    }
};

XMLscene.prototype.displayTaken = function(){
    this.pushMatrix();
        this.translate(6, 0, -4.5);
        for (var i = 0; i < this.taken.length; i++) {
            this.pushMatrix();
                this.registerForPick(10000, this.taken[i]);
                this.translate(0, 0.2*this.taken[i].numFloors, i);
                this.taken[i].display();
            this.popMatrix();
        }
    this.popMatrix();
};

XMLscene.prototype.undoMovement = function(entry, entryNumber) {
    clearCells(this.cells);
    var direction = entry[0];

    for (var m = this.taken.length-1; m >= 0; m--) {
        if(this.taken[m].time === entryNumber){
            this.taken.pop();
        } else{
            break;
        }
    }
    for (var i = 0; i < entry[1].length; i++) {
        var mov = entry[1][i].split("-");
        var pieces;
        if (mov[2] === "w") {
            pieces = this.wPieces;
        } else {
            pieces = this.rPieces;
        }

        var horMov = Number(direction[0]);
        var verMov = Number(direction[1]);
        var quantity = Number(mov[3]);
        var colMov = horMov * quantity;
        var linMov = verMov * quantity;

        for (var j = 0; j < pieces.length; j++) {
            var currPiece = pieces[j];
            if (mov[0] == (currPiece.col - colMov) && mov[1] == (currPiece.line - linMov)) {
                if (!withinBoard(currPiece) && currPiece.id !== mov[2] && currPiece.time !== entryNumber) {
                    continue;
                }

                var animation = new LinearAnimation(
                    this,
                    currPiece.animations.length,
                    quantity / 2, [{
                        x: 0,
                        y: 0,
                        z: 0
                    }, {
                        x: -colMov * this.HOUSE_SPACING,
                        y: 0,
                        z: linMov * this.HOUSE_SPACING
                    }],
                    true
                );

                currPiece.animations.push(animation);

                currPiece.col = Number(mov[0]);
                currPiece.line = Number(mov[1]);
                break;
            }
        }
    }
    this.switchTurn();
};

/**
 *      Predecessor arguments are the last ID !==inherit
 */
XMLscene.prototype.recursiveDisplay = function(componentId, predecessorMatID, predecessorTextID) {
    var comp = this.components[componentId];
    var matId, texId;

    if (comp.textureID === "inherit") {
        texId = predecessorTextID;
    } else {
        texId = comp.textureID;
    }

    if (comp.materials[comp.materialsIndex] === "inherit") {
        matId = predecessorMatID;
    } else {
        matId = comp.materials[comp.materialsIndex];
    }
    this.applyMaterialTexture(matId, texId);

    this.pushMatrix();
    this.multMatrix(comp.transformations);
    this.applyAnimations(comp.animations);

    var primitiveArray = comp.children.primitiveref;
    for (var i = 0; i < primitiveArray.length; i++) {
        if (this.primitives[primitiveArray[i]].hasOwnProperty("data") &&
            this.primitives[primitiveArray[i]].data.hasOwnProperty("su") &&
            this.primitives[primitiveArray[i]].data.hasOwnProperty("sv")) {

            this.applyMaterialTexture(matId, this.primitives[primitiveArray[i]].data.textureref);
            this.setChessboardShading(this.primitives[primitiveArray[i]].data);
            this.setActiveShader(this.shader);
            this.primitives[primitiveArray[i]].display();
            this.applyMaterialTexture(matId, texId);
            this.setActiveShader(this.defaultShader);
        } else {

            this.primitives[primitiveArray[i]].display();
        }
    }

    var componentArray = comp.children.componentref;
    for (var j = 0; j < componentArray.length; j++) {
        this.recursiveDisplay(componentArray[j], matId, texId);
    }

    this.popMatrix();
};

XMLscene.prototype.applyTransformations = function(transformationsArray) {
    for (var i = 0; i < transformationsArray.length; i++) {
        var t = transformationsArray[i];
        switch (t.name) {
            case this.TRANSFORMATIONS.TRANSLATE:
                this.translate(t.x, t.y, t.z);
                break;
            case this.TRANSFORMATIONS.SCALE:
                this.scale(t.x, t.y, t.z);
                break;
            case this.TRANSFORMATIONS.ROTATE:
                this.rotate(t.angle * 2 * Math.PI / 360,
                    t.axis === "x" ? 1 : 0,
                    t.axis === "y" ? 1 : 0,
                    t.axis === "z" ? 1 : 0);
                break;
            case this.TRANSFORMATIONS.REFERENCE:
                this.applyTransformations(this.transformations[t.id]);
                break;
            default:
                console.warn("not recognized transformation tagName: " + t.name);
                break;
        }
    }
};

XMLscene.prototype.applyAnimations = function(animationArray) {
    var matrix = mat4.create();

    for (var i = 0; i < animationArray.length; i++) {
        var animation = animationArray[i];
        var animMatrix = animation.getTransformationMatrix(this.currTime);

        mat4.multiply(matrix, matrix, animMatrix);

        if (!animation.finished) {
            this.block = true;
            break;
        }

    }

    this.multMatrix(matrix);
};

XMLscene.prototype.applyMaterialTexture = function(materialId, textureID) {
    var material = this.materials[materialId];
    if (textureID === "none") {
        material.setTexture(null);
    } else {
        material.setTexture(this.textures[textureID]);
        material.setTextureWrap(this.textures[textureID].lengthS, this.textures[textureID].lengthT);
    }
    material.apply();
};

XMLscene.prototype.switchPerspective = function() {
    this.cameraIndex++;
    if (this.cameraIndex === this.cameras.length) {
        this.cameraIndex = 0;
    }
    this.camera = this.cameras[this.cameraIndex];
};

XMLscene.prototype.incrementMaterials = function() {
    for (var comp in this.components) {
        if (this.components.hasOwnProperty(comp)) {
            var component = this.components[comp];
            component.materialsIndex++;
            if (component.materialsIndex >= component.materials.length) {
                component.materialsIndex = 0;
            }
        }
    }
};

XMLscene.prototype.setChessboardShading = function(data) {
    var color1 = vec4.fromValues(data.c1.r, data.c1.g, data.c1.b, data.c1.a);
    var color2 = vec4.fromValues(data.c2.r, data.c2.g, data.c2.b, data.c2.a);
    var colorS = vec4.fromValues(data.cs.r, data.cs.g, data.cs.b, data.cs.a);
    this.shader.setUniformsValues({
        du: data.du,
        dv: data.dv,
        dimY: data.dimY,
        dimX: data.dimX,
        su: data.su,
        sv: data.sv,
        c1: color1,
        c2: color2,
        cs: colorS
    });

};

XMLscene.prototype.analyzeProlog = function() {
    if (ready && this.animationFinished()) {
        ready = false;
        clearCells(this.cells);

        //read response acoording to the situation
        if (this.affect) {
            this.readPossible();
        } else {
            this.readMove();
        }
    }
};

XMLscene.prototype.finishGame = function() {
    for (var j = 0; j < 2; j++) {
        var array, points = 0, p;
        if(j === 0){
            array = this.rPieces;
            p = this["Points for white win"];
        }else{
            array = this.wPieces;
            p = this["Points for red win"];
        }
        for (var i = 0; i < array.length; i++) {
            var piece = array[i];
            if (!withinBoard(piece)) {
                points += piece.numFloors;
                p = 7 - points;
                if(points >= 7){

                    this.undoAll();
                    this.end = true;
                    return;
                }
            }
        }
        if(j === 0){
            if(this.end){
                alert("Congratulations to white!");
            }
            this["Points for white win"] = p;
        }else{
            if(this.end){
                alert("Congratulations to red!");
            }
            this["Points for red win"] = p;
        }
    }
};

XMLscene.prototype.undoAll = function() {
    for (var i = this.log.length - 1; i >= 0; i--) {
        this.undoMovement(this.log[i], i + 1);
    }
};

XMLscene.prototype.showAllMoves = function(){

    if(!this.animationFinished()){
        return;
    }
    if(this.iterator < this.log.length){
        response = this.log[this.iterator++];
        this.readMove();
    }
};

XMLscene.prototype.readPossible = function() {
    for (i = 0; i < response.length; i++) {
        var mov = response[i].split("-");
        this.cells[mov[2] - 1][mov[3] - 1].activate = true;
    }
    this.affect = false;
    this.comNext = true;
};

XMLscene.prototype.readMove = function() {
    var direction = response[0];
    for (var i = response[1].length - 1; i >= 0; i--) {
        var mov = response[1][i].split("-");
        var pieces;
        if (mov[2] === "w") {
            pieces = this.wPieces;
        } else {
            pieces = this.rPieces;
        }

        for (var j = 0; j < pieces.length; j++) {
            var currPiece = pieces[j];

            if (mov[0] == pieces[j].col && mov[1] == pieces[j].line) {
                var horMov = Number(direction[0]);
                var verMov = Number(direction[1]);
                var quantity = Number(mov[3]);
                var animation = new LinearAnimation(
                    this,
                    currPiece.animations.length,
                    quantity / 2, [{
                        x: 0,
                        y: 0,
                        z: 0
                    }, {
                        x: horMov * this.HOUSE_SPACING * quantity,
                        y: 0,
                        z: verMov * this.HOUSE_SPACING * -quantity
                    }],
                    true
                );

                currPiece.animations.push(animation);

                currPiece.col += horMov * quantity;
                currPiece.line += verMov * quantity;

                if (!withinBoard(currPiece)) {
                    currPiece.time = this.log.length + 1;
                    this.taken.push(currPiece);
                }

                break;
            }
        }
    }
    if(!this.end){
        if (this.mode === this.MODES.P2) {
            this.switchTurn();
            this.affect = true;
        } else if(this.mode === this.MODES.P1){
            if(this.comNext){
                makeRequest(this, "w", this.difficulty);
            } else{
                this.affect = true;
            }
            this.comNext = false;
        } else{
            makeRequest(this, this.turn, this.difficulty);
            this.switchTurn();
        }
        this.log.push(response);
    }
};

XMLscene.prototype.getProlog = function(data) {
    var resp = data.target.response;
    resp = resp.slice(1, resp.length - 1);
    var arr = resp.split(",");
    response = arr;
    ready = true;
};

XMLscene.prototype.getPrologMove = function(data) {
    var resp = data.target.response;
    var pos = resp.indexOf("[") + 1;
    var slice = resp.slice(pos, resp.length - 1);
    var npos = slice.indexOf("[") + 1;
    var pieces = slice.slice(npos, slice.length - 1);
    var mov = slice.slice(0, npos - 2);
    var movArr = mov.split(",");
    var arr = pieces.split(",");
    response = [movArr, arr];
    ready = true;
};

XMLscene.prototype.logPicking = function() {

    if (this.pickMode === false) {
        if (this.pickResults !== null && this.pickResults.length > 0) {
            if (!(this.cameraAnimations.length !== 0 && this.cameraAnimations[0].on && !this.block)){
                for (var i = 0; i < this.pickResults.length; i++) {
                    var obj = this.pickResults[i][0];
                    if (obj) {

                        if (this.affect) {
                            if (this.turn === obj.id && withinBoard(obj)) {
                                this.selected = obj;
                                makeRequest(this, this.turn, obj.col, obj.line);
                            }
                        } else {
                            if (obj === this.selected) {
                                this.affect = true;
                                clearCells(this.cells);
                            } else if (obj.id === "place")
                                makeRequest(this, this.selected.col, this.selected.line, obj.column + 1, obj.line + 1);
                        }
                    } else {
                        this.affect = true;
                        clearCells(this.cells);
                    }
                }
                this.pickResults.splice(0, this.pickResults.length);
            }
        }
    }
};

XMLscene.prototype.newGame = function(){
    if (this.cameraAnimations.length !== 0 && this.cameraAnimations[0].on){
        alert("Wait until the camera rotation is complete");
        return;
    }
    if(this.log !== undefined){
        if(this.log.length !== 0 && !this.end){
            if(!confirm("Are you sure? This game will be erased.")){
                return;
            }
        }
    }
    if(this.turn === "w"){
        this.switchTurn();
    }


    clearCells(this.cells);
    switch (this.createGame.difficulty) {
        case "easy":
            this.difficulty = 0;
            break;
        case "normal":
            this.difficulty = 1;
            break;
    }

    this.time = this.createGame.timeAvailable;
    this.log = [];
    this.turn = "r";
    this.end = false;
    this.affect = true;

    this.resetTimer();

    this["Points for red win"] = 7;
    this["Points for white win"] = 7;

    this.setPieces();

    switch (this.createGame.mode) {
        case "P1 VS P2":
            this.mode = this.MODES.P2;
            break;
        case "P1 VS COM":
            this.mode = this.MODES.P1;
            break;
        case "COM VS COM":
            this.mode = this.MODES.P0;
            this.affect = false;
            makeRequest(this, this.turn, this.difficulty);
            this.switchTurn();
            break;
    }
};

XMLscene.prototype.setPieces = function(){
    this.rPieces = [];
    this.rPieces.push(new MyPiece(this, "r", 3, "red", 1, 1));
    this.rPieces.push(new MyPiece(this, "r", 3, "red", 9, 1));
    this.rPieces.push(new MyPiece(this, "r", 2, "red", 3, 2));
    this.rPieces.push(new MyPiece(this, "r", 2, "red", 7, 2));
    this.rPieces.push(new MyPiece(this, "r", 1, "red", 4, 2));
    this.rPieces.push(new MyPiece(this, "r", 1, "red", 5, 2));
    this.rPieces.push(new MyPiece(this, "r", 1, "red", 6, 2));
    this.rPieces.push(new MyPiece(this, "r", 1, "red", 5, 3));

    this.wPieces = [];
    this.wPieces.push(new MyPiece(this, "w", 3, "white", 1, 9));
    this.wPieces.push(new MyPiece(this, "w", 3, "white", 9, 9));
    this.wPieces.push(new MyPiece(this, "w", 2, "white", 3, 8));
    this.wPieces.push(new MyPiece(this, "w", 2, "white", 7, 8));
    this.wPieces.push(new MyPiece(this, "w", 1, "white", 4, 8));
    this.wPieces.push(new MyPiece(this, "w", 1, "white", 5, 8));
    this.wPieces.push(new MyPiece(this, "w", 1, "white", 6, 8));
    this.wPieces.push(new MyPiece(this, "w", 1, "white", 5, 7));

    this.taken = [];
};

XMLscene.prototype.resetTimer = function(){
    this.wTime = this.createGame.timeAvailable;
    this.rTime = this.createGame.timeAvailable;
    this.time = this.rTime;
};

XMLscene.prototype.switchTurn = function(){
    if(this.turn === "r"){
        this.turn = "w";
        this.rTime = this.time;
        this.time = this.wTime;
    } else {
        this.turn = "r";
        this.wTime = this.time;
        this.time = this.rTime;
    }

    if(this.mode === this.MODES.P2 && this.fixedCamera){
        for (var i = 0; i < this.cameraAnimations.length; i++) {
            this.cameraAnimations[i].on = true;
        }
    }
};

XMLscene.prototype.animationFinished = function(){
    for (var j = 0; j < 2; j++) {
        var array, side;
        if (j === 0) {
            array = this.rPieces;
            side = "r";
        } else {
            array = this.wPieces;
            side = "w";
        }
        for (var i = 0; i < array.length; i++) {
            for (var l = 0; l < array[i].animations.length; l++) {
                var anim = array[i].animations[l];
                if(!anim.finished){
                    return false;
                }
            }
        }

    }
    return true;
};

XMLscene.prototype.rotateCamera = function(currTime) {
    if (this.cameraAnimations.length != 0 && this.cameraAnimations[0].on) {
        for (var i = 0; i < this.cameraAnimations.length; i++) {
            var position = this.cameraAnimations[i].getPosition(currTime);
            this.cameras[i].setPosition(position);
        }

        this.camera = this.cameras[this.cameraIndex];
    }
};
