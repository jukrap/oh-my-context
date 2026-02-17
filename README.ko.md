# Oh My Context!

Context Stack Editor for XML Prompts.

Oh My Context!는 XML 프롬프트를 트리 기반으로 편집하고, 전역 포함 블록을 조합해 XML/Markdown/JSON으로 안전하게 내보내는 도구입니다.

## 왜 XML 프롬프트인가

이 도구는 AI에게 전달할 프롬프트를 더 명확한 구조로 정리하기 위해 만들어졌습니다.

- 복잡한 프롬프트(규칙, 맥락, 예시, 출력 형식)에서는 XML 구획이 경계를 분명하게 만드는 데 유리할 수 있습니다.
- 구조가 명확하면 지시사항이 섞이거나 누락되는 일을 줄여 일관성이 좋아지는 경우가 많습니다.
- 다만 XML이 항상 Markdown/일반 텍스트보다 우위인 것은 아닙니다. 단순 작업은 가벼운 형식이 더 적합할 수 있습니다.
- 실제 적용 시에는 모델/업무 맥락에서 결과를 비교해 형식을 선택하는 것을 권장합니다.

## 핵심 기능

- 문서함: 프롬프트 문서 생성/복제/삭제/검색/필터/전환
- 컨텍스트 스택: 노드 추가/삭제/복제/토글/드래그 정렬
- 노드 편집기: 태그 이름, 속성, 내용 모드, 본문 편집
- 전역 포함: 내보내기 시 자동 삽입되는 재사용 블록
- 미리보기/내보내기: XML, Markdown, JSON 복사/다운로드
- 자동 저장: IndexedDB 기반 저장/복구
- 다국어: 영어/한국어 전환, 한국어 브라우저 자동 감지

## 기술 스택

- React + TypeScript + Vite
- React Compiler (`babel-plugin-react-compiler`)
- React Router
- Zustand
- TanStack Query
- dnd-kit
- localforage (IndexedDB)

## 개발 실행

```bash
pnpm install
pnpm dev
```

로컬 주소: `http://localhost:5173`

## 품질 점검

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 프로젝트 구조

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

## 용어

- `전역 포함(Global Include)`: 내보내기 시 자동 삽입되는 기능 개념
- `전역 포함 블록(Global Include Block)`: 실제로 저장/편집되는 include 데이터 단위

## 배포 (Vercel)

SPA 리라이트는 `vercel.json`에 이미 설정되어 있습니다.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

배포 순서:

1. GitHub 원격 저장소에 push
2. Vercel에서 `Add New Project` 클릭 후 저장소 선택
3. Framework Preset이 `Vite`인지 확인
4. Build Command: `pnpm build`
5. Output Directory: `dist`
6. Deploy 실행

운영 브랜치가 `master`라면 Vercel Production Branch를 `master`로 설정하세요.

## 참고

- 파비콘 경로: `public/icon.ico`
- `package-lock.json`은 사용하지 않으므로 `.gitignore`에 포함되어 있습니다.
