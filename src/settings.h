#pragma once
#ifndef SETTINGS_H
#include <string>

class AppPreferences
{
    AppPreferences();
    virtual ~AppPreferences();
    std::string _file;

public:
    static AppPreferences& get();
    void saveToFile();
    void applyContraints();

    std::string _hearbeatHost = "localhost";
    int _hearbeatPort = 12348;
    int _commandPort = 12347;
    int _appResolutionX = 1080;
    int _appResolutionY = 1080;
    int _viewResolutionX = 1080;
    int _viewResolutionY = 1080;
    int _contentResolutionX = 1080;
    int _contentResolutionY = 1080;
    int _viewMinX = 0;
    int _viewMinY = 0;
    int _viewBlankH = 0;
    int _viewBlankV = 0;
    float _viewScaleH = 1.001f;
    float _viewScaleV = 1.001f;
    bool _isFullscreen = true;
};


#endif //SETTINGS_H
