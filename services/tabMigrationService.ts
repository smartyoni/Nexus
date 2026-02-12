import { Tab, generateId } from '../types';
import { storageService } from './storageService';

const MIGRATION_FLAG = 'tm_tab_migration_complete';

export const tabMigrationService = {
  // Check if migration has already been done
  isMigrationComplete: (): boolean => {
    try {
      return localStorage.getItem(MIGRATION_FLAG) === 'true';
    } catch (e) {
      return false;
    }
  },

  // Perform migration from category system to tab system
  migrateToTabSystem: async (): Promise<void> => {
    // Only migrate once
    if (tabMigrationService.isMigrationComplete()) {
      return;
    }

    try {
      // 1. Delete all existing documents
      await storageService.saveDocuments([]);

      // 2. Clear favorite
      await storageService.clearFavoriteDocId();

      // 3. Create default IN-BOX tab
      const inboxTabId = generateId();
      const inboxTab: Tab = {
        id: inboxTabId,
        name: 'IN-BOX',
        isDefault: true,
        createdAt: Date.now()
      };

      // 4. Save default tab
      await storageService.saveTabs([inboxTab]);

      // 5. Set IN-BOX as active tab
      await storageService.setCurrentTabId(inboxTabId);

      // 6. Mark migration as complete
      localStorage.setItem(MIGRATION_FLAG, 'true');

      console.log('Tab migration completed successfully');
    } catch (error) {
      console.error('Tab migration failed:', error);
      // Still mark as complete to prevent infinite retries
      localStorage.setItem(MIGRATION_FLAG, 'true');
    }
  }
};
