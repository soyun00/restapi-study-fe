import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 서버 전용 환경변수 - NEXT_PUBLIC_ 없어서 브라우저에 노출되지 않는다
const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
    const body = await request.json(); // { userid, password }

    // 백엔드 /login 호출 - 이건 브라우저가 아니라 Next.js 서버가 직접 호출
    const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const problem = await res.json().catch(() => null);
        return NextResponse.json(
        { detail: problem?.detail ?? "로그인에 실패했습니다." },
        { status: res.status }
        );
    }

    const data: { token: string; refreshToken: string } = await res.json();

    // refreshToken은 여기서만 다루고 httpOnly 쿠키에 심는다
    // -> 브라우저 JS는 document.cookie로도 이 값을 절대 읽을 수 없다
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", data.refreshToken, {
        httpOnly: true, // JS 접근 차단 (XSS 방어)
        secure: process.env.NODE_ENV === "production", // 운영에서만 HTTPS 강제 (로컬은 http라 꺼둠)
        sameSite: "lax", // 다른 사이트에서의 요청엔 쿠키를 안 실어보냄 (CSRF 완화)
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7일 - 백엔드 만료 정책과 동일하게 맞춤
    });

    // 브라우저에는 Access Token만 내려준다
    return NextResponse.json({ token: data.token });
}