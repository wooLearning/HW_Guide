# Source-backed Content Expansion Plan

## 목표

현재 16개 장을 단순 개요가 아니라 전공책을 읽는 흐름으로 확장한다. 각 장은
정의와 식을 나열하는 데서 끝나지 않고, 가정·유도·수치 예제·PCB 설계 연결·측정 검증까지
한 번에 설명한다.

## 공통 완료 기준

- 핵심 절마다 `직관 → 모델과 가정 → 식 유도 → 단위·극한 점검 → PCB 의미 → 측정법` 순서를 갖는다.
- 장마다 최소 2개 worked example, 1개 오개념 교정, 1개 설계/측정 의사결정 표를 둔다.
- 중요한 수치·규칙·표준 상태는 절 단위 출처 링크를 갖는다.
- 공개강의·교재·공식 표준/제조사 자료 중 둘 이상의 층위로 교차검증한다.
- 검색 인덱스와 glossary에 새 용어를 반영하고 모든 로컬·외부 링크를 검사한다.

## 진행 순서

1. 00–05장: 회로 모델, 보존법칙, 과도응답, 주파수, 공진, 실제 부품
2. 06–07장: Maxwell 방정식, 경계조건, Poynting vector, 전송선로와 반사
3. 08–12장: 재료·stackup·via, return path, SI, PDN, EMC
4. 13–15장: scope architecture, probe loading, bring-up와 fault isolation
5. 공식·용어·체크리스트·출처 페이지 동기화

## 우선 출처

- MIT OpenCourseWare 6.002, 8.02
- OpenStax University Physics Volume 2
- Eric Bogatin, *Signal and Power Integrity—Simplified*
- Henry Ott, *Electromagnetic Compatibility Engineering*
- IPC design standards, IEEE 370, IEC EMC publications
- Tektronix, Keysight, TI, Analog Devices 공식 primer/application note

## 검증

각 part 완료 시 빌드·테스트·브라우저 읽기 QA를 수행하고, 식의 차원·극한값·대표 수치를
별도 test case로 고정한다.
