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
  content: string; // The text area content
  checklist: ChecklistItem[];
  updatedAt: number;
  isTemplate: boolean; // simple flag to distinguish templates from instances
  isDailyNote?: boolean; // flag to distinguish daily notes from regular tasks
}

export type ViewMode = 'EDITOR' | 'TEMPLATE_PREVIEW';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
