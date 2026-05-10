import DocLib "../lib/documents";
import DocTypes "../types/documents";
import Common "../types/common";
import List "mo:core/List";

mixin (
  documents : List.List<DocTypes.Document>,
  docState : { var nextDocumentId : Common.DocumentId },
) {
  public shared func addDocument(
    fileName : Text,
    fileType : Text,
    uploadedBy : Common.UserId,
    linkedTransactionId : ?Common.TransactionId,
    linkedProjectId : ?Common.ProjectId,
    storageKey : Text,
  ) : async DocTypes.Document {
    DocLib.addDocument(documents, docState, fileName, fileType, uploadedBy, linkedTransactionId, linkedProjectId, storageKey);
  };

  public shared func deleteDocument(id : Common.DocumentId) : async Bool {
    DocLib.deleteDocument(documents, id);
  };

  public query func getDocuments() : async [DocTypes.Document] {
    DocLib.getDocuments(documents);
  };

  public query func getDocumentById(id : Common.DocumentId) : async ?DocTypes.Document {
    DocLib.getDocumentById(documents, id);
  };

  public query func getDocumentsByTransaction(
    transactionId : Common.TransactionId,
  ) : async [DocTypes.Document] {
    DocLib.getDocumentsByTransaction(documents, transactionId);
  };

  public query func getDocumentsByProject(
    projectId : Common.ProjectId,
  ) : async [DocTypes.Document] {
    DocLib.getDocumentsByProject(documents, projectId);
  };
};
