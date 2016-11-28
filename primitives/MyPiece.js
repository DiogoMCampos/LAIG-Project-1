function MyPiece(scene, id, floors){
    CGFobject.call(this, scene);
    this.scene = scene;
    this.id=id;
    this.numFloors = floors;

    this.initBuffers();
}

MyPiece.prototype = Object.create(CGFobject.prototype);
MyPiece.prototype.constructor = MyPiece;

MyPiece.prototype.initBuffers = function(){
    this.bottom = 1;
    this.floors = [];
    for (var i = 0; i < this.numFloors; i++) {
        var data = {
            "baseRadius": (i+1)*0.2,
            "topRadius": (i+2)*0.2,
            "heightCylinder":0.3,
            "stacks":2,
            "slices":4
        };
        var log = new MyCylinder(this.scene, i, data);

        var floorData = {
            "dimX":(i+4)*0.25,
            "dimY":(i+4)*0.25,
            "partsY":1,
            "partsX":1
        };
        var floor = new Plane(this.scene, i, floorData);
        this.floors.push(log,floor);
    }

    var dataTop = {
        "baseRadius": 0,
        "topRadius": 0.2,
        "heightCylinder":0.3,
        "stacks":2,
        "slices":4
    };
    this.top = new MyCylinder(this.scene, "top", dataTop);

    var dataBase = {
        "baseRadius": 1.5,
        "topRadius": 1.5,
        "heightCylinder":0.05,
        "stacks":2,
        "slices":4
    };
    this.base = new MyCylinder(this.scene, "base", dataBase);

    var dataBlink = {
        "radius":0.02,
        "slices":10,
        "stacks":10
    };
    this.blink = new MySphere(this.scene, "blink", dataBlink);

};

MyPiece.prototype.display = function (){
    this.scene.pushMatrix();
        this.scene.translate(0,0,0.31);
        this.blink.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
        this.scene.translate(0,0,0.3);
        this.scene.rotate(Math.PI/4, 0,0,1);
        this.scene.rotate(Math.PI, 0,1,0);
        this.top.display();
    this.scene.popMatrix();
    for (var i = 0; i < this.floors.length; i+=2) {
        this.scene.pushMatrix();
            this.scene.rotate(Math.PI/4, 0,0,1);
            this.scene.rotate(Math.PI, 0,1,0);
            this.floors[i].display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.floors[i+1].display();
            this.scene.rotate(Math.PI, 1,0,0);
            this.floors[i+1].display();
        this.scene.popMatrix();
        this.scene.translate(0,0,-0.3);
    }
    this.scene.rotate(Math.PI/4, 0,0,1);
    this.base.display();


};
