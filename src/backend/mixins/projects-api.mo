import ProjectLib "../lib/projects";
import ProjectTypes "../types/projects";
import Common "../types/common";
import List "mo:core/List";

mixin (
  projects : List.List<ProjectTypes.Project>,
  projectState : { var nextProjectId : Common.ProjectId },
) {
  public shared func addProject(input : ProjectTypes.AddProjectInput) : async ProjectTypes.ProjectPublic {
    ProjectLib.addProject(projects, projectState, input);
  };

  public shared func updateProject(
    id : Common.ProjectId,
    input : ProjectTypes.AddProjectInput,
  ) : async ?ProjectTypes.ProjectPublic {
    ProjectLib.updateProject(projects, id, input);
  };

  public shared func deleteProject(id : Common.ProjectId) : async Bool {
    ProjectLib.deleteProject(projects, id);
  };

  public query func getProjects() : async [ProjectTypes.ProjectPublic] {
    ProjectLib.getProjects(projects);
  };

  public query func getProjectById(id : Common.ProjectId) : async ?ProjectTypes.ProjectPublic {
    ProjectLib.getProjectById(projects, id);
  };

  public shared func updateProjectStatus(
    id : Common.ProjectId,
    status : ProjectTypes.ProjectStatus,
  ) : async ?ProjectTypes.ProjectPublic {
    switch (projects.find(func(p) { p.id == id })) {
      case null { null };
      case (?project) {
        project.status := status;
        ?ProjectLib.toPublic(project);
      };
    };
  };

  public query func getActiveProjectsCount() : async Nat {
    projects.filter(func(p) { p.status == #ongoing }).size();
  };
};
