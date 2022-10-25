#pragma once
#ifndef BLUR_PASS_H
#include <string>
#include <ofFbo.h>
#include <ofShader.h>
#include <functional>
#include "renderPass.h"

class BlurPass : public IRenderPass
{
public:
    BlurPass(int xRes, int yRes, GLint gl_internal_fmt = GL_R32F);
    virtual ~BlurPass() {};

    void load(int xRes, int yRes, GLint gl_internal_fmt = GL_R32F);
    //The step is the pixel count for each sample. Optimal quality at 1.0, increased range if > 1.
    void draw(ofTexture& tex, float sigma, int N = 30, float step = 1.0f);

    virtual void draw(std::function<void(ofShader& shader)> inputSetup) override;
    virtual void reload() override;
    virtual void restart() override {};
    virtual ofFbo& outputFbo() override;
    
    RenderPass _blurRenderPassX;
    RenderPass _blurRenderPassY;

    float _step = 1.f; //default step
};

#endif BLUR_PASS_H
