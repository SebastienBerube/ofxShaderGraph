#include "pingPongPass.h"
#include <ofGraphics.h>
#include <ofVec2f.h>


ofFbo& PingPongPass::renderFbo()
{
    return _bEvenPass ? _fboA : _fboB;
}

ofFbo& PingPongPass::outputFbo()
{
    //This one becomes output only AFTER draw (which switches the even flag)
    return _bEvenPass ? _fboB : _fboA;
}

ofFbo& PingPongPass::inputFbo()
{
    return _bEvenPass ? _fboB : _fboA;
}

PingPongPass::PingPongPass(int x, int y, std::string prog, GLint gl_internal_fmt)
{
    load(x, y, prog, gl_internal_fmt);
}

void PingPongPass::clear()
{
    //Optional
    _fboA.begin();
    ofClear(0, 0, 0, 255);
    _fboA.end();

    _fboB.begin();
    ofClear(0, 0, 0, 255);
    _fboB.end();
}

void PingPongPass::load(int x, int y, std::string prog, GLint gl_internal_fmt)
{
    shaderName = prog;
    _shader.load("shaders/nodes/generic_150.vert", shaderName + ".frag");

    ofFbo::Settings fboSettings = ofFbo::Settings();
    fboSettings.width = x;
    fboSettings.height = y;
    //fboSettings.textureTarget = GL_TEXTURE_2D; //We would like to use this instead of GL_TEXTURE_RECTANGLE, but for now it does not seem to work.
    fboSettings.internalformat = gl_internal_fmt; //See suggestions associated with value
    fboSettings.minFilter = GL_LINEAR;// GL_NEAREST, GL_LINEAR etc. (GL_MIPMAP_____)?
    fboSettings.maxFilter = GL_LINEAR;
    fboSettings.wrapModeHorizontal = GL_MIRRORED_REPEAT; // GL_REPEAT, GL_MIRRORED_REPEAT, GL_CLAMP_TO_EDGE, GL_CLAMP_TO_BORDER etc.
    fboSettings.wrapModeVertical = GL_MIRRORED_REPEAT;

    _fboA.allocate(fboSettings);
    _fboB.allocate(fboSettings);
    
    clear();
}

void PingPongPass::reload()
{
    _shader.unload();
    _shader.load("shaders/nodes/generic_150.vert", shaderName + ".frag");
}

void PingPongPass::draw()
{
    draw(nullptr);
}

void PingPongPass::draw(std::function<void(ofShader& shader)> inputSetup)
{
    renderFbo().begin();
    {
        _shader.begin();
        {
            if (inputSetup != nullptr)
                inputSetup(_shader);

            _shader.setUniform2f("iResolution", ofVec2f(renderFbo().getWidth(), renderFbo().getHeight()));
            ofDrawRectangle(-1, -1, 2, 2); //This works with shaders #version 150, where vertex position is untransformed in vert shader
        }
        _shader.end();
    }
    renderFbo().end();
    _bEvenPass = !_bEvenPass;
}
