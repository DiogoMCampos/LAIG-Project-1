/**
 * Plane
 * @constructor
 */

function Plane(scene, id, data) {
    this.scene = scene;
    this.id = id;
    this.data = data;
    this.createObject();
}

Plane.prototype = Object.create(CGFnurbsObject.prototype);
//Plane.prototype.constructor = Plane;

Plane.prototype.createObject = function() {

    var yI = -this.data.dimY/2;
    var xI = -this.data.dimX/2;
    var yF = this.data.dimY/2;
    var xF = this.data.dimX/2;


    var controlVertexes = [
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

    var data = {};
    data.orderU = 1;
    data.orderV = 1;
    data.partsU = this.data.partsX;
    data.partsV = this.data.partsY;
    data.controlVertexes = controlVertexes;
    Patch.call(this, this.scene, this.id, data);
};