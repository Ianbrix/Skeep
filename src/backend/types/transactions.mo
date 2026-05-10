import Common "common";

module {
  public type TransactionType = {
    #income;
    #expenses;
    #cashAdvance;
    #reimbursement;
    #projectExpenses;
  };

  public type PaymentMethod = {
    #cash;
    #gcash;
    #bankTransfer;
    #check;
  };

  public type CheckStatus = {
    #pendingIssuance;
    #issued;
    #cleared;
    #cancelled;
  };

  public type CheckDetails = {
    payee : Text;
    bankName : Text;
    checkDate : Common.Timestamp;
    checkNumber : ?Text;
    purpose : Text;
    var status : CheckStatus;
  };

  public type Transaction = {
    id : Common.TransactionId;
    userId : Common.UserId;
    txType : TransactionType;
    paymentMethod : PaymentMethod;
    amount : Nat;
    description : Text;
    date : Common.Timestamp;
    projectId : ?Common.ProjectId;
    supplierId : ?Common.SupplierId;
    receiptId : ?Common.DocumentId;
    checkDetails : ?CheckDetails;
    createdAt : Common.Timestamp;
    var updatedAt : Common.Timestamp;
  };

  public type TransactionPublic = {
    id : Common.TransactionId;
    userId : Common.UserId;
    txType : TransactionType;
    paymentMethod : PaymentMethod;
    amount : Nat;
    description : Text;
    date : Common.Timestamp;
    projectId : ?Common.ProjectId;
    supplierId : ?Common.SupplierId;
    receiptId : ?Common.DocumentId;
    checkDetails : ?CheckDetailsPublic;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type CheckDetailsPublic = {
    payee : Text;
    bankName : Text;
    checkDate : Common.Timestamp;
    checkNumber : ?Text;
    purpose : Text;
    status : CheckStatus;
  };

  public type TransactionFilter = {
    txType : ?TransactionType;
    paymentMethod : ?PaymentMethod;
    projectId : ?Common.ProjectId;
    fromDate : ?Common.Timestamp;
    toDate : ?Common.Timestamp;
  };

  public type AddTransactionInput = {
    txType : TransactionType;
    paymentMethod : PaymentMethod;
    amount : Nat;
    description : Text;
    date : Common.Timestamp;
    projectId : ?Common.ProjectId;
    supplierId : ?Common.SupplierId;
    receiptId : ?Common.DocumentId;
    checkDetails : ?CheckDetailsPublic;
  };
};
