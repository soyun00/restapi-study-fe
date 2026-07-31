// 로그인 요청 시 서버로 보낼 바디 형태
// 백엔드의 LoginRequestDto(Userid, Password) 와 필드 이름 맞춤
// ASP.NET Core가 JSON 직렬화할 때 기본적으로 camelCase로 변환하므로
// C# 쪽 Userid/Password 가 여기선 userid/password
// ===== 인증 관련 - Next.js 자체 API 라우트(/api/auth/...)를 호출 =====
// refreshToken은 여기서 전혀 다루지 않는다 - httpOnly 쿠키로만 존재

export interface LoginRequest {
    userid: string;
    password: string;
}

// refreshToken은 쿠키로 처리되어 응답 바디에 없음
export interface AuthResult {
    token: string;
}

interface ProblemDetails {
    detail?: string;
}

export async function login(data: LoginRequest): Promise<AuthResult> {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "로그인에 실패했습니다.");
    }

    return res.json();
}

export async function refreshAccessToken(): Promise<AuthResult> {
    // refreshToken은 쿠키에 실려서 자동으로 Next.js 서버에 전달
    const res = await fetch("/api/auth/refresh", { method: "POST" });

    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "토큰 갱신에 실패했습니다.");
    }

    return res.json();
}

export async function logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
}

// ===== /user 관련 - 그대로 ASP.NET Core 백엔드를 직접 호출 =====

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface User {
    id: number;
    userid: string;
    username: string;
    point: number;
}

export interface RegisterRequest {
    userid: string;
    username: string;
    password: string;
    point: number;
}

export async function register(data: RegisterRequest): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "회원가입에 실패했습니다.");
    }

    return res.json();
}

export async function getUsers(accessToken: string): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "사용자 목록을 불러오지 못했습니다.");
    }

    return res.json();
}

export async function getMe(accessToken: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "내 정보를 불러오지 못했습니다.");
    }

    return res.json();
}