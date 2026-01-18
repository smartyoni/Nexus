export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  memo?: string;
}

export interface DocumentData {
  id: string;
  title: string;
  content?: string; // DEPRECATED: 더 이상 UI에서 사용하지 않음, backward compatibility를 위해 유지
  checklist: ChecklistItem[];
  updatedAt: number;
}

export type ViewMode = 'EDITOR';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
