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
uniform int su;
uniform int sv;

varying vec2 sColor;
varying vec2 dimensions;

varying vec2 vTextureCoord;

void main() {

	vec4 vertex=vec4(aVertexPosition, 1.0);
	float divU = 1.0 / float(du);
	float divV = 1.0 / float(dv);
	sColor = vec2(su, sv);
	dimensions = vec2(du, dv);

	float uStart = (float(su)*divU) - 0.5;
	float vStart = (float(sv)*divV) - 0.5;

	vec3 offset=vec3(0.0,0.0,0.0);

	if(((vertex.x >= uStart) && (vertex.x <= (uStart + divU))) &&
		((vertex.y >= vStart) && (vertex.y <= (vStart + divV))))
		offset.z += 0.05;
	vec4 other = vec4(offset, 0.0);
	/*if((vertex.x > uStart) && (vertex.x < (uStart + divU)))
		offset.z = 0.1;*/

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);

	normal = vec4(aVertexNormal, 1.0);

	coords=vertex;
	vTextureCoord = aTextureCoord;
}
