/* 회사소개 — 증서 크게 보기. JS가 없으면 링크가 이미지 파일을 바로 연다. */
(function () {
  var dlg = document.getElementById('co-zoom');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var img = dlg.querySelector('img'), cap = dlg.querySelector('.co-zoom__cap');
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[data-zoom]');
    if (!a) return;
    ev.preventDefault();
    img.src = a.getAttribute('href');
    img.alt = a.querySelector('img') ? a.querySelector('img').alt : '';
    cap.textContent = a.getAttribute('data-cap') || '';
    dlg.showModal();
  });
  dlg.addEventListener('click', function (ev) { if (ev.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { img.removeAttribute('src'); });
})();
