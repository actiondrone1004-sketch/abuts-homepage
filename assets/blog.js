// 어벗츠 블로그 — 글 모션 · 목록 필터 · 공유 · 떠 있는 버튼
// 진행형 향상: JS가 없거나 모션을 줄인 환경에서는 모든 내용이 처음부터 보인다.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;

  // 1) 화면에 들어오면 is-visible (흐름도·비교·체크리스트·타임라인·이미지·형광펜)
  if (!reduce && canObserve) {
    root.classList.add('js-motion');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add(en.target.tagName === 'MARK' ? 'is-lit' : 'is-visible');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    document.querySelectorAll('[data-anim], .bl-zoom, .bl-page mark').forEach(function (el) { io.observe(el); });
  }

  // 2) 읽기 진행 막대 + 떠 있는 버튼 (글을 30% 넘게 읽으면 표시)
  var bar = document.querySelector('.bl-progress');
  var float = document.querySelector('.bl-float');
  var isList = !bar;
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    if (bar) bar.style.setProperty('--p', p.toFixed(4));
    if (float) float.classList.toggle('is-on', isList ? window.scrollY > 320 : p > 0.12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3) 유튜브: 누르면 그 자리에서 재생 (처음에는 썸네일만 불러온다)
  document.querySelectorAll('.bl-yt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + btn.getAttribute('data-yt') + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || '영상';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });

  // 4) 공유: 휴대폰은 공유 시트, 그 밖에는 링크 복사
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var data = { title: document.title, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      var done = function () { var t = btn.textContent; btn.textContent = '링크를 복사했습니다'; setTimeout(function () { btn.textContent = t; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {});
    });
  });

  // 5) 목록: 카테고리 칩 + 검색
  var list = document.querySelector('[data-list]');
  if (list) {
    var cards = Array.prototype.slice.call(list.children);
    var empty = document.querySelector('[data-empty]');
    var chips = document.querySelectorAll('[data-filter]');
    var search = document.querySelector('[data-search]');
    var cat = '';
    var apply = function () {
      var q = (search && search.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (!cat || c.getAttribute('data-cat') === cat) && (!q || (c.getAttribute('data-q') || '').indexOf(q) >= 0);
        c.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.toggle('is-on', x === ch); });
        cat = ch.getAttribute('data-filter');
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
  }
})();
