# Music Surveyor 프로젝트 수정 요구사항

## 클라이언트 요구사항

### 1. 음악 플레이어 UI 변경 (phone_model.png 활용)

**핵심 개념**: phone_model.png를 그대로 음악 플레이어로 사용

**구현 방식**:
- PNG 파일을 배경/베이스로 사용
- 동적으로 변경되어야 하는 부분만 오버레이로 구현

**동작해야 하는 부분**:
1. ✅ 재생/일시정지 버튼 - 실제 동작
2. ✅ 앨범 아트 - 음악에 맞게 동적으로 표시
3. ✅ 프로그레스 바 - 실제 재생 진행에 따라 작동

**동작하지 않는 부분** (비활성화):
- 이전 곡/다음 곡 버튼
- 볼륨 조절
- 하단 기타 버튼들 (댓글, AirPlay, 목록 등)
- 즐겨찾기, 더보기 버튼

**PNG 수정 완료**:
- ✅ 앨범 커버 영역: 투명 처리
- ✅ 곡 제목/아티스트명: 배경 그라데이션으로 채움
- ✅ 프로그레스 바: 배경 그라데이션으로 채움
- ✅ 재생/일시정지 버튼: 배경 그라데이션으로 채움
- 원본: phone_model_original.png로 백업

---

### 2. 레이아웃 구조 변경

**데스크톱 레이아웃 (가로 배치)**:
```
┌─────────────────────────────────────┐
│  [핸드폰 모델]  │  프로그레스 바     │
│                │  ← [설문지] →     │
│  (음악 플레이어) │                   │
└─────────────────────────────────────┘
```
- **왼쪽**: 핸드폰 모델 (phone_model.png + 오버레이)
- **오른쪽**:
  - 위: 프로그레스 바 (설문 진행도)
  - 중앙: 설문지 질문들
  - 양 옆: ← 이전 곡 / 다음 곡 → 버튼

**모바일 레이아웃 (세로 배치)**:
```
┌───────────────┐
│ 핸드폰 모델    │
│ (음악 플레이어)│
├───────────────┤
│ 프로그레스 바  │
│ ← [설문지] → │
└───────────────┘
```
- **위**: 핸드폰 모델
- **아래**:
  - 위: 프로그레스 바
  - 중앙: 설문지
  - 양 옆: ← → 버튼

---

### 3. 설문 항목 구조 (32개 트랙)

**4개 감정**: joy, sad, peaceful, threatening

**각 감정당**:
- 음원 8개
- 앨범 아트 8개
- 각 감정에서 음원 2개씩 선택하여 4개 감정의 앨범과 조합

**네이밍 스킴**:

음원 파일:
```
/audio/joy_music_01.mp3 ~ joy_music_08.mp3
/audio/sad_music_01.mp3 ~ sad_music_08.mp3
/audio/peaceful_music_01.mp3 ~ peaceful_music_08.mp3
/audio/threatening_music_01.mp3 ~ threatening_music_08.mp3
```

앨범 아트:
```
/images/joy_album_01.png ~ joy_album_08.png
/images/sad_album_01.png ~ sad_album_08.png
/images/peaceful_album_01.png ~ peaceful_album_08.png
/images/threatening_album_01.png ~ threatening_album_08.png
```

**조합 방식** (각 감정당 8개 트랙 = 총 32개):
```
각 감정에서 음원 2개 선택 × 4개 감정 앨범 = 8개 트랙

예) Joy 감정:
  joy_music_01 × joy_album_01 (congruent)
  joy_music_01 × sad_album_X (incongruent)
  joy_music_01 × peaceful_album_Y (partial)
  joy_music_01 × threatening_album_Z (partial)

  joy_music_02 × joy_album_02 (congruent)
  joy_music_02 × sad_album_W (incongruent)
  ...
```

**Match Type**:
- `congruent`: 같은 감정
- `incongruent`: 완전 반대
- `partial_arousal`: arousal 차이
- `partial_valence`: valence 차이

**JSON 구조**:
```json
{
  "id": 1,
  "title": "Track Title",
  "artist": "Artist Name",
  "musicEmotion": "joy",
  "albumEmotion": "joy",
  "musicFile": "joy_music_01",
  "albumFile": "joy_album_01",
  "matchType": "congruent",
  "audioUrl": "/audio/joy_music_01.mp3",
  "coverUrl": "/images/joy_album_01.png",
  "questions": [...]
}
```

**순서**: 랜덤으로 생성하여 JSON에 미리 정의

---

### 4. 기존 기능 유지

**나머지 구현은 원래 코드를 최대한 따라감**:
- 설문 질문 및 응답 로직
- 데이터 제출 및 저장
- 유효성 검증
- 완료 페이지 이동
- 기존 상태 관리
- 오디오 재생 로직 (단, UI만 변경)

---

## 구현 체크리스트

- [ ] phone_model.png를 왼쪽(데스크톱) / 위(모바일)에 배치
- [ ] 앨범 커버를 phone_model.png 투명 영역에 오버레이
- [ ] 곡 제목/아티스트명을 phone_model.png 위에 오버레이
- [ ] 재생/일시정지 버튼을 phone_model.png 위에 오버레이
- [ ] 오디오 프로그레스 바를 phone_model.png 위에 오버레이
- [ ] 설문지를 오른쪽(데스크톱) / 아래(모바일)에 배치
- [ ] 설문 진행 프로그레스 바를 설문지 위에 배치
- [ ] 이전/다음 곡 버튼을 설문지 양 옆에 배치
- [ ] 반응형 레이아웃 구현 (데스크톱 ↔ 모바일)
- [ ] 기존 설문 로직 유지

---

