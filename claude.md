# Template Master Sidebar - 개발 가이드

## 📌 최신 기능

### 즐겨찾기 기능 (v1.1)
- 문서 목록에서 **우클릭 (데스크톱)** 또는 **길게 누르기 (모바일)** 시 컨텍스트 메뉴 호출
- "즐겨찾기 지정" 옵션으로 한 개의 문서만 지정 가능
- 즐겨찾기 문서는 **노란색 테두리**로 표시
- 앱 재시작 시 자동으로 즐겨찾기 문서 로드
- 다른 문서 선택 후 앱 종료해도, 즐겨찾기 해제하지 않으면 재시작 시 즐겨찾기 문서로 돌아옴
- 즐겨찾기 문서 삭제 시 자동으로 즐겨찾기 초기화

**관련 파일:**
- `services/storageService.ts` - 즐겨찾기 저장/로드
- `services/localStorageService.ts` - localStorage 관리
- `services/firestoreService.ts` - Firestore 동기화
- `App.tsx` - 즐겨찾기 상태 관리
- `components/Sidebar/SidebarMenu.tsx` - 컨텍스트 메뉴 UI

---

## 🚀 배포 프로세스

### 최종 배포 (모든 환경)
```bash
npm run deploy:all
```
**자동 실행:**
1. Chrome 확장프로그램 빌드 (dist-extension/)
2. PWA 웹앱 빌드 (dist-pwa/)
3. GitHub에 코드 푸시
4. Firebase Hosting에 배포 (https://smartrealapp.web.app)
5. GitHub Pages에 배포 (https://smartyoni.github.io/Nexus)

---

## 🔧 개발 중 빠른 테스트

### 확장프로그램만 빌드 (Chrome 사이드바 테스트)
```bash
npm run build:extension
```
**동작:**
- `dist-extension/` 폴더에 빌드
- Chrome에서 확장프로그램 다시 로드만 하면 즉시 반영

---

## 📦 빌드 폴더 구조

| 폴더 | 용도 | 배포 위치 |
|------|------|---------|
| `dist-extension/` | Chrome 확장프로그램 | Chrome 브라우저 (수동 로드) |
| `dist-pwa/` | 웹/모바일 앱 | Firebase Hosting + GitHub Pages |

---

## 🔄 전체 npm 스크립트

| 명령어 | 역할 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 모든 환경 빌드 (ext + pwa) |
| `npm run build:extension` | 확장프로그램만 빌드 |
| `npm run build:pwa` | PWA만 빌드 |
| `npm run deploy` | PWA 빌드 + Firebase 배포 |
| `npm run deploy:github-pages` | GitHub Pages 배포 |
| `npm run deploy:all` | 모든 환경 한 번에 배포 ⭐ |

---

## 📝 최근 기능

### 메모 기능 (v1.0)
- 각 체크리스트 항목에 메모 추가 가능
- 메모 저장/편집/삭제 기능
- 메모는 체크리스트와 함께 자동 저장

**관련 파일:**
- `components/ui/MemoModal.tsx` - 메모 모달
- `components/Checklist/ChecklistManager.tsx` - 메모 기능 통합
- `types.ts` - ChecklistItem에 memo 필드 추가

---

## 🎯 개발 워크플로우

```
1. 코드 수정
   ↓
2. npm run build:extension (빠른 테스트)
   ↓
3. Chrome에서 확장프로그램 다시 로드
   ↓
4. 테스트 완료 후 npm run deploy:all
   ↓
5. 모든 환경 최신 버전으로 업데이트 ✅
```

---

## 🔗 관련 링크

- **Firebase Hosting**: https://smartrealapp.web.app
- **GitHub Pages**: https://smartyoni.github.io/Nexus
- GitHub Repository: https://github.com/smartyoni/Nexus
- Firebase Console: https://console.firebase.google.com/project/smartrealapp/overview
