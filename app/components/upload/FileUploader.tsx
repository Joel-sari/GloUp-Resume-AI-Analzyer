import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { AnimatePresence, motion } from "motion/react";
import { formatSize } from "~/lib/utils";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

interface FileUploaderProps {
  /** The currently selected file. The parent owns this state. */
  file?: File | null;
  /** Called with the picked file, or null when the user removes it. */
  onFileSelect?: (file: File | null) => void;
}

const rejectionMessage = (rejections: readonly FileRejection[]) => {
  const code = rejections[0]?.errors[0]?.code;
  if (code === "file-too-large")
    return `That file is over ${formatSize(MAX_FILE_SIZE)}. Try a smaller PDF.`;
  if (code === "file-invalid-type") return "Only PDF files are supported.";
  if (code === "too-many-files") return "Drop one resume at a time.";
  return code ? "That file couldn't be used. Try another PDF." : null;
};

const FileUploader = ({ file = null, onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect?.(acceptedFiles[0] ?? null);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      maxSize: MAX_FILE_SIZE,
    });

  const error = rejectionMessage(fileRejections);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {file ? (
          <motion.div
            key="selected"
            className="uploader-selected-file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-badge-red">
                <img src="/images/pdf.png" alt="" className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{file.name}</p>
                <p className="text-sm text-muted">
                  {formatSize(file.size)} · PDF
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-badge-green px-2.5 py-1 text-xs font-semibold text-badge-green-text max-sm:hidden">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                Ready
              </span>
              <button
                type="button"
                onClick={() => onFileSelect?.(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-badge-red-text/50 hover:text-badge-red-text"
                aria-label="Remove file"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            {...getRootProps({
              className: `uplader-drag-area group ${isDragActive ? "is-dragging" : ""}`,
            })}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <motion.span
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent"
                animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 16V4" />
                  <path d="M7 9l5-5 5 5" />
                  <path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" />
                </svg>
              </motion.span>
              <p className="text-base text-muted">
                {isDragActive ? (
                  <span className="font-semibold text-ink">Drop it here</span>
                ) : (
                  <>
                    <span className="font-semibold text-ink">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </>
                )}
              </p>
              <p className="text-sm text-muted">
                PDF · up to {formatSize(MAX_FILE_SIZE)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !file && (
        <p
          className="mt-3 rounded-xl border border-badge-red-text/30 bg-badge-red px-4 py-2.5 text-sm text-badge-red-text"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
