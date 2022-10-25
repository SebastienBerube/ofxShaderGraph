ofxShaderGraph (2018, Open Frameworks app)
=======

![gif](http://i.gyazo.com/0442dd6b215c5eb5e0afcdd6997d9d32.gif)

*ofxShaderGraph* is an Open Framworks app that was implemented to quickly create a network of pixel shaders nodes by code.
The concept is similar to Texture Operators in Touch Designer, or shader node graphs in Substance Painter.
See:
- https://derivative.ca/UserGuide/TOP
- https://substance3d.adobe.com/documentation/sddoc/slope-blur-159450467.html

This app is very limited, and the original purpose was to create a simple shader interface for an interactive museum exhibition.
The following *Abstrak* project was based on this ofxShaderGraph app: https://en.4elements.media/case-studies/abstrak

One interesting texture processing concept implemented in this application is the Slope Blur.
The Slope Blur can be used to "chip" an height map to add interesting details, for example. This process is demonstrated in the first animated gif.

### How to build and run
- Download install OpenFrameworks: https://openframeworks.cc/download/
- Clone this repo inside OF\apps\myApps folder of OpenFrameworks
- Install GenerativeCubeMap inside OF\addons folder of OpenFrameworks
- Run the OpenFrameworks projectGenerator to generate VS project files for ofxShaderGraph
- Compile and run ofxShaderGraph in Visual Studio or in another IDE compatible with OF


Below, some example code showing how to add and link shader nodes
-------------
```
    void setup(const params& parameters, const appState& aState)
    {
        int resX = aState._prefs->_contentResolutionX;
        int resY = aState._prefs->_contentResolutionY;
        _camera.setPosition(ofVec3f(0, 0, 0));

        loadTexture("tiles", new ofShortImage("textures/tilesWarped.png"));
        loadTexture("noise", new ofShortImage("textures/noise.png"));

        declareShader("gradient", new RenderPass(resX, resY, "shaders/nodes/gradient_150_arb", GL_RGBA16F_ARB),
            [&](ofShader& s)
        {
            ofTexture& inputNoise = _texMaps["noise"]->getTexture();
            s.setUniformTexture("inputTex", inputNoise, 0);
            s.setUniform2f("inputRes", inputNoise.getWidth(), inputNoise.getHeight());
        });
        declareShader("slopeBlur", new SlopeBlurPass(resX, resY),
            [&](ofShader& s)
        {
            int frameNo = ((SlopeBlurPass*)_nodes["slopeBlur"].get())->getFrameNo();
            ofTexture& initialTexture = _texMaps["tiles"]->getTexture();
            ofTexture& selfCopy = outputTex("slopeBlur");
            ofTexture& inputTex = (frameNo == 0) ? initialTexture : selfCopy; //Iterate of itself after frame zero
            ofTexture& inputNoise = outputTex("gradient");
            
            s.setUniformTexture("inputTex", inputTex, 1);
            s.setUniform2f("inputTexRes", inputTex.getWidth(), inputTex.getHeight());
            s.setUniformTexture("inputNoise", inputNoise, 2);
            s.setUniform2f("inputNoiseRes", inputNoise.getWidth(), inputNoise.getHeight());
            s.setUniform1f("fTime", parameters._time);

            float fWarpStrength = 1.00f;
            s.setUniform1f("WARP_STRENGTH", fWarpStrength);
        });
```
