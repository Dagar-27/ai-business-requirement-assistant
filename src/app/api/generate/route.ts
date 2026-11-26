import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { requirements } = await req.json();

    if (!requirements || typeof requirements !== "string" || requirements.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide at least 10 characters of stakeholder requirements." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate requirements." },
      { status: 500 }
    );
  }
}
