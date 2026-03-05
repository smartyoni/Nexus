export interface Tab {
  id: string;
  name: string;
  isDefault: boolean; // true for IN-BOX only
  createdAt: number;
}

export interface DocumentData {
  id: string;
  title: string;
  content: string; // 필수 필드로 변경
  updatedAt: number;
  tabId: string; // 탭 ID (필수)
}

export type ViewMode = 'EDITOR';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
