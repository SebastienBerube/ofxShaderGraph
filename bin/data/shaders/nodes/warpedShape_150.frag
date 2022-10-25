#version 150
/*
 Name : warpedShape_150
 Description: Generates and warps a shape.

 UsageExample:
 {
    declareShader("nodes/warpedShape_150", new RenderPass(1024, 768, "shaders/nodes/warpedShape_150", GL_RGBA8));
 }

 Date Modified : 2019-06-11
 Date Tested : 2019-06-11
*/

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;

//<Utils>
#define HASHSCALE3 vec3(.1031, .1030, .0973)
vec2 hash22(vec2 p){
    //https://www.shadertoy.com/view/4djSRW  Dave_Hoskins
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}
vec2 smoothSampling( in vec2 p) {
    p*=64.;//Scaled like a 64x64 texture
    vec2 i = floor( p ); vec2 f = fract( p );	
	vec2 u = f*f*(3.0-2.0*f);
    //4 corner bilinear interpolation below, from elevated:
	vec2 a = hash22(i + vec2(0,0)), b = hash22(i + vec2(1,0));
	vec2 c = hash22(i + vec2(0,1)), d = hash22(i + vec2(1,1));
    return vec2(a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y);
}
//</Utils>
//<WARP Node>
const float PRE_DISTORT_STRENGTH = 0.15;
const float DISTORT_STRENGTH = 0.08;
vec2 warp_distort(vec2 uv, float fTime){
    float vScroll = -fTime/6.9;
	float hScroll = -fTime/11.0;
    return smoothSampling(uv/13.0+vec2(hScroll,vScroll)).xy;
}
vec2 warp_distortMain(vec2 uv, float fTime){
    vec2 distortDelta = warp_distort(uv, fTime*0.1).xy-0.5;
	distortDelta += .8*warp_distort(uv*1.7, fTime*0.1).xy-0.5;
    uv += vec2(distortDelta*.08)*vec2(1.,0.5);
    return uv;
}
//</WARP Node>
//<Shape Node>
float dShape(vec2 uv, float r){
    float d = max(abs(uv.x),abs(uv.y));
    d = -(d-r)/r;
    return d;
}
//</Shape Node>

void main()
{
  vec2 uv = gl_FragCoord.xy/iResolution;
  float lTime = 107.73; //Freeze time where effect is best
  
  float uv_scale = 0.6;
  vec2 uv_offset = vec2(0.5,0.5);
  
  uv = (uv-uv_offset)*uv_scale;
  
  vec2 colorUV = warp_distortMain(uv.xy*vec2(1,-1) /*Rotate & Flip, to mimic Substance Designer effect*/,lTime);
  vec4 cOut = vec4(dShape(colorUV,0.25));
  
  outputColor.rgb = vec3(dShape(colorUV,0.25));
  outputColor.a   = 1.0;
}



