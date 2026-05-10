import BudgetLib "../lib/budget";
import TxTypes "../types/transactions";
import BudgetTypes "../types/budget";
import Common "../types/common";
import List "mo:core/List";

mixin (
  allocations : List.List<BudgetTypes.Allocation>,
  budgetState : { var currentBudget : ?BudgetTypes.Budget; var nextAllocationId : Common.AllocationId },
  transactions : List.List<TxTypes.Transaction>,
) {
  func computeExpenses() : Nat {
    transactions
      .filter(func(t) { t.txType == #expenses or t.txType == #cashAdvance or t.txType == #projectExpenses })
      .foldLeft(0 : Nat, func(acc : Nat, t : TxTypes.Transaction) : Nat { acc + t.amount });
  };

  public shared func setBudget(totalBudget : Nat, fiscalYear : Nat) : async BudgetTypes.Budget {
    BudgetLib.setBudget(budgetState, totalBudget, fiscalYear);
  };

  public query func getBudget() : async ?BudgetTypes.Budget {
    BudgetLib.getBudget(budgetState);
  };

  public shared func addAllocation(name : Text, amount : Nat) : async BudgetTypes.AllocationPublic {
    BudgetLib.addAllocation(allocations, budgetState, name, amount);
  };

  public shared func updateAllocation(
    id : Common.AllocationId,
    name : Text,
    amount : Nat,
  ) : async ?BudgetTypes.AllocationPublic {
    BudgetLib.updateAllocation(allocations, id, name, amount);
  };

  public shared func deleteAllocation(id : Common.AllocationId) : async Bool {
    BudgetLib.deleteAllocation(allocations, id);
  };

  public query func getAllocations() : async [BudgetTypes.AllocationPublic] {
    BudgetLib.getAllocations(allocations);
  };

  public query func getRemainingBalance() : async ?Nat {
    BudgetLib.getRemainingBalance(budgetState, computeExpenses());
  };

  public query func getDashboardSummary() : async {
    totalBudget : ?Nat;
    totalIncome : Nat;
    totalExpenses : Nat;
    remainingBalance : ?Nat;
    activeProjectsCount : Nat;
  } {
    let totalExpenses = computeExpenses();
    let totalIncome = transactions
      .filter(func(t) { t.txType == #income or t.txType == #reimbursement })
      .foldLeft(0 : Nat, func(acc : Nat, t : TxTypes.Transaction) : Nat { acc + t.amount });
    let totalBudget = switch (budgetState.currentBudget) {
      case null { null };
      case (?b) { ?b.totalBudget };
    };
    let remainingBalance = BudgetLib.getRemainingBalance(budgetState, totalExpenses);
    {
      totalBudget;
      totalIncome;
      totalExpenses;
      remainingBalance;
      activeProjectsCount = 0;
    };
  };
};
