#pragma once
#ifndef STATES_DEF_H

#include <ofColor.h>
#include <ofVec3f.h>

class AppPreferences;

struct params
{
    float _fA = 1.;
    float _fB = 1.;
    float _fC = 1.;

    //Experimental params
    float _morph = 0.;
    float _morphSmoothness = 5.;
    float _foldHeight = 0.7;
    float _smoothness = 0.5;
    float _bumpStrengh = 0.5;
    float _bumpFreq = 1.18;
    float _bumpThreshold = 0.7;
    float _baseRoughness = 0.1;
    float _vignette = 0.5;

    //Station 1 : Palette de couleurs
    std::vector<ofColor> _colorPalette;

    //Station 2 : Chiffonnement
    float _crumplingDist = 1.0;
    std::pair<ofVec3f, double> _crumplingL = { ofVec3f(-1,0,.1), 0. };
    std::pair<ofVec3f, double> _crumplingR = { ofVec3f(1,0.5/*height mult*/,0.4/*bump details*/), 0. };
    float _accumSpeed = 0.15f; //Pref
    float _accumDecay = 0.05f; //Pref
    float _accumRotationA = 0.0f; //Controlled
    float _accumRotationB = 0.0f; //Controlled
    float _accumMultA = 0.0f; //Controlled
    float _accumMultB = 0.0f; //Controlled
    ofVec2f _accumPositionA = ofVec2f(0.f, 0.f); //Controlled
    ofVec2f _accumPositionB = ofVec2f(0.f, 0.f); //Controlled
    ofVec2f _accumScaleA = ofVec2f(0.f, 0.f); //Controlled
    ofVec2f _accumScaleB = ofVec2f(0.f, 0.f); //Controlled

    //Station 3 : Composition
    float _compoDistance = 1.0;
    float _compoAngle = 0.;
    ofVec3f _compoL = ofVec3f(0, 0, 0);
    ofVec3f _compoR = ofVec3f(0, 0, 0);
    ofVec4f _compoIndexesL = ofVec4f(0.f,1.f,2.f,3.f);
    ofVec4f _compoIndexesR = ofVec4f(0.f,1.f,2.f,3.f);
    ofVec2f _compoUVL = ofVec2f(0.f, 0.f);
    ofVec2f _compoUVR = ofVec2f(0.f, 0.f);

    double _time = 0.0;

    struct sSnapshot
    {
        std::string sPath = "";
        bool bDone = true;
    };

    sSnapshot _snapshot;
};

struct appState
{
    AppPreferences* _prefs;

    int _debugIndex = 0;
    bool _paused = false;
    bool _bResetState = false;
    int _mouseX = 0;
    int _mouseY = 0;
    bool _helpShown = false; //Could go in prefs
    bool _parametersShown = false;
    bool _keyboardParamsActive = true;
    int _foreground_palette_idx = 0;
    int _background_palette_idx = 0;
};

#endif // !STATES_DEF_H
