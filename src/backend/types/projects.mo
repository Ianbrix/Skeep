import Common "common";

module {
  public type ProjectStatus = { #planning; #ongoing; #completed };

  public type Project = {
    id : Common.ProjectId;
    name : Text;
    description : Text;
    budgetAllocation : Nat;
    startDate : Common.Timestamp;
    endDate : ?Common.Timestamp;
    var status : ProjectStatus;
    var totalExpenses : Nat;
    createdAt : Common.Timestamp;
    var updatedAt : Common.Timestamp;
  };

  public type ProjectPublic = {
    id : Common.ProjectId;
    name : Text;
    description : Text;
    budgetAllocation : Nat;
    startDate : Common.Timestamp;
    endDate : ?Common.Timestamp;
    status : ProjectStatus;
    totalExpenses : Nat;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type AddProjectInput = {
    name : Text;
    description : Text;
    budgetAllocation : Nat;
    startDate : Common.Timestamp;
    endDate : ?Common.Timestamp;
  };
};
