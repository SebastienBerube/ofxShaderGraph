#include "accumulationPass.h"
#include "renderPass.h"
#include <ofGraphics.h>
#include "AccumulationPass.h"

void AccumulationPass::load(int xRes, int yRes)
{
    _pass.load(xRes, yRes, "shaders/nodes/accumulator_150", GL_LUMINANCE16F_ARB);
}

void AccumulationPass::draw(ofTexture & tex,
                            ofVec2f positionA, ofVec2f scaleA, float rotationA, float accumMutlA,
                            ofVec2f positionB, ofVec2f scaleB, float rotationB, float accumMutlB,
                            float accumSpeed, float decaySpeed)
{
    _pass.draw([&](ofShader& s) {
        s.setUniformTexture("inputTex", tex, 1);
        s.setUniform2f("inputRes", tex.getWidth(), tex.getHeight());
        s.setUniform2f("positionA", positionA);
        s.setUniform2f("positionB", positionB);
        s.setUniform2f("scaleA", scaleA);
        s.setUniform2f("scaleB", scaleB);
        s.setUniform1f("multA", accumMutlA);
        s.setUniform1f("multB", accumMutlB);
        s.setUniform1f("rotationA", rotationA);
        s.setUniform1f("rotationB", rotationB);
        s.setUniform1f("decaySpeed", decaySpeed);
        s.setUniform1f("accumSpeed", accumSpeed);
    });
}

void AccumulationPass::reload()
{
    _pass.reload();
}

ofFbo AccumulationPass::outputFbo()
{
    return _pass.fbo;
}
