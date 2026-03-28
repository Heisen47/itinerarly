import { generateWithWebLLM } from '@/lib/webLLMClient';

// Mock the dynamic import inside webLLMClient
jest.mock('@mlc-ai/web-llm', () => {
  return {
    CreateMLCEngine: jest.fn().mockResolvedValue({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              { message: { content: "Mocked WebLLM response" } }
            ]
          })
        }
      }
    })
  };
});

describe('webLLMClient', () => {
  beforeEach(() => {
    // Reset any mocks or engine instance if necessary
    jest.clearAllMocks();
  });

  describe('generateWithWebLLM', () => {
    test('returns successful AI generation content', async () => {
      // Because there is no window in Node.js test environment, we mock it globally
      const originalWindow = global.window;
      global.window = {} as any; 

      try {
        const result = await generateWithWebLLM('Test prompt');
        expect(result).toBe('Mocked WebLLM response');
      } finally {
        global.window = originalWindow;
      }
    });

    test('throws error if not in browser context', async () => {
      // the test environment is jsdom usually, but if window is undefined:
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      try {
        await expect(generateWithWebLLM('Test prompt')).rejects.toThrow("WebLLM can only run in the browser");
      } finally {
        global.window = originalWindow;
      }
    });
  });
});
