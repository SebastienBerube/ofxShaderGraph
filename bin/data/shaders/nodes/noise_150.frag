#version 150
/*
  Name : noise_150
  Description: Generates single channel perlin noise.

  UsageExample:
  {
    declareShader("nodes/noise_150", new RenderPass(1024, 768, "shaders/nodes/noise_150", GL_RGBA8));
  }

  Date Modified : 2019-06-13
  Date Tested : 2019-06-13
*/

out vec4 outputColor;
uniform vec2 iResolution;

//<Utils>
float hash12(vec2 p)
{
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}
float smoothSampling(in vec2 p) {
  p *= 64.;//Scaled like a 64x64 texture
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0 - 2.0*f);
  float a = hash12(i + vec2(0, 0)), b = hash12(i + vec2(1, 0));
  float c = hash12(i + vec2(0, 1)), d = hash12(i + vec2(1, 1));
  return a + (b - a)*u.x + (c - a)*u.y + (a - b - c + d)*u.x*u.y;
}
//</Utils>
mat2 mRot = mat2(.788, .616, -.616, .788 );

void main()
{
  vec2 uv = gl_FragCoord.xy / iResolution;
  uv *= 0.5; 
  float a = 0.50*smoothSampling(uv);         uv = mRot * uv;
        a+= 0.27*smoothSampling(uv * 1.891); uv = mRot * uv;
        a+= 0.14*smoothSampling(uv * 3.931); uv = mRot * uv;
        a+= 0.09*smoothSampling(uv * 7.913);

  outputColor.rgb = vec3(a);
  outputColor.a = 1.0;
}