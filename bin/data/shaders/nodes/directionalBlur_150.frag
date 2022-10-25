#version 150

out vec4 outputColor;
uniform vec2 iResolution;
uniform sampler2DRect sourceTex;
uniform vec2 sourceRes;
uniform float sigma;
uniform vec2 blurDir;

uniform int NSAMPLES = 30;
float flt[100];

vec3 image(vec2 uv){
	return texture2DRect(sourceTex, sourceRes*uv).rgb;
}
vec3 directionalGaussianBlur(vec2 uv, vec2 dir){
	int RAD = (NSAMPLES-1)/2;
    vec4 sum = vec4(0.0);
	for(int i=0; i<=RAD; ++i)
	{
	    float w = flt[i];
		sum += vec4(w*image(uv.xy-float(i)*dir),w);
	}
	for(int i=0; i<=RAD; ++i)
	{
	    float w = flt[i];
		sum += vec4(w*image(uv.xy+float(i)*dir),w);
	}
	
    return sum.rgb/(sum.w);
}
void main(){
	int RAD = (NSAMPLES-1)/2;
	outputColor = vec4(1,0,0,1);
	vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
    //The following line from : https://www.shadertoy.com/view/XdfGDH
	float sigmaOverride = sigma;
    for(int i = 0; i <= RAD; ++i)
        flt[i] = 0.39894*exp(-0.5*float(i*i)/(sigmaOverride*sigmaOverride))/sigmaOverride;
	vec2 uv = fragCoord.xy/iResolution.xy;
	outputColor.a = 1;
	outputColor.rgb = directionalGaussianBlur(uv, blurDir/sourceRes);
}