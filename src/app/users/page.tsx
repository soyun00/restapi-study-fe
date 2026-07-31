"use client";

import { useState, useEffect } from "react";
import { getUsers, User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Context에 토큰이 없으면(로그인 안 한 상태) 호출조차 하지 않는다
        if (!accessToken) {
            setError("로그인이 필요합니다.");
            return;
        }

        getUsers(accessToken)
            .then(setUsers)
            .catch((err) => setError(err instanceof Error ? err.message : "알 수 없는 오류"));
    }, [accessToken]); // accessToken이 바뀔 때마다(로그인 시점) 다시 조회

    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <ul>
            {users.map((u) => (
                <li key={u.id}>
                    {u.id} / {u.userid} / {u.username} / {u.point}
                </li>
            ))}
        </ul>
    );
}