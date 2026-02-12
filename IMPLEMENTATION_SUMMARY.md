# 하단 네비게이션 시스템 구현 완료

## ✅ 구현된 기능

### 1. 탭 시스템 (Tab System)
- **기본 탭**: IN-BOX (삭제/이름 변경 불가)
- **커스텀 탭**: 최대 3개 추가 가능 (총 4개까지)
- **탭 관리**: 생성, 이름 변경, 삭제 가능
- **탭 전환**: 하단 네비게이션에서 탭 선택시 문서 서랍 자동 오픈

### 2. 하단 네비게이션 (Bottom Navigation)
- 화면 하단에 고정 (h-16)
- 탭 목록 스크롤 가능
- 활성 탭 시각적 표시 (파란색 테두리)
- "+" 버튼으로 새 탭 추가 (4개 도달시 비활성화)
- 모바일 & 데스크톱 모두 지원

### 3. 문서 서랍 (Document Drawer)
- 하단에서 슬라이드업 (최대 높이 80vh)
- 활성 탭의 문서만 표시
- 드래그앤드롭으로 문서 순서 변경
- 문서 이동: "탭 이동" 메뉴에서 다른 탭으로 이동 가능

### 4. 문서 관리
- **생성**: "새문서추가" 버튼 → 활성 탭에 생성
- **선택**: 문서 클릭 → 에디터 오픈, 서랍 자동 닫힘
- **삭제**: 컨텍스트 메뉴 → 확인 모달
- **이동**: 컨텍스트 메뉴 → 다른 탭으로 이동
- **즐겨찾기**: 별표 아이콘 또는 컨텍스트 메뉴

### 5. 컨텍스트 메뉴
**문서 메뉴:**
- 즐겨찾기 지정/해제
- 탭 이동 (다른 탭 목록)
- 삭제

**탭 메뉴:**
- 이름 변경 (기본 탭 제외)
- 삭제 (기본 탭, 문서 있는 탭 제외)

### 6. 마이그레이션 시스템
- **첫 실행**: 기존 문서 자동 삭제
- **초기화**: 즐겨찾기 초기화, IN-BOX 탭 생성
- **한 번만**: localStorage 플래그로 중복 방지

### 7. 저장소 (Storage)
- **Firestore**: 클라우드 동기화
- **localStorage**: 오프라인 지원 및 Firestore 오류시 폴백
- **자동 저장**: 2초 debounce로 문서 자동 저장

---

## 📁 생성된 파일

### 새 컴포넌트
```
components/
├── BottomNavigation/
│   ├── BottomNavigation.tsx      # 하단 네비게이션 바
│   └── TabManagementModal.tsx    # 탭 이름 변경/삭제 모달
└── DocumentDrawer/
    └── DocumentDrawer.tsx        # 문서 목록 서랍
```

### 새 서비스
```
services/
└── tabMigrationService.ts        # 탭 시스템 마이그레이션
```

---

## 🔄 수정된 파일

### types.ts
```typescript
// 추가
export interface Tab {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: number;
}

// DocumentData 변경
tabId: string;           // 필수 필드
category?: string;       // DEPRECATED
```

### App.tsx
- 사이드바 상태 제거: `isSidebarOpen`, `currentCategory`
- 탭 상태 추가: `tabs`, `activeTabId`, `isDrawerOpen`
- 탭 관리 핸들러 추가: `handleAddTab`, `handleRenameTab`, `handleDeleteTab`, `handleTabChange`, `handleMoveDocumentToTab`
- 레이아웃: 사이드바 → 하단 네비게이션 + 서랍
- 마이그레이션: `tabMigrationService.migrateToTabSystem()` 호출

### SplitEditor.tsx
- `onOpenSidebar` prop 제거
- 해버거 메뉴 버튼 제거
- null data 처리

### 저장소 서비스
**localStorageService.ts, firestoreService.ts, storageService.ts:**
```typescript
getTabs()                    // 탭 목록 조회
saveTabs(tabs)              // 탭 목록 저장
saveTab(tab)                // 단일 탭 저장
deleteTab(id)               // 탭 삭제
getCurrentTabId()           // 활성 탭 ID 조회
setCurrentTabId(id)         // 활성 탭 ID 저장
```

### 삭제된 파일
- `components/Sidebar/SidebarMenu.tsx`

---

## 🧪 검증 항목

### ✅ 탭 관리
- [ ] 앱 로드시 IN-BOX 탭으로 시작
- [ ] "+" 클릭으로 새 탭 생성 (최대 4개)
- [ ] 커스텀 탭 우클릭/길게누르기 → 이름 변경/삭제 메뉴
- [ ] 기본 탭은 이름 변경/삭제 불가
- [ ] 문서 있는 탭 삭제 불가
- [ ] 활성 탭 삭제시 IN-BOX로 전환

### ✅ 문서 서랍
- [ ] 탭 클릭 → 서랍 오픈
- [ ] 배경 클릭 → 서랍 닫힘
- [ ] 드래그앤드롭 순서 변경 (같은 탭 내)
- [ ] 컨텍스트 메뉴: 즐겨찾기, 이동, 삭제
- [ ] 즐겨찾기 문서는 노란색 테두리
- [ ] 새문서추가 → 서랍 자동 닫힘

### ✅ 문서 구성
- [ ] 문서는 자신의 탭에만 표시
- [ ] 탭 이동시 다른 탭 목록 표시
- [ ] 새 문서는 활성 탭에 생성
- [ ] 즐겨찾기는 탭 이동후에도 유지

### ✅ 마이그레이션
- [ ] 첫 실행: 기존 문서 삭제
- [ ] IN-BOX 탭 자동 생성
- [ ] 재실행시 마이그레이션 스킵

### ✅ 반응형
- [ ] 모바일: 하단 네비 고정, 서랍 슬라이드업
- [ ] 데스크톱: 안전 영역 고려
- [ ] 태블릿: 모든 기능 정상 작동

---

## 🚀 배포

### 확장프로그램만 빌드
```bash
npm run build:extension
```

### 전체 배포
```bash
npm run deploy:all
```

---

## 📝 주요 설계 결정

### 1. 탭 최대 4개 제한
- 사용성: 너무 많으면 관리 어려움
- UI: 모바일 화면에 적합
- 확장성: 필요시 늘릴 수 있음

### 2. 기본 탭 (IN-BOX) 필수
- 항상 최소 하나의 탭 필요
- 삭제 불가능하도록 설정

### 3. 마이그레이션 일회성
- localStorage 플래그로 추적
- 데이터 손실 방지

### 4. 탭 간 문서 이동
- 드래그앤드롭: 같은 탭 내에서만
- 컨텍스트 메뉴: 다른 탭으로 이동

### 5. Firestore + localStorage
- 클라우드 동기화
- 오프라인 지원
- 자동 폴백

---

## 📊 코드 통계

| 항목 | 추가 | 수정 | 삭제 |
|------|------|------|------|
| 파일 | 4개 | 5개 | 1개 |
| 라인 | ~500 | ~300 | ~300 |
| 컴포넌트 | 3개 | - | - |
| 함수 | 6개 | - | - |

---

## 🔗 관련 링크

- CLAUDE.md: 프로젝트 개발 가이드
- types.ts: 타입 정의
- services/: 저장소 계층
- components/: UI 컴포넌트
