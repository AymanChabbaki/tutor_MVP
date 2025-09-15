const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const defaultHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };

export const summarizeContent = async (text, userId = null) => {
  const res = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ text, user_id: userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const explainContent = async (text, userId = null) => {
  const res = await fetch(`${BASE_URL}/explain`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ text, user_id: userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const generateExercises = async (text, userId = null) => {
  const res = await fetch(`${BASE_URL}/generate_exercises`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ text, user_id: userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
