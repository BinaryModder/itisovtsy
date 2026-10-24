import { computed, ref } from 'vue'
import { authRequest, type Account } from '../api/auth'

const account = ref<Account | null>(null)
const studentName = computed(() => account.value?.name ?? 'John Doe')
const sessionLoading = ref(true)
const sessionError = ref('')
let sessionRequest: Promise<void> | null = null

function restoreSession() {
	if (!sessionRequest) {
		sessionRequest = authRequest<Account | null>('me')
			.then(value => { account.value = value })
			.catch(cause => { sessionError.value = (cause as Error).message })
			.finally(() => { sessionLoading.value = false })
	}
	return sessionRequest
}

export function useAuth() {
	return { account, studentName, sessionLoading, sessionError, restoreSession }
}
