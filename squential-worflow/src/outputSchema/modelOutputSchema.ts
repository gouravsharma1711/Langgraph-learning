import {z} from 'zod';

export const topicAnalysisSchema  = z.object({
    difficulty : z.enum([
    "beginner",
    "intermediate",
    "advanced",
  ]),
  subtopics: z.array(z.string()),
})

export const contentGenerationSchema = z.object({
    content:z.string()
})

export const formatterSchema = z.object({
    result:z.string()
})