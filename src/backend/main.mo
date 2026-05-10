import AuthTypes "types/auth";
import BudgetTypes "types/budget";
import ProjectTypes "types/projects";
import CoaTypes "types/coa";
import SupplierTypes "types/suppliers";
import DocTypes "types/documents";
import NotifTypes "types/notifications";
import AuditTypes "types/audit";
import SubTypes "types/subscriptions";
import TxTypes "types/transactions";
import Common "types/common";

import AuthMixin "mixins/auth-api";
import TransactionsMixin "mixins/transactions-api";
import BudgetMixin "mixins/budget-api";
import ProjectsMixin "mixins/projects-api";
import CoaMixin "mixins/coa-api";
import SuppliersMixin "mixins/suppliers-api";
import DocumentsMixin "mixins/documents-api";
import NotificationsMixin "mixins/notifications-api";
import AuditMixin "mixins/audit-api";
import SubscriptionsMixin "mixins/subscriptions-api";

import List "mo:core/List";
import Map "mo:core/Map";

actor {
  // Auth state
  let users = List.empty<AuthTypes.User>();
  let sessions = Map.empty<Text, AuthTypes.Session>();
  let authState = { var nextUserId : Common.UserId = 0 };

  // Transaction state
  let transactions = List.empty<TxTypes.Transaction>();
  let txState = { var nextTxId : Common.TransactionId = 0 };

  // Budget state
  let allocations = List.empty<BudgetTypes.Allocation>();
  let budgetState = {
    var currentBudget : ?BudgetTypes.Budget = null;
    var nextAllocationId : Common.AllocationId = 0;
  };

  // Project state
  let projects = List.empty<ProjectTypes.Project>();
  let projectState = { var nextProjectId : Common.ProjectId = 0 };

  // COA state
  let coaReports = List.empty<CoaTypes.CoaReport>();
  let supportingDocs = List.empty<CoaTypes.SupportingDoc>();
  let coaState = { var nextCoaReportId : Common.CoaReportId = 0 };

  // Supplier state
  let suppliers = List.empty<SupplierTypes.Supplier>();
  let purchases = List.empty<SupplierTypes.Purchase>();
  let supplierState = {
    var nextSupplierId : Common.SupplierId = 0;
    var nextPurchaseId : Common.PurchaseId = 0;
  };

  // Document state
  let documents = List.empty<DocTypes.Document>();
  let docState = { var nextDocumentId : Common.DocumentId = 0 };

  // Notification state
  let notifications = List.empty<NotifTypes.Notification>();
  let notifState = { var nextNotifId : Common.NotificationId = 0 };

  // Audit state
  let auditLogs = List.empty<AuditTypes.AuditLog>();
  let auditState = { var nextAuditLogId : Common.AuditLogId = 0 };

  // Subscription state
  let subscriptions = Map.empty<Common.UserId, SubTypes.Subscription>();

  // Include all domain mixins
  include AuthMixin(users, sessions, authState);
  include TransactionsMixin(transactions, txState);
  include BudgetMixin(allocations, budgetState, transactions);
  include ProjectsMixin(projects, projectState);
  include CoaMixin(coaReports, supportingDocs, coaState);
  include SuppliersMixin(suppliers, purchases, supplierState);
  include DocumentsMixin(documents, docState);
  include NotificationsMixin(notifications, notifState);
  include AuditMixin(auditLogs, auditState);
  include SubscriptionsMixin(subscriptions);
};
