import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a Principal AI Business Analyst and Product Owner.
Convert unstructured stakeholder notes into clear, structured product and business documentation.

CRITICAL RULES:
1. Never invent or assume missing business rules, SLAs, tax rates, or approval workflows. Put every missing detail or ambiguity into "openQuestions".
2. Write User Stories strictly in the format: "As a [role], I want [goal], so that [benefit]."
3. Write Acceptance Criteria strictly in Gherkin format: "Given [context], when [action], then [outcome]."
4. Return ONLY valid JSON matching the exact schema below.

JSON SCHEMA:
{
  "businessRequirements": ["string"],
  "functionalRequirements": ["string"],
  "nonFunctionalRequirements": ["string"],
  "userStories": ["string"],
  "acceptanceCriteria": ["string"],
  "openQuestions": ["string"],
  "testCases": ["string"]
}`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.GROQ_API_KEY
        ? "https://api.groq.com/openai/v1"
        : undefined,
    });

    const body = await req.json();
    const requirements = body?.requirements;

    if (!requirements || typeof requirements !== "string" || requirements.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide at least 10 characters of stakeholder requirements." },
        { status: 400 }
      );
    }

    const model = process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Stakeholder Input:\n${requirements}` },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI model.");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate requirements.";
    console.error("Generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
