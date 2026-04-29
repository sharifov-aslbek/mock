import { useState } from "react";
import { X, Upload, CheckCircle } from "lucide-react";

interface ReportModalProps {
  questionId: number;
  onClose: () => void;
}

export function ReportModal({ questionId, onClose }: ReportModalProps) {
  const [comment, setComment] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = () => {
    if (!comment.trim()) return;
    setSubmitted(true);
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg sm:mx-4"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px 20px 0 0",
          padding: "28px 20px 32px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @media (min-width: 640px) {
            .rm-sheet { border-radius: 20px !important; }
          }
        `}</style>

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center mb-5">
          <div style={{ width: 36, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2 }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all"
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

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#f0fdf4" }}
            >
              <CheckCircle size={28} color="#16a34a" />
            </div>
            <h2 style={{ color: "#0a0a0a", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Xabar yuborildi!
            </h2>
            <p style={{ color: "#aaa", fontSize: 14 }}>
              Muammoingiz ko'rib chiqiladi.
            </p>
          </div>
        ) : (
          <>
            {/* Title */}
            <h2 style={{ color: "#0a0a0a", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              Muammo haqida xabar bering
            </h2>
            <p style={{ color: "#aaa", fontSize: 13, marginBottom: 24 }}>
              Modul 1 — Savol {questionId}
            </p>

            {/* Comment */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ color: "#555", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}
              >
                Izoh
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Muammoni tasvirlab bering..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: 14,
                  color: "#0a0a0a",
                  backgroundColor: "#ffffff",
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#0a0a0a";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLTextAreaElement).style.borderColor = "#e5e7eb";
                }}
              />
            </div>

            {/* File upload */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="rm-file-upload"
                className="flex flex-col items-center justify-center px-5 py-6 rounded-xl cursor-pointer transition-all"
                style={{
                  border: fileName ? "2px dashed #0a0a0a" : "2px dashed #d1d5db",
                  backgroundColor: "#fafafa",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.borderColor = "#9ca3af";
                  (e.currentTarget as HTMLLabelElement).style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.borderColor = fileName ? "#0a0a0a" : "#d1d5db";
                  (e.currentTarget as HTMLLabelElement).style.backgroundColor = "#fafafa";
                }}
              >
                <Upload size={18} color={fileName ? "#0a0a0a" : "#9ca3af"} style={{ marginBottom: 6 }} />
                <span style={{ color: fileName ? "#0a0a0a" : "#9ca3af", fontSize: 13, fontWeight: fileName ? 600 : 400 }}>
                  {fileName || "Fayl yuklash uchun bosing"}
                </span>
                {!fileName && (
                  <span style={{ color: "#d1d5db", fontSize: 11, marginTop: 3 }}>PNG, JPG, PDF</span>
                )}
              </label>
              <input
                id="rm-file-upload"
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!comment.trim()}
              className="w-full py-3 rounded-full transition-all"
              style={{
                backgroundColor: comment.trim() ? "#0a0a0a" : "#f0f0f0",
                color: comment.trim() ? "#ffffff" : "#bbb",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: comment.trim() ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (comment.trim()) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
                }
              }}
              onMouseLeave={(e) => {
                if (comment.trim()) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0a0a0a";
                }
              }}
            >
              Yuborish
            </button>
          </>
        )}
      </div>
    </div>
  );
}
