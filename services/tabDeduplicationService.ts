import { storageService } from './storageService';
import { Tab } from '../types';

export const tabDeduplicationService = {
  // IN-BOX 탭 중복 제거
  async deduplicateInboxTabs(): Promise<void> {
    try {
      const tabs = await storageService.getTabs();

      // isDefault=true인 IN-BOX 탭 찾기
      const defaultInboxTabs = tabs.filter(t => t.isDefault === true);

      if (defaultInboxTabs.length <= 1) {
        // 이름만 IN-BOX인 탭도 확인 (isDefault=false인 경우)
        const namedInboxTabs = tabs.filter(t =>
          t.name.toUpperCase() === 'IN-BOX' && !t.isDefault
        );

        if (namedInboxTabs.length > 0) {
          console.warn(`Found ${namedInboxTabs.length} non-default IN-BOX tabs. Renaming...`);
          // 이름을 변경하여 혼동 방지
          const documents = await storageService.getDocuments();
          const nonDefaultTabCount = tabs.filter(t => !t.isDefault).length;

          for (let i = 0; i < namedInboxTabs.length; i++) {
            let tabNumber = nonDefaultTabCount + i + 1;
            let newName = `탭 ${tabNumber}`;

            // 중복되지 않는 이름 찾기
            while (tabs.some(t => t.name === newName)) {
              tabNumber++;
              newName = `탭 ${tabNumber}`;
            }

            namedInboxTabs[i].name = newName;
          }

          const updatedTabs = tabs.map(t => {
            const renamed = namedInboxTabs.find(nt => nt.id === t.id);
            return renamed ? { ...t, name: renamed.name } : t;
          });

          await storageService.saveTabs(updatedTabs);
        }
        return;
      }

      console.log(`Found ${defaultInboxTabs.length} duplicate IN-BOX tabs. Consolidating...`);

      // 가장 오래된 탭을 메인으로 선택
      const primaryInbox = defaultInboxTabs.sort((a, b) =>
        a.createdAt - b.createdAt
      )[0];

      const duplicates = defaultInboxTabs.filter(t => t.id !== primaryInbox.id);

      // 중복 탭의 문서를 메인 IN-BOX로 이동
      await this.consolidateDocuments(duplicates, primaryInbox.id);

      // 중복 탭 삭제
      const newTabs = tabs.filter(t =>
        !duplicates.some(dup => dup.id === t.id)
      );

      await storageService.saveTabs(newTabs);

      console.log(`Removed ${duplicates.length} duplicate IN-BOX tabs. Consolidation complete.`);
    } catch (error) {
      console.error('Deduplication failed:', error);
    }
  },

  // 문서 통합
  async consolidateDocuments(duplicateTabs: Tab[], targetTabId: string): Promise<void> {
    try {
      const documents = await storageService.getDocuments();

      const affectedDocs = documents.filter(doc =>
        duplicateTabs.some(tab => tab.id === doc.tabId)
      );

      if (affectedDocs.length === 0) {
        console.log('No documents to consolidate');
        return;
      }

      console.log(`Moving ${affectedDocs.length} documents to primary IN-BOX`);

      // 문서의 tabId를 메인 IN-BOX로 변경
      const updatedDocs = documents.map(doc => {
        if (duplicateTabs.some(tab => tab.id === doc.tabId)) {
          return { ...doc, tabId: targetTabId, updatedAt: Date.now() };
        }
        return doc;
      });

      await storageService.saveDocuments(updatedDocs);
    } catch (error) {
      console.error('Document consolidation failed:', error);
    }
  }
};
