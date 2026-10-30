(function () {
  var DESIGN_W = 390;
  // 구글폼 '미리 채워진 링크' (받으면 여기에 넣음). 비어 있으면 마지막에 응답 요약 화면을 보여줌
  var FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfRwAkP53mJ6NFjinY52LRhyJg59VFBQ5yInLIyExhOS4w-sQ/viewform?usp=pp_url&entry.1576653616=test';
  var HINT_DELAY = 15000; // 한 화면에서 15초 동안 다음 단계로 못 가면 깜박임

  // ---------- 내용: UT 시나리오 문구 그대로 ----------
  var QUESTIONS = {
    q1: { tag: 'Q1', type: 'single', next: 'q2', text: '취미를 기록하는 SNS 계정을 운영해본 적이 있나요?',
      options: ['지금 운영하고 있다.', '운영하다가 뜸해졌거나 그만뒀다.', '만들고 싶었지만 만들지 않았다.', '관심 없다.'] },
    q2: { tag: 'Q2', type: 'multi', next: 'm1', exclusive: 4, text: '취미 계정에 대한 고민을 모두 골라주세요', note: '복수 응답',
      options: ['꾸준히 올려야 할 것 같아 부담스러웠다.', '한동안 게시물을 안 올리면 사람들이 나를 잊을 것 같다.',
        '자주 소통하던 사람이 뜸해져 궁금했지만, 직접 묻기는 부담스러웠다.',
        '사진을 고르고 글을 쓰는 게 번거로워 올리기를 미뤘다.', '해당하는 것이 없다.'] },
    q3: { tag: 'Q3', type: 'single', next: 'q4', text: '간편 답장을 받았을 때 어떤 기분이 들었나요?',
      options: ['반갑고 마음이 전해진 것 같다.', '별 느낌 없다.', '형식적인 답 같아 아쉽다.', '대화를 더 이어가야 할 것 같아 부담된다.'] },
    q4: { tag: 'Q4', type: 'text', next: 'm3', text: '그렇게 느낀 이유를 한 줄로 적어주세요.' },
    q5: { tag: 'Q5', type: 'single', next: 'm4', text: '댓글이나 DM에 비해, 간편 메세지를 보낼 때 얼마나 부담이 됐나요?',
      options: ['전혀 부담되지 않았다', '별로 부담되지 않았다', '보통이다', '조금 부담됐다', '매우 부담됐다'] }
  };
  var MISSIONS = {
    m1: { tag: '태스크 1 - 1차', next: 'home', blocks: [
      { label: '상황', text: '자주 소통하던 Clare 님이 요즘 통 보이지 않아요. 그러던 중, 홈에 Clare 님의 예전 게시물이 리마인드 되었어요.' },
      { label: '미션', key: true, text: '궁금하고 보고 싶은 마음을, Clare 님에게 댓글이나 DM이 아닌 다른 방법으로 전해보세요.' } ] },
    m2: { tag: '태스크 1 - 1차', next: 'arrived', blocks: [
      { label: '미션', key: true, text: 'Clare 님에게 온 답장을 읽고 확인 버튼을 눌러주세요' } ] },
    m3: { tag: '태스크 1 - 2차', next: 'search', round: 2, blocks: [
      { label: '상황', text: 'John 님의 소식이 궁금해 검색해봤습니다.' },
      { label: '미션', key: true, text: 'John 님에게 댓글과 간편 메세지 중 원하는 방식으로 궁금한 마음을 전해보세요.' } ] },
    m4: { tag: '태스크 2', next: 't2home', round: 3, blocks: [
      { label: '상황', text: '오랜만에 앱에 접속하니, 친구의 예전 게시물이 리마인드되어 있어요.' },
      { label: '미션', key: true, text: '홈 화면을 자유롭게 살펴본 후, 위쪽의 확인 완료 버튼을 눌러주세요.' } ] }
  };
  // 태스크 2: 집단별 질문 (알림O = A, 알림X = B)
  var SCALE = ['많이 줄어들 것 같다', '조금 줄어들 것 같다', '달라지지 않을 것 같다', '조금 커질 것 같다', '많이 커질 것 같다'];
  var WORRY = "'친구들이 나를 잊은 건 아닐까' 하는 걱정은\n어떻게 달라질 것 같나요?";
  var HELP = ['매우 도움이 될 것 같다', '조금 도움이 될 것 같다', '보통이다', '별로 도움이 안 될 것 같다', '전혀 도움이 안 될 것 같다'];
  var HELPQ = "내 활동이 없는 동안 '사람들이 나를 잊은 건 아닐까' 하는 걱정에 도움이 될 것 같나요?";
  var T2 = {
    A: { label: '알림O', qs: [
      { tag: 'Q6', text: '1번 알림과 2번 게시물은 어떤 관계라고 생각하시나요?',
        options: ['1번과 2번은 서로 같은 내용이다.', '1번과 2번은 서로 관련 없는 별개의 내용이다.', '잘 모르겠다.'] },
      { tag: 'Q7', sit: '내 이전 게시물이 친구 홈에 리마인드되면 알려주는,\n1번과 같은 알림 기능이 실제로 사용된다면', text: HELPQ, options: HELP },
      { tag: 'Q8', text: '그렇게 답한 이유에 가장 가까운 것은 무엇인가요?',
        options: ['내 예전 게시물이 친구에게 리마인드 되었다는 사실을 알게 되니 걱정이 줄었다', '다시 게시물을 올리고 싶은 마음이 생겼다',
          '예전 게시물을 보니 게시물을 더 올려야 할 것 같은 압박이 생겼다', '사람들이 나를 기억하는지 여전히 알 수 없었다', '1번 알림이 걱정을 줄이는 데 도움이 되는지 잘 모르겠다'] } ],
      // 화면 영역 (390 기준 좌표): 밝게 남길 범위, 번호 표시
      hole: [6, 40, 384, 616], marks: [[1, 12, 46, 378, 142], [2, 10, 208, 380, 612]], dy: 33 },
    B: { label: '알림X', qs: [
      { tag: 'Q6', sit: '이전에 소통이 많았던 게시물을 홈에 다시 보여주는,\n1번과 같은 리마인드 기능이 실제로 사용된다면', text: HELPQ, options: HELP },
      { tag: 'Q7', text: '그렇게 답한 이유에 가장 가까운 것은 무엇인가요?',
        options: ['내 예전 게시물도 친구에게 이렇게 다시 보일 수 있겠다고 느끼니 걱정이 줄었다', '다시 게시물을 올리고 싶은 마음이 생겼다',
          '예전 게시물을 보니 게시물을 더 올려야 할 것 같은 압박이 생겼다', '사람들이 나를 기억하는지 여전히 알 수 없었다', '1번 리마인드가 걱정을 줄이는 데 도움이 되는지 잘 모르겠다'] } ],
      hole: [6, 40, 384, 518], marks: [[1, 10, 110, 380, 515]], dy: -64 }
  };
  // 앱 화면: 다음에 눌러야 하는 버튼, 기록용 이름, 모달이면 뒤에 깔리는 화면
  var APP = {
    home:    { next: 't-hknock', label: '홈 리마인드 → 두드리기' },
    profile: { next: 't-knock', label: '프로필 → 두드리기' },
    send:    { next: 't-send',  label: '메세지 창 → 보내기', base: 'profile' },
    sent:    { next: 't-ok',    label: '전송 완료 → 확인', base: 'profile' },
    arrived: { next: 't-open',  label: '답장 도착 → 확인하기', base: 'profile' },
    reply:   { next: 't-read',  label: '답장 내용 → 확인', base: 'profile' },
    // 2차: 정답 경로 없음 (힌트 없음)
    search:   { label: '검색' },
    zprofile: { label: 'John 프로필' },
    zsend:    { label: 'John 메세지 창', base: 'zprofile' },
    zsent:    { label: 'John 전송 완료', base: 'zprofile' },
    post:     { label: '게시글' },
    postopen: { label: '게시글 펼침' },
    compose:  { label: '댓글 쓰기', base: 'postopen' }
  };
  var R1 = ['home', 'profile', 'send', 'sent', 'arrived', 'reply']; // 1차는 Clare 리마인드가 있는 홈에서 시작 (프로필은 들어간 경우만)
  var R2 = ['home2', 'search', 'zprofile', 'zsend', 'zsent', 'post', 'postopen', 'compose'];
  var ORDER = ['q1', 'q2', 'm1', 'home', 'profile', 'send', 'sent', 'm2', 'arrived', 'reply', 'q3', 'q4', 'q5', 'm3', 'search', 'zprofile', 'zsend', 'zsent', 'post', 'postopen', 'compose', 'finish', 'm4', 't2home', 'end', 'done'];
  var NAMES = { home: '홈', profile: '프로필', send: '메세지 창', sent: '전송 완료', arrived: '답장 도착', reply: '답장 내용', m1: '미션', m2: '미션2',
    home2: '홈(2차)', search: '검색', zprofile: 'John 프로필', zsend: 'John 메세지 창', zsent: 'John 전송 완료', post: '게시글', postopen: '게시글 펼침', compose: '댓글 쓰기', m3: '2차 미션', finish: '미션 완료', m4: '태스크 2 미션', t2home: '태스크 2 홈' };
  var CHIPS = ['다음 내용 궁금🙌', '하나 더!👀', '이 주제 좋다', '요즘 뭐해😲', '근황 궁금', '이번 주 어땠어', '이거 괜찮다'];
  // 1차 답장: 보낸 간편 메세지(같은 순서)에 맞는 Clare의 수집 답장 1개
  // 답장 문구는 디자인의 답장 칩 목록에서 고름: 조금 더 기다려주세요😌 / 금방 올게요!💪 / 3일 이내 업로드 예정! / 7일 이내 업로드 예정! / 오래 걸려요😭 / 업로드 예정이 없어요🥹 / 휴식 중이에요😴 / 공지 확인해주세요👀
  var REPLIES = ['3일 이내 업로드 예정!', '금방 올게요!💪', '7일 이내 업로드 예정!', '휴식 중이에요😴', '휴식 중이에요😴', '조금 더 기다려주세요😌', '금방 올게요!💪'];

  var stage = document.getElementById('stage');
  var pill = document.getElementById('mission-pill');
  var hintTimer = null, hintDelay = 0, hintArmedAt = 0, held = null;
  var enteredAt = 0;
  var state;

  function fresh() {
    return { current: 'q1', startedAt: null, t0: null, ev: [], chipChanges: 0, anonToggles: 0, answers: { q1: null, q2: [], q3: null, q4: '', q5: null }, log: {}, later: 0, dimClose: 0, views: 0,
      task: 'm1', returnTo: null, chip: 0, anon: true, sentChip: null, sentAnon: null, finishedAt: null,
      phase: 1, chip2: 0, anon2: true, chipChanges2: 0, anonToggles2: 0, later2: 0, dimClose2: 0, sentChip2: null, sentAnon2: null,
      firstPick: null, done2: null, comment2: '', finishBase: null, zcar: { p1: 1, p2: 1 }, r1Base: null, k1: { ms: 0, hintAt: null }, h1: { swipeMax: 1, opened: false, cTry: 0 },
      t2: { group: null, shownAt: null, viewMs: null, first: null, taps: [], scrollMax: 0, scrollAt: 0, step: 0, answers: [], qms: [], qAt: null } };
  }
  function el(name) { return document.getElementById('s-' + name); }
  function node(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  // 홈은 1차·2차에 같이 쓰므로 2차 기록은 'home2'로 따로 모음
  function key(name) { return (name === 'home' && state.phase === 2) ? 'home2' : name; }
  function step(name) { if (!state.log[name]) state.log[name] = { ms: 0, hint: false, miss: 0, visits: 0, zones: {}, taps: [] }; return state.log[name]; }
  // 시간순 행동 기록 (미션 시작 시점부터 초 단위)
  function ev(what) {
    if (state.t0 == null) return;
    state.ev.push(((Date.now() - state.t0) / 1000).toFixed(1) + ' ' + what);
    if (state.ev.length > 120) state.ev.shift();
  }

  // ---------- 설문 ----------
  function buildQuestion(id) {
    var q = QUESTIONS[id], root = el(id);
    root.textContent = '';
    var wrap = node('div', 'page-in'), head = node('div', 'head');
    head.appendChild(node('span', 'tag', q.tag));
    var h = node('h1', 'q', q.text); h.id = id + '-title'; head.appendChild(h);
    if (q.note) head.appendChild(node('p', 'note', q.note));
    wrap.appendChild(head);
    var next = node('button', 'cta', '다음'); next.type = 'button'; next.id = id + '-next';
    var group = null;
    if (q.type === 'text') {
      var input = node('input', 'field');
      input.type = 'text'; input.id = id + '-input'; input.maxLength = 120; input.autocomplete = 'off';
      input.setAttribute('aria-labelledby', id + '-title'); input.setAttribute('enterkeyhint', 'done');
      input.placeholder = '한 줄로 적어주세요'; input.value = state.answers[id] || '';
      // 서술형은 필수: 한 글자 이상 적어야 다음으로
      var syncText = function () { next.disabled = !input.value.trim(); };
      input.addEventListener('input', function () { state.answers[id] = input.value; syncText(); });
      syncText();
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });
      wrap.appendChild(input);
    } else {
      var multi = q.type === 'multi';
      group = node('div', 'opts');
      group.setAttribute('role', multi ? 'group' : 'radiogroup'); group.setAttribute('aria-labelledby', id + '-title');
      q.options.forEach(function (text, i) {
        var label = node('label', 'opt' + (multi ? ' multi' : '')), inp = document.createElement('input');
        inp.type = multi ? 'checkbox' : 'radio'; inp.name = id; inp.id = id + '-opt' + i; inp.value = String(i);
        label.appendChild(inp); label.appendChild(node('span', 'mark')); label.appendChild(node('span', null, text));
        group.appendChild(label);
        inp.addEventListener('change', function () {
          if (multi) {
            var picked = state.answers[id].filter(function (v) { return v !== i; });
            if (inp.checked) picked = (i === q.exclusive) ? [i] : picked.filter(function (v) { return v !== q.exclusive; }).concat(i);
            state.answers[id] = picked.sort();
          } else state.answers[id] = i;
          sync();
        });
      });
      wrap.appendChild(group);
      var sync = function () {
        var a = state.answers[id];
        group.querySelectorAll('.opt').forEach(function (label, i) {
          var on = multi ? a.indexOf(i) !== -1 : a === i;
          label.classList.toggle('sel', on); label.querySelector('input').checked = on;
        });
        next.disabled = multi ? a.length === 0 : a == null;
      };
      sync();
    }
    var actions = node('div', 'actions');
    next.addEventListener('click', function () { go(q.next); });
    actions.appendChild(next);

    wrap.appendChild(actions); root.appendChild(wrap);
  }

  // ---------- 미션 ----------
  function buildMission(id) {
    var m = MISSIONS[id], root = el(id);
    root.textContent = '';
    var wrap = node('div', 'page-in'), head = node('div', 'head');
    head.appendChild(node('span', 'tag', m.tag)); wrap.appendChild(head);
    m.blocks.forEach(function (b) {
      var block = node('div', 'block' + (b.key ? ' key' : ''));
      block.appendChild(node('h2', null, b.label)); block.appendChild(node('p', null, b.text)); wrap.appendChild(block);
    });
    var actions = node('div', 'actions');
    var start = node('button', 'cta', '시작하기'); start.type = 'button'; start.id = id + '-start';
    start.addEventListener('click', function () {
      if (state.returnTo) { var back = state.returnTo; state.returnTo = null; go(back); }
      else {
        if (state.t0 == null) state.t0 = Date.now();
        if (m.round === 3 && state.phase !== 3) { state.phase = 3; t2Assign(); ev('— 태스크 2 시작 (' + T2[state.t2.group].label + ') —'); }
        if (m.round === 2 && state.phase !== 2) { state.phase = 2; ev('— 2차 시작 —'); document.getElementById('home-scroll').scrollTop = 0; document.getElementById('recent').hidden = false; }
        go(m.next);
      }
    });
    actions.appendChild(start); wrap.appendChild(actions); root.appendChild(wrap);
  }

  // ---------- 마지막 화면 ----------
  function answerText(id) {
    var q = QUESTIONS[id], a = state.answers[id];
    if (q.type === 'text') return a ? a : '(응답 없음)';
    if (q.type === 'multi') return a.length ? a.map(function (i) { return q.options[i]; }).join(' / ') : '(응답 없음)';
    return a == null ? '(응답 없음)' : q.options[a];
  }
  function logText(name) {
    var s = state.log[name];
    if (!s) return '(지나가지 않음)';
    return (s.ms / 1000).toFixed(1) + '초 · 힌트 ' + (s.hint ? '표시됨' : '없음') + ' · 빗나간 탭 ' + s.miss + '회';
  }
  function extraRows() {
    return [
      ['보낸 간편 메세지', state.sentChip == null ? '(보내지 않음)' : CHIPS[state.sentChip]],
      ['익명', state.sentAnon == null ? '-' : (state.sentAnon ? '켜짐' : '꺼짐')],
      ['나중에 보낼래요 누른 횟수', state.later + '회'],
      ['메세지 창 바깥(딤)을 눌러 닫은 횟수', state.dimClose + '회'],
      ['미션 다시 본 횟수', state.views + '회']
    ];
  }
  function verdict(name) {
    var s = state.log[name];
    if (!s) return '도달 못함';
    if (s.hint) return '힌트 보고 성공';
    if (s.miss > 0 || s.visits > 1) return '돌아서 성공';
    return '직접 성공';
  }
  function zonesText(name) {
    var s = state.log[name], z = s ? s.zones : {}, keys = Object.keys(z);
    return keys.length ? keys.map(function (k) { return k + ' ' + z[k]; }).join(', ') : '없음';
  }
  function num(id) {
    var q = QUESTIONS[id], a = state.answers[id];
    if (q.type === 'multi') return a.length ? a.map(function (i) { return i + 1; }).join(',') + '번' : '-';
    if (id === 'q5') return a == null ? '-' : (a + 1) + '점';
    return a == null ? '-' : (a + 1) + '번';
  }
  function clock() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function stamp() { if (!state.finishedAt) state.finishedAt = clock(); }
  function resultText() {
    var L = ['시작: ' + (state.startedAt || '-') + ' / 완료: ' + (state.finishedAt || '-'), '',
      '[응답] Q1 ' + num('q1') + ' / Q2 ' + num('q2') + ' / Q3 ' + num('q3') + ' / Q5 ' + num('q5'),
      'Q4: ' + (state.answers.q4 ? state.answers.q4 : '(없음)'), '', '[단계]'];
    R1.forEach(function (name) {
      var s = state.log[name];
      if (name === 'profile' && !s) { L.push('Clare 프로필: 안 들어감'); return; }
      if (name === 'home' && state.r1Base === 'profile' && s) { L.push('홈 리마인드 → Clare 프로필로 이동: ' + (s.ms / 1000).toFixed(1) + '초 · 오클릭 ' + s.miss); return; }
      L.push(APP[name].label + ': ' + verdict(name) + (s ? ' · ' + (s.ms / 1000).toFixed(1) + '초 · 오클릭 ' + s.miss : ''));
    });
    L.push('', '[메세지] ' + (state.sentChip == null ? '보내지 않음' : CHIPS[state.sentChip]) + ' · 익명 ' + (state.sentAnon == null ? '-' : (state.sentAnon ? '켜짐' : '꺼짐')) +
      ' · 칩 변경 ' + state.chipChanges + '회 · 토글 ' + state.anonToggles + '회 · 나중에 ' + state.later + '회 · 바깥 닫기 ' + state.dimClose + '회 · 미션 다시보기 ' + state.views + '회' +
      ' · 두드리기 누른 곳: ' + (state.r1Base === 'home' ? '홈 리마인드' : state.r1Base === 'profile' ? '프로필' : '-') +
      ' · 받은 답장: ' + (state.sentChip == null ? '-' : REPLIES[state.sentChip]) +
      ' · 두드리기 힌트: ' + (state.k1 && state.k1.hintAt != null ? state.k1.hintAt + '초에 표시' : '안 뜸'));
    var h1 = state.h1 || {};
    L.push('[1차 Clare 게시물] ' + (h1.swipeMax || 1) + '/3장까지 봄 · 더 보기 ' + (h1.opened ? '펼침' : '안 펼침') + ' · 댓글 쓰기 시도 ' + (h1.cTry || 0) + '회 (전체 게시물 합)');
    var hp = h1.p || {};
    L.push('[1차 다른 게시물] ' + [['maka', 'maka', 2], ['yeeun', 'Yeeun', 3]].map(function (o) { var q = hp[o[0]] || {}; return o[1] + ' ' + (q.swipeMax || 1) + '/' + o[2] + '장 · ' + (q.opened ? '펼침' : '안 펼침'); }).join(' / '));
    L.push('', '[2차] 완료 방법: ' + (state.done2 || '미완료') + ' · 처음 들어간 곳: ' + (state.firstPick || '-'));
    if (state.sentChip2 != null || state.chipChanges2 || state.later2 || state.dimClose2 || state.anonToggles2)
      L.push('[2차 메세지] ' + (state.sentChip2 == null ? '보내지 않음' : CHIPS[state.sentChip2]) + ' · 익명 ' + (state.sentAnon2 == null ? '-' : (state.sentAnon2 ? '켜짐' : '꺼짐')) +
        ' · 칩 변경 ' + state.chipChanges2 + '회 · 토글 ' + state.anonToggles2 + '회 · 나중에 ' + state.later2 + '회 · 바깥 닫기 ' + state.dimClose2 + '회');
    if (state.comment2) L.push('[2차 댓글] ' + state.comment2);
    var zc = state.zcar || {};
    L.push('[2차 John 게시물] 굳세어라 산책day ' + (zc.p1 || 1) + '/3장 · 중앙공원 한바퀴 ' + (zc.p2 || 1) + '/2장까지 봄');
    L.push('[2차 단계] ' + (R2.filter(function (k) { return state.log[k]; }).map(function (k) {
      var g = state.log[k]; return NAMES[k] + ' ' + (g.ms / 1000).toFixed(1) + '초 · 오클릭 ' + g.miss; }).join(' / ') || '-'));
    var missText = R1.concat(R2).filter(function (n) { return state.log[n] && state.log[n].miss; })
      .map(function (n) { return NAMES[n] + ': ' + zonesText(n); }).join(' / ');
    L.push('[오클릭 위치] ' + (missText || '없음'));
    L.push('[탭 좌표] ' + R1.concat(R2).filter(function (n) { return state.log[n] && state.log[n].taps.length; })
      .map(function (n) { return NAMES[n] + ': ' + state.log[n].taps.join(' '); }).join(' / '));
    var t = state.t2;
    if (t.group) {
      var g = T2[t.group];
      L.push('', '[태스크 2] 집단: ' + g.label + ' · 홈 본 시간 ' + (t.viewMs == null ? '-' : (t.viewMs / 1000).toFixed(1) + '초') +
        ' · 최대 스크롤 ' + (t.scrollMax || 0) + 'px · Clare 게시물 ' + (t.swipeMax || 1) + '/3장까지 봄 · 더 보기 ' + (t.opened ? '펼침' : '안 펼침') + ' · 처음 누른 곳: ' + (t.first ? t.first.zone + ' (' + t.first.x + ',' + t.first.y + ')' : '없음'));
      if (t.taps && t.taps.length) L.push('[태스크 2 탐색 탭] ' + t.taps.join(' / '));
      var P2 = t.p || {}, OTH = T2POSTS.slice(1).filter(function (P) { return !P.root.hidden; }).map(function (P) { return [P.key, P.label, P.cards.length, P.cat]; });
      L.push('[태스크 2 리마인드 두드리기] ' + (t.knock || 0) + '회 · 미션 다시보기 ' + (t.mviews || 0) + '회');
      L.push('[태스크 2 다른 게시물] ' + OTH.map(function (o) { var q = P2[o[0]] || {}; return o[1] + '(' + o[3] + ') ' + (q.swipeMax || 1) + '/' + o[2] + '장 · ' + (q.opened ? '펼침' : '안 펼침'); }).join(' / '));
      var ALL = [['Clare', t]].concat(OTH.map(function (o) { return [o[1], P2[o[0]] || {}]; }));
      var cm = []; ALL.forEach(function (a) { (a[1].comments || []).forEach(function (c) { cm.push(a[0] + ': ' + c); }); });
      if (cm.length) L.push('[태스크 2 댓글] ' + cm.join(' / '));
      // 간편 반응: 바가 한 번이라도 뜬 게시물만 (리마인드 게시물은 간편 반응 없음)
      var RS = ALL.filter(function (a, i) { return i > 0 && a[1].reactShown; });
      L.push('[태스크 2 간편 반응] ' + (RS.length ? '' : '바 안 뜸') + RS.map(function (a) { var q = a[1]; return a[0] + ' 바 표시 ' + (q.reactShown || 0) + '회 · ' + (q.reaction ? q.reaction + ' (바 표시 후 ' + (q.reactMs / 1000).toFixed(1) + '초)' : '반응 안 함'); }).join(' / '));
      L.push('[태스크 2 응답] ' + g.qs.map(function (q, i) { return q.tag + ' ' + (t.answers[i] == null ? '-' : (t.answers[i] + 1) + '번'); }).join(' / '));
      L.push('[태스크 2 시간] ' + g.qs.map(function (q, i) { return q.tag + ' ' + (t.qms[i] ? (t.qms[i] / 1000).toFixed(1) + '초' : '-'); }).join(' / '));
    }
    L.push('[경로] ' + state.ev.join(' > '));
    return L.join('\n');
  }
  function formLink(extra) {
    extra = extra || '';
    var text = resultText() + extra;
    // 링크가 너무 길면 폼이 안 열릴 수 있어, 경로 기록을 앞에서부터 줄임
    var keep = state.ev.slice();
    while (encodeURIComponent(text).length > 6500 && state.ev.length > 10) { state.ev.shift(); text = resultText().replace('[경로] ', '[경로] … ') + extra; }
    state.ev = keep;
    if (!/entry\.\d+=[^&]*/.test(FORM_URL)) return FORM_URL;
    // 입력 화면(viewform)이 아니라 제출 주소(formResponse)로 바로 보내서, 누르는 즉시 응답이 기록되고 참여자는 내용을 볼 수 없음
    return FORM_URL.replace('/viewform?', '/formResponse?').replace(/(entry\.\d+=)[^&]*/, '$1' + encodeURIComponent(text)) + '&submit=Submit';
  }
  function buildDone() {
    var root = el('done'); root.textContent = '';
    var wrap = node('div', 'page-in'), head = node('div', 'head');
    head.appendChild(node('h1', 'q', '잠시만요! 제출이 됐는지 확인해주세요'));
    head.appendChild(node('p', 'note', '새 창에 \'응답이 기록되었습니다\'가 떴다면 제출이 끝났어요. 새 창은 닫으셔도 됩니다. 참여해주셔서 감사합니다!'));
    wrap.appendChild(head);
    var box = node('div', 'block key');
    box.appendChild(node('h2', null, '새 창이 뜨지 않았나요?'));
    box.appendChild(node('p', null, '아래 응답 제출하기 버튼을 눌러주세요.'));
    wrap.appendChild(box);
    var acts = node('div', 'actions');
    // 완료 화면에서 다시 보낸 기록은 표시를 붙여, 첫 제출과 함께 들어와도 같은 사람으로 구분
    var a = node('a', 'cta', '응답 제출하기'); a.href = formLink('\n[제출] 완료 화면 버튼으로 보냄'); a.target = '_blank'; a.rel = 'noopener'; a.id = 'done-reopen';
    acts.appendChild(a);
    acts.appendChild(node('p', 'note', '버튼을 눌러도 새 창이 뜨지 않으면, 받은 링크를 사파리나 크롬에서 열어 다시 진행해주세요.'));
    wrap.appendChild(acts); root.appendChild(wrap);
  }
  function buildEnd() {
    var root = el('end'); root.textContent = '';
    var wrap = node('div', 'page-in'), head = node('div', 'head');
    head.appendChild(node('h1', 'q', '여기까지예요. 참여해 주셔서 감사합니다.'));
    head.appendChild(node('p', 'note', '아래 내용을 진행자에게 보여주세요.'));
    wrap.appendChild(head);
    function section(title, pairs) {
      var s = node('div', 'sum'); s.appendChild(node('h2', null, title));
      var dl = node('dl', 'rows');
      pairs.forEach(function (p) { var row = node('div'); row.appendChild(node('dt', null, p[0])); row.appendChild(node('dd', null, p[1])); dl.appendChild(row); });
      s.appendChild(dl); wrap.appendChild(s);
    }
    section('응답', Object.keys(QUESTIONS).map(function (id) { return [QUESTIONS[id].tag + '. ' + QUESTIONS[id].text, answerText(id)]; }));
    section('진행자용 기록', R1.map(function (name) { return [APP[name].label, verdict(name) + ' · ' + logText(name)]; }).concat(extraRows()));
    var out = node('textarea'); out.id = 'copy-out'; out.readOnly = true; out.hidden = true; out.setAttribute('aria-label', '결과 텍스트');
    wrap.appendChild(out);
    var actions = node('div', 'actions');
    var copy = node('button', 'cta', '결과 복사'); copy.type = 'button'; copy.id = 'end-copy';
    copy.addEventListener('click', function () {
      var text = resultText();
      function fallback() { out.value = text; out.hidden = false; out.focus(); out.select(); copy.textContent = '아래 글을 길게 눌러 복사하세요'; }
      try { navigator.clipboard.writeText(text).then(function () { copy.textContent = '복사했어요'; }, fallback); } catch (e) { fallback(); }
    });
    var again = node('button', 'cta quiet', '처음부터 다시'); again.type = 'button'; again.id = 'end-restart';
    again.addEventListener('click', function () { start({}); });
    actions.appendChild(copy); actions.appendChild(again); wrap.appendChild(actions); root.appendChild(wrap);
  }

  // ---------- 앱 화면 동작 ----------
  function on(id, fn) { document.getElementById(id).addEventListener('click', function (e) { e.stopPropagation(); fn(); }); }
  function missAt(name, zone) {
    var g = step(key(name)); g.miss += 1; g.zones[zone] = (g.zones[zone] || 0) + 1; ev('×' + zone);
  }
  on('t-clare', function () { if (state.phase === 2) { missAt('home', 'Clare 게시물 프로필'); return; } go('profile', { fresh: true }); });
  on('t-navsearch', function () {
    if (state.phase !== 2) { missAt('home', '검색 탭'); return; }
    document.getElementById('recent').hidden = true;
    go('search');
  });
  on('t-back', function () { go('home'); });
  function knock(id, next) {
    var b = document.getElementById(id), from = state.current;
    if (b._busy) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    b._busy = true;
    setTimeout(function () {
      b._busy = false;
      if (state.current !== from) return;
      var br = b.getBoundingClientRect(), sec = el(next), dlg = sec.querySelector('.dialog'), wrap = sec.querySelector('.mwrap');
      var anim = !reduce && dlg && dlg.animate;
      // 첫 프레임에 딤과 팝업이 다 보였다가 사라지는 깜박임 방지: 보이기 전에 시작 상태를 먼저 고정
      if (anim) { wrap.style.backgroundColor = 'rgba(18,18,18,0)'; dlg.style.opacity = '0'; dlg.style.transform = 'scale(0.14)'; }
      go(next);
      if (anim) growFrom(dlg, wrap, br);
    }, reduce ? 0 : 90);
  }
  // 팝업이 두드리기 버튼 자리에서 커지며 열림
  function growFrom(dlg, wrap, br) {
    dlg.style.transform = 'none'; // 원래 크기로 위치를 잰 뒤 다시 줄임 (같은 프레임이라 화면엔 안 보임)
    var dr = dlg.getBoundingClientRect(), k = dr.width / dlg.offsetWidth || 1;
    var ox = (br.left + br.width / 2 - dr.left) / k, oy = (br.top + br.height / 2 - dr.top) / k;
    dlg.style.transformOrigin = ox + 'px ' + oy + 'px';
    dlg.style.transform = 'scale(0.14)';
    var a1 = dlg.animate([{ transform: 'scale(0.14)', borderRadius: '120px' }, { transform: 'scale(1)', borderRadius: '24px' }],
      { duration: 460, easing: 'cubic-bezier(.3,1.28,.5,1)', fill: 'both' });
    var a2 = dlg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out', fill: 'both' });
    var a3 = wrap.animate([{ backgroundColor: 'rgba(18,18,18,0)' }, { backgroundColor: 'rgba(18,18,18,0.6)' }], { duration: 300, easing: 'ease-out', fill: 'both' });
    function clear() { dlg.style.opacity = ''; dlg.style.transform = ''; wrap.style.backgroundColor = ''; }
    Promise.all([a1.finished, a2.finished, a3.finished]).then(function () { clear(); a1.cancel(); a2.cancel(); a3.cancel(); }, clear);
  }
  // 두드리기 버튼: 누르는 순간 살짝 눌리고, 떼면 탄성 있게 복귀
  ['t-knock', 't-hknock', 't-zknock', 't2-knock'].forEach(function (id) {
    var b = document.getElementById(id);
    function up() { b.classList.remove('pressed'); }
    b.addEventListener('pointerdown', function () { b.classList.add('pressed'); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { b.addEventListener(t, up); });
  });
  // 태스크 2 리마인드 카드의 두드리기: 탐색 중 누른 것만 기록 (화면 이동 없음)
  document.getElementById('t2-knock').addEventListener('click', function () { if (state.current !== 't2home' || el('t2home').classList.contains('quiz')) return; state.t2.knock = (state.t2.knock || 0) + 1; ev('리마인드 두드리기 누름'); });
  on('t-knock', function () { state.r1Base = 'profile'; knock('t-knock', 'send'); });
  // 홈 리마인드 게시물의 두드리기 (1차). 2차에서는 누를 수 없음(오클릭 기록)
  on('t-hknock', function () { if (state.phase === 2) { missAt('home', 'Clare 두드리기'); return; } state.r1Base = 'home'; knock('t-hknock', 'send'); });
  on('t-send', function () { state.sentChip = state.chip; state.sentAnon = state.anon; go('sent'); });
  on('t-later', function () { state.later += 1; ev('나중에 보낼래요'); go(state.r1Base || 'profile'); });
  // 메세지 창: 어두운 바깥을 누르면 창이 닫히고 프로필로 돌아감
  el('send').querySelector('.mwrap').addEventListener('click', function (e) {
    if (e.target !== e.currentTarget) return;
    e.stopPropagation();
    state.dimClose += 1;
    ev('바깥 눌러 닫음');
    go(state.r1Base || 'profile');
  });
  on('t-ok', function () { go('m2'); });
  on('t-open', function () { go('reply'); });
  on('t-read', function () { go('q3'); });

  // ---------- 2차 ----------
  on('t-sfield', function () { document.getElementById('recent').hidden = false; ev('검색창 누름'); });
  on('t-ztopic', function () {
    var t = document.getElementById('t-ztopic');
    t.classList.add('sel'); t.setAttribute('aria-pressed', 'true'); ev('주제 카드 선택');
    state.firstPick = state.firstPick || '게시글';
    setTimeout(function () { if (state.current !== 'zprofile') return; document.getElementById('post-scroll').scrollTop = 0; go('post'); }, 180);
  });
  on('t-scancel', function () { missAt('search', '취소 버튼'); });
  on('t-snavhome', function () { missAt('search', '홈 탭'); });
  on('t-zrow', function () { document.getElementById('zprofile-scroll').scrollTop = 0; go('zprofile'); });
  on('t-zback', function () { go('search'); });
  on('t-zknock', function () { state.firstPick = state.firstPick || '두드리기'; knock('t-zknock', 'zsend'); });
  on('t-zphoto', function () { state.firstPick = state.firstPick || '게시글'; document.getElementById('post-scroll').scrollTop = 0; go('post'); });
  on('t-zsend', function () { state.sentChip2 = state.chip2; state.sentAnon2 = state.anon2; go('zsent'); });
  on('t-zlater', function () { state.later2 += 1; ev('나중에 보낼래요'); go('zprofile'); });
  el('zsend').querySelector('.mwrap').addEventListener('click', function (e) {
    if (e.target !== e.currentTarget) return;
    e.stopPropagation(); state.dimClose2 += 1; ev('바깥 눌러 닫음'); go('zprofile');
  });
  on('t-zok', function () { state.done2 = '간편 메세지(두드리기)'; ev('미션 완료'); go('q5'); });
  on('t-pback', function () { go('zprofile'); });
  on('t-more', function () { document.getElementById('postopen-scroll').scrollTop = document.getElementById('post-scroll').scrollTop; go('postopen'); });
  on('t-oback', function () { go('zprofile'); });

  var cinput = document.getElementById('cinput'), csend = document.getElementById('t-csend');
  var composer = document.getElementById('composer'), commentsEl = document.getElementById('comments');
  var commentsHTML = commentsEl.innerHTML;
  on('t-comment', function () { go('compose'); try { cinput.focus(); } catch (err) {} });
  function syncSend() { csend.disabled = !cinput.value.trim(); }
  cinput.addEventListener('input', syncSend);
  cinput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendComment(); } });
  Array.prototype.forEach.call(document.querySelectorAll('#composer .emo'), function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); cinput.value += b.textContent; syncSend(); ev('이모지 ' + b.textContent); try { cinput.focus(); } catch (err) {} });
  });
  on('t-csend', function () { sendComment(); });
  function setFold(open) {
    var b = document.getElementById('t-cfold');
    commentsEl.style.display = open ? 'flex' : 'none';
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    b.setAttribute('aria-label', open ? '댓글 접기' : '댓글 펼치기');
    b.firstChild.style.transform = open ? '' : 'rotate(180deg)';
  }
  on('t-cfold', function () { var open = commentsEl.style.display === 'none'; setFold(open); ev(open ? '댓글 펼치기' : '댓글 접기'); });
  function sendComment() {
    var text = cinput.value.trim();
    if (!text || state.current !== 'compose') return;
    state.comment2 = text; state.done2 = '댓글'; ev('댓글 보냄');
    var row = node('div', 'cmt new'); row.setAttribute('data-z', '댓글');
    var av = node('div', 'av me'); av.innerHTML = '<svg width="22" height="22" aria-hidden="true"><use href="#i-person"/></svg>';
    var body = node('div', 'body'), head = node('div', 'head');
    head.appendChild(node('span', 'cm-name', 'wezip_tester')); head.appendChild(node('span', 'cm-ago', '방금'));
    body.appendChild(head); body.appendChild(node('div', 'text', text));
    row.appendChild(av); row.appendChild(body);
    setFold(true);
    commentsEl.insertBefore(row, commentsEl.firstChild);
    document.getElementById('ccount').textContent = '24';
    cinput.value = ''; syncSend(); try { cinput.blur(); } catch (err) {}
    var sc = document.getElementById('postopen-scroll');
    go('postopen');
    sc.scrollTop = Math.max(0, commentsEl.offsetTop - 160);
    state.finishBase = 'postopen';
    setTimeout(function () { if (state.current === 'postopen') { ev('미션 완료'); go('q5'); } }, 900);
  }
  // 댓글 창 바깥을 누르면 닫힘
  el('compose').addEventListener('click', function (e) {
    if (e.target !== e.currentTarget) return;
    e.stopImmediatePropagation(); try { cinput.blur(); } catch (err) {} ev('댓글창 닫음'); go('postopen');
  });
  // iOS: 키보드가 열려 있는 동안 페이지 높이를 키보드 위 영역에 맞춤.
  // 페이지가 위아래로 밀리지 않아 입력창이 키보드 바로 위에 붙어 있고, 피드는 그 위에서 스크롤됨
  function kbFit() {
    var vv = window.visualViewport; if (!vv) return;
    var open = state.current === 'compose' || !document.getElementById('t2-composer').hidden;
    var kb = open && window.innerHeight - vv.height > 80;
    document.documentElement.style.height = document.body.style.height = kb ? vv.height + 'px' : '';
    if (kb && (window.scrollY || vv.offsetTop)) window.scrollTo(0, 0);
  }
  // iOS처럼 키보드가 화면을 덮는 경우 입력창을 키보드 위로 올림
  function liftComposer() {
    kbFit();
    var vv = window.visualViewport;
    if (!vv || state.current !== 'compose') { composer.style.bottom = '0px'; return; }
    var r = stage.getBoundingClientRect();
    composer.style.bottom = Math.max(0, r.bottom - (vv.offsetTop + vv.height)) + 'px';
  }
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', liftComposer); window.visualViewport.addEventListener('scroll', liftComposer); }

  // ---------- 태스크 2 ----------
  var t2z = document.getElementById('t2-z'), t2scroll = document.getElementById('t2-scroll'), t2canvas = document.getElementById('t2-canvas'), t2hole = document.getElementById('t2-hole'),
    t2marks = document.getElementById('t2-marks'), t2sheet = document.getElementById('t2-sheet'), t2sec = el('t2home');
  function t2Assign() { if (!state.t2.group) state.t2.group = Math.random() < 0.5 ? 'A' : 'B'; }
  function t2Paint() {
    var g = T2[state.t2.group || 'A'];
    document.getElementById('t2-banner').style.display = state.t2.group === 'B' ? 'none' : 'flex';
    document.getElementById('t2-body').style.top = g.dy + 'px';
  }
  // 알림O: 홈이 뜰 때 상단 알림이 위에서 내려오며 나타남
  function t2BannerIn() {
    var bn = document.getElementById('t2-banner');
    if (state.t2.group !== 'A' || !bn.animate) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // 처음엔 알림 없는 화면처럼 시작 → 리마인드 태그가 다 펼쳐진 뒤(약 0.95초) 알림이 일어서며 내려오고 아래 화면을 밀어냄
    var T0 = 1000;
    // 위에서 내려오면서 카드처럼 일어서며 자리 잡음: 처음부터 끝까지 한 번의 감속 곡선으로만 움직여 끊김 없이 (넘침·흔들림 없음)
    var EASE = 'cubic-bezier(.22,1,.36,1)';
    bn.animate([
      { transform: 'perspective(800px) translateY(-96px) rotateX(-70deg)' },
      { transform: 'perspective(800px) translateY(0) rotateX(0deg)' }
    ], { duration: 760, delay: T0, easing: EASE, fill: 'backwards' });
    bn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: T0, easing: 'ease-out', fill: 'backwards' });
    var body = document.getElementById('t2-body'), shift = T2.A.dy - T2.B.dy;
    body.animate([{ transform: 'translateY(' + (-shift) + 'px)' }, { transform: 'none' }],
      { duration: 760, delay: T0, easing: EASE, fill: 'backwards' });
  }
  function t2Reset() {
    t2SheetMax = 0;
    t2sec.classList.remove('quiz'); t2canvas.style.transform = ''; t2hole.style.cssText = ''; t2marks.textContent = ''; t2sheet.textContent = '';
    if (window.t2CarReset) window.t2CarReset();
    if (window.t2CommentReset) window.t2CommentReset(!state.t2.first && !state.t2.comments && !(state.t2.p && Object.keys(state.t2.p).some(function (k) { return (state.t2.p[k].comments || []).length; })));
    if (window.t2ReactReset) window.t2ReactReset();
    if (window.t2MoreReset) window.t2MoreReset();
    if (window.t2CatReset) window.t2CatReset();
    t2sec.querySelector('.z').scrollTop = 0; t2scroll.scrollTop = 0; t2canvas.style.transition = '';
  }
  // 질문 시트 높이에 맞춰 화면을 줄여 위쪽에 배치.
  // 질문마다 높이가 달라 화면이 움찔거리지 않도록, 그 집단 질문 중 가장 긴 시트 높이로 한 번만 맞춤
  var t2SheetMax = 0, t2SheetW = 0;
  function t2MeasureMax() {
    var g = T2[state.t2.group], keep = Array.prototype.slice.call(t2sheet.childNodes), max = 0;
    t2sheet.style.maxHeight = ''; t2sheet.style.minHeight = '';
    g.qs.forEach(function (q, i) { t2sheet.textContent = ''; t2sheet.appendChild(t2Build(i, true).wrap); max = Math.max(max, t2sheet.offsetHeight); });
    t2sheet.textContent = ''; keep.forEach(function (n) { t2sheet.appendChild(n); });
    t2SheetMax = max; t2SheetW = t2sheet.clientWidth;
  }
  function t2Fit() {
    if (!t2sec.classList.contains('quiz')) return;
    if (!t2SheetMax || t2SheetW !== t2sheet.clientWidth) t2MeasureMax();
    var g = T2[state.t2.group], s = parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1;
    var H = t2sec.clientHeight / s, h = g.hole, hw = h[2] - h[0], hh = h[3] - h[1], top = 14, gap = 12, gutter = 34;
    t2sheet.style.minHeight = ''; t2sheet.style.maxHeight = '';
    var sheetH = t2sheet.offsetHeight / s; // 지금 질문의 시트 높이에 맞춰 화면 크기를 정함 (바뀔 때는 부드럽게 확대/축소)
    // 왼쪽에 번호 표시가 들어갈 여백(gutter)을 남김
    var k = Math.min(1, (H - sheetH - top - gap) / hh, (390 - gutter * 2) / hw);
    // 질문마다 시트 윗선이 같도록 가장 긴 질문 높이로 고정
    if (k < 0.42) { k = 0.42; t2sheet.style.maxHeight = Math.max(200, (H - top - gap - hh * k) * s) + 'px'; }
    // 남는 세로 공간은 위아래로 나눠 화면을 가운데에 둠
    var avail = H - sheetH - top - gap, extra = Math.max(0, (avail - hh * k) / 2);
    var tx = (390 - hw * k) / 2 - h[0] * k, ty = top + extra - h[1] * k;
    t2canvas.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')';
    function box(r) { return { left: tx + r[0] * k, top: ty + r[1] * k, width: (r[2] - r[0]) * k, height: (r[3] - r[1]) * k }; }
    var b = box(h);
    t2hole.style.left = b.left + 'px'; t2hole.style.top = b.top + 'px'; t2hole.style.width = b.width + 'px'; t2hole.style.height = b.height + 'px';
    t2hole.style.borderRadius = Math.max(12, 22 * k) + 'px';
    if (!t2marks.children.length) g.marks.forEach(function (m) { var d = node('div', 't2mark'); d.appendChild(node('b', null, String(m[0]))); t2marks.appendChild(d); });
    g.marks.forEach(function (m, i) {
      var r = box([m[1], m[2], m[3], m[4]]), d = t2marks.children[i];
      d.style.left = r.left + 'px'; d.style.top = r.top + 'px'; d.style.width = r.width + 'px'; d.style.height = r.height + 'px';
      d.style.borderRadius = Math.max(10, 18 * k) + 'px';
    });
  }
  function t2Build(i, dry) {
    var g = T2[state.t2.group], q = g.qs[i], last = i === g.qs.length - 1;
    var wrap = node('div', dry ? '' : 't2body-in'); wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px';
    var top = node('div', 't2top'); top.appendChild(node('span', 'tag', q.tag)); top.appendChild(node('span', 't2step', (i + 1) + ' / ' + g.qs.length));
    wrap.appendChild(top);
    if (q.sit) wrap.appendChild(node('p', 't2sit', q.sit));
    var h = node('h1', 't2q', q.text); if (!dry) h.id = 't2-q'; wrap.appendChild(h);
    var group = node('div', 'opts'); group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-labelledby', 't2-q');
    var btn = node(last ? 'a' : 'button', 'cta', last ? '제출하기' : '다음');
    q.options.forEach(function (text, j) {
      var label = node('label', 'opt'), inp = document.createElement('input');
      inp.type = 'radio'; inp.name = (dry ? 't2dry' : 't2q') + i; inp.value = String(j);
      label.appendChild(inp); label.appendChild(node('span', 'mark')); label.appendChild(node('span', null, text));
      group.appendChild(label);
    });
    wrap.appendChild(group); wrap.appendChild(btn);
    return { wrap: wrap, group: group, btn: btn, q: q, last: last };
  }
  function t2Question() {
    var i = state.t2.step, B = t2Build(i), q = B.q, last = B.last, btn = B.btn, group = B.group;
    t2sheet.textContent = '';
    if (last) { btn.id = 't-submit2'; btn.href = '#'; btn.target = '_blank'; btn.rel = 'noopener'; }
    else { btn.type = 'button'; btn.id = 't2-next'; }
    function sync() {
      var a = state.t2.answers[i];
      group.querySelectorAll('.opt').forEach(function (label, j) { label.classList.toggle('sel', a === j); label.querySelector('input').checked = a === j; });
      if (last) { btn.setAttribute('aria-disabled', a == null ? 'true' : 'false'); if (a != null) refreshSubmit2(); }
      else btn.disabled = a == null;
    }
    group.querySelectorAll('input').forEach(function (inp, j) {
      inp.addEventListener('change', function () { state.t2.answers[i] = j; ev(q.tag + ' ' + (j + 1) + '번'); sync(); });
    });
    t2sheet.appendChild(B.wrap);
    state.t2.qAt = Date.now();
    if (last) {
      ['pointerdown', 'touchstart', 'mousedown', 'focus'].forEach(function (t) { btn.addEventListener(t, refreshSubmit2, { passive: true }); });
      btn.addEventListener('click', function (e) {
        if (state.t2.answers[i] == null) { e.preventDefault(); return; }
        t2Done(i);
        if (!FORM_URL) { e.preventDefault(); go('end'); return; }
        refreshSubmit2();
        setTimeout(function () { go('done'); }, 0);
      });
    } else btn.addEventListener('click', function () { t2Done(i); state.t2.step = i + 1; t2Question(); });
    sync();
    t2sheet.scrollTop = 0;
    t2Fit();
  }
  function t2Done(i) { if (state.t2.qAt) state.t2.qms[i] = (state.t2.qms[i] || 0) + (Date.now() - state.t2.qAt); state.t2.qAt = Date.now(); }
  function refreshSubmit2() {
    var b = document.getElementById('t-submit2'); if (!b) return;
    t2Done(state.t2.step); stamp(); b.href = FORM_URL ? formLink() : '#';
  }
  t2scroll.addEventListener('scroll', function () { if (state.current === 't2home' && !t2sec.classList.contains('quiz')) state.t2.scrollMax = Math.max(state.t2.scrollMax || 0, Math.round(t2scroll.scrollTop / (parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1))); }, { passive: true });
  // 태스크 2 홈의 게시물 3개(Clare 리마인드, maka, Yeeun)에 같은 인터랙션을 적용
  //  넘기기(1장만 실제 사진, 나머지는 회색) · 많이 받은 반응 표시(1장에 묶임) · 간편 반응(3초 머무르면 바) · 더 보기 펼침 + 댓글 쓰기
  var T2POSTS = [
    { key: 'clare', cat: '수집/빈티지', name: 'Clare', root: document.getElementById('t2-remind'), carTop: 36, base: 385, openTop: 334, noChips: true, noReact: true, reacts: [], preview: ['mybossmn', 'ㅋㅋㅋㅋ나도 사줘'], total: 4, pvLeft: 25 },
    { key: 'maka', cat: '수집/빈티지', name: 'maka', root: document.getElementById('t2-p-maka'), carTop: 0, base: 350, reacts: [{ e: '💕', l: '하트' }], preview: ['hana.k', '키티 밑에 클로버 키링 가격 궁금해요🥹 넘 예뻐...'], total: 1, pvLeft: 25 },
    // 새로운 게시물은 올라온 시간 순서(최근이 위). 사진은 추후 교체, 추가한 게시물은 기본 댓글 없음
    { key: 'd1', cat: '다꾸', name: 'dami.log', root: document.getElementById('t2-p-d1'), carTop: 0, base: 329.86, reacts: [{ e: '💕', l: '하트' }], preview: null, total: 0, pvLeft: 25 },
    { key: 'yeeun', cat: '수집/빈티지', name: 'Yeeun', root: document.getElementById('t2-p-yeeun'), carTop: 0, base: 329.86, reacts: [{ e: '💕', l: '하트' }], preview: null, total: 0, pvLeft: 25 },
    { key: 'd2', cat: '다꾸', name: 'maka', root: document.getElementById('t2-p-d2'), carTop: 0, base: 329.86, reacts: [{ e: '💕', l: '하트' }], preview: null, total: 0, pvLeft: 25 },
    { key: 'd3', cat: '다꾸', name: 'Yeeun', root: document.getElementById('t2-p-d3'), carTop: 0, base: 329.86, reacts: [{ e: '💕', l: '하트' }], preview: null, total: 0, pvLeft: 25 }
  ];
  // 게시물별 기록: Clare는 기존 기록 항목 그대로(state.t2), 다른 게시물은 state.t2.p[key]
  function t2S(P) { if (P.key === 'clare') return state.t2; state.t2.p = state.t2.p || {}; return state.t2.p[P.key] = state.t2.p[P.key] || {}; }
  function t2Busy() { return state.current !== 't2home' || t2sec.classList.contains('quiz'); }
  // 펼친 게시물만큼 아래 게시물·페이지 길이를 밀어 줌
  function t2Layout() {
    var C = T2POSTS[0], rH = C.h || C.base;
    C.root.style.height = rH + 'px';
    var news = document.getElementById('t2-new'), page = document.getElementById('t2-page');
    if (C.root.hidden) rH = -32; // 리마인드가 꺼진 카테고리면 그 자리까지 새 게시물이 올라옴
    news.style.top = (190 + rH + 32) + 'px';
    // 새로운 게시물들은 위에서부터 차례로 쌓음 (게시물 사이 28px)
    var y = 36, last = 0;
    T2POSTS.slice(1).forEach(function (P) { if (P.root.hidden) return; var h = P.h || P.base; P.root.style.top = y + 'px'; P.root.style.height = h + 'px'; last = y + h; y = last + 28; });
    var nH = last + 16; news.style.height = nH + 'px';
    page.style.height = (1580 + (rH - 385) + (nH - 760)) + 'px';
  }
  T2POSTS.forEach(function (P) {
    var R = P.root;
    P.car = R.querySelector('.t2car'); P.cards = Array.prototype.slice.call(P.car.querySelectorAll('.t2c'));
    P.cnt = P.car.querySelector('.t2cnt'); P.rx = R.querySelector('.t2rx'); P.bar = R.querySelector('.t2rbar'); P.fx = R.querySelector('.t2fx');
    P.more = R.querySelector('.t2more'); P.open = R.querySelector('.t2open'); P.foldBtn = R.querySelector('.t2foldbtn');
    P.cbtn = R.querySelector('.t2cbtn'); P.count = R.querySelector('.t2ccount'); P.list = R.querySelector('.t2comments');
    P.pname = R.querySelector('.t2pname'); P.ptext = R.querySelector('.t2ptext'); P.ago = R.querySelector('.t2ago');
    P.folded = Array.prototype.slice.call(R.querySelectorAll('.t2fold'));
    P.listHTML = P.list.innerHTML; P.rxHTML = P.rx.innerHTML; P.agoTop = parseFloat(P.ago.style.top); P.base0 = P.base;
    if (P.openTop == null) P.openTop = parseFloat(P.open.style.top);
    P.h = 0; P.since = 0; P.done = false; P.shownAt = 0;
    P.label = P.key === 'clare' ? P.name : P.name + ' ' + R.querySelector('.ctitle').textContent;
  });

  // ── 넘기기: 가운데 = 현재 장, 오른쪽 뒤로 다음 장, 왼쪽 뒤로 이전 장이 살짝 보임
  // opt: scroll(세로 스크롤 영역), busy(), onGo(cur, N) — 태스크 1 홈의 Clare 게시물도 같은 넘기기를 씀
  function makeCar(P, opt) {
    var car = P.car, cards = P.cards, cnt = P.cnt;
    var N = cards.length, cur = 0, x0 = null, y0 = 0, dx = 0, dragging = false, moved = false;
    cards.forEach(function (c) { var ims = c.querySelectorAll(':scope > img'); if (!ims.length) return; var b = document.createElement('i'); b.className = 't2blur'; b.setAttribute('aria-hidden', 'true'); ims[ims.length - 1].after(b); c._blur = b; });
    var MAIN = { l: 16, t: 0, w: 358, h: 282.864 }, PW = 317.672, PH = 251, PT = 16;
    function k() { return car.getBoundingClientRect().width / 390 || 1; }
    // 뒤에 깔린 장은 크기를 바꾸지 않고 통째로 축소(scale)해서, 안의 글자·사진이 잘리거나 밀리지 않게 함
    var SC = PH / MAIN.h, RX = MAIN.w + 7.672 - PW, LX = -7.672;
    var POS = { main: [0, 0, 1], right: [RX, PT, SC], left: [LX, PT, SC] };
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function tfs(p) { return 'translate(' + p[0] + 'px,' + p[1] + 'px) scale(' + p[2] + ')'; }
    function place(anim) {
      // 끄는 동안: 가운데 장은 손가락을 따라가고, 옆 장은 끄는 만큼 가운데 자리로 함께 다가옴
      var t = Math.min(1, Math.abs(dx) / 260), toNext = dx < 0 && cur < N - 1, toPrev = dx > 0 && cur > 0;
      cards.forEach(function (c, i) {
        var d = i - cur, st = c.style, z, o = 1, p;
        if (d === 0) { z = 3; p = [dx, 0, 1 - (1 - SC) * 0.35 * t]; }
        else if (d === 1) { z = toNext ? 2 : 1; p = toNext ? lerp(POS.right, POS.main, t * 0.85) : POS.right; }
        else if (d === -1) { z = toPrev ? 2 : 1; p = toPrev ? lerp(POS.left, POS.main, t * 0.85) : POS.left; }
        else { z = 0; o = 0; p = d > 0 ? POS.right : POS.left; }
        c.classList.toggle('drag', !anim);
        st.zIndex = z; st.opacity = o; st.transform = tfs(p);
        // 모든 회색 장은 같은 색. 가운데 장만 그림자로 앞에 떠 있게 구분, 안 보이는 장은 완전히 숨김
        st.boxShadow = d === 0 ? '0 3px 8px rgba(0,0,0,0.07)' : 'none';
        // 뒤에 깔린 장은 흐리게: 끌어서 가운데로 다가오는 장은 그만큼 선명해짐
        var bl = d === 0 ? 0 : ((d === 1 && toNext) || (d === -1 && toPrev)) ? 3 * (1 - t) : 3;
        if (c._blur) c._blur.style.opacity = (bl / 3).toFixed(3);
        st.visibility = o ? '' : 'hidden'; // 'visible'로 두면 화면(section)이 숨겨져도 카드만 보이므로 비워 둠
      });
      cnt.querySelector('b').textContent = cur + 1;
    }
    function go(n) {
      n = Math.max(0, Math.min(N - 1, n));
      if (n !== cur) { cur = n; opt.onGo(cur, N); }
      dx = 0; place(true);
    }
    // 카드 위에서는 방향을 먼저 정한 뒤 그 방향으로만 움직임: 좌우면 넘기기, 확실한 위아래일 때만 화면 스크롤
    var lastX = 0, lastY = 0, lastT = 0, vel = 0, vy = 0, mode = null, sc0 = 0, glide = null, pid = null;
    car.addEventListener('pointerdown', function (e) {
      if (opt.busy()) return;
      if (glide) { cancelAnimationFrame(glide); glide = null; }
      x0 = e.clientX; y0 = e.clientY; dx = 0; dragging = false; moved = false; mode = null; sc0 = opt.scroll.scrollTop; pid = e.pointerId;
      lastX = e.clientX; lastY = e.clientY; lastT = e.timeStamp; vel = 0; vy = 0;
    });
    car.addEventListener('pointermove', function (e) {
      if (x0 == null) return;
      var mx = (e.clientX - x0) / k(), my = (e.clientY - y0) / k();
      var dt = e.timeStamp - lastT;
      if (dt > 0) { vel = 0.7 * vel + 0.3 * ((e.clientX - lastX) / k() / dt); vy = 0.7 * vy + 0.3 * ((e.clientY - lastY) / k() / dt); }
      lastX = e.clientX; lastY = e.clientY; lastT = e.timeStamp;
      if (!mode) {
        if (Math.abs(mx) > 4 && Math.abs(mx) >= Math.abs(my) * 0.8) mode = 'h';
        else if (Math.abs(my) > 4 && Math.abs(my) > Math.abs(mx) * 1.25) { mode = 'v'; x0 = null; return; } // 위아래는 기본 스크롤에 맡김
        else return;
        // 방향이 정해진 뒤에만 손가락을 붙잡음 (카드 안 버튼은 그냥 누르면 눌리도록)
        try { car.setPointerCapture(pid); } catch (er) {}
      }
      moved = true;
      if (mode === 'v') { opt.scroll.scrollTop = sc0 - my; return; }
      dragging = true;
      dx = mx; if ((cur === 0 && dx > 0) || (cur === N - 1 && dx < 0)) dx = dx / 3;
      place(false);
    });
    // 놓을 때: 조금만 밀어도(약 1/8 폭) 또는 빠르게 튕기면 다음 장으로. 위아래였다면 살짝 미끄러지며 멈춤
    function end() {
      if (x0 == null) return; x0 = null;
      if (mode === 'v') {
        var v = -vy * 16, f = function () { v *= 0.92; if (Math.abs(v) < 0.5) { glide = null; return; } opt.scroll.scrollTop += v; glide = requestAnimationFrame(f); };
        glide = requestAnimationFrame(f); mode = null; return;
      }
      mode = null;
      if (!dragging) return; dragging = false;
      if (dx < -45 || vel < -0.35) go(cur + 1); else if (dx > 45 || vel > 0.35) go(cur - 1); else { dx = 0; place(true); }
    }
    car.addEventListener('pointerup', end); car.addEventListener('pointercancel', end);
    // 좌우로 미는 중에는 손가락이 살짝 위아래로 흔들려도 화면이 같이 스크롤되지 않게 막음 (넘기기가 끊기지 않도록)
    //  처음 몇 px에서 좌우가 더 크면 좌우로 고정, 위아래가 확실히 크면 기본 스크롤에 맡김
    var tx0 = 0, ty0 = 0, tlock = null;
    car.addEventListener('touchstart', function (e) { var t = e.touches[0]; tx0 = t.clientX; ty0 = t.clientY; tlock = null; }, { passive: true });
    car.addEventListener('touchmove', function (e) {
      if (opt.busy()) return;
      var t = e.touches[0], ax = Math.abs(t.clientX - tx0), ay = Math.abs(t.clientY - ty0);
      if (!tlock) { if (ax < 3 && ay < 3) return; tlock = ax >= ay * 0.8 ? 'h' : 'v'; }
      if (tlock === 'h' && e.cancelable) e.preventDefault();
    }, { passive: false });
    car.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); moved = false; } }, true);
    P.carReset = function () { cur = 0; dx = 0; place(true); };
    P.jump = function (n) { cur = Math.max(0, Math.min(N - 1, n)); dx = 0; place(false); };
    place(true);
  }
  T2POSTS.forEach(function (P) {
    makeCar(P, { scroll: t2scroll, busy: function () { return t2sec.classList.contains('quiz'); },
      onGo: function (cur, N) { var S = t2S(P); S.swipeMax = Math.max(S.swipeMax || 1, cur + 1); ev(P.label + ' 게시물 넘김 ' + (cur + 1) + '/' + N); } });
  });
  window.t2CarReset = function () { T2POSTS.forEach(function (P) { P.carReset(); }); };
  // ── 태스크 1 홈: Clare 리마인드 + 새 게시물(maka, Yeeun) 넘기기 · 더 보기 · 댓글 보기 (댓글 쓰기는 막고 안내)
  (function () {
    var hs = document.getElementById('home-scroll'), news = document.getElementById('h-new'), page = document.getElementById('h-page');
    var toast = document.getElementById('h-toast'), tt = null;
    function busy() { return state.current !== 'home'; }
    function H(key) { if (key === 'clare') return state.h1; state.h1.p = state.h1.p || {}; return state.h1.p[key] = state.h1.p[key] || {}; }
    var C = { key: 'clare', name: 'Clare', root: document.getElementById('h-remind'), car: document.getElementById('h-car'), base: 385, openTop: 334,
      open: document.getElementById('h-open'), more: document.getElementById('h-more'), foldBtn: document.getElementById('h-fold'), cbtn: document.getElementById('h-cbtn') };
    C.folded = Array.prototype.slice.call(C.root.querySelectorAll('.hfold'));
    var POSTS = [C].concat([['maka', 'maka', 350], ['yeeun', 'Yeeun', 329.86]].map(function (o) {
      var R = document.getElementById('h-p-' + o[0]);
      return { key: o[0], name: o[1], root: R, car: R.querySelector('.t2car'), base: o[2], open: R.querySelector('.t2open'), more: R.querySelector('.t2more'),
        foldBtn: R.querySelector('.t2foldbtn'), cbtn: R.querySelector('.t2cbtn'), folded: Array.prototype.slice.call(R.querySelectorAll('.t2fold')) };
    }));
    function layout() {
      var rH = C.h || C.base; C.root.style.height = rH + 'px';
      news.style.top = (126 + rH + 32) + 'px';
      var y = 36, last = 0;
      POSTS.slice(1).forEach(function (P) { var h = P.h || P.base; P.root.style.top = y + 'px'; P.root.style.height = h + 'px'; last = y + h; y = last + 28; });
      var nH = last + 16; news.style.height = nH + 'px';
      page.style.height = (1476 + (rH - 385) + (nH - 760)) + 'px';
    }
    POSTS.forEach(function (P) {
      P.cards = Array.prototype.slice.call(P.car.querySelectorAll('.t2c')); P.cnt = P.car.querySelector('.t2cnt');
      if (P.openTop == null) P.openTop = parseFloat(P.open.style.top);
      makeCar(P, { scroll: hs, busy: busy, onGo: function (cur, N) { var S = H(P.key); S.swipeMax = Math.max(S.swipeMax || 1, cur + 1); ev(P.name + ' 게시물 넘김 ' + (cur + 1) + '/' + N); } });
      P.setOpen = function (on) {
        P.open.hidden = !on;
        P.folded.forEach(function (e) { if (e.hasAttribute('data-nopv')) return; e.hidden = on; });
        P.h = on ? Math.max(P.base, P.openTop + P.open.offsetHeight + 12) : 0;
        layout();
      };
      function tap(el, fn) { el.addEventListener('click', function (e) { e.stopPropagation(); if (busy()) return; fn(); }); }
      tap(P.more, function () { P.setOpen(true); H(P.key).opened = true; ev(P.name + ' 게시물 더 보기'); });
      tap(P.foldBtn, function () { P.setOpen(false); ev(P.name + ' 게시물 접기'); });
      tap(P.cbtn, function () {
        state.h1.cTry = (state.h1.cTry || 0) + 1; ev(P.name + ' 댓글 쓰기 시도');
        toast.hidden = true; void toast.offsetWidth; toast.hidden = false;
        clearTimeout(tt); tt = setTimeout(function () { toast.hidden = true; }, 1800);
      });
    });
    // 원래 미리보기 댓글이 없는 게시물(Yeeun)은 접어도 미리보기 줄을 보이지 않음
    POSTS.forEach(function (P) { P.folded.forEach(function (e) { if (e.hidden) e.setAttribute('data-nopv', ''); }); });
    window.hReset = function () { POSTS.forEach(function (P) { P.carReset(); P.setOpen(false); }); toast.hidden = true; };
    layout();
  })();

  // ── 2차 John 게시글: '굳세어라 산책day'(3장)와 '중앙공원 한바퀴'(2장) 넘기기. 게시글·펼침 화면의 첫 게시물은 같은 장을 보여줌
  (function () {
    function mk(id, scrollId, screen) { var car = document.getElementById(id); return { car: car, cards: Array.prototype.slice.call(car.querySelectorAll('.t2c')), cnt: car.querySelector('.t2cnt'), scroll: document.getElementById(scrollId), screen: screen }; }
    var A = mk('p-car1', 'post-scroll', 'post'), B = mk('po-car1', 'postopen-scroll', 'postopen'), C = mk('p-car2', 'post-scroll', 'post'), D = mk('po-car2', 'postopen-scroll', 'postopen');
    function Z() { return state.zcar = state.zcar || { p1: 1, p2: 1 }; }
    [[A, 'p1', '굳세어라 산책day', B], [B, 'p1', '굳세어라 산책day', A], [C, 'p2', '중앙공원 한바퀴', D], [D, 'p2', '중앙공원 한바퀴', C]].forEach(function (o) {
      var P = o[0];
      makeCar(P, { scroll: P.scroll, busy: function () { return state.current !== P.screen; },
        onGo: function (cur, N) { var z = Z(); z[o[1]] = Math.max(z[o[1]] || 1, cur + 1); ev('John ' + o[2] + ' 넘김 ' + (cur + 1) + '/' + N); if (o[3]) o[3].jump(cur); } });
    });
    window.zCarReset = function () { [A, B, C, D].forEach(function (P) { P.carReset(); }); };
  })();

  // ── '더 보기' 펼치기/접기
  T2POSTS.forEach(function (P) {
    P.setOpen = function (on) {
      P.open.hidden = !on;
      P.folded.forEach(function (e) { if (e === P.pname || e === P.ptext) e.hidden = on || !P.hasPreview; else e.hidden = on; });
      P.h = on ? Math.max(P.base, P.openTop + P.open.offsetHeight + 12) : 0;
      t2Layout();
    };
    P.more.addEventListener('click', function () { if (t2Busy()) return; P.setOpen(true); t2S(P).opened = true; ev(P.label + ' 게시물 더 보기'); });
    P.foldBtn.addEventListener('click', function () { if (t2Busy()) return; P.setOpen(false); ev(P.label + ' 게시물 접기'); });
  });
  window.t2MoreReset = function () { T2POSTS.forEach(function (P) { P.setOpen(false); }); };
  window.t2MoreRefresh = function () { T2POSTS.forEach(function (P) { if (!P.open.hidden) P.setOpen(true); }); };

  // ── 댓글 쓰기 (탐색 화면 전용, 미션 진행과는 무관). 입력창은 하나를 같이 쓰고, 연 게시물에 댓글이 달림
  (function () {
    var comp = document.getElementById('t2-composer'), dim = document.getElementById('t2-cdim');
    var input = document.getElementById('t2-cinput'), send = document.getElementById('t2-csend');
    var MAX = 10, SHOW = 6, A = null;
    // 접힌 상태의 미리보기 댓글 한 줄도 가장 최근 댓글로 바꿈 (댓글이 없던 게시물은 한 줄이 새로 생기고 아래가 밀림)
    function setPreview(P, name, text) {
      P.hasPreview = !!name;
      if (!name) { P.pname.hidden = true; P.ptext.hidden = true; }
      else {
        P.pname.textContent = name; P.ptext.textContent = text;
        var hid = P.pname.hidden; P.pname.hidden = false; var w = P.pname.offsetWidth; P.pname.hidden = hid;
        P.ptext.style.left = (P.pvLeft + w + 6) + 'px'; P.ptext.style.maxWidth = (340 - w - 6) + 'px';
        if (P.open.hidden) { P.pname.hidden = false; P.ptext.hidden = false; }
      }
      var add = (name && !P.preview) ? 20 : 0; // 원래 미리보기 줄이 없던 게시물(Yeeun)
      P.ago.style.top = (P.agoTop + add) + 'px'; P.base = P.base0 + add;
      if (P.open.hidden) t2Layout();
    }
    function sync() { send.disabled = !A || !input.value.trim() || A.total >= MAX; }
    // 댓글이 7개 이상이면 6개 높이까지만 보이고 목록 안에서 스크롤
    function fit(P) {
      var list = P.list, n = list.children.length;
      if (n > SHOW) {
        var h = list.children[SHOW].offsetTop - list.children[0].offsetTop + 8;
        list.style.maxHeight = h + 'px'; list.style.overflowY = 'auto'; list.style.overscrollBehavior = 'contain';
      } else { list.style.maxHeight = ''; list.style.overflowY = ''; }
    }
    // 프로토타입 한정: 10개가 되면 더 쓰지 못하게 하고 이유를 입력칸에 안내
    function fitInput() {
      var full = !!A && A.total >= MAX;
      input.disabled = full; input.style.fontSize = full ? '14px' : ''; input.placeholder = full ? '프로토타입은 댓글 10개까지 지원해요' : (A ? A.name : 'Clare') + ' 님에게 댓글 달기...';
      if (full) input.value = '';
      sync();
    }
    function lift() {
      kbFit();
      var vv = window.visualViewport;
      if (!vv || comp.hidden) { comp.style.bottom = '0px'; return; }
      var r = stage.getBoundingClientRect(); comp.style.bottom = Math.max(0, r.bottom - (vv.offsetTop + vv.height)) + 'px';
    }
    function openC(P) { if (t2Busy()) return; if (A !== P) input.value = ''; A = P; fitInput(); comp.hidden = false; dim.hidden = false; ev(P.label + ' 댓글 쓰기 열기'); try { input.focus(); } catch (e) {} } // iOS는 탭과 같은 순간에 focus해야 키보드가 뜸
    function closeC() { comp.hidden = true; dim.hidden = true; try { input.blur(); } catch (e) {} lift(); }
    T2POSTS.forEach(function (P) { P.cbtn.addEventListener('click', function (e) { e.stopPropagation(); openC(P); }); });
    // 댓글 쓰는 중에도 피드는 스크롤되고(dim은 터치를 통과시킴), 입력창 바깥을 탭하면 닫힘
    stage.addEventListener('click', function (e) {
      if (comp.hidden || comp.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation(); closeC();
    }, true);
    comp.querySelectorAll('.emo').forEach(function (b) { b.addEventListener('click', function () { input.value += b.textContent; sync(); try { input.focus(); } catch (e) {} }); });
    input.addEventListener('input', sync);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); post(); } });
    send.addEventListener('click', post);
    function post() {
      var P = A, text = input.value.trim(); if (!P || !text || P.total >= MAX) return;
      var list = P.list;
      var row = node('div', 'cmt new'); row.setAttribute('data-z', '댓글');
      var av = node('div', 'av me'); av.innerHTML = '<svg width="22" height="22" aria-hidden="true"><use href="#i-person"/></svg>';
      var body = node('div', 'body'), head = node('div', 'head');
      head.appendChild(node('span', 'cm-name', 'wezip_tester')); head.appendChild(node('span', 'cm-ago', '방금'));
      body.appendChild(head); body.appendChild(node('div', 'text', text)); row.appendChild(av); row.appendChild(body);
      list.insertBefore(row, list.firstChild);
      while (list.children.length > MAX) list.removeChild(list.lastElementChild);
      P.total += 1; P.count.textContent = String(P.total);
      var S = t2S(P); S.comments = (S.comments || []).concat(text);
      ev(P.label + ' 게시물 댓글: ' + text);
      setPreview(P, 'wezip_tester', text);
      input.value = ''; fit(P); fitInput(); list.scrollTop = 0; closeC();
      if (!P.open.hidden) P.setOpen(true);
    }
    if (window.visualViewport) { window.visualViewport.addEventListener('resize', lift); window.visualViewport.addEventListener('scroll', lift); }
    T2POSTS.forEach(function (P) { P.total0 = P.total; setPreview(P, P.preview && P.preview[0], P.preview && P.preview[1]); });
    window.t2CommentReset = function (all) {
      closeC();
      if (all) T2POSTS.forEach(function (P) { P.list.innerHTML = P.listHTML; P.total = P.total0; P.count.textContent = String(P.total0); setPreview(P, P.preview && P.preview[0], P.preview && P.preview[1]); fit(P); });
      if (all) { input.value = ''; A = null; }
    };
  })();

  // ── 간편 반응: 게시물이 화면에 보이는 채로 3초 머무르면 그 게시물에 반응 바가 뜸 (한 번에 하나만)
  //  위아래 스크롤하면 0초부터 다시, 카드 넘기기는 같은 게시물에 머무는 것으로 봄. 게시물마다 한 번 반응하면 끝(취소 불가)
  (function () {
    var timer = null;
    function ratio(P) {
      var c = P.car.getBoundingClientRect(), v = t2z.getBoundingClientRect();
      var top = Math.max(c.top, v.top), bot = Math.min(c.bottom, v.bottom);
      return c.height > 0 ? Math.max(0, bot - top) / c.height : 0;
    }
    function anyBar() { return T2POSTS.filter(function (P) { return !P.bar.hidden; })[0]; }
    function resetAll() { T2POSTS.forEach(function (P) { P.since = 0; }); }
    function active() { return !t2Busy() && document.getElementById('t2-composer').hidden; }
    function tick() {
      if (!active() || anyBar()) return;
      var now = Date.now(), ready = [];
      T2POSTS.forEach(function (P) {
        var r = P.done ? 0 : ratio(P);
        if (r < 0.7) { P.since = 0; return; }
        if (!P.since) P.since = now;
        if (now - P.since >= 3000) ready.push({ P: P, r: r });
      });
      if (!ready.length) return;
      ready.sort(function (a, b) { return b.r - a.r; });
      var P = ready[0].P;
      P.bar.hidden = false; P.rbarHome(); P.shownAt = now; resetAll();
      var S = t2S(P); S.reactShown = (S.reactShown || 0) + 1; ev(P.label + ' 간편 반응 바 표시');
    }
    // 반응 바 좌우 밀기: 바깥 스크롤 영역이 세로 밀기만 허용해서 직접 처리
    T2POSTS.forEach(function (P) {
      var bar = P.bar, row = bar.querySelector('.t2rrow'), x0 = null, off = 0, start = 0, moved = false, vel = 0, lastX = 0, lastT = 0;
      function maxOff() { return Math.max(0, row.scrollWidth - bar.clientWidth); }
      function k() { return bar.getBoundingClientRect().width / 362 || 1; }
      function set(v, glide) { off = v; row.classList.toggle('glide', !!glide); row.style.transform = 'translateX(' + (-off) + 'px)'; }
      // 손가락을 따라 바로 움직이고(3px부터), 놓을 때 튕긴 속도만큼 더 미끄러지며 멈춤
      bar.addEventListener('pointerdown', function (e) {
        // 미끄러지는 중이면 지금 보이는 위치에서 바로 잡음
        if (row.classList.contains('glide')) { var mtx = new DOMMatrixReadOnly(getComputedStyle(row).transform); set(-mtx.m41, false); }
        x0 = e.clientX; start = off; moved = false; vel = 0; lastX = e.clientX; lastT = e.timeStamp; e.stopPropagation();
      });
      bar.addEventListener('pointermove', function (e) {
        if (x0 == null) return; var d = (e.clientX - x0) / k(), dt = e.timeStamp - lastT;
        if (dt >= 8) { vel = 0.6 * vel + 0.4 * (-(e.clientX - lastX) / k() / dt); lastX = e.clientX; lastT = e.timeStamp; } // 너무 촘촘한 표본은 모아서 계산
        if (!moved && Math.abs(d) > 3) { moved = true; try { bar.setPointerCapture(e.pointerId); } catch (er) {} }
        if (!moved) return;
        var v = start - d, m = maxOff(); if (v < 0) v = v / 2.5; if (v > m) v = m + (v - m) / 2.5;
        set(v, false); e.stopPropagation();
      });
      function end(e) {
        if (x0 == null) return; x0 = null;
        if (e && e.timeStamp - lastT > 90) vel = 0; // 멈췄다가 놓으면 그 자리에
        var fling = Math.abs(off - start) < 10 ? 0 : Math.max(-420, Math.min(420, vel * 260)); // 아주 짧게 민 건 튕기지 않음
        set(Math.max(0, Math.min(maxOff(), off + (moved ? fling : 0))), true);
      }
      bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
      bar.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
      P.rbarHome = function () { set(0, false); };
    });
    function hideBars() { T2POSTS.forEach(function (P) { if (!P.bar.hidden) { P.bar.hidden = true; ev(P.label + ' 간편 반응 바 닫힘(스크롤)'); } }); }
    t2scroll.addEventListener('scroll', function () { resetAll(); hideBars(); }, { passive: true });
    window.t2ReactStart = function () { resetAll(); if (!timer) timer = setInterval(tick, 200); };
    window.t2ReactStop = function () { clearInterval(timer); timer = null; T2POSTS.forEach(function (P) { P.bar.hidden = true; }); resetAll(); };
    function initReacts(P) { P.done = !!P.noReact; // 리마인드 게시물은 간편 반응 없음 (두드리기만)
      P.reactList = P.reacts.map(function (r) { return { e: r.e, l: r.l, n: 1 }; }); P.rx.innerHTML = P.rxHTML; P.fx.textContent = ''; }
    T2POSTS.forEach(initReacts);
    // 반응하지 않은 게시물만 처음 상태로 (반응한 게시물은 그대로 유지)
    window.t2ReactReset = function () { T2POSTS.forEach(function (P) { if (!t2S(P).reaction) initReacts(P); }); };
    function burst(P, emoji) {
      var c = P.car.getBoundingClientRect(), r = P.fx.getBoundingClientRect(), k = r.width / 390 || 1;
      var baseX = (c.right - r.left) / k - 78, baseY = (c.bottom - r.top) / k - 70;
      for (var i = 0; i < 5; i++) (function (i) {
        setTimeout(function () {
          var e = document.createElement('span'); e.textContent = emoji;
          e.style.left = (baseX + (Math.random() * 36 - 18)) + 'px'; e.style.top = (baseY + (Math.random() * 16 - 8)) + 'px';
          e.style.setProperty('--dx', (Math.random() * 50 - 30) + 'px'); e.style.setProperty('--rot', (Math.random() * 30 - 15) + 'deg');
          e.style.fontSize = (20 + Math.random() * 12) + 'px';
          P.fx.appendChild(e); setTimeout(function () { e.remove(); }, 1500);
        }, i * 100);
      })(i);
    }
    // 고른 반응을 위로: 이미 있던 반응이면 숫자를 올려 맨 위로, 새 반응이면 맨 위에 넣고 아래 반응은 밀려 내려가 사라짐
    //  표시는 최대 2개, 아래쪽(243px)부터 채움
    function updateChips(P, e, l) {
      var rx = P.rx, reacts = P.reactList, old = reacts.map(function (r) { return r.l; });
      var hit = reacts.filter(function (r) { return r.l === l; })[0];
      if (hit) { hit.n += 1; reacts = [hit].concat(reacts.filter(function (r) { return r !== hit; })); }
      else reacts = [{ e: e, l: l, n: 1 }].concat(reacts);
      P.reactList = reacts;
      var top2 = reacts.slice(0, 2), Y = top2.length === 1 ? [243] : [217, 243];
      var els = Array.prototype.slice.call(rx.children);
      var byL = {}; els.forEach(function (el, i) { byL[old[i]] = el; });
      top2.forEach(function (r, i) {
        var el = byL[r.l];
        if (!el) { el = node('div', 'react', r.e + ' ' + r.l); el.setAttribute('data-z', P.name + ' 반응 버튼'); el.style.top = (Y[0] - 26) + 'px'; el.style.opacity = '0'; rx.insertBefore(el, rx.firstChild); void el.offsetWidth; }
        el.style.top = Y[i] + 'px'; el.style.opacity = '1'; delete byL[r.l];
      });
      Object.keys(byL).forEach(function (k) { var el = byL[k]; el.style.top = (Y[Y.length - 1] + 26) + 'px'; el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 400); });
    }
    T2POSTS.forEach(function (P) {
      P.bar.querySelectorAll('.t2rchip').forEach(function (b) {
        b.addEventListener('click', function (ev0) {
          ev0.stopPropagation();
          if (P.done) return; P.done = true; P.bar.hidden = true; resetAll();
          var e = b.getAttribute('data-e'), l = b.getAttribute('data-l'), S = t2S(P);
          S.reaction = l; S.reactMs = Date.now() - P.shownAt;
          ev(P.label + ' 간편 반응: ' + l);
          burst(P, e); if (!P.noChips) updateChips(P, e, l); // 리마인드 카드는 반응 표시 자리에 두드리기가 있어 숫자 칩은 생략
        });
      });
    });
  })();
  // ── 카테고리 탭: 누를 때마다 켜고 끔. 켜진 카테고리의 게시물만 보임 (리마인드 게시물 포함, 최소 1개는 켜져 있어야 함)
  var T2CAT0 = { '수집/빈티지': true, '다꾸': false, '반려동물': true }, t2Cat = {};
  function t2CatApply() {
    Array.prototype.forEach.call(document.querySelectorAll('#t2-tabs [data-cat]'), function (sp) {
      var on = !!t2Cat[sp.getAttribute('data-cat')]; sp.style.color = on ? '' : '#C4C4C4';
    });
    T2POSTS.forEach(function (P) {
      var show = !!t2Cat[P.cat];
      if (!show && !P.root.hidden) { P.setOpen(false); P.bar.hidden = true; P.since = 0; }
      P.root.hidden = !show;
    });
    t2Layout();
  }
  window.t2CatReset = function () { t2Cat = {}; Object.keys(T2CAT0).forEach(function (k) { t2Cat[k] = T2CAT0[k]; }); t2CatApply(); };
  Array.prototype.forEach.call(document.querySelectorAll('#t2-tabs [data-cat]'), function (sp) {
    sp.addEventListener('click', function () {
      return; // 탐색 범위 축소: 카테고리 탭은 지금 상태로 고정 (누르면 탭 위치만 기록됨)
      if (t2Busy()) return;
      var c = sp.getAttribute('data-cat'), on = !t2Cat[c];
      if (!on && Object.keys(t2Cat).filter(function (k) { return t2Cat[k]; }).length <= 1) return; // 마지막 하나는 끌 수 없음
      t2Cat[c] = on; t2CatApply();
      state.t2.cats = (state.t2.cats || []).concat(c + (on ? ' 켬' : ' 끔'));
      ev('카테고리 ' + c + (on ? ' 켬' : ' 끔'));
    });
  });
  window.t2CatReset();
  // 탐색 중 탭: 화면은 그대로 두고 위치만 기록
  t2z.addEventListener('click', function (e) {
    if (state.current !== 't2home' || t2sec.classList.contains('quiz')) return;
    var zEl = e.target.closest('[data-z]'), r = t2z.getBoundingClientRect(), s = r.width / 390, sc = t2scroll.scrollTop / s;
    var tap = { zone: zEl ? zEl.getAttribute('data-z') : '빈 곳', x: Math.round((e.clientX - r.left) / s), y: Math.round((e.clientY - r.top) / s + sc) };
    if (!state.t2.first) state.t2.first = tap;
    state.t2.taps = state.t2.taps || [];
    if (state.t2.taps.length < 30) state.t2.taps.push(tap.zone + ' (' + tap.x + ',' + tap.y + ')');
    ev('탐색 탭: ' + tap.zone);
  });
  // 탐색 완료하기 → 질문 시작
  document.getElementById('t2-done').addEventListener('click', function (e) {
    e.stopPropagation();
    if (state.current !== 't2home' || t2sec.classList.contains('quiz')) return;
    if (window.t2CarReset) window.t2CarReset();
    if (window.t2CommentReset) window.t2CommentReset(false);
    if (window.t2MoreReset) window.t2MoreReset();
    if (window.t2CatReset) window.t2CatReset();
    if (window.t2ReactStop) window.t2ReactStop();
    var sc = t2scroll.scrollTop;
    state.t2.scrollAt = Math.round(sc);
    // 스크롤한 위치에서 시작해 맨 위로 부드럽게 이어지도록: 현재 위치만큼 화면을 옮겨 둔 뒤 스크롤을 0으로
    t2canvas.style.transition = 'none'; t2canvas.style.transform = 'translateY(' + (-sc) + 'px)';
    t2scroll.scrollTop = 0; void t2canvas.offsetHeight; t2canvas.style.transition = '';
    state.t2.viewMs = Date.now() - (state.t2.shownAt || Date.now());
    ev('탐색 완료');
    pill.hidden = true;
    t2sec.classList.add('quiz');
    t2Question();
  });

  // 마지막: 결과가 채워진 구글폼 열기
  var submit = document.getElementById('t-submit');
  function refreshSubmit() { if (state.current !== 'finish') return; stamp(); submit.href = FORM_URL ? formLink() : '#'; }
  ['pointerdown', 'touchstart', 'mousedown', 'focus'].forEach(function (t) { submit.addEventListener(t, refreshSubmit, { passive: true }); });
  submit.addEventListener('click', function (e) {
    if (!FORM_URL) { e.preventDefault(); go('end'); return; }
    refreshSubmit();
    setTimeout(function () { go('done'); }, 0);
  });

  var chipBtns = Array.prototype.slice.call(document.querySelectorAll('#chips .chip'));
  function syncChips() {
    chipBtns.forEach(function (b, i) { var sel = i === state.chip; b.classList.toggle('sel', sel); b.setAttribute('aria-pressed', sel ? 'true' : 'false'); });
  }
  chipBtns.forEach(function (b, i) { b.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state.chip !== i) { state.chipChanges += 1; ev('칩:' + CHIPS[i]); }
    state.chip = i; syncChips();
  }); });
  // Pretendard가 없는 기기에서 대체 폰트가 더 넓으면, 넘치는 칩 줄만 상자 폭에 맞게 줄임
  function fitChips(boxId) {
    var box = document.getElementById(boxId || 'chips');
    var room = box.clientWidth - 8;
    Array.prototype.forEach.call(box.children, function (row) {
      row.style.transform = '';
      var w = 0, kids = row.children;
      for (var i = 0; i < kids.length; i++) w += kids[i].offsetWidth;
      w += 4 * (kids.length - 1);
      if (w > room) row.style.transform = 'scale(' + (room / w).toFixed(4) + ')';
    });
  }
  function wireMsg(boxId, anonId, sfx) {
    var btns = Array.prototype.slice.call(document.querySelectorAll('#' + boxId + ' .chip'));
    var sw = document.getElementById(anonId);
    function sync() {
      btns.forEach(function (b, i) { var sel = i === state['chip' + sfx]; b.classList.toggle('sel', sel); b.setAttribute('aria-pressed', sel ? 'true' : 'false'); });
      sw.setAttribute('aria-checked', state['anon' + sfx] ? 'true' : 'false');
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function (e) {
      e.stopPropagation();
      if (state['chip' + sfx] !== i) { state['chipChanges' + sfx] += 1; ev('칩:' + CHIPS[i]); }
      state['chip' + sfx] = i; sync();
    }); });
    sw.addEventListener('click', function (e) {
      e.stopPropagation(); state['anon' + sfx] = !state['anon' + sfx]; state['anonToggles' + sfx] += 1;
      ev(state['anon' + sfx] ? '익명 켬' : '익명 끔'); sync();
    });
    return sync;
  }
  var syncZ = wireMsg('zchips', 'zanon', '2');
  var anon = document.getElementById('anon');
  function syncAnon() { anon.setAttribute('aria-checked', state.anon ? 'true' : 'false'); }
  anon.addEventListener('click', function (e) { e.stopPropagation(); state.anon = !state.anon; state.anonToggles += 1; ev(state.anon ? '익명 켬' : '익명 끔'); syncAnon(); });

  // 히트맵용: 모든 탭 위치를 Figma 기준 좌표(px)로 기록
  //  홈·프로필은 스크롤을 포함한 페이지 좌표, 팝업은 팝업 창 왼쪽 위 기준 좌표, 창 바깥은 'out'
  Object.keys(APP).forEach(function (name) {
    el(name).addEventListener('click', function (e) {
      if (state.current !== name) return;
      var s = stage.getBoundingClientRect(), k = stage.clientWidth / DESIGN_W, pos;
      var dlg = el(name).querySelector('.dialog');
      if (dlg) {
        var r = dlg.getBoundingClientRect();
        var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        pos = inside ? Math.round((e.clientX - r.left) / k) + ',' + Math.round((e.clientY - r.top) / k) : 'out';
      } else {
        var sc = el(name).querySelector('.scroll');
        pos = Math.round((e.clientX - s.left) / k) + ',' + Math.round((e.clientY - s.top) / k + (sc ? sc.scrollTop : 0));
      }
      var t = step(key(name)).taps;
      if (t.length < 30) t.push(pos);
    }, true);
  });

  // 버튼이 아닌 곳을 누른 횟수
  Object.keys(APP).forEach(function (name) {
    el(name).addEventListener('click', function (e) {
      if (state.current !== name || e.target.closest('button, a, input, textarea, .composer')) return;
      var zEl = e.target.closest('[data-z]');
      var zone = zEl ? zEl.getAttribute('data-z') : (e.target.closest('.dialog') ? '창 안 빈 곳' : (e.target.closest('.mwrap') ? '창 바깥' : '빈 곳'));
      var s = step(key(name));
      s.miss += 1; s.zones[zone] = (s.zones[zone] || 0) + 1;
      ev('×' + zone);
    });
  });

  // 앱 화면을 기기 폭에 맞춰 확대/축소 (Figma 390px 기준)
  function layout() {
    var s = stage.clientWidth / DESIGN_W;
    stage.style.setProperty('--s', s);
    stage.style.setProperty('--H', (stage.clientHeight / s) + 'px');
  }

  function clearHint() {
    clearTimeout(hintTimer);
    document.querySelectorAll('.hint').forEach(function (b) { b.classList.remove('hint'); });
  }
  function armHint(delay) {
    clearHint();
    var name = state.current;
    return; // 힌트 사용 안 함 (전체 삭제)
    hintDelay = delay == null ? HINT_DELAY : delay;
    hintArmedAt = Date.now();
    hintTimer = setTimeout(function () {
      if (state.current !== name) return;
      document.getElementById(APP[name].next).classList.add('hint');
      step(name).hint = true;
      ev('(힌트)');
    }, hintDelay);
  }
  // 1차 두드리기 힌트: 1차 미션을 시작한 뒤 홈·프로필에 머문 시간이 30초를 넘도록 두드리기를 안 누르면
  //  보고 있는 화면의 두드리기 버튼이 깜빡임 (화면을 옮겨도 시간은 이어서 셈, 미션 보기 시트를 보는 동안은 멈춤)
  var K1_DELAY = 15000, k1Last = 0;
  setInterval(function () {
    var now = Date.now(), dt = k1Last ? now - k1Last : 0; k1Last = now;
    if (!state || state.phase !== 1 || state.r1Base) return;
    var cur = state.current, btn = cur === 'home' ? 't-hknock' : cur === 'profile' ? 't-knock' : null;
    if (!btn) return;
    var k = state.k1 || (state.k1 = { ms: 0, hintAt: null });
    if (document.getElementById('ms-sheet').hidden) k.ms += Math.min(dt, 1000);
    if (k.ms < K1_DELAY) return;
    var b = document.getElementById(btn);
    if (!b.classList.contains('hint')) {
      b.classList.add('hint'); step(key(cur)).hint = true;
      if (k.hintAt == null) { k.hintAt = Math.round(k.ms / 1000); ev('(힌트) 두드리기'); }
    }
  }, 250);

  // 미션 보기: 화면은 그대로 두고 바텀시트로 지금 미션을 보여줌
  var msDim = document.getElementById('ms-dim'), msSheet = document.getElementById('ms-sheet'), msBody = document.getElementById('ms-body');
  function msClose() { msDim.hidden = true; msSheet.hidden = true; }
  pill.addEventListener('click', function () {
    var name = state.current, m = MISSIONS[state.task];
    if (!(APP[name] || name === 't2home') || !m) return;
    if (name === 't2home') state.t2.mviews = (state.t2.mviews || 0) + 1; else state.views += 1;
    ev('미션 다시보기');
    msBody.textContent = '';
    var head = node('div', 'head'); head.appendChild(node('span', 'tag', m.tag)); msBody.appendChild(head);
    m.blocks.forEach(function (b) { var block = node('div', 'block' + (b.key ? ' key' : '')); block.appendChild(node('h2', null, b.label)); block.appendChild(node('p', null, b.text)); msBody.appendChild(block); });
    msDim.hidden = false; msSheet.hidden = false; msSheet.scrollTop = 0;
  });
  msDim.addEventListener('click', msClose);
  document.getElementById('ms-close').addEventListener('click', msClose);

  function leave() { if (APP[state.current] && enteredAt) step(key(state.current)).ms += Date.now() - enteredAt; }
  function show(name, opts) {
    var base = name === 'finish' ? state.finishBase : (APP[name] && APP[name].base);
    if (base === 'profile' && state.r1Base) base = state.r1Base; // 1차 메세지 창 뒤 화면: 두드리기를 누른 곳(홈 또는 프로필)
    ORDER.forEach(function (n) {
      var visible = n === name || n === base;
      el(n).classList.toggle('on', visible);
      el(n).inert = n !== name;
    });
    var prevScreen = state.current;
    msClose();
    state.current = name;
    enteredAt = Date.now();
    var resumed = held && held.name === name ? held : null;
    if (APP[name]) { if (!resumed) step(key(name)).visits += 1; held = null; }
    if (NAMES[name] && !resumed) ev(MISSIONS[name] && state.returnTo ? '미션 다시보기' : NAMES[name]);
    if (MISSIONS[name]) {
      if (!state.returnTo) state.task = name;
      document.getElementById(name + '-start').textContent = state.returnTo ? '돌아가기' : '시작하기';
    }
    pill.hidden = !(APP[name] || (name === 't2home' && !state.t2.first)); // 태스크 2 탐색 중에도 미션 보기 (질문 화면에서는 숨김)
    if (name === 'send') fitChips();
    if (name === 'reply') document.getElementById('reply-chip').textContent = REPLIES[state.sentChip == null ? 0 : state.sentChip];
    if (name === 'zsend') fitChips('zchips');
    if (name === 'finish') refreshSubmit();
    if (name === 't2home' && !resumed) { t2Paint(); if (!state.t2.shownAt) state.t2.shownAt = Date.now(); if (state.t2.first) { t2sec.classList.add('quiz'); t2Question(); } else { t2Reset(); t2BannerIn(); if (window.t2ReactStart) window.t2ReactStart(); } }
    liftComposer();
    if (opts && opts.fresh) document.getElementById('profile-scroll').scrollTop = 0;
    if (!APP[name] && !resumed) el(name).scrollTop = 0;
    // 미션 화면에서 홈으로 들어올 때마다 리마인드 태그를 펼쳐 보여줌
    if ((name === 'home' || name === 't2home') && MISSIONS[prevScreen] && !resumed) el(name).querySelectorAll('.remind').forEach(function (t) { t.classList.remove('reveal'); void t.offsetWidth; t.classList.add('reveal'); });
    if (name === 'end') { stamp(); buildEnd(); }
    if (name === 'done') buildDone();
    armHint(resumed ? resumed.left : null);
  }
  function go(name, opts) { if (ORDER.indexOf(name) === -1) return; leave(); show(name, opts); }

  function start(saved) {
    state = fresh();
    if (saved && saved.current && ORDER.indexOf(saved.current) !== -1) {
      Object.keys(state).forEach(function (k) { if (k in saved && k !== 'answers') state[k] = saved[k]; });
      if (saved.answers) Object.keys(state.answers).forEach(function (k) { if (k in saved.answers) state.answers[k] = saved.answers[k]; });
    }
    held = null;
    if (!state.startedAt) state.startedAt = clock();
    Object.keys(QUESTIONS).forEach(buildQuestion);
    Object.keys(MISSIONS).forEach(buildMission);
    syncChips(); syncAnon(); syncZ();
    document.getElementById('recent').hidden = true;
    commentsEl.innerHTML = commentsHTML; setFold(true);
    document.getElementById('t-ztopic').classList.remove('sel'); document.getElementById('t-ztopic').setAttribute('aria-pressed', 'false'); document.getElementById('ccount').textContent = '23'; cinput.value = ''; syncSend();
    ['zprofile-scroll', 'post-scroll', 'postopen-scroll'].forEach(function (id) { document.getElementById(id).scrollTop = 0; });
    document.getElementById('home-scroll').scrollTop = 0;
    document.getElementById('profile-scroll').scrollTop = 0;
    t2Reset();
    if (window.hReset) window.hReset();
    if (window.zCarReset) window.zCarReset();
    layout();
    show(state.current);
  }

  window.addEventListener('resize', function () { layout(); t2Fit(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (state && state.current === 'send') fitChips(); });
  window.addEventListener('orientationchange', layout);
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // 페이지가 업데이트돼도 진행 중이던 참가자의 상태를 유지
  var hot = window.claude && window.claude.hot;
  try { if (hot && hot.snapshot) hot.snapshot(function () { leave(); enteredAt = Date.now(); return state; }); } catch (e) {}
  start((hot && hot.data) || {});
  try { if (hot && hot.ready) hot.ready(function (data) { if (data && data.current) start(data); }); } catch (e) {}
})();
