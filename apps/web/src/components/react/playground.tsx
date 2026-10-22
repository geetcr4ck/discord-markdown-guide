import React, { useEffect, useRef, useState } from "react";
import { toHTML } from "../../markdown";
import { copyText } from "../../scripts/copy";
import { initSpoilers } from "../../scripts/spoiler";

export interface PlaygroundProps {
  defaultValue: string;
  samples: { label: string; value: string }[];
  labels: {
    source: string;
    specimen: string;
    copy: string;
    copied: string;
    reset: string;
    samples: string;
    note: string;
  };
  lang?: "en" | "id";
}

export function Playground({
  defaultValue,
  samples,
  labels,
  lang = "en",
}: PlaygroundProps) {
  const t = labels;
  const [value, setValue] = useState(defaultValue);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const specimenRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<number | null>(null);

  // Parse HTML synchronously: works on SSR and reacts to changes on client
  const html = toHTML(value, { locale: lang });

  // Line count for the 3ch gutter
  const lineCount = value.split("\n").length;
  const lineNumbers = Array.from(
    { length: Math.max(lineCount, 1) },
    (_, i) => i + 1
  ).join("\n");

  useEffect(() => {
    if (specimenRef.current) initSpoilers(specimenRef.current);
  }, [html]);

  const handleCopy = async () => {
    const didCopy = await copyText(value);

    if (copyTimer.current !== null) {
      window.clearTimeout(copyTimer.current);
      copyTimer.current = null;
    }

    setCopied(didCopy);

    if (didCopy) {
      copyTimer.current = window.setTimeout(() => {
        setCopied(false);
        copyTimer.current = null;
      }, 2000);
      return;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.select();
    }
  };

  const handleReset = () => {
    setValue(defaultValue);
    setCopied(false);
    if (copyTimer.current !== null) {
      window.clearTimeout(copyTimer.current);
      copyTimer.current = null;
    }
  };

  const handleSampleClick = (sampleValue: string) => {
    setValue(sampleValue);
  };

  return (
    <div className="w-full my-6 flex flex-col gap-4">
      {/* Bench: Two panes on paper-2 working surface with drafting grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-4 items-stretch p-4 md:p-6 bg-[var(--paper2)] border border-[var(--ink)] drafting-grid">
        {/* Source Pane */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="playground-source"
              className="font-mono text-xs uppercase tracking-wider text-[var(--ink)] font-semibold"
            >
              {t.source}
            </label>
            <span className="font-mono text-[0.625rem] text-[var(--ink3)]">
              MARKDOWN
            </span>
          </div>

          <div className="relative flex flex-1 min-h-[340px] border border-[var(--ink)] bg-[var(--paper)]">
            {/* 3ch gutter line numbers */}
            <pre
              aria-hidden="true"
              className="select-none py-3 pl-3 pr-2 font-mono text-sm leading-relaxed text-[var(--ink3)] border-r border-[var(--rule)] bg-[var(--paper2)] text-right min-w-[3.5ch] m-0 overflow-hidden"
            >
              {lineNumbers}
            </pre>
            <textarea
              id="playground-source"
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-full p-3 font-mono text-sm leading-relaxed bg-transparent text-[var(--ink)] resize-y min-h-[340px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] border-0"
              spellCheck="false"
              aria-describedby="playground-specimen"
            />
          </div>
        </div>

        {/* Decorative mapping line on desktop */}
        <div
          className="hidden lg:flex flex-col items-center justify-center px-2 text-[var(--ink3)] font-mono text-[0.625rem] select-none"
          aria-hidden="true"
        >
          <div className="w-px flex-1 bg-[var(--rule)]"></div>
          <div className="my-2 flex h-8 w-8 items-center justify-center border border-[var(--rule)] bg-[var(--paper)] text-sm">
            {"\u2192"}
          </div>
          <div className="w-px flex-1 bg-[var(--rule)]"></div>
        </div>

        {/* Specimen Pane */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink)] font-semibold">
              {t.specimen}
            </span>
          </div>

          <div
            ref={specimenRef}
            id="playground-specimen"
            role="region"
            aria-label={t.specimen}
            aria-live="polite"
            className="specimen-pane flex-1 min-h-[340px] p-4 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      {/* Toolbar under the bench, hairline-separated */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[var(--rule)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="font-mono text-xs text-[var(--ink3)] uppercase sm:mr-1 shrink-0">
            {t.samples}:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto flex-nowrap min-w-0">
            {samples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.value)}
                className="min-h-[44px] px-3 py-2 font-mono text-xs border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-4 py-2 font-mono text-xs border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 transition-colors cursor-pointer"
          >
            {t.reset}
          </button>
          <button
            type="button"
            data-copy
            onClick={handleCopy}
            className="min-h-[44px] px-4 py-2 font-mono text-xs border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--blue)] hover:border-[var(--blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 transition-colors cursor-pointer"
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="text-xs text-[var(--ink3)] font-mono">
        {t.note}
      </div>
    </div>
  );
}
