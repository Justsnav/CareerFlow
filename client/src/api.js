const request = async (path, options = {}) => {
  const token = localStorage.getItem('careerflow-token');
  const response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Request failed.'); return payload;
};
export const api = { register: body => request('/auth/register',{method:'POST',body:JSON.stringify(body)}), login: body => request('/auth/login',{method:'POST',body:JSON.stringify(body)}), me:()=>request('/auth/me'), list:q=>request(`/applications?${new URLSearchParams(q)}`), summary:()=>request('/applications/summary'), create:b=>request('/applications',{method:'POST',body:JSON.stringify(b)}), update:(id,b)=>request(`/applications/${id}`,{method:'PUT',body:JSON.stringify(b)}), remove:id=>request(`/applications/${id}`,{method:'DELETE'}) };
