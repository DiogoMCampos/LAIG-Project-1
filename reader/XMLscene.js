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
    this.cameraAnimation = new CameraAnimation();
    this.affect = true;
    this.log = [];
    this.undo = function(){
        if(this.log.length > 0){
            this.undoMovement(this.log[this.log.length-1], this.log.length);
            this.log.pop();
        } else{
            alert("Can't go back anymore");
        }
    };

    this.turn = "r";
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
    this.wTime = 300;
    this.rTime = 300;
    this.time = this.rTime;
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
    this.piece1 = new MyPiece(this, "yolo", 1, "red");
    this.piece2 = new MyPiece(this, "yolo", 2, "white");
    this.piece3 = new MyPiece(this, "yolo", 3, "red", 1, 1);

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
    this.z=0;
};

// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() {
    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.axis = new CGFaxis(this, this.axisLength);
    this.enableTextures(true);
    this.setCamera();
    //this.interface.setActiveCamera(this.camera);
    this.interface.addScene(this);
    this.setDefaultAppearance();
};

XMLscene.prototype.initShaders = function() {

    this.shader = new CGFshader(this.gl, "shaders/varying.vert", "shaders/varying.frag");
};

XMLscene.prototype.setCamera = function() {
    var startingVec = this.cameraAnimation.currPosition;
    var toVec = vec3.fromValues(0, 0, 0);
    var camera = new CGFcamera(Math.PI / 2, 0.1, 500, startingVec, toVec);
    this.camera = camera;
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
    this.updateCounter += this.UPDATE_PERIOD *8/5;
    if(this.updateCounter >= 1000){
        this.time--;
        if(this.time === 0){
            alert("you lost");
        }
        this.updateCounter = 0;
    }

    if (this.graph.loadedOk) //updating only starts when the XML is parsed!!
    {
        if (this.beginTime === -1) {
            this.beginTime = currTime;
        } else {
            this.currTime = currTime - this.beginTime;
        }
    }

    for (var id in this.primitives) {
        if (this.primitives[id].hasOwnProperty("data")) {
            if (this.primitives[id].data.hasOwnProperty("su") && this.primitives[id].data.hasOwnProperty("sv")) {

                this.primitives[id].data.su++;
                if (this.primitives[id].data.su >= this.primitives[id].data.du) {
                    this.primitives[id].data.su = 0;
                    this.primitives[id].data.sv++;
                    if (this.primitives[id].data.sv >= this.primitives[id].data.dv) {
                        this.primitives[id].data.sv = 0;
                    }
                }

            }
        }
    }

    this.rotateCamera(currTime);
};

XMLscene.prototype.updateLights = function(){
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
        if(!this.end)
            this.finishGame();
        this.displayPieces();
        this.analyzeProlog();
        this.displayPlaces();

        // ---- END Background, camera and axis setup
        // this.setActiveShader(this.shaders[this.selectedShader]);
        var root = this.components[this.root];
        this.recursiveDisplay(this.root, root.materials[root.materialsIndex], root.textureID);
        // this.setActiveShader(this.defaultShader);
    }
};

XMLscene.prototype.displayPieces = function(){
    for (var j = 0; j < 2; j++) {
        var array, side;
        if(j === 0){
            array = this.rPieces;
            side = "r";
        }else{
            array = this.wPieces;
            side = "w";
        }
        for (var i = 0; i < array.length; i++) {
            var piece = array[i];
            this.pushMatrix();
                this.materials.black.apply();
                this.translate(-this.HOUSE_SPACING*4, 0.2, this.HOUSE_SPACING*4);
                this.translate(this.HOUSE_SPACING*(piece.originalCol-1), (piece.numFloors-1)*0.2, -this.HOUSE_SPACING*(piece.originalLine-1));
                this.applyAnimations(piece.animations);
                this.registerForPick(i + 10*j, piece);
                piece.display();
            this.popMatrix();
        }
    }
};

XMLscene.prototype.displayPlaces = function(){
    var o = 5000;
    for (var j = 0; j < this.cells.length; j++) {
        for (var i = 0; i < this.cells[j].length; i++) {
            var cell = this.cells[i][j];
            if(cell.activate){
                this.pushMatrix();
                    this.materials.possible.apply();
                    this.translate(-this.HOUSE_SPACING*4, 0.2, this.HOUSE_SPACING*4);
                    this.translate(this.HOUSE_SPACING*i, 0, -this.HOUSE_SPACING*j);
                    this.registerForPick(o++, cell);
                    cell.display();
                this.popMatrix();
            }
        }
    }
};

XMLscene.prototype.undoMovement = function(entry, entryNumber){
    clearCells(this.cells);
    var direction = entry[0];
    for (var i = entry[1].length -1; i >= 0; i--) {
        var mov = entry[1][i].split("-");
        var pieces;
        if(mov[2] === "w"){
            pieces = this.wPieces;
        } else{
            pieces = this.rPieces;
        }

        var horMov = Number(direction[0]);
        var verMov = Number(direction[1]);
        var quantity = Number(mov[3]);
        var colMov = horMov * quantity;
        var linMov = verMov * quantity;

        for (var j = 0; j < pieces.length; j++) {
            var currPiece = pieces[j];
            if(mov[0] == (currPiece.col - colMov) && mov[1] == (currPiece.line - linMov)){
                if(!withinBoard(currPiece) && currPiece.time !== entryNumber){
                    continue;
                }

                var animation = new LinearAnimation(
                        currPiece.animations.length,
                        quantity / 2,
                        [
                            {x: 0, y: 0, z: 0},
                            {x: -colMov * this.HOUSE_SPACING, y: 0, z: linMov * this.HOUSE_SPACING}
                        ],
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

XMLscene.prototype.analyzeProlog = function(){
    if(ready){
        ready = false;
        clearCells(this.cells);

        //read response acoording to the situation
        if(this.affect){
            this.readPossible();
        } else{
            this.readMove();
        }
    }
};

XMLscene.prototype.finishGame = function(){
    for (var j = 0; j < 2; j++) {
        var array, points = 0;
        if(j === 0){
            array = this.rPieces;
        }else{
            array = this.wPieces;
        }
        for (var i = 0; i < array.length; i++) {
            var piece = array[i];
            if(!withinBoard(piece)){
                points += piece.numFloors;
                if(points >= 7){
                    this.undoAll();
                    this.end = true;
                }
            }
        }
    }
};

XMLscene.prototype.undoAll = function(){
    for (var i = this.log.length - 1; i >= 0; i--) {
        this.undoMovement(this.log[i], i + 1);
    }
};

XMLscene.prototype.readPossible = function(){
    for (i = 0; i < response.length; i++) {
        var mov = response[i].split("-");
        this.cells[mov[2]-1][mov[3]-1].activate = true;
    }
    this.affect = false;
};

XMLscene.prototype.readMove = function(){
    var direction = response[0];
    for (i = 0; i < response[1].length; i++) {
        var mov = response[1][i].split("-");
        var pieces;
        if(mov[2] === "w"){
            pieces = this.wPieces;
        } else{
            pieces = this.rPieces;
        }

        for (var j = 0; j < pieces.length; j++) {
            var currPiece = pieces[j];

            if(mov[0] == pieces[j].col && mov[1] == pieces[j].line) {
                var horMov = Number(direction[0]);
                var verMov = Number(direction[1]);
                var quantity = Number(mov[3]);
                var animation = new LinearAnimation(
                    currPiece.animations.length,
                    quantity / 2,
                    [
                        {x: 0, y: 0, z: 0},
                        {x: horMov * this.HOUSE_SPACING * quantity, y: 0, z: verMov * this.HOUSE_SPACING * -quantity}
                    ],
                    true
                );

                currPiece.animations.push(animation);

                currPiece.col += horMov * quantity;
                currPiece.line += verMov * quantity;

                if(!withinBoard(currPiece)){
                    currPiece.time = this.log.length+1;
                }

                break;
            }
        }
    }
    this.switchTurn();
    this.log.push(response);
    this.affect = true;
};

XMLscene.prototype.getProlog = function(data){
    var resp = data.target.response;
    resp = resp.slice(1, resp.length-1);
    var arr = resp.split(",");
    response = arr;
    ready = true;
};

XMLscene.prototype.getPrologMove = function(data){
    var resp = data.target.response;
    var pos = resp.indexOf("[")+1;
    var slice = resp.slice(pos, resp.length-1);
    var npos = slice.indexOf("[")+1;
    var pieces = slice.slice(npos, slice.length-1);
    var mov = slice.slice(0, npos-2);
    var movArr = mov.split(",");
    var arr = pieces.split(",");
    response = [movArr, arr];
    ready = true;
};

XMLscene.prototype.logPicking = function() {
    if (this.pickMode === false) {
        if (this.pickResults !== null && this.pickResults.length > 0) {
            for (var i = 0; i < this.pickResults.length; i++) {
                var obj = this.pickResults[i][0];
                if (obj) {
                    if(this.affect){
                        if(this.turn === obj.id){
                            this.selected = obj;
                            makeRequest(this, this.turn, obj.col, obj.line);
                        }
                    } else{
                        if(obj === this.selected){
                            this.affect = true;
                            clearCells(this.cells);
                        } else if(obj.id === "place")
                            makeRequest(this, this.selected.col, this.selected.line, obj.column+1, obj.line+1);
                    }
                } else{
                    this.affect = true;
                    clearCells(this.cells);
                }
            }
            this.pickResults.splice(0, this.pickResults.length);
        }
    }
};

XMLscene.prototype.switchTurn = function(){
    if(this.turn === "r"){
        this.turn = "w";
        this.rTime = this.time;
        this.time = this.wTime;
    } else {
        this.turn = "r";
        this.wTime = this.rTime;
        this.time = this.wTime;
    }

    this.cameraAnimation.on = true;
};

XMLscene.prototype.rotateCamera = function(currTime) {
    if (this.cameraAnimation.on) {
        var position = this.cameraAnimation.getPosition(currTime);
        this.camera.setPosition(position);
    }
};
