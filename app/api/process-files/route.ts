import { FileProcessor } from "@/lib/services/file-processor"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import os from "os"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const processedFiles = await Promise.all(
      files.map(async (file: any) => {
        if (!(file instanceof File)) {
          throw new Error("Invalid file object")
        }

        // Create a temporary file path in the system's temp directory
        const tempDir = os.tmpdir()
        const tempFilePath = join(tempDir, file.name)
        const buffer = Buffer.from(await file.arrayBuffer())

        try {
          // Write the file
          await writeFile(tempFilePath, buffer)

          // Process the file
          const result = await FileProcessor.processFile(tempFilePath)

          // Clean up temp file
          await unlink(tempFilePath)

          return result
        } catch (error) {
          // Attempt to clean up temp file in case of error
          try {
            await unlink(tempFilePath)
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError)
          }
          console.error(`Error processing file ${file.name}:`, error)
          throw error
        }
      })
    )

    return NextResponse.json({
      success: true,
      files: processedFiles
    })
  } catch (error: any) {
    console.error("File processing error:", error)
    return NextResponse.json(
      {
        error: "Error processing files",
        details: error.message
      },
      { status: 500 }
    )
  }
}
