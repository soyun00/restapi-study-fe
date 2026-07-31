import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
        // 백엔드에도 무효화 요청 (실패해도 쿠키는 지운다)
        await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
    }

    cookieStore.delete("refreshToken");
    return NextResponse.json({ message: "로그아웃되었습니다." });
}