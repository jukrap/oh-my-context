export type AppLanguage = 'en' | 'ko';

export type TranslationKey =
  | 'appTagline'
  | 'navVault'
  | 'navIncludes'
  | 'navTemplates'
  | 'navSettings'
  | 'saveSaving'
  | 'saveSaved'
  | 'saveError'
  | 'saveIdle'
  | 'noActiveDocument'
  | 'loadingWorkspace'
  | 'contextStack'
  | 'addNode'
  | 'searchTagOrContent'
  | 'dragNode'
  | 'enableNode'
  | 'collapseNode'
  | 'expandNode'
  | 'nodeMeta'
  | 'stateEnabled'
  | 'stateDisabled'
  | 'addChild'
  | 'duplicate'
  | 'delete'
  | 'nodeEditor'
  | 'documentMeta'
  | 'showDocumentMeta'
  | 'hideDocumentMeta'
  | 'documentName'
  | 'tags'
  | 'tagsPlaceholder'
  | 'rootTag'
  | 'selectNodeHint'
  | 'tagName'
  | 'xmlNameValidation'
  | 'attributes'
  | 'addAttribute'
  | 'removeAttribute'
  | 'contentMode'
  | 'content'
  | 'tokenEstimate'
  | 'wrapSelection'
  | 'markdownPreview'
  | 'previewExport'
  | 'copyXml'
  | 'copyMarkdown'
  | 'copyJson'
  | 'download'
  | 'includeIncludes'
  | 'includeSettings'
  | 'copied'
  | 'copyFailed'
  | 'promptVault'
  | 'create'
  | 'filters'
  | 'documents'
  | 'createDocument'
  | 'searchNameOrTags'
  | 'tagFilter'
  | 'updatedAt'
  | 'open'
  | 'rename'
  | 'save'
  | 'noTags'
  | 'confirmDeleteDocument'
  | 'globalIncludes'
  | 'addInclude'
  | 'includeHint'
  | 'useInActiveDocument'
  | 'description'
  | 'targetTagName'
  | 'includeTag'
  | 'includeContent'
  | 'settings'
  | 'language'
  | 'languageHint'
  | 'korean'
  | 'english'
  | 'brandColor'
  | 'confirmBeforeDelete'
  | 'showMarkdownPreview'
  | 'rawXmlStrictMode'
  | 'defaultRootTagEnabled'
  | 'defaultRootTagName'
  | 'templatesV1'
  | 'templatesHint'
  | 'close';

type TranslationMap = Record<TranslationKey, string>;

const messages: Record<AppLanguage, TranslationMap> = {
  en: {
    appTagline: 'Context Stack Editor for XML Prompts',
    navVault: 'Vault',
    navIncludes: 'Includes',
    navTemplates: 'Templates',
    navSettings: 'Settings',
    saveSaving: 'Saving...',
    saveSaved: 'Saved {time}',
    saveError: 'Error',
    saveIdle: 'Idle',
    noActiveDocument: 'No active document',
    loadingWorkspace: 'Loading workspace...',
    contextStack: 'Context Stack',
    addNode: 'Add Node',
    searchTagOrContent: 'Search tag or content',
    dragNode: 'Drag node',
    enableNode: 'Enable node',
    collapseNode: 'Collapse node',
    expandNode: 'Expand node',
    nodeMeta: '{mode} · {children} children · {state}',
    stateEnabled: 'enabled',
    stateDisabled: 'disabled',
    addChild: 'Add child',
    duplicate: 'Duplicate',
    delete: 'Delete',
    nodeEditor: 'Node Editor',
    documentMeta: 'Document Meta',
    showDocumentMeta: 'Show document meta settings',
    hideDocumentMeta: 'Hide document meta settings',
    documentName: 'Document Name',
    tags: 'Tags',
    tagsPlaceholder: 'prompt, policy, baseline',
    rootTag: 'Root Tag',
    selectNodeHint: 'Select a node from the stack to edit details.',
    tagName: 'Tag Name',
    xmlNameValidation: 'Tag must match XML name pattern.',
    attributes: 'Attributes',
    addAttribute: 'Add Attr',
    removeAttribute: 'Remove',
    contentMode: 'Content Mode',
    content: 'Content',
    tokenEstimate: '~{count} tokens (rough chars/4 estimate)',
    wrapSelection: 'Wrap Selection with Tag',
    markdownPreview: 'Markdown Preview (raw)',
    previewExport: 'Preview / Export',
    copyXml: 'Copy XML',
    copyMarkdown: 'Copy Markdown',
    copyJson: 'Copy JSON',
    download: 'Download',
    includeIncludes: 'Include Includes',
    includeSettings: 'Include Settings',
    copied: 'Copied.',
    copyFailed: 'Copy failed.',
    promptVault: 'Prompt Vault',
    create: 'Create',
    filters: 'Filters',
    documents: 'Documents',
    createDocument: 'Create Document',
    searchNameOrTags: 'Search name or tags',
    tagFilter: 'Tag filter',
    updatedAt: 'Updated {time}',
    open: 'Open',
    rename: 'Rename',
    save: 'Save',
    noTags: 'No tags',
    confirmDeleteDocument: 'Delete "{name}"?',
    globalIncludes: 'Global Includes',
    addInclude: 'Add Include',
    includeHint:
      'Includes are inserted only during export and do not mutate original nodes.',
    useInActiveDocument: 'Use in active document',
    description: 'Description',
    targetTagName: 'targetTagName',
    includeTag: 'Include tag',
    includeContent: 'Include content',
    settings: 'Settings',
    language: 'Language',
    languageHint:
      'Default is English. Korean users are auto-detected on first visit.',
    korean: 'Korean',
    english: 'English',
    brandColor: 'Brand Color',
    confirmBeforeDelete: 'Confirm before delete',
    showMarkdownPreview: 'Show markdown preview',
    rawXmlStrictMode: 'RawXML strict mode (v1 placeholder)',
    defaultRootTagEnabled: 'Default root tag enabled',
    defaultRootTagName: 'Default root tag name',
    templatesV1: 'Templates (v1)',
    templatesHint:
      'Template presets will be added in v1. Current MVP focuses on vault, stack editing, includes and export safety.',
    close: 'Close',
  },
  ko: {
    appTagline: 'XML 프롬프트용 컨텍스트 스택 편집기',
    navVault: '문서함',
    navIncludes: '포함 규칙',
    navTemplates: '템플릿',
    navSettings: '설정',
    saveSaving: '저장 중...',
    saveSaved: '저장됨 {time}',
    saveError: '저장 오류',
    saveIdle: '대기',
    noActiveDocument: '활성 문서 없음',
    loadingWorkspace: '작업공간 불러오는 중...',
    contextStack: '컨텍스트 스택',
    addNode: '노드 추가',
    searchTagOrContent: '태그 또는 내용 검색',
    dragNode: '노드 드래그',
    enableNode: '노드 활성화',
    collapseNode: '노드 접기',
    expandNode: '노드 펼치기',
    nodeMeta: '{mode} · 자식 {children}개 · {state}',
    stateEnabled: '활성',
    stateDisabled: '비활성',
    addChild: '자식 추가',
    duplicate: '복제',
    delete: '삭제',
    nodeEditor: '노드 편집기',
    documentMeta: '문서 메타 설정',
    showDocumentMeta: '문서 메타 설정 펼치기',
    hideDocumentMeta: '문서 메타 설정 접기',
    documentName: '문서 이름',
    tags: '태그',
    tagsPlaceholder: 'prompt, policy, baseline',
    rootTag: '루트 태그',
    selectNodeHint: '스택에서 노드를 선택하면 상세 편집이 가능합니다.',
    tagName: '태그 이름',
    xmlNameValidation: '태그 이름은 XML 이름 규칙을 따라야 합니다.',
    attributes: '속성',
    addAttribute: '속성 추가',
    removeAttribute: '제거',
    contentMode: '내용 모드',
    content: '내용',
    tokenEstimate: '약 {count} 토큰 (chars/4 기반의 대략치)',
    wrapSelection: '선택 영역 태그 감싸기',
    markdownPreview: '마크다운 미리보기 (raw)',
    previewExport: '미리보기 / 내보내기',
    copyXml: 'XML 복사',
    copyMarkdown: 'Markdown 복사',
    copyJson: 'JSON 복사',
    download: '다운로드',
    includeIncludes: 'Include 데이터 포함',
    includeSettings: '설정 포함',
    copied: '복사됨.',
    copyFailed: '복사 실패.',
    promptVault: '프롬프트 문서함',
    create: '생성',
    filters: '필터',
    documents: '문서 목록',
    createDocument: '문서 생성',
    searchNameOrTags: '문서 이름/태그 검색',
    tagFilter: '태그 필터',
    updatedAt: '수정됨 {time}',
    open: '열기',
    rename: '이름 변경',
    save: '저장',
    noTags: '태그 없음',
    confirmDeleteDocument: '"{name}" 문서를 삭제할까요?',
    globalIncludes: '전역 Include',
    addInclude: 'Include 추가',
    includeHint:
      'Include는 내보내기 단계에서만 삽입되며 원본 노드를 변경하지 않습니다.',
    useInActiveDocument: '활성 문서에 사용',
    description: '설명',
    targetTagName: 'targetTagName',
    includeTag: 'Include 태그',
    includeContent: 'Include 내용',
    settings: '설정',
    language: '언어',
    languageHint:
      '기본 언어는 영어이며, 최초 접속 시 한국어 브라우저 환경을 자동 감지합니다.',
    korean: '한국어',
    english: '영어',
    brandColor: '브랜드 색상',
    confirmBeforeDelete: '삭제 전에 확인',
    showMarkdownPreview: '마크다운 미리보기 표시',
    rawXmlStrictMode: 'RawXML 엄격 모드 (v1 예정)',
    defaultRootTagEnabled: '기본 루트 태그 사용',
    defaultRootTagName: '기본 루트 태그 이름',
    templatesV1: '템플릿 (v1)',
    templatesHint:
      '템플릿 프리셋은 v1에서 제공됩니다. 현재 MVP는 문서함, 스택 편집, includes, 안전한 내보내기에 집중합니다.',
    close: '닫기',
  },
};

export function detectPreferredLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const locales = navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];

  const hasKorean = locales.some((locale) => locale.toLowerCase().startsWith('ko'));
  return hasKorean ? 'ko' : 'en';
}

export function translateMessage(
  language: AppLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const base = messages[language][key] ?? messages.en[key];
  if (!params) {
    return base;
  }

  return Object.entries(params).reduce((text, [paramKey, value]) => {
    return text.replaceAll(`{${paramKey}}`, String(value));
  }, base);
}
