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

    var error = this.parseDSX(rootElement);

    if (error != null) {
        this.onXMLError(error);
        return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
};

MySceneGraph.prototype.parseDSX = function(rootElement) {
    var sceneError = this.parseScene(rootElement);

    if (sceneError != null) {
        return sceneError;
    }

    var viewsError = this.parseViews(rootElement);

    if (viewsError != null) {
        return viewsError;
    }
}

MySceneGraph.prototype.parseScene = function(rootElement) {
    var elems = rootElement.getElementsByTagName('scene');

    if (!elems) {
        return "scene element is missing.";
    }

    if (elems.length !== 1) {
        return "either zero or more than one 'scene' element found.";
    }

    var scene = elems[0];

    this.root = this.reader.getString(scene, 'root');
    this.axisLength = this.reader.getFloat(scene, 'axis_length');

    console.log("Scene read from file: {root=" + this.root + ", axisLength=" + this.axisLength + "}");
}

MySceneGraph.prototype.parseViews = function(rootElement) {
    var elems = rootElement.getElementsByTagName('views');

    if (!elems) {
        return "views element is missing.";
    }

    if (elems.length !== 1) {
        return "either zero or more than one 'views' element found.";
    }

    var views = elems[0];

    this.defaultView = this.reader.getFloat(views, 'default');

    var perspectives = views.getElementsByTagName('perspective');

    if (perspectives.length < 1) {
        return "no 'perspective' element found.";
    }

    this.perspectives = [];

    for (var i = 0; i < perspectives.length; i++) {
        var perspectiveError = this.parsePerspective(perspectives[i]);

        if (perspectiveError != null) {
            return perspectiveError;
        }
    }

    console.log("Views read from file: {defaultView=" + this.defaultView + "}");
    console.log(this.perspectives);
}

MySceneGraph.prototype.parsePerspective = function(perspective) {
    var p = {};

    var fromElems = perspective.getElementsByTagName('from');

    if (!fromElems) {
        return "from element is missing.";
    }

    if (fromElems.length !== 1) {
        return "either zero or more than one 'from' element found.";
    }

    var fromCoor = fromElems[0];

    var toElems = perspective.getElementsByTagName('from');

    if (!toElems) {
        return "to element is missing.";
    }

    if (toElems.length !== 1) {
        return "either zero or more than one 'to' element found.";
    }

    var toCoor = toElems[0];

    p.id = this.reader.getString(perspective, 'id');
    p.near = this.reader.getFloat(perspective, 'near');
    p.far = this.reader.getFloat(perspective, 'far');
    p.angle = this.reader.getFloat(perspective, 'angle');

    console.log(p);
    console.log(fromCoor);

    p.from = {};
    p.from.x = this.reader.getFloat(fromCoor, 'x');
    p.from.y = this.reader.getFloat(fromCoor, 'y');
    p.from.z = this.reader.getFloat(fromCoor, 'z');

    p.to = {};
    p.to.x = this.reader.getFloat(toCoor, 'x');
    p.to.y = this.reader.getFloat(toCoor, 'y');
    p.to.z = this.reader.getFloat(toCoor, 'z');

    this.perspectives.push(p)
}

/*
 * Callback to be executed on any read error
 */

MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};
