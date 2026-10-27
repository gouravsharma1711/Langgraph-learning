import { ChatGroq  } from "@langchain/groq"
import config  from "../config/config.js"
import { contentGenerationSchema, formatterSchema, topicAnalysisSchema } from "../outputSchema/modelOutputSchema.js"


export const llm = new ChatGroq({
    model:"openai/gpt-oss-20b",
    apiKey:config.GROQ_API_KEY,
    temperature:0
})

export const topicAnalyserModel = llm.withStructuredOutput(
    topicAnalysisSchema
)

export const contentGeneratorModel = llm.withStructuredOutput(
    contentGenerationSchema
)

export const formatterModel = llm.withStructuredOutput(formatterSchema)