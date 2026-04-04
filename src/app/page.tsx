"use client";

import { useState, useCallback } from "react";
import {
  DEMO_REVIEWS,
  processReview,
  DEFAULT_BRAND,
  type StarRating,
  type BrandSettings,
  type ProcessedResult,
} from "@/lib/demo-data";

// ─── Icons ───────────────────────────────────────────────────────────
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3a2.25 2.25 0 0 0-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active ? "bg-accent text-white" : "text-muted hover:text-foreground hover:bg-accent-muted"}`}>
      {children}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [text]);
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-card-border/40 hover:bg-card-border text-muted hover:text-foreground transition-all">
      {copied ? <><CheckIcon className="w-3.5 h-3.5 text-success" /> Copied</> : <><ClipboardIcon className="w-3.5 h-3.5" /> Copy</>}
    </button>
  );
}

function Stars({ rating, onChange, interactive }: { rating: StarRating; onChange?: (r: StarRating) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => interactive && onChange?.(n as StarRating)}
          className={`text-lg ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} ${n <= rating ? "text-yellow-400" : "text-card-border"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const c: Record<string, string> = {
    low: "bg-success-muted text-success",
    medium: "bg-warning-muted text-warning",
    high: "bg-danger-muted text-danger",
    critical: "bg-danger text-white",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${c[urgency] ?? c.medium}`}>
      {urgency === "critical" ? "🚨 " : ""}{urgency}
    </span>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const c: Record<string, string> = {
    positive: "bg-success-muted text-success",
    mixed: "bg-warning-muted text-warning",
    negative: "bg-danger-muted text-danger",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c[sentiment] ?? c.mixed}`}>
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}

function ProtocolFlag({ flag }: { flag: string }) {
  const isDanger = /critical|threat|safety|legal/i.test(flag);
  const isWarning = /high|competitor|staff/i.test(flag);
  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${isDanger ? "bg-danger-muted text-danger" : isWarning ? "bg-warning-muted text-warning" : "bg-accent-muted text-accent"}`}>
      <span className="mt-0.5">{isDanger ? "🚨" : isWarning ? "⚠️" : "ℹ️"}</span>
      <span>{flag}</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function Home() {
  const [review, setReview] = useState("");
  const [stars, setStars] = useState<StarRating>(5);
  const [reviewerName, setReviewerName] = useState("");
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"response" | "analysis" | "internal">("response");
  const [showSettings, setShowSettings] = useState(false);

  const handleProcess = useCallback(() => {
    if (!review.trim()) return;
    setProcessing(true);
    setResult(null);
    setTimeout(() => {
      setResult(processReview(review, stars, reviewerName || "Customer", brand));
      setProcessing(false);
      setActiveTab("response");
    }, 1400);
  }, [review, stars, reviewerName, brand]);

  const loadDemo = useCallback((d: typeof DEMO_REVIEWS[0]) => {
    setReview(d.review);
    setStars(d.stars);
    setReviewerName(d.reviewer);
    setResult(null);
  }, []);

  return (
    <div className="min-h-full">
      {/* ─── Header ────────────────────────────────────────── */}
      <header className="border-b border-card-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Review Responder</h1>
              <p className="text-xs text-muted">Your reputation bodyguard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-muted hover:text-foreground bg-card-border/30 hover:bg-card-border/50 px-3 py-1.5 rounded-full transition-all"
            >
              {showSettings ? "Hide" : "Brand"} Settings
            </button>
            <span className="text-xs text-muted bg-card-border/30 px-3 py-1.5 rounded-full">Demo</span>
          </div>
        </div>
      </header>

      {/* ─── Brand Settings Drawer ─────────────────────────── */}
      {showSettings && (
        <div className="border-b border-card-border bg-card">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Brand Voice Settings</h3>
            <div className="grid sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Business Name</label>
                <input
                  type="text" value={brand.business_name}
                  onChange={(e) => setBrand({ ...brand, business_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-card-border text-sm focus:outline-none focus:border-accent/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Owner / Manager Name</label>
                <input
                  type="text" value={brand.owner_name}
                  onChange={(e) => setBrand({ ...brand, owner_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-card-border text-sm focus:outline-none focus:border-accent/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Tone</label>
                <select
                  value={brand.tone}
                  onChange={(e) => setBrand({ ...brand, tone: e.target.value as BrandSettings["tone"] })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-card-border text-sm focus:outline-none focus:border-accent/50"
                >
                  <option value="warm">Warm & Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Industry</label>
                <select
                  value={brand.industry}
                  onChange={(e) => setBrand({ ...brand, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-card-border text-sm focus:outline-none focus:border-accent/50"
                >
                  <option value="hospitality">Hospitality / Restaurant</option>
                  <option value="trades">Trades / Services</option>
                  <option value="retail">Retail / Shop</option>
                  <option value="salon">Salon / Beauty</option>
                  <option value="professional">Professional Services</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-card-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent/15 text-accent text-xs font-medium mb-6">
            <ShieldIcon className="w-3.5 h-3.5" />
            Reputation Management
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Every review answered.
            <br />
            <span className="text-accent">No more 9pm dread.</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto text-base sm:text-lg">
            Paste any Google review. Get a brand-aligned response in seconds —
            warm thank-yous for 5-stars, professional de-escalation for 1-stars.
            Your reputation, protected.
          </p>
        </div>
      </section>

      {/* ─── Main App ──────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* ─── Left: Input ──────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Google Review
              </h3>
              <Stars rating={stars} onChange={setStars} interactive />
            </div>

            {/* Reviewer name */}
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Reviewer name (e.g. Sarah M.)"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/40 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />

            <textarea
              value={review}
              onChange={(e) => { setReview(e.target.value); setResult(null); }}
              placeholder="Paste the review text here..."
              className="w-full h-40 sm:h-48 p-4 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/40 resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all text-sm leading-relaxed"
            />

            {/* Demo buttons */}
            <div className="space-y-2">
              <p className="text-xs text-muted font-medium">Try a demo:</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_REVIEWS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => loadDemo(d)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-card-border text-sm hover:border-accent/40 hover:bg-accent-muted transition-all"
                  >
                    <span>{d.icon}</span>
                    <span className="text-muted">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Process button */}
            <button
              onClick={handleProcess}
              disabled={!review.trim() || processing}
              className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Analysing...</>
              ) : (
                <><ShieldIcon className="w-4 h-4" /> Generate Response</>
              )}
            </button>

            {/* How it works */}
            <div className="rounded-xl bg-card border border-card-border p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">De-escalation Protocol</h4>
              <div className="space-y-2 text-sm text-muted">
                {[
                  ["1.", "Analyse sentiment, urgency, and emotional tone"],
                  ["2.", "Detect threats, competitor mentions, staff callouts"],
                  ["3.", "Apply response strategy (praise / address / de-escalate)"],
                  ["4.", "Draft brand-aligned reply — never defensive, never generic"],
                  ["5.", "Generate internal action items for your team"],
                ].map(([n, text]) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <span className="text-accent font-bold mt-0.5">{n}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right: Output ─────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Output</h3>
              {result && <div className={`w-2 h-2 rounded-full animate-pulse ${result.analysis.urgency === "critical" || result.analysis.urgency === "high" ? "bg-danger" : "bg-success"}`} />}
            </div>

            <div className="flex gap-1 p-1 bg-card rounded-xl border border-card-border">
              <Tab active={activeTab === "response"} onClick={() => setActiveTab("response")}>Public Reply</Tab>
              <Tab active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")}>Analysis</Tab>
              <Tab active={activeTab === "internal"} onClick={() => setActiveTab("internal")}>Internal Notes</Tab>
            </div>

            <div className="rounded-xl bg-card border border-card-border min-h-[440px] overflow-hidden">
              {processing ? (
                <div className="flex items-center justify-center gap-2 py-20">
                  <ShieldIcon className="w-6 h-6 text-accent shield-pulse" />
                  <span className="text-muted text-sm">Analysing review...</span>
                </div>
              ) : !result ? (
                <div className="flex flex-col items-center justify-center h-[440px] text-muted text-sm">
                  <ShieldIcon className="w-10 h-10 mb-3 opacity-20" />
                  <p>Paste a review, set the stars, hit &quot;Generate Response&quot;</p>
                  <p className="text-xs mt-1">or try one of the demos</p>
                </div>
              ) : (
                <div className="p-4 sm:p-5">
                  {/* ─── Response Tab ────────────────────── */}
                  {activeTab === "response" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Ready to Post</h4>
                          <Stars rating={result.analysis.stars} />
                        </div>
                        <CopyButton text={result.response_draft} />
                      </div>

                      {/* Protocol flags */}
                      {result.protocol_flags.length > 0 && (
                        <div className="space-y-1.5">
                          {result.protocol_flags.map((f, i) => (
                            <ProtocolFlag key={i} flag={f} />
                          ))}
                        </div>
                      )}

                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 bg-background rounded-lg p-4 font-sans max-h-[400px] overflow-y-auto">
                        {result.response_draft}
                      </pre>
                    </div>
                  )}

                  {/* ─── Analysis Tab ────────────────────── */}
                  {activeTab === "analysis" && (
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        <SentimentBadge sentiment={result.analysis.sentiment} />
                        <UrgencyBadge urgency={result.analysis.urgency} />
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-muted text-purple">
                          Tone: {result.analysis.emotional_tone}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Key Praise</h4>
                        <div className="space-y-1">
                          {result.analysis.key_praise.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 bg-success-muted rounded-lg px-3 py-2 text-sm text-success">
                              <span>+</span><span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Key Complaints</h4>
                        <div className="space-y-1">
                          {result.analysis.key_complaints.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 bg-danger-muted rounded-lg px-3 py-2 text-sm text-danger">
                              <span>-</span><span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Response Strategy</h4>
                        <div className="bg-accent-muted rounded-lg px-3 py-3 text-sm text-accent">
                          {result.analysis.response_strategy}
                        </div>
                      </div>

                      {result.analysis.mentions_staff.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Staff Mentioned</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.analysis.mentions_staff.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-muted text-purple">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Internal Notes Tab ──────────────── */}
                  {activeTab === "internal" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-danger">
                          Internal Only — Do Not Post
                        </h4>
                        <CopyButton text={result.internal_notes} />
                      </div>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 bg-background rounded-lg p-4 font-mono max-h-[400px] overflow-y-auto">
                        {result.internal_notes}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Features Grid ──────────────────────────────── */}
        <div className="mt-16 grid sm:grid-cols-3 gap-4">
          {[
            { title: "Never Generic", desc: "Every response references specific details from the review. No copy-paste vibes.", n: "1" },
            { title: "De-escalation Built In", desc: "1-star protocol: empathise, don't admit liability, take offline. Protects your brand.", n: "2" },
            { title: "Internal Action Items", desc: "Flags food safety issues, staff mentions, competitor references, and legal threats for your team.", n: "3" },
          ].map((f) => (
            <div key={f.title} className="rounded-xl bg-card border border-card-border p-5 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center text-sm font-bold">{f.n}</span>
              <h4 className="font-semibold text-sm">{f.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-card-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-muted">
          <span>Review Responder — Proof of Concept</span>
          <span>Customise for your business</span>
        </div>
      </footer>
    </div>
  );
}
