import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				const status = error?.response?.status || error?.status;
				// Don't retry on 4xx errors
				if (status >= 400 && status < 500) {
					return false;
				}
				// Retry up to 2 times for other errors
				return failureCount < 2;
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
		},
		mutations: {
			retry: false,
		},
	},
});