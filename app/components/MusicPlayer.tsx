"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause } from "lucide-react";

interface Track {
  id: number;
  title: string;
  artist: string;
  coverUrl: string | null;
  audioUrl: string;
}

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: (duration: number) => void;
  onEnded: () => void;
  onSeek: (time: number) => void;
}

export default function MusicPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onSeek,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Play error:", err);
            // Retry once after a short delay
            setTimeout(() => {
              if (audioRef.current && isPlaying) {
                audioRef.current.play().catch(e => console.error("Retry play error:", e));
              }
            }, 100);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    // Reset audio when track changes
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.load();

      // If it was playing before, restart playback after load
      if (wasPlaying && isPlaying) {
        // Wait for loadedmetadata event before attempting to play
        const handleCanPlay = () => {
          if (audioRef.current && isPlaying) {
            audioRef.current.play().catch(err => console.error("Auto-play after load error:", err));
          }
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  }, [track.audioUrl, isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      onSeek(newTime);
    }
  };

  const formatTime = (secondsTotal: number) => {
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = Math.floor(secondsTotal % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-[350px] lg:max-w-[350px]" style={{ maxHeight: "75vh" }}>
      <div className="relative w-full" style={{ aspectRatio: "490 / 1008" }}>
        {/* Phone Model Background */}
        <Image
          src="/phone_model.png"
          alt="Music Player"
          fill
          sizes="(max-width: 1024px) 350px, 450px"
          className="object-contain"
        />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          onSeek(audio.currentTime);
        }}
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          onLoadedMetadata(audio.duration || 0);
        }}
        onEnded={onEnded}
        preload="metadata"
      />

      {/* Album Cover Overlay */}
      <div
        className="absolute overflow-hidden rounded-lg bg-gray-800"
        style={{
          top: "12.2%",
          left: "9.8%",
          width: "80.4%",
          height: "39.1%",
        }}
      >
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={`${track.title} cover`}
            fill
            sizes="(max-width: 1024px) 280px, 320px"
            className="object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🎵</div>
              <div className="text-xs">No Album Art</div>
            </div>
          </div>
        )}
      </div>

      {/* Track Title Overlay */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: "55.8%",
          left: "11.8%",
          width: "53.5%",
          height: "2.5%",
        }}
      >
        <p className="text-white text-sm lg:text-base font-semibold truncate">{track.title}</p>
      </div>

      {/* Artist Name Overlay */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: "58.5%",
          left: "11.8%",
          width: "29%",
          height: "2.2%",
        }}
      >
        <p className="text-gray-300 text-xs lg:text-sm truncate">{track.artist}</p>
      </div>

      {/* Progress Bar Overlay */}
      <div
        className="absolute"
        style={{
          top: "64.3%",
          left: "11.8%",
          width: "76.3%",
          height: "0.8%",
        }}
      >
        {/* Progress Bar Background */}
        <div className="w-full h-full bg-white/30 rounded-full relative overflow-hidden">
          {/* Progress Bar Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-white transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Invisible Range Input for Seek */}
          <input
            type="range"
            min={0}
            max={Number.isFinite(duration) ? duration : 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent cursor-pointer opacity-0"
            disabled={!duration}
          />
        </div>
      </div>

      {/* Current Time (Left) */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: "66.5%",
          left: "11.8%",
          width: "8.6%",
          height: "2%",
        }}
      >
        <p className="text-gray-400 text-xs">{formatTime(currentTime)}</p>
      </div>

      {/* Total Duration (Right) */}
      <div
        className="absolute overflow-hidden text-right"
        style={{
          top: "66.5%",
          right: "11.8%",
          width: "8.6%",
          height: "2%",
        }}
      >
        <p className="text-gray-400 text-xs">{formatTime(duration)}</p>
      </div>

      {/* Play/Pause Button Overlay */}
      <button
        onClick={onPlayPause}
        className="absolute flex items-center justify-center"
        style={{
          top: "72.6%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "12%",
          height: "6%",
        }}
        aria-label={isPlaying ? "일시정지" : "재생"}
      >
        {isPlaying ? (
          <Pause className="w-full h-full text-white" fill="white" />
        ) : (
          <Play className="w-full h-full text-white" fill="white" />
        )}
      </button>
      </div>
    </div>
  );
}
