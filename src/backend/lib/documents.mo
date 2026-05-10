import DocTypes "../types/documents";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func addDocument(
    documents : List.List<DocTypes.Document>,
    state : { var nextDocumentId : Common.DocumentId },
    fileName : Text,
    fileType : Text,
    uploadedBy : Common.UserId,
    linkedTransactionId : ?Common.TransactionId,
    linkedProjectId : ?Common.ProjectId,
    storageKey : Text,
  ) : DocTypes.Document {
    let now = Time.now();
    let id = state.nextDocumentId;
    state.nextDocumentId += 1;
    let doc : DocTypes.Document = {
      id;
      fileName;
      fileType;
      uploadedBy;
      uploadedAt = now;
      linkedTransactionId;
      linkedProjectId;
      storageKey;
    };
    documents.add(doc);
    doc;
  };

  public func deleteDocument(
    documents : List.List<DocTypes.Document>,
    id : Common.DocumentId,
  ) : Bool {
    switch (documents.findIndex(func(d) { d.id == id })) {
      case null { false };
      case (?_) {
        let filtered = documents.filter(func(d) { d.id != id });
        documents.clear();
        documents.append(filtered);
        true;
      };
    };
  };

  public func getDocuments(
    documents : List.List<DocTypes.Document>,
  ) : [DocTypes.Document] {
    documents.toArray();
  };

  public func getDocumentById(
    documents : List.List<DocTypes.Document>,
    id : Common.DocumentId,
  ) : ?DocTypes.Document {
    documents.find(func(d) { d.id == id });
  };

  public func getDocumentsByTransaction(
    documents : List.List<DocTypes.Document>,
    transactionId : Common.TransactionId,
  ) : [DocTypes.Document] {
    documents.filter(func(d) {
      switch (d.linkedTransactionId) {
        case null { false };
        case (?tid) { tid == transactionId };
      };
    }).toArray();
  };

  public func getDocumentsByProject(
    documents : List.List<DocTypes.Document>,
    projectId : Common.ProjectId,
  ) : [DocTypes.Document] {
    documents.filter(func(d) {
      switch (d.linkedProjectId) {
        case null { false };
        case (?pid) { pid == projectId };
      };
    }).toArray();
  };
};
