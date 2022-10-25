#version 150
/*
  Name : rgbnoise_150
  Description: Generates RGB perlin noise.

  UsageExample:
  {
    declareShader("nodes/rgbnoise_150", new RenderPass(1024, 768, "shaders/nodes/rgbnoise_150", GL_RGBA8));
  }

  Date Modified : 2019-06-13
  Date Tested : 2019-06-13
*/

out vec4 outputColor;
uniform vec2 iResolution;

//<Utils>
vec3 hash32(vec2 p){
  //https://www.shadertoy.com/view/4djSRW  Dave_Hoskins
  vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yxz+19.19);
  return fract((p3.xxy+p3.yzz)*p3.zyx);
}
vec3 smoothSampling(in vec2 p) {
  p *= 64.;//Scaled like a 64x64 texture
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0 - 2.0*f);
  //4 corner bilinear interpolation below, from elevated:
  vec3 a = hash32(i + vec2(0, 0)), b = hash32(i + vec2(1, 0));
  vec3 c = hash32(i + vec2(0, 1)), d = hash32(i + vec2(1, 1));
  return vec3(a + (b - a)*u.x + (c - a)*u.y + (a - b - c + d)*u.x*u.y);
}
//</Utils>
mat2 mRot = mat2(.788, .616, -.616, .788);

void main()
{
  vec2 uv = gl_FragCoord.xy / iResolution;
  uv *= 0.5;
  
  vec3 a  = 0.50*smoothSampling(uv);         uv = mRot * uv;
       a += 0.27*smoothSampling(uv * 1.891); uv = mRot * uv;
       a += 0.14*smoothSampling(uv * 3.931); uv = mRot * uv;
       a += 0.09*smoothSampling(uv * 7.913);

  outputColor.rgb = a;
  outputColor.a = 1.0;
}