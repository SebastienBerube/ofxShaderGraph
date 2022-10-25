#pragma once

#include <vector>
#include <string>
#include <functional>
#include <SceneRenderer.h>

class ProjectManager
{
public:
    static void registerScene(const std::string& sceneName, std::function<SceneRenderBase*(void)> newSceneFunc);
    static void patate() {};
    std::vector<std::string> listScenes();
    SceneRenderBase* createScene(const std::string& sceneName);
    static ProjectManager& getInstance();

private:
    std::map<std::string,std::function<SceneRenderBase*(void)>> _projectSceneFactory;
};

#define REGISTER_SCENE(sceneName, newObj) \
namespace{ \
    struct doRegister { \
        doRegister() { \
            ProjectManager::registerScene(std::string(sceneName), [](void) { return newObj; }); \
        } \
    }; \
    doRegister doit; \
}
