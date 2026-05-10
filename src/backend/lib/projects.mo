import ProjectTypes "../types/projects";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func addProject(
    projects : List.List<ProjectTypes.Project>,
    state : { var nextProjectId : Common.ProjectId },
    input : ProjectTypes.AddProjectInput,
  ) : ProjectTypes.ProjectPublic {
    let now = Time.now();
    let id = state.nextProjectId;
    state.nextProjectId += 1;
    let project : ProjectTypes.Project = {
      id;
      name = input.name;
      description = input.description;
      budgetAllocation = input.budgetAllocation;
      startDate = input.startDate;
      endDate = input.endDate;
      var status = #planning;
      var totalExpenses = 0;
      createdAt = now;
      var updatedAt = now;
    };
    projects.add(project);
    toPublic(project);
  };

  public func updateProject(
    projects : List.List<ProjectTypes.Project>,
    id : Common.ProjectId,
    input : ProjectTypes.AddProjectInput,
  ) : ?ProjectTypes.ProjectPublic {
    switch (projects.findIndex(func(p) { p.id == id })) {
      case null { null };
      case (?idx) {
        let old = projects.at(idx);
        let now = Time.now();
        let updated : ProjectTypes.Project = {
          id = old.id;
          name = input.name;
          description = input.description;
          budgetAllocation = input.budgetAllocation;
          startDate = input.startDate;
          endDate = input.endDate;
          var status = old.status;
          var totalExpenses = old.totalExpenses;
          createdAt = old.createdAt;
          var updatedAt = now;
        };
        projects.put(idx, updated);
        ?toPublic(updated);
      };
    };
  };

  public func deleteProject(
    projects : List.List<ProjectTypes.Project>,
    id : Common.ProjectId,
  ) : Bool {
    switch (projects.findIndex(func(p) { p.id == id })) {
      case null { false };
      case (?_) {
        let filtered = projects.filter(func(p) { p.id != id });
        projects.clear();
        projects.append(filtered);
        true;
      };
    };
  };

  public func getProjects(
    projects : List.List<ProjectTypes.Project>,
  ) : [ProjectTypes.ProjectPublic] {
    projects.map<ProjectTypes.Project, ProjectTypes.ProjectPublic>(func(p) { toPublic(p) }).toArray();
  };

  public func getProjectById(
    projects : List.List<ProjectTypes.Project>,
    id : Common.ProjectId,
  ) : ?ProjectTypes.ProjectPublic {
    switch (projects.find(func(p) { p.id == id })) {
      case null { null };
      case (?p) { ?toPublic(p) };
    };
  };

  public func updateProjectExpenses(
    projects : List.List<ProjectTypes.Project>,
    projectId : Common.ProjectId,
    amount : Nat,
  ) {
    switch (projects.find(func(p) { p.id == projectId })) {
      case null {};
      case (?project) {
        project.totalExpenses += amount;
        project.updatedAt := Time.now();
      };
    };
  };

  public func toPublic(p : ProjectTypes.Project) : ProjectTypes.ProjectPublic {
    {
      id = p.id;
      name = p.name;
      description = p.description;
      budgetAllocation = p.budgetAllocation;
      startDate = p.startDate;
      endDate = p.endDate;
      status = p.status;
      totalExpenses = p.totalExpenses;
      createdAt = p.createdAt;
      updatedAt = p.updatedAt;
    };
  };
};
