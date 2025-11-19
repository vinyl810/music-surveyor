"use client";

import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "likert" | "text";
  options?: string[];
}

interface Track {
  id: number;
  title: string;
  questions: Question[];
}

interface SurveyPanelProps {
  currentTrack: Track;
  currentTrackIndex: number;
  totalTracks: number;
  currentResponses: { [questionId: string]: string | number };
  isFirstTrack: boolean;
  isLastTrack: boolean;
  isAllComplete: boolean;
  isSubmitting: boolean;
  onResponseChange: (questionId: string, value: string | number) => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
}

export default function SurveyPanel({
  currentTrack,
  currentTrackIndex,
  totalTracks,
  currentResponses,
  isFirstTrack,
  isLastTrack,
  isAllComplete,
  isSubmitting,
  onResponseChange,
  onPrevTrack,
  onNextTrack,
}: SurveyPanelProps) {
  return (
    <div className="flex flex-col h-full w-full relative px-12 lg:px-16">
      {/* Progress Bar */}
      <div className="flex-shrink-0 w-full p-6 bg-black/20 backdrop-blur-sm border-b border-white/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">진행도</span>
          <span className="text-sm font-bold text-white">
            {currentTrackIndex + 1} / {totalTracks}
          </span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentTrackIndex + 1) / totalTracks) * 100}%` }}
          />
        </div>
      </div>

      {/* Survey Questions */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">설문 응답</h2>

        {currentTrack.questions.map((q) => (
          <div key={q.id} className="space-y-3">
            <label className="block text-base font-semibold text-gray-200">
              {q.text}
            </label>

            {q.type === "likert" && q.options && (
              <div className="flex flex-wrap gap-2 justify-between">
                {q.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex flex-col items-center justify-center w-12 h-12 p-2 border border-white/30 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/20"
                    style={{
                      backgroundColor:
                        currentResponses[q.id] === index + 1
                          ? "rgba(59, 130, 246, 0.7)"
                          : "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <span className="text-sm font-bold text-white">{option}</span>
                    <input
                      type="radio"
                      name={q.id}
                      value={index + 1}
                      checked={currentResponses[q.id] === index + 1}
                      onChange={(e) => onResponseChange(q.id, Number(e.target.value))}
                      className="hidden"
                    />
                  </label>
                ))}
              </div>
            )}

            {q.type === "text" && (
              <textarea
                rows={4}
                value={currentResponses[q.id] || ""}
                onChange={(e) => onResponseChange(q.id, e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="자유롭게 입력해 주세요..."
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={onPrevTrack}
          disabled={isFirstTrack}
          className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          aria-label="이전 음악"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      </div>

      <div className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={onNextTrack}
          disabled={isSubmitting || (isLastTrack && !isAllComplete)}
          className={`
            flex items-center gap-2 backdrop-blur-sm border border-white/20 rounded-full font-bold
            transition-all duration-200 shadow-lg
            ${
              isLastTrack
                ? `px-5 py-3 ${
                    isAllComplete
                      ? "bg-green-600/90 hover:bg-green-500 text-white"
                      : "bg-gray-500/60 text-white"
                  }`
                : "p-3 bg-white/10 hover:bg-white/20"
            }
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
          aria-label={isLastTrack ? (isAllComplete ? "설문 제출" : "미완료 설문 존재") : "다음 음악"}
          title={
            isLastTrack && !isAllComplete
              ? "모든 음악 설문을 완료해야 제출할 수 있습니다."
              : undefined
          }
        >
          {isSubmitting ? (
            <Loader2 className={isLastTrack ? "w-5 h-5 animate-spin" : "w-8 h-8 animate-spin"} />
          ) : isLastTrack ? (
            <>
              <span className="text-base leading-none">{isAllComplete ? "제출하기" : "미완료"}</span>
              <Check className="w-5 h-5" />
            </>
          ) : (
            <ChevronRight className="w-8 h-8 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
