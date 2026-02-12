"use client";

import React, { useMemo, useState, useEffect } from "react";
import data from "../../data/database.json";

type ExampleUrl = string;

type Subtype = {
  type: string;
  examples: ExampleUrl[];
};

type Topic = {
  type: string;
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

// Lightweight video preview card using noembed to fetch title + thumbnail
const VideoPreview: React.FC<{ url: string }> = ({ url }) => {
  const [title, setTitle] = useState<string | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        if (cancelled) return;
        setTitle((json.title as string) || url);
        setThumb((json.thumbnail_url as string) || null);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Compact horizontal card with 100x100 square thumbnail and text on the right
  if (failed) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full">
        <div className="flex w-full items-center gap-3 rounded-md border border-zinc-200 bg-white p-2 transition hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex h-[100px] w-[100px] flex-none items-center justify-center rounded bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            No preview
          </div>
          <div className="min-w-0">
            <div className="line-clamp-2 text-sm font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
              {url}
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-3">
      <div className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-2 transition hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        {thumb ? (
          <img src={thumb} alt={title ?? url} className="h-[100px] w-[100px] flex-none rounded object-cover" loading="lazy" />
        ) : (
          <div className="flex h-[100px] w-[100px] flex-none items-center justify-center rounded bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Loading preview…
          </div>
        )}
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {title ?? url}
          </div>
          <div className="mt-1 text-xs text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
            {(() => { try { return new URL(url).hostname; } catch { return url; } })()}
          </div>
        </div>
      </div>
    </a>
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
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Classification of common marketing tricks and patterns observed online. <br /> Created by Daniil Orain, managed by the <a href={"https://github.com/ungarson/GoyMarketing"} className={"text-blue-300"} target={"_blank"}>community</a>.
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Disclaimer: These examples are provided for educational purposes only, to help people (ESPECIALLY GOYIM) recognize persuasive tactics and avoid being misled. Watch closely, you are being tricked every fucking day.
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
                      {subs.length === 0 ? (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">No subtypes</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {subs.map((sub, sIdx) => {
                            const key = `${tIdx}-${sIdx}`;
                            const subOpen = !!expandedSubtypes[key];
                            return (
                              <li key={key}>
                                <div className="rounded-md border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-700 dark:bg-zinc-800/60">
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
                                      {sub.examples && sub.examples.length > 0 ? (
                                        <div className="grid grid-cols-1">
                                          {sub.examples.map((url, i) => (
                                            <VideoPreview key={i} url={url} />
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">No examples</p>
                                      )}
                                    </div>
                                  )}
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
