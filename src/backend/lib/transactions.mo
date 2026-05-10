import TxTypes "../types/transactions";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func addTransaction(
    transactions : List.List<TxTypes.Transaction>,
    state : { var nextTxId : Common.TransactionId },
    userId : Common.UserId,
    input : TxTypes.AddTransactionInput,
  ) : TxTypes.TransactionPublic {
    let now = Time.now();
    let id = state.nextTxId;
    state.nextTxId += 1;
    let checkDetails : ?TxTypes.CheckDetails = switch (input.checkDetails) {
      case null { null };
      case (?cd) {
        ?{
          payee = cd.payee;
          bankName = cd.bankName;
          checkDate = cd.checkDate;
          checkNumber = cd.checkNumber;
          purpose = cd.purpose;
          var status = cd.status;
        };
      };
    };
    let tx : TxTypes.Transaction = {
      id;
      userId;
      txType = input.txType;
      paymentMethod = input.paymentMethod;
      amount = input.amount;
      description = input.description;
      date = input.date;
      projectId = input.projectId;
      supplierId = input.supplierId;
      receiptId = input.receiptId;
      checkDetails;
      createdAt = now;
      var updatedAt = now;
    };
    transactions.add(tx);
    toPublic(tx);
  };

  public func updateTransaction(
    transactions : List.List<TxTypes.Transaction>,
    id : Common.TransactionId,
    input : TxTypes.AddTransactionInput,
  ) : ?TxTypes.TransactionPublic {
    switch (transactions.findIndex(func(t) { t.id == id })) {
      case null { null };
      case (?idx) {
        let tx = transactions.at(idx);
        let now = Time.now();
        let checkDetails : ?TxTypes.CheckDetails = switch (input.checkDetails) {
          case null { null };
          case (?cd) {
            ?{
              payee = cd.payee;
              bankName = cd.bankName;
              checkDate = cd.checkDate;
              checkNumber = cd.checkNumber;
              purpose = cd.purpose;
              var status = cd.status;
            };
          };
        };
        let updated : TxTypes.Transaction = {
          id = tx.id;
          userId = tx.userId;
          txType = input.txType;
          paymentMethod = input.paymentMethod;
          amount = input.amount;
          description = input.description;
          date = input.date;
          projectId = input.projectId;
          supplierId = input.supplierId;
          receiptId = input.receiptId;
          checkDetails;
          createdAt = tx.createdAt;
          var updatedAt = now;
        };
        transactions.put(idx, updated);
        ?toPublic(updated);
      };
    };
  };

  public func deleteTransaction(
    transactions : List.List<TxTypes.Transaction>,
    id : Common.TransactionId,
  ) : Bool {
    switch (transactions.findIndex(func(t) { t.id == id })) {
      case null { false };
      case (?_) {
        let filtered = transactions.filter(func(t) { t.id != id });
        transactions.clear();
        transactions.append(filtered);
        true;
      };
    };
  };

  public func getTransactions(
    transactions : List.List<TxTypes.Transaction>,
    filter : ?TxTypes.TransactionFilter,
  ) : [TxTypes.TransactionPublic] {
    let filtered = switch (filter) {
      case null { transactions };
      case (?f) {
        transactions.filter(func(t) {
          let matchType = switch (f.txType) {
            case null { true };
            case (?ft) { t.txType == ft };
          };
          let matchMethod = switch (f.paymentMethod) {
            case null { true };
            case (?fm) { t.paymentMethod == fm };
          };
          let matchProject = switch (f.projectId) {
            case null { true };
            case (?fp) {
              switch (t.projectId) {
                case null { false };
                case (?tp) { tp == fp };
              };
            };
          };
          let matchFrom = switch (f.fromDate) {
            case null { true };
            case (?fd) { t.date >= fd };
          };
          let matchTo = switch (f.toDate) {
            case null { true };
            case (?td) { t.date <= td };
          };
          matchType and matchMethod and matchProject and matchFrom and matchTo;
        });
      };
    };
    filtered.map<TxTypes.Transaction, TxTypes.TransactionPublic>(func(t) { toPublic(t) }).toArray();
  };

  public func getTransactionById(
    transactions : List.List<TxTypes.Transaction>,
    id : Common.TransactionId,
  ) : ?TxTypes.TransactionPublic {
    switch (transactions.find(func(t) { t.id == id })) {
      case null { null };
      case (?t) { ?toPublic(t) };
    };
  };

  public func toPublic(tx : TxTypes.Transaction) : TxTypes.TransactionPublic {
    let checkDetails : ?TxTypes.CheckDetailsPublic = switch (tx.checkDetails) {
      case null { null };
      case (?cd) {
        ?{
          payee = cd.payee;
          bankName = cd.bankName;
          checkDate = cd.checkDate;
          checkNumber = cd.checkNumber;
          purpose = cd.purpose;
          status = cd.status;
        };
      };
    };
    {
      id = tx.id;
      userId = tx.userId;
      txType = tx.txType;
      paymentMethod = tx.paymentMethod;
      amount = tx.amount;
      description = tx.description;
      date = tx.date;
      projectId = tx.projectId;
      supplierId = tx.supplierId;
      receiptId = tx.receiptId;
      checkDetails;
      createdAt = tx.createdAt;
      updatedAt = tx.updatedAt;
    };
  };
};
