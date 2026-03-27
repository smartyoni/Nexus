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
  pages?: string[]; // 페이지별 내용 (선택적, 없을 경우 content 사용)
  pageTitles?: string[]; // 페이지별 대항목 제목
  order?: number; // 정렬 순서
}

export type ViewMode = 'list' | 'detail';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
