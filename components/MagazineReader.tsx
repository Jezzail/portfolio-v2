"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { MagazineIssue } from "@/types";

const PDFDocument = dynamic(
  () =>
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      return { default: mod.Document };
    }),
  { ssr: false },
);

const PDFPage = dynamic(
  () => import("react-pdf").then((mod) => ({ default: mod.Page })),
  { ssr: false },
);

type MagazineReaderProps = {
  issues: MagazineIssue[];
  initialIssueIndex?: number;
  onClose: () => void;
};

export function MagazineReader({
  issues,
  initialIssueIndex = 0,
  onClose,
}: MagazineReaderProps) {
  const t = useTranslations("items.magazine");
  const [activeIssue, setActiveIssue] = useState(initialIssueIndex);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAspect, setPageAspect] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const issue = issues[activeIssue];
  const totalPages = issue.pages;

  // Measure the viewport area (the space between header and footer)
  useEffect(() => {
    if (!viewportRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportWidth(entry.contentRect.width);
        setViewportHeight(entry.contentRect.height);
      }
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleIssueChange = useCallback((index: number) => {
    setActiveIssue(index);
    setCurrentPage(1);
    setLoadError(false);
    setPageLoading(true);
    setPageAspect(null);
  }, []);

  const handlePageLoadSuccess = useCallback(
    (page: { originalWidth: number; originalHeight: number }) => {
      setPageAspect(page.originalWidth / page.originalHeight);
      setPageLoading(false);
    },
    [],
  );

  const handleDocumentLoadError = useCallback(() => {
    setLoadError(true);
    setPageLoading(false);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
    setPageLoading(true);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
    setPageLoading(true);
  }, [totalPages]);

  // Compute width so the full page fits within the viewport ("contain" logic)
  const computePageWidth = () => {
    if (viewportWidth <= 0 || viewportHeight <= 0) return undefined;
    // Use known aspect ratio if available, otherwise assume portrait A4
    const aspect = pageAspect ?? 0.707;
    // Width if we fill viewport width
    const widthByW = viewportWidth;
    const heightByW = widthByW / aspect;
    // If that height overflows, constrain by height instead
    if (heightByW > viewportHeight) {
      return viewportHeight * aspect;
    }
    return widthByW;
  };

  return (
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center bg-background/90"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal container: 90% of screen */}
      <div className="flex h-[90vh] w-[90vw] flex-col border-2 border-border bg-surface">
        {/* Header: issue tabs + close button */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border p-3">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label={t("issueSelectorLabel")}
          >
            {issues.map((iss, idx) => (
              <button
                key={iss.issue}
                type="button"
                role="tab"
                aria-selected={idx === activeIssue}
                onClick={() => handleIssueChange(idx)}
                className={`border-2 px-3 py-2 text-xs tracking-wide transition-colors ${
                  idx === activeIssue
                    ? "border-border-active text-accent-gold"
                    : "border-border text-text-muted hover:border-border-active"
                }`}
              >
                {t(iss.labelKey)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="border-2 border-border px-3 py-2 text-xs text-text-muted tracking-wide hover:border-border-active hover:text-accent-gold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* PDF viewport — fills remaining space */}
        <div
          ref={viewportRef}
          className="flex-1 flex items-center justify-center overflow-hidden"
        >
          {loadError ? (
            <div className="flex flex-col items-center gap-3 p-6">
              <p className="text-text-muted text-xs sm:text-sm tracking-wide">
                {t("loadError")}
              </p>
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-border px-3 py-2 text-xs text-accent-gold tracking-wide hover:border-border-active transition-colors"
              >
                {t("downloadFallback")}
              </a>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              {pageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <p className="text-text-muted text-xs sm:text-sm tracking-wide animate-blink">
                    {t("loading")}
                  </p>
                </div>
              )}
              {viewportWidth > 0 && (
                <PDFDocument
                  key={issue.url}
                  file={issue.url}
                  onLoadError={handleDocumentLoadError}
                  loading={null}
                >
                  <PDFPage
                    pageNumber={currentPage}
                    width={computePageWidth()}
                    onLoadSuccess={handlePageLoadSuccess}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    loading={null}
                  />
                </PDFDocument>
              )}
            </div>
          )}
        </div>

        {/* Footer: navigation + download */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-border p-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className={`border-2 border-border px-3 py-2 text-xs tracking-wide transition-colors ${
                currentPage <= 1
                  ? "opacity-50 text-text-dim cursor-default"
                  : "text-text-muted hover:border-border-active"
              }`}
            >
              {t("prev")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className={`border-2 border-border px-3 py-2 text-xs tracking-wide transition-colors ${
                currentPage >= totalPages
                  ? "opacity-50 text-text-dim cursor-default"
                  : "text-text-muted hover:border-border-active"
              }`}
            >
              {t("next")}
            </button>
          </div>

          <span className="text-accent-gold text-xs tracking-wide">
            {t("page")} {currentPage} {t("of")} {totalPages}
          </span>

          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-border px-3 py-2 text-xs text-accent-gold tracking-wide hover:border-border-active transition-colors"
          >
            {t("download")}
          </a>
        </div>
      </div>
    </div>
  );
}
