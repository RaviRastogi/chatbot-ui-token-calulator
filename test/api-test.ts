import { createReadStream } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'

async function testFileUpload() {
  try {
    // Read the test file
    const testFilePath = path.join(process.cwd(), 'test_file.txt')
    const fileContent = await readFile(testFilePath)
    
    // Create form data
    const formData = new FormData()
    const file = new File([fileContent], 'test_file.txt', { type: 'text/plain' })
    formData.append('files', file)

    // Send request to the API
    const response = await fetch('http://localhost:3000/api/process-files', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`API Error: ${result.error || 'Unknown error'}`)
    }

    console.log('API Response:', JSON.stringify(result, null, 2))
    
    // Verify the response structure
    if (!result.success || !Array.isArray(result.files)) {
      throw new Error('Invalid response structure')
    }

    const processedFile = result.files[0]
    if (!processedFile.content || !processedFile.metadata) {
      throw new Error('Invalid file processing result')
    }

    console.log('Test passed successfully!')
    return true

  } catch (error) {
    console.error('Test failed:', error)
    return false
  }
}

// Run the test
testFileUpload() 