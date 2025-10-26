"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Pause, ChevronLeft, ChevronRight, X, Loader2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// JSON 목데이터 분리본 import (경로는 프로젝트 구조에 맞게 조정)
import surveyMusicJson from "@/data/surveyMusic.json";

// --- 1. 데이터 타입 정의 ---
type QuestionType = "likert" | "text";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface Track {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  questions: Question[];
}

type SurveyResponses = {
  [musicId: number]: {
    [questionId: string]: string | number;
  };
};

// --- 2. JSON을 타입 캐스팅하여 사용 ---
const surveyMusic = surveyMusicJson as Track[];

// --- 3. Survey 페이지 컴포넌트 ---
export default function SurveyPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- 4. 상태 관리 (useState) ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponses>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 5. 파생 상태 ---
  const currentTrack = surveyMusic[currentTrackIndex];
  const totalTracks = surveyMusic.length;
  const isFirstTrack = currentTrackIndex === 0;
  const isLastTrack = currentTrackIndex === totalTracks - 1;
  const currentResponses = surveyResponses[currentTrack.id] || {};

  // ✅ 유효성: 트랙별 완료 여부
  const isTrackComplete = (track: Track): boolean => {
    const resp = surveyResponses[track.id] || {};
    return track.questions.every((q) => {
      const v = resp[q.id];
      if (q.type === "likert") {
        return typeof v === "number" && Number.isFinite(v);
      }
      if (q.type === "text") {
        return typeof v === "string" && v.trim().length > 0;
      }
      return false;
    });
  };

  // ✅ 유효성: 전체 완료 여부
  const isAllComplete = surveyMusic.every((t) => isTrackComplete(t));

  // --- 5.5 첫 커버 사전 프리로드 ---
  useEffect(() => {
    const img = new window.Image();
    img.src = surveyMusic[0].coverUrl;
  }, []);

  // --- 6. 오디오 제어 로직 ---
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrackIndex]);

  // --- 7. 이벤트 핸들러 ---
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secondsTotal: number) => {
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = Math.floor(secondsTotal % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const stopAudio = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleNextTrack = () => {
    stopAudio();
    if (isLastTrack) {
      // ✅ 마지막 단계: 전체 완료 검사
      if (!isAllComplete) {
        const firstIncompleteIndex = surveyMusic.findIndex((t) => !isTrackComplete(t));
        alert("모든 음악에 대한 설문을 완료해야 제출할 수 있습니다.\n미완료 트랙으로 이동합니다.");
        if (firstIncompleteIndex !== -1) {
          setCurrentTrackIndex(firstIncompleteIndex);
          setIsModalOpen(true); // 미완료 트랙의 설문 모달 자동 열기
        }
        return;
      }
      handleSubmitSurvey();
    } else {
      setCurrentTrackIndex((prev) => prev + 1);
    }
  };

  const handlePrevTrack = () => {
    if (!isFirstTrack) {
      stopAudio();
      setCurrentTrackIndex((prev) => prev - 1);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleResponseChange = (questionId: string, value: string | number) => {
    setSurveyResponses((prev) => ({
      ...prev,
      [currentTrack.id]: {
        ...prev[currentTrack.id],
        [questionId]: value,
      },
    }));
  };

  // --- 8. 최종 제출 로직 ---
  const handleSubmitSurvey = async () => {
    const confirmSubmit = window.confirm("설문을 제출하시겠습니까?\n제출 후에는 수정할 수 없습니다.");
    if (!confirmSubmit) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyResponses),
      });

      if (res.ok) {
        router.push("/thank-you");
      } else {
        alert("오류: 설문 제출에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("네트워크 오류: 설문 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 9. 렌더링 (JSX) ---
  return (
    <div className="flex flex-col h-full w-full">
      {/* A. 전체 진행도 표시줄 */}
      <div className="flex-shrink-0 w-full p-4 pt-6 bg-black/20 backdrop-blur-sm border-b border-glass-border">
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

      {/* 오디오 태그 */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleAudioEnded}
        className="hidden"
        preload="metadata"
      />

      {/* B. 음악 플레이어 */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-6 overflow-y-auto">
        {/* 앨범 커버 */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 glass-card shadow-2xl overflow-hidden">
          <Image
            key={currentTrack.id}
            src={currentTrack.coverUrl}
            alt={`${currentTrack.title} 앨범 커버`}
            fill
            sizes="(max-width: 768px) 256px, (max-width: 1200px) 288px, 288px"
            priority={currentTrackIndex === 0}
            loading={currentTrackIndex === 0 ? "eager" : "lazy"}
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* 트랙 정보 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{currentTrack.title}</h2>
          <p className="text-lg text-gray-300">{currentTrack.artist}</p>
        </div>

        {/* 재생 프로그레스 바 */}
        <div className="w-full max-w-xs space-y-1">
          <input
            type="range"
            min={0}
            max={Number.isFinite(duration) ? duration : 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer range-sm accent-blue-500"
            disabled={!duration}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 재생/일시정지 버튼 */}
        <button
          onClick={handlePlayPause}
          className="glass-button rounded-full p-5"
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
        </button>
      </div>

      {/* C. '이 음악 평가하기' 버튼 */}
      <div className="flex-shrink-0 p-4 border-t border-glass-border">
        <button onClick={handleOpenModal} className="glass-button w-full py-4 text-lg font-bold">
          이 음악 평가하기
        </button>
      </div>

      {/* D. 좌/우 내비게이션 버튼 */}
      <button
        onClick={handlePrevTrack}
        disabled={isFirstTrack}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 glass-button rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="이전 음악"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      {/* ✅ 마지막 설문에서는 '제출하기'로 명확히 보이도록 + 미완료면 비활성화 */}
      <button
        onClick={handleNextTrack}
        disabled={isSubmitting || (isLastTrack && !isAllComplete)}
        className={`
          absolute right-2 top-1/2 -translate-y-1/2 
          flex items-center gap-2 rounded-full font-bold
          transition-all duration-200
          ${isLastTrack 
            ? `px-5 py-2.5 ${isAllComplete ? "bg-green-600/90 hover:bg-green-500 text-white shadow-lg" : "bg-gray-500/60 text-white"}`
            : "p-2 glass-button"
          }
          disabled:opacity-30 disabled:cursor-not-allowed
        `}
        aria-label={isLastTrack ? (isAllComplete ? "설문 제출" : "미완료 설문 존재") : "다음 음악"}
        title={isLastTrack && !isAllComplete ? "모든 음악 설문을 완료해야 제출할 수 있습니다." : undefined}
      >
        {isSubmitting ? (
          <Loader2 className={isLastTrack ? "w-5 h-5 animate-spin" : "w-7 h-7 animate-spin"} />
        ) : isLastTrack ? (
          <>
            <span className="text-base leading-none">{isAllComplete ? "제출하기" : "미완료"}</span>
            <Check className="w-5 h-5" />
          </>
        ) : (
          <ChevronRight className="w-7 h-7" />
        )}
      </button>

      {/* E. 설문 모달 */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-md-container mx-auto h-[85vh] md:h-[calc(90vh-4rem)] md:max-h-[calc(800px-4rem)] glass-card rounded-t-2xl border-b-0 flex flex-col"
            >
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-glass-border">
                <h3 className="text-lg font-bold text-white">'{currentTrack.title}' 평가하기</h3>
                <button onClick={handleCloseModal} className="glass-button rounded-full p-2" aria-label="닫기">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                {currentTrack.questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-base font-semibold text-gray-200 mb-3">{q.text}</label>

                    {q.type === "likert" && q.options && (
                      <div className="flex flex-wrap gap-2 justify-between">
                        {q.options.map((option, index) => (
                          <label
                            key={index}
                            className="flex flex-col items-center justify-center w-12 h-12 p-2 border border-glass-border rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/20"
                            style={{
                              backgroundColor:
                                currentResponses[q.id] === index + 1
                                  ? "rgba(59, 130, 246, 0.7)"
                                  : "rgba(255, 255, 255, 0.05)"
                            }}
                          >
                            <span className="text-sm font-bold">{option.split(" ")[0]}</span>
                            <input
                              type="radio"
                              name={q.id}
                              value={index + 1}
                              checked={currentResponses[q.id] === index + 1}
                              onChange={(e) => handleResponseChange(q.id, Number(e.target.value))}
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
                        onChange={(e) => handleResponseChange(q.id, e.target.value)}
                        className="w-full p-3 bg-white/10 border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="자유롭게 입력해 주세요..."
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0 p-4 border-t border-glass-border">
                <button onClick={handleCloseModal} className="glass-button w-full py-3 font-bold bg-blue-600/50 hover:bg-blue-500/50">
                  저장 후 닫기
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
