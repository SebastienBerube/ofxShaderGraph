#pragma once
#ifndef RENDER_PASS_H
#include <string>
#include <ofFbo.h>
#include <ofShader.h>
#include <functional>

class IRenderPass
{
public:
    virtual ~IRenderPass() {};
    virtual void reload() = 0;
    virtual void restart() = 0;
    virtual ofFbo& outputFbo() = 0;
    virtual void draw(std::function<void(ofShader& shader)> inputSetup) = 0;
};

class RenderPass : public IRenderPass
{
public:
    ofFbo fbo;
    ofShader shader;
    std::string shaderName;
    time_t shaderCompileTime;

    RenderPass(int x, int y, std::string prog, GLint gl_internal_fmt);
    virtual ~RenderPass() {};

    void load(int x, int y, std::string prog);
    void load(int x, int y, std::string prog, GLint gl_internal_fmt);
    virtual void reload() override;
    virtual ofFbo& outputFbo() override;
    virtual void restart() override {};

    void draw();
    void draw(std::function<void(ofShader& shader)> inputSetup);
};

#endif RENDER_PASS_H