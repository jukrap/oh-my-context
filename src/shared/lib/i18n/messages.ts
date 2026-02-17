export type AppLanguage = 'en' | 'ko';

export type TranslationKey =
  | 'appTagline'
  | 'navVault'
  | 'navIncludes'
  | 'navTemplates'
  | 'navSettings'
  | 'mobilePanelStack'
  | 'mobilePanelEditor'
  | 'mobilePanelPreview'
  | 'saveSaving'
  | 'saveSaved'
  | 'saveError'
  | 'saveIdle'
  | 'noActiveDocument'
  | 'loadingWorkspace'
  | 'contextStack'
  | 'addNode'
  | 'recommendedTags'
  | 'recommendedInstructionDesc'
  | 'recommendedConstraintsDesc'
  | 'recommendedContextDesc'
  | 'recommendedExamplesDesc'
  | 'recommendedOutputFormatDesc'
  | 'recommendedChecklistDesc'
  | 'addAtRoot'
  | 'addToSelected'
  | 'defaultLabel'
  | 'selectNodeFirst'
  | 'selectAddTag'
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
  | 'documentLabels'
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
  | 'vaultTransfer'
  | 'vaultExportOptions'
  | 'vaultExportOptionsHelp'
  | 'importDocument'
  | 'exportDocument'
  | 'applySettingsOnImport'
  | 'vaultImported'
  | 'vaultImportedWithoutSettings'
  | 'vaultExported'
  | 'vaultImportFailed'
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
  | 'confirmBeforeDelete'
  | 'showMarkdownPreview'
  | 'rawXmlStrictMode'
  | 'defaultRootTagEnabled'
  | 'defaultRootTagName'
  | 'templatesV1'
  | 'templatesHint'
  | 'templateLibrary'
  | 'templateKindLabel'
  | 'templateNodeCountLabel'
  | 'templateApplyToActive'
  | 'templateCreateDocument'
  | 'templateApplyToActiveHint'
  | 'templateCreateDocumentHint'
  | 'templateActiveDocumentRequired'
  | 'templateXmlBaselineName'
  | 'templateXmlBaselineDescription'
  | 'templateXmlStrictOutputName'
  | 'templateXmlStrictOutputDescription'
  | 'templateRawXmlFragmentName'
  | 'templateRawXmlFragmentDescription'
  | 'templateChatMessagesStarterName'
  | 'templateChatMessagesStarterDescription'
  | 'hintResizeContextStack'
  | 'hintResizePreviewExport'
  | 'hintNavVault'
  | 'hintNavIncludes'
  | 'hintNavTemplates'
  | 'hintNavSettings'
  | 'hintFieldTagName'
  | 'hintFieldAttributes'
  | 'hintFieldContentMode'
  | 'hintFieldContent'
  | 'hintWrapSelection'
  | 'contentModePlainDesc'
  | 'contentModeMarkdownDesc'
  | 'contentModeRawXmlDesc'
  | 'hintDocumentName'
  | 'hintDocumentLabels'
  | 'hintRootTag'
  | 'hintJsonIncludeIncludes'
  | 'hintJsonIncludeSettings'
  | 'includesLibrary'
  | 'includesAssignment'
  | 'includesLabelName'
  | 'includesLabelDescription'
  | 'includesLabelInsertionRule'
  | 'includesLabelIncludeNode'
  | 'hintIncludesLibrary'
  | 'hintIncludesAssignment'
  | 'hintIncludeName'
  | 'hintIncludeDescription'
  | 'hintInsertionRule'
  | 'hintTargetTag'
  | 'hintIncludeNode'
  | 'hintDeleteInclude'
  | 'hintSettingsLanguage'
  | 'hintSettingsConfirmBeforeDelete'
  | 'hintSettingsMarkdownPreview'
  | 'hintSettingsRawXmlStrictMode'
  | 'hintSettingsDefaultRootTagEnabled'
  | 'hintSettingsDefaultRootTagName'
  | 'kindAllLabel'
  | 'kindAllDescription'
  | 'kindXmlStackLabel'
  | 'kindXmlStackDescription'
  | 'kindMarkdownDocLabel'
  | 'kindMarkdownDocDescription'
  | 'kindRawXmlLabel'
  | 'kindRawXmlDescription'
  | 'kindChatJsonLabel'
  | 'kindChatJsonDescription'
  | 'vaultLabelKind'
  | 'vaultLabelLabels'
  | 'vaultLabelUpdated'
  | 'hintVaultCreate'
  | 'hintVaultFilters'
  | 'hintVaultDocuments'
  | 'hintVaultKind'
  | 'hintVaultTags'
  | 'hintVaultUpdatedAt'
  | 'hintVaultOpen'
  | 'hintVaultRename'
  | 'hintVaultDuplicate'
  | 'hintVaultTransfer'
  | 'hintVaultImport'
  | 'hintVaultExport'
  | 'hintVaultExportOptions'
  | 'hintVaultDelete'
  | 'close';

type TranslationMap = Record<TranslationKey, string>;

const messages: Record<AppLanguage, TranslationMap> = {
  en: {
    appTagline: 'Context Stack Editor for XML Prompts',
    navVault: 'Vault',
    navIncludes: 'Includes',
    navTemplates: 'Templates',
    navSettings: 'Settings',
    mobilePanelStack: 'Stack',
    mobilePanelEditor: 'Editor',
    mobilePanelPreview: 'Preview',
    saveSaving: 'Saving...',
    saveSaved: '{time} saved',
    saveError: 'Error',
    saveIdle: 'Idle',
    noActiveDocument: 'No active document',
    loadingWorkspace: 'Loading workspace...',
    contextStack: 'Context Stack',
    addNode: 'Add Node',
    recommendedTags: 'Recommended Tags',
    recommendedInstructionDesc: 'Primary task and objective for the model.',
    recommendedConstraintsDesc: 'Safety, tone, and guardrail constraints.',
    recommendedContextDesc: 'Background facts and user context.',
    recommendedExamplesDesc: 'Few-shot examples for style and structure.',
    recommendedOutputFormatDesc: 'Required response format or schema.',
    recommendedChecklistDesc: 'Final checks before finishing the answer.',
    addAtRoot: 'Add At Root',
    addToSelected: 'Add To Selected',
    defaultLabel: 'Default',
    selectNodeFirst: 'Select a node first',
    selectAddTag: 'Select add tag',
    searchTagOrContent: 'Search tag or content',
    dragNode: 'Drag node',
    enableNode: 'Enable node',
    collapseNode: 'Collapse node',
    expandNode: 'Expand node',
    nodeMeta: '{mode} | {children} children | {state}',
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
    documentLabels: 'Document Labels',
    tags: 'Tags',
    tagsPlaceholder: 'policy, baseline, projectA',
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
    markdownPreview: 'Markdown Preview',
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
    vaultTransfer: 'Import',
    vaultExportOptions: 'Export Options',
    vaultExportOptionsHelp:
      'These options are applied when you click Export Document on each row.',
    importDocument: 'Import Document',
    exportDocument: 'Export Document',
    applySettingsOnImport: 'Apply settings on import',
    vaultImported: 'Document imported.',
    vaultImportedWithoutSettings:
      'Document imported, but no settings were found in this file.',
    vaultExported: 'Document exported.',
    vaultImportFailed: 'Import failed. Check JSON format.',
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
    confirmBeforeDelete: 'Confirm before delete',
    showMarkdownPreview: 'Show markdown preview',
    rawXmlStrictMode: 'RawXML strict mode',
    defaultRootTagEnabled: 'Default root tag enabled',
    defaultRootTagName: 'Default root tag name',
    templatesV1: 'Templates',
    templatesHint:
      'Use a starter template, then apply it to the active document or create a new document from it.',
    templateLibrary: 'Template Library',
    templateKindLabel: 'Kind',
    templateNodeCountLabel: 'Nodes',
    templateApplyToActive: 'Apply To Active',
    templateCreateDocument: 'Create Document',
    templateApplyToActiveHint:
      'Replace active document structure with this template.',
    templateCreateDocumentHint:
      'Create a new document initialized with this template.',
    templateActiveDocumentRequired:
      'Open or create a document first, then apply template.',
    templateXmlBaselineName: 'XML Baseline Prompt',
    templateXmlBaselineDescription:
      'General-purpose XML prompt with role, task, context, constraints and output format.',
    templateXmlStrictOutputName: 'XML Strict Output Prompt',
    templateXmlStrictOutputDescription:
      'Focused on deterministic and schema-shaped output requirements.',
    templateRawXmlFragmentName: 'Raw XML Fragment Prompt',
    templateRawXmlFragmentDescription:
      'Starter template for workflows that inject raw XML fragments.',
    templateChatMessagesStarterName: 'Chat Messages Starter',
    templateChatMessagesStarterDescription:
      'Role/content style starter for chat-messages JSON workflows.',
    hintResizeContextStack: 'Drag horizontally to resize Context Stack width.',
    hintResizePreviewExport: 'Drag horizontally to resize Preview / Export width.',
    hintNavVault: 'Manage documents: create, search, filter and switch.',
    hintNavIncludes:
      'Manage global include blocks inserted automatically at export time.',
    hintNavTemplates: 'Browse and apply reusable prompt templates.',
    hintNavSettings:
      'Manage workspace options such as language and preview defaults.',
    hintFieldTagName: 'XML tag name. Invalid names block export.',
    hintFieldAttributes:
      'Attribute keys must follow XML name rules. Values are stored as strings.',
    hintFieldContentMode:
      'Choose how this node content is handled: Plain, Markdown or RawXML.',
    hintFieldContent:
      'Node body content. Special characters are safely handled during export.',
    hintWrapSelection:
      'Wrap currently selected text in the content area with the tag you entered.',
    contentModePlainDesc:
      'General text mode. Export wraps content safely with CDATA.',
    contentModeMarkdownDesc:
      'Markdown-aware text mode. Optional preview is shown below when enabled.',
    contentModeRawXmlDesc:
      'Injects raw XML fragment as-is. Invalid XML may break export output.',
    hintDocumentName: 'Used to identify this document in the vault.',
    hintDocumentLabels:
      'Labels for search and filtering. Separate multiple values with commas.',
    hintRootTag:
      'Top-level tag wrapping the exported tree. Useful when a single XML root is required.',
    hintJsonIncludeIncludes:
      'Include global include definitions in JSON export output.',
    hintJsonIncludeSettings:
      'Include workspace settings in JSON export output.',
    includesLibrary: 'Include Library',
    includesAssignment: 'Document Assignment',
    includesLabelName: 'Name',
    includesLabelDescription: 'Description',
    includesLabelInsertionRule: 'Insertion Rule',
    includesLabelIncludeNode: 'Include Node',
    hintIncludesLibrary:
      'Manage global include blocks that are injected during export.',
    hintIncludesAssignment:
      'Choose which includes are enabled for the currently active document.',
    hintIncludeName: 'Display name used to identify this include preset.',
    hintIncludeDescription: 'Short purpose note to make reuse easier.',
    hintInsertionRule:
      'Placement rule such as TOP/BOTTOM. Advanced positions are v1 extensions.',
    hintTargetTag: 'Target tag name used when insertion is tag-relative.',
    hintIncludeNode: 'Actual tag/content node inserted during export.',
    hintDeleteInclude: 'Delete this include preset.',
    hintSettingsLanguage:
      'Switch the app UI language. Browser locale is applied only on first visit.',
    hintSettingsConfirmBeforeDelete:
      'Show a confirmation dialog before deleting documents.',
    hintSettingsMarkdownPreview:
      'Show markdown preview in Node Editor when content mode is Markdown.',
    hintSettingsRawXmlStrictMode:
      'When enabled, RawXML node content is parsed as XML fragments during preview/export. Invalid fragments block XML export.',
    hintSettingsDefaultRootTagEnabled:
      'Enable root tag by default for newly created documents.',
    hintSettingsDefaultRootTagName:
      'Default root tag name used for new documents.',
    kindAllLabel: 'All Kinds',
    kindAllDescription: 'Show documents of every kind in the list.',
    kindXmlStackLabel: 'XML Stack Prompt',
    kindXmlStackDescription:
      'Default tree-based prompt type optimized for safe XML export.',
    kindMarkdownDocLabel: 'Markdown Document',
    kindMarkdownDocDescription:
      'Markdown-focused document type for structured instructions and notes.',
    kindRawXmlLabel: 'Raw XML',
    kindRawXmlDescription:
      'RawXML-oriented document type for directly managed XML fragments.',
    kindChatJsonLabel: 'Chat Messages JSON',
    kindChatJsonDescription:
      'Best suited for role/content style message-array prompt formats.',
    vaultLabelKind: 'Kind',
    vaultLabelLabels: 'Labels',
    vaultLabelUpdated: 'Updated',
    hintVaultCreate:
      'Create a new prompt document with name, kind and tags.',
    hintVaultFilters: 'Narrow documents quickly by name, tag and kind.',
    hintVaultDocuments: 'Documents sorted by most recently updated.',
    hintVaultKind: 'Document format category.',
    hintVaultTags: 'Document labels used for search and grouping.',
    hintVaultUpdatedAt: 'Last saved timestamp of this document.',
    hintVaultOpen: 'Switch this document as the active editor target.',
    hintVaultRename: 'Edit document display name.',
    hintVaultDuplicate: 'Clone this document into a new one.',
    hintVaultTransfer:
      'Import shared document bundles. Export is available per document row.',
    hintVaultImport: 'Import one document bundle JSON file.',
    hintVaultExport:
      'Export this document as a shareable JSON bundle.',
    hintVaultExportOptions:
      'Controls what data is included in JSON when exporting from a document row.',
    hintVaultDelete:
      'Delete this document. A confirmation may appear depending on settings.',
    close: 'Close',
  },
  ko: {
    appTagline: 'XML 프롬프트용 컨텍스트 스택 에디터',
    navVault: '문서함',
    navIncludes: '전역 포함',
    navTemplates: '템플릿',
    navSettings: '설정',
    mobilePanelStack: '스택',
    mobilePanelEditor: '편집',
    mobilePanelPreview: '미리보기',
    saveSaving: '저장 중...',
    saveSaved: '{time} 저장됨',
    saveError: '저장 오류',
    saveIdle: '대기',
    noActiveDocument: '활성 문서 없음',
    loadingWorkspace: '작업 공간 불러오는 중...',
    contextStack: '컨텍스트 스택',
    addNode: '노드 추가',
    recommendedTags: '권장 태그',
    recommendedInstructionDesc: '모델이 수행할 핵심 작업과 목적',
    recommendedConstraintsDesc: '안전, 톤, 제약 조건',
    recommendedContextDesc: '배경 정보와 사용자 맥락',
    recommendedExamplesDesc: '스타일 유도를 위한 예시',
    recommendedOutputFormatDesc: '출력 포맷 또는 스키마 요구사항',
    recommendedChecklistDesc: '최종 답변 전 확인 항목',
    addAtRoot: '루트에 추가',
    addToSelected: '선택 노드에 추가',
    defaultLabel: '기본',
    selectNodeFirst: '먼저 노드를 선택하세요',
    selectAddTag: '추가 태그 선택',
    searchTagOrContent: '태그 또는 내용 검색',
    dragNode: '노드 드래그',
    enableNode: '노드 활성화',
    collapseNode: '노드 접기',
    expandNode: '노드 펼치기',
    nodeMeta: '{mode} | 자식 {children}개 | {state}',
    stateEnabled: '활성',
    stateDisabled: '비활성',
    addChild: '자식 추가',
    duplicate: '복제',
    delete: '삭제',
    nodeEditor: '노드 편집기',
    documentMeta: '문서 메타',
    showDocumentMeta: '문서 메타 설정 열기',
    hideDocumentMeta: '문서 메타 설정 닫기',
    documentName: '문서 이름',
    documentLabels: '문서 분류 라벨',
    tags: '태그',
    tagsPlaceholder: '정책, 기준, 프로젝트A',
    rootTag: '루트 태그',
    selectNodeHint: '스택에서 노드를 선택하면 상세 편집이 가능합니다.',
    tagName: '태그 이름',
    xmlNameValidation: '태그 이름은 XML 이름 규칙을 따라야 합니다.',
    attributes: '속성',
    addAttribute: '속성 추가',
    removeAttribute: '삭제',
    contentMode: '내용 모드',
    content: '내용',
    tokenEstimate: '약 {count} 토큰 (chars/4 기반 추정)',
    wrapSelection: '선택 영역 태그로 감싸기',
    markdownPreview: '마크다운 미리보기',
    previewExport: '미리보기 / 내보내기',
    copyXml: 'XML 복사',
    copyMarkdown: 'Markdown 복사',
    copyJson: 'JSON 복사',
    download: '다운로드',
    includeIncludes: '전역 포함 데이터 포함',
    includeSettings: '설정 포함',
    copied: '복사됨.',
    copyFailed: '복사 실패.',
    promptVault: '프롬프트 문서함',
    create: '생성',
    filters: '필터',
    documents: '문서 목록',
    vaultTransfer: '가져오기',
    vaultExportOptions: '내보내기 옵션',
    vaultExportOptionsHelp:
      '아래 옵션은 각 문서 행의 문서 내보내기 버튼을 누를 때 적용됩니다.',
    importDocument: '문서 가져오기',
    exportDocument: '문서 내보내기',
    applySettingsOnImport: '가져오기 시 설정 적용',
    vaultImported: '문서를 가져왔습니다.',
    vaultImportedWithoutSettings:
      '문서는 가져왔지만, 파일에 설정이 없어 설정 적용은 건너뛰었습니다.',
    vaultExported: '문서를 내보냈습니다.',
    vaultImportFailed: '가져오기에 실패했습니다. JSON 형식을 확인하세요.',
    createDocument: '문서 생성',
    searchNameOrTags: '문서 이름/태그 검색',
    tagFilter: '태그 필터',
    updatedAt: '수정됨 {time}',
    open: '열기',
    rename: '이름 변경',
    save: '저장',
    noTags: '태그 없음',
    confirmDeleteDocument: '"{name}" 문서를 삭제할까요?',
    globalIncludes: '전역 포함 블록',
    addInclude: '포함 블록 추가',
    includeHint:
      '전역 포함 블록은 내보내기 단계에서만 삽입되며 원본 노드를 변경하지 않습니다.',
    useInActiveDocument: '활성 문서에서 사용',
    description: '설명',
    targetTagName: 'targetTagName',
    includeTag: '포함 블록 태그',
    includeContent: '포함 블록 내용',
    settings: '설정',
    language: '언어 (Language)',
    languageHint:
      '기본 언어는 영어이며, 첫 접속 시 브라우저 언어를 자동 감지합니다.',
    korean: '한국어 (Korean)',
    english: '영어 (English)',
    confirmBeforeDelete: '삭제 전 확인',
    showMarkdownPreview: '마크다운 미리보기 표시',
    rawXmlStrictMode: 'RawXML 엄격 모드',
    defaultRootTagEnabled: '기본 루트 태그 사용',
    defaultRootTagName: '기본 루트 태그 이름',
    templatesV1: '템플릿',
    templatesHint:
      '시작 템플릿을 선택한 뒤 활성 문서에 적용하거나 새 문서를 템플릿으로 생성할 수 있습니다.',
    templateLibrary: '템플릿 라이브러리',
    templateKindLabel: '종류',
    templateNodeCountLabel: '노드 수',
    templateApplyToActive: '활성 문서에 적용',
    templateCreateDocument: '새 문서 생성',
    templateApplyToActiveHint:
      '현재 활성 문서 구조를 이 템플릿으로 교체합니다.',
    templateCreateDocumentHint:
      '이 템플릿으로 초기화된 새 문서를 생성합니다.',
    templateActiveDocumentRequired:
      '먼저 문서를 열거나 생성한 뒤 템플릿을 적용하세요.',
    templateXmlBaselineName: 'XML 기본 프롬프트',
    templateXmlBaselineDescription:
      'role, task, context, constraints, output_format으로 구성된 범용 XML 템플릿입니다.',
    templateXmlStrictOutputName: 'XML 엄격 출력 프롬프트',
    templateXmlStrictOutputDescription:
      '결과 형식 고정과 스키마 중심 출력을 요구하는 템플릿입니다.',
    templateRawXmlFragmentName: 'Raw XML 조각 프롬프트',
    templateRawXmlFragmentDescription:
      'Raw XML 조각 삽입 워크플로에 맞춘 시작 템플릿입니다.',
    templateChatMessagesStarterName: '채팅 메시지 시작 템플릿',
    templateChatMessagesStarterDescription:
      'role/content 기반 채팅 메시지 JSON 워크플로 시작 템플릿입니다.',
    hintResizeContextStack: '좌우로 드래그해 Context Stack 너비를 조절합니다.',
    hintResizePreviewExport: '좌우로 드래그해 Preview / Export 너비를 조절합니다.',
    hintNavVault: '문서 생성, 검색, 필터, 전환을 관리합니다.',
    hintNavIncludes: '내보내기 시 자동 삽입되는 전역 Include를 관리합니다.',
    hintNavTemplates: '재사용 가능한 프롬프트 템플릿을 둘러보고 적용합니다.',
    hintNavSettings: '언어와 미리보기 기본값 등 작업 공간 설정을 관리합니다.',
    hintFieldTagName: 'XML 태그 이름입니다. 잘못된 이름이면 내보내기가 차단됩니다.',
    hintFieldAttributes:
      '속성 키는 XML 이름 규칙을 따라야 하며 값은 문자열로 저장됩니다.',
    hintFieldContentMode:
      '노드 내용을 처리하는 방식(Plain, Markdown, RawXML)을 선택합니다.',
    hintFieldContent:
      '노드 본문 내용입니다. 특수문자는 내보내기 시 안전하게 처리됩니다.',
    hintWrapSelection:
      '내용 입력창에서 선택한 텍스트를 입력한 태그로 즉시 감쌉니다.',
    contentModePlainDesc:
      '일반 텍스트 모드입니다. 내보내기 시 CDATA로 안전하게 직렬화됩니다.',
    contentModeMarkdownDesc:
      '마크다운 문법을 사용하는 모드입니다. 설정에 따라 미리보기를 표시합니다.',
    contentModeRawXmlDesc:
      'Raw XML 조각을 그대로 삽입하는 모드입니다. 잘못된 XML은 출력을 깨뜨릴 수 있습니다.',
    hintDocumentName: '문서함에서 식별하기 위한 문서 이름입니다.',
    hintDocumentLabels:
      '검색과 분류에 쓰는 라벨입니다. 여러 값은 쉼표로 구분해 입력합니다.',
    hintRootTag:
      '내보내기 결과 전체를 감싸는 최상위 태그입니다. 단일 XML 루트가 필요할 때 사용합니다.',
    hintJsonIncludeIncludes:
      'JSON 보기/내보내기에 전역 Include 정의를 함께 포함합니다.',
    hintJsonIncludeSettings:
      'JSON 보기/내보내기에 작업 공간 설정 값을 함께 포함합니다.',
    includesLibrary: 'Include 라이브러리',
    includesAssignment: '문서 적용',
    includesLabelName: '이름',
    includesLabelDescription: '설명',
    includesLabelInsertionRule: '삽입 규칙',
    includesLabelIncludeNode: '삽입 노드',
    hintIncludesLibrary:
      '내보내기 시 자동 삽입되는 전역 Include 블록을 관리합니다.',
    hintIncludesAssignment:
      '현재 활성 문서에 어떤 Include를 적용할지 선택합니다.',
    hintIncludeName: 'Include 프리셋을 구분하기 위한 표시 이름입니다.',
    hintIncludeDescription: '재사용 목적을 짧게 기록해 둡니다.',
    hintInsertionRule:
      'TOP/BOTTOM 같은 삽입 위치 규칙입니다. 고급 위치는 v1 확장입니다.',
    hintTargetTag: '태그 기준 삽입에서 사용할 대상 태그 이름입니다.',
    hintIncludeNode: '내보내기 시 삽입되는 실제 태그/내용입니다.',
    hintDeleteInclude: '이 Include 프리셋을 삭제합니다.',
    hintSettingsLanguage:
      '앱 UI 언어를 전환합니다. 브라우저 언어는 첫 방문 시 기본값으로만 반영됩니다.',
    hintSettingsConfirmBeforeDelete:
      '문서 삭제 전에 확인 대화상자를 표시합니다.',
    hintSettingsMarkdownPreview:
      'Node Editor에서 Markdown 모드일 때 미리보기를 표시합니다.',
    hintSettingsRawXmlStrictMode:
      '활성화하면 RawXML 노드 내용을 미리보기/내보내기 시 XML 조각으로 파싱 검사합니다. 잘못된 조각이 있으면 XML 내보내기를 차단합니다.',
    hintSettingsDefaultRootTagEnabled:
      '새 문서 생성 시 루트 태그를 기본 활성화합니다.',
    hintSettingsDefaultRootTagName:
      '새 문서에서 사용할 기본 루트 태그 이름입니다.',
    kindAllLabel: '전체 종류',
    kindAllDescription: '모든 문서 종류를 목록에 표시합니다.',
    kindXmlStackLabel: 'XML 스택 프롬프트',
    kindXmlStackDescription:
      '트리 기반 편집과 안전한 XML 내보내기에 최적화된 기본 문서 타입입니다.',
    kindMarkdownDocLabel: '마크다운 문서',
    kindMarkdownDocDescription:
      '설명/지침 중심의 마크다운 문서 작성에 적합한 타입입니다.',
    kindRawXmlLabel: 'Raw XML',
    kindRawXmlDescription:
      'XML 조각을 직접 관리해야 할 때 사용하는 타입입니다.',
    kindChatJsonLabel: '채팅 메시지 JSON',
    kindChatJsonDescription:
      'role/content 배열 기반 프롬프트 관리에 적합한 타입입니다.',
    vaultLabelKind: '종류',
    vaultLabelLabels: '라벨',
    vaultLabelUpdated: '수정',
    hintVaultCreate:
      '이름, 종류, 태그를 지정해 새 프롬프트 문서를 생성합니다.',
    hintVaultFilters:
      '이름/태그/종류 필터로 문서를 빠르게 좁혀 찾습니다.',
    hintVaultDocuments: '최근 수정 순으로 정렬된 문서 목록입니다.',
    hintVaultKind: '문서 형식 분류입니다.',
    hintVaultTags: '검색과 그룹화에 쓰는 문서 라벨입니다.',
    hintVaultUpdatedAt: '문서가 마지막으로 저장된 시각입니다.',
    hintVaultOpen: '이 문서를 현재 편집 대상으로 전환합니다.',
    hintVaultRename: '문서 표시 이름을 수정합니다.',
    hintVaultDuplicate: '문서를 복제해 새 문서를 만듭니다.',
    hintVaultTransfer:
      '공유용 문서 번들을 가져옵니다. 내보내기는 각 문서 행에서 사용할 수 있습니다.',
    hintVaultImport: '문서 번들 JSON 파일 1개를 가져옵니다.',
    hintVaultExport:
      '이 문서를 공유 가능한 JSON 번들로 내보냅니다.',
    hintVaultExportOptions:
      '문서 행에서 내보낼 때 JSON에 어떤 데이터를 포함할지 제어합니다.',
    hintVaultDelete:
      '문서를 삭제합니다. 설정에 따라 확인 창이 나타날 수 있습니다.',
    close: '닫기',
  },
};

export function detectPreferredLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const locales =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  const hasKorean = locales.some((locale) =>
    locale.toLowerCase().startsWith('ko'),
  );
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
