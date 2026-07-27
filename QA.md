# QA Record — PCB HW Design & Validation Guide

검증일: 2026-07-27

검증 기준 커밋: `80b16fd` 이후 문서화 커밋 전 상태

배포 대상: `main` 브랜치 루트 → GitHub Pages

## 자동 검사

- `npm run check`: 빌드 성공, 55 passed, 0 failed
- 생성물: 홈 1개, 장 16개, 참고자료 4개, 검색 항목 45개
- `git diff --check`: whitespace 오류 없음
- 검증 범위: 메타데이터, 장 순서, 공통 학습 블록, 로컬 링크, 장 이동 경계,
  검색 인덱스, 진행률 계약, 공학 계산, Canvas·Three.js 연결, 로컬 자산과 글꼴

## 실제 브라우저 검사

| 항목 | 결과 |
|---|---|
| 1536 × 1024 홈 | 큰 제목과 CTA 계층 정상, 가로 overflow 없음 |
| 1536 × 1024 14장 | 좌측 목차·46rem 본문·우측 context rail 정상, 컬러 도판 우선순위 확인 |
| 834 × 1194 | 목차+본문 2열, rail은 본문 뒤 3열로 이동, 이미지 crop·가로 overflow 없음 |
| 390 × 844 | 단일 본문, 목차 drawer 열기/닫기 정상, 이미지·제목·캡션 crop 없음 |
| 학습 진행 | `0/16 → 1/16`, 새로고침 후 `1/16` 유지 |
| 전체 검색 | “전자기학” 검색으로 6장 5개 절 노출, `#section-06-1` 딥링크 도달 |
| 장 이동 | 6장→7장, 7장→6장 이전/다음 링크 정상 |
| 명암 | light→dark 전환, 접근성 label 갱신 후 light 복귀 |
| 글자 크기 | 17px→17.85px(1.05)→17px 복귀 |
| Canvas | 14장 계산 plot이 실제 canvas로 렌더링되고 크기 0이 아님 |
| Three.js | 로컬 Three.js canvas 생성, 회전·애니메이션·lead/spring 조작부 활성 |
| 이미지 | ImageGen 도판 1672px 원본 로드, lazy 기술도해 1536px 로드 |
| 콘솔 | 전체 조작 전후 warning/error 0건 |

## 승인 시안 대조

`docs/design/2026-07-27-approved-chapter-layout.png`와 구현 화면을 같은
1536 × 1024 상태로 나란히 비교했다.

- 큰 serif 장 제목과 파란 chapter kicker의 위계가 유지된다.
- 읽기 폭은 46rem로 제한되어 본문 행 길이가 안정적이다.
- 긴 접지선/스프링 접지 비교 도판이 정량 조작보다 먼저 나온다.
- 좌측 목차와 우측 핵심 용어·bench check·출처 rail이 본문을 보조한다.
- 중립 배경, 얇은 회색 구분선, 제한된 파란 포인트를 사용한다.
- 설명 상자의 색 세로선과 불필요한 카드 중첩은 없다.

세부 시각 판정은 `design-qa.md`에 기록했다.

## 알려진 후속 작업

- 이번 판은 멀티페이지 읽기 시스템과 14장 심화를 완성한 foundation이다.
- 16개 장 전체의 교재 수준 유도·worked example·section citation 확장은
  `docs/superpowers/plans/2026-07-27-content-expansion.md`에서 이어간다.
- 전자기학·전송선로·PDN·EMC의 새 정적 teaching plate와 저가치 interaction 정리는
  `docs/superpowers/plans/2026-07-27-scientific-visuals.md`에서 이어간다.

## 사용 범위

이 문서는 학습과 설계 검토를 위한 자료다. 안전, 법규, 인증, 제품 합격 판정에는 최신
적용 표준의 정식 판본, 부품·장비 매뉴얼, 공인 시험소와 조직의 승인 절차를 사용해야 한다.
