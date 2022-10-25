#version 150

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;

uniform sampler2DRect inputTex;
uniform vec2          inputRes;

void main()
{
	vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 uv = fragCoord.xy/iResolution.xy;
	
	float h = texture2DRect(inputTex, inputRes*uv).x;
	
	outputColor.rgb = vec3(h);
	outputColor.a   = 1.0;
}





