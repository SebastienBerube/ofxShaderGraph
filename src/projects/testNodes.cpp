#include <iostream>
#include <ofImage.h>
#include <settings.h>
#include <sceneRenderer.h>
#include <sceneRenderUtils.h>
#include <render/pingPongPass.h>
#include <render/slopeBlurPass.h>
#include <projectManager.h>

#include <sceneRenderer.h>

class TestNodes : public SceneRenderBase
{
    void setup(const params& parameters, const appState& aState)
    {
        int resX = aState._prefs->_contentResolutionX;
        int resY = aState._prefs->_contentResolutionY;
        _camera.setPosition(ofVec3f(0, 0, 0));

        loadTexture("testImage", new ofShortImage("textures/tilesWarped.png"));
        
        declareShader("checkerboard_150", new RenderPass(resX, resY, "shaders/checkerboard_150", GL_RGBA8));

        declareShader("nodes/warpedShape_150", new RenderPass(resX, resY, "shaders/nodes/warpedShape_150", GL_RGBA8));

        declareShader("nodes/warp_150", new RenderPass(resX, resY, "shaders/nodes/warp_150", GL_RGBA8),
          [&](ofShader& s)
        {
          ofTexture& t = outputTex("checkerboard_150");
          s.setUniformTexture("inputTex", t, 0);
          s.setUniform2f("inputRes", t.getWidth(), t.getHeight());
        });

        declareShader("nodes/tiledShape_150", new RenderPass(resX, resY, "shaders/nodes/tiledShape_150", GL_RGBA8),
          [&](ofShader& s)
        {
          ofTexture& t = outputTex("nodes/warpedShape_150");
          s.setUniformTexture("inputTex", t, 0);
          s.setUniform2f("inputRes", t.getWidth(), t.getHeight());
        });

        declareShader("nodes/noise_150", new RenderPass(resX, resY, "shaders/nodes/noise_150", GL_RGBA8));

        declareShader("nodes/rgbnoise_150", new RenderPass(resX, resY, "shaders/nodes/rgbnoise_150", GL_RGBA8));

        declareShader("nodes/gradient_150", new RenderPass(resX, resY, "shaders/nodes/gradient_150", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputTex = outputTex("nodes/noise_150");
            s.setUniformTexture("inputTex", inputTex, 0);
            s.setUniform2f("inputRes", inputTex.getWidth(), inputTex.getHeight());
        });

        declareShader("nodes/displace_150", new RenderPass(resX, resY, "shaders/nodes/displace_150", GL_RGBA16F_ARB),
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
};

REGISTER_SCENE("TestNodes", new TestNodes());