#include "sceneRenderUtils.h"
#include <ofBaseTypes.h>
#include <ofFbo.h>
#include "ofImage.h"
#include "ofGraphics.cpp"

namespace SceneRenderUtils
{
    static Tata t = Tata();
}


void SceneRenderUtils::allocateFbo(ofFbo& fbo, int x, int y)
{
    ofFbo::Settings fboSettings = ofFbo::Settings();
    fboSettings.width = x;
    fboSettings.height = y;
    fboSettings.minFilter = GL_LINEAR;// GL_NEAREST, GL_LINEAR etc. (GL_MIPMAP_____)?
    fboSettings.maxFilter = GL_LINEAR;
    fboSettings.wrapModeHorizontal = GL_MIRRORED_REPEAT; // GL_REPEAT, GL_MIRRORED_REPEAT, GL_CLAMP_TO_EDGE, GL_CLAMP_TO_BORDER etc.
    fboSettings.wrapModeVertical = GL_MIRRORED_REPEAT;

    fbo.allocate(fboSettings);
}

void SceneRenderUtils::drawBlanking(int iViewMinX,
                                    int iViewMinY,
                                    int iViewSizeX,
                                    int iViewSizeY,
                                    int viewBlankH,
                                    int viewBlankV)
{
    ofSetColor(ofColor::black);

    //Horizontal / Vertical Blanking
    ofDrawRectangle(iViewMinX, iViewMinY, viewBlankH, iViewSizeY);
    ofDrawRectangle(iViewMinX + iViewSizeX - viewBlankH, iViewMinY, viewBlankH, iViewSizeY);
    ofDrawRectangle(iViewMinX, iViewMinY, iViewSizeX, viewBlankV);
    ofDrawRectangle(iViewMinX, iViewMinY + iViewSizeY - viewBlankV, iViewSizeX, viewBlankV);

    ofSetColor(ofColor::white);
}

void SceneRenderUtils::takeSnapshot(const ofFbo& fbo, const std::string& sPath)
{
    ofImage exportImg;
    ofPixels exportPixels;
    exportImg.setUseTexture(false);
    exportPixels.allocate(fbo.getWidth(), fbo.getHeight(), OF_IMAGE_COLOR);
    fbo.readToPixels(exportPixels);
    exportImg.setFromPixels(exportPixels);
    exportImg.save(sPath, OF_IMAGE_QUALITY_BEST);
}

void SceneRenderUtils::debugDrawNodes(std::map<std::string, unique_ptr<IRenderPass>>& nodes, const appState& aState, int x, int y, int w, int h)
{
    int texIndex = aState._debugIndex % ((int)nodes.size() + 1);
    if (texIndex == 0)
        return;
    auto it = nodes.begin();
    std::advance(it, texIndex - 1);
    it->second->outputFbo().getTexture().draw(x, y, w, h);
    ofDrawBitmapStringHighlight(it->first, x + 10, 20);
    it->second->reload();
}
