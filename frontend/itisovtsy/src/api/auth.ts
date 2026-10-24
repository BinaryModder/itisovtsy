export interface Account {
  id: string
  name: string
  email: string
  level: number
  experiencePoints: number
  createdAt: string
}

export async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('Не удалось связаться с сервером. Попробуй ещё раз.')
  }
  if (path === 'me' && response.status === 401) return null as T
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    const message = response.status === 429 ? 'Слишком много попыток. Подожди минуту.'
      : response.status >= 500 ? 'Сервер временно недоступен. Попробуй позже.'
      : response.status === 401 ? 'Неверная почта или пароль.'
      : problem?.errors ? Object.values(problem.errors).flat().join(' ')
      : problem?.title || 'Не удалось выполнить запрос. Попробуй ещё раз.'
    throw new Error(message)
  }
  return response.status === 204 ? undefined as T : response.json()
}
