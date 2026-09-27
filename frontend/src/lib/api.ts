const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

type User = {
  email: string;
  name: string;
  questionnaire: Record<string, any>;
  profile_picture_url?: string;
};

export { API_URL, WS_URL };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Entry (no auth)
export const entryApi = {
  create: (data: { name: string; questionnaire?: Record<string, unknown> }) =>
    request<{ user: any }>('/entry', { method: 'POST', body: JSON.stringify(data) }),
  get: (userId: string) =>
    request<{ user: any }>(`/entry/${encodeURIComponent(userId)}`),
  update: (userId: string, data: { name?: string; questionnaire?: Record<string, unknown> }) =>
    request<{ user: any }>(`/entry/${encodeURIComponent(userId)}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Health
export const healthApi = {
  check: () => request<{ status: string }>('/health'),
  root: () => request<{ status: string; app: string; agents: number; rooms: number }>('/'),
};

// Questionnaire
export const questionnaireApi = {
  schema: () => request<any>('/questionnaire/schema'),
};

// Agents
export const agentsApi = {
  create: (data: { user_id: string; name: string; questionnaire: any }) =>
    request<{ status: string; user_id: string; name: string }>('/agents', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request<{ user_id: string; name: string }[]>('/agents'),
  validate: (userId: string) =>
    request<{ user_id: string; name: string; validated: boolean; results: any[] }>(`/agents/${encodeURIComponent(userId)}/validate`, { method: 'POST', body: JSON.stringify({}) }),
};

// Rooms
export const roomsApi = {
  create: (data: { user_a_id: string; user_b_id: string }) =>
    request<{ room_id: string; agent_a: string; agent_b: string; total_turns: number; phases: any[] }>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  get: (roomId: string) => request<any>(`/rooms/${roomId}`),
};

// Matches
export const matchesApi = {
  list: (userId: string, includeIncompatible = false) =>
    request<any[]>(`/matches/${encodeURIComponent(userId)}?include_incompatible=${includeIncompatible}`),
  counts: (userId: string) =>
    request<{ strong: number; conditional: number; incompatible: number; total: number }>(`/matches/counts/${encodeURIComponent(userId)}`),
  get: (matchId: string) => request<any>(`/matches/detail/${matchId}`),
  like: (userId: string, targetId: string) =>
    request<{ status: string; message: string }>(`/matches/like/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify({ target_id: targetId }),
    }),
  pass: (userId: string, targetId: string) =>
    request<{ status: string }>(`/matches/pass/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify({ target_id: targetId }),
    }),
};

// Clone chat
export const cloneApi = {
  intro: (userId: string) => request<{ intro: string }>(`/clone/intro/${encodeURIComponent(userId)}`),
  chat: (userId: string, message: string, history: { role: string; content: string }[]) =>
    request<{ reply: string }>(`/clone/chat/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};

// Users (candidate discovery)
export const usersApi = {
  candidates: (userId: string, skip = 0, limit = 50) =>
    request<{
      candidates: {
        user_id: string;
        name: string;
        city: string;
        neighborhood: string;
        questionnaire: Record<string, unknown>;
        photos: string[];
        profile_picture_url?: string;
        location_match_score: number;
      }[];
      total: number;
      skip: number;
      limit: number;
    }>(`/users/candidates/${encodeURIComponent(userId)}?skip=${skip}&limit=${limit}`),
};

// Photos
export const photosApi = {
  upload: async (userId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`${API_URL}/entry/${encodeURIComponent(userId)}/photos`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(body.detail || `Upload failed: ${res.status}`);
    }
    return res.json() as Promise<{ photos: string[] }>;
  },
};

// Negotiation log
export const negotiationLogApi = {
  get: (matchId: string) => request<any>(`/negotiation-log/${matchId}`),
};

// Auth
export const authApi = {
  me: () => request<{ user: User }>('/auth/me'),
  login: (data: { email: string; password: string }) => request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { email: string; password: string; name: string; phone_number?: string }) => request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleUrl: () => request<{ url: string }>('/auth/google/url'),
  googleCallback: (code: string, state: string) => request<{ user: User }>('/auth/google/callback', { method: 'POST', body: JSON.stringify({ code, state }) }),
  logout: () => request<{ status: string }>('/auth/logout', { method: 'POST' }),
};