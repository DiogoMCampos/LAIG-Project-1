/**
 * Plane
 * @constructor
 */
function Plane(scene, id, data) {
    var specs = createObject(data);
    Patch.call(this, scene, id, specs);
}

Plane.prototype = Object.create(CGFnurbsObject.prototype);
Plane.prototype.constructor = Plane;

var createObject = function(data) {

    var yI = -data.dimY/2;
    var xI = -data.dimX/2;
    var yF = data.dimY/2;
    var xF = data.dimX/2;


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

    var specs = {};
    specs.orderU = 1;
    specs.orderV = 1;
    specs.partsU = data.partsX;
    specs.partsV = data.partsY;
    specs.controlVertexes = controlVertexes;
    return specs;
};
