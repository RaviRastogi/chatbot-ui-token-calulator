import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ProcessedFile {
  content: string
  metadata: {
    filename: string
    fileType: string
    size: number
    processedAt: Date
  }
}

export function FileUpload() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    setIsProcessing(true)

    try {
      const formData = new FormData()
      acceptedFiles.forEach(file => {
        formData.append("files", file)
      })

      const response = await fetch("/api/process-files", {
        method: "POST",
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error processing files")
      }

      setProcessedFiles(data.files)

      // Send processed content to chat
      if (data.files && data.files.length > 0) {
        const fileContents = data.files
          .map((file: ProcessedFile) => file.content)
          .join("\n\n")

        // You can customize this message based on your needs
        const message = {
          role: "user",
          content: `I have uploaded some files. Here are their contents:\n\n${fileContents}\n\nPlease analyze these files and provide insights or answer any questions I have about them.`
        }

        // Send to chat - you'll need to implement this based on your chat context
        // For example: sendMessage(message)
      }
    } catch (err: any) {
      setError(err.message || "Error uploading files")
      console.error("Upload error:", err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/sql": [".sql"],
      "application/json": [".json"],
      "text/markdown": [".md"]
    }
  })

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "hover:border-primary border-gray-300"}
        `}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="size-5 animate-spin" />
            <p>Processing files...</p>
          </div>
        ) : (
          <div>
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <p>Drag and drop files here, or click to select files</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Supported files: .txt, .sql, .json, .md
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {processedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold">Processed Files:</h3>
          <div className="space-y-4">
            {processedFiles.map((file, index) => (
              <div key={index} className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{file.metadata.filename}</h4>
                    <p className="text-sm text-gray-500">
                      Type: {file.metadata.fileType.toUpperCase()} | Size:{" "}
                      {Math.round(file.metadata.size / 1024)}KB
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
