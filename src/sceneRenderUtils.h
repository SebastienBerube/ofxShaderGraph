#pragma once
#ifndef SCENE_RENDER_UTILS_H


#include "statesDef.h"
#include "ofxOsc.h"
#include <ofTexture.h>
#include <ofCamera.h>
#include <ofBaseTypes.h>
#include <string>
#include <ofFbo.h>
#include <functional>
#include <memory>
#include <render\accumulationPass.h>
#include <render\renderPass.h>
#include <render\blurPass.h>
#include <render\pingPongPass.h>

//Original
/*#include <string>
#include <map>
#include <ofFbo.h>
#include <functional>
#include <memory>
#include <render\renderPass.h>
#include "statesDef.h"
*/

#include <ofCamera.h>

namespace SceneRenderUtils
{
    class Tata
    {
        ofFbo _mainFbo;
        ofCamera _camera;
    };
    void allocateFbo(ofFbo& fbo, int x, int y);
    void drawBlanking(int iViewMinX,
                      int iViewMinY,
                      int iViewSizeX,
                      int iViewSizeY,
                      int _viewBlankH,
                      int _viewBlankV);

    void takeSnapshot(const ofFbo& fbo, const std::string& sPath);
    void debugDrawNodes(std::map<std::string, std::unique_ptr<IRenderPass>>& nodes, const appState& aState, int x, int y, int w, int h);
};

#endif // !SCENE_RENDER_UTILS_H
