#pragma once
#ifndef ACCUMULATION_PASS_H
#include <string>
#include <ofFbo.h>
#include <ofShader.h>
#include <ofVec2f.h>
#include <functional>
#include "renderPass.h"

class AccumulationPass
{
public:
    void load(int xRes, int yRes);
    
    void draw(ofTexture & tex,
              ofVec2f positionA, ofVec2f scaleA, float rotationA, float accumMutlA,
              ofVec2f positionB, ofVec2f scaleB, float rotationB, float accumMutlB,
              float accumSpeed, float decaySpeed);

    void reload();

    ofFbo outputFbo();

    RenderPass _pass;
};

#endif ACCUMULATION_PASS_H