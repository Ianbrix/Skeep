import CoaLib "../lib/coa";
import CoaTypes "../types/coa";
import Common "../types/common";
import List "mo:core/List";

mixin (
  coaReports : List.List<CoaTypes.CoaReport>,
  supportingDocs : List.List<CoaTypes.SupportingDoc>,
  coaState : { var nextCoaReportId : Common.CoaReportId },
) {
  public shared func addCoaReport(
    reportType : CoaTypes.CoaReportType,
    fiscalYear : Nat,
    quarter : ?Nat,
    deadline : ?Common.Timestamp,
  ) : async CoaTypes.CoaReportPublic {
    CoaLib.addCoaReport(coaReports, supportingDocs, coaState, reportType, fiscalYear, quarter, deadline);
  };

  public shared func updateCoaReport(
    id : Common.CoaReportId,
    status : CoaTypes.CoaReportStatus,
    notes : Text,
  ) : async ?CoaTypes.CoaReportPublic {
    CoaLib.updateCoaReport(coaReports, id, status, notes);
  };

  public query func getCoaReports() : async [CoaTypes.CoaReportPublic] {
    CoaLib.getCoaReports(coaReports);
  };

  public query func getSupportingDocs(
    reportId : Common.CoaReportId,
  ) : async [CoaTypes.SupportingDocPublic] {
    CoaLib.getSupportingDocs(supportingDocs, reportId);
  };

  public shared func submitSupportingDoc(
    reportId : Common.CoaReportId,
    docType : Text,
  ) : async Bool {
    CoaLib.submitSupportingDoc(supportingDocs, reportId, docType);
  };

  public query func getOverdueReports() : async [CoaTypes.CoaReportPublic] {
    CoaLib.getOverdueReports(coaReports);
  };
};
