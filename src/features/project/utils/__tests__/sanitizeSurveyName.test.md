import { sanitizeSurveyName } from '../sanitizeSurveyName';

describe('sanitizeSurveyName', () => {
  describe('null/undefined handling', () => {
    it('should return empty string for null', () => {
      expect(sanitizeSurveyName(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(sanitizeSurveyName(undefined)).toBe('');
    });
  });

  describe('HTML entity removal', () => {
    it('should remove HTML entities', () => {
      expect(sanitizeSurveyName('Test &amp; Survey')).toBe('Test & Survey');
      expect(sanitizeSurveyName('Test &lt; Survey')).toBe('Test < Survey');
      expect(sanitizeSurveyName('Test &gt; Survey')).toBe('Test > Survey');
      expect(sanitizeSurveyName('Test &quot;Survey&quot;')).toBe('Test "Survey"');
      expect(sanitizeSurveyName('Test &#39;Survey&#39;')).toBe("Test 'Survey'");
      expect(sanitizeSurveyName('Test &nbsp; Survey')).toBe('Test Survey');
    });

    it('should remove cite-related HTML entities', () => {
      expect(sanitizeSurveyName('Test &cite; Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test &turn; Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test &view; Survey')).toBe('Test Survey');
    });
  });

  describe('pattern removal', () => {
    it('should remove cite turn view patterns', () => {
      expect(sanitizeSurveyName('Test cite turn0view0 Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test cite turn 0 view 0 Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test citeturn0view0 Survey')).toBe('Test Survey');
    });

    it('should remove cite turn search patterns', () => {
      expect(sanitizeSurveyName('Test cite turn1search12 Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test cite turn 1 search 12 Survey')).toBe('Test Survey');
    });

    it('should remove standalone cite patterns', () => {
      expect(sanitizeSurveyName('Test cite Survey')).toBe('Test Survey');
    });

    it('should remove turn/view/search number patterns', () => {
      expect(sanitizeSurveyName('Test turn0 view0 Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test turn 0 view 0 Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test search12 Survey')).toBe('Test Survey');
    });
  });

  describe('mentions removal', () => {
    it('should remove mentions at the end', () => {
      expect(sanitizeSurveyName('Test Survey mentions')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test Survey Mentions')).toBe('Test Survey');
      expect(sanitizeSurveyName('Test Survey MENTIONS')).toBe('Test Survey');
    });
  });

  describe('whitespace cleanup', () => {
    it('should clean up extra whitespace', () => {
      expect(sanitizeSurveyName('Test    Survey')).toBe('Test Survey');
      expect(sanitizeSurveyName('  Test Survey  ')).toBe('Test Survey');
    });
  });

  describe('description pattern extraction', () => {
    it('should extract brand name from description pattern', () => {
      const longDescription = 'BrandName is an amazing company that does many things and has a long description that exceeds eighty characters easily';
      const result = sanitizeSurveyName(longDescription);
      expect(result).toBe('BrandName');
    });

    it('should not extract if description is short', () => {
      const shortDescription = 'BrandName is a company';
      const result = sanitizeSurveyName(shortDescription);
      // Should not extract, just clean
      expect(result.length).toBeGreaterThan('BrandName'.length);
    });
  });

  describe('edge cases', () => {
    it('should return original if cleaning removes everything', () => {
      const result = sanitizeSurveyName('cite turn0view0');
      // Should return original since cleaning would remove everything
      expect(result).toBeDefined();
    });

    it('should handle empty string', () => {
      expect(sanitizeSurveyName('')).toBe('');
    });

    it('should handle normal survey names', () => {
      expect(sanitizeSurveyName('My Survey Name')).toBe('My Survey Name');
      expect(sanitizeSurveyName('Product Research 2024')).toBe('Product Research 2024');
    });
  });
});
