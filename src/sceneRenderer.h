#pragma once
#ifndef SCENE_RENDERER_H
#include "statesDef.h"
#include "ofxOsc.h"
#include <ofTexture.h>
#include <ofCamera.h>
#include <ofBaseTypes.h>
#include <ofGLRenderer.h>
#include <string>
#include <ofFbo.h>
#include <functional>
#include <memory>
#include <render\accumulationPass.h>
#include <render\renderPass.h>
#include <render\blurPass.h>
#include <render\pingPongPass.h>


class ofAbstractImage;

class SceneRenderBase //ShaderGraph?
{
public:
    SceneRenderBase();
    virtual ~SceneRenderBase();

    void load(const params& parameters, const appState& aState);
    virtual void draw(const params&, const appState&);
    virtual void update(params& parameters, const appState& aState);
    virtual void reloadShaders();
    virtual void takeSnapshot(const std::string& sPath);
    
protected:
    virtual void setup(const params& parameters, const appState& aState);
    
    ofTexture& outputTex(const std::string& sPath);
    void debugDrawNodes(const params&, const appState&, int x, int y, int w, int h);
    void renderNodes(const params&, const appState&);
    void declareShader(const std::string& sName, IRenderPass* pass, std::function<void(ofShader& shader)> renderFunc = nullptr);
    void loadTexture(const std::string & sName, ofAbstractImage* img);
    
    std::vector<std::pair<IRenderPass*, std::function<void(ofShader& shader)>>> _renderList;
    std::map<std::string, std::unique_ptr<IRenderPass>> _nodes;
    //std::map<std::string, std::function<void(ofShader& shader)>> _nodeRenderFunc;
    std::map<std::string, std::unique_ptr<ofAbstractImage>> _texMaps;
    
    ofFbo _mainFbo;
    ofCamera _camera;
};

#endif // !SCENE_RENDERER_H
