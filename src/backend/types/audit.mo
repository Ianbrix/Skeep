import Common "common";

module {
  public type AuditAction = {
    #login;
    #addTransaction;
    #editTransaction;
    #deleteTransaction;
    #generateReport;
    #other;
  };

  public type AuditLog = {
    id : Common.AuditLogId;
    userId : Common.UserId;
    userEmail : Text;
    action : AuditAction;
    description : Text;
    timestamp : Common.Timestamp;
  };

  public type AuditFilter = {
    userId : ?Common.UserId;
    action : ?AuditAction;
    fromDate : ?Common.Timestamp;
    toDate : ?Common.Timestamp;
  };
};
