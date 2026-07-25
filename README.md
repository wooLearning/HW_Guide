# PCB HW Design & Validation Guide

회로이론에서 전자기학, PCB 물리 구조, Signal/Power Integrity, EMC, 오실로스코프와
보드 bring-up까지 연결하는 한국어 HTML 가이드북입니다. 특정 OJT 요령보다 원리,
수치 감각, 측정 한계와 검증 사고방식을 오래 참고할 수 있도록 구성했습니다.

## 바로 열기

배포본: [https://woolearning.github.io/HW_Guide/](https://woolearning.github.io/HW_Guide/)

`index.html`을 더블클릭하면 네트워크 연결이나 설치 없이 읽을 수 있습니다.

로컬 웹 서버에서 보려면 이 폴더에서 다음 중 하나를 실행합니다.

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8765/`를 엽니다.

## 포함된 기능

- 5부 16장과 공식·단위 치트시트
- 회로·전자기장·전송선로·PCB·SI/PI/EMC·계측·검증의 연속 학습 경로
- 32개 시각 자료: Canvas 계산 실험 14개, Three.js 3D 4개, 과학 이미지·기술 도해 11개, semantic HTML 3개
- 전자기학·전송선로·귀환·PDN·EMC·계측의 7개 원리 심화 섹션
- 전체 본문 검색: 상단 검색 버튼 또는 `/`
- 라이트/다크 테마와 글자 크기 조절
- 장별 학습 완료 표시와 로컬 저장
- 80개 이상의 한–영 용어집
- 6주/12주 학습 경로와 인쇄용 체크리스트
- 공식 표준·기관·계측기 제조사·교재의 출처 층위

## 자동 검사

Node.js 20 이상에서 외부 패키지 없이 실행됩니다.

```powershell
node --test tests/*.test.mjs
```

검사는 다음을 확인합니다.

- 16개 장의 순서와 공통 학습 블록
- 각 장의 최소 설명량
- 32개 시각 자료와 Canvas renderer·Three.js scene의 연결
- 교육용 SVG 0개, ImageGen·draw-style·Three.js·Canvas 매체 수와 로컬 Three.js 의존 파일
- 전압분배기, RC/RLC, 반사계수, target impedance, alias, rise time 계산
- 오프라인 자산, 검색·읽기 도구, 용어·출처·체크리스트 수

## PDF로 저장

브라우저 인쇄에서 “PDF로 저장”을 선택합니다. 인쇄 CSS는 탐색 UI와 조작부를 숨기고
본문, 공식, 체크리스트와 참고문헌을 순서대로 출력합니다. 용지에 따라 배율을 90–100%로
조정하십시오.

## 파일 구조

```text
index.html                    본문과 semantic 구조
assets/styles.css             화면·반응형·다크·인쇄 디자인
assets/calculators.js         DOM과 분리된 공학 계산 함수
assets/visualizations.js      Canvas renderer와 입력 binding
assets/three-scenes.js        접근 가능한 Three.js 3D 장면과 WebGL fallback
assets/images/                컬러 전자기학·EMC 과학 이미지
assets/diagrams/              흑백 회로·측정·검증 기술 도해
assets/vendor/                고정된 로컬 Three.js와 라이선스
assets/app.js                 탐색·검색·테마·글자·진도 상태
tests/*.test.mjs              구조·계산·시각화 routing 검사
QA.md                         자동·브라우저·출처 검증 기록
docs/superpowers/specs/       설계 결정
docs/superpowers/plans/       구현·QA 계획
```

## 내용을 확장할 때

1. `index.html`의 해당 장에 설명을 추가합니다.
2. 새 장이라면 `intuition`, `equation`, `pcb-bridge`, `measurement-note`,
   `misconception`, `worked-example`, `self-check` 블록을 모두 둡니다.
3. 새 계산은 먼저 `tests/calculators.test.mjs`에 예상값을 추가해 실패를 확인합니다.
4. `assets/calculators.js`에 순수 함수를 구현합니다.
5. 시각화 mount에 고유한 `data-visualization` 값을 부여합니다.
6. `assets/visualizations.js`의 `rendererNames`와 `renderers`에 같은 이름을 등록합니다.
7. 전체 자동 검사를 실행하고 데스크톱·모바일·인쇄 화면을 확인합니다.

## 출처 정책

표준 번호와 revision 상태는 IPC, IEC, IEEE, eCFR 같은 공식 기관을 우선합니다.
계측·layout 실무 설명은 장비·반도체 제조사의 공식 primer/application note를 사용하고,
정평 있는 교재로 물리적 설명을 교차검증합니다. 경험칙에는 적용 조건을 붙이며,
유료 표준 전문을 재배포하지 않습니다.

안전·규제·제품 합격 판정은 이 가이드가 아니라 적용 표준, 장비 매뉴얼, 공인 시험소와
조직의 승인된 절차를 따르십시오.
