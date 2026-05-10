import BudgetTypes "../types/budget";
import Common "../types/common";
import List "mo:core/List";

module {
  func toPublicAllocation(a : BudgetTypes.Allocation) : BudgetTypes.AllocationPublic {
    { id = a.id; name = a.name; allocatedAmount = a.allocatedAmount; spentAmount = a.spentAmount };
  };

  public func setBudget(
    budgetState : { var currentBudget : ?BudgetTypes.Budget },
    totalBudget : Nat,
    fiscalYear : Nat,
  ) : BudgetTypes.Budget {
    let b : BudgetTypes.Budget = { totalBudget; fiscalYear };
    budgetState.currentBudget := ?b;
    b;
  };

  public func getBudget(
    budgetState : { var currentBudget : ?BudgetTypes.Budget },
  ) : ?BudgetTypes.Budget {
    budgetState.currentBudget;
  };

  public func addAllocation(
    allocations : List.List<BudgetTypes.Allocation>,
    state : { var nextAllocationId : Common.AllocationId },
    name : Text,
    amount : Nat,
  ) : BudgetTypes.AllocationPublic {
    let id = state.nextAllocationId;
    state.nextAllocationId += 1;
    let alloc : BudgetTypes.Allocation = {
      id;
      name;
      allocatedAmount = amount;
      var spentAmount = 0;
    };
    allocations.add(alloc);
    toPublicAllocation(alloc);
  };

  public func updateAllocation(
    allocations : List.List<BudgetTypes.Allocation>,
    id : Common.AllocationId,
    name : Text,
    amount : Nat,
  ) : ?BudgetTypes.AllocationPublic {
    switch (allocations.findIndex(func(a) { a.id == id })) {
      case null { null };
      case (?idx) {
        let old = allocations.at(idx);
        let updated : BudgetTypes.Allocation = {
          id = old.id;
          name;
          allocatedAmount = amount;
          var spentAmount = old.spentAmount;
        };
        allocations.put(idx, updated);
        ?toPublicAllocation(updated);
      };
    };
  };

  public func deleteAllocation(
    allocations : List.List<BudgetTypes.Allocation>,
    id : Common.AllocationId,
  ) : Bool {
    switch (allocations.findIndex(func(a) { a.id == id })) {
      case null { false };
      case (?_) {
        let filtered = allocations.filter(func(a) { a.id != id });
        allocations.clear();
        allocations.append(filtered);
        true;
      };
    };
  };

  public func getAllocations(
    allocations : List.List<BudgetTypes.Allocation>,
  ) : [BudgetTypes.AllocationPublic] {
    allocations.map<BudgetTypes.Allocation, BudgetTypes.AllocationPublic>(func(a) { toPublicAllocation(a) }).toArray();
  };

  public func getRemainingBalance(
    budgetState : { var currentBudget : ?BudgetTypes.Budget },
    totalExpenses : Nat,
  ) : ?Nat {
    switch (budgetState.currentBudget) {
      case null { null };
      case (?b) {
        if (totalExpenses > b.totalBudget) { ?0 }
        else { ?(b.totalBudget - totalExpenses) };
      };
    };
  };
};
