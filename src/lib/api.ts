// 로그인 요청 시 서버로 보낼 바디 형태
// 백엔드의 LoginRequestDto(Userid, Password) 와 필드 이름 맞춤
// ASP.NET Core가 JSON 직렬화할 때 기본적으로 camelCase로 변환하므로
// C# 쪽 Userid/Password 가 여기선 userid/password
export interface LoginRequest {
    userid: string;
    password: string;
}

// login 성공 시 서버가 돌려주는 응답 형태
// TokenService에서 발급하는 Access Token / Refresh Token 두 개
export interface LoginResponse {
    token: string;
    refreshToken: string;
}

// 실패 시 서버가 ProblemDetails 형식으로 응답을 줌
// detail 메시지만 타입으로 정의
interface ProblemDetails {
    detail?: string;
}

// .env.local에 정의한 API 주소 읽어옴
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 로그인 API 호출 함수
// 성공하면 LoginResponse 반환, 실패하면 에러 던짐
export async function login(data: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data), // 객체를 JSON 문자열로 변환해서 전송
    });
    
    // res.ok는 상태 코드가 200-299 범위일 때만 true
    // 401(로그인 실패), 429(Rate Limit 초과) 는 걸림
    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "로그인에 실패했습니다.");
    }
    
    // 성공 시 응답 바디를 LoginResponse 타입으로 파싱해서 변환
    return res.json();
}

// UserResponseDto와 필드를 맞춘 타입
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

export interface RefreshResponse {
    token: string;
    refreshToken: string;
}

// 회원가입 - AllowAnonymous라 토큰없이 호출
export async function register(data: RegisterRequest): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail?? "회원가입에 실패했습니다.");
    }
    return res.json();
}

// 사용자 목록 조회 - RequireAuthorization()이 걸려있어 Bearer 토큰 필수
export async function getUsers(accessToken: string): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/user`, {
        headers: {
            Authorization: `Bearer ${accessToken}`, // 이게 없으면 401
        },
    });

    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "사용자 목록을 불러오지 못했습니다.");
    }

    return res.json();
}

// 본인 정보만 조회 - 일반 사용자용 (Admin이 아니어도 접근 가능)
export async function getMe(accessToken: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/user/me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "내 정보를 불러오지 못했습니다.");
    }

    return res.json();
}

// Access Token 만료 시 재로그인없이 갱신
export async function refresh(refreshToken: string): Promise<RefreshResponse> {
    const res = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken}),
    });
    
    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "Access Token 갱신에 실패했습니다.");
    }
    return res.json();
}

// 로그아웃 - 서버에 저장된 Refresh Token을 무효화
export async function logout(refreshToken: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken}),
    });
    
    if (!res.ok) {
        const problem: ProblemDetails | null = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? "로그아웃에 실패했습니다.")
    }
}