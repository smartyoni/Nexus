export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  memo?: string;
}

// A generic structure used for both Templates and Saved Documents
export interface DocumentData {
  id: string;
  title: string;
  content?: string; // DEPRECATED: 더 이상 UI에서 사용하지 않음, backward compatibility를 위해 유지
  checklist: ChecklistItem[];
  updatedAt: number;
  isTemplate: boolean; // simple flag to distinguish templates from instances
}

export type ViewMode = 'EDITOR' | 'TEMPLATE_PREVIEW';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
