import { NextResponse } from "next/server";
// import { headers } from "next/headers"; // <-- [수정] 이 줄을 삭제합니다.
import fs from "fs/promises"; // Node.js 파일 시스템 모듈 (Promise 기반)
import path from "path"; // Node.js 경로 모듈

/**
 * IP 주소를 가져오는 함수
 * [수정] request.headers 객체를 직접 매개변수로 받도록 변경합니다.
 */
function getIPAddress(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    // 'x-forwarded-for' 헤더는 "client, proxy1, proxy2" 형태일 수 있으므로
    // 가장 앞의 IP 주소(실제 클라이언트)를 사용합니다.
    return forwardedFor.split(",")[0].trim();
  }

  // Vercel 환경이 아닐 경우(예: 로컬 개발)를 위한 대체 값
  const vercelForwardedFor = requestHeaders.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  // 로컬 개발 환경 등에서 IP를 특정하기 어려울 때의 기본값
  return "local-development-ip";
}

/**
 * IP 주소를 유효한 파일명으로 변환하는 함수
 * (예: "192.168.0.1" -> "192-168-0-1", "::1" -> "--1")
 */
function sanitizeIpForFilename(ip: string): string {
  // IPv6의 ':' 문자와 IPv4의 '.' 문자를 '-'로 치환합니다.
  return ip.replace(/[:.]/g, "-") || "unknown-ip";
}

/**
 * POST /api/submit
 * 설문 데이터를 받아 파일 시스템에 저장합니다.
 */
export async function POST(request: Request) {
  try {
    // 1. 요청 body에서 JSON 데이터 파싱
    const surveyResponses = await request.json();

    if (!surveyResponses || Object.keys(surveyResponses).length === 0) {
      return NextResponse.json(
        { message: "제출된 데이터가 없습니다." },
        { status: 400 }
      );
    }

    // 2. IP 주소 가져오기 및 파일명 생성
    // [수정] request.headers를 getIPAddress 함수에 전달합니다.
    const ip = getIPAddress(request.headers);
    const filename = `${sanitizeIpForFilename(ip)}.json`;

    // 3. 저장 경로 설정
    const submissionsDir = path.join(process.cwd(), "submissions");
    const filePath = path.join(submissionsDir, filename);

    // 4. 'submissions' 디렉토리 존재 여부 확인 및 생성
    await fs.mkdir(submissionsDir, { recursive: true });

    // 5. 파일 쓰기
    await fs.writeFile(
      filePath,
      JSON.stringify(surveyResponses, null, 2),
      "utf8"
    );

    // 6. 성공 응답 반환
    return NextResponse.json(
      { message: "설문이 성공적으로 제출되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    // 7. 실패(에러) 응답 반환
    console.error("파일 저장 중 오류 발생:", error);
    return NextResponse.json(
      { message: "서버 오류: 제출에 실패했습니다." },
      { status: 500 }
    );
  }
}