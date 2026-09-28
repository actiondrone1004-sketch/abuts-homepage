// 홈 첫 화면 슬라이더 (웹디자인 소개): 자동 재생 · 화살표 · 일시정지 · 스와이프 · 키보드
// 간격은 섹션의 --dur(초). 마우스를 올려도 멈추지 않는다.
(function () {
  var root = document.querySelector('[data-hero]');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.ah-s'));
  var sweep = root.querySelector('.ah__sweep');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, userPaused = reduce, offscreen = false, leaveTimer, timer;
  var dur = (parseFloat(getComputedStyle(root).getPropertyValue('--dur')) || 4) * 1000;

  function paused() { return userPaused || offscreen; }
  function schedule() {
    clearTimeout(timer);
    if (!paused() && slides.length > 1) timer = setTimeout(function () { go(cur + 1); }, dur);
  }
  function paint() { root.classList.toggle('is-paused', paused()); schedule(); }

  function go(n) {
    n = (n + slides.length) % slides.length;
    if (n === cur) return schedule();
    var prev = slides[cur];
    clearTimeout(leaveTimer);
    slides.forEach(function (s) { s.classList.remove('is-leaving', 'is-first'); });
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.setAttribute('aria-hidden', 'true');
    var next = slides[n];
    void next.offsetWidth; // 애니메이션 재시작
    next.classList.add('is-active');
    next.removeAttribute('aria-hidden');
    leaveTimer = setTimeout(function () { prev.classList.remove('is-leaving'); }, 1100);
    root.classList.toggle('ah--light', next.hasAttribute('data-light'));
    if (sweep && !reduce) { sweep.classList.remove('is-go'); void sweep.offsetWidth; sweep.classList.add('is-go'); }
    cur = n;
    schedule();
  }

  var prevBtn = root.querySelector('[data-prev]'), nextBtn = root.querySelector('[data-next]'), pauseBtn = root.querySelector('[data-pause]');
  if (prevBtn) prevBtn.addEventListener('click', function () { go(cur - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(cur + 1); });
  if (pauseBtn) pauseBtn.addEventListener('click', function () {
    userPaused = !userPaused; paint();
    pauseBtn.setAttribute('aria-label', userPaused ? '자동 넘김 재생' : '자동 넘김 일시정지');
  });
  // 관리자 미리보기에서 특정 장면으로 이동: root.dispatchEvent(new CustomEvent('hero:go', { detail: 2 }))
  root.addEventListener('hero:go', function (e) { userPaused = true; paint(); go(+e.detail || 0); });

  // 키보드 방향키로 장면 이동
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
  });

  // 스와이프
  var sx = null, sy = null;
  root.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });

  // 화면 밖이거나 브라우저 탭이 숨겨지면 멈춤
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { offscreen = !en[0].isIntersecting; paint(); }, { threshold: 0.2 }).observe(root);
  }
  document.addEventListener('visibilitychange', function () { offscreen = document.hidden; paint(); });

  slides.forEach(function (s, i) { if (i) s.setAttribute('aria-hidden', 'true'); });
  paint();
})();
