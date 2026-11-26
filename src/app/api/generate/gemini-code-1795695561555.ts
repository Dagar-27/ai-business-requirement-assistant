"use client";

import React, { useState } from "react";
import { FileText, Sparkles, Download, Copy, Check, AlertCircle, Loader2 } from "lucide-react";

interface StructuredDocs {
  businessRequirements: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  userStories: string[];
  acceptanceCriteria: string[];
  openQuestions: string[];
  testCases: string[];
}

const SAMPLE_INPUT = `We need a payroll management system where employees can view and download payslips, apply for leave, and update their personal details. Managers should approve or reject leave requests, and HR should manage employee records and payroll runs.`;

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StructuredDocs | null>(null);
  const [activeTab, setActiveTab] = useState<keyof StructuredDocs>("businessRequirements");
  const [copied, setCopied] = useState(false);

  const tabs: { key: keyof StructuredDocs; label: string }[] = [
    { key: "businessRequirements", label: "Business Req." },
    { key: "functionalRequirements", label: "Functional Req." },
    { key: "nonFunctionalRequirements", label: "Non-Functional" },
    { key: "userStories", label: "User Stories" },
    { key: "acceptanceCriteria", label: "Acceptance Criteria" },
    { key: "openQuestions", label: "Open Questions" },
    { key: "testCases", label: "Test Cases" },
  ];

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
      setActiveTab("businessRequirements");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (data: StructuredDocs) => {
    const section = (title: string, items: string[]) =>
      `## ${title}\n${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n`;

    return [
      "# AI Generated Requirements Specification\n",
      section("1. Business Requirements", data.businessRequirements),
      section("2. Functional Requirements", data.functionalRequirements),
      section("3. Non-Functional Requirements", data.nonFunctionalRequirements),
      section("4. User Stories", data.userStories),
      section("5. Acceptance Criteria", data.acceptanceCriteria),
      section("6. Open Questions & Ambiguities", data.openQuestions),
      section("7. Test Cases", data.testCases),
    ].join("\n");
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(formatMarkdown(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([formatMarkdown(result)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "requirements-specification.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI Product & Business Analysis Tool
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          AI Business Requirements Assistant
        </h1>
        <p className="text-slate-600 mt-1">
          Convert raw stakeholder notes into structured BRDs, User Stories, Gherkin Acceptance Criteria, Open Questions, and QA Test Cases.
        </p>
      </div>

      {/* Screen 1: Input */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-slate-700">
            Stakeholder Notes / Raw Business Problem
          </label>
          <button
            type="button"
            onClick={() => setInput(SAMPLE_INPUT)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Load Sample Payroll Prompt
          </button>
        </div>
        <textarea
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste rough stakeholder notes, meeting minutes, or feature requests here..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Requirements...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" /> Generate Structured Docs
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screen 2: Processing Indicator */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="font-medium text-slate-800">Extracting requirements & identifying scope gaps...</p>
          <p className="text-xs text-slate-500 mt-1">Applying strict anti-hallucination rules to flag missing details.</p>
        </div>
      )}

      {/* Screen 3: Results */}
      {result && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-3 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Generated Documentation</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied Markdown" : "Copy All"}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                <Download className="w-3.5 h-3.5" /> Download .MD
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 px-4 bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label} ({result[tab.key]?.length || 0})
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="p-6">
            <ul className="space-y-3">
              {result[activeTab]?.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed"
                >
                  <span className="font-semibold text-indigo-600 mr-2">#{idx + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}