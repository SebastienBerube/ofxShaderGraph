#include "slopeBlurPass.h"
#include <ofGraphics.h>

SlopeBlurPass::SlopeBlurPass(int xRes, int yRes, GLint gl_internal_fmt)
    : _warpPass(xRes, yRes, "shaders/nodes/slopeBlurWarp_150", gl_internal_fmt)
    , _blendPass(xRes, yRes, "shaders/nodes/slopeBlurBlend_150", gl_internal_fmt)
{
}

void SlopeBlurPass::load(int xRes, int yRes, GLint gl_internal_fmt)
{
    _warpPass.load(xRes, yRes, "shaders/nodes/slopeBlurWarp_150", gl_internal_fmt);
    _blendPass.load(xRes, yRes, "shaders/nodes/slopeBlurBlend_150", gl_internal_fmt);
}

void SlopeBlurPass::reload()
{
    _warpPass.reload();
    _blendPass.reload();
}

inline void SlopeBlurPass::restart()
{
    _frameNo = 0;
}

ofFbo& SlopeBlurPass::outputFbo()
{
    return _blendPass.outputFbo();
    //return _warpPass.outputFbo();
}

int SlopeBlurPass::getFrameNo() const
{
    return _frameNo;
}

void SlopeBlurPass::draw(std::function<void(ofShader& shader)> inputSetup)
{
    _warpPass.draw([&](ofShader& s) {
        inputSetup(s);
        s.setUniformTexture("selfTex", _warpPass.outputFbo(), 0);
        s.setUniform2f("selfTexRes", _warpPass.outputFbo().getWidth(), _warpPass.outputFbo().getHeight());
        s.setUniform1i("iFrameNo", _frameNo);
        s.setUniform2f("iResolution", _warpPass.outputFbo().getWidth(), _warpPass.outputFbo().getHeight());
    });

    _blendPass.draw([&](ofShader& s) {
        s.setUniformTexture("warpTex", _warpPass.outputFbo(), 0);
        s.setUniform2f("warpTexRes", _warpPass.outputFbo().getWidth(), _warpPass.outputFbo().getHeight());

        //<OPTME : Use proper alpha blend param instead of feeding self>
        s.setUniformTexture("selfTex", _blendPass.outputFbo(), 1);
        s.setUniform2f("selfTexRes", _blendPass.outputFbo().getWidth(), _blendPass.outputFbo().getHeight());
        //</OPTME>

        s.setUniform2f("iResolution", _blendPass.outputFbo().getWidth(), _blendPass.outputFbo().getHeight());
        s.setUniform1i("iFrameNo", _frameNo);
    });

    ++_frameNo;
}
