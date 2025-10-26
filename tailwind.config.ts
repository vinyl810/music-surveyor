import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 'Liquid Glass' 디자인을 위한 배경 및 테두리 색상 확장
      colors: {
        "glass-border": "rgba(255, 255, 255, 0.1)",
        "glass-bg": "rgba(0, 0, 0, 0.3)", // 어두운 유리 질감
        "glass-bg-light": "rgba(255, 255, 255, 0.05)", // 살짝 밝은 유리 질감
      },
      // 설문 모달(Bottom Sheet) 애니메이션
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
      },
      // PC 중앙 정렬 레이아웃을 위한 max-width
      maxWidth: {
        "md-container": "26rem", // 416px. 모바일 화면에 적합한 너비 (max-w-md 대신 사용)
      },
    },
  },
  plugins: [],
};
export default config;