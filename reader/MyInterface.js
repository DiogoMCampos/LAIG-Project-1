/**
 * MyInterface
 * @constructor
 */


function MyInterface() {
    //call CGFinterface constructor
    CGFinterface.call(this);
}

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function(application) {
    // call CGFinterface init
    CGFinterface.prototype.init.call(this, application);

    // init GUI. For more information on the methods, check:
    //  http://workshop.chromeexperiments.com/examples/gui
    this.gui = new dat.GUI();

    // add a button:
    // the first parameter is the object that is being controlled (in this case the scene)
    // the identifier 'doSomething' must be a function declared as part of that object (i.e. a member of the scene class)
    // e.g. LightingScene.prototype.doSomething = function () { console.log("Doing something..."); };

    this.lights = this.gui.addFolder("Lights");


    return true;
};

MyInterface.prototype.addSettings = function(){
    var settings = this.gui.addFolder("Settings");
    settings.open();
    settings.add(this.scene.cameraAnimation, "rotationSpeed", 1, 400);
    settings.add(this.scene, "scenes", ["beach", "msg", "room", "tournament", "street"]);


    this.gui.add(this.scene, "newGame");

    this.gui.add(this.scene, "fixedCamera");
    this.gui.add(this.scene, "undo");
    this.gui.add(this.scene, "Points for white win").listen();
    this.gui.add(this.scene, "Points for red win").listen();
    this.gui.add(this.scene, "time").listen();
    this.gui.add(this.scene, "rules");
};

MyInterface.prototype.addScene = function(scene) {
    this.scene = scene;
    this.addLights();
    this.addSettings();


};

MyInterface.prototype.addLights = function() {
    for (var i = 0; i < this.scene.lightsOn.length; i++) {
        var info = this.scene.lightsInfo[i];
        this.lights.add(this.scene.lightsOn, i, this.scene.lightsOn[i]).name(info.id);
    }
};

/**
 * processKeyUp
 * @param event {Event}
 */
MyInterface.prototype.processKeyUp = function(event) {
    CGFinterface.prototype.processKeyUp.call(this, event);
};

/**
 * processKeyboard
 * @param event {Event}
 */
MyInterface.prototype.processKeyboard = function(event) {
    switch (event.which || event.keyCode) {
        case (86):
        case (118):
            this.scene.switchPerspective();
            break;
        case (77):
        case (109):
            this.scene.incrementMaterials();
            break;
    }
};
