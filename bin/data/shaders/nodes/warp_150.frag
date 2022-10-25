#version 150
/*
 Name : warpedShape_150
 Description: Warps an arbitrary input texture.
 
 UsageExample:
 {
   //Arbitrary generated input..
   declareShader("checkerboard_150", new RenderPass(resX, resY, "shaders/checkerboard_150", GL_RGBA8));

   declareShader("nodes/warp_150", new RenderPass(resX, resY, "shaders/nodes/warp_150", GL_RGBA8),
                 [&](ofShader& s)
                 {
                   ofTexture& t = outputTex("checkerboard_150");
                   s.setUniformTexture("inputTex", t, 0);
                   s.setUniform2f("inputRes", t.getWidth(), t.getHeight());
                 });
 }

 Date Modified : 2019-06-11
 Date Tested : 2019-06-11
*/

out vec4 outputColor;
uniform vec2 iResolution;

uniform sampler2DRect inputTex;
uniform vec2          inputRes;

uniform float fTime;
uniform float noiseSeed = 1.0;
uniform float noiseFreq = 1.0;
uniform vec2 warpForce = vec2(0.9,.7);

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
vec2 warp_distort(vec2 uv, float fSeed){
    float vScroll = -fSeed/6.9;
	float hScroll = -fSeed/11.0;
    return smoothSampling(uv/13.0+vec2(hScroll,vScroll)).xy;
}
vec2 warp_distortMain(vec2 uv, float fSeed){
    vec2 distortDelta = warp_distort(noiseFreq*uv, fSeed).xy-0.5;
	distortDelta += .8*warp_distort(noiseFreq*uv*1.7, fSeed).xy-0.5;
    uv += vec2(distortDelta*.08)*warpForce/noiseFreq;
    return uv;
}
//</WARP Node>
void main()
{
  //vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord.xy/iResolution.xy;
  
  uv = warp_distortMain(uv.xy,noiseSeed);
  float h = texture2DRect(inputTex, inputRes*uv).x;
  
  outputColor.rgb = vec3(h);
  outputColor.a   = 1.0;
}





