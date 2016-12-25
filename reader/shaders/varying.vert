#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float normScale;
varying vec4 coords;
varying vec4 normal;

uniform int du;
uniform int dv;

varying vec2 dimensions;
varying vec2 vTextureCoord;

void main() {

	vec4 vertex=vec4(aVertexPosition, 1.0);
	float divU = 1.0 / float(du);
	float divV = 1.0 / float(dv);
	dimensions = vec2(du, dv);

	vec3 offset=vec3(0.0,0.0,0.0);

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);

	normal = vec4(aVertexNormal, 1.0);

	coords=vertex;
	vTextureCoord = aTextureCoord;
}
