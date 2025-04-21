import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand
} from "@aws-sdk/client-bedrock-runtime"
import { StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"

export const runtime: ServerRuntime = "edge"

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, chatSettings } = json as {
    messages: any[]
    chatSettings: ChatSettings
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.aws_access_key_id, "AWS Access Key ID")
    checkApiKey(profile.aws_secret_access_key, "AWS Secret Access Key")
    checkApiKey(profile.aws_region, "AWS Region")

    if (
      !profile.aws_region ||
      !profile.aws_access_key_id ||
      !profile.aws_secret_access_key
    ) {
      throw new Error("AWS credentials are missing")
    }

    const bedrockClient = new BedrockRuntimeClient({
      region: profile.aws_region,
      credentials: {
        accessKeyId: profile.aws_access_key_id,
        secretAccessKey: profile.aws_secret_access_key
      }
    })

    const modelId = chatSettings.model
    const formattedMessages = messages.map((message: any) => ({
      role: message.role === "user" ? "user" : "assistant",
      content: message.content
    }))

    const input = {
      modelId,
      messages: formattedMessages,
      temperature: chatSettings.temperature
    }

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: input.modelId,
      body: JSON.stringify({
        prompt: `\n\nHuman: ${messages[messages.length - 1].content}\n\nAssistant:`,
        max_tokens: chatSettings.contextLength,
        temperature: input.temperature,
        anthropic_version: "bedrock-2023-05-31"
      })
    })

    const response = await bedrockClient.send(command)
    const decoder = new TextDecoder()

    if (!response.body) {
      throw new Error("No response body received from Bedrock")
    }

    const responseBody = response.body as AsyncIterable<{
      chunk: { bytes: Uint8Array }
    }>

    return new StreamingTextResponse(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseBody) {
              if (!chunk.chunk?.bytes) continue
              const text = decoder.decode(chunk.chunk.bytes)
              const result = JSON.parse(text)

              // Handle Bedrock's response format
              if (result.delta?.text) {
                controller.enqueue(result.delta.text)
              } else if (result.completion) {
                controller.enqueue(result.completion)
              }
            }
          } catch (error) {
            console.error("Error processing stream:", error)
          } finally {
            controller.close()
          }
        }
      })
    )
  } catch (error: any) {
    const errorMessage = error.message || "An error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
