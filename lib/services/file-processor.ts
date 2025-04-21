import { readFile } from "fs/promises"
import path from "path"

interface ProcessedFile {
  content: string
  metadata: {
    filename: string
    fileType: string
    size: number
    processedAt: Date
  }
}

export class FileProcessor {
  private static async readTextFile(filePath: string): Promise<string> {
    const content = await readFile(filePath, "utf-8")
    return content.trim()
  }

  private static async readSQLFile(filePath: string): Promise<string> {
    const content = await readFile(filePath, "utf-8")
    // Remove SQL comments and empty lines
    return content
      .split("\n")
      .filter(line => !line.trim().startsWith("--") && line.trim() !== "")
      .join("\n")
      .trim()
  }

  private static getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase()
    switch (ext) {
      case ".txt":
        return "text"
      case ".sql":
        return "sql"
      case ".json":
        return "json"
      case ".md":
        return "markdown"
      default:
        return "unknown"
    }
  }

  static async processFile(filePath: string): Promise<ProcessedFile> {
    const filename = path.basename(filePath)
    const fileType = this.getFileType(filename)
    const stats = await readFile(filePath).then(buffer => ({
      size: buffer.length
    }))

    let content: string

    switch (fileType) {
      case "sql":
        content = await this.readSQLFile(filePath)
        break
      case "json":
        const jsonContent = await this.readTextFile(filePath)
        // Format JSON for better readability
        content = JSON.stringify(JSON.parse(jsonContent), null, 2)
        break
      default:
        content = await this.readTextFile(filePath)
    }

    // Format content for LLM consumption
    const formattedContent = this.formatForLLM(content, fileType)

    return {
      content: formattedContent,
      metadata: {
        filename,
        fileType,
        size: stats.size,
        processedAt: new Date()
      }
    }
  }

  private static formatForLLM(content: string, fileType: string): string {
    // Create a structured format that helps LLM understand the content better
    return `File Type: ${fileType.toUpperCase()}
Content:
${content}

Note: This content has been processed and formatted for analysis. Please analyze the content and provide relevant insights or answers based on this information.`
  }
}
