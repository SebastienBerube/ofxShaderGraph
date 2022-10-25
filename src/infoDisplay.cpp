#include "infoDisplay.h"
#include "settings.h"
#include <ofGraphics.h>
#include <ofUtils.h>

std::string toNormalizedString(const ofColor& c)
{
    char cBuf[255];
    sprintf_s<255>(cBuf, "[%1.3f %1.3f %1.3f %1.3f]", c.r/255.f, c.g / 255.f, c.b / 255.f, c.a / 255.f);
    return cBuf;
}

void displayHelp(const params& parameters, const appState& applicationState)
{
    // display instructions
    if (applicationState._helpShown)
    {
        std::string buf;
        ofDrawBitmapStringHighlight("Quick Help", 10, 20);

        int iLine = 2;
        ofDrawBitmapStringHighlight("Keyboard Commands",        10, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[F1]     Show/Hide Help",  25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[P]      Show/Hide Parameters", 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[K]      Keyboard on/off", 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[F]      Save settings",   25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[Arrows] Nudge canvas ",   25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[1/2]    Horz Blanking",   25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[3/4]    Vert Blanking",   25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("[</>]    Scale canvas",    25, 25 * (iLine++));
        iLine++;
        ofDrawBitmapStringHighlight("Settings", 10, 25 * (iLine++));
        ofDrawBitmapStringHighlight("View Scale : [" + ofToString(applicationState._prefs->_viewScaleH) + ";"
                                                     + ofToString(applicationState._prefs->_viewScaleV) + "]", 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("View Resolution : [" + ofToString(applicationState._prefs->_viewResolutionX) + ";"
                                                          + ofToString(applicationState._prefs->_viewResolutionY) + "]", 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("View Top Corner : [" + ofToString(applicationState._prefs->_viewMinX) + ";"
                                                          + ofToString(applicationState._prefs->_viewMinY) + "]", 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("Content Resolution : [" + ofToString(applicationState._prefs->_contentResolutionX) + ";"
                                                             + ofToString(applicationState._prefs->_contentResolutionY) + "]", 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("View Blank H/V  : [" + ofToString(applicationState._prefs->_viewBlankH) + ";"
                                                          + ofToString(applicationState._prefs->_viewBlankV) + "]", 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("Commands port   : " + ofToString(applicationState._prefs->_commandPort), 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("Hearbeat port   : " + ofToString(applicationState._prefs->_hearbeatPort), 25, 25 * (iLine++));
        ofDrawBitmapStringHighlight("Hearbeat host   : " + ofToString(applicationState._prefs->_hearbeatHost), 25, 25 * (iLine++));
    }
}

