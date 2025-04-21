import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { getBase64FromDataURL, getMediaTypeFromDataURL } from "@/lib/utils"
import { ChatSettings } from "@/types"
import Anthropic from "@anthropic-ai/sdk"
import { AnthropicStream, StreamingTextResponse } from "ai"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.anthropic_api_key, "Anthropic")

    // Format messages for Anthropic API
    const systemMessage = messages[0]?.content || ""
    const userMessages = messages.slice(1).filter(msg => msg.content)

    const formattedMessages = userMessages.map((message: any) => {
      let messageContent = message.content

      // If content is a string, convert it to the expected format
      if (typeof messageContent === "string") {
        if (!messageContent.trim()) {
          throw new Error("Message content cannot be empty")
        }
        return {
          role:
            message.role === "user"
              ? ("user" as const)
              : ("assistant" as const),
          content: messageContent
        }
      }

      // If content is an array, process each item
      if (Array.isArray(messageContent)) {
        const processedContent = messageContent
          .map((item: any) => {
            if (typeof item === "string") {
              return item.trim() ? { type: "text", text: item } : null
            }

            if (item.type === "text") {
              return item.text?.trim() ? item : null
            }

            if (item.type === "image_url" && item.image_url?.url) {
              return {
                type: "image",
                source: {
                  type: "base64",
                  media_type: getMediaTypeFromDataURL(item.image_url.url),
                  data: getBase64FromDataURL(item.image_url.url)
                }
              }
            }

            return null
          })
          .filter(Boolean) // Remove null values

        if (processedContent.length === 0) {
          throw new Error("Message content cannot be empty")
        }

        return {
          role:
            message.role === "user"
              ? ("user" as const)
              : ("assistant" as const),
          content: processedContent
        }
      }

      throw new Error("Invalid message format")
    })

    if (formattedMessages.length === 0) {
      throw new Error("No valid messages to send")
    }

    const anthropic = new Anthropic({
      apiKey: profile.anthropic_api_key || ""
    })

    try {
      console.log("Sending request to Anthropic API:", {
        model: chatSettings.model,
        messageCount: formattedMessages.length,
        temperature: chatSettings.temperature,
        hasSystemMessage: !!systemMessage
      })

      const response = await anthropic.messages.create({
        model: chatSettings.model,
        messages: formattedMessages,
        temperature: chatSettings.temperature,
        system: systemMessage,
        max_tokens:
          CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TOKEN_OUTPUT_LENGTH ||
          4096,
        stream: true
      })

      try {
        const stream = AnthropicStream(response)
        return new StreamingTextResponse(stream)
      } catch (error: any) {
        console.error("Error parsing Anthropic stream:", error)
        return new NextResponse(
          JSON.stringify({
            message:
              "Error parsing Anthropic stream: " +
              (error.message || "Unknown error")
          }),
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error("Anthropic API error:", error)
      const errorMessage =
        error.error?.message || error.message || "Unknown error"
      return new NextResponse(
        JSON.stringify({
          message: "Anthropic API error: " + errorMessage
        }),
        { status: error.status || 500 }
      )
    }
  } catch (error: any) {
    console.error("Request processing error:", error)
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Anthropic API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Anthropic API Key is incorrect. Please fix it in your profile settings."
    }

    return new NextResponse(
      JSON.stringify({
        message: errorMessage,
        code: errorCode
      }),
      {
        status: errorCode
      }
    )
  }
}
