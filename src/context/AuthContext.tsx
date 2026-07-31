"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// 로그인 상태(토큰)를 앱 전체 컴포넌트에서 공유하기 위한 Context.
interface AuthContextValue {
    accessToken: string | null;
    refreshToken: string | null;
    setTokens: (accessToken: string, refreshToken: string) => void;
    clearTokens: () => void;
}

// Context의 기본값은 undefined로 두고, Provider 밖에서 쓰면 에러가 나도록 함
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 앱 전체를 감싸서 하위 컴포넌트 어디서든 로그인 상태에 접근할 수 있게 해주는 Provider
export function AuthProvider({children}: {children: ReactNode}) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    
    // 로그인/refresh 성공 시 호출해서 토큰을 갱신
    const setTokens = (newAccessToken: string, newRefreshToken: string) => {
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
    };
    
    // 로그아웃 시 호출해서 토큰을 비운다.
    const clearTokens = () => {
        setAccessToken(null);
        setRefreshToken(null);
    };
    
    return (
        <AuthContext.Provider value={{ accessToken, refreshToken, setTokens, clearTokens }}>
            {children}
        </AuthContext.Provider>
    );
}

// 다른 컴포넌트에서 "const { accessToken } = useAuth(); 처럼 편하게 꺼내 쓰기 위한 훅
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
    }
    return context;
}