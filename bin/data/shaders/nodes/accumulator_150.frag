#version 150

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;

uniform sampler2DRect inputTex;
uniform vec2  inputRes;
uniform vec2  positionA   = vec2(0);
uniform vec2  positionB   = vec2(0);
uniform vec2  scaleA      = vec2(0.3);
uniform vec2  scaleB      = vec2(0.3);
uniform float multA       = 1.0;
uniform float multB       = 1.0;
uniform float rotationA   = 0.0;
uniform float rotationB   = 0.0;
uniform float decaySpeed  = 0.2;
uniform float accumSpeed  = 0.05;

float brush(vec2 uv, vec2 scl, mat2 m2){
	//NOTE : BIG HACK HERE, TO CENTER WARPED PATTERN ON POSITION
	//return texture2DRect(inputTex, inputRes*(m2*uv/scl+.5)).x;
	
	//return 1.0-0.5*length(uv-positionA);
	//return texture2DRect(inputTex, inputRes*(m2*uv/scl+vec2(0.36,.5))).x;//<-HERE : Should be scl+vec2(0.36,.5)
	return max(0.,(2.5-16.0*length(uv-vec2(0.0))));
}

void main()
{
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord.xy/iResolution.xy;
	
	//Note .25 minimum threshold is a bit high. Could try 0.10-0.15 maybe?
	float blackTh = .25;
	float thetaA = 1.57+rotationA;
	mat2 rA = mat2( cos(thetaA), sin(thetaA),
	               -sin(thetaA), cos(thetaA));
	float thetaB = 1.57+rotationB;
	mat2 rB = mat2( cos(thetaB), sin(thetaB),
	               -sin(thetaB), cos(thetaB));
	
	float hA = multA*(max(brush(uv-positionA,scaleA,rA),blackTh)-blackTh);
	float hB = multB*(max(brush(uv-positionB,scaleB,rB),blackTh)-blackTh);
	
	float h = max(hA,hB);
	
	outputColor.rgb = vec3(h);
	outputColor.a   = mix(decaySpeed*0.11,accumSpeed*2.9,h);
	//outputColor = vec4(0,0,0,1); //Uncomment to wipe accumulation buffer.
	//outputColor.r = 1.0-2.0*length(uv-vec2(0.5));
	//outputColor.a = 1.0;
}