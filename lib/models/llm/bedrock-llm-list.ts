import { LLM } from "@/types"

const BEDROCK_PLATFORM_LINK = "https://aws.amazon.com/bedrock/"

// Claude 3 Sonnet
const CLAUDE3_SONNET: LLM = {
  modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
  modelName: "Claude 3 Sonnet",
  provider: "bedrock",
  hostedId: "anthropic.claude-3-sonnet-20240229-v1:0",
  platformLink: BEDROCK_PLATFORM_LINK,
  imageInput: true
}

// Claude 3 Haiku
const CLAUDE3_HAIKU: LLM = {
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  modelName: "Claude 3 Haiku",
  provider: "bedrock",
  hostedId: "anthropic.claude-3-haiku-20240307-v1:0",
  platformLink: BEDROCK_PLATFORM_LINK,
  imageInput: true
}

// Claude 2.1
const CLAUDE2_1: LLM = {
  modelId: "anthropic.claude-v2:1",
  modelName: "Claude 2.1",
  provider: "bedrock",
  hostedId: "anthropic.claude-v2:1",
  platformLink: BEDROCK_PLATFORM_LINK,
  imageInput: false
}

// Titan Text
const TITAN_TEXT: LLM = {
  modelId: "amazon.titan-text-express-v1",
  modelName: "Titan Text Express",
  provider: "bedrock",
  hostedId: "amazon.titan-text-express-v1",
  platformLink: BEDROCK_PLATFORM_LINK,
  imageInput: false
}

export const BEDROCK_LLM_LIST: LLM[] = [
  CLAUDE3_SONNET,
  CLAUDE3_HAIKU,
  CLAUDE2_1,
  TITAN_TEXT
]
