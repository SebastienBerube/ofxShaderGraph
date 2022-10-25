#include "settings.h"
#include <ofBufferObject.h>
#include <ofxXmlSettings.h>

namespace AppPreferences_priv
{
    static AppPreferences* instance = nullptr;
};

AppPreferences& AppPreferences::get()
{
    if (AppPreferences_priv::instance == nullptr)
        AppPreferences_priv::instance = new AppPreferences();

    return *AppPreferences_priv::instance;
}

AppPreferences::AppPreferences()
{
    ofxXmlSettings settings;
    bool bFileExists = settings.loadFile("settings.xml");
    if (!bFileExists)
    {
        saveToFile();
        return;
    }

    _commandPort          = settings.getValue("settings:commandsPort", _commandPort);
    _hearbeatPort         = settings.getValue("settings:hearbeatPort", _hearbeatPort);
    _hearbeatHost         = settings.getValue("settings:hearbeatHost", _hearbeatHost);
    _appResolutionX       = settings.getValue("settings:appResolutionX",       _appResolutionX);
    _appResolutionY       = settings.getValue("settings:appResolutionY",       _appResolutionY);
    _contentResolutionX   = settings.getValue("settings:contentResolutionX",   _contentResolutionX);
    _contentResolutionY   = settings.getValue("settings:contentResolutionY",   _contentResolutionY);
    _viewResolutionX      = settings.getValue("settings:viewResolutionX",      _viewResolutionX);
    _viewResolutionY      = settings.getValue("settings:viewResolutionY",      _viewResolutionY);
    _viewMinX             = settings.getValue("settings:viewMinX",             _viewMinX);
    _viewMinY             = settings.getValue("settings:viewMinY",             _viewMinY);
    _viewScaleH           = settings.getValue("settings:viewScaleH",           _viewScaleH);
    _viewScaleV           = settings.getValue("settings:viewScaleV",           _viewScaleV);
    _viewBlankH           = settings.getValue("settings:viewBlankH",           _viewBlankH);
    _viewBlankV           = settings.getValue("settings:viewBlankV",           _viewBlankV);
    _isFullscreen         = settings.getValue("settings:fullscreen",           _isFullscreen);
}

void AppPreferences::saveToFile()
{
    applyContraints();

    ofxXmlSettings settings;
    settings.setValue("settings:commandsPort", _commandPort);
    settings.setValue("settings:hearbeatPort", _hearbeatPort);
    settings.setValue("settings:hearbeatHost", _hearbeatHost);
    settings.setValue("settings:appResolutionX",       _appResolutionX);
    settings.setValue("settings:appResolutionY",       _appResolutionY);
    settings.setValue("settings:viewResolutionX",      _viewResolutionX);
    settings.setValue("settings:viewResolutionY",      _viewResolutionY);
    settings.setValue("settings:contentResolutionX",   _contentResolutionX);
    settings.setValue("settings:contentResolutionY",   _contentResolutionY);
    settings.setValue("settings:viewMinX",             _viewMinX);
    settings.setValue("settings:viewMinY",             _viewMinY);
    settings.setValue("settings:viewScaleH",           _viewScaleH);
    settings.setValue("settings:viewScaleV",           _viewScaleV);
    settings.setValue("settings:viewBlankH",           _viewBlankH);
    settings.setValue("settings:viewBlankV",           _viewBlankV);
    settings.setValue("settings:fullscreen",           _isFullscreen);
    settings.saveFile("settings.xml"); //puts settings.xml file in the bin/data folder
}

void AppPreferences::applyContraints()
{
    _appResolutionX       = ofClamp(_appResolutionX, 256, 8192);
    _appResolutionY       = ofClamp(_appResolutionY, 256, 8192);
    _viewResolutionX      = ofClamp(_viewResolutionX, 256, 8192);
    _viewResolutionY      = ofClamp(_viewResolutionY, 256, 8192);
    _contentResolutionX   = ofClamp(_contentResolutionX, 32, 8192);
    _contentResolutionY   = ofClamp(_contentResolutionY, 32, 8192);
    _viewMinX             = ofClamp(_viewMinX, -8192, 8192);
    _viewMinY             = ofClamp(_viewMinY, -8192, 8192);
    _viewScaleH           = ofClamp(_viewScaleH, 0.05f, 50.f);
    _viewScaleV           = ofClamp(_viewScaleV, 0.05f, 50.f);
    _viewBlankH           = ofClamp(_viewBlankH, 0, _viewResolutionX*.4f);
    _viewBlankV           = ofClamp(_viewBlankV, 0, _viewResolutionY*.4f);
}

AppPreferences::~AppPreferences()
{

}
