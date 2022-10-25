#pragma once
#ifndef SLOPE_BLUR_PASS_H
#include <string>
#include <ofFbo.h>
#include <ofShader.h>
#include <functional>
#include "renderPass.h"
#include "pingPongPass.h"

class SlopeBlurPass : public IRenderPass
{
public:
    SlopeBlurPass(int xRes, int yRes, GLint gl_internal_fmt = GL_R32F/*GL_LUMINANCE32F_ARB*/);
    virtual ~SlopeBlurPass() {};

    void load(int xRes, int yRes, GLint gl_internal_fmt = GL_R32F/*GL_LUMINANCE32F_ARB*/);
    //The step is the pixel count for each sample. Optimal quality at 1.0, increased range if > 1.
    void draw(ofTexture& tex, float sigma, int N = 30, float step = 1.0f);

    virtual void draw(std::function<void(ofShader& shader)> inputSetup) override;
    virtual void reload() override;
    virtual void restart() override;;
    virtual ofFbo& outputFbo() override;
    
    PingPongPass _warpPass;
    PingPongPass _blendPass;

    int getFrameNo() const;

    int _frameNo = 0;
    float _step = 1.f; //default step
};

#endif //SLOPE_BLUR_PASS_H
