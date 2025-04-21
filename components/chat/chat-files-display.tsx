import { ChatbotUIContext } from "@/context/context"
import { getFileFromStorage } from "@/db/storage/files"
import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import { ChatFile, MessageImage } from "@/types"
import {
  IconCircleFilled,
  IconFileFilled,
  IconFileTypeCsv,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconJson,
  IconLoader2,
  IconMarkdown,
  IconX
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import { FilePreview } from "../ui/file-preview"
import { WithTooltip } from "../ui/with-tooltip"
import { ChatRetrievalSettings } from "./chat-retrieval-settings"

interface ChatFilesDisplayProps {}

export const ChatFilesDisplay: FC<ChatFilesDisplayProps> = ({}) => {
  useHotkey("f", () => setShowFilesDisplay(prev => !prev))
  useHotkey("e", () => setUseRetrieval(prev => !prev))

  const {
    files,
    newMessageImages,
    setNewMessageImages,
    newMessageFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    showFilesDisplay,
    chatFiles,
    chatImages,
    setChatImages,
    setChatFiles,
    setUseRetrieval
  } = useContext(ChatbotUIContext)

  const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const messageImages = [
    ...newMessageImages.filter(
      image =>
        !chatImages.some(chatImage => chatImage.messageId === image.messageId)
    )
  ]

  const combinedChatFiles = [
    ...newMessageFiles.filter(
      file => !chatFiles.some(chatFile => chatFile.id === file.id)
    ),
    ...chatFiles
  ]

  const combinedMessageFiles = [...messageImages, ...combinedChatFiles]

  const getLinkAndView = async (file: ChatFile) => {
    const fileRecord = files.find(f => f.id === file.id)

    if (!fileRecord) return

    const link = await getFileFromStorage(fileRecord.file_path)
    window.open(link, "_blank")
  }

  return showFilesDisplay && combinedMessageFiles.length > 0 ? (
    <>
      {showPreview && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background relative max-h-[80vh] max-w-[80vw] overflow-auto rounded-lg p-4">
            <Image
              className="rounded"
              src={selectedImage.base64 || selectedImage.url}
              alt="File image"
              width={2000}
              height={2000}
              style={{
                maxHeight: "67vh",
                maxWidth: "67vw"
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => {
                setShowPreview(false)
                setSelectedImage(null)
              }}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {showPreview && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background relative max-h-[80vh] max-w-[80vw] overflow-auto rounded-lg p-4">
            <FilePreview file={selectedFile} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => {
                setShowPreview(false)
                setSelectedFile(null)
              }}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex w-full items-center justify-center">
          <Button
            className="flex h-[32px] w-[140px] space-x-2"
            onClick={() => setShowFilesDisplay(false)}
          >
            <RetrievalToggle />

            <div>Hide files</div>

            <div onClick={e => e.stopPropagation()}>
              <ChatRetrievalSettings />
            </div>
          </Button>
        </div>

        <div className="flex max-h-[300px] flex-wrap gap-2 overflow-auto">
          {combinedMessageFiles.map((item, index) => {
            if ("messageId" in item) {
              // Handle MessageImage
              return (
                <div
                  key={item.messageId}
                  className="hover:border-primary relative flex h-[64px] w-[200px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-2"
                  onClick={() => {
                    setSelectedImage(item)
                    setShowPreview(true)
                  }}
                >
                  <Image
                    className="rounded"
                    src={item.base64 || item.url}
                    alt="File image"
                    width={56}
                    height={56}
                    style={{
                      minWidth: "56px",
                      minHeight: "56px",
                      maxHeight: "56px",
                      maxWidth: "56px"
                    }}
                  />
                  <IconX
                    className="bg-muted-foreground border-primary absolute right-[-6px] top-[-6px] flex size-5 cursor-pointer items-center justify-center rounded-full border-DEFAULT text-[10px] hover:border-red-500 hover:bg-white hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation()
                      setNewMessageImages(
                        newMessageImages.filter(
                          f => f.messageId !== item.messageId
                        )
                      )
                      setChatImages(
                        chatImages.filter(f => f.messageId !== item.messageId)
                      )
                    }}
                  />
                </div>
              )
            } else {
              // Handle ChatFile
              return item.id === "loading" ? (
                <div
                  key={index}
                  className="flex h-[64px] w-[200px] items-center justify-center rounded-lg border-2 border-dashed"
                >
                  <IconLoader2 className="animate-spin" />
                </div>
              ) : (
                <div
                  key={item.id}
                  className="hover:border-primary relative flex h-[64px] w-[200px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-2"
                  onClick={() => {
                    setSelectedFile(item)
                    setShowPreview(true)
                  }}
                >
                  <FilePreview file={item} />
                  <IconX
                    className="bg-muted-foreground border-primary absolute right-[-6px] top-[-6px] flex size-5 cursor-pointer items-center justify-center rounded-full border-DEFAULT text-[10px] hover:border-red-500 hover:bg-white hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation()
                      setNewMessageFiles(
                        newMessageFiles.filter(f => f.id !== item.id)
                      )
                      setChatFiles(chatFiles.filter(f => f.id !== item.id))
                    }}
                  />
                </div>
              )
            }
          })}
        </div>
      </div>
    </>
  ) : (
    combinedMessageFiles.length > 0 && (
      <div className="flex w-full items-center justify-center space-x-2">
        <Button
          className="flex h-[32px] w-[140px] space-x-2"
          onClick={() => setShowFilesDisplay(true)}
        >
          <RetrievalToggle />

          <div>
            {" "}
            View {combinedMessageFiles.length} file
            {combinedMessageFiles.length > 1 ? "s" : ""}
          </div>

          <div onClick={e => e.stopPropagation()}>
            <ChatRetrievalSettings />
          </div>
        </Button>
      </div>
    )
  )
}

const RetrievalToggle = ({}) => {
  const { useRetrieval, setUseRetrieval } = useContext(ChatbotUIContext)

  return (
    <div className="flex items-center">
      <WithTooltip
        delayDuration={0}
        side="top"
        display={
          <div>
            {useRetrieval
              ? "File retrieval is enabled on the selected files for this message. Click the indicator to disable."
              : "Click the indicator to enable file retrieval for this message."}
          </div>
        }
        trigger={
          <IconCircleFilled
            className={cn(
              "p-1",
              useRetrieval ? "text-green-500" : "text-red-500",
              useRetrieval ? "hover:text-green-200" : "hover:text-red-200"
            )}
            size={24}
            onClick={e => {
              e.stopPropagation()
              setUseRetrieval(prev => !prev)
            }}
          />
        }
      />
    </div>
  )
}
