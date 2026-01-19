import { useState, useEffect } from 'react';

interface Heading {
  depth: number;
  text: string;
  slug: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Track active heading on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // Observe all headings
    headings.forEach(({ slug }) => {
      const element = document.getElementById(slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile Toggle Button - Fixed at bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden fixed bottom-6 right-6 z-30 p-3 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg transition-all"
        aria-label="Toggle table of contents"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h7'}
          />
        </svg>
      </button>

      {/* Mobile ToC Panel */}
      <div
        className={`xl:hidden fixed inset-x-0 bottom-0 z-40 bg-bg-secondary border-t border-border rounded-t-2xl shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        <div class="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            On this page
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="overflow-y-auto p-4 flex flex-col gap-1.5" style={{ maxHeight: 'calc(70vh - 4rem)' }}>
          {headings.map((heading) => (
            <a
              key={heading.slug}
              href={`#${heading.slug}`}
              onClick={() => setIsOpen(false)}
              className={`text-sm block py-2 px-3 rounded transition-all duration-200 border-l-2 ${
                activeId === heading.slug
                  ? 'border-accent text-accent bg-accent/10 font-medium'
                  : 'border-transparent text-text-muted hover:text-accent hover:bg-bg-tertiary'
              }
              ${heading.depth === 2 ? 'pl-3' : ''}
              ${heading.depth === 3 ? 'pl-6' : ''}
              ${heading.depth > 3 ? 'pl-9' : ''}
            `}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>

      {/* Desktop ToC - Sticky Sidebar */}
      <aside className="w-64 hidden xl:block shrink-0">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)]">
          <div className="bg-bg-secondary/50 border border-border rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
            <h3 className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              On this page
            </h3>
            <nav className="flex flex-col gap-1.5">
              {headings.map((heading) => (
                <a
                  key={heading.slug}
                  href={`#${heading.slug}`}
                  className={`text-sm block py-1 transition-all duration-200 border-l-2 ${
                    activeId === heading.slug
                      ? 'border-accent text-accent pl-3 font-medium'
                      : 'border-transparent text-text-muted hover:text-accent hover:pl-2 hover:border-accent'
                  }
                  ${heading.depth === 2 ? 'pl-2' : ''}
                  ${heading.depth === 3 ? 'pl-4' : ''}
                  ${heading.depth > 3 ? 'pl-6' : ''}
                `}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
