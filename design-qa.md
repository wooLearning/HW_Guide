# Design QA — 2026-07-27

## 판정

PASS

## 비교 대상

- 승인 시안: `docs/design/2026-07-27-approved-chapter-layout.png`
- 구현: `chapters/14-probing-and-measurement.html`
- 공통 viewport: 1536 × 1024
- 로컬 비교 캡처: `.audit/design-comparison.png` (`.audit/`는 커밋 제외)

## 확인 결과

- 구조: 좌측 목차, 제한된 읽기 열, 우측 정보 rail의 3열 관계가 유지된다.
- 타이포그래피: Noto Serif KR 장 제목과 Pretendard 본문 대비가 분명하다.
- 정보 위계: chapter kicker → 제목·thesis → 정적 비교 plate → 식 → 인과관계 → 실험 순서다.
- 도판: 긴 ground lead와 spring ground가 한눈에 비교되고 캡션만으로 색 의미를 이해할 수 있다.
- 밀도: 시안보다 첫 화면의 설명 호흡을 늘렸지만 읽기 폭과 plate 우선순위는 유지했다.
- 표면: 카드 남용, 색 세로선, 과도한 그림자 없이 회색 rule과 제한된 파란 포인트를 사용한다.
- 반응형: 834px와 390px에서 제목·도판·캡션이 잘리지 않고 가로 overflow가 없다.
- 상호작용: 진행률, 검색 딥링크, 이전/다음, drawer, 테마, 글자 크기, Canvas와 Three.js가 작동한다.
- 런타임: 브라우저 warning/error 0건.

## 비고

승인 시안은 한 화면에 더 많은 내용을 압축한 방향 제안이었고, 구현은 실제 장문의
가이드북 읽기와 접근성을 위해 본문 크기와 세로 호흡을 우선했다. 핵심 배치, 타이포그래피,
도판 우선순위와 neutral Apple-like tone은 일치한다.
