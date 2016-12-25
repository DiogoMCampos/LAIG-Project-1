#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
varying vec2 vTextureCoord;
uniform vec4 c1;
uniform vec4 c2;
uniform vec4 cs;

varying vec2 dimensions;
varying vec4 coords;
varying vec4 normal;

void main() {
	float du = dimensions[0];
	float dv = dimensions[1];
	float divX = 1.0/float(du);
	float divY = 1.0/float(dv);

	float relX = ((vTextureCoord.s)/divX);
	float ceX = floor(relX);
	float inX = mod(ceX, 2.0);

	float relY = (-vTextureCoord.t/divY);
	float ceY = floor(relY);
	float inY = mod(ceY, 2.0);

	gl_FragColor = texture2D(uSampler, vTextureCoord)/2.0;

	if ( ((inX >= 0.5) && (inY < 0.5)) || ((inX <= 0.5) && (inY > 0.5))){
		gl_FragColor += (c1/2.0);
	}else{
		gl_FragColor += (c2/2.0);
	}
}
