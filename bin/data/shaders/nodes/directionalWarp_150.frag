#version 150

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;

uniform sampler2DRect inputTex;
uniform vec2          inputRes;

float image(vec2 uv)
{
	 return texture2DRect(inputTex, inputRes*uv).x;
}

void main()
{
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord.xy/iResolution.xy;
	
	float h = image(uv);
	
	//uv.x += h*.45; //A little strong
	uv.x += h*.40; //A little strong
	h = image(uv);
	
	outputColor.rgb = vec3(h);
	outputColor.a   = 1.0;
}





