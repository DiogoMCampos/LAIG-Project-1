function MyVehicle(scene, id) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.id=id;

    var wheels = {
        "innerRadius": 0.1,
        "outerRadius" : 0.75,
        "slices": 50,
        "loops": 50,
    };
    this.wheel = new MyTorus(scene, "wheel", wheels);
    this.createBody();
}

MyVehicle.prototype = Object.create(CGFobject.prototype);
MyVehicle.prototype.constructor = MyVehicle;

MyVehicle.prototype.createBody = function(){
    var planeBody = {
        "dimX": 5,
        "dimY": 1.45,
        "partsX": 4,
        "partsY": 1,
    };
    this.planeBody = new Plane(this.scene, "planeBody", planeBody);

    var backBody = {
        "orderU":2,
        "orderV":1,
        "partsU":8,
        "partsV":2,
        "controlVertexes":[[[-2,-2,0,1], [-2,2,0,1]],[[-2,-2,3,1],[-2,2,3,1]], [[2,-2,3,1],[2,2,3,1]]],
    };
    this.backBody = new Patch(this.scene, "backBody", backBody);

    var mainBody = {
        "orderU":2,
        "orderV":1,
        "partsU":2,
        "partsV":4,
        "controlVertexes":[[[0,1.1,0.2,1],[2,1.1,0.2,1]], [[-1,1.8,1,1],[2,1.8,1,1]], [[0,1.1,1.8,1], [2,1.1,1.8,1]]],
    };
    this.mainBody = new Patch(this.scene, "mainBody", mainBody);

    var frontBody = {
        "orderU":2,
        "orderV":1,
        "partsU":2,
        "partsV":1,
        "controlVertexes":[[[-2,-2,0,1],[-2,2,0,1]], [[0,-2,3,1],[0,4,3,1]], [[2,-2,0,1], [2,2,0,1]]],
    };
    this.frontBody = new Patch(this.scene, "frontBody", frontBody);

};

MyVehicle.prototype.display = function(){


    this.wheel.display();
    this.scene.pushMatrix();
        this.scene.translate(4,0,0);
        this.wheel.display();
        this.scene.pushMatrix();
            this.scene.translate(0,0,2);
            this.wheel.display();
        this.scene.popMatrix();
    this.scene.popMatrix();
    this.scene.pushMatrix();
        this.scene.translate(0,0,2);
        this.wheel.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 1,0,0);
        this.scene.translate(2.1,1,0);
        this.planeBody.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
        this.scene.translate(3.3,0.2,1);
        this.scene.rotate(-Math.PI/2,0,0,1);
        this.scene.rotate(-Math.PI/2,1,0,0);
        this.scene.scale(0.4,0.4,0.5);
        this.backBody.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.mainBody.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.translate(0,0.4,1);
        this.scene.rotate(-Math.PI/2,0,1,0);
        this.scene.scale(0.4,0.35,0.3);
        this.frontBody.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        //this.scene.rotate(Math.PI/2, 1,0,0);
        this.scene.translate(2,0.55,1.8);
        this.scene.scale(0.8,0.75,1);
        this.planeBody.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1,0,0);
        this.scene.translate(2,-0.55,-0.2);
        this.scene.scale(0.8,0.75,1);
        this.planeBody.display();
    this.scene.popMatrix();




    this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1,0,0);
        this.scene.translate(2.7,-1.55,-0.2);
        this.scene.scale(0.3,0.65,0.1);
        this.planeBody.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
        this.scene.translate(2.7,1.55,1.8);
        this.scene.scale(0.3,0.65,0.1);
        this.planeBody.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 0,1,0);
        this.scene.translate(-1,1.55,3.45);
        this.scene.scale(0.31,0.65,0.1);
        this.planeBody.display();
    this.scene.popMatrix();
    this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 0,1,0);
        this.scene.translate(1,1.55,-2);
        this.scene.scale(0.31,0.65,0.1);
        this.planeBody.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 1,0,0);
        this.scene.translate(2.7,-1.1,2);
        this.scene.scale(0.31,1,0.5);
        this.planeBody.display();
    this.scene.popMatrix();

    //this.
};
