#include "blurPass.h"
#include "renderPass.h"
#include <ofGraphics.h>

BlurPass::BlurPass(int xRes, int yRes, GLint gl_internal_fmt /*GL_R32F*/)
    : _blurRenderPassX(xRes, yRes, "shaders/nodes/directionalBlur_150", gl_internal_fmt)
    , _blurRenderPassY(xRes, yRes, "shaders/nodes/directionalBlur_150", gl_internal_fmt)
{
}

void BlurPass::load(int xRes, int yRes, GLint gl_internal_fmt /*GL_R32F*/)
{
    _blurRenderPassX.load(xRes, yRes, "shaders/nodes/directionalBlur_150", gl_internal_fmt);
    _blurRenderPassY.load(xRes, yRes, "shaders/nodes/directionalBlur_150", gl_internal_fmt);
}

void BlurPass::reload()
{
    _blurRenderPassX.reload();
    _blurRenderPassY.reload();
}

ofFbo& BlurPass::outputFbo()
{
    return _blurRenderPassY.fbo;
}

void BlurPass::draw(std::function<void(ofShader& shader)> inputSetup)
{
    _blurRenderPassX.draw([&](ofShader& s) {
        inputSetup(s);
        s.setUniform2f("blurDir", _step, 0.);
    });

    _blurRenderPassY.draw([&](ofShader& s) {
        inputSetup(s);
        //<OPTME>
        //Here, "sourceTex" is set twice, by inputSetup(s) and below to override with the first horizontal pass.
        //A solution to skip this unnecessary step should be thought of.
        s.setUniformTexture("sourceTex", _blurRenderPassX.fbo.getTexture(), 1);
        s.setUniform2f("sourceRes", _blurRenderPassX.fbo.getWidth(), _blurRenderPassX.fbo.getHeight());
        //</OPTME>
        s.setUniform2f("blurDir", 0., _step);
    });
}

void BlurPass::draw(ofTexture& tex, float sigma, int nSamples, float step)
{
    _blurRenderPassX.draw([&](ofShader& s) {
        s.setUniformTexture("sourceTex", tex, 1);
        s.setUniform2f("sourceRes", tex.getWidth(), tex.getHeight());
        s.setUniform2f("blurDir", step, 0.);
        s.setUniform1f("sigma", sigma);
        s.setUniform1i("NSAMPLES", nSamples);
    });

    _blurRenderPassY.draw([&](ofShader& s) {
        s.setUniformTexture("sourceTex", _blurRenderPassX.fbo.getTexture(), 1);
        s.setUniform2f("sourceRes", _blurRenderPassX.fbo.getWidth(), _blurRenderPassX.fbo.getHeight());
        s.setUniform2f("blurDir", 0., step);
        s.setUniform1f("sigma", sigma);
        s.setUniform1i("NSAMPLES", nSamples);
    });
}
