// 이 파일이 브라우저에서 실행되는 "클라이언트 컴포넌트"임을 선언
// Next.js App Router는 기본적으로 모든 컴포넌트를 서버 컴포넌트로 취급
// 서버 컴포넌트는 useState, onClick/onSubmit 등과 같은 이벤트 핸들러 쓸 수 없음
// 사용자 입력에 반응해야 하는 컴포넌트 = "use client"
"use client";

import {useState, FormEvent} from "react";
import {login} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";

export default function LoginPage() {
    // 입력 필드 값을 담아둘 상태 (state)
    // 사용자가 타이핑할 때마다 이 값들이 바뀌고, 컴포넌트가 다시 렌더링됨
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    
    // Context에서 setTokens 함수와 현재 accessToken을 꺼내옴
    const { accessToken, setTokens } = useAuth();
    
    // 폼 제출(로그인 버튼 클릭 or 엔터) 시 실행되는 핸들러
    const handlerSubmit = async (e: FormEvent) => {
        e.preventDefault(); // 기본 동작(페이지 새로고침)을 막는다.
        setError(null);

        try {
            // lib/api.ts에서 만든 login 함수 호출.
            const data = await login({ userid, password });
            setTokens(data.token, data.refreshToken);
        } catch (err) {
            // login()에서 throw한 에러를 잡아서 화면에 표시.
            setError(err instanceof Error ? err.message : "알 수 없는 오류");
        }
    };
    
    return (
        <form onSubmit={handlerSubmit}>
            <div>
                <input
                    value={userid}
                    onChange={e => setUserid(e.target.value)}
                    placeholder="아이디"
                />
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

            {/* result나 error가 null이 아닐 때만 조건부로 렌더링 */}
            {accessToken && <p>로그인 성공. Access Token: {accessToken.slice(0, 20)}...</p>}
            {error && <p style={{color: "red"}}>{error}</p>}
        </form>
    );
}