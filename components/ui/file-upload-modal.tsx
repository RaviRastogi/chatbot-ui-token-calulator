import { FC, useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Button } from "./button"
import { IconUpload, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { ChatFile } from "@/types"

interface FileUploadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onFilesSelected: (files: ChatFile[]) => void
  acceptedFileTypes?: string[]
  maxFiles?: number
}

export const FileUploadModal: FC<FileUploadModalProps> = ({
  isOpen,
  onOpenChange,
  onFilesSelected,
  acceptedFileTypes = [
    "text/*",
    "application/json",
    "application/sql",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  maxFiles = 10
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<ChatFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: `temp-${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type,
      file
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [],
      "application/json": [],
      "application/sql": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        []
    },
    maxFiles
  })

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const handleUpload = async () => {
    setIsUploading(true)
    try {
      onFilesSelected(uploadedFiles)
      onOpenChange(false)
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25"
          )}
        >
          <input {...getInputProps()} />
          <IconUpload className="text-muted-foreground mx-auto size-12" />
          <p className="text-muted-foreground mt-2 text-sm">
            {isDragActive
              ? "Drop the files here"
              : "Drag & drop files here, or click to select files"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Supported formats: .txt, .json, .sql, .pdf, .doc, .docx
          </p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Selected Files:</h3>
            <div className="space-y-2">
              {uploadedFiles.map(file => (
                <div
                  key={file.id}
                  className="bg-muted flex items-center justify-between rounded-md p-2"
                >
                  <span className="truncate text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
