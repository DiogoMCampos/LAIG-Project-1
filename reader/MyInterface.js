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

    this.omniGroup = this.gui.addFolder("Omni Lights");
    this.omniGroup.open();

    this.spotGroup = this.gui.addFolder("Spot Lights");
    this.spotGroup.open();

    /*this.gui.add(this.scene, 'selectedShader', {
        'Flat Shading': 0,
        'Passing a scale as uniform': 1,
        'Passing a varying parameter from VS -> FS': 2,
        'Simple texturing': 3,
        'Multiple textures in the FS': 4,
        'Multiple textures in VS and FS': 5,
        'Sepia': 6,
    }).name('Shaders');*/

    return true;
};

MyInterface.prototype.addScene = function(scene) {
    this.scene = scene;
    this.addLights();
};

MyInterface.prototype.addLights = function() {
    for (var i = 0; i < this.scene.lightsOn.length; i++) {
        var info = this.scene.lightsInfo[i];

        if (info.type === "omni") {
            this.omniGroup.add(this.scene.lightsOn, i, this.scene.lightsOn[i]).name(info.id);
        } else {
            this.spotGroup.add(this.scene.lightsOn, i, this.scene.lightsOn[i]).name(info.id);
        }
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
            this.setActiveCamera(this.scene.camera);
            break;
        case (77):
        case (109):
            this.scene.incrementMaterials();
            break;
    }
};
