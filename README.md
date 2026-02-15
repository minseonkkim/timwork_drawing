# drowing-viewer

건설 도면 메타데이터(`metadata.json`)를 기반으로 도면을 탐색하고, 공종/리비전 컨텍스트를 확인할 수 있는 프로토타입입니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 기술 스택

- React 19
- TypeScript
- Vite
- Tailwind CSS

## 구현 기능

- [x] 도면 탐색을 지원합니다.
- [x] 도면 표시를 지원합니다.
- [x] 컨텍스트 인식(현재 도면/공종/영역/리비전)을 지원합니다.
- [x] 공종/영역/리비전 선택 탐색을 지원합니다.
- [x] 리비전 최신 자동 선택 및 이력 탐색을 지원합니다.
- [x] 공종 겹쳐보기(오버레이)와 투명도 조절을 지원합니다.
- [x] 폴리곤/영역 시각화를 지원합니다.
- [x] 배치도 기반 공간 선택(전체 배치도에서 건물 클릭 진입)을 지원합니다.
- [x] 뷰어 인터랙션(드래그 팬, 마우스 휠 줌, 도면 변경 시 중앙 정렬)을 지원합니다.
- [x] 도면 로딩 오버레이 표시를 지원합니다.
- [x] 우측 컨텍스트 패널 열기/닫기를 지원합니다.

## 미완성 기능

- [x] 필수 요구사항 기준 미완성 기능은 없습니다.

## 프로젝트 구조

```text
src/
  components/
    DrawingSidebar.tsx
    RootEntryView.tsx
    SiteMapNavigator.tsx
    TopControls.tsx
    DrawingViewer.tsx
    ContextPanel.tsx
  lib/
    metadata.ts
  types/
    metadata.ts
  App.tsx
```

## 참고

- 현재 레이아웃은 데스크톱 사용성에 맞춘 고정 3열 구조입니다.
- 데이터 파일은 `public/data/metadata.json`, 이미지 파일은 `public/data/drawings/`를 사용합니다.
