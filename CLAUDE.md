# CLAUDE.md — 코골이 노트 (noise-filter)

클라우드 Claude Code 세션용 안내서. 이 PC의 메모·시험 파일은 클라우드에 없으니, 여기 적힌 것과 저장소 코드만 믿고 작업할 것.

## 누구를 위한 앱인가
- 잘 때 휴대폰을 켜 두면 **소리가 날 때만** 조각으로 녹음하고, 아침에 코골이 횟수·그래프·조각을 보여 주는 웹앱.
- 라이브: https://s95722462-cell.github.io/noise-filter/ (main 에 push = GitHub Pages 배포)
- 주 사용 기기: 아이폰 Safari (홈 화면 앱). 교대근무도 고려해 "밤" 대신 "이번 잠·수면 기록" 낱말을 씀.
- 사용자는 한국인 비개발자. **답은 한국어, 쉬운 말로.** 장황한 화면 글·어수선한 화면을 싫어함.
- **새 기능·큰 변경은 기획안을 먼저 보여 주고 승인받은 뒤 만들 것.** 작은 수정·버그는 바로 해도 됨.
- 앞으로 생각해 둔 것: 요가 플레이어(별도 비공개 저장소)의 잠들기 소리·모닝콜과 연동 — 기획부터.

## 구조
- `index.html` 하나 (CSS + IIFE 스크립트). `manifest.webmanifest`, `sw.js`, `icons/`. 이 저장소가 원본 (PC 별도 사본 없음).
- **push 할 때마다 `sw.js` 의 `CACHE` 번호를 올릴 것** (지금 `snore-v11` → 다음 `snore-v12`). sw.js 는 lamejs 도 캐시함.
- 외부 라이브러리: cdnjs lamejs 1.2.1 (MP3, 늦게 불러옴, 실패 시 WAV). 새 라이브러리도 cdnjs 정확한 버전만.
- 저장: localStorage 접두사 `snore_` (`ls.get/ls.set`), 녹음은 IndexedDB `snore-note` (nights / clips). Blob 못 넣는 브라우저는 `clip.buf` → `fixClip`.

## 주요 기능과 코드 위치
- 녹음: getUserMedia(에코·잡음 제거 끔) → 16kHz, 적응형 바닥 소음 + 민감도, 앞 2초 미리 담기, 조용 5초 뒤 끝, 최대 90초. `audioSession = "play-and-record"`.
- 밤 지키기: 마이크 멈춤·끊김 경고 `#nWarn`/`micRestart`, AudioContext 자동 resume, wakeLock 다시, 화면 꺼진 구간 `night.gaps`, 저장 꽉 차면 멈춤.
- 코골이 판단 `/*@SN-ANALYSIS*/ … /*@SN-END*/` 블록 (`analyzePcm`, `classifySeries`, `snoreCount`, `SNORE_VER = 3`). 이 블록은 node 시험이 그대로 떼어 돌리므로 **블록 표시와 독립성(DOM 안 씀)을 유지**할 것. 판단 기준을 바꾸면 `SNORE_VER` 를 올림 → 예전 조각은 열 때 재계산.
- 아침 화면: 그래프 `drawGraph`, 최근 7일 `renderWeek`, 밤 태그·메모 `updNight`, ★ 별표, 자동 정리 `CFG.keep`, 저장 공간 표시.
- '일어났어요' `#nStop` = 1.2초 길게 누르기 (확인 창 없음) → `endNight` (녹음 중 조각은 `flushRec` 로 저장).
- 📤 보내기: 파일을 미리 준비해 두고 누르는 순간 `navigator.share` (아이폰 사용자 제스처 제한). 못 하면 내려받기. CSV 는 BOM.
- 시간대 `inWindow`, 기록 이름 `sleepLabel` (시작 날짜 + 새벽/오전/오후/저녁/밤).

## 안전·개인정보 (꼭 지킬 것)
- **녹음은 기기 안(IndexedDB)에만.** 서버 업로드·분석 서비스·외부 전송 기능을 넣지 말 것 (넣으려면 기획·승인 먼저).
- 🔒 PIN: `snore_pin` 에 `{s: 소금, h: SHA-256}` 만 저장 (PIN 원문 저장 금지). 1분 넘게 나갔다 오면 다시 잠금, PIN 을 켜 두면 '일어났어요' 직후 바로 PIN 화면. PIN 을 잊으면 `wipeAll` (모든 기록 삭제) 뿐 — 우회 방법을 만들지 말 것.
- 의료 진단처럼 말하지 말 것 ("추정", "참고용").
- 비밀·개인정보·실제 녹음 파일을 저장소에 넣지 말 것.

## 규칙
- 화면 글은 짧게. 아이폰 기본 앱 느낌(큰 제목, 묶음 목록, 아래 시트), JS 화면 글에 이모지 대신 선 아이콘(`IC()`). 단 태그 이모지(`TAGS`)는 CSV·시험이 쓰니 그대로.
- 누르는 칸 ≥44px, 입력칸 ≥16px, `touch-action: manipulation` (PIN 빨리 누를 때 두 번 톡 확대 방지), 320~430px 가로 넘침 없음.
- 색은 `:root` 토큰 + `prefers-color-scheme` 밝은/어두운 자동, 밝은 모드 AA 대비.
- 파일 이름은 영문만: `SnoreNote_날짜_시각.wav/mp3` (아이폰 한글 파일명 깨짐).

## 시험 (클라우드에서)
- 사용자 PC의 시험 스크립트는 저장소에 없음. 필요하면 `tests/` 를 만들어 작게 넣을 것.
- 헤드리스 Chromium + Playwright/CDP, 소리 음소거. 가짜 마이크: `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<합성 wav>` (코골이 N번 + 쿵 소리를 파이썬/node 로 만들어 씀, 큰 파일은 커밋하지 말 것).
- 판단 블록은 node 로 따로: `@SN-ANALYSIS` ~ `@SN-END` 를 잘라 합성 PCM 으로 횟수·간격 확인.
- 확인할 것: JS 오류 0, 코골이 N번 → 조각·횟수, 말소리·음악 오판 적은지, '일어났어요' 길게 누르기(CDP 마우스 누르기), PIN 설정·잠금·잊음, 보내기(share 가로채기), 320/375/390px 넘침, 다크/라이트.
- 아이폰 실제 동작(밤새 녹음·공유)은 클라우드에서 확인 불가 → 사용자에게 부탁.

## Git
- 커밋 메시지는 한국어로 무엇이 바뀌었는지 (예: "v10: PIN 잠금을 켜 두면 '일어났어요' 직후 바로 PIN을 물음").
- 시작 전 `git pull --rebase`, 강제 push 금지. main 에 push = 배포.
- push 뒤 라이브 확인: `https://s95722462-cell.github.io/noise-filter/sw.js` 의 CACHE 가 새 번호인지, JS 오류 없는지.
