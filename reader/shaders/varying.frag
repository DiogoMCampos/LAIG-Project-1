#ifdef GL_ES
precision highp float;
#endif

uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;
uniform int du;
uniform int dv;
uniform int su;
uniform int sv;


varying vec4 coords;
varying vec4 normal;

void main() {
	float divX = 1.0/float(du);
	float divY = 1.0/float(dv);

	float relX = (coords.x/divX);
	float ceX = floor(relX);
	float inX = mod(ceX, 2.0);

	float relY = (coords.y/divY);
	float ceY = floor(relY);
	float inY = mod(ceY, 2.0);

	float relS = (float(su)*divX)-0.5;
	float relT = (float(sv)*divY)-0.5;

	if((coords.x > relS) && (coords.x < (relS+divX)) && (coords.y > relT) && (coords.y < (relT+divY)))
		gl_FragColor =  cs;
	else if ( ((inX == 0.0) && (inY != 0.0)) || ((inX != 0.0) && (inY == 0.0)))
		gl_FragColor =  c1;
	else
	{
		gl_FragColor =  c2;
	}
}
