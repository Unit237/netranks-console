import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatLastRun } from '../../../../features/project/utils/formatLastRun';

describe('formatLastRun', () => {
  let mockNow: Date;

  beforeEach(() => {
    // Mock current time to a fixed date for consistent testing
    mockNow = new Date('2025-01-15T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('null/undefined handling', () => {
    it('should return "Never" for null', () => {
      expect(formatLastRun(null)).toBe('Never');
    });

    it('should return "Never" for undefined', () => {
      expect(formatLastRun(undefined)).toBe('Never');
    });

    it('should return "Never" for empty string', () => {
      expect(formatLastRun('')).toBe('Never');
    });
  });

  describe('recent times (< 1 minute)', () => {
    it('should return "Just now" for dates less than 1 minute ago', () => {
      const thirtySecondsAgo = new Date(mockNow.getTime() - 30 * 1000).toISOString();
      expect(formatLastRun(thirtySecondsAgo)).toBe('Just now');
    });

    it('should return "Just now" for dates 0 seconds ago', () => {
      expect(formatLastRun(mockNow.toISOString())).toBe('Just now');
    });
  });

  describe('minutes ago (< 1 hour)', () => {
    it('should return "1m ago" for 1 minute ago', () => {
      const oneMinuteAgo = new Date(mockNow.getTime() - 1 * 60 * 1000).toISOString();
      expect(formatLastRun(oneMinuteAgo)).toBe('1m ago');
    });

    it('should return "5m ago" for 5 minutes ago', () => {
      const fiveMinutesAgo = new Date(mockNow.getTime() - 5 * 60 * 1000).toISOString();
      expect(formatLastRun(fiveMinutesAgo)).toBe('5m ago');
    });

    it('should return "30m ago" for 30 minutes ago', () => {
      const thirtyMinutesAgo = new Date(mockNow.getTime() - 30 * 60 * 1000).toISOString();
      expect(formatLastRun(thirtyMinutesAgo)).toBe('30m ago');
    });

    it('should return "59m ago" for 59 minutes ago', () => {
      const fiftyNineMinutesAgo = new Date(mockNow.getTime() - 59 * 60 * 1000).toISOString();
      expect(formatLastRun(fiftyNineMinutesAgo)).toBe('59m ago');
    });
  });

  describe('hours ago (< 24 hours)', () => {
    it('should return "1h ago" for 1 hour ago', () => {
      const oneHourAgo = new Date(mockNow.getTime() - 1 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(oneHourAgo)).toBe('1h ago');
    });

    it('should return "2h ago" for 2 hours ago', () => {
      const twoHoursAgo = new Date(mockNow.getTime() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(twoHoursAgo)).toBe('2h ago');
    });

    it('should return "12h ago" for 12 hours ago', () => {
      const twelveHoursAgo = new Date(mockNow.getTime() - 12 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(twelveHoursAgo)).toBe('12h ago');
    });

    it('should return "23h ago" for 23 hours ago', () => {
      const twentyThreeHoursAgo = new Date(mockNow.getTime() - 23 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(twentyThreeHoursAgo)).toBe('23h ago');
    });
  });

  describe('days ago (< 7 days)', () => {
    it('should return "1d ago" for 1 day ago', () => {
      const oneDayAgo = new Date(mockNow.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(oneDayAgo)).toBe('1d ago');
    });

    it('should return "3d ago" for 3 days ago', () => {
      const threeDaysAgo = new Date(mockNow.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(threeDaysAgo)).toBe('3d ago');
    });

    it('should return "6d ago" for 6 days ago', () => {
      const sixDaysAgo = new Date(mockNow.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(sixDaysAgo)).toBe('6d ago');
    });
  });

  describe('older dates (>= 7 days)', () => {
    it('should return formatted date for 7 days ago', () => {
      const sevenDaysAgo = new Date(mockNow.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = formatLastRun(sevenDaysAgo.toISOString());
      // Should be formatted like "Jan 8" (without year if same year)
      expect(result).toMatch(/Jan \d+/);
    });

    it('should return formatted date for 1 month ago', () => {
      const oneMonthAgo = new Date(mockNow.getTime() - 30 * 24 * 60 * 60 * 1000);
      const result = formatLastRun(oneMonthAgo.toISOString());
      expect(result).toMatch(/Dec \d+/);
    });

    it('should include year for dates from previous year', () => {
      const lastYear = new Date('2024-01-15T12:00:00Z');
      const result = formatLastRun(lastYear.toISOString());
      expect(result).toMatch(/Jan \d+, 2024/);
    });
  });

  describe('invalid dates', () => {
    it('should return "Invalid date" for invalid ISO string', () => {
      expect(formatLastRun('invalid-date')).toBe('Invalid date');
    });

    it('should return "Invalid date" for malformed date string', () => {
      expect(formatLastRun('2025-13-45T99:99:99Z')).toBe('Invalid date');
    });
  });

  describe('edge cases', () => {
    it('should handle exactly 1 minute boundary', () => {
      const exactlyOneMinute = new Date(mockNow.getTime() - 60 * 1000).toISOString();
      expect(formatLastRun(exactlyOneMinute)).toBe('1m ago');
    });

    it('should handle exactly 1 hour boundary', () => {
      const exactlyOneHour = new Date(mockNow.getTime() - 60 * 60 * 1000).toISOString();
      expect(formatLastRun(exactlyOneHour)).toBe('1h ago');
    });

    it('should handle exactly 1 day boundary', () => {
      const exactlyOneDay = new Date(mockNow.getTime() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatLastRun(exactlyOneDay)).toBe('1d ago');
    });

    it('should handle exactly 7 days boundary', () => {
      const exactlySevenDays = new Date(mockNow.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = formatLastRun(exactlySevenDays.toISOString());
      expect(result).toMatch(/Jan \d+/);
    });
  });
});
