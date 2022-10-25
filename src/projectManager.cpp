#include <projectManager.h>
#include <memory>

std::unique_ptr<ProjectManager> _instance;// == nullptr;

void ProjectManager::registerScene(const std::string& sceneName, std::function<SceneRenderBase*(void)> newSceneFunc)
{
    getInstance()._projectSceneFactory[sceneName] = newSceneFunc;
}

ProjectManager& ProjectManager::getInstance()
{
    if (_instance == nullptr)
        _instance.reset(new ProjectManager());

    return *_instance;
}

std::vector<std::string> ProjectManager::listScenes()
{
    std::vector<std::string> sceneNames;
    for (auto& item : _projectSceneFactory)
        sceneNames.push_back(item.first);
    return sceneNames;
}

SceneRenderBase* ProjectManager::createScene(const std::string& sceneName)
{
    auto it = _projectSceneFactory.find(sceneName);
    if (it != _projectSceneFactory.end())
    {
        return it->second();
    }
    return nullptr;
}
