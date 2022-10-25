#version 150

out vec4 outputColor;
uniform vec2 iResolution;

uniform sampler2DRect warpTex;
uniform vec2          warpTexRes;

uniform sampler2DRect selfTex;
uniform vec2          selfTexRes;

uniform int iFrameNo;
uniform int NSAMPLES = 32;
uniform int NPASSES = 3;

//------------------------------------
//  Blend nodes (daisy chained)
//------------------------------------
void main()
{
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord.xy/iResolution.xy;
	
	vec3 cW   = texture2DRect(warpTex, warpTexRes*uv).rgb;
    vec3 self = texture2DRect(selfTex, selfTexRes*uv).rgb;

	if(iFrameNo>= (NSAMPLES*NPASSES))
	{
		outputColor.rgb = self;
	}
	else
	{
		int iLocalFrameNo = iFrameNo%NSAMPLES;
		if(iLocalFrameNo==0)
			outputColor.rgb =  cW;
		else
		{
			float fOpacity = 1./(1.+iLocalFrameNo);
			vec3 cMix = mix(self,cW,fOpacity);
			if(iFrameNo<= (NSAMPLES*2))
				outputColor.rgb = min(cMix,self);
			else
				outputColor.rgb = .5*min(cMix,self)+.5*cMix;//min(cMix,self); //TODO : Externalize a "min" vs "blur" parameter (bool or enum)
		}
	}
	/*if(iFrameNo>=NSAMPLES)
		 outputColor.x =  cW;*/
	
	outputColor.a   = 1.0;
}





