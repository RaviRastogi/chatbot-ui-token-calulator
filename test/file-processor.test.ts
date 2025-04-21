import { FileProcessor } from '@/lib/services/file-processor'
import { readFile, writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import os from 'os'

describe('FileProcessor', () => {
  const testContent = `This is a test file content.
It contains multiple lines
to test our file processing system.

Let's see if it handles:
- Multiple lines
- Special characters: !@#$%
- Numbers: 123456`

  let tempFilePath: string

  beforeEach(async () => {
    // Create a temporary test file
    const tempDir = os.tmpdir()
    tempFilePath = join(tempDir, 'test.txt')
    await writeFile(tempFilePath, testContent)
  })

  afterEach(async () => {
    // Clean up temporary file
    try {
      await unlink(tempFilePath)
    } catch (error) {
      console.error('Error cleaning up test file:', error)
    }
  })

  test('processFile should correctly process a text file', async () => {
    const result = await FileProcessor.processFile(tempFilePath)

    // Verify the result structure
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('metadata')
    
    // Verify metadata
    expect(result.metadata).toHaveProperty('filename', 'test.txt')
    expect(result.metadata).toHaveProperty('fileType', 'text')
    expect(result.metadata).toHaveProperty('size')
    expect(result.metadata).toHaveProperty('processedAt')

    // Verify content format
    expect(result.content).toContain('File Type: TEXT')
    expect(result.content).toContain(testContent)
    expect(result.content).toContain('Note: This content has been processed')
  })

  test('processFile should handle special characters', async () => {
    const result = await FileProcessor.processFile(tempFilePath)
    expect(result.content).toContain('Special characters: !@#$%')
  })

  test('processFile should preserve line breaks', async () => {
    const result = await FileProcessor.processFile(tempFilePath)
    const lines = result.content.split('\n')
    expect(lines.length).toBeGreaterThan(1)
  })
}) 