#pragma once

#include "ofMain.h"
#include "ofxOsc.h"
#include "ofxGui.h"
#include "statesDef.h"
#include "sceneRenderer.h"
#include <ofColor.h>
#include <chrono>
#include <memory>

// listen on port 12345
#define PORT 12345
#define NUM_MSG_STRINGS 20

class ofApp : public ofBaseApp{

    virtual ~ofApp();

	public:
		void setup();
		void update();
		void draw();

		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y );
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void mouseEntered(int x, int y);
		void mouseExited(int x, int y);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
        
private:
        //oscComm _comm;
        std::unique_ptr<SceneRenderBase> _renderer;
        params _params;
        appState _state;

        ofxFloatSlider fSliderA;
        ofxFloatSlider fSliderB;
        ofxFloatSlider fSliderC;

        ofxPanel gui;
};
