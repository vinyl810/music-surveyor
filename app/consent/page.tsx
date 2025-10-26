"use client"; // 이 페이지는 상태(체크박스)를 관리해야 하므로 클라이언트 컴포넌트입니다.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // App Router에서는 next/navigation을 사용합니다.
import { Check, Info } from "lucide-react";

export default function ConsentPage() {
  const [isAgreed, setIsAgreed] = useState(false);
  const router = useRouter();

  const handleStartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAgreed) {
      e.preventDefault(); // 동의하지 않았으면 클릭 이벤트를 막습니다.
      alert("안내 사항을 읽고 동의해 주세요.");
    } else {
      router.push("/survey"); // 동의했으면 설문 페이지로 이동합니다.
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="flex-shrink-0 pt-4 pb-6 border-b border-glass-border">
        <h1 className="text-2xl font-bold text-white text-center">
          <Info className="inline-block w-7 h-7 mr-2" />
          안내 및 동의 사항
        </h1>
      </div>

      {/* 안내 사항 텍스트 영역 (내용이 길어질 경우 스크롤) */}
      <div className="flex-grow py-6 space-y-4 text-gray-300 overflow-y-auto">
        <p className="font-bold text-white">
          설문에 참여하시기 전, 다음 사항을 주의 깊게 읽어주세요.
        </p>
        <ul className="list-disc list-inside space-y-3 pl-2">
          <li>
            본 설문은 약 10분 정도 소요될 예정입니다.
          </li>
          <li>
            설문 중에는 여러 개의 음악 클립을 청취하게 됩니다. 원활한 진행을
            위해 <span className="font-bold text-white">헤드폰 또는 이어폰</span>
            을 사용해 주시기를 강력히 권장합니다.
          </li>
          <li>
            각 음악을 충분히 들으신 후, 제시되는 문항에 솔직하게 응답해 주세요.
          </li>
          <li>
            수집된 모든 데이터는 익명으로 처리되며, 연구 목적 이외에는
            절대 사용되지 않습니다.
          </li>
          <li>
            설문 도중 언제든지 중단하실 수 있으나, 가급적 모든 문항에
            응답해 주시기를 부탁드립니다.
          </li>
          <li>
            제출된 데이터는 서버의 파일 시스템에 IP 주소를 기반으로 저장됩니다.
          </li>
        </ul>
        <p className="pt-4">
          여러분의 소중한 참여가 연구에 큰 도움이 됩니다. 감사합니다.
        </p>
      </div>

      {/* 동의 및 네비게이션 영역 (하단 고정) */}
      <div className="flex-shrink-0 pt-6 border-t border-glass-border space-y-4">
        <label
          htmlFor="consent-checkbox"
          className="
            flex items-center p-4 rounded-lg 
            transition-colors duration-200 cursor-pointer
            bg-white/5 hover:bg-white/10
          "
        >
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="
              hidden 
              peer
            "
          />
          {/* 커스텀 체크박스 UI */}
          <div
            className="
              flex items-center justify-center w-6 h-6 mr-3 
              border-2 border-white/50 rounded 
              peer-checked:bg-blue-500 peer-checked:border-blue-500 
              transition-colors duration-200
            "
          >
            {isAgreed && <Check className="w-4 h-4 text-white" />}
          </div>
          <span className="text-gray-200 select-none">
            안내 사항을 모두 읽고 이에 동의합니다.
          </span>
        </label>

        {/* '설문 시작하기' 버튼.
          isAgreed가 false일 때 'disabled' 속성이 적용됩니다.
          globals.css의 .glass-button 스타일(@apply ... disabled:opacity-50)에 의해
          자동으로 비활성화 스타일이 적용됩니다.
        */}
        <button
          onClick={handleStartClick}
          disabled={!isAgreed}
          className="
            glass-button 
            w-full py-4 px-6 
            text-lg font-bold text-white
          "
        >
          설문 시작하기
        </button>
      </div>
    </div>
  );
}