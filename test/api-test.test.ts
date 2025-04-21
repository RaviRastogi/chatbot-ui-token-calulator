import { readFile } from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'

describe('File Processing API', () => {
  let testFilePath: string
  let fileContent: Buffer

  beforeAll(async () => {
    testFilePath = path.join(process.cwd(), 'test_file.txt')
    fileContent = await readFile(testFilePath)
  })

  it('should process a text file correctly', async () => {
    const formData = new FormData()
    formData.append('files', fileContent, {
      filename: 'test_file.txt',
      contentType: 'text/plain'
    })

    const response = await fetch('http://localhost:3000/api/process-files', {
      method: 'POST',
      body: formData
    })

    expect(response.ok).toBe(true)

    const result = await response.json()
    expect(result.success).toBe(true)
    expect(Array.isArray(result.files)).toBe(true)
    expect(result.files.length).toBe(1)

    const processedFile = result.files[0]
    expect(processedFile).toHaveProperty('content')
    expect(processedFile).toHaveProperty('metadata')
    expect(processedFile.metadata).toHaveProperty('filename', 'test_file.txt')
    expect(processedFile.metadata).toHaveProperty('fileType', 'text')
    
    console.log('Processed file content:', processedFile.content)
  }, 10000) // Increase timeout to 10 seconds
}) 