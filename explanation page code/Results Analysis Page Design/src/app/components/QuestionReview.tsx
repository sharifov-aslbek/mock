import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface AnswerOption {
  letter: string;
  text: string;
}

interface QuestionReviewProps {
  questionId: number;
  questionTitle: string;
  correctAnswer: string;
  yourAnswer: string;
  status: "correct" | "incorrect" | "omitted";
  answerOptions?: AnswerOption[];
  videoUrl?: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  totalQuestions: number;
}

export function QuestionReview({
  questionId,
  questionTitle,
  correctAnswer,
  yourAnswer,
  status,
  answerOptions,
  videoUrl,
  onClose,
  onPrevious,
  onNext,
  totalQuestions,
}: QuestionReviewProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<"question" | "answer">("question");

  return (
    <>
      <style>{`
        .qr-scrollbar::-webkit-scrollbar { width: 5px; }
        .qr-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .qr-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .qr-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="relative w-full sm:max-w-5xl sm:mx-4 flex flex-col"
          style={{
            backgroundColor: "#ffffff",
            maxHeight: "92vh",
            borderRadius: "20px 20px 0 0",
            overflow: "hidden",
          }}
          // On tablet/desktop it's centred with rounded corners all round
          // We'll override for sm+ in inline style below via a class trick
          onClick={(e) => e.stopPropagation()}
        >
          {/* Override border-radius on non-mobile via a wrapper tweak */}
          <style>{`
            @media (min-width: 640px) {
              .qr-modal-inner { border-radius: 20px !important; }
            }
          `}</style>

          {/* ── HEADER ── */}
          <div
            className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 shrink-0"
            style={{ borderBottom: "1px solid #ebebeb" }}
          >
            {/* Left: title */}
            <div className="flex-1 min-w-0 pr-4">
              <p style={{ color: "#aaa", fontSize: 11, fontWeight: 500, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                SAT Amaliyot · 17 Aprel, 2026
              </p>
              <h2
                className="truncate"
                style={{ color: "#0a0a0a", fontSize: "clamp(14px, 4vw, 18px)", fontWeight: 700, letterSpacing: -0.3 }}
              >
                Savol {questionId} — {questionTitle}
              </h2>
            </div>

            {/* Right: counter + close */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="hidden sm:inline-flex items-center px-3 py-1 rounded-full"
                style={{ backgroundColor: "#f5f5f5", color: "#888", fontSize: 12, fontWeight: 500 }}
              >
                {questionId} / {totalQuestions}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ backgroundColor: "#f5f5f5", color: "#888" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0a0a0a";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f5f5f5";
                  (e.currentTarget as HTMLButtonElement).style.color = "#888";
                }}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── MOBILE TABS ── */}
          <div
            className="flex sm:hidden shrink-0 px-4 pt-3"
            style={{ gap: 8 }}
          >
            {(["question", "answer"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-xl transition-all"
                style={{
                  backgroundColor: activeTab === tab ? "#0a0a0a" : "#f5f5f5",
                  color: activeTab === tab ? "#fff" : "#888",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                }}
              >
                {tab === "question" ? "Savol" : "Javob"}
              </button>
            ))}
          </div>

          {/* ── CONTENT ── */}
          <div className="flex-1 overflow-hidden">
            {/* Desktop: side by side */}
            <div className="hidden sm:grid grid-cols-2 h-full" style={{ height: "calc(92vh - 140px)" }}>
              {/* Left: Question */}
              <div
                className="px-8 py-6 overflow-y-auto qr-scrollbar"
                style={{ backgroundColor: "#ffffff", borderRight: "1px solid #ebebeb" }}
              >
                <QuestionPanel questionId={questionId} />
              </div>
              {/* Right: Answer */}
              <div
                className="px-8 py-6 overflow-y-auto qr-scrollbar"
                style={{ backgroundColor: "#fafafa" }}
              >
                <AnswerPanel
                  answerOptions={answerOptions}
                  correctAnswer={correctAnswer}
                  yourAnswer={yourAnswer}
                  status={status}
                  videoUrl={videoUrl}
                  showAnswer={showAnswer}
                />
              </div>
            </div>

            {/* Mobile: tabs */}
            <div className="sm:hidden overflow-y-auto qr-scrollbar" style={{ height: "calc(92vh - 175px)" }}>
              {activeTab === "question" ? (
                <div className="px-4 py-5">
                  <QuestionPanel questionId={questionId} />
                </div>
              ) : (
                <div className="px-4 py-5" style={{ backgroundColor: "#fafafa" }}>
                  <AnswerPanel
                    answerOptions={answerOptions}
                    correctAnswer={correctAnswer}
                    yourAnswer={yourAnswer}
                    status={status}
                    videoUrl={videoUrl}
                    showAnswer={showAnswer}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-8 py-4 shrink-0"
            style={{ borderTop: "1px solid #ebebeb", backgroundColor: "#ffffff" }}
          >
            {/* Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={showAnswer}
                  onChange={(e) => {
                    setShowAnswer(e.target.checked);
                    if (e.target.checked) setActiveTab("answer");
                  }}
                  className="w-5 h-5 cursor-pointer"
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    border: `2px solid ${showAnswer ? "#4F46E5" : "#d1d5db"}`,
                    borderRadius: "4px",
                    backgroundColor: showAnswer ? "#EEF2FF" : "#ffffff",
                    outline: "none",
                  }}
                />
                {showAnswer && (
                  <svg
                    width="20" height="20" viewBox="0 0 20 20"
                    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                  >
                    <path
                      d="M5 10 L8 13 L15 6"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span style={{ color: "#555", fontSize: 13 }}>
                To'g'ri javobni ko'rsatish
              </span>
            </label>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              {/* Mobile counter */}
              <span
                className="sm:hidden mr-auto"
                style={{ color: "#aaa", fontSize: 12, fontWeight: 500 }}
              >
                {questionId}/{totalQuestions}
              </span>

              <button
                onClick={onPrevious}
                disabled={questionId === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all"
                style={{
                  backgroundColor: questionId === 1 ? "#f0f0f0" : "#0a0a0a",
                  color: questionId === 1 ? "#bbb" : "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: questionId === 1 ? "not-allowed" : "pointer",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <ChevronLeft size={15} />
                <span>Oldingi</span>
              </button>

              <button
                onClick={onNext}
                disabled={questionId === totalQuestions}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all"
                style={{
                  backgroundColor: questionId === totalQuestions ? "#f0f0f0" : "#4F46E5",
                  color: questionId === totalQuestions ? "#bbb" : "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: questionId === totalQuestions ? "not-allowed" : "pointer",
                  flex: 1,
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  if (questionId !== totalQuestions) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4338CA";
                  }
                }}
                onMouseLeave={(e) => {
                  if (questionId !== totalQuestions) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4F46E5";
                  }
                }}
              >
                <span>Keyingi</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Question Panel ─────────────────────────────────────────────── */
function QuestionPanel({ questionId }: { questionId: number }) {
  return (
    <div>
      <h3 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
        Matematika: Savol {questionId}
      </h3>
      <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
        Rasmda f(x) = 2/x, y₁ = 0, y₂ = 2, x₁ = 0 va x₂ = 2 funksiyani grafiklari tasvirlangan.
      </p>

      <div
        className="rounded-xl p-4 sm:p-6 flex items-center justify-center"
        style={{ backgroundColor: "#fafafa", border: "1px solid #ebebeb" }}
      >
        <svg width="100%" viewBox="0 0 500 380" style={{ maxWidth: 460 }}>
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="500" height="380" fill="url(#grid2)" />
          <line x1="50" y1="190" x2="450" y2="190" stroke="#0a0a0a" strokeWidth="2" />
          <line x1="250" y1="40" x2="250" y2="340" stroke="#0a0a0a" strokeWidth="2" />
          <text x="458" y="195" fontSize="18" fontStyle="italic" fill="#0a0a0a">x</text>
          <text x="255" y="36" fontSize="18" fontStyle="italic" fill="#0a0a0a">y</text>
          <path d="M 250 95 L 350 95 L 350 145 Q 340 150 330 155 Q 320 160 310 167 Q 300 173 290 179 Q 270 186 260 190 L 250 190 Z"
                fill="#d1d5db" opacity="0.5" />
          <path d="M 260 184 Q 270 175 280 166 Q 290 157 300 150 Q 310 143 320 137 Q 330 132 340 128 Q 350 124 360 121 Q 380 116 410 112"
                stroke="#0a0a0a" strokeWidth="2.5" fill="none" />
          <line x1="100" y1="95" x2="450" y2="95" stroke="#0a0a0a" strokeWidth="2" />
          <text x="78" y="90" fontSize="16" fill="#0a0a0a">y₂=2</text>
          <line x1="350" y1="70" x2="350" y2="290" stroke="#0a0a0a" strokeWidth="2" />
          <text x="356" y="308" fontSize="16" fill="#0a0a0a">x₂=2</text>
          <text x="370" y="138" fontSize="15" fill="#0a0a0a">f(x)=2/x</text>
        </svg>
      </div>

      <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginTop: 20 }}>
        Bo'yalgan sohaning yuzini toping.
      </p>
    </div>
  );
}

/* ─── Answer Panel ───────────────────────────────────────────────── */
function AnswerPanel({
  answerOptions,
  correctAnswer,
  yourAnswer,
  status,
  videoUrl,
  showAnswer,
}: {
  answerOptions?: { letter: string; text: string }[];
  correctAnswer: string;
  yourAnswer: string;
  status: "correct" | "incorrect" | "omitted";
  videoUrl?: string;
  showAnswer: boolean;
}) {
  return (
    <div>
      <h3 style={{ color: "#0a0a0a", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
        Javob variantlari
      </h3>

      {/* Answer options */}
      {answerOptions && answerOptions.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          {answerOptions.map((option) => {
            const isCorrect = option.letter === correctAnswer;
            const isYours   = option.letter === yourAnswer && yourAnswer !== "—";
            const highlight = showAnswer && isCorrect;
            const wrongPick = showAnswer && isYours && !isCorrect;

            return (
              <div
                key={option.letter}
                className="px-4 py-3 rounded-xl mb-2"
                style={{
                  backgroundColor: highlight ? "#f0fdf4" : wrongPick ? "#fff1f2" : "#ffffff",
                  border: highlight
                    ? "2px solid #16a34a"
                    : wrongPick
                    ? "2px solid #dc2626"
                    : "1px solid #e5e7eb",
                  color: "#0a0a0a",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <span style={{ fontWeight: 700 }}>{option.letter}.</span>{" "}
                {option.text}
                {showAnswer && isCorrect && (
                  <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600, marginLeft: 8 }}>✓ To'g'ri</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <span style={{ color: "#888", fontSize: 13 }}>Sizning javobingiz:</span>
          <div style={{ marginTop: 8 }}>
            {status === "omitted" ? (
              <span style={{ color: "#aaa", fontSize: 14, fontStyle: "italic" }}>— (O'tkazilgan)</span>
            ) : (
              <span style={{ color: "#0a0a0a", fontSize: 18, fontWeight: 700 }}>{yourAnswer}</span>
            )}
          </div>
        </div>
      )}

      {/* Feedback + explanation (visible when showAnswer) */}
      {showAnswer && (
        <>
          <div
            className="px-4 py-3 rounded-xl mb-5"
            style={{
              backgroundColor: status === "correct" ? "#f0fdf4" : "#fff1f2",
              color: status === "correct" ? "#16a34a" : "#dc2626",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {status === "correct"
              ? `✓ To'g'ri! Javob: ${correctAnswer}`
              : status === "omitted"
              ? `Siz bu savolni o'tkazib yubordingiz. To'g'ri javob: ${correctAnswer}`
              : `✕ Noto'g'ri. To'g'ri javob: ${correctAnswer}`}
          </div>

          <div>
            <h4 style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
              Tushuntirish
            </h4>
            {[
              "To'g'ri javob: 2 - ln(2)",
              "Bo'yalgan soha to'g'ri to'rtburchak va egri chiziq ostidagi soha orasidagi farqdir.",
              "To'g'ri to'rtburchakning yuzi: 2 × 2 = 4",
              "f(x) = 2/x funksiyasi ostidagi yuza: ∫₁² (2/x)dx = 2ln(2)",
              "Bo'yalgan yuza = 4 − 2ln(2) ≈ 1.61",
            ].map((text, i) => (
              <p key={i} style={{ color: "#555", fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
                {text}
              </p>
            ))}

            {videoUrl && (
              <div style={{ marginTop: 20 }}>
                <h4 style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  Video Tushuntirish
                </h4>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: "#000", border: "1px solid #e5e7eb" }}
                >
                  <video controls style={{ width: "100%", height: "auto", display: "block" }}>
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
