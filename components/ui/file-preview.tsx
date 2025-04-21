import { FC } from "react"
import { ChatFile } from "@/types"
import {
  IconFileTypeCsv,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconJson,
  IconMarkdown
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface FilePreviewProps {
  file: ChatFile
  className?: string
}

export const FilePreview: FC<FilePreviewProps> = ({ file, className }) => {
  const getFileIcon = () => {
    switch (file.type) {
      case "text/csv":
        return <IconFileTypeCsv className="size-6" />
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <IconFileTypeDocx className="size-6" />
      case "application/pdf":
        return <IconFileTypePdf className="size-6" />
      case "text/plain":
        return <IconFileTypeTxt className="size-6" />
      case "application/json":
        return <IconJson className="size-6" />
      case "text/markdown":
        return <IconMarkdown className="size-6" />
      default:
        return <IconFileTypeTxt className="size-6" />
    }
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {getFileIcon()}
      <span className="truncate text-sm">{file.name}</span>
    </div>
  )
}
