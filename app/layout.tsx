import type { Metadata } from "next";
// 기본 글꼴을 Inter에서 Noto Sans KR로 변경하여 한글 가독성을 높입니다.
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "음악 청취 경험 설문",
  description: "음악 청취 경험에 대한 설문에 참여해 주세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.className}>
        {/* [핵심 레이아웃] PC 화면 중앙 정렬 래퍼
          - flex, items-center, justify-center: 자식 요소를 화면 정중앙에 배치
          - min-h-screen, p-4: PC 화면에서 상하좌우 여백을 줌
        */}
        <div className="flex items-center justify-center min-h-screen w-full p-0 md:p-4">
          {/* [핵심 레이아웃] 모바일 퍼스트 컨테이너
            - w-full, max-w-md-container: 모바일(sm)에서는 꽉 차고, PC(md 이상)에서는 최대 너비 416px
            - h-screen, md:h-[90vh]: 모바일에서는 화면 높이 전체, PC에서는 뷰포트의 90%
            - md:max-h-[800px]: PC에서 최대 높이 제한
            - md:rounded-2xl: PC에서 둥근 모서리
            - overflow-hidden: 내부 컨텐츠가 둥근 모서리를 넘어가지 않도록 함
            - border, bg-black/30, backdrop-blur-2xl: 'Liquid Glass' 효과 적용
          */}
          <main
            className="
              relative w-full max-w-md-container 
              h-screen md:h-[90vh] md:max-h-[800px] 
              bg-black/30 backdrop-blur-2xl 
              border border-white/10 
              shadow-2xl md:rounded-2xl 
              overflow-hidden
            "
          >
            {/* 컨텐츠 스크롤 영역
              - h-full, w-full, overflow-y-auto: 
                이 컨테이너 내부에서만 스크롤이 발생하도록 설정.
                페이지 내용이 길어져도 '유리 프레임'은 고정됩니다.
            */}
            <div className="h-full w-full overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}