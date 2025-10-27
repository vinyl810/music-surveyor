import { NextResponse } from "next/server";
import fs from "fs/promises"; // Node.js 파일 시스템 모듈 (Promise 기반)
import path from "path"; // Node.js 경로 모듈

/**
 * IP 주소를 가져오는 함수
 */
function getIPAddress(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const vercelForwardedFor = requestHeaders.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  return "local-development-ip";
}

/**
 * IP 주소를 유효한 파일명으로 변환
 */
function sanitizeIpForFilename(ip: string): string {
  return ip.replace(/[:.]/g, "-") || "unknown-ip";
}

/**
 * 현재 시간을 YYYYMMDD_HHMMSS 형식으로 반환
 */
function getFormattedTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

/**
 * POST /api/submit
 * 설문 데이터를 받아 파일 시스템에 저장합니다.
 */
export async function POST(request: Request) {
  try {
    const surveyResponses = await request.json();

    if (!surveyResponses || Object.keys(surveyResponses).length === 0) {
      return NextResponse.json(
        { message: "제출된 데이터가 없습니다." },
        { status: 400 }
      );
    }

    // ✅ 파일명 생성: IP + 타임스탬프 추가
    const ip = getIPAddress(request.headers);
    const sanitizedIP = sanitizeIpForFilename(ip);
    const timestamp = getFormattedTimestamp();
    const filename = `${sanitizedIP}_${timestamp}.json`;

    const submissionsDir = path.join(process.cwd(), "submissions");
    const filePath = path.join(submissionsDir, filename);

    await fs.mkdir(submissionsDir, { recursive: true });

    await fs.writeFile(
      filePath,
      JSON.stringify(surveyResponses, null, 2),
      "utf8"
    );

    return NextResponse.json(
      { message: "설문이 성공적으로 제출되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("파일 저장 중 오류 발생:", error);
    return NextResponse.json(
      { message: "서버 오류: 제출에 실패했습니다." },
      { status: 500 }
    );
  }
}
