import SupplierTypes "../types/suppliers";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func addSupplier(
    suppliers : List.List<SupplierTypes.Supplier>,
    state : { var nextSupplierId : Common.SupplierId },
    name : Text,
    tin : Text,
    isVatRegistered : Bool,
    contactPerson : Text,
    phone : Text,
    address : Text,
  ) : SupplierTypes.SupplierPublic {
    let now = Time.now();
    let id = state.nextSupplierId;
    state.nextSupplierId += 1;
    let supplier : SupplierTypes.Supplier = {
      id;
      name;
      tin;
      var isVatRegistered;
      contactPerson;
      phone;
      address;
      createdAt = now;
    };
    suppliers.add(supplier);
    toPublic(supplier);
  };

  public func updateSupplier(
    suppliers : List.List<SupplierTypes.Supplier>,
    id : Common.SupplierId,
    name : Text,
    tin : Text,
    isVatRegistered : Bool,
    contactPerson : Text,
    phone : Text,
    address : Text,
  ) : ?SupplierTypes.SupplierPublic {
    switch (suppliers.findIndex(func(s) { s.id == id })) {
      case null { null };
      case (?idx) {
        let old = suppliers.at(idx);
        let updated : SupplierTypes.Supplier = {
          id = old.id;
          name;
          tin;
          var isVatRegistered;
          contactPerson;
          phone;
          address;
          createdAt = old.createdAt;
        };
        suppliers.put(idx, updated);
        ?toPublic(updated);
      };
    };
  };

  public func deleteSupplier(
    suppliers : List.List<SupplierTypes.Supplier>,
    id : Common.SupplierId,
  ) : Bool {
    switch (suppliers.findIndex(func(s) { s.id == id })) {
      case null { false };
      case (?_) {
        let filtered = suppliers.filter(func(s) { s.id != id });
        suppliers.clear();
        suppliers.append(filtered);
        true;
      };
    };
  };

  public func getSuppliers(
    suppliers : List.List<SupplierTypes.Supplier>,
  ) : [SupplierTypes.SupplierPublic] {
    suppliers.map<SupplierTypes.Supplier, SupplierTypes.SupplierPublic>(func(s) { toPublic(s) }).toArray();
  };

  public func getSupplierById(
    suppliers : List.List<SupplierTypes.Supplier>,
    id : Common.SupplierId,
  ) : ?SupplierTypes.SupplierPublic {
    switch (suppliers.find(func(s) { s.id == id })) {
      case null { null };
      case (?s) { ?toPublic(s) };
    };
  };

  public func addPurchase(
    purchases : List.List<SupplierTypes.Purchase>,
    state : { var nextPurchaseId : Common.PurchaseId },
    supplierId : Common.SupplierId,
    transactionId : Common.TransactionId,
    amount : Nat,
    date : Common.Timestamp,
    description : Text,
  ) : SupplierTypes.Purchase {
    let purchaseId = state.nextPurchaseId;
    state.nextPurchaseId += 1;
    let purchase : SupplierTypes.Purchase = {
      purchaseId;
      supplierId;
      transactionId;
      amount;
      date;
      description;
    };
    purchases.add(purchase);
    purchase;
  };

  public func getPurchasesBySupplier(
    purchases : List.List<SupplierTypes.Purchase>,
    supplierId : Common.SupplierId,
  ) : [SupplierTypes.Purchase] {
    purchases.filter(func(p) { p.supplierId == supplierId }).toArray();
  };

  public func toPublic(s : SupplierTypes.Supplier) : SupplierTypes.SupplierPublic {
    {
      id = s.id;
      name = s.name;
      tin = s.tin;
      isVatRegistered = s.isVatRegistered;
      contactPerson = s.contactPerson;
      phone = s.phone;
      address = s.address;
      createdAt = s.createdAt;
    };
  };
};
