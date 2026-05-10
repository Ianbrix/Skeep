import AuditLib "../lib/audit";
import AuditTypes "../types/audit";
import Common "../types/common";
import List "mo:core/List";

mixin (
  auditLogs : List.List<AuditTypes.AuditLog>,
  auditState : { var nextAuditLogId : Common.AuditLogId },
) {
  public shared func addAuditLog(
    userId : Common.UserId,
    userEmail : Text,
    action : AuditTypes.AuditAction,
    description : Text,
  ) : async AuditTypes.AuditLog {
    AuditLib.addAuditLog(auditLogs, auditState, userId, userEmail, action, description);
  };

  public query func getAuditLogs(
    filter : ?AuditTypes.AuditFilter,
  ) : async [AuditTypes.AuditLog] {
    AuditLib.getAuditLogs(auditLogs, filter);
  };

  public query func getRecentLogs(limit : Nat) : async [AuditTypes.AuditLog] {
    AuditLib.getRecentLogs(auditLogs, limit);
  };
};
