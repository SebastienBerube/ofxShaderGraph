#include <iostream>
#include <ofImage.h>
#include <settings.h>
#include <sceneRenderer.h>
#include <sceneRenderUtils.h>
#include <render/pingPongPass.h>
#include <render/slopeBlurPass.h>
#include <projectManager.h>

#include <sceneRenderer.h>

class BrickMaterial : public SceneRenderBase //ShaderGraph?
{
    void setup(const params& parameters, const appState& aState)
    {
        int resX = aState._prefs->_contentResolutionX;
        int resY = aState._prefs->_contentResolutionY;
        _camera.setPosition(ofVec3f(0, 0, 0));

        loadTexture("tiles", new ofShortImage("textures/tilesWarped.png"));
        loadTexture("noise", new ofShortImage("textures/noise.png"));
        loadTexture("noise2", new ofShortImage("textures/noise2.png"));
        loadTexture("noise3", new ofShortImage("textures/noise3.png"));
        loadTexture("Bnw_spots_3", new ofShortImage("textures/Bnw_spots_3.png"));
        loadTexture("slupeBlur3_outTest", new ofShortImage("textures/slupeBlur3_outTest.png"));

        declareShader("gradient", new RenderPass(resX, resY, "shaders/nodes/gradient_150_arb", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputNoise = _texMaps["noise"]->getTexture();
            s.setUniformTexture("inputTex", inputNoise, 0);
            s.setUniform2f("inputRes", inputNoise.getWidth(), inputNoise.getHeight());
        });
        declareShader("gradient2", new RenderPass(resX, resY, "shaders/nodes/gradient_150_arb", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputNoise = _texMaps["noise2"]->getTexture();
            s.setUniformTexture("inputTex", inputNoise, 0);
            s.setUniform2f("inputRes", inputNoise.getWidth(), inputNoise.getHeight());
        });
        declareShader("gradient3", new RenderPass(resX, resY, "shaders/nodes/gradient_150_arb", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputNoise = _texMaps["noise3"]->getTexture();
            s.setUniformTexture("inputTex", inputNoise, 0);
            s.setUniform2f("inputRes", inputNoise.getWidth(), inputNoise.getHeight());
        });
        declareShader("slopeBlur", new SlopeBlurPass(resX, resY),
            [&](ofShader& s)
        {
            int frameNo = ((SlopeBlurPass*)_nodes["slopeBlur"].get())->getFrameNo();
            ofTexture& inputTex = (frameNo == 32 || frameNo == 64) ? outputTex("slopeBlur") : _texMaps["tiles"]->getTexture(); //outputTex("directionalWarp");
            ofTexture& inputNoise = (frameNo < 32) ? outputTex("gradient") : (frameNo < 64) ? outputTex("gradient2") : outputTex("gradient3");
            
            s.setUniformTexture("inputTex", inputTex, 1);
            s.setUniform2f("inputTexRes", inputTex.getWidth(), inputTex.getHeight());
            s.setUniformTexture("inputNoise", inputNoise, 2);
            s.setUniform2f("inputNoiseRes", inputNoise.getWidth(), inputNoise.getHeight());
            s.setUniform1f("fTime", parameters._time);

            const int NPASSES = 3;
            const int NSAMPLES = 32;
            
            float fWarpStrength = 1.06f;
            if (frameNo >= NSAMPLES)
                fWarpStrength = 3.2;
            if (frameNo >= (NSAMPLES * 2))
                fWarpStrength = 0.33;

            s.setUniform1f("WARP_STRENGTH", fWarpStrength);
            
        });
        declareShader("blendAdd", new RenderPass(resX, resY, "shaders/nodes/blendAdd_150", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& texA = outputTex("slopeBlur");
            ofTexture& texB = _texMaps["Bnw_spots_3"]->getTexture();
            ofTexture& texC = _texMaps["tiles"]->getTexture();
            s.setUniformTexture("inputTexA", texA, 1);
            s.setUniformTexture("inputTexB", texB, 2);
            s.setUniformTexture("inputTexC", texC, 3);
            s.setUniform2f("inputResA", texA.getWidth(), texA.getHeight());
            s.setUniform2f("inputResB", texB.getWidth(), texB.getHeight());
            s.setUniform2f("inputResC", texC.getWidth(), texC.getHeight());
            s.setUniform1f("fOpacityAB", 0.15f);
            s.setUniform1f("fOpacityBC", 0.15f);
        });
        declareShader("blur", new BlurPass(resX, resY),
            [&](ofShader& s)
        {
            static float blur_sigma = 2.f / 5.f;
            static int nSamples = 5;

            ofTexture& tex = outputTex("blendAdd");
            //ofTexture& tex = _texMaps.slupeBlur3_outTest.getTexture();
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
            ofTexture& inputTex = outputTex("slopeBlur");
            ofTexture& inputTex2 = outputTex("normals");
            s.setUniformTexture("brickHeightTex", inputTex, 1);
            s.setUniformTexture("brickNormalTex", inputTex2, 2);
            s.setUniform2f("brickHeightRes", inputTex.getWidth(), inputTex.getHeight());
            s.setUniform1f("fTime", parameters._time);
        });
    }
};

REGISTER_SCENE("BrickMaterial", new BrickMaterial());