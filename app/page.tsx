import Link from "next/link";
import { Music } from "lucide-react"; // 아이콘 추가

export default function HomePage() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-8 text-center">
      {/* 메인 아이콘 */}
      <div className="p-5 bg-white/10 rounded-full border border-white/20 mb-6">
        <Music className="w-16 h-16 text-white" strokeWidth={1} />
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold text-white mb-4">
        음악 청취 경험 설문
      </h1>

      {/* 안내문 */}
      <p className="text-gray-300 text-lg mb-12">
        안녕하세요.
        <br />
        본 설문은 음악 청취 경험에 대한 연구를 위해 제작되었습니다.
        <br />
        잠시 시간을 내어 참여해 주시면 감사하겠습니다.
      </p>

      {/* 동의 페이지 이동 버튼 */}
      <Link
        href="/consent"
        className="
          glass-button 
          w-full max-w-xs 
          py-4 px-6 
          text-lg font-bold text-white
          flex items-center justify-center
        "
      >
        설문 시작하기
      </Link>
    </div>
  );
}