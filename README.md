# Oh My Context!

Context Stack Editor for XML Prompts.

XML 프롬프트를 트리 기반으로 편집하고, 전역 포함 블록을 조합해 XML/Markdown/JSON으로 안전하게 내보내는 도구입니다.

## 핵심 기능

- 문서함: 여러 프롬프트 문서 생성/복제/삭제/전환
- 컨텍스트 스택: 노드 추가/삭제/복제/토글/드래그 정렬
- 노드 편집기: 태그명/속성/내용 모드/본문 편집
- 전역 포함: 내보내기 시 자동 삽입되는 공통 블록 관리
- 미리보기/내보내기: XML, Markdown, JSON 탭 + 복사/다운로드
- 자동 저장: IndexedDB 기반 저장/복구 + 저장 상태 표시
- 다국어: 영어/한국어 전환, 한국어 브라우저 자동 감지

## 기술 스택

- React + TypeScript + Vite
- React Router
- Zustand (전역 상태)
- TanStack Query
- dnd-kit
- localforage (IndexedDB)

## 개발 실행

```bash
pnpm install
pnpm dev
```

기본 주소: `http://localhost:5173`

## 품질 점검 명령

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 폴더 구조

```text
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

FSD(Feature-Sliced Design) 기준으로 구성되어 있습니다.

## 용어 기준

- `전역 포함`: 내보내기 시 자동으로 삽입되는 기능 개념
- `전역 포함 블록`: 실제로 저장/편집되는 include 데이터 단위

## 배포 (Vercel)

이 저장소에는 SPA 라우팅용 `vercel.json` 리라이트가 이미 포함되어 있습니다.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

배포 순서:

1. Git 원격 저장소에 push
2. Vercel 대시보드에서 `Add New Project` → 저장소 선택
3. Framework Preset: `Vite` 확인
4. Build Command: `pnpm build`
5. Output Directory: `dist`
6. Deploy 실행

브랜치가 `master`라면 Vercel에서 Production Branch를 `master`로 맞추면 됩니다.

## 참고

- 파비콘 파일은 `public/icon.ico`를 사용합니다.
- `package-lock.json`은 사용하지 않으므로 `.gitignore`에 포함되어 있습니다.
