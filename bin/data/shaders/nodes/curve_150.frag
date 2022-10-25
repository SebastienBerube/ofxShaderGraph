#version 150

/*
Description: Grayscale color curve LUT application shader.
Author     : Sebastien Berube April 2018
Note       : Using 32bit grayscale image format recommanded (to prevent banding)
FIXMES     : Possibly has a sligh start/end value range offset (half texel).
*/

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;
uniform float foldHeight = 1.0;

uniform sampler2DRect inputTex;
uniform vec2          inputRes;
uniform sampler2DRect lutTex;
uniform vec2          lutRes;

const int N = 256;
uniform float lut[N]; //Using a uniform array is probably not as efficient as a texture LUT (To be verified).

float curveRemap(float v){
	float h = texture2DRect(lutTex, lutRes*vec2(v,0)).x;
	return h;
	
	/*float fI = v*float(N-1);
	int iLower = int(fI);
	int iUpper = min(iLower+1,N-1);
	float u = fract(fI);
	float a = lut[iLower];
	float b = lut[iUpper];
	return mix(a,b,u);*/
}

float debugRamp(vec2 uv){
	float v = length(uv-vec2(0.5));
	return curveRemap(v);
}

void main()
{
	vec2 uv = gl_FragCoord.xy/iResolution;
    
	float v = texture2DRect(inputTex, inputRes*uv).r;
	outputColor.r = foldHeight*curveRemap(v);
	outputColor.a = 1.0;
	return;
}



