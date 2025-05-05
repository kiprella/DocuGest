"use client";
import { useRef, useState } from "react";
import Image from "next/image";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="ml-auto flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium transition-colors"
      onClick={async e => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Copy summary"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (file && !/\.(pdf|docx|txt)$/i.test(file.name)) {
      setError("Only PDF, DOCX, or TXT files are allowed.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    setError("");
    const file = e.dataTransfer.files?.[0];
    if (file && !/\.(pdf|docx|txt)$/i.test(file.name)) {
      setError("Only PDF, DOCX, or TXT files are allowed.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file || null);
  };

  const handleSummarize = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Unexpected server error. Please try again.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to summarize");
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101014] flex flex-col">
      {/* Top Nav */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-500 shadow text-white">
        <div className="flex items-center gap-2">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M7 7h10v4H7z" fill="currentColor" opacity=".2"/><path d="M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span className="font-bold text-2xl tracking-tight">DocuDigest</span>
        </div>
        <span className="hidden sm:block text-sm font-medium opacity-80">AI-powered document summarization</span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 mt-8">Upload Your Document</h2>
          <div
            className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-[#18181b] ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <svg className="w-14 h-14 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M7 7h10v4H7z" fill="currentColor" opacity=".2"/><path d="M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Upload your document</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Drop your file here, or click to browse</span>
            <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500 mb-2">
              <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>PDF</span>
              <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>DOCX</span>
              <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>TXT</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Max file size: 10MB</span>
            {selectedFile && (
              <div className="mt-4 text-sm text-green-600 dark:text-green-400">Selected: {selectedFile.name}</div>
            )}
            {error && (
              <div className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
          </div>
          <button
            className="w-full mt-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            disabled={!selectedFile || loading}
            onClick={handleSummarize}
          >
            {loading ? "Summarizing..." : "Summarize Document"}
          </button>
        </div>

        {/* Output or Empty State */}
        <div className="w-full max-w-2xl mx-auto mt-12">
          {summary ? (
            <div className="w-full max-h-80 overflow-y-auto bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 fade-in flex flex-col gap-2 relative">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <span className="font-semibold text-blue-700 dark:text-blue-300 text-base">AI Summary</span>
                <CopyButton text={summary} />
              </div>
              <div className="text-gray-800 dark:text-gray-100 text-[1rem] leading-relaxed whitespace-pre-line">
                {summary}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#18181b] rounded-xl border border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
              <svg className="w-16 h-16 text-blue-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M7 7h10v4H7z" fill="currentColor" opacity=".2"/><path d="M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No documents yet</span>
              <span className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">Upload a PDF, DOCX, or TXT file to get an instant AI-powered summary.</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
                Upload a document to get started
              </span>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-auto py-6 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} DocuDigest. All rights reserved.
      </footer>
      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.7s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
