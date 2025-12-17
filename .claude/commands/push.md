모든 환경 배포 (Chrome 확장프로그램 + 웹/모바일 + GitHub 푸시)

```bash
npm run deploy:all
```

이 명령어는:
1. 확장프로그램 빌드 (dist-extension/)
2. PWA 빌드 (dist-pwa/)
3. GitHub에 푸시
4. Firebase Hosting에 배포 (모바일 앱 자동 업데이트)
