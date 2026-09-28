// 심플웨이 페이지: 색 밴드 등장 · 영상(누르면 재생)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    document.querySelectorAll('[data-anim]').forEach(function (el) { io.observe(el); });
  }
  document.querySelectorAll('[data-yt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      var start = btn.getAttribute('data-start'), end = btn.getAttribute('data-end');
      f.src = 'https://www.youtube-nocookie.com/embed/' + btn.getAttribute('data-yt') + '?autoplay=1&rel=0' + (start ? '&start=' + start : '') + (end ? '&end=' + end : '');
      f.title = btn.getAttribute('aria-label') || '영상';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });
})();
