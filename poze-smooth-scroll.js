(function(){
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.__pozeLenis) return;

  function getProgressBar(){
    var bar = document.getElementById('s-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 's-bar';
      document.body.appendChild(bar);
    }
    return bar;
  }

  function updateProgress(progress){
    var bar = getProgressBar();
    bar.style.width = Math.max(0, Math.min(100, progress * 100)) + '%';
  }

  function updateNativeProgress(){
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    updateProgress((window.scrollY || window.pageYOffset || 0) / max);
  }

  if (reduceMotion) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){
        getProgressBar();
        updateNativeProgress();
        window.addEventListener('scroll', updateNativeProgress, {passive:true});
      });
    } else {
      getProgressBar();
      updateNativeProgress();
      window.addEventListener('scroll', updateNativeProgress, {passive:true});
    }
    return;
  }

  function initSmoothScroll(){
    if (!window.Lenis) return;

    var style = document.createElement('style');
    style.textContent = [
      'html.lenis,html.lenis body{height:auto;overflow-x:hidden}',
      'html.lenis{overflow-y:auto}',
      '.lenis.lenis-smooth{scroll-behavior:auto!important}',
      '.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}',
      '.lenis.lenis-stopped{overflow:hidden}'
    ].join('');
    document.head.appendChild(style);
    getProgressBar();

    var lenis = new Lenis({
      duration: 1.2,
      easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 0.8
    });

    window.__pozeLenis = lenis;
    lenis.on('scroll', function(e){
      updateProgress(e.progress || 0);
    });

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time){
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
  } else {
    initSmoothScroll();
  }
})();
