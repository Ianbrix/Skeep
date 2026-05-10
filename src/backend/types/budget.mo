import Common "common";

module {
  public type Budget = {
    totalBudget : Nat;
    fiscalYear : Nat;
  };

  public type Allocation = {
    id : Common.AllocationId;
    name : Text;
    allocatedAmount : Nat;
    var spentAmount : Nat;
  };

  public type AllocationPublic = {
    id : Common.AllocationId;
    name : Text;
    allocatedAmount : Nat;
    spentAmount : Nat;
  };
};
