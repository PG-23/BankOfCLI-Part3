import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useRef, useState } from 'react';
import ProfileMenu from './ProfileMenu';


// Each button scrolls to a container on the dashboard page (no page change).
// "id" must match the id="" on that container, e.g. <section id="transfer">.
const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'transactions', label: 'Statements' }, // transaction history container
];

function Navbar() {
  // Reference to the <nav>, used to measure its height so scrolling stops below it
  const navRef = useRef<HTMLElement>(null);

  // Which button is highlighted
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  // Scroll spy: while the user scrolls, highlight the button of the container on screen.
  // IntersectionObserver tells us when a container crosses a thin line just below the navbar.
  useEffect(() => {
    const navHeight = navRef.current?.offsetHeight ?? 0;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      // Shrink the "visible" area to a band starting right under the navbar
      { rootMargin: `-${navHeight + 1}px 0px -70% 0px` }
    );

    // Watch every container that exists on the page
    SECTIONS.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    // Stop watching when the navbar is removed (e.g. after logout)
    return () => observer.disconnect();
  }, []);

  // Smoothly scroll so the container's top sits just below the sticky navbar
  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return; // container not on the page yet

    const navHeight = navRef.current?.offsetHeight ?? 0;
    const top = element.getBoundingClientRect().top + window.scrollY - navHeight - 16; // 16px breathing room
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveId(id);
  }

  return (
    // sticky top-0: stays at the top while the page scrolls. z-50: stays above the containers.
    <nav
      ref={navRef}
      className="sticky top-0 z-50 bg-primary text-white flex items-center justify-between px-4 py-2"
    >
      {/* LEFT: logo */}
      <div className="flex items-center gap-3">
        <div className="bg-white text-primary w-12 h-12 rounded-xl flex items-center justify-center">
          <i className="bi bi-bank text-3xl"></i>
        </div>
        <p className="font-bold text-lg">BANK OF CLI</p>
      </div>

      {/* CENTER: buttons that scroll to containers */}
      <div className="flex items-center gap-1">
        {SECTIONS.map(section => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={isActive ? 'true' : undefined} // tells screen readers which one is current
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive ? 'bg-white text-primary' : 'text-white hover:bg-white/20'
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {/* RIGHT: profile menu with logout */}
      <div>
        <ProfileMenu />
      </div>
    </nav>
  );
}

export default Navbar;
