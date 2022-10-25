#version 150
/*
  Name : displace_150
  Description: Transfer RGBA input texture values using displacement RG texture to alter uv mapping.
 
  Date Modified : 2019-06-13
  Date Tested : 2019-06-13

  UsageExample:
  {
    //Arbitrary generated input..
    declareShader("nodes/warpedShape_150", new RenderPass(1024, 768, "shaders/nodes/warpedShape_150", GL_RGBA8));
    declareShader("nodes/rgbnoise_150", new RenderPass(1024, 768, "shaders/nodes/rgbnoise_150", GL_RGBA8));
    declareShader("nodes/gradient_150", new RenderPass(1024, 768, "shaders/nodes/gradient_150", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputTex = outputTex("nodes/noise_150");
            s.setUniformTexture("inputTex", inputTex, 0);
            s.setUniform2f("inputRes", inputTex.getWidth(), inputTex.getHeight());
        });

    //Calling shader on image "warpedShape" using the noise RG gradient
    declareShader("nodes/displace_150", new RenderPass(1024, 768, "shaders/nodes/displace_150", GL_RGBA16F_ARB),
          [&](ofShader& s)
        {
          ofTexture& inputTex = outputTex("nodes/warpedShape_150");
          ofTexture& displaceTex = outputTex("nodes/gradient_150");

          s.setUniformTexture("inputTex", inputTex, 0);
          s.setUniformTexture("displaceTex", displaceTex, 1);
          s.setUniform2f("inputRes", inputTex.getWidth(), inputTex.getHeight());
          s.setUniform2f("displaceRes", displaceTex.getWidth(), displaceTex.getHeight());
        });
  }
*/
out vec4 outputColor;
uniform vec2 iResolution;

uniform sampler2DRect inputTex;
uniform sampler2DRect displaceTex;
uniform vec2          inputRes;

vec4 image(vec2 uv){
  return texture2DRect(inputTex, inputRes*uv);
}

vec2 displacement(vec2 uv){
  return texture2DRect(displaceTex, inputRes*uv).rg;
}

void main(){
  //vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord/iResolution.xy;
  
  float repeatFreq = 1.;
  float fStrength = 0.06*0.7/repeatFreq;
  outputColor = image(uv + displacement(fract(uv*repeatFreq))*fStrength);
}
