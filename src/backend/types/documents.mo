import Common "common";

module {
  public type Document = {
    id : Common.DocumentId;
    fileName : Text;
    fileType : Text;
    uploadedBy : Common.UserId;
    uploadedAt : Common.Timestamp;
    linkedTransactionId : ?Common.TransactionId;
    linkedProjectId : ?Common.ProjectId;
    storageKey : Text;
  };
};
