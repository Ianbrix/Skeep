import AuditTypes "../types/audit";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func addAuditLog(
    logs : List.List<AuditTypes.AuditLog>,
    state : { var nextAuditLogId : Common.AuditLogId },
    userId : Common.UserId,
    userEmail : Text,
    action : AuditTypes.AuditAction,
    description : Text,
  ) : AuditTypes.AuditLog {
    let id = state.nextAuditLogId;
    state.nextAuditLogId += 1;
    let log : AuditTypes.AuditLog = {
      id;
      userId;
      userEmail;
      action;
      description;
      timestamp = Time.now();
    };
    logs.add(log);
    log;
  };

  public func getAuditLogs(
    logs : List.List<AuditTypes.AuditLog>,
    filter : ?AuditTypes.AuditFilter,
  ) : [AuditTypes.AuditLog] {
    let filtered = switch (filter) {
      case null { logs };
      case (?f) {
        logs.filter(func(l) {
          let matchUser = switch (f.userId) {
            case null { true };
            case (?uid) { l.userId == uid };
          };
          let matchAction = switch (f.action) {
            case null { true };
            case (?a) { l.action == a };
          };
          let matchFrom = switch (f.fromDate) {
            case null { true };
            case (?fd) { l.timestamp >= fd };
          };
          let matchTo = switch (f.toDate) {
            case null { true };
            case (?td) { l.timestamp <= td };
          };
          matchUser and matchAction and matchFrom and matchTo;
        });
      };
    };
    filtered.toArray();
  };

  public func getRecentLogs(
    logs : List.List<AuditTypes.AuditLog>,
    limit : Nat,
  ) : [AuditTypes.AuditLog] {
    let all = logs.toArray();
    let size = all.size();
    if (size <= limit) { all }
    else {
      let start : Int = size - limit;
      all.sliceToArray(start, size.toInt());
    };
  };
};
