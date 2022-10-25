#version 150

out vec4 outputColor;
uniform vec2 iResolution;

uniform sampler2D inputTex;

void main(){
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord/iResolution.xy;
	outputColor = vec4(uv,texture2D(inputTex, uv).x,1);
}



































