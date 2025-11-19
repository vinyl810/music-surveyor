"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MusicPlayer from "@/app/components/MusicPlayer";
import SurveyPanel from "@/app/components/SurveyPanel";
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
  musicEmotion?: string;
  albumEmotion?: string;
  matchType?: string;
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

  // --- 4. 상태 관리 (useState) ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponses>({});
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
      if (q.type === "likert") return typeof v === "number" && Number.isFinite(v);
      if (q.type === "text") return typeof v === "string" && v.trim().length > 0;
      return false;
    });
  };

  // ✅ 유효성: 전체 완료 여부
  const isAllComplete = surveyMusic.every((t) => isTrackComplete(t));

  // --- 6. 오디오 제어 로직 ---
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrackIndex]);

  // --- 7. 이벤트 핸들러 ---
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    // currentTime will be updated via onSeek in MusicPlayer
  };

  const handleLoadedMetadata = (dur: number) => {
    setDuration(dur);
  };

  const handleAudioEnded = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const stopAudio = () => {
    setIsPlaying(false);
  };

  const handleNextTrack = () => {
    stopAudio();
    if (isLastTrack) {
      if (!isAllComplete) {
        const firstIncompleteIndex = surveyMusic.findIndex((t) => !isTrackComplete(t));
        alert("모든 음악에 대한 설문을 완료해야 제출할 수 있습니다.\n미완료 트랙으로 이동합니다.");
        if (firstIncompleteIndex !== -1) {
          setCurrentTrackIndex(firstIncompleteIndex);
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
    <div className="flex flex-col lg:flex-row w-full min-h-screen lg:h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Left Side (Desktop) / Top (Mobile): Music Player */}
      <div className="flex-shrink-0 flex items-center justify-center p-4 lg:p-8 lg:w-[45%] lg:max-w-[600px] lg:h-screen">
        <MusicPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          onSeek={handleSeek}
        />
      </div>

      {/* Right Side (Desktop) / Bottom (Mobile): Survey Panel */}
      <div className="flex-grow flex items-stretch min-h-[600px] lg:h-screen lg:overflow-hidden">
        <SurveyPanel
          currentTrack={currentTrack}
          currentTrackIndex={currentTrackIndex}
          totalTracks={totalTracks}
          currentResponses={currentResponses}
          isFirstTrack={isFirstTrack}
          isLastTrack={isLastTrack}
          isAllComplete={isAllComplete}
          isSubmitting={isSubmitting}
          onResponseChange={handleResponseChange}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
        />
      </div>
    </div>
  );
}
