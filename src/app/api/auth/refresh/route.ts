import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
        return NextResponse.json({ detail: "로그인이 필요합니다." }, { status: 401 });
    }

    const res = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
        const problem = await res.json().catch(() => null);
        // 갱신 실패(탈취 탐지 등) 시 쿠키도 같이 정리
        cookieStore.delete("refreshToken");
        return NextResponse.json(
            { detail: problem?.detail ?? "토큰 갱신에 실패했습니다." },
            { status: res.status }
        );
    }

    const data: { token: string; refreshToken: string } = await res.json();

    // rotate된 새 refreshToken으로 쿠키 갱신
    cookieStore.set("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ token: data.token });
}