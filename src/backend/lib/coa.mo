import CoaTypes "../types/coa";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func addCoaReport(
    reports : List.List<CoaTypes.CoaReport>,
    docs : List.List<CoaTypes.SupportingDoc>,
    state : { var nextCoaReportId : Common.CoaReportId },
    reportType : CoaTypes.CoaReportType,
    fiscalYear : Nat,
    quarter : ?Nat,
    deadline : ?Common.Timestamp,
  ) : CoaTypes.CoaReportPublic {
    let now = Time.now();
    let id = state.nextCoaReportId;
    state.nextCoaReportId += 1;
    let report : CoaTypes.CoaReport = {
      id;
      reportType;
      fiscalYear;
      quarter;
      var status = #draft;
      deadline;
      var submittedAt = null;
      var notes = "";
      createdAt = now;
    };
    reports.add(report);
    toPublic(report);
  };

  public func updateCoaReport(
    reports : List.List<CoaTypes.CoaReport>,
    id : Common.CoaReportId,
    status : CoaTypes.CoaReportStatus,
    notes : Text,
  ) : ?CoaTypes.CoaReportPublic {
    switch (reports.find(func(r) { r.id == id })) {
      case null { null };
      case (?report) {
        report.status := status;
        report.notes := notes;
        if (status == #submitted) {
          report.submittedAt := ?Time.now();
        };
        ?toPublic(report);
      };
    };
  };

  public func getCoaReports(
    reports : List.List<CoaTypes.CoaReport>,
  ) : [CoaTypes.CoaReportPublic] {
    reports.map<CoaTypes.CoaReport, CoaTypes.CoaReportPublic>(func(r) { toPublic(r) }).toArray();
  };

  public func getSupportingDocs(
    docs : List.List<CoaTypes.SupportingDoc>,
    reportId : Common.CoaReportId,
  ) : [CoaTypes.SupportingDocPublic] {
    docs
      .filter(func(d) { d.linkedReportId == reportId })
      .map<CoaTypes.SupportingDoc, CoaTypes.SupportingDocPublic>(func(d) {
        { docType = d.docType; isSubmitted = d.isSubmitted; linkedReportId = d.linkedReportId };
      })
      .toArray();
  };

  public func submitSupportingDoc(
    docs : List.List<CoaTypes.SupportingDoc>,
    reportId : Common.CoaReportId,
    docType : Text,
  ) : Bool {
    switch (docs.find(func(d) { d.linkedReportId == reportId and d.docType == docType })) {
      case (?doc) {
        doc.isSubmitted := true;
        true;
      };
      case null {
        let newDoc : CoaTypes.SupportingDoc = {
          docType;
          var isSubmitted = true;
          linkedReportId = reportId;
        };
        docs.add(newDoc);
        true;
      };
    };
  };

  public func getOverdueReports(
    reports : List.List<CoaTypes.CoaReport>,
  ) : [CoaTypes.CoaReportPublic] {
    let now = Time.now();
    reports
      .filter(func(r) {
        switch (r.deadline) {
          case null { false };
          case (?d) {
            d < now and (r.status == #draft or r.status == #pendingReview);
          };
        };
      })
      .map<CoaTypes.CoaReport, CoaTypes.CoaReportPublic>(func(r) { toPublic(r) })
      .toArray();
  };

  public func toPublic(r : CoaTypes.CoaReport) : CoaTypes.CoaReportPublic {
    {
      id = r.id;
      reportType = r.reportType;
      fiscalYear = r.fiscalYear;
      quarter = r.quarter;
      status = r.status;
      deadline = r.deadline;
      submittedAt = r.submittedAt;
      notes = r.notes;
      createdAt = r.createdAt;
    };
  };
};
