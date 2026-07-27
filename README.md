# PCB HW Design & Validation Guide

회로 모델에서 출발해 전자기장, 전송선로, PCB 구조, SI/PI/EMC, 오실로스코프,
프로빙과 보드 검증까지 하나의 물리 흐름으로 연결한 한국어 멀티페이지 가이드북입니다.
특정 OJT 요령보다 원리, 수치 감각, 측정 한계와 검증 사고방식을 오래 참고할 수 있게
구성했습니다.

배포본: [https://woolearning.github.io/HW_Guide/](https://woolearning.github.io/HW_Guide/)

## 로컬에서 읽기

빌드된 HTML은 저장소에 함께 커밋됩니다. 루트의 `index.html`을 직접 열 수도 있지만,
검색과 페이지 간 이동까지 정확히 확인하려면 로컬 서버 사용을 권장합니다.

```powershell
python -m http.server 8766 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8766/`를 엽니다.

## 편집·빌드·검사

Node.js 20 이상이 필요하며 외부 npm 패키지는 사용하지 않습니다.

```powershell
npm run build
npm test
npm run check
```

- `content/guide.json`: 장·부·참고자료 메타데이터와 출처
- `content/home*.html`: 홈 소개와 학습 경로
- `content/chapters/*.html`: 16개 장의 작성 원본
- `content/reference/*.html`: 공식·용어·체크리스트·출처 원본
- `templates/*.mjs`: 공통 헤더, 목차, 장, 참고자료 템플릿
- `scripts/build.mjs`: 작성 원본을 배포용 페이지와 검색 인덱스로 변환
- `index.html`, `chapters/`, `reference/`: 생성된 GitHub Pages 배포물
- `assets/search-index.json`: 45개 절 단위 검색 항목

작성 원본을 고친 뒤에는 반드시 `npm run build`를 실행하고 생성 결과도 함께 커밋합니다.

## 현재 구성

- 6개 학습 부, 16개 장, 4개 참고자료 페이지
- 회로·전자기학·전송선로·PCB·SI/PI/EMC·계측·검증의 연속 학습 경로
- 절 단위 전체 검색과 다른 장의 특정 절로 이동하는 딥링크
- 장별 완료 상태, 마지막 읽은 장, 라이트/다크 테마, 글자 크기의 로컬 저장
- Canvas 계산 실험, 로컬 Three.js 장면, ImageGen 컬러 도판, 기술 다이어그램
- 80개 이상의 한–영 용어집, 공식 치트시트, 검증 체크리스트, 전체 출처 장부
- self-hosted Pretendard Variable과 Noto Serif KR
- 모바일 목차, 반응형 읽기 레이아웃, 인쇄용 스타일

## 새 내용을 추가하는 원칙

1. 해당 `content/chapters/*.html`에 내용을 작성합니다.
2. 물리적 직관 → 식과 변수 → PCB에서의 의미 → 측정 방법 → 오해 → 예제 순서를 지킵니다.
3. 장 메타데이터에는 검색어, 핵심 용어, 공식·교재·제조사 자료 출처를 보강합니다.
4. 새 계산은 먼저 테스트에 예상값과 경계조건을 추가합니다.
5. 정량 탐색은 Canvas, 공간 관계는 Three.js, 첫 이해를 돕는 장면은 정적 컬러 도판을 우선합니다.
6. 빌드 후 데스크톱·태블릿·모바일, 검색 딥링크와 콘솔 오류를 확인합니다.

## 글꼴과 라이선스

- Pretendard Variable: `assets/fonts/pretendard-variable.woff2`
- Noto Serif KR Semibold: `assets/fonts/noto-serif-kr-semibold.woff2`
- 각 글꼴의 라이선스 문서는 같은 폴더의 `OFL-*.txt`에 보관합니다.

## 출처 정책

개념과 유도는 대학 공개강의와 정평 있는 교재로 교차검증하고, PCB·EMC·계측 실무는
IPC, IEEE, IEC, 반도체·계측기 제조사의 공식 문서를 우선합니다. 표준의 유료 전문은
재배포하지 않으며, 경험칙에는 적용 조건과 한계를 붙입니다.

이 문서는 학습과 설계 검토를 위한 자료입니다. 안전, 법규, 인증, 제품 합격 판정에는
최신 적용 표준의 정식 판본, 부품·장비 매뉴얼, 공인 시험소와 조직의 승인 절차를
따라야 합니다.
