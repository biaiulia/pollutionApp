import { getToken } from './tokenStorage';

const apiFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(init?.headers as Record<string, string>),
  };

  return fetch(input, { ...init, headers });
};

export default apiFetch;