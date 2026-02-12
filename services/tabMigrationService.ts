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
      // 플래그는 있지만 실제 탭이 없는 경우 복구
      const tabs = await storageService.getTabs();
      const hasDefaultTab = tabs.some(t => t.isDefault === true);

      if (!hasDefaultTab) {
        console.warn('Migration flag exists but no default tab found. Recreating...');
        await tabMigrationService.createDefaultInboxTab();
      }
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
  },

  // 복구: 기본 IN-BOX 탭 생성
  createDefaultInboxTab: async (): Promise<void> => {
    try {
      const tabs = await storageService.getTabs();

      // 이미 isDefault=true인 탭이 있는지 확인
      if (tabs.some(t => t.isDefault === true)) {
        console.log('Default IN-BOX tab already exists');
        return;
      }

      const inboxTabId = generateId();
      const inboxTab: Tab = {
        id: inboxTabId,
        name: 'IN-BOX',
        isDefault: true,
        createdAt: Date.now()
      };

      await storageService.saveTabs([...tabs, inboxTab]);
      await storageService.setCurrentTabId(inboxTabId);

      console.log('Default IN-BOX tab recreated');
    } catch (error) {
      console.error('Failed to recreate default IN-BOX tab:', error);
    }
  }
};
