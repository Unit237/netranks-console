import { sendMagicLink, consumeMagicLink } from '../authService';
import { apiClient } from '../../../../app/lib/api';
import token from '../../../../app/utils/token';

// Mock dependencies
jest.mock('../../../../app/lib/api', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    isCanceled = false;
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

jest.mock('../../../../app/utils/token', () => ({
  __esModule: true,
  default: {
    getVisitor: jest.fn(),
    setUser: jest.fn(),
    getUser: jest.fn(),
  },
}));

jest.mock('../../../../app/localization/language', () => ({
  getSelectedLanguage: jest.fn(() => ({ locale: 'en' })),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMagicLink', () => {
    it('should send magic link successfully', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ success: true });

      await sendMagicLink('test@example.com', 'visitor-token');

      expect(apiClient.post).toHaveBeenCalledWith(
        'api/CreateMagicLink',
        {
          Email: 'test@example.com',
          Locale: 'en',
          VisitorSessionToken: 'visitor-token',
        }
      );
    });

    it('should handle errors when sending magic link', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(sendMagicLink('test@example.com', 'visitor-token')).rejects.toThrow();
    });
  });

  describe('consumeMagicLink', () => {
    it('should consume magic link and set user token', async () => {
      const mockToken = 'user-token-123';
      (apiClient.get as jest.Mock).mockResolvedValue(mockToken);
      (token.setUser as jest.Mock) = jest.fn();

      const result = await consumeMagicLink('magic-link-id', 'p1', 'p2');

      expect(apiClient.get).toHaveBeenCalledWith(
        'api/ConsumeMagicLink/magic-link-id/p1/p2',
        { skipErrorToast: true }
      );
      expect(token.setUser).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(mockToken);
    });

    it('should handle errors when consuming magic link', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Invalid link'));

      await expect(consumeMagicLink('invalid-id', 'p1', 'p2')).rejects.toThrow();
    });
  });
});
