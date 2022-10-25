#version 150

out vec4 outputColor;
uniform vec2 iResolution;

uniform sampler2DRect inputTex;
uniform vec2          inputTexRes;
uniform sampler2DRect inputNoise;
uniform vec2          inputNoiseRes;

uniform sampler2DRect selfTex;
uniform vec2          selfTexRes;

uniform int iFrameNo;
uniform int NPASSES = 3;
uniform int NSAMPLES = 32;
uniform float WARP_STRENGTH = 1.00;

vec4 getInitialTex(vec2 p){
	return texture2DRect(inputTex, inputTexRes*p);
}
vec4 getInputTex(vec2 p){
	return texture2DRect(selfTex, selfTexRes*p);
}
vec2 inputDisplacement(vec2 p){
	return texture2DRect(inputNoise, inputNoiseRes*p ).rg*.1;
}
vec2 warp(vec2 uv, float fTime){
	float fIntensity = WARP_STRENGTH/float(NSAMPLES);
    vec2 distortDelta = inputDisplacement(uv).xy;
    uv += distortDelta*fIntensity*4.;//Note : x4 here for parameter effect similar to Substance Designer.
                                     //Could also multiply the gradient effect to achieve the same result.
    return uv;
}

void main()
{
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord.xy/iResolution.xy;
	float fTime = 0.;
	
	vec4 cOut = getInputTex(uv);
	if(iFrameNo < NSAMPLES*NPASSES)
	{
		int iLocalFrameNo = iFrameNo%NSAMPLES;
		if(iLocalFrameNo==0)
			cOut = getInitialTex(uv);
		if(iLocalFrameNo > 0 && iLocalFrameNo<NSAMPLES)
		{
			vec2 colorUV = warp(uv,fTime);
			vec4 cWarp = getInputTex(colorUV);
			cOut = cWarp;
		} 
	}
    
    outputColor = cOut;
	outputColor.a   = 1.0;
}





