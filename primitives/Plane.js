/**
 * Plane
 * @constructor
 */

function Plane(scene, dimX, dimY, partsX, partsY) {
    this.scene = scene;

    this.dimX = dimX;
    this.dimY = dimY;
    this.partsX = partsX;
    this.partsY = partsY;

    this.createObject();
}

Plane.prototype = Object.create(CGFnurbsObject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.createObject = function() {

    var yI = -this.dimY/2;
    var xI = -this.dimX/2;
    var yF = this.dimY/2;
    var xF = this.dimX/2;


    var controlVertex = [
                    [   //U=0 V=[0,1]
                        [xI, yI, 0, 1],
                        [xI, yF, 0, 1],
                    ],
                    [   //U=1 V=[0,1]
                        [xF, yI, 0, 1],
                        [xF, yF, 0, 1],
                    ]
                ];

    this.texCoords = [0,1,
                    1,1,
                    0,0,
                    1,0
    ];

    Patch.call(this, this.scene, this.dimX, this.dimY, controlVertex, this.partsX, this.partsY);
};
