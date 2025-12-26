import { GoogleGenAI } from "@google/genai";
import { LinearIssue, DayLog, ShipFormat } from '../types';

// Helper to strip Markdown code blocks that LLMs love to include
const cleanJson = (text: string): string => {
  return text
    .replace(/^```json\s*/, '') // Remove start of code block
    .replace(/^```\s*/, '')      // Remove start if no lang specified
    .replace(/```\s*$/, '')      // Remove end of code block
    .trim();
};

export const planDayFromTask = async (
  task: LinearIssue | LinearIssue[] | string, 
  apiKey: string
): Promise<Partial<DayLog>> => {
  
  if (!apiKey) throw new Error("Gemini API Key required for Agent Mode");

  const ai = new GoogleGenAI({ apiKey });
  
  let taskContent = "";
  
  if (Array.isArray(task)) {
      const descriptions = task.map(t => `- [${t.identifier}] ${t.title}: ${t.description || 'No description'}`).join('\n');
      taskContent = `Multiple Tasks Selected:\n${descriptions}`;
  } else if (typeof task === 'string') {
      taskContent = `Task: ${task}`;
  } else {
      taskContent = `Task: ${task.identifier} - ${task.title}\nDescription: ${task.description || ''}`;
  }

  const prompt = `
    You are an expert productivity agent for the "Lin34r System" (part of the Graphyn.xyz ecosystem).
    
    The user wants to work on these task(s):
    ${taskContent}
    
    Your goal is to break this into a compliant "Lin34r System" plan.
    
    RULES:
    1. Main Objective: Must be a SINGLE "shippable slice". 
       - If multiple tasks are provided, DO NOT abstract them into a generic project name (e.g., "Sprint Work").
       - Instead, create a COMPOUND objective by appending the key actions (e.g., "Fix Navigation Bug + Update Hero Styles").
       - Ensure the specific tasks are visible in the objective title.
    2. Ship Format: Categorize as CODE, WRITING, DESIGN, STRATEGY, or PERSONAL.
    3. Definition of Done: A binary state (e.g., "PR Merged", "Doc sent", "Video recorded").
    4. First Action: EXTREMELY SPECIFIC <2 minute task to break inertia for the FIRST task. 
       - Bad: "Start coding"
       - Good: "Open src/auth/Login.tsx", "Create branch fix/login-bug".
    5. Micro Steps: 3 very granular, almost trivial steps to use if stuck.
       - These should be the absolute first 3 physical actions to take to get moving.
    
    Return purely JSON with this schema:
    {
      "mainObjective": "string",
      "shipFormat": "string (enum)",
      "definitionOfDone": "string",
      "firstAction": "string",
      "microSteps": ["string", "string", "string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Agent");

    const cleanedText = cleanJson(text);
    let plan;
    try {
        plan = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse Agent JSON:", cleanedText);
        throw new Error("Agent returned invalid JSON");
    }

    // Validate ShipFormat
    const validFormats: ShipFormat[] = ['CODE', 'WRITING', 'DESIGN', 'STRATEGY', 'PERSONAL'];
    let format: ShipFormat = 'CODE';
    if (plan.shipFormat && validFormats.includes(plan.shipFormat.toUpperCase() as ShipFormat)) {
        format = plan.shipFormat.toUpperCase() as ShipFormat;
    }

    return {
      mainObjective: plan.mainObjective || "",
      shipFormat: format,
      definitionOfDone: plan.definitionOfDone || "",
      currentFirstAction: plan.firstAction || "", 
      microSteps: Array.isArray(plan.microSteps) ? plan.microSteps : ["", "", ""]
    };

  } catch (error) {
    console.error("Agent Planning Failed", error);
    throw error;
  }
};