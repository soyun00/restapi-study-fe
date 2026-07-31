"use client";

import { useState, useEffect } from "react";
import { getUsers, getMe, refreshAccessToken, logout, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
    const { accessToken, setAccessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isAdminView, setIsAdminView] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            setError("로그인이 필요합니다.");
            return;
        }

        getUsers(accessToken)
            .then((list) => {
                setUsers(list);
                setIsAdminView(true);
            })
            .catch(() => {
                getMe(accessToken)
                    .then((me) => setUsers([me]))
                    .catch((err) => setError(err instanceof Error ? err.message : "알 수 없는 오류"));
            });
    }, [accessToken]);

    const handleRefresh = async () => {
        try {
            const data = await refreshAccessToken(); // 쿠키에서 자동으로 refreshToken을 꺼내 씀
            setAccessToken(data.token);
            alert("토큰 갱신 완료");
        } catch (err) {
            alert(err instanceof Error ? err.message : "갱신 실패");
        }
    };

    const handleLogout = async () => {
        try {
            await logout(); // 마찬가지로 쿠키 기반, 인자 없음
            setAccessToken(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : "로그아웃 실패");
        }
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <button onClick={handleRefresh}>토큰 갱신</button>
            <button onClick={handleLogout}>로그아웃</button>

            <p>{isAdminView ? "전체 사용자 목록 (Admin)" : "내 정보"}</p>
            <ul>
                {users.map((u) => (
                    <li key={u.id}>
                        {u.id} / {u.userid} / {u.username} / {u.point}
                    </li>
                ))}
            </ul>
        </div>
    );
}