import '@testing-library/jest-dom';

// Ensure frontend code uses local backend URL in tests
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:8080';

// Provide a harmless alert stub
// @ts-ignore
global.alert = global.alert || jest.fn();

// Reset browser storage between tests to avoid state bleed
beforeEach(() => {
	jest.resetAllMocks();
	try { localStorage.clear(); } catch {}
	try { sessionStorage.clear(); } catch {}
});