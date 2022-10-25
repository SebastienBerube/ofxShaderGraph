#pragma once
#ifndef PING_PONG_PASS_H
#include <string>
#include <ofFbo.h>
#include <ofShader.h>
#include <functional>
#include "renderPass.h"

class PingPongPass : public IRenderPass
{
public:
    ofFbo& renderFbo();
    ofFbo& inputFbo();

    std::string shaderName;

    PingPongPass(int x, int y, std::string prog, GLint gl_internal_fmt);
    virtual ~PingPongPass() {};

    void clear();
    void load(int x, int y, std::string prog, GLint gl_internal_fmt);
    virtual void reload() override;
    virtual void restart() override {};
    virtual ofFbo& outputFbo() override;

    void draw();
    void draw(std::function<void(ofShader& shader)> inputSetup);

private:
    bool _bEvenPass = false;
    ofFbo _fboA;
    ofFbo _fboB;
    ofShader _shader;
};

#endif //PING_PONG_PASS_H