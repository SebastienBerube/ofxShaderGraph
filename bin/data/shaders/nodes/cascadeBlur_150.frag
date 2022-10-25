#version 150

out vec4 outputColor;
uniform vec2 iResolution;
uniform sampler2DRect sourceTex;
uniform vec2 sourceRes;
uniform sampler2DRect selfTex;

const int NSAMPLES = 12;
const int RAD = (NSAMPLES-1)/2;
const float SIGMA = 3.0;
float flt[RAD+1];

//Converts from canvas space to texture lod tile space
vec2 mainToTile_uv(vec2 uv, int lod){
    float scaleDenom = exp2(float(lod+1));
	float xOffset = 1.0-(2.0/scaleDenom);
    return (uv-vec2(xOffset,0))*scaleDenom;
}
//Local space (tile uv:[0-1] to global uv)
vec2 tileToMain_uv(vec2 uv, int lod){
    float scaleDenom = exp2(float(lod+1));
	float xOffset = 1.0-(2.0/scaleDenom);
    return uv/scaleDenom+vec2(xOffset,0);
}
vec3 source(vec2 uv){
    return texture2DRect(sourceTex, sourceRes*uv).rgb;
}
vec3 self(vec2 uv){
	//FIXME : Y-Axis Flip
	//        Hint : This line must be flipped at the same time as the other one below in "main()"
    //return texture2DRect(selfTex, iResolution*vec2(uv.x,1.-uv.y) ).rgb;
	return texture2DRect(selfTex, iResolution*uv/*vec2(uv.x,1.-uv.y)*/ ).rgb;
}
vec3 image(vec2 uv, int lod, bool bUseOriginal){
    uv = clamp(uv,vec2(0),vec2(1)); //This helps a little with edge artifacts.
    return bUseOriginal?source(uv):
	                    self(tileToMain_uv(uv,lod-1));
}
vec3 directionalGaussianBlur(vec2 uv, vec2 dir, int LOD, bool bUseOriginal){
    vec4 sum = vec4(0.0);
	for(int i=-RAD; i<=RAD; ++i)
	    sum += vec4(flt[abs(i)]*image((uv.xy+float(i)*dir),LOD,bUseOriginal),flt[abs(i)]);
    return sum.rgb/(sum.w);
}
void main(){
	
	//FIXME : Y-Axis Flip
	//        Hint : This line must be flipped at the same time as the other one above in "self(vec2 uv)"
	//        This has me believing that fbo.draw() draws upside-down
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = vec2(gl_FragCoord.x, gl_FragCoord.y);

    //The following line from : https://www.shadertoy.com/view/XdfGDH
    for(int i = 0; i <= RAD; ++i)
        flt[i] = 0.39894*exp(-0.5*float(i*i)/(SIGMA*SIGMA))/SIGMA;
	
	vec2 uv = fragCoord.xy/iResolution.xy;
    int LOD = int(log2(1./(1.-uv.x)));
    vec2 currentRes = iResolution.xy/exp2(float(LOD+1));
    
    bool bUseOriginal = (uv.y<.5&&LOD==0);
    vec2 blurDir      = (uv.y<.5)?vec2(1,0):vec2(0,1);
    vec2 uvTile       = (uv.y<.5)?mainToTile_uv(uv,LOD)
                                 :mainToTile_uv(uv-vec2(0,.5),LOD);
    int sourceLOD     = (uv.y<.5)?LOD:LOD+1;
    
	outputColor.a = 1;
	outputColor.r = 1;
    if(uvTile.y<1.0)
		outputColor.rgb = directionalGaussianBlur(uvTile, blurDir/currentRes, sourceLOD, bUseOriginal);
}