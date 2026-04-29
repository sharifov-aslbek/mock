import { useState } from "react";
import { Eye, Flag, ChevronRight } from "lucide-react";
import { QuestionReview } from "./QuestionReview";
import { ReportModal } from "./ReportModal";

type AnswerStatus = "correct" | "incorrect" | "omitted";

interface AnswerOption {
  letter: string;
  text: string;
}

interface QuestionRow {
  id: number;
  title: string;
  correctAnswer: string;
  yourAnswer: string;
  attemptedAnswer: string;
  complexity: "Easy" | "Medium" | "Hard";
  status: AnswerStatus;
  answerOptions?: AnswerOption[];
  videoUrl?: string;
}

const tableData: QuestionRow[] = [
  {
    id: 1,
    title: "Reading Comprehension",
    correctAnswer: "A",
    yourAnswer: "A",
    attemptedAnswer: "A",
    complexity: "Easy",
    status: "correct",
    answerOptions: [
      { letter: "A", text: "The passage suggests a positive outcome" },
      { letter: "B", text: "The author disagrees with the main point" },
      { letter: "C", text: "The evidence contradicts the conclusion" },
      { letter: "D", text: "The argument lacks sufficient support" },
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 2,
    title: "Grammar Rules",
    correctAnswer: "C",
    yourAnswer: "B",
    attemptedAnswer: "B",
    complexity: "Medium",
    status: "incorrect",
    answerOptions: [
      { letter: "A", text: "has been" },
      { letter: "B", text: "have been" },
      { letter: "C", text: "had been" },
      { letter: "D", text: "was" },
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  { id: 3,  title: "Vocabulary Context",    correctAnswer: "C", yourAnswer: "—",  attemptedAnswer: "—", complexity: "Hard",   status: "omitted",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 4,  title: "Sentence Structure",    correctAnswer: "A", yourAnswer: "—",  attemptedAnswer: "—", complexity: "Easy",   status: "omitted",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 5,  title: "Writing Analysis",      correctAnswer: "B", yourAnswer: "B",  attemptedAnswer: "B", complexity: "Medium", status: "correct",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 6,  title: "Passage Interpretation", correctAnswer: "D", yourAnswer: "C", attemptedAnswer: "C", complexity: "Hard",   status: "incorrect", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 7,  title: "Algebra Basics",        correctAnswer: "B", yourAnswer: "B",  attemptedAnswer: "B", complexity: "Easy",   status: "correct",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 8,  title: "Geometry Problem",      correctAnswer: "A", yourAnswer: "—",  attemptedAnswer: "—", complexity: "Medium", status: "omitted",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 9,  title: "Linear Equations",      correctAnswer: "C", yourAnswer: "C",  attemptedAnswer: "C", complexity: "Easy",   status: "correct",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 10, title: "Word Problems",         correctAnswer: "D", yourAnswer: "A",  attemptedAnswer: "A", complexity: "Hard",   status: "incorrect", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 11, title: "Fractions",             correctAnswer: "A", yourAnswer: "A",  attemptedAnswer: "A", complexity: "Easy",   status: "correct",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 12, title: "Data Analysis",         correctAnswer: "B", yourAnswer: "D",  attemptedAnswer: "D", complexity: "Medium", status: "incorrect", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 13, title: "Critical Reading",      correctAnswer: "C", yourAnswer: "C",  attemptedAnswer: "C", complexity: "Medium", status: "correct",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 14, title: "Essay Analysis",        correctAnswer: "D", yourAnswer: "—",  attemptedAnswer: "—", complexity: "Hard",   status: "omitted",   videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 15, title: "Statistics",            correctAnswer: "A", yourAnswer: "B",  attemptedAnswer: "B", complexity: "Hard",   status: "incorrect", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
];

const totalQuestions = tableData.length;
const correctCount   = tableData.filter((r) => r.status === "correct").length;
const incorrectCount = tableData.filter((r) => r.status === "incorrect").length;
const omittedCount   = tableData.filter((r) => r.status === "omitted").length;
const scorePercent   = Math.round((correctCount / totalQuestions) * 100);

function AnswerBadge({ status, answer }: { status: AnswerStatus; answer: string }) {
  if (status === "correct") {
    return (
      <span
        className="inline-flex items-center justify-center px-3 py-1 rounded-full"
        style={{ backgroundColor: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600 }}
      >
        {answer}
      </span>
    );
  }
  if (status === "incorrect") {
    return (
      <span
        className="inline-flex items-center justify-center px-3 py-1 rounded-full"
        style={{ backgroundColor: "#fff1f2", color: "#dc2626", fontSize: 12, fontWeight: 600 }}
      >
        {answer}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center px-3 py-1 rounded-full"
      style={{ backgroundColor: "#f5f5f5", color: "#aaa", fontSize: 12, fontStyle: "italic" }}
    >
      Omitted
    </span>
  );
}

function ComplexityBadge({ complexity }: { complexity: "Easy" | "Medium" | "Hard" }) {
  const styles = {
    Easy:   { bg: "#f0fdf4", color: "#16a34a" },
    Medium: { bg: "#fffbeb", color: "#f59e0b" },
    Hard:   { bg: "#fff1f2", color: "#dc2626" },
  }[complexity];
  return (
    <span
      className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: styles.bg, color: styles.color, fontSize: 11, fontWeight: 600 }}
    >
      {complexity}
    </span>
  );
}

function ScoreRing({ percent }: { percent: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#f0f0f0" strokeWidth="7" />
      <circle
        cx="55" cy="55" r={r}
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="7"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="55" y="51" textAnchor="middle" fill="#0a0a0a" fontSize="18" fontWeight="800" fontFamily="inherit">
        {percent}%
      </text>
      <text x="55" y="67" textAnchor="middle" fill="#aaa" fontSize="9.5" fontFamily="inherit" fontWeight="500">
        Ball
      </text>
    </svg>
  );
}

/* ─── Mobile Question Card ─────────────────────────────────────────── */
function MobileQuestionCard({
  row,
  onReview,
  onReport,
}: {
  row: QuestionRow;
  onReview: () => void;
  onReport: () => void;
}) {
  const statusDot = {
    correct:   "#16a34a",
    incorrect: "#dc2626",
    omitted:   "#d1d5db",
  }[row.status];

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #ebebeb",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Top row: number + title + status dot */}
      <div className="flex items-start gap-3 mb-3">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: "#f5f5f5", color: "#888", fontSize: 12, fontWeight: 600 }}
        >
          {row.id}
        </span>
        <div className="flex-1 min-w-0">
          <p style={{ color: "#222", fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
            {row.title}
          </p>
        </div>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
          style={{ backgroundColor: statusDot }}
        />
      </div>

      {/* Answer info row */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span style={{ color: "#bbb", fontSize: 11 }}>To'g'ri:</span>
          <span
            className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: "#f5f5f5", color: "#0a0a0a", fontSize: 11, fontWeight: 700 }}
          >
            {row.correctAnswer}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: "#bbb", fontSize: 11 }}>Sizniki:</span>
          <AnswerBadge status={row.status} answer={row.yourAnswer} />
        </div>
        <ComplexityBadge complexity={row.complexity} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #f5f5f5" }}>
        <button
          onClick={onReview}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all"
          style={{
            backgroundColor: "#0a0a0a",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            border: "none",
          }}
        >
          <Eye size={13} strokeWidth={2} />
          Ko'rib chiqish
        </button>
        <button
          onClick={onReport}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{
            backgroundColor: "#f5f5f5",
            color: "#888",
            border: "1px solid #ebebeb",
          }}
        >
          <Flag size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export function ResultsPage() {
  const [reviewingQuestionId, setReviewingQuestionId] = useState<number | null>(null);
  const [reportingQuestionId, setReportingQuestionId] = useState<number | null>(null);
  const filtered = tableData;

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f5f5f5; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <main
        className="flex-1 w-full"
        style={{
          backgroundImage: "radial-gradient(circle, #d8d8d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundColor: "#f7f7f7",
          minHeight: "100vh",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-4 sm:mb-6" style={{ fontSize: 12, color: "#bbb" }}>
            <span className="hover:text-gray-500 cursor-pointer transition-colors">Result</span>
            <ChevronRight size={12} />
            <span style={{ color: "#555" }}>Natijalar Tahlili</span>
          </div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1
                style={{
                  color: "#0a0a0a",
                  fontSize: "clamp(22px, 5vw, 30px)",
                  fontWeight: 800,
                  letterSpacing: -0.8,
                  lineHeight: 1.15,
                }}
              >
                Natijalar Tahlili
              </h1>
              <p style={{ color: "#999", fontSize: 13, marginTop: 6 }}>
                SAT Mock · 2024 · Modul 1 va 2
              </p>
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all self-start"
              style={{ backgroundColor: "#0a0a0a" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a1a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0a0a0a"; }}
              title="Sertifikatni ko'rish"
            >
              <Eye size={14} color="#fff" />
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                Sertifikatni ko'rish
              </span>
            </button>
          </div>

          {/* ── Stats Section ── */}
          {/* Mobile: vertical stack; Desktop: horizontal */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">

            {/* Score ring card */}
            <div
              className="flex flex-row sm:flex-col items-center justify-center px-6 py-5 rounded-2xl gap-4 sm:gap-0"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #ebebeb",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                minWidth: 0,
              }}
            >
              <ScoreRing percent={scorePercent} />
              <div className="sm:mt-2 text-center">
                <span style={{ color: "#aaa", fontSize: 11, fontWeight: 500, letterSpacing: 0.3 }}>
                  UMUMIY BALL
                </span>
                <p className="sm:hidden mt-1" style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 600 }}>
                  {correctCount}/{totalQuestions} savol to'g'ri
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "To'g'ri Javoblar",
                    value: correctCount,
                    color: "#16a34a",
                    subColor: "#f0fdf4",
                    icon: <span style={{ fontSize: 14 }}>✓</span>,
                    sub: `${Math.round((correctCount / totalQuestions) * 100)}% to'g'ri`,
                  },
                  {
                    label: "Noto'g'ri Javoblar",
                    value: incorrectCount,
                    color: "#dc2626",
                    subColor: "#fff1f2",
                    icon: <span style={{ fontSize: 14 }}>✕</span>,
                    sub: `${Math.round((incorrectCount / totalQuestions) * 100)}% noto'g'ri`,
                  },
                ].map(({ label, value, color, subColor, icon, sub }) => (
                  <div
                    key={label}
                    className="rounded-2xl px-4 py-4 sm:px-5 sm:py-5 flex flex-col justify-between"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ebebeb",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <span style={{ color: "#999", fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
                      <span
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: subColor, color, fontWeight: 700 }}
                      >
                        {icon}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#0a0a0a", fontSize: "clamp(26px,6vw,36px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
                        {value}
                      </span>
                      <p style={{ color: "#bbb", fontSize: 10, marginTop: 4 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar card */}
              <div
                className="rounded-2xl px-4 py-4 sm:px-5 sm:py-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #ebebeb",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ color: "#999", fontSize: 12, fontWeight: 500 }}>Jami Savollar</span>
                  <span style={{ color: "#0a0a0a", fontSize: 13, fontWeight: 700 }}>{totalQuestions} ta</span>
                </div>
                <div className="flex rounded-full overflow-hidden" style={{ height: 8, backgroundColor: "#f0f0f0" }}>
                  <div style={{ width: `${(correctCount / totalQuestions) * 100}%`, backgroundColor: "#16a34a" }} />
                  <div style={{ width: `${(incorrectCount / totalQuestions) * 100}%`, backgroundColor: "#dc2626" }} />
                  <div style={{ width: `${(omittedCount / totalQuestions) * 100}%`, backgroundColor: "#e5e7eb" }} />
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {[
                    { color: "#16a34a", label: `${correctCount} to'g'ri` },
                    { color: "#dc2626", label: `${incorrectCount} xato` },
                    { color: "#d1d5db", label: `${omittedCount} o'tkazilgan` },
                  ].map(({ color, label }) => (
                    <span key={label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color, display: "inline-block" }} />
                      <span style={{ color: "#aaa", fontSize: 11 }}>{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Detail Section ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #ebebeb",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Card header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5" style={{ borderBottom: "1px solid #f3f3f3" }}>
              <h2 style={{ color: "#0a0a0a", fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>
                Batafsil Ko'rib Chiqish
              </h2>
              <p style={{ color: "#bbb", fontSize: 12, marginTop: 2 }}>
                {filtered.length} ta savol ko'rsatilmoqda
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                    {[
                      { label: "Questions", align: "left" },
                      { label: "Title",     align: "left" },
                      { label: "Correct Answer", align: "left" },
                      { label: "Your Answer",    align: "left" },
                      { label: "Complexity",     align: "left" },
                      { label: "Actions",        align: "center" },
                    ].map(({ label, align }) => (
                      <th
                        key={label}
                        className="px-6 py-3.5"
                        style={{
                          textAlign: align as "left" | "center",
                          color: "#c0c0c0",
                          fontSize: 10.5,
                          fontWeight: 600,
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="group transition-colors"
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Question # */}
                      <td className="px-6 py-4" style={{ width: 56 }}>
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                          style={{ backgroundColor: "#f5f5f5", color: "#888", fontSize: 12, fontWeight: 600 }}
                        >
                          {row.id}
                        </span>
                      </td>
                      {/* Title */}
                      <td className="px-6 py-4">
                        <span style={{ color: "#555", fontSize: 13 }}>{row.title}</span>
                      </td>
                      {/* Correct */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center justify-center px-3 py-1 rounded-full"
                          style={{ backgroundColor: "#f5f5f5", color: "#0a0a0a", fontSize: 12, fontWeight: 600 }}
                        >
                          {row.correctAnswer}
                        </span>
                      </td>
                      {/* Your answer */}
                      <td className="px-6 py-4">
                        <AnswerBadge status={row.status} answer={row.yourAnswer} />
                      </td>
                      {/* Complexity */}
                      <td className="px-6 py-4">
                        <ComplexityBadge complexity={row.complexity} />
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => setReviewingQuestionId(row.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                            style={{
                              backgroundColor: "transparent",
                              color: "#bbb",
                              fontSize: 12,
                              border: "1px solid #ebebeb",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0a0a0a";
                              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "#0a0a0a";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                              (e.currentTarget as HTMLButtonElement).style.color = "#bbb";
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "#ebebeb";
                            }}
                          >
                            <Eye size={13} strokeWidth={1.8} />
                            <span>Review</span>
                          </button>
                          <button
                            onClick={() => setReportingQuestionId(row.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all"
                            style={{
                              backgroundColor: "transparent",
                              color: "#bbb",
                              border: "1px solid #ebebeb",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0a0a0a";
                              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "#0a0a0a";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                              (e.currentTarget as HTMLButtonElement).style.color = "#bbb";
                              (e.currentTarget as HTMLButtonElement).style.borderColor = "#ebebeb";
                            }}
                          >
                            <Flag size={13} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden flex flex-col gap-3 p-4">
              {filtered.map((row) => (
                <MobileQuestionCard
                  key={row.id}
                  row={row}
                  onReview={() => setReviewingQuestionId(row.id)}
                  onReport={() => setReportingQuestionId(row.id)}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <p style={{ color: "#ccc", fontSize: 14 }}>Ma'lumot topilmadi</p>
              </div>
            )}
          </div>
        </div>

        {/* Question Review Modal */}
        {reviewingQuestionId !== null && (
          <QuestionReview
            questionId={reviewingQuestionId}
            questionTitle={tableData.find((q) => q.id === reviewingQuestionId)?.title || ""}
            correctAnswer={tableData.find((q) => q.id === reviewingQuestionId)?.correctAnswer || ""}
            yourAnswer={tableData.find((q) => q.id === reviewingQuestionId)?.yourAnswer || ""}
            status={tableData.find((q) => q.id === reviewingQuestionId)?.status || "omitted"}
            answerOptions={tableData.find((q) => q.id === reviewingQuestionId)?.answerOptions}
            videoUrl={tableData.find((q) => q.id === reviewingQuestionId)?.videoUrl}
            onClose={() => setReviewingQuestionId(null)}
            onPrevious={() => {
              if (reviewingQuestionId > 1) setReviewingQuestionId(reviewingQuestionId - 1);
            }}
            onNext={() => {
              if (reviewingQuestionId < tableData.length) setReviewingQuestionId(reviewingQuestionId + 1);
            }}
            totalQuestions={tableData.length}
          />
        )}

        {/* Report Modal */}
        {reportingQuestionId !== null && (
          <ReportModal
            questionId={reportingQuestionId}
            onClose={() => setReportingQuestionId(null)}
          />
        )}
      </main>
    </>
  );
}
