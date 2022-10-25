#include "ofMain.h"
#include "ofApp.h"
#include "settings.h"

//========================================================================
int main( ){

    ofGLWindowSettings settings;
    //settings.setGLVersion(3, 2);
    settings.setGLVersion(4, 1);
#if(OF_VERSION_MAJOR == 0 && OF_VERSION_MINOR < 10)
    settings.width = AppPreferences::get()._appResolutionX;
    settings.height = AppPreferences::get()._appResolutionY; 
#else
    settings.setSize(AppPreferences::get()._appResolutionX,
                     AppPreferences::get()._appResolutionY);
#endif
    settings.setPosition(ofVec2f(0.f, 0.f));
    ofCreateWindow(settings);

    /*ofAppGlutWindow window;
    
    //Note : Using ofBuffer here generates warnings in the console.

    ofSetupOpenGL(AppPreferences::get()._appResolutionX,
                  AppPreferences::get()._appResolutionY,
                  AppPreferences::get()._isFullscreen? OF_FULLSCREEN:OF_WINDOW);*/

    ofRunApp(new ofApp());
}
