export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  memo?: string;
}

export interface Tab {
  id: string;
  name: string;
  isDefault: boolean; // true for IN-BOX only
  createdAt: number;
}

export interface DocumentData {
  id: string;
  title: string;
  content?: string; // DEPRECATED: 더 이상 UI에서 사용하지 않음, backward compatibility를 위해 유지
  checklist: ChecklistItem[];
  updatedAt: number;
  tabId: string; // 탭 ID (필수)
  category?: string; // DEPRECATED: 탭 시스템으로 대체됨
}

export type ViewMode = 'EDITOR';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
