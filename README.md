# WEZIP 프로토타입

사용성 테스트(UT)용 WEZIP 모바일 프로토타입입니다. 빌드 없이 정적 파일로 동작합니다.

## 실행

```bash
python3 -m http.server 8000
```

브라우저에서 http://localhost:8000 을 엽니다. 디자인 기준 폭은 390px(Figma 프레임)이며, 화면 폭에 맞춰 확대·축소됩니다.

## 구조

- `index.html`: 화면 마크업과 SVG 아이콘
- `css/app.css`: 스타일과 폰트 선언
- `js/app.js`: 화면 전환, 미션, 설문 로직 (`FORM_URL`: 응답을 보낼 구글폼 주소)
- `fonts/`: Pretendard 서브셋. 페이지에 쓰인 글자만 들어 있어서, 새 문구를 넣으면 해당 글자는 시스템 폰트로 보일 수 있습니다.
- `img/`: 게시물, 아바타, 토픽 이미지 (webp)
