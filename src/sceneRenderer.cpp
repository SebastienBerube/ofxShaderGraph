#include <string>
#include <iostream>
#include <ofGraphics.h>
#include <ofImage.h>
#include "settings.h"
#include "sceneRenderer.h"
#include "sceneRenderUtils.h"
#include "pingPongPass.h"
#include "slopeBlurPass.h"


SceneRenderBase::SceneRenderBase()
{}

SceneRenderBase::~SceneRenderBase()
{}


void SceneRenderBase::loadTexture(const std::string & sName, ofAbstractImage* img)
{
    //
    ////https://forum.openframeworks.cc/t/sampler2d-instead-of-sampler2drect/23401
    //Hi, if you add a ofDisableArbTex() before loading any image or when allocating an FBO make sure you set
    ////ofEnableArbTex()
    //textureTarget	= GL_TEXTURE_2D;
    //You will get a texture that does not use the GL_ARB_texture_rectangle functionality and works with sampler2D.
    //

    _texMaps[sName] = std::unique_ptr<ofAbstractImage>(img);
}

void SceneRenderBase::declareShader(const std::string & sName, IRenderPass * pass, std::function<void(ofShader&shader)> renderFunc)
{
  if (_nodes.find(sName) == _nodes.end())
  {
    _renderList.push_back({ pass,renderFunc });
    _nodes[sName] = std::unique_ptr<IRenderPass>(pass);
  }
  else
    printf("Error : duplicated shader name : %s\n", sName.c_str());
  
}

void SceneRenderBase::setup(const params& parameters, const appState& aState)
{
}

void SceneRenderBase::renderNodes(const params& lParams, const appState& aState) {
    ofClear(ofColor(0., 0., 0., 0.));
    for (auto& it : _renderList)
    {
        it.first->draw(it.second);
    }
}

void SceneRenderBase::load(const params & parameters, const appState & aState)
{
    setup(parameters, aState);
    SceneRenderUtils::allocateFbo(_mainFbo, aState._prefs->_contentResolutionX,
                                            aState._prefs->_contentResolutionY);
}

void SceneRenderBase::draw(const params& parameters, const appState& aState){
    renderNodes(parameters, aState);

    _mainFbo.begin();
    {
        ofClear(ofColor(255., 0., 0., 0.));
        if (_nodes.size() > 0)
        {
            ofFbo& blurFbo = (_nodes.find("main") != _nodes.end()) ? _nodes["scene"]->outputFbo() : _nodes.begin()->second->outputFbo();
            blurFbo.getTextureReference().draw(0, 0);
        }
    }
    _mainFbo.end();

    ofClear(ofColor::black); //Perf OPTME

    int iViewMinX = aState._prefs->_viewMinX;
    int iViewMinY = aState._prefs->_viewMinY;
    int iViewSizeX = aState._prefs->_viewResolutionX*aState._prefs->_viewScaleH;
    int iViewSizeY = aState._prefs->_viewResolutionY*aState._prefs->_viewScaleV;

    _mainFbo.draw(iViewMinX, iViewMinY, iViewSizeX, iViewSizeY);
    SceneRenderUtils::drawBlanking(iViewMinX, iViewMinY, iViewSizeX, iViewSizeY, aState._prefs->_viewScaleH, aState._prefs->_viewScaleV);
    debugDrawNodes(parameters, aState, iViewMinX + iViewSizeX + 5, 0, 800, 800);
}

ofTexture& SceneRenderBase::outputTex(const std::string& sPath)
{
    return _nodes[sPath]->outputFbo().getTexture();
}

void SceneRenderBase::update(params& parameters, const appState& aState) {
    if(aState._bResetState)
        for (auto& it : _nodes)
            it.second->restart();
}

void SceneRenderBase::reloadShaders() {
    for (auto& it : _nodes)
        it.second->reload();
}

void SceneRenderBase::takeSnapshot(const std::string& sPath){
    SceneRenderUtils::takeSnapshot(_mainFbo, sPath);
}

void SceneRenderBase::debugDrawNodes(const params&, const appState& aState, int x, int y, int w, int h){
    SceneRenderUtils::debugDrawNodes(_nodes, aState, x, y, w, h);
}
