import { StateGraph, START, END, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import {
  contentGeneratorModel,
  formatterModel,
  topicAnalyserModel,
} from "./models/model.js";
import { HumanMessage, SystemMessage } from "langchain";
import {
  contentGeneratorPrompt,
  finalFormatterPrompt,
  topicAnalyserPrompt,
} from "./prompt/prompts.js";

const difficultyType = z.enum(["beginner", "intermediate", "advanced"]);

const studyState = new StateSchema({
  topic: z.string().default(""),
  difficulty: difficultyType.default("beginner"),
  subTopic: z.array(z.string()).default([]),
  content: z.string().default(""),
  result: z.string().default(""),
});

type StudyState = typeof studyState.State;

const topicAnalyser = async (state: StudyState) => {
  const systemMsg = new SystemMessage(topicAnalyserPrompt);
  const humanMsg = new HumanMessage(`topic is : ${state.topic}`);
  const msg = [systemMsg, humanMsg];

  const response = await topicAnalyserModel.invoke(msg);

  return {
    difficulty: response.difficulty,
    subTopic: response.subtopics,
  };
};
const contentGenerator = async (state: StudyState) => {
  const systemMsg = new SystemMessage(
    `${contentGeneratorPrompt}
        topic:${state.topic}
    The difficulty level is: ${state.difficulty}

    The subtopics are:
    ${state.subTopic.map((topic) => `- ${topic}`).join("\n")}
    `,
  );

  const msg = [systemMsg];

  const response = await contentGeneratorModel.invoke(msg);

  return {
    content: response.content,
  };
};

const finalFormatter = async (state: StudyState) => {
  const systemMsg = new SystemMessage(
    finalFormatterPrompt + `here is the content : ${state.content}`,
  );
  const msg = [systemMsg];

  const response = await formatterModel.invoke(msg);

  return {
    result: response.result,
  };
};

const agent = new StateGraph(studyState)
  // ADD NODES
  .addNode("topicAnalyser", topicAnalyser)
  .addNode("contentGenerator", contentGenerator)
  .addNode("finalFormatter", finalFormatter)
  // ADD EDGES
  .addEdge(START, "topicAnalyser")
  .addEdge("topicAnalyser", "contentGenerator")
  .addEdge("contentGenerator", "finalFormatter")
  .addEdge("finalFormatter", END)
  // COMPILE THE GRAPH
  .compile();

// invoke the agent
const initalState = {
  topic: "how to cure from depression when a girl left you alone which you love most",
};
const result = await agent.invoke(initalState);

console.log(result.result);
