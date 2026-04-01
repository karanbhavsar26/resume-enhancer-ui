"use client";

import { useState, useEffect, useRef } from "react";
import { parseJD, getScore, applyChanges, getTemplates, loadTemplate, API_BASE_URL } from "@/services/api";

type Skill = {
  name: string;
  level: "NEW" | "RELATED" | "STRONG";
};

const PAGE_SIZES = [
  { label: "A3", value: "A3" },
  { label: "A4", value: "A4" },
  { label: "Letter", value: "letter" },
  { label: "Legal", value: "legal" },
];

// ====================== TEMPLATE SELECTOR ======================
function TemplateSelector({
  setHtml,
  setParsedResume,
}: {
  setHtml: (html: string) => void;
  setParsedResume: (data: any) => void;
}) {
  const [templates, setTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getTemplates();
        setTemplates(res.templates || []);
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    };
    fetchTemplates();
  }, []);

  const handleSelect = async (name: string) => {
    try {
      setLoading(true);
      setSelected(name);
      const res = await loadTemplate(name);
      setHtml(res.html);
      setParsedResume(res.parsed);
    } catch (err) {
      console.error("Failed to load template", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">
        Choose Template
      </p>
      {templates.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-700 rounded-xl">
          <p className="text-slate-500 text-sm">No templates found</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t}
              onClick={() => handleSelect(t)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                selected === t
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {t.replace(".html", "")}
            </button>
          ))}
        </div>
      )}
      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sky-400 text-sm">
          <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent animate-spin rounded-full" />
          Loading template…
        </div>
      )}
    </div>
  );
}

// ====================== RESUME PREVIEW ======================
function ResumePreview({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState("A3");

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: Georgia, 'Times New Roman', serif; 
              color: #1a1a1a; 
              background: white; 
              padding: 32px; 
            }
            @media print {
              body { padding: 0; }
              @page { 
                margin: 20mm; 
                size: ${pageSize};
              }
            }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="flex-1 rounded-xl border border-slate-700/80 overflow-hidden flex flex-col bg-white shadow-2xl shadow-black/40 min-h-[400px]">
      {/* Browser chrome bar */}
      <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between gap-2 flex-shrink-0">
        {/* Left: traffic lights + label */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-[11px] tracking-widest font-medium text-slate-500 uppercase hidden sm:inline">
            Resume Preview
          </span>
        </div>

        {/* Center: Page size selector */}
        <div className="flex items-center gap-1">
          {PAGE_SIZES.map((ps) => (
            <button
              key={ps.value}
              onClick={() => setPageSize(ps.value)}
              title={`Set print size to ${ps.label}`}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-all duration-150 ${
                pageSize === ps.value
                  ? "bg-sky-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200"
              }`}
            >
              {ps.label}
            </button>
          ))}
        </div>

        {/* Right: Print / Download button */}
        <button
          onClick={handlePrint}
          title={`Print or Save as PDF (${pageSize})`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-slate-700 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-600 hover:border-sky-500 transition-all duration-200 group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-px"
            fill="none"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 2v7m0 0l-2.5-2.5M8 9l2.5-2.5M3 11v1.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V11"
            />
          </svg>
          <span className="hidden xs:inline">Print / PDF</span>
          <span className="xs:hidden">PDF</span>
        </button>
      </div>

      <div
        ref={contentRef}
        className="flex-1 overflow-auto p-4 sm:p-8 prose prose-sm max-w-none text-slate-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// ====================== JD INPUT ======================
function JDInput({
  jd,
  setJd,
  onAnalyze,
  loading,
}: {
  jd: string;
  setJd: (val: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}) {
  return (
    <div className="panel">
      <SectionLabel icon="📄" label="Job Description" />
      <textarea
        placeholder="Paste the full job description here…"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={6}
        className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-all font-mono leading-relaxed"
      />
      <button
        onClick={onAnalyze}
        disabled={loading}
        className="mt-4 w-full py-3 rounded-lg font-semibold text-sm tracking-wide bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white animate-spin rounded-full" />
            Analyzing…
          </>
        ) : (
          <>
            <span>Analyze Match</span>
            <span className="text-sky-200">→</span>
          </>
        )}
      </button>
    </div>
  );
}

// ====================== SCORE CARD ======================
function ScoreCard({ score, missing }: { score: number; missing: string[] }) {
  const color = score >= 80 ? "#22d3ee" : score >= 60 ? "#f59e0b" : "#f87171";
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="panel">
      <SectionLabel icon="📊" label="ATS Match Score" />
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="#1e293b" strokeWidth="7" />
            <circle
              cx="36" cy="36" r="28"
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-xl sm:text-2xl font-bold text-white leading-none">{score}</span>
            <span className="text-[10px] text-slate-500">%</span>
          </div>
        </div>

        <div>
          {score === 0 ? (
            <p className="text-slate-500 text-sm">Run analysis to see your score</p>
          ) : score >= 80 ? (
            <>
              <p className="text-emerald-400 font-semibold text-base">Strong match 🎉</p>
              <p className="text-slate-400 text-sm mt-0.5">Your resume aligns well with the JD</p>
            </>
          ) : score >= 60 ? (
            <>
              <p className="text-amber-400 font-semibold text-base">Decent match</p>
              <p className="text-slate-400 text-sm mt-0.5">A few additions could lift your score</p>
            </>
          ) : (
            <>
              <p className="text-red-400 font-semibold text-base">Needs work</p>
              <p className="text-slate-400 text-sm mt-0.5">Several key skills are missing</p>
            </>
          )}
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-700/60">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-500 mb-3">
            Missing Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ====================== SKILL SELECTOR ======================
function SkillSelector({
  skills,
  selectedSkills,
  setSelectedSkills,
}: {
  skills: string[];
  selectedSkills: Skill[];
  setSelectedSkills: (skills: Skill[]) => void;
}) {
  const getSelected = (name: string) => selectedSkills.find((s) => s.name === name);

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (checked) setSelectedSkills([...selectedSkills, { name, level: "NEW" }]);
    else setSelectedSkills(selectedSkills.filter((s) => s.name !== name));
  };

  const handleLevelChange = (name: string, level: Skill["level"]) => {
    setSelectedSkills(selectedSkills.map((s) => (s.name === name ? { ...s, level } : s)));
  };

  const levelColors: Record<Skill["level"], string> = {
    NEW: "text-slate-400 border-slate-600 bg-slate-700/60",
    RELATED: "text-sky-400 border-sky-600/50 bg-sky-900/30",
    STRONG: "text-emerald-400 border-emerald-600/50 bg-emerald-900/30",
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel icon="🛠" label="Suggested Skills" />
        {skills.length > 0 && (
          <span className="text-[11px] text-slate-500">{selectedSkills.length}/{skills.length} selected</span>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-auto pr-1 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {skills.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-8">Analyze a JD to see suggestions</p>
        ) : (
          skills.map((skillName) => {
            const sel = getSelected(skillName);
            return (
              <div key={skillName} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${sel ? "border-slate-600 bg-slate-800" : "border-slate-800 bg-slate-800/30 hover:bg-slate-800/60"}`}>
                <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                  <div
                    onClick={() => handleCheckboxChange(skillName, !sel)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${sel ? "bg-sky-500 border-sky-500" : "border-slate-600 hover:border-slate-400"}`}
                  >
                    {sel && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={`text-sm font-medium transition-colors truncate ${sel ? "text-slate-200" : "text-slate-500"}`}>{skillName}</span>
                </label>

                {sel && (
                  <select
                    value={sel.level}
                    onChange={(e) => handleLevelChange(skillName, e.target.value as Skill["level"])}
                    className={`text-xs font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer transition-all ml-2 flex-shrink-0 ${levelColors[sel.level]} bg-transparent`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="RELATED">RELATED</option>
                    <option value="STRONG">STRONG</option>
                  </select>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ====================== MCQ SELECTOR ======================
function MCQSelector({
  mcqOptions,
  setSelectedExperience,
}: {
  mcqOptions: Record<string, string[]>;
  setSelectedExperience: any;
}) {
  if (Object.keys(mcqOptions).length === 0) return null;

  return (
    <div className="panel">
      <SectionLabel icon="💡" label="Experience Options" />
      <div className="space-y-6 mt-1">
        {Object.entries(mcqOptions).map(([skill, options]) => (
          <div key={skill}>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">{skill}</p>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={skill}
                    onChange={() => setSelectedExperience((prev: any) => ({ ...prev, [skill]: opt }))}
                    className="mt-0.5 accent-sky-500 flex-shrink-0"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================== SECTION LABEL ======================
function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-base leading-none">{icon}</span>
      <h2 className="text-sm font-semibold text-slate-200 tracking-wide">{label}</h2>
    </div>
  );
}

// ====================== STEP INDICATOR ======================
function StepBadge({ step, label, active }: { step: number; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${active ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"}`}>
        {step}
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:inline">{label}</span>
    </div>
  );
}

// ====================== MOBILE TAB NAV ======================
function MobileTabs({ activeTab, setActiveTab }: { activeTab: "preview" | "controls"; setActiveTab: (t: "preview" | "controls") => void }) {
  return (
    <div className="flex lg:hidden border-b border-slate-800 bg-slate-900">
      <button
        onClick={() => setActiveTab("preview")}
        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${activeTab === "preview" ? "text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:text-slate-300"}`}
      >
        📄 Preview
      </button>
      <button
        onClick={() => setActiveTab("controls")}
        className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors ${activeTab === "controls" ? "text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:text-slate-300"}`}
      >
        ⚙️ Optimizer
      </button>
    </div>
  );
}

// ====================== MAIN HOME PAGE ======================
export default function Home() {
  const [html, setHtml] = useState(
    `<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:300px;color:#94a3b8;font-size:0.875rem;font-family:monospace;letter-spacing:0.05em">SELECT A TEMPLATE TO PREVIEW</div>`
  );
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [jd, setJd] = useState("");
  const [parsedJD, setParsedJD] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [mcqOptions, setMcqOptions] = useState<Record<string, string[]>>({});
  const [selectedExperience, setSelectedExperience] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [generatingExp, setGeneratingExp] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "controls">("preview");

  const step2Active = score > 0;
  const step3Active = mcqOptions && Object.keys(mcqOptions).length > 0;

  const handleAnalyze = async () => {
    if (!parsedResume) return alert("Please select a resume template first");
    setAnalyzing(true);
    try {
      const jdData = await parseJD(jd);
      setParsedJD(jdData);
      const scoreData = await getScore(parsedResume, jdData);
      setScore(scoreData.score);
      setSkills(scoreData.missing_skills || []);
      setActiveTab("controls");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateExperience = async () => {
    const skillsToSend = selectedSkills.filter((s) => s.level !== "NEW");
    if (skillsToSend.length === 0) return alert("Select at least one RELATED or STRONG skill");
    setGeneratingExp(true);
    try {
      const res = await fetch(`${API_BASE_URL}/resume/generate-experience`, {
        method: "POST",
        body: JSON.stringify({ skills: selectedSkills, parsed: parsedResume }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setMcqOptions(data.options_by_skill || {});
    } finally {
      setGeneratingExp(false);
    }
  };

  const refreshAnalysis = async () => {
    if (!parsedResume || !jd) return;
    let jdData = parsedJD;
    if (!jdData) {
      jdData = await parseJD(jd);
      setParsedJD(jdData);
    }
    try {
      const scoreData = await getScore(parsedResume, jdData);
      setScore(scoreData.score);
      setSkills(scoreData.missing_skills || []);
    } catch (err) {
      console.error("Failed to refresh score", err);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const expUpdates = Object.entries(selectedExperience)
        .filter(([_, val]) => val !== "Do not add this experience")
        .map(([skill, bullet]) => ({ skill, bullet }));

      const res = await applyChanges({
        html,
        skills: selectedSkills,
        experience_updates: expUpdates,
      });
      console.log("res.parsed", res.parsed);
      setHtml(res.html);
      setParsedResume(res.parsed);
      setSelectedSkills([]);
      setMcqOptions({});
      setSelectedExperience({});
      await refreshAnalysis();
      setActiveTab("preview");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 w-full" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Top bar */}
      <header className="border-b border-slate-800 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-500 flex items-center justify-center text-sm flex-shrink-0">✦</div>
          <span className="font-semibold text-slate-100 tracking-tight text-sm sm:text-base">ResumeIQ</span>
          <span className="text-slate-600 text-xs sm:text-sm hidden xs:inline">/ ATS Optimizer</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <StepBadge step={1} label="Load & Analyze" active={true} />
          <div className="w-4 sm:w-8 h-px bg-slate-700" />
          <StepBadge step={2} label="Select Skills" active={step2Active} />
          <div className="w-4 sm:w-8 h-px bg-slate-700" />
          <StepBadge step={3} label="Apply" active={step3Active} />
        </div>
      </header>

      {/* Mobile tab navigation */}
      <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-57px)]">
        {/* LEFT: Resume preview */}
        <div
          className={`
            lg:w-[48%] flex flex-col p-4 sm:p-6 gap-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/30
            ${activeTab === "preview" ? "flex" : "hidden lg:flex"}
            lg:overflow-hidden
          `}
        >
          <TemplateSelector setHtml={setHtml} setParsedResume={setParsedResume} />
          <ResumePreview html={html} />
        </div>

        {/* RIGHT: Controls */}
        <div
          className={`
            lg:w-[52%] overflow-auto p-4 sm:p-6 space-y-4
            ${activeTab === "controls" ? "block" : "hidden lg:block"}
          `}
        >
          <JDInput jd={jd} setJd={setJd} onAnalyze={handleAnalyze} loading={analyzing} />

          {score > 0 && <ScoreCard score={score} missing={skills} />}

          {skills.length > 0 && (
            <SkillSelector
              skills={skills}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
            />
          )}

          {selectedSkills.length > 0 && (
            <button
              onClick={handleGenerateExperience}
              disabled={generatingExp}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generatingExp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white animate-spin rounded-full" />
                  Generating options…
                </>
              ) : (
                <>✨ Generate Experience Options</>
              )}
            </button>
          )}

          <MCQSelector mcqOptions={mcqOptions} setSelectedExperience={setSelectedExperience} />

          {(selectedSkills.length > 0 || Object.keys(selectedExperience).length > 0) && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full py-3.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {applying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white animate-spin rounded-full" />
                  Applying changes…
                </>
              ) : (
                <>✅ Apply Changes to Resume</>
              )}
            </button>
          )}

          {/* Bottom padding for mobile scroll breathing room */}
          <div className="h-4 lg:h-0" />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .panel {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(51, 65, 85, 0.7);
          border-radius: 12px;
          padding: 16px;
          backdrop-filter: blur(8px);
        }
        @media (min-width: 640px) {
          .panel { padding: 20px; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-track-slate-800::-webkit-scrollbar-track { background: #1e293b; border-radius: 99px; }
        .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb { background: #475569; border-radius: 99px; }
        select option { background: #1e293b; color: #e2e8f0; }
        @media (min-width: 480px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
        }
      `}</style>
    </div>
  );
}