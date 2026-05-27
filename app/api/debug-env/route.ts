import { NextResponse } from 'next/server';

// 배포 후 /api/debug-env 에서 환경변수 로드 여부 확인
// 확인 후 이 파일은 삭제해도 됩니다
export async function GET() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return NextResponse.json({
    hasKey: !!key,
    keyLength: key?.length ?? 0,
    keyPrefix: key ? key.slice(0, 8) + '...' : null,
    nodeEnv: process.env.NODE_ENV,
  });
}
