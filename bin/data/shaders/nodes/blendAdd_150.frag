#version 150

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fOpacityAB = 0.15;
uniform float fOpacityBC = 0.5;

uniform sampler2DRect inputTexA;
uniform vec2          inputResA;
uniform sampler2DRect inputTexB;
uniform vec2          inputResB;
uniform sampler2DRect inputTexC;
uniform vec2          inputResC;

void main(){
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord/iResolution.xy;
	
	vec4 t1 = texture2DRect(inputTexA, inputResA*uv);
	vec4 t2 = texture2DRect(inputTexB, inputResB*uv);
	vec4 t3 = texture2DRect(inputTexC, inputResC*uv);
	
	float a = fOpacityAB;
	float b = fOpacityBC;
	vec4 t12 = t1*(1.-a)+t2*a;
	outputColor =  t12*(1.-b)+t3*b;
}



































