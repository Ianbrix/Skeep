import type { ProjectPublic, TransactionPublic } from "@/backend";
import type { UserId } from "@/backend";
import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActor } from "@caffeineai/core-infrastructure";
import { ExternalBlob } from "@caffeineai/object-storage";
import {
  FileImage,
  FilePlus,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  transactions: TransactionPublic[];
  projects: ProjectPublic[];
  userId: UserId;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCEPTED_TYPES =
  "image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.csv";
const MAX_SIZE_MB = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadReceiptForm({
  transactions,
  projects,
  userId,
  onClose,
  onSuccess,
}: Props) {
  const { actor } = useActor(createActor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [linkedTxId, setLinkedTxId] = useState<string>("none");
  const [linkedProjId, setLinkedProjId] = useState<string>("none");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const getFileType = (f: File) => f.type || "application/octet-stream";

  const handleFile = (f: File) => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file || !actor) return;
    setUploading(true);
    setProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setProgress(Math.round(pct));
      });

      // Trigger upload by reading the bytes through the blob proxy;
      // getDirectURL() returns the proxied storage URL used as storageKey
      await blob.getBytes();
      const storageKey = blob.getDirectURL();

      await actor.addDocument(
        file.name,
        getFileType(file),
        userId,
        linkedTxId !== "none" ? BigInt(linkedTxId) : null,
        linkedProjId !== "none" ? BigInt(linkedProjId) : null,
        storageKey,
      );

      setProgress(100);
      toast.success(`${file.name} uploaded successfully.`);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const fileCategory = file
    ? file.type.startsWith("image/")
      ? "image"
      : file.type === "application/pdf"
        ? "pdf"
        : "other"
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      data-ocid="receipts.upload.dialog"
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FilePlus size={18} className="text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Upload Receipt
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="receipts.upload.close_button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Drop Zone */}
          <div>
            <Label className="mb-2 block text-sm font-medium">File *</Label>
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              data-ocid="receipts.upload.dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                data-ocid="receipts.upload.input"
              />
              {file ? (
                <div className="flex items-center gap-3">
                  {fileCategory === "image" ? (
                    <FileImage size={28} className="text-primary" />
                  ) : fileCategory === "pdf" ? (
                    <FileText size={28} className="text-destructive" />
                  ) : (
                    <FilePlus size={28} className="text-muted-foreground" />
                  )}
                  <div className="text-left min-w-0">
                    <div className="truncate text-sm font-medium text-foreground max-w-[240px]">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setProgress(0);
                    }}
                    className="ml-auto rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Drop file here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Images, PDF, Word, Excel — max {MAX_SIZE_MB} MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Link to Transaction */}
          <div>
            <Label htmlFor="link-tx" className="mb-2 block text-sm font-medium">
              Link to Transaction{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select value={linkedTxId} onValueChange={setLinkedTxId}>
              <SelectTrigger
                id="link-tx"
                data-ocid="receipts.upload.transaction.select"
              >
                <SelectValue placeholder="Select transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {transactions.map((tx) => (
                  <SelectItem key={tx.id.toString()} value={tx.id.toString()}>
                    #{tx.id.toString()} — {tx.description.slice(0, 40)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link to Project */}
          <div>
            <Label
              htmlFor="link-proj"
              className="mb-2 block text-sm font-medium"
            >
              Link to Project{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select value={linkedProjId} onValueChange={setLinkedProjId}>
              <SelectTrigger
                id="link-proj"
                data-ocid="receipts.upload.project.select"
              >
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id.toString()} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div
              className="space-y-1.5"
              data-ocid="receipts.upload.loading_state"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Uploading…</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              data-ocid="receipts.upload.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading || !actor}
              data-ocid="receipts.upload.submit_button"
              className="gap-1.5"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
