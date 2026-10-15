/**
 * WAKEEL — Cinematic Landing Experience
 * GSAP 3.12 + ScrollTrigger | RTL | progressive enhancement
 * Focus: transform & opacity, restrained motion, no pin/scroll hijacking.
 * All essential content and native links work without these libraries.
 */
(() => {
  'use strict';

  const $ = (selector, within = document) => within.querySelector(selector);
  const $$ = (selector, within = document) => [...within.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = window.matchMedia('(max-width: 720px)');

  // The fixed header is also our #top anchor. Its geometry is not the page top.
  $$('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
      if (window.location.hash !== '#top') history.replaceState(null, '', '#top');
      const menu = link.closest('details.mobile-navigation');
      if (menu) menu.open = false;
    });
  });
  $$('.mobile-navigation-panel a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const menu = link.closest('details.mobile-navigation');
      if (menu) menu.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const menu = $('.mobile-navigation[open]');
      if (menu) { menu.open = false; menu.querySelector('summary')?.focus(); }
    }
  });

  // Playback is decorative, pauses off-screen or when user requests reduced motion.
  const videos = $$('.hero-video,.ai-feature-video');
  function syncVideo(video, visible) {
    if (reducedMotion.matches || document.hidden || !visible) {
      video.pause();
    } else {
      const promise = video.play();
      if (promise?.catch) promise.catch(() => {}); // blocked autoplay: poster is fine
    }
  }
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => syncVideo(entry.target, entry.isIntersecting));
    }, { threshold: .06 });
    videos.forEach(v => videoObserver.observe(v));
  } else {
    videos.forEach(v => syncVideo(v, true));
  }
  document.addEventListener('visibilitychange', () => {
    videos.forEach(video => syncVideo(video, !!video.getBoundingClientRect().bottom &&
      video.getBoundingClientRect().top < innerHeight && video.getBoundingClientRect().bottom > 0));
  });
  reducedMotion.addEventListener?.('change', () => {
    videos.forEach(v => syncVideo(v, !reducedMotion.matches));
  });

  // Route animation between actual centers of the four steps, not fixed pixels.
  const workflow = $('.steps-grid');
  const cards = workflow ? $$('.step-card', workflow) : [];
  const routeSVG = workflow && $('.workflow-progress', workflow);
  const routeTrack = routeSVG && $('.workflow-line-track', routeSVG);
  const routeActive = routeSVG && $('.workflow-line-active', routeSVG);
  let routeLength = 0;
  function measureRoute() {
    if (!routeSVG || !routeTrack || !routeActive || cards.length !== 4) return;
    const bounds = workflow.getBoundingClientRect();
    const points = cards.map(card => {
      const icon = $('.step-icon', card);
      const r = icon.getBoundingClientRect();
      return { x: r.left + r.width/2 - bounds.left,
               y: r.top + r.height/2 - bounds.top };
    });
    const path = points.map((p,i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    routeSVG.setAttribute('viewBox', `0 0 ${Math.max(1,bounds.width)} ${Math.max(1,bounds.height)}`);
    routeTrack.setAttribute('d', path);
    routeActive.setAttribute('d', path);
    routeLength = routeActive.getTotalLength();
    routeActive.style.strokeDasharray = String(routeLength);
    routeActive.style.strokeDashoffset = reducedMotion.matches ? '0' : String(routeLength);
  }
  measureRoute();
  window.addEventListener('resize', measureRoute, {passive: true});

  // Without GSAP, everything remains visible; the workflow line is complete.
  if (!window.gsap || !window.ScrollTrigger || reducedMotion.matches) {
    if (routeActive) routeActive.style.strokeDashoffset = '0';
    return;
  }
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });
  const mm = gsap.matchMedia();
  const ease = 'power3.out';

  // ------ 1. A progress needle across the top of the viewport ------
  const progress = $('.wk-scroll-progress > span');
  if (progress) {
    const updateProgress = gsap.quickSetter(progress, 'scaleX');
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top', end: 'bottom bottom',
      onUpdate: self => updateProgress(self.progress),
      onRefresh: self => updateProgress(self.progress)
    });
  }

  // ------ 2. Hero cinematic entrance: depth without visual chaos ------
  const heroTitle = $('.wk-title');
  if (heroTitle) {
    const timeline = gsap.timeline({ defaults: { ease, duration: .9 }, delay: .1 });
    const eyebrow = $('.wk-eyebrow');
    const heroText = $('.wk-text');
    const heroBtns = $$('.hero-buttons .wk-btn');
    const heroHighlights = $$('.hero-highlights > div');
    const heroPanel = $('.process-panel');
    const panelTop = $('.process-panel-heading');
    const panelSteps = $$('.process-panel .flow-step');
    const panelFooter = $('.process-panel-footer');

    if (eyebrow) timeline.from(eyebrow, { y: 16, autoAlpha: 0, duration: .55, clearProps: 'all' }, 0);
    timeline.from(heroTitle, { y: 56, rotationX: 11, autoAlpha: 0, transformOrigin:'50% 95%', duration: 1.13, clearProps: 'transform,opacity,visibility' }, .14);
    if (heroText) timeline.from(heroText, {y: 24, autoAlpha:0, duration:.87, clearProps:'transform,opacity,visibility'}, .37);
    if (heroBtns.length) timeline.from(heroBtns, {y: 24, autoAlpha:0, stagger:.12, duration:.78, clearProps:'transform,opacity,visibility'}, .52);
    if (heroHighlights.length) timeline.from(heroHighlights, {y: 15, autoAlpha:0, stagger:.1, duration:.62, clearProps:'transform,opacity,visibility'}, .7);
    if (heroPanel) timeline.from(heroPanel, {x:-65,y:25,z:-170,rotationY:13,rotationX:-4,autoAlpha:0,
      duration:1.25,transformOrigin:'50% 50%', clearProps:'transform,opacity,visibility'}, .25);
    if (panelTop) timeline.from(panelTop, {y:10,autoAlpha:0,duration:.5,clearProps:'transform,opacity,visibility'}, .64);
    if (panelSteps.length) {
      timeline.from(panelSteps, {x:-24,y:14,autoAlpha:0,stagger:.16,duration:.55,clearProps:'transform,opacity,visibility'}, .79);
      panelSteps.forEach((el, index) => timeline.call(() => el.classList.add('is-live'), [], 1.0 + index * .18));
    }
    if (panelFooter) timeline.from(panelFooter, {y:12,autoAlpha:0,duration:.55,clearProps:'transform,opacity,visibility'}, 1.33);
  }

  // ------ 3. Active navigation as actual section enters view ------
  const sectionLinks = $$('.nav-links a[href^="#"]');
  const byHash = new Map(sectionLinks.map(a => [a.getAttribute('href').slice(1), a]));
  const activeOrder = ['top','services','how','ai','tracking','why','agents','faq','start'];
  const sectionTargets = ['.hero','#services','#how','#ai','#tracking','#why','#agents','#faq','#start'];
  sectionTargets.forEach((selector,index) => {
    const node = $(selector);
    if (!node) return;
    ScrollTrigger.create({trigger:node,start:'top 45%',end:'bottom 45%',
      onEnter:()=>activate(index),onEnterBack:()=>activate(index)});
  });
  function activate(index) {
    sectionLinks.forEach(a => a.classList.remove('active'));
    // No matching nav link for some sections: don't force a misleading selection.
    byHash.get(activeOrder[index])?.classList.add('active');
  }

  // ------ 4. Each section gets its own architectural background parallax ------
  mm.add('(min-width: 721px) and (prefers-reduced-motion: no-preference)', () => {
    $$('.wk-scene:not(.wk-scene--hero)').forEach(scene => {
      const parent = scene.parentElement;
      const orbs = $$('.wk-orb', scene);
      if (!orbs.length) return;
      const tl = gsap.timeline({scrollTrigger:{trigger:parent,start:'top bottom',end:'bottom top',scrub:1.15}});
      orbs.forEach((orb,i) => {
        tl.fromTo(orb,{yPercent:i?16:-16,xPercent:i?-8:8,scale:.9},
          {yPercent:i?-13:13,xPercent:i?8:-8,scale:1.1,ease:'none'},0);
      });
      const glyph=$('.wk-scene-glyph', scene);
      if(glyph)tl.fromTo(glyph,{yPercent:-14,rotation:-6},{yPercent:18,rotation:5,ease:'none'},0);
    });
    const heroOrbs=$$('.wk-scene--hero .wk-orb');
    if (heroOrbs.length) heroOrbs.forEach((orb,i) => gsap.to(orb,{
      y:i?-90:90,x:i?-25:25,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.75}
    }));
    const heroCopy = $('.hero-copy');
    const heroVisual = $('.hero-visual');
    if (heroCopy) gsap.to(heroCopy,{y:-40,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.7}});
    if (heroVisual) gsap.to(heroVisual,{y:-70,scale:.97,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.8}});
  });

  // ------ 5. Reveal typography like a premium product story ------
  const revealConfig = [
    {root:'.services-section', heading:'.section-heading'},
    {root:'.how-section', heading:'.section-heading'},
    {root:'.ai-section', heading:'.ai-copy'},
    {root:'.tracking-section', heading:'.tracking-copy'},
    {root:'.why-section', heading:'.section-heading'},
    {root:'.agents-section', heading:'.agent-copy'},
    {root:'.faq-section', heading:'.faq-copy'},
    {root:'.final-cta', heading:'.final-cta-inner'}
  ];
  revealConfig.forEach(({root,heading}) => {
    const area=$(root), lead=area && $(heading,area);
    if(!area || !lead) return;
    const title=$('h2',lead), eyebrow=$('.overline,.eyebrow',lead),
      paragraph=$('p',lead), cta=$('.btn',lead);
    const tl=gsap.timeline({scrollTrigger:{trigger:area,start:mobile.matches?'top 91%':'top 82%',once:true},
      defaults:{ease,duration:.85}});
    if(eyebrow)tl.from(eyebrow,{autoAlpha:0,y:14,duration:.55,clearProps:'transform,opacity,visibility'},0);
    if(title)tl.from(title,{autoAlpha:0,y:35,rotationX:mobile.matches?0:8,transformOrigin:'50% 70%',
      clearProps:'transform,opacity,visibility'},.12);
    if(paragraph)tl.from(paragraph,{autoAlpha:0,y:20,duration:.7,clearProps:'transform,opacity,visibility'},.29);
    if(cta)tl.from(cta,{autoAlpha:0,y:17,duration:.6,clearProps:'transform,opacity,visibility'},.43);
  });

  // ------ 6. Card choreography (staggered, responsive, unobtrusive) ------
  [
    {selector:'.service-card',trigger:'.services-grid', stagger:.065},
    {selector:'.step-card',trigger:'.steps-grid',stagger:.115},
    {selector:'.benefit-card',trigger:'.benefits-grid',stagger:.10},
    {selector:'.mini-features > div',trigger:'.mini-features',stagger:.08},
    {selector:'.agent-stats > div',trigger:'.agent-stats',stagger:.13},
    {selector:'.faq-list > details',trigger:'.faq-list',stagger:.09},
  ].forEach(({selector,trigger,stagger})=>{
    const items=$$(selector);
    const target=$(trigger);
    if(!target || !items.length) return;
    gsap.from(items,{
      y:mobile.matches?22:48,rotationX:mobile.matches?0:6,autoAlpha:0,
      duration:mobile.matches?.65:.85,stagger:mobile.matches?Math.min(stagger,.06):stagger,
      ease,clearProps:'transform,opacity,visibility',
      scrollTrigger:{trigger:target,start:mobile.matches?'top 94%':'top 86%',once:true},
      onComplete: selector === '.step-card' ? () => {measureRoute();ScrollTrigger.update();} : undefined
    });
  });

  // ------ 7. Product previews emerge from depth as you scroll ------
  [
    {selector:'.tracking-dashboard', direction:-1},
    {selector:'.agent-dashboard',direction:1},
    {selector:'.ai-video-stage', direction:-1}
  ].forEach(({selector,direction}) => {
    const item=$(selector);
    if(!item) return;
    gsap.from(item,{
      x:mobile.matches?0:direction*52, y:mobile.matches?20:36,
      rotationY:mobile.matches?0:direction*7,autoAlpha:0,
      duration:mobile.matches?.8:1.18,ease,
      clearProps:'transform,opacity,visibility',
      scrollTrigger:{trigger:item,start:mobile.matches?'top 95%':'top 87%',once:true}
    });
  });

  // ------ 8. The four connected workflow steps as a scroll-controlled path ------
  if (routeActive && cards.length === 4) {
    const paintRoute = (progress) => {
      if (!routeLength) return;
      routeActive.style.strokeDashoffset = String(routeLength*(1-progress));
      cards.forEach((card,i)=>card.classList.toggle('is-journey-active',progress>=i/3-.02));
    };
    ScrollTrigger.create({trigger:workflow,start:'top 83%',end:'bottom 40%',scrub:.6,
      onUpdate: self => paintRoute(self.progress),
      onRefresh: self => {measureRoute();paintRoute(self.progress);}
    });
  }

  // ------ 9. Illustrative tracking dashboard: scroll-reactive, not live data ------
  const journey=$$('.tracking-dashboard .dashboard-journey > div');
  const badge=$('.tracking-dashboard .dash-header .pill');
  if (journey.length === 4) {
    const status=['طلب جديد','تم قبول العرض','قيد التنفيذ','مكتمل'];
    let previous = -1;
    const paint = stage => {
      if (stage === previous) return;
      previous=stage;
      journey.forEach((item,i) => {
        item.classList.remove('complete','current','is-preview-complete','is-preview-current','is-preview-upcoming');
        item.classList.add(i<stage?'is-preview-complete':i===stage?'is-preview-current':'is-preview-upcoming');
        const number=$('span',item);
        if(number) number.textContent=i<stage?'✓':String(i+1);
      });
      if(badge) {
        badge.textContent=status[stage];
        badge.classList.toggle('pill-teal',stage===3);
        badge.classList.toggle('pill-blue',stage!==3);
      }
    };
    ScrollTrigger.create({trigger:'.tracking-dashboard',start:'top 85%',end:'bottom 30%',scrub:.5,
      onUpdate:self=>paint(Math.min(3,Math.floor(self.progress*4))),
      onRefresh:self=>paint(Math.min(3,Math.floor(self.progress*4)))});
  }

  // ------ 10. Gentle pointer light in service cards and the glass Hero panel ------
  if(finePointer.matches) {
    $$('.service-card,.benefit-card,.process-panel').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect=card.getBoundingClientRect();
        const x=100*(event.clientX-rect.left)/rect.width;
        const y=100*(event.clientY-rect.top)/rect.height;
        card.style.setProperty('--wk-x',x.toFixed(1)+'%');
        card.style.setProperty('--wk-y',y.toFixed(1)+'%');
      },{passive:true});
    });
    const panel=$('.process-panel');
    if(panel) {
      const tiltX=gsap.quickTo(panel,'rotationX',{duration:.6,ease:'power3.out'});
      const tiltY=gsap.quickTo(panel,'rotationY',{duration:.6,ease:'power3.out'});
      const visual=$('.process-visual');
      visual?.addEventListener('pointermove', event=>{
        const rect=visual.getBoundingClientRect();
        tiltY((event.clientX-rect.left)/rect.width*7-3.5);
        tiltX(3.5-(event.clientY-rect.top)/rect.height*7);
      },{passive:true});
      visual?.addEventListener('pointerleave',()=>{tiltX(0);tiltY(0);});
    }
  }

  // Fonts/assets can shift element positions; refresh after final measurements.
  if (document.fonts?.ready) document.fonts.ready.then(() => {
    measureRoute(); ScrollTrigger.refresh();
  });
  window.addEventListener('load',()=>{measureRoute();ScrollTrigger.refresh();},{once:true});
})();
