#include <string>
#include <iostream>
#include <settings.h>
#include <sceneRenderer.h>
#include <ofImage.h>
#include <sceneRenderUtils.h>
#include <render/pingPongPass.h>
#include <render/slopeBlurPass.h>
#include <projectManager.h>

#include <sceneRenderer.h>

class SlopeBlurWarpUV : public SceneRenderBase //ShaderGraph?
{
    void setup(const params& parameters, const appState& aState) override
    {
        int resX = aState._prefs->_contentResolutionX;
        int resY = aState._prefs->_contentResolutionY;
        _camera.setPosition(ofVec3f(0, 0, 0));

        loadTexture("noise3", new ofShortImage("textures/noise3.png"));
        loadTexture("noise1", new ofShortImage("textures/noise.png"));
        loadTexture("warpA", new ofShortImage("textures/slopeBlur1_output.png"));
        
        declareShader("uvImage", new RenderPass(resX, resY, "shaders/nodes/uvImage", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            //s.setUniform2f("inputRes", { inputNoiseA.getWidth(),inputNoiseA.getHeight() });
        });
        /*declareShader("gradient3", new RenderPass(resX, resY, "shaders/nodes/gradient_150", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputNoise = _texMaps["noise3"]->getTexture();
            s.setUniformTexture("inputTex", inputNoise, 0);
            s.setUniform2f("inputRes", inputNoise.getWidth(), inputNoise.getHeight());
        });*/
        declareShader("gradient3", new RenderPass(resX, resY, "shaders/nodes/gradient_150", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputNoise = _texMaps["noise3"]->getTexture();
            s.setUniformTexture("inputTex", inputNoise, 0);
            s.setUniform2f("inputRes", inputNoise.getWidth(), inputNoise.getHeight());
        });

        /* 2018-12-05 : The slope blur seems to mainly warp towards a sigle direction. To be investigated.
           2018-12-06 : Invesigate : Could this be caused by the "max/min" height condition in slope blur warp shader?
        */

        declareShader("slopeBlur", new SlopeBlurPass(resX, resY, GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            int frameNo = ((SlopeBlurPass*)_nodes["slopeBlur"].get())->getFrameNo();
            
            ofTexture& inputTex = outputTex("uvImage");
            ofTexture& inputNoise = outputTex("gradient3");

            s.setUniformTexture("inputTex", inputTex, 1);
            s.setUniform2f("inputTexRes", inputTex.getWidth(), inputTex.getHeight());
            s.setUniformTexture("inputNoise", inputNoise, 2);
            s.setUniform2f("inputNoiseRes", inputNoise.getWidth(), inputNoise.getHeight());
            s.setUniform1f("fTime", parameters._time);
        });
        declareShader("displace", new RenderPass(resX, resY, "shaders/nodes/displace_150", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputTex = _texMaps["warpA"]->getTexture();
            ofTexture& displaceTex = outputTex("slopeBlur");

            s.setUniformTexture("inputTex", inputTex, 0);
            s.setUniformTexture("displaceTex", displaceTex, 1);
            s.setUniform2f("inputRes", inputTex.getWidth(), inputTex.getHeight());
            s.setUniform2f("displaceRes", displaceTex.getWidth(), displaceTex.getHeight());
        });

        declareShader("blur", new BlurPass(resX, resY),
            [&](ofShader& s)
        {
            static float blur_sigma = 2.f / 5.f;
            static int nSamples = 5;

            ofTexture& tex = outputTex("displace");
            s.setUniformTexture("sourceTex", tex, 1);
            s.setUniform2f("sourceRes", tex.getWidth(), tex.getHeight());
            s.setUniform1f("sigma", blur_sigma);
            s.setUniform1i("NSAMPLES", nSamples);
        });
        declareShader("normals", new RenderPass(resX, resY, "shaders/nodes/normals_150", GL_RGBA32F_ARB),
            [&](ofShader& s)
        {
            ofTexture& tex = outputTex("blur");
            s.setUniformTexture("inputTex", tex, 1);
            s.setUniform2f("inputRes", tex.getWidth(), tex.getHeight());
        });
        declareShader("scene", new RenderPass(resX, resY, "shaders/nodes/heightMapDisplay_150", GL_RGB8),
            [&](ofShader& s)
        {
            ofTexture& inputTex = outputTex("displace");
            ofTexture& inputTex2 = outputTex("normals");
            ofTexture& inputGradTest = outputTex("gradient3");

            s.setUniformTexture("brickHeightTex", inputTex, 1);
            s.setUniformTexture("brickNormalTex", inputTex2, 2);
            s.setUniformTexture("inputGradTest", inputGradTest, 3);
            
            s.setUniform2f("brickHeightRes", inputTex.getWidth(), inputTex.getHeight());
            s.setUniform1f("fTime", parameters._time);
        });

    }
};

REGISTER_SCENE("SlopeBlurWarpUV", new SlopeBlurWarpUV());