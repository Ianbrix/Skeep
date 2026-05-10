import SupplierLib "../lib/suppliers";
import SupplierTypes "../types/suppliers";
import Common "../types/common";
import List "mo:core/List";

mixin (
  suppliers : List.List<SupplierTypes.Supplier>,
  purchases : List.List<SupplierTypes.Purchase>,
  supplierState : { var nextSupplierId : Common.SupplierId; var nextPurchaseId : Common.PurchaseId },
) {
  public shared func addSupplier(
    name : Text,
    tin : Text,
    isVatRegistered : Bool,
    contactPerson : Text,
    phone : Text,
    address : Text,
  ) : async SupplierTypes.SupplierPublic {
    SupplierLib.addSupplier(suppliers, supplierState, name, tin, isVatRegistered, contactPerson, phone, address);
  };

  public shared func updateSupplier(
    id : Common.SupplierId,
    name : Text,
    tin : Text,
    isVatRegistered : Bool,
    contactPerson : Text,
    phone : Text,
    address : Text,
  ) : async ?SupplierTypes.SupplierPublic {
    SupplierLib.updateSupplier(suppliers, id, name, tin, isVatRegistered, contactPerson, phone, address);
  };

  public shared func deleteSupplier(id : Common.SupplierId) : async Bool {
    SupplierLib.deleteSupplier(suppliers, id);
  };

  public query func getSuppliers() : async [SupplierTypes.SupplierPublic] {
    SupplierLib.getSuppliers(suppliers);
  };

  public query func getSupplierById(id : Common.SupplierId) : async ?SupplierTypes.SupplierPublic {
    SupplierLib.getSupplierById(suppliers, id);
  };

  public shared func addPurchase(
    supplierId : Common.SupplierId,
    transactionId : Common.TransactionId,
    amount : Nat,
    date : Common.Timestamp,
    description : Text,
  ) : async SupplierTypes.Purchase {
    SupplierLib.addPurchase(purchases, supplierState, supplierId, transactionId, amount, date, description);
  };

  public query func getPurchasesBySupplier(
    supplierId : Common.SupplierId,
  ) : async [SupplierTypes.Purchase] {
    SupplierLib.getPurchasesBySupplier(purchases, supplierId);
  };
};
