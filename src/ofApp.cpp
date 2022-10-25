#include "ofApp.h"
#include "infoDisplay.h"
#include "settings.h"
#include <projectManager.h>
#include <string>
#include <sceneRenderUtils.h>

std::string selectScene(ProjectManager& prjMan)
{
    for (int i = 0; i < (int)prjMan.listScenes().size(); ++i){
        printf("%d. %s\n", i, prjMan.listScenes()[i].c_str());
    }
    int iScene = -1;
    do{
        printf("\n\n Select Scene: ");
        std::string sScene;
        std::cin >> sScene;
        iScene = atoi(sScene.c_str());
    } while (iScene < 0 || iScene >= prjMan.listScenes().size());
    return prjMan.listScenes()[iScene];
}

//--------------------------------------------------------------
void ofApp::setup(){
    if (!AppPreferences::get()._isFullscreen)
    {
        gui.setup();
        gui.add(fSliderA.setup("A", _params._fA, 0.f, 5.f));
        gui.add(fSliderB.setup("B", _params._fB, 0.f, 5.f));
        gui.add(fSliderC.setup("C", _params._fC, 0.f, 5.f));
    }
    
    _state._prefs = &AppPreferences::get();
    //_comm.setup();
    ProjectManager& prjMan = ProjectManager::getInstance();
    std::string sceneName = selectScene(prjMan);
    ofSetLogLevel(OF_LOG_VERBOSE);
    ofLogToConsole();
    SceneRenderBase* loadedScene = prjMan.createScene(sceneName);
    _renderer.reset(loadedScene);
    _renderer->load(_params, _state);
}

//--------------------------------------------------------------
void ofApp::update() {
    //NOTE : Deactivated since OSC drives it.
    if (!_state._paused)
        _params._time = float(ofGetElapsedTimeMillis()) / 1000.f;
    
    //_comm.update(_params);
    _renderer->update(_params,_state);
    _state._bResetState = false;

    if (!AppPreferences::get()._isFullscreen)
    {
        _params._fA = fSliderA;
        _params._fB = fSliderB;
        _params._fC = fSliderC;
    }
}

void ofApp::draw() {

    _renderer->draw(_params, _state);
    if (_params._snapshot.bDone == false && !_params._snapshot.sPath.empty())
    {
        _renderer->takeSnapshot(_params._snapshot.sPath);
        _params._snapshot.bDone = true;
        _params._snapshot.sPath = "";
    }

    displayHelp(_params, _state);

    if (!AppPreferences::get()._isFullscreen)
        gui.draw();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){


    //---------------------
    //Display Help
    if (key == OF_KEY_F1){
        _state._helpShown = !_state._helpShown;
    }
    //---------------------
    //Display Parameters
    else if (key == 'P' || key == 'p') {
        _state._parametersShown = !_state._parametersShown;
    }
    //---------------------
    //Keyboard Params On/Off
    else if (key == 'K' || key == 'k') {
        _state._keyboardParamsActive = !_state._keyboardParamsActive;
    }
    //---------------------
    //Keyboard Params On/Off
    else if (key == 'F' || key == 'f') {
        _state._prefs->saveToFile();
    }
    /*else if (key == 'T' || key == 't') {
        _state._paused = !_state._paused;
    }*/
    //---------------------
    //Move canvas
    else if (key == OF_KEY_LEFT) {  _state._prefs->_viewMinX-= 1;  }
    else if (key == OF_KEY_DOWN) {  _state._prefs->_viewMinY += 1; }
    else if (key == OF_KEY_RIGHT) { _state._prefs->_viewMinX += 1; }
    else if (key == OF_KEY_UP) {    _state._prefs->_viewMinY -= 1; }
    //---------------------
    //Scale canvas down
    else if (key == '<' || key == ',') {

        int iOldViewSizeX = _state._prefs->_viewResolutionX*_state._prefs->_viewScaleH;
        int iOldViewSizeY = _state._prefs->_viewResolutionY*_state._prefs->_viewScaleV;

        _state._prefs->_viewScaleH -= 0.005;
        _state._prefs->_viewScaleV -= 0.005;

        int iNewViewSizeX = _state._prefs->_viewResolutionX*_state._prefs->_viewScaleH;
        int iNewViewSizeY = _state._prefs->_viewResolutionY*_state._prefs->_viewScaleV;

        _state._prefs->_viewMinX -= (iNewViewSizeX - iOldViewSizeX) / 2;
        _state._prefs->_viewMinY -= (iNewViewSizeY - iOldViewSizeY) / 2;
    }
    //---------------------
    //Scale canvas up
    else if (key == '>' || key == '.') {
        int iOldViewSizeX = _state._prefs->_viewResolutionX*_state._prefs->_viewScaleH;
        int iOldViewSizeY = _state._prefs->_viewResolutionY*_state._prefs->_viewScaleV;

        _state._prefs->_viewScaleH += 0.005;
        _state._prefs->_viewScaleV += 0.005;

        int iNewViewSizeX = _state._prefs->_viewResolutionX*_state._prefs->_viewScaleH;
        int iNewViewSizeY = _state._prefs->_viewResolutionY*_state._prefs->_viewScaleV;

        _state._prefs->_viewMinX -= (iNewViewSizeX - iOldViewSizeX) / 2;
        _state._prefs->_viewMinY -= (iNewViewSizeY - iOldViewSizeY) / 2;
    }
    //---------------------
    //H Blanking
    else if (key == '1' ) { _state._prefs->_viewBlankH -= 1; }
    else if (key == '2') {  _state._prefs->_viewBlankH += 1; }
    //---------------------
    //V Blanking
    else if (key == '3') { _state._prefs->_viewBlankV -= 1; }
    else if (key == '4') { _state._prefs->_viewBlankV += 1; }
    //---------------------
    //Scale canvas up
    else if (key == '>' || key == '.') {
        _state._prefs->_viewScaleH += 0.005;
        _state._prefs->_viewScaleV += 0.005;
    }
    else if (key == OF_KEY_F5) {
        _renderer->reloadShaders();
    }
    //---------------------
    //Debug texture index
    else if (key == '9') { _state._debugIndex = max(0, _state._debugIndex-1); }
    else if (key == '0') { _state._debugIndex += 1; }
    //---------------------
    //Reset states and timers
    else if (key == 'R' || key == 'r') { _state._bResetState = true; }
    //Make sure settings are properly bounded.
    _state._prefs->applyContraints();
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){
    _state._mouseX = x;
    _state._mouseY = y;
}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}

ofApp::~ofApp()
{
    AppPreferences::get().saveToFile();
}
