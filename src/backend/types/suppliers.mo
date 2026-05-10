import Common "common";

module {
  public type Supplier = {
    id : Common.SupplierId;
    name : Text;
    tin : Text;
    var isVatRegistered : Bool;
    contactPerson : Text;
    phone : Text;
    address : Text;
    createdAt : Common.Timestamp;
  };

  public type SupplierPublic = {
    id : Common.SupplierId;
    name : Text;
    tin : Text;
    isVatRegistered : Bool;
    contactPerson : Text;
    phone : Text;
    address : Text;
    createdAt : Common.Timestamp;
  };

  public type Purchase = {
    purchaseId : Common.PurchaseId;
    supplierId : Common.SupplierId;
    transactionId : Common.TransactionId;
    amount : Nat;
    date : Common.Timestamp;
    description : Text;
  };
};
