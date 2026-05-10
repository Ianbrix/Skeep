import type { Document, ProjectPublic, TransactionPublic } from "@/backend";
import { Role } from "@/backend";
import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActor } from "@caffeineai/core-infrastructure";
import { ExternalBlob } from "@caffeineai/object-storage";
import { useMutation } from "@tanstack/react-query";
import {
  Download,
  Eye,
  FileImage,
  FileText,
  FileX,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  documents: Document[];
  transactions: TransactionPublic[];
  projects: ProjectPublic[];
  userRole: Role | undefined;
  onDeleted: () => void;
}

const isImage = (fileType: string, fileName: string) => {
  if (fileType.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(fileName);
};

const isPdf = (fileType: string, fileName: string) => {
  if (fileType === "application/pdf") return true;
  return /\.pdf$/i.test(fileName);
};

type FileCategory = "image" | "pdf" | "other";

const getCategory = (fileType: string, fileName: string): FileCategory => {
  if (isImage(fileType, fileName)) return "image";
  if (isPdf(fileType, fileName)) return "pdf";
  return "other";
};

function FileTypeIcon({ category }: { category: FileCategory }) {
  if (category === "pdf")
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10">
        <FileText size={18} className="text-destructive" />
      </div>
    );
  if (category === "image")
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
        <FileImage size={18} className="text-primary" />
      </div>
    );
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
      <FileX size={18} className="text-muted-foreground" />
    </div>
  );
}

function FileTypeBadge({ category }: { category: FileCategory }) {
  if (category === "pdf")
    return (
      <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">
        PDF
      </Badge>
    );
  if (category === "image")
    return (
      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
        Image
      </Badge>
    );
  return <Badge variant="secondary">Other</Badge>;
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DocumentTable({
  documents,
  transactions,
  projects,
  userRole,
  onDeleted,
}: Props) {
  const { actor } = useActor(createActor);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [downloadingId, setDownloadingId] = useState<bigint | null>(null);

  const txMap = new Map(transactions.map((t) => [t.id.toString(), t]));
  const projMap = new Map(projects.map((p) => [p.id.toString(), p]));

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteDocument(id);
    },
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Document deleted successfully");
        onDeleted();
      } else {
        toast.error("Failed to delete document");
      }
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete document");
      setDeleteTarget(null);
    },
  });

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const blob = ExternalBlob.fromURL(doc.storageKey);
      const bytes = await blob.getBytes();
      const blobObj = new Blob([bytes]);
      const url = URL.createObjectURL(blobObj);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${doc.fileName}`);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-center"
        data-ocid="receipts.empty_state"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FolderOpen size={28} className="text-muted-foreground" />
        </div>
        <h3 className="mb-1 font-semibold text-foreground">
          No documents found
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          No receipts or documents match your current filters. Upload a receipt
          to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                File
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                Upload Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                Linked To
              </th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => {
              const category = getCategory(doc.fileType, doc.fileName);
              const tx = doc.linkedTransactionId
                ? txMap.get(doc.linkedTransactionId.toString())
                : undefined;
              const proj = doc.linkedProjectId
                ? projMap.get(doc.linkedProjectId.toString())
                : undefined;

              return (
                <tr
                  key={doc.id.toString()}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  data-ocid={`receipts.item.${i + 1}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileTypeIcon category={category} />
                      <span className="truncate font-medium text-foreground max-w-[200px]">
                        {doc.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <FileTypeBadge category={category} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(doc.uploadedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {tx ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <span className="font-medium">
                          Tx #{tx.id.toString()}
                        </span>
                        <span className="text-muted-foreground">
                          — {tx.description.slice(0, 25)}
                        </span>
                      </span>
                    ) : proj ? (
                      <span className="inline-flex items-center gap-1 text-xs text-accent-foreground">
                        <FolderOpen size={12} />
                        <span className="font-medium">{proj.name}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unlinked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {category === "image" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPreviewDoc(doc)}
                          data-ocid={`receipts.preview_button.${i + 1}`}
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        data-ocid={`receipts.download_button.${i + 1}`}
                      >
                        <Download
                          size={14}
                          className={
                            downloadingId === doc.id ? "animate-spin" : ""
                          }
                        />
                      </Button>
                      {userRole === Role.treasurer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(doc)}
                          data-ocid={`receipts.delete_button.${i + 1}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {documents.map((doc, i) => {
          const category = getCategory(doc.fileType, doc.fileName);
          const tx = doc.linkedTransactionId
            ? txMap.get(doc.linkedTransactionId.toString())
            : undefined;
          const proj = doc.linkedProjectId
            ? projMap.get(doc.linkedProjectId.toString())
            : undefined;

          return (
            <div
              key={doc.id.toString()}
              className="rounded-lg border border-border bg-card p-4"
              data-ocid={`receipts.item.${i + 1}`}
            >
              <div className="flex items-start gap-3">
                <FileTypeIcon category={category} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="truncate font-medium text-foreground text-sm">
                      {doc.fileName}
                    </span>
                    <FileTypeBadge category={category} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDate(doc.uploadedAt)}
                  </div>
                  {(tx || proj) && (
                    <div className="mt-1 text-xs">
                      {tx ? (
                        <span className="text-primary">
                          Tx #{tx.id.toString()} — {tx.description.slice(0, 20)}
                        </span>
                      ) : proj ? (
                        <span className="text-accent-foreground flex items-center gap-1">
                          <FolderOpen size={10} />
                          {proj.name}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {category === "image" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPreviewDoc(doc)}
                      data-ocid={`receipts.preview_button.${i + 1}`}
                    >
                      <Eye size={14} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    data-ocid={`receipts.download_button.${i + 1}`}
                  >
                    <Download
                      size={14}
                      className={downloadingId === doc.id ? "animate-spin" : ""}
                    />
                  </Button>
                  {userRole === Role.treasurer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(doc)}
                      data-ocid={`receipts.delete_button.${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent
          className="max-w-3xl"
          data-ocid="receipts.preview.dialog"
        >
          <DialogHeader>
            <DialogTitle className="truncate">
              {previewDoc?.fileName}
            </DialogTitle>
            <DialogDescription>
              {previewDoc ? formatDate(previewDoc.uploadedAt) : ""}
            </DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="flex items-center justify-center rounded-lg bg-muted/30 p-4">
              <img
                src={ExternalBlob.fromURL(previewDoc.storageKey).getDirectURL()}
                alt={previewDoc.fileName}
                className="max-h-[60vh] max-w-full rounded object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent data-ocid="receipts.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.fileName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="receipts.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
              data-ocid="receipts.delete.confirm_button"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
