import { useEffect } from 'react';

export default function useSectionReveal(containerRef) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    const update = () => {
      observer?.disconnect();
      const elements = root.querySelectorAll('[data-reveal]');
      elements.forEach(element => element.classList.remove('reveal-pending'));
      if (preference.matches) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.08 });
      elements.forEach(element => {
        if (element.getBoundingClientRect().top > window.innerHeight) {
          element.classList.add('reveal-pending');
          observer.observe(element);
        }
      });
    };
    update();
    preference.addEventListener('change', update);
    return () => { observer?.disconnect(); preference.removeEventListener('change', update); };
  }, [containerRef]);
}
