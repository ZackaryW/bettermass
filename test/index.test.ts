import { getPreferences, getDbMeta } from '../src/utils/app';

describe('BetterMass', () => {
  describe('getPreferences', () => {
    it('should be defined', () => {
      expect(getPreferences).toBeDefined();
    });
  });

  describe('getDbMeta', () => {
    it('should be defined', () => {
      expect(getDbMeta).toBeDefined();
    });
  });
});
