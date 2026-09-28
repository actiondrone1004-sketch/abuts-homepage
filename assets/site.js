// 어벗츠 플랫폼 홈페이지 v2 — 공통 스크립트
// 1) 모바일 메뉴  2) 탭(data-tabs)  3) 기능 선택(data-switch)  — 모두 진행형 향상, JS 없이도 첫 상태가 보인다.
(function () {
  // 0) 페이지 진입 시 항상 상단에서 시작 (뒤로가기·재방문·재게시 시 스크롤 복원 방지)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener('pageshow', function () { if (!location.hash) window.scrollTo(0, 0); });

  // 1) 모바일 메뉴
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.nav-mobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
  }

  // 1-2) 드롭다운: 마우스가 잠깐 벗어나도 250ms 동안 열림 유지, 터치에서는 첫 탭에 열기
  document.querySelectorAll('.has-sub').forEach(function (li) {
    var timer;
    li.addEventListener('mouseenter', function () { clearTimeout(timer); li.classList.add('is-open'); });
    li.addEventListener('mouseleave', function () { timer = setTimeout(function () { li.classList.remove('is-open'); }, 250); });
    var top = li.querySelector(':scope > a');
    if (top) top.addEventListener('touchstart', function (e) {
      if (!li.classList.contains('is-open')) { e.preventDefault(); li.classList.add('is-open'); }
    }, { passive: false });
    document.addEventListener('click', function (e) { if (!li.contains(e.target)) li.classList.remove('is-open'); });
  });

  // 1-3) 상세페이지 액션: 화면에 들어올 때 블록 요소 등장, 숫자 타일 카운트업
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    var vh = window.innerHeight || 800;
    var targets = [];
    document.querySelectorAll('.dp .dp__inner').forEach(function (inner) {
      var kids = Array.prototype.slice.call(inner.children);
      kids.forEach(function (el, i) {
        el.classList.add('rv'); el.style.setProperty('--i', i);
        // 첫 화면에 이미 보이는 요소는 숨기지 않는다(로드 시 그대로 보임)
        if (el.getBoundingClientRect().top > vh) el.classList.add('is-out'); else el.classList.add('is-in');
        targets.push(el);
      });
      // 그리드 자식(타일·카드·칩)도 순차 등장
      inner.querySelectorAll('.stat-grid > *, .dp-pair > *, .lineup > *, .flow > .flow__step, .dp-words > *').forEach(function (el, i) {
        el.classList.add('rv'); el.style.setProperty('--i', i % 8);
        if (el.getBoundingClientRect().top > vh) el.classList.add('is-out'); else el.classList.add('is-in');
        targets.push(el);
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove('is-out'); en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { if (el.classList.contains('is-out')) io.observe(el); });

    // 숫자 카운트업: 정수 부분만 0→값으로, 접미사(<small>)·기호는 유지
    var counted = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; counted.unobserve(el);
        var node = null;
        el.childNodes.forEach(function (n) { if (n.nodeType === 3 && /\d/.test(n.nodeValue) && !node) node = n; });
        if (!node) return;
        var raw = node.nodeValue, m = raw.match(/^(\D*)([\d,]+)(.*)$/);
        if (!m) return;
        var pre = m[1], num = parseInt(m[2].replace(/,/g, ''), 10), post = m[3];
        if (!isFinite(num) || num <= 0) return;
        // 연도·날짜는 카운트업하지 않는다 (2011, 2027-01-07 등)
        if (/^(19|20)\d{2}$/.test(m[2]) || /[-./]\d/.test(post)) return;
        var useComma = m[2].indexOf(',') >= 0, start = null, dur = Math.min(1400, 500 + num.toString().length * 250);
        function fmt(v) { v = Math.round(v); return useComma ? v.toLocaleString('ko-KR') : String(v); }
        function step(ts) {
          if (start === null) start = ts;
          var t = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - t, 3);
          node.nodeValue = pre + fmt(num * e) + post;
          if (t < 1) requestAnimationFrame(step); else node.nodeValue = raw;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stat__value').forEach(function (el) { counted.observe(el); });
  })();

  // 2) 탭: <div data-tabs><div class="tabs" role="tablist"><button class="tab" role="tab" aria-controls="id">…
  //        <div class="tabpanel" id="id" role="tabpanel">…
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = root.querySelectorAll('[role="tab"]');
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = root.querySelector('#' + t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          select(tabs[n]); tabs[n].focus();
        }
      });
    });
  });

  // 3) 기능 선택: <div data-switch><button class="feature-switch__item" role="tab" aria-controls="id" data-hl="block-id">
  //    선택하면 해당 패널을 보이고, 화면 목업 안의 data-hl 블록에 강조를 옮긴다.
  document.querySelectorAll('[data-switch]').forEach(function (root) {
    var items = root.querySelectorAll('[role="tab"]');
    var shot = root.querySelector('.shot');
    function select(item) {
      items.forEach(function (t) {
        var on = t === item;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = root.querySelector('#' + t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (shot) {
        shot.querySelectorAll('.block--hl').forEach(function (b) { b.classList.remove('block--hl'); });
        var target = item.getAttribute('data-hl') && shot.querySelector('#' + item.getAttribute('data-hl'));
        if (target) target.classList.add('block--hl');
      }
    }
    items.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          var fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
          var n = (i + (fwd ? 1 : -1) + items.length) % items.length;
          select(items[n]); items[n].focus();
        }
      });
    });
  });
})();

// 4) 푸터: 맨 위로 · 휴대폰에서는 사이트맵을 접어 둔다
(function () {
  document.querySelectorAll('[data-top]').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });
  var mq = window.matchMedia && window.matchMedia('(max-width: 640px)');
  function sync() {
    document.querySelectorAll('.ft-group').forEach(function (d) { if (mq && mq.matches) d.removeAttribute('open'); else d.setAttribute('open', ''); });
  }
  sync();
  if (mq && mq.addEventListener) mq.addEventListener('change', sync);
})();
