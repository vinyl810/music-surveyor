"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- 1. 데이터 타입 정의 ---
type QuestionType = "likert" | "text";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // likert 스케일용 (예: "매우 그렇지 않다", ...)
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
  // musicId를 키로 사용
  [musicId: number]: {
    // questionId를 키로 사용
    [questionId: string]: string | number;
  };
};

// --- 2. Mock Data ---
const surveyMusic: Track[] = [
  {
    id: 1,
    title: "Sunset Voyage",
    artist: "Synthwave Dreams",
    coverUrl: "/images/cover1.jpg",
    audioUrl: "/audio/music1.mp3",
    questions: [
      {
        id: "q1_1",
        text: "이 음악은 '편안한' 느낌을 주나요?",
        type: "likert",
        options: ["1 (전혀)", "2", "3", "4", "5 (매우)"],
      },
      {
        id: "q1_2",
        text: "이 음악에서 어떤 이미지가 연상되나요?",
        type: "text",
      },
    ],
  },
  {
    id: 2,
    title: "Urban Pulse",
    artist: "Groove Masters",
    coverUrl: "/images/cover2.jpg",
    audioUrl: "/audio/music2.mp3",
    questions: [
      {
        id: "q2_1",
        text: "이 음악은 '경쾌한' 느낌을 주나요?",
        type: "likert",
        options: ["1 (전혀)", "2", "3", "4", "5 (매우)"],
      },
      {
        id: "q2_2",
        text: "이 음악이 어울리는 장소는 어디인가요?",
        type: "text",
      },
    ],
  },
  {
    id: 3,
    title: "Lost in Echoes",
    artist: "Ambient Fields",
    coverUrl: "/images/cover3.jpg",
    audioUrl: "/audio/music3.mp3",
    questions: [
      {
        id: "q3_1",
        text: "이 음악은 '신비로운' 느낌을 주나요?",
        type: "likert",
        options: ["1 (전혀)", "2", "3", "4", "5 (매우)"],
      },
      {
        id: "q3_2",
        text: "이 음악을 들을 때 어떤 감정이 드나요?",
        type: "text",
      },
    ],
  },
];

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

  // --- 5. 파생 상태 (Derived State) ---
  const currentTrack = surveyMusic[currentTrackIndex];
  const totalTracks = surveyMusic.length;
  const isFirstTrack = currentTrackIndex === 0;
  const isLastTrack = currentTrackIndex === totalTracks - 1;
  const currentResponses = surveyResponses[currentTrack.id] || {};

  // --- 6. 오디오 제어 로직 (useEffect) ---
  // 트랙이 변경될 때 오디오 소스를 업데이트
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load(); // 새 소스 로드

      // 상태 초기화
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      // 메타데이터가 로드되면 duration 설정
      const setAudioData = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      audioRef.current.addEventListener("loadedmetadata", setAudioData);
      return () => {
        audioRef.current?.removeEventListener("loadedmetadata", setAudioData);
      };
    }
  }, [currentTrackIndex, currentTrack.audioUrl]);

  // --- 7. 이벤트 핸들러 ---

  // 오디오 재생/일시정지
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 오디오 시간 업데이트
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // 오디오 재생 완료 시 (요구사항: 0초로 돌아가고 일시정지)
  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // 프로그레스 바(슬라이더) 탐색
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 오디오 플레이어 시간 포맷팅 유틸
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // 공통: 트랙 변경 시 오디오 정지
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // 다음 트랙 이동
  const handleNextTrack = () => {
    stopAudio();
    if (isLastTrack) {
      handleSubmitSurvey(); // 마지막 트랙이면 제출 로직 실행
    } else {
      setCurrentTrackIndex((prev) => prev + 1);
    }
  };

  // 이전 트랙 이동
  const handlePrevTrack = () => {
    if (!isFirstTrack) {
      stopAudio();
      setCurrentTrackIndex((prev) => prev - 1);
    }
  };

  // 설문 모달 열기
  const handleOpenModal = () => setIsModalOpen(true);
  // 설문 모달 닫기
  const handleCloseModal = () => setIsModalOpen(false);

  // 설문 응답 저장
  const handleResponseChange = (questionId: string, value: string | number) => {
    setSurveyResponses((prevResponses) => ({
      ...prevResponses,
      [currentTrack.id]: {
        ...prevResponses[currentTrack.id],
        [questionId]: value,
      },
    }));
  };

  // --- 8. 최종 제출 로직 ---
  const handleSubmitSurvey = async () => {
    const confirmSubmit = window.confirm(
      "설문을 제출하시겠습니까?\n제출 후에는 수정할 수 없습니다."
    );

    if (!confirmSubmit) {
      return; // '아니오' 선택 시
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyResponses),
      });

      if (response.ok) {
        // 성공 시
        router.push("/thank-you"); // '감사합니다' 페이지로 이동
      } else {
        // 실패 시
        alert("오류: 설문 제출에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("네트워크 오류: 설문 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 9. 렌더링 (JSX) ---
  return (
    <div className="flex flex-col h-full w-full">
      {/* A. 전체 진행도 표시줄 (최상단) */}
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
            style={{
              width: `${((currentTrackIndex + 1) / totalTracks) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 오디오 태그 (실제 제어용, 숨김 처리) */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() =>
          setDuration(audioRef.current?.duration || 0)
        }
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* B. 음악 플레이어 (중앙, 스크롤 영역) */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-6 overflow-y-auto">
        {/* 앨범 커버 */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 glass-card shadow-2xl overflow-hidden">
          <Image
            src={currentTrack.coverUrl}
            alt={`${currentTrack.title} 앨범 커버`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* 트랙 정보 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            {currentTrack.title}
          </h2>
          <p className="text-lg text-gray-300">{currentTrack.artist}</p>
        </div>

        {/* 재생 프로그레스 바 (Slider) */}
        <div className="w-full max-w-xs space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
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
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      {/* C. '이 음악 평가하기' 버튼 (하단) */}
      <div className="flex-shrink-0 p-4 border-t border-glass-border">
        <button
          onClick={handleOpenModal}
          className="glass-button w-full py-4 text-lg font-bold"
        >
          이 음악 평가하기
        </button>
      </div>

      {/* D. 좌/우 내비게이션 버튼 (절대 위치) */}
      <button
        onClick={handlePrevTrack}
        disabled={isFirstTrack}
        className="
          absolute left-2 top-1/2 -translate-y-1/2 
          p-2 glass-button rounded-full 
          disabled:opacity-30 disabled:cursor-not-allowed
        "
        aria-label="이전 음악"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      <button
        onClick={handleNextTrack}
        disabled={isSubmitting} // 제출 중 비활성화
        className="
          absolute right-2 top-1/2 -translate-y-1/2 
          p-2 glass-button rounded-full
          disabled:opacity-30 disabled:cursor-not-allowed
        "
        aria-label={isLastTrack ? "설문 제출" : "다음 음악"}
      >
        {isSubmitting ? (
          <Loader2 className="w-7 h-7 animate-spin" />
        ) : (
          <ChevronRight className="w-7 h-7" />
        )}
      </button>

      {/* E. 설문 모달 (Bottom Sheet) */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* 오버레이 (배경) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* 모달 컨텐츠 */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="
                fixed bottom-0 left-0 right-0 z-50
                w-full max-w-md-container mx-auto 
                h-[85vh] md:h-[calc(90vh-4rem)] md:max-h-[calc(800px-4rem)]
                glass-card rounded-t-2xl border-b-0
                flex flex-col
              "
            >
              {/* 모달 헤더 */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-glass-border">
                <h3 className="text-lg font-bold text-white">
                  '{currentTrack.title}' 평가하기
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="glass-button rounded-full p-2"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 모달 컨텐츠 (스크롤 영역) */}
              <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                {currentTrack.questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-base font-semibold text-gray-200 mb-3">
                      {q.text}
                    </label>
                    {/* 리커트 척도 렌더링 */}
                    {q.type === "likert" && q.options && (
                      <div className="flex flex-wrap gap-2 justify-between">
                        {q.options.map((option, index) => (
                          <label
                            key={index}
                            className="
                              flex flex-col items-center justify-center
                              w-12 h-12 p-2 
                              border border-glass-border rounded-lg 
                              cursor-pointer transition-all duration-200
                              hover:bg-white/20
                            "
                            style={{
                              backgroundColor:
                                currentResponses[q.id] === index + 1
                                  ? "rgba(59, 130, 246, 0.7)" // blue-500
                                  : "rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            <span className="text-sm font-bold">
                              {option.split(" ")[0]}
                            </span>
                            <input
                              type="radio"
                              name={q.id}
                              value={index + 1}
                              checked={currentResponses[q.id] === index + 1}
                              onChange={(e) =>
                                handleResponseChange(q.id, Number(e.target.value))
                              }
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                    {/* 주관식 입력 렌더링 */}
                    {q.type === "text" && (
                      <textarea
                        rows={4}
                        value={currentResponses[q.id] || ""}
                        onChange={(e) =>
                          handleResponseChange(q.id, e.target.value)
                        }
                        className="
                          w-full p-3 
                          bg-white/10 border border-glass-border rounded-lg 
                          text-white placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                        "
                        placeholder="자유롭게 입력해 주세요..."
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* 모달 푸터 */}
              <div className="flex-shrink-0 p-4 border-t border-glass-border">
                <button
                  onClick={handleCloseModal}
                  className="glass-button w-full py-3 font-bold bg-blue-600/50 hover:bg-blue-500/50"
                >
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