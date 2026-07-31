// 이 파일이 브라우저에서 실행되는 "클라이언트 컴포넌트"임을 선언
// Next.js App Router는 기본적으로 모든 컴포넌트를 서버 컴포넌트로 취급
// 서버 컴포넌트는 useState, onClick/onSubmit 등과 같은 이벤트 핸들러 쓸 수 없음
// 사용자 입력에 반응해야 하는 컴포넌트 = "use client"
"use client";

import { useState, FormEvent } from "react";
import { login } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { accessToken, setAccessToken } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const data = await login({ userid, password });
            setAccessToken(data.token); // refreshToken은 이제 신경 쓸 필요 없음 - 쿠키가 알아서 처리됨
        } catch (err) {
            setError(err instanceof Error ? err.message : "알 수 없는 오류");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input value={userid} onChange={(e) => setUserid(e.target.value)} placeholder="아이디" />
            </div>
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                />
            </div>
            <button type="submit">로그인</button>

            {accessToken && (
                <>
                    <p>로그인 성공. Access Token: {accessToken.slice(0, 20)}...</p>
                    <Link href="/users">사용자 목록 보기</Link>
                </>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
}