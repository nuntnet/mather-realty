"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function GeneratePersonasPage({ params }: Props) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `Request failed with status ${res.status}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back link */}
      <Link
        href="/admin/properties"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#131F3C] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Properties
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#131F3C] flex items-center gap-2">
          <Bot className="w-6 h-6" />
          Generate AI Personas
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Property ID: <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{id}</code>
        </p>
      </div>

      {/* Action card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Click the button below to generate AI-powered buyer/renter persona descriptions
          for this property. The AI will analyze the property details and produce tailored
          content for different audience segments.
        </p>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-[#131F3C] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#1a2a50] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" />
              Generate AI Personas
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700">Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Success / result state */}
      {result !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-emerald-700">Personas generated successfully</p>
          <pre className="text-xs text-gray-700 bg-white border border-gray-100 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
