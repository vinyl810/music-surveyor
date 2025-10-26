import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-8 text-center">
      {/* 성공 아이콘 */}
      <div className="p-5 bg-green-500/30 rounded-full border border-green-400/50 mb-6">
        <CheckCircle2 className="w-16 h-16 text-green-300" strokeWidth={1.5} />
      </div>

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold text-white mb-4">
        제출이 완료되었습니다.
      </h1>

      {/* 안내문 */}
      <p className="text-gray-300 text-lg mb-12">
        설문에 참여해 주셔서 진심으로 감사합니다.
        <br />
        여러분의 소중한 의견은 연구에 큰 도움이 될 것입니다.
      </p>

      {/* 메인 페이지로 돌아가기 (선택적) */}
      <Link
        href="/"
        className="
          glass-button 
          w-full max-w-xs 
          py-3 px-6 
          text-base font-medium text-gray-200
        "
      >
        메인 페이지로 돌아가기
      </Link>
    </div>
  );
}