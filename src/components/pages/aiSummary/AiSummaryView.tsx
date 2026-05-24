"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Header from "@/src/components/common/header";
import { generateAiSummary } from "@/src/actions/aiSummary/aiSummary";
import SummaryForm from "./components/SummaryForm";
import SummaryDetails from "./components/SummaryDetails";

export default function AiSummaryView() {
  const [activeSummary, setActiveSummary] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate(start: string, end: string) {
    setGenerating(true);
    setActiveSummary(null);
    try {
      const res = await generateAiSummary(start, end);
      if (res.success && res.summary) {
        toast.success("AI Summary generated successfully!");
        setActiveSummary({
          title: `Summary: ${new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
          summary_text: res.summary,
          stats: res.stats
        });
      } else {
        toast.error(res.error || "Failed to generate summary.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-primary">
      <Header title="AI Performance Summary" />
      
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-1">
          <SummaryForm onGenerate={handleGenerate} isGenerating={generating} />
        </div>

        {/* Right Column: AI Insights Render Card */}
        <div className="lg:col-span-2">
          <SummaryDetails
            summary={activeSummary}
            isGenerating={generating}
          />
        </div>
      </div>
    </div>
  );
}
