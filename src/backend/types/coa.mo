import Common "common";

module {
  public type CoaReportType = {
    #qsrp;
    #raaf;
    #budgetVsActual;
    #asrp;
    #inventoryReport;
    #notesToFS;
  };

  public type CoaReportStatus = {
    #draft;
    #pendingReview;
    #submitted;
    #approved;
    #needsRevision;
  };

  public type CoaReport = {
    id : Common.CoaReportId;
    reportType : CoaReportType;
    fiscalYear : Nat;
    quarter : ?Nat;
    var status : CoaReportStatus;
    deadline : ?Common.Timestamp;
    var submittedAt : ?Common.Timestamp;
    var notes : Text;
    createdAt : Common.Timestamp;
  };

  public type CoaReportPublic = {
    id : Common.CoaReportId;
    reportType : CoaReportType;
    fiscalYear : Nat;
    quarter : ?Nat;
    status : CoaReportStatus;
    deadline : ?Common.Timestamp;
    submittedAt : ?Common.Timestamp;
    notes : Text;
    createdAt : Common.Timestamp;
  };

  public type SupportingDoc = {
    docType : Text;
    var isSubmitted : Bool;
    linkedReportId : Common.CoaReportId;
  };

  public type SupportingDocPublic = {
    docType : Text;
    isSubmitted : Bool;
    linkedReportId : Common.CoaReportId;
  };
};
