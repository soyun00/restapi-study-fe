"use client";

import { useState, useEffect } from "react";
import { getUsers, getMe, refresh, logout, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
    const { accessToken, refreshToken, setTokens, clearTokens } = useAuth();
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

    // handleRefresh, handleLogout은 return보다 위에 있어야 아래 JSX에서 쓸 수 있다
    const handleRefresh = async () => {
        if (!refreshToken) return;
        try {
            const data = await refresh(refreshToken);
            setTokens(data.token, data.refreshToken);
            alert("토큰 갱신 완료");
        } catch (err) {
            alert(err instanceof Error ? err.message : "갱신 실패");
        }
    };

    const handleLogout = async () => {
        if (!refreshToken) return;
        try {
            await logout(refreshToken);
            clearTokens();
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