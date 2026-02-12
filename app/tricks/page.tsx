"use client";

import React, { useMemo, useState } from "react";
import data from "../../data/database.json";

type ExampleUrl = string;

type Subtype = {
  type: string;
  warning?: string;
  examples?: ExampleUrl[];
};

type Topic = {
  type: string;
  warning?: string;
  examples?: ExampleUrl[];
  subtypes?: Subtype[];
};

// database.json is an object with numeric-string keys mapping to Topic
type Database = Record<string, Topic>;

const topicsData: Database = data as any;

// Format segments wrapped in asterisks as italic while preserving plain text
function formatEmphasis(text: string): React.ReactNode {
  // Split by *segment* while keeping the delimiters as separate items
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return <em key={idx}>{inner}</em>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}


// Detect whether the whole string is a single URL (no additional text)
function isSingleUrl(text: string): boolean {
  const trimmed = text.trim();
  try {
    const u = new URL(trimmed);
    // Ensure original is exactly the URL without surrounding words
    return trimmed === u.href || trimmed === `${u.protocol}//${u.host}${u.pathname}${u.search}${u.hash}`;
  } catch {
    return false;
  }
}

// Component to auto-link any URLs inside arbitrary text
const AutoLinkText: React.FC<{ text: string }> = ({ text }) => {
  // Basic URL regex (http/https) that avoids swallowing trailing punctuation
  const urlRegex = /(https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+)(?![\w\-._~:/?#\[\]@!$&'()*+,;=%])/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    const [url] = match;
    const start = match.index;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push(
      <a key={start} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
        {url}
      </a>
    );
    lastIndex = start + url.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
};

// Render a simple link for pure URLs, or a text block with auto-linked URLs for mixed text
const ExampleItem: React.FC<{ value: string }> = ({ value }) => {
  if (isSingleUrl(value)) {
    const url = value.trim();
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block break-words text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
      >
        {url}
      </a>
    );
  }
  return (
    <div className="mt-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-sm text-zinc-800 dark:text-zinc-200">
        <AutoLinkText text={value} />
      </p>
    </div>
  );
};

export default function TopicsPage() {
  // Prepare a stable, sorted array of tricks
  const topics = useMemo(() => {
    return Object.entries(topicsData)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, value]) => value);
  }, []);

  // Expanded state defaults: only the first top-level topic open; all subtypes closed
  const defaultExpandedTopics = useMemo(() => {
    const map: Record<number, boolean> = {};
    // Open only the first topic (index 0)
    if (topics.length > 0) map[0] = true;
    return map;
  }, [topics]);

  const defaultExpandedSubtypes = useMemo(() => {
    // Start with all subtypes collapsed by default
    const map: Record<string, boolean> = {};
    return map;
  }, [topics]);

  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>(defaultExpandedTopics);
  const [expandedSubtypes, setExpandedSubtypes] = useState<Record<string, boolean>>(defaultExpandedSubtypes);

  const toggleTopic = (idx: number) =>
    setExpandedTopics((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const toggleSubtype = (topicIdx: number, subtypeIdx: number) => {
    const key = `${topicIdx}-${subtypeIdx}`;
    setExpandedSubtypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <main className="w-full max-w-4xl rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 p-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Marketing Tricks</h1>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <strong>IMPORTANT DISCLAIMER, PLEASE READ THIS SHIT:</strong> These examples are provided for educational purposes only, to help people (ESPECIALLY GOYIM) recognize persuasive tactics and avoid being misled. Watch closely, you are being tricked every fucking day by sociopaths.
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Created by Daniil Orain, managed by the <a href={"https://github.com/ungarson/GoyMarketing"} className={"text-blue-300"} target={"_blank"}>community</a>.
          </p>
        </header>
        {/* Scrollable content box */}
        <section className="max-h-[75vh] overflow-y-auto p-5">
          <ul className="space-y-3">
            {topics.map((topic, tIdx) => {
              const isOpen = !!expandedTopics[tIdx];
              const subs = topic.subtypes ?? [];
              return (
                <li key={tIdx} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleTopic(tIdx)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:hover:bg-zinc-800/60"
                  >
                    <strong className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatEmphasis(topic.type)}
                    </strong>
                    <span
                      className={`select-none text-zinc-500 transition-transform dark:text-zinc-400 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                      aria-hidden
                    >
                      ▶
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                      {topic.warning && (
                        <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200">
                          <strong className="mr-1">Warning:</strong>
                          <span><AutoLinkText text={topic.warning} /></span>
                        </div>
                      )}

                      {topic.examples && topic.examples.length > 0 && (
                        <div className="mt-2 grid grid-cols-1">
                          {topic.examples.map((value, i) => (
                            <ExampleItem key={`t-${tIdx}-ex-${i}`} value={value} />
                          ))}
                        </div>
                      )}

                      {subs.length === 0 ? (
                        !topic.examples || topic.examples.length === 0 ? (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">No subtypes</p>
                        ) : null
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {subs.map((sub, sIdx) => {
                            const key = `${tIdx}-${sIdx}`;
                            const subOpen = !!expandedSubtypes[key];
                            return (
                              <li key={key}>
                                <div className="rounded-md border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-700 dark:bg-zinc-800/60">
                                  {(() => {
                                    const hasExamples = Array.isArray(sub.examples) && sub.examples.length > 0;
                                    const hasWarning = !!sub.warning;
                                    const hasContent = hasExamples || hasWarning;
                                    if (!hasContent) {
                                      return (
                                        <div className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2">
                                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {formatEmphasis(sub.type)}
                                          </span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <>
                                        <button
                                          type="button"
                                          aria-expanded={subOpen}
                                          onClick={() => toggleSubtype(tIdx, sIdx)}
                                          className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:hover:bg-zinc-800/60"
                                        >
                                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {formatEmphasis(sub.type)}
                                          </span>
                                          <span
                                            className={`select-none text-xs text-zinc-500 transition-transform dark:text-zinc-400 ${subOpen ? "rotate-90" : ""}`}
                                            aria-hidden
                                          >
                                            ▶
                                          </span>
                                        </button>
                                        {subOpen && (
                                          <div className="px-3 pb-2">
                                            {sub.warning && (
                                              <div className="mb-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-amber-900 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-200">
                                                <strong className="mr-1">Warning:</strong>
                                                <span><AutoLinkText text={sub.warning} /></span>
                                              </div>
                                            )}
                                            {hasExamples && (
                                              <div className="grid grid-cols-1">
                                                {sub.examples!.map((value, i) => (
                                                  <ExampleItem key={i} value={value} />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
