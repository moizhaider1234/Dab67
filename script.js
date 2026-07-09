(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Ambient ember particle field
     ============================================================ */
  var canvas = document.getElementById('ember-canvas');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var W, H, DPR;
  var mouse = { x: null, y: null };

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeParticle(){
    return {
      x: Math.random() * W,
      y: H + Math.random() * 100,
      r: 1 + Math.random() * 2.4,
      speed: 0.3 + Math.random() * 0.9,
      drift: (Math.random() - 0.5) * 0.6,
      life: 0,
      maxLife: 400 + Math.random() * 400,
      hue: Math.random() > 0.5 ? '255,184,51' : '255,122,26',
      flicker: Math.random() * Math.PI * 2
    };
  }

  var PARTICLE_COUNT = window.innerWidth < 700 ? 26 : 55;

  function initParticles(){
    particles = [];
    for(var i=0; i<PARTICLE_COUNT; i++){
      var p = makeParticle();
      p.y = Math.random() * H;
      particles.push(p);
    }
  }

  function tick(){
    ctx.clearRect(0, 0, W, H);
    for(var i=0; i<particles.length; i++){
      var p = particles[i];
      p.y -= p.speed;
      p.x += p.drift + Math.sin(p.flicker) * 0.15;
      p.flicker += 0.02;
      p.life++;

      if (mouse.x !== null){
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120){
          var force = (120 - dist) / 120;
          p.x += (dx / (dist||1)) * force * 1.6;
          p.y += (dy / (dist||1)) * force * 1.6;
        }
      }

      var lifeRatio = p.life / p.maxLife;
      var alpha = lifeRatio < 0.1 ? lifeRatio/0.1 : (1 - Math.max(0,(lifeRatio-0.7)/0.3));
      alpha = Math.max(0, Math.min(1, alpha)) * 0.85;

      ctx.beginPath();
      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
      grad.addColorStop(0, 'rgba(' + p.hue + ',' + alpha + ')');
      grad.addColorStop(1, 'rgba(' + p.hue + ',0)');
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,240,220,' + alpha + ')';
      ctx.arc(p.x, p.y, p.r*0.5, 0, Math.PI*2);
      ctx.fill();

      if (p.life > p.maxLife || p.y < -20){
        particles[i] = makeParticle();
      }
    }
    if (!reduceMotion) requestAnimationFrame(tick);
  }

  resize();
  initParticles();
  if (!reduceMotion){
    requestAnimationFrame(tick);
  } else {
    tick(); // draw a single static frame
  }

  window.addEventListener('resize', function(){
    resize();
    initParticles();
  });
  window.addEventListener('pointermove', function(e){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('pointerleave', function(){
    mouse.x = null; mouse.y = null;
  });

  /* ============================================================
     Nav: shrink on scroll + mobile burger
     ============================================================ */
  var nav = document.getElementById('nav');
  var lastScroll = 0;
  function onScroll(){
    var y = window.scrollY;
    if (y > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('navBurger');
  var mobileMenu = document.getElementById('navMobile');
  if (burger){
    burger.addEventListener('click', function(){
      var isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     Scroll reveal
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ============================================================
     Stat count-up
     ============================================================ */
  var stats = document.querySelectorAll('.stat-num');
  function animateStat(el){
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var start = 0;
    var duration = 1200;
    var startTime = null;
    function frame(ts){
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    if (reduceMotion){ el.textContent = target; return; }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && stats.length){
    var statIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          animateStat(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function(el){ statIo.observe(el); });
  }

  /* ============================================================
     Copy contract address (three entry points)
     ============================================================ */
  var CA = "AHuUiC8EXYmDDwjjYZj4Kck1vCcUWzna1gvNxSiqpump";

  function flashToast(){
    var toast = document.getElementById('caToast');
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ toast.classList.remove('show'); }, 1800);
  }

  function copyCA(button){
    var text = CA;
    function done(){
      flashToast();
      if (button){
        var original = button.textContent;
        if (button.tagName === 'BUTTON'){
          button.textContent = 'Copied!';
          setTimeout(function(){ button.textContent = original; }, 1600);
        }
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(function(){ fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
  }

  var caChip = document.getElementById('caChip');
  if (caChip){
    caChip.addEventListener('click', function(){ copyCA(caChip); });
    caChip.addEventListener('keypress', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); copyCA(caChip); }
    });
  }
  ['miniCopy', 'miniCopy2'].forEach(function(id){
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', function(){ copyCA(btn); });
  });

})();
