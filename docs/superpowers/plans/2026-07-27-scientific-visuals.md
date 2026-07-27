# Scientific Visual Overhaul Plan

## 목표

사용자가 값을 바꾸지 않아도 첫눈에 물리를 이해할 수 있는 정적 컬러 teaching plate를
전자기학·전송선로·PDN·EMC 중심으로 추가한다. 정량 비교에 가치가 있는 조작만 남긴다.

## 매체 선택

- ImageGen 컬러 도판: field distribution, return path, common-mode conversion, probe artifact
- Three.js: stackup·via·loop처럼 회전이 공간 이해에 직접 필요한 장면
- Canvas: 파라미터 변화가 설계 판단을 바꾸는 정량 plot
- 기술 다이어그램: 절차·측정 연결·bring-up flow
- instructional SVG는 사용하지 않는다.

## 우선 도판

1. Microstrip/stripline의 E·H field와 Poynting vector
2. 기준면 단절 전후 return-current detour
3. 전송선로 step과 source/load reflection timeline
4. via transition과 stitching via의 field containment
5. PDN impedance profile과 anti-resonance
6. differential imbalance가 common-mode로 변환되는 과정
7. near-field probe E/H hotspot 비교
8. oscilloscope acquisition chain과 aliasing

## 유지할 정량 interaction

- RC/RLC 과도응답
- 전송선로 반사
- target impedance/PDN
- rise-time/bandwidth
- sampling/alias
- probe ground-loop ringing

## 완료 기준

- 도판에는 정확한 방향·경계·색 범례와 HTML caption이 있다.
- print·dark·reduced-motion·WebGL fallback에서도 핵심 설명이 남는다.
- 이미지의 숫자 주장은 HTML 본문과 출처로 관리한다.
- 데스크톱·태블릿·모바일에서 crop과 작은 글자가 없다.
