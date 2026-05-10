import TxLib "../lib/transactions";
import TxTypes "../types/transactions";
import Common "../types/common";
import List "mo:core/List";

mixin (
  transactions : List.List<TxTypes.Transaction>,
  txState : { var nextTxId : Common.TransactionId },
) {
  public shared ({ caller = _ }) func addTransaction(
    input : TxTypes.AddTransactionInput,
    userId : Common.UserId,
  ) : async TxTypes.TransactionPublic {
    TxLib.addTransaction(transactions, txState, userId, input);
  };

  public shared func updateTransaction(
    id : Common.TransactionId,
    input : TxTypes.AddTransactionInput,
  ) : async ?TxTypes.TransactionPublic {
    TxLib.updateTransaction(transactions, id, input);
  };

  public shared func deleteTransaction(id : Common.TransactionId) : async Bool {
    TxLib.deleteTransaction(transactions, id);
  };

  public query func getTransactions(
    filter : ?TxTypes.TransactionFilter,
  ) : async [TxTypes.TransactionPublic] {
    TxLib.getTransactions(transactions, filter);
  };

  public query func getTransactionById(
    id : Common.TransactionId,
  ) : async ?TxTypes.TransactionPublic {
    TxLib.getTransactionById(transactions, id);
  };

  public query func getTotalIncome() : async Nat {
    transactions
      .filter(func(t) { t.txType == #income or t.txType == #reimbursement })
      .foldLeft(0 : Nat, func(acc : Nat, t : TxTypes.Transaction) : Nat { acc + t.amount });
  };

  public query func getTotalExpenses() : async Nat {
    transactions
      .filter(func(t) {
        t.txType == #expenses or t.txType == #cashAdvance or t.txType == #projectExpenses;
      })
      .foldLeft(0 : Nat, func(acc : Nat, t : TxTypes.Transaction) : Nat { acc + t.amount });
  };
};
