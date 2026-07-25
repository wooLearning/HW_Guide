# QA Record — PCB HW Design & Validation Guide

검증일: 2026-07-25

배포: [GitHub Pages](https://woolearning.github.io/HW_Guide/) · `main` 브랜치 루트

## 자동 검사

- 명령: `node --test tests/*.test.mjs`
- 결과: 39 passed, 0 failed
- 범위: 16장 구조와 학습 블록, 본문 분량, 로컬 런타임 자산, 검색/접근성 도구,
  32개 시각 자료와 매체 구성, 14개 공학 계산 경계값, 88개 용어, 21개 출처,
  교육용 SVG 제거, 로컬 Three.js 의존 파일, 인쇄용 UI 제거

## 실제 브라우저 검사

| 항목 | 확인 결과 |
|---|---|
| 기본 데스크톱 viewport | 가로 overflow 없음, 데스크톱 목차·장 rail sticky |
| 768 × 1024 | 가로 overflow 없음, 본문/시각화 정상 |
| 390 × 844 | 가로 overflow 없음, 모바일 메뉴 표시 및 목차 fixed |
| 렌더링 | 16장, 32개 visual panel, Canvas 14개, Three.js 4개, 로컬 PNG 11개, SVG 0개 |
| Three.js | 오프라인 core import, 4개 canvas, toolbar 4개·버튼 18개, WebGL fallback·reduced motion 확인 |
| 이미지 | 전자기학 장의 lazy-load 완료와 원본 자연 크기 확인 |
| 검색 | `리턴 전류` 검색 시 11개 결과 생성, 입력 필드에 초점 이동 |
| 테마 | light → dark 전환 및 접근성 label 변경 확인 |
| 글자 크기 | 1.00 → 1.05 → 1.00 변경 확인 |
| 학습 진도 | 0/16 → 1/16, 버튼/목차 상태 동기화 후 원상복구 |
| 계산 실험 | 전압분배기 RL=1 kΩ에서 1.67 V, −33.33% 표시 |
| 콘솔 | 실제 조작 전후 warning/error 0건 |

## 시각 및 인쇄 점검

- 데스크톱과 390 px 모바일 화면을 캡처해 헤더, 본문 가독성, 카드 간격, 컬러 도판,
  Three.js 프레이밍과 조작부 정렬을 확인했다.
- 모든 설명 카드는 중립 1 px 테두리와 둥근 모서리를 사용하며 색 세로선은 사용하지 않는다.
- 인쇄 media query가 고정 헤더, 목차, 읽기 도구, 진행 표시, 인터랙티브 입력부와
  장 완료 버튼을 제거하도록 자동 검사했다.
- 외부 폰트/CDN/라이브러리를 사용하지 않아 본문과 인터랙션은 오프라인에서 실행된다.

## 출처 점검

- IPC 설계 표준 목록과 revision table, IEC TR 61000-1-1, IEEE 370, eCFR Part 15,
  Tektronix, Texas Instruments, Analog Devices, Rohde & Schwarz의 공식 페이지/PDF를
  우선 사용했다.
- IEEE 370, TI SCAA082A, Rohde & Schwarz oscilloscope primer는 현재 열리는 canonical
  URL로 교정하고 회귀 검사를 추가했다.
- IPC-2152는 revision table의 `No Longer Maintained` 상태를 본문과 출처 설명에 함께 표시했다.

## 사용 범위

이 문서는 학습과 설계 검토를 위한 자료다. 안전, 법규, 인증, 제품 합격 판정에는 최신 적용
표준의 정식 판본, 부품/장비 매뉴얼, 공인 시험소와 조직의 승인 절차를 사용해야 한다.
