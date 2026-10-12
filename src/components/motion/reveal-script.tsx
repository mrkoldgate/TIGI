// ---------------------------------------------------------------------------
// RevealScript — framework-free scroll reveal.
//
// Runs before hydration. Adds `.js-reveal` to <html> (which arms the hidden
// state in globals.css) and flips `[data-reveal]` elements to `.is-visible`
// as they enter the viewport. Because it does not depend on React, content can
// never get stuck hidden if hydration fails. Without IntersectionObserver, or
// with reduced motion, it does nothing and everything stays visible.
// Optional: data-reveal-delay="120" (ms) for staggering.
// ---------------------------------------------------------------------------

const SCRIPT = `(function(){try{
var d=document,h=d.documentElement;
if(!('IntersectionObserver' in window))return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
h.classList.add('js-reveal');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}})},{rootMargin:'0px 0px -8% 0px',threshold:0.08});
function arm(root){(root.querySelectorAll?root:d).querySelectorAll('[data-reveal]:not([data-reveal-armed])').forEach(function(el){el.setAttribute('data-reveal-armed','');var dl=el.getAttribute('data-reveal-delay');if(dl)el.style.setProperty('--reveal-delay',dl+'ms');io.observe(el);});}
function start(){arm(d);new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){if(n.hasAttribute&&n.hasAttribute('data-reveal'))arm(n.parentNode||d);else arm(n);}})})}).observe(d.body,{childList:true,subtree:true});}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start);else start();
}catch(e){document.documentElement.classList.remove('js-reveal');}})();`

export function RevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
