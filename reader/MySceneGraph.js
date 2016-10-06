function MySceneGraph(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph
    this.scene = scene;
    scene.graph = this;

    // File reading
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */

    this.reader.open('scenes/' + filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function() {
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    try{
      this.parseDSX(rootElement);
    }
    catch(err){
      this.onXMLError(err);
      return;
    }
    this.createElements();
    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
};

MySceneGraph.prototype.parseDSX = function(rootElement) {
    this.dsxInfo = new DSXParser(rootElement, this.reader);
};

MySceneGraph.prototype.createElements = function(){
    for( types in this.dsxInfo.primitives){
        var elementArray = this.dsxInfo.primitives[types];
        switch(types){
              case this.scene.PRIMITIVES.RECTANGLE:
                    for(var i = 0; i < elementArray.length; i++){
                        console.log(elementArray[i]);
                        var obj = new MyRectangle(this.scene, elementArray[i], this.reader);
                        this.scene.primitives[obj.id] = obj;
                    }
                    break;

              case this.scene.PRIMITIVES.TRIANGLE:
                    for(var i = 0; i < elementArray.length; i++){
                        console.log(elementArray[i]);
                        var obj = new MyTriangle(this.scene, elementArray[i], this.reader);
                        this.scene.primitives[obj.id] = obj;
                    }
                    break;

              case this.scene.PRIMITIVES.CYLINDER:
                    for(var i = 0; i < elementArray.length; i++){
                        console.log(elementArray[i]);
                        var obj = new MyCylinder(this.scene, elementArray[i], this.reader);
                        this.scene.primitives[obj.id] = obj;
                    }
                    break;

              case this.scene.PRIMITIVES.SPHERE:
                    for(var i = 0; i < elementArray.length; i++){
                        console.log(elementArray[i]);
                        var obj = new MySphere(this.scene, elementArray[i], this.reader);
                        this.scene.primitives[obj.id] = obj;
                    }
                    break;

              case this.scene.PRIMITIVES.TORUS:
                    for(var i = 0; i < elementArray.length; i++){
                        //var r = new MyTorus(this, elementArray[i], this.reader);
                        //this.scene.PRIMITIVES.push(r);
                    }
                    break;
              default:
                    break;
        }
    }
};

MySceneGraph.prototype.createTransformations = function(){

}

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};
