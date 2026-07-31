"use client";

import {useState, FormEvent} from "react";
import {register} from "@/lib/api";

export default function RegisterPage() {
    const [userid, setUserid] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        
        try {
            // point는 회원가입 시 일단 0으로 고정 (끼능 검증이 목적이라 단순화)
            const user = await register({userid, username, password, point: 0});
            setMessage(`가입 완료: ${user.username} (id: ${user.id})`);
        } catch (err) {
            setError(err instanceof  Error ? err.message : "알 수 없는 오류");
        }
    };
    
    return (
        <form onSubmit = {handleSubmit}>
            <div>
                <input value={userid} onChange={(e) => setUserid(e.target.value)} placeholder="아이디" />
            </div>
            <div>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="이름" />
            </div>
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                />
            </div>
            <button type="submit">회원가입</button>

            {message && <p>{message}</p>}
            {error && <p style={{color: "red"}}>{error}</p>}
        </form>    
    );
}