#include "renderPass.h"
#include <ofGraphics.h>
#include <ofVec2f.h>

#include <iostream>
#include <ofImage.h>

namespace
{
    ofFbo::Settings getSettings(int x, int y)
    {
        ofFbo::Settings fboSettings = ofFbo::Settings();
        fboSettings.width = x;
        fboSettings.height = y;
        fboSettings.minFilter = GL_LINEAR;// GL_NEAREST, GL_LINEAR etc. (GL_MIPMAP_____)?
        fboSettings.maxFilter = GL_LINEAR;
        fboSettings.wrapModeHorizontal = GL_MIRRORED_REPEAT; // GL_REPEAT, GL_MIRRORED_REPEAT, GL_CLAMP_TO_EDGE, GL_CLAMP_TO_BORDER etc.
        fboSettings.wrapModeVertical = GL_MIRRORED_REPEAT;
        //fboSettings.textureTarget = GL_TEXTURE_2D;
        return fboSettings;
    }

    void allocateFbo(ofFbo& fbo, int x, int y, GLint gl_internal_fmt)
    {
        ofFbo::Settings fboSettings = getSettings(x, y);
        fboSettings.internalformat = gl_internal_fmt; //GL_LUMINANCE16F GL_LUMINANCE16_ARB //Note : 32bbp exists
        fbo.allocate(fboSettings);
    }

    void allocateFbo(ofFbo& fbo, int x, int y)
    {
        ofFbo::Settings fboSettings = getSettings(x, y);
        fbo.allocate(fboSettings);
    }
}

RenderPass::RenderPass(int x, int y, std::string prog, GLint gl_internal_fmt)
{
    load(x, y, prog, gl_internal_fmt);
}

void RenderPass::load(int x, int y, std::string prog, GLint gl_internal_fmt)
{
    shaderName = prog;
    std::string fileWithExt = prog + ".frag";
    bool bLoaded = shader.load("shaders/nodes/generic_150.vert", fileWithExt);

    if (!bLoaded && ofFile(fileWithExt).exists())
      std::cout << "error loading shader - file does not exists : " << fileWithExt << std::endl;

    shaderCompileTime = std::time(nullptr);
    if(gl_internal_fmt==-1)
      allocateFbo(fbo, x, y);
    else
      allocateFbo(fbo, x, y, gl_internal_fmt);
    
    fbo.begin();
    ofClear(0, 0, 0, 255);
    
    fbo.end();
}

void RenderPass::load(int x, int y, std::string prog)
{
  load(x, y, prog, -1);
}

void RenderPass::reload()
{
    ofFile f = ofFile(shaderName + ".frag");
    if (f.exists())
    {
        time_t fileTime = std::filesystem::last_write_time(f);
        if (fileTime > shaderCompileTime)
        {
            shader.unload();
            shader.load("shaders/nodes/generic_150.vert", shaderName + ".frag");
            shaderCompileTime = std::time(nullptr);
        }
    }
}

ofFbo& RenderPass::outputFbo()
{
    return fbo;
}

void RenderPass::draw()
{
    draw(nullptr);
}

void RenderPass::draw(std::function<void(ofShader& shader)> inputSetup)
{
    fbo.begin();
    {
        shader.begin();
        {
            if(inputSetup!=nullptr)
                inputSetup(shader);
            shader.setUniform2f("iResolution", ofVec2f(fbo.getWidth(), fbo.getHeight()));
            //fbo.draw(0, 0); //This works with shaders #version 120, using ftransform() on vertex position
            ofDrawRectangle(-1, -1, 2, 2); //This works with shaders #version 150, where vertex position is untransformed in vert shader
        }
        shader.end();
    }
    fbo.end();
}
