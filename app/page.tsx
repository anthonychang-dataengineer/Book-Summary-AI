"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSummarize() {
    console.log("button clicked, file is:", file);
    if (!file) return;
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/summarize", { method: "POST", body: form });
      console.log("response status:", res.status);

      const data = await res.json();
      console.log("data:", data);
      setResult(data);
    } catch (err) {
      console.error("fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1>Book Summarizer</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button onClick={handleSummarize} disabled={!file || loading}>
        {loading ? "Summarizing…" : "Summarize"}
      </button>

      {loading && <p>Working through the chapters — this can take a minute.</p>}

      {result && (
        <section style={{ marginTop: 32, lineHeight: 1.6 }}>
          <h2 style={{ marginBottom: 4 }}>{result.bookTitle}</h2>
          <p style={{ color: "#666", marginTop: 0 }}>{result.bookAuthor}</p>

          <h3 style={{ marginTop: 28 }}>Overall Summary</h3>
          <ReactMarkdown>{result.finalSummary}</ReactMarkdown>

          <h3 style={{ marginTop: 28 }}>Chapter Summaries</h3>
          {result.chapterSummaries?.map((ch: string, i: number) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <ReactMarkdown>{ch}</ReactMarkdown>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}