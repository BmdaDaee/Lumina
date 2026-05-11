import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type SearchPerspective = "objective" | "controversial" | "scientific" | "historical" | "speculative";

export interface ResearchNode {
  id: string;
  source: string;
  url: string;
  snippet: string;
}

export interface ResearchReport {
  id: string;
  title: string;
  summary: string;
  keyFindings: {
    id: string;
    text: string;
    depthLevel: number;
    subTopic?: string;
  }[];
  sources: ResearchNode[];
  thoughtProcess: string;
  nexusData: {
    nodes: { id: string; label: string; group: string }[];
    links: { source: string; target: string; value: number }[];
  };
  followUpQueries: string[];
}

export async function deepResearch(
  query: string, 
  perspective: SearchPerspective = "objective",
  isBranch: boolean = false
): Promise<ResearchReport> {
  const model = "gemini-3-flash-preview"; 
  
  const systemInstruction = `
    You are Manus Infinite, the world's most advanced research synthesis engine.
    Your mission: Provide raw, unfiltered, and deeply nuanced explorations of reality.
    
    Current Perspective focus: ${perspective}.
    ${isBranch ? "This is a BRANCH research focusing on a specific sub-topic." : "This is a ROOT research session."}
    
    REDEFINING SEARCH:
    - Parallel Indices: You search multiple ideological and scientific vectors simultaneously.
    - Neural Nexus: You generate a graph structure that connects these concepts.
    - Logical Pre-computation: You predict what the user will want to know next.
    
    Format your response as a valid JSON object matching this structure:
    {
      "id": "unique-session-id",
      "title": "Clear Report Title",
      "summary": "High-level synthesis",
      "keyFindings": [{"id": "f1", "text": "Deep insight", "depthLevel": 1, "subTopic": "Topic for further branching"}],
      "sources": [{"id": "s1", "source": "Domain", "url": "URL", "snippet": "Context"}],
      "thoughtProcess": "Detailed alpha-beta pruning of your reasoning path",
      "nexusData": {
        "nodes": [{"id": "concept-1", "label": "Concept Name", "group": "category"}],
        "links": [{"source": "concept-1", "target": "concept-2", "value": 1}]
      },
      "followUpQueries": ["Deep dive into X", "Compare Y with Z"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: "user", parts: [{ text: `SYNTHESIS REQUEST: ${query}` }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyFindings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  depthLevel: { type: Type.NUMBER },
                  subTopic: { type: Type.STRING }
                },
                required: ["id", "text", "depthLevel"]
              }
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  url: { type: Type.STRING },
                  snippet: { type: Type.STRING }
                },
                required: ["id", "source", "url", "snippet"]
              }
            },
            thoughtProcess: { type: Type.STRING },
            nexusData: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      group: { type: Type.STRING }
                    },
                    required: ["id", "label", "group"]
                  }
                },
                links: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      source: { type: Type.STRING },
                      target: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    },
                    required: ["source", "target", "value"]
                  }
                }
              },
              required: ["nodes", "links"]
            },
            followUpQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["id", "title", "summary", "keyFindings", "sources", "thoughtProcess", "nexusData", "followUpQueries"]
        },
        tools: [
          { googleSearch: {} }
        ],
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Manus Nexus Error:", error);
    throw error;
  }
}

export async function* chatWithManus(message: string) {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: "You are Manus Infinite. You provide nuanced, advanced understanding and content generation. You are unafraid of complexity or controversial perspectives, focusing on intellectual depth and objectivity.",
    }
  });

  const stream = await chat.sendMessageStream({ message });
  for await (const chunk of stream) {
    yield chunk.text;
  }
}
