"use client";

import { useState, useEffect } from "react";
import { getUsers, getMe, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isAdminView, setIsAdminView] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            setError("로그인이 필요합니다.");
            return;
        }

        // Admin이면 전체 목록, 아니면 본인 정보만 - 어느 쪽이든 백엔드가 최종 결정
        getUsers(accessToken)
            .then((list) => {
                setUsers(list);
                setIsAdminView(true);
            })
            .catch(() => {
                // 전체 목록 조회가 막히면(Admin 아님) 본인 정보로 대체
                getMe(accessToken)
                    .then((me) => setUsers([me]))
                    .catch((err) => setError(err instanceof Error ? err.message : "알 수 없는 오류"));
            });
    }, [accessToken]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
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