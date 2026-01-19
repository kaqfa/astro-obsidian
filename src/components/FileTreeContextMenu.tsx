import { useEffect, useState } from 'react';
import ContextMenu from './ContextMenu';

export default function FileTreeContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    slug: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      // Find if click is on a file tree item
      const target = event.target as HTMLElement;
      const fileLink = target.closest('a[href^="/notes/"]') as HTMLAnchorElement;

      if (fileLink) {
        event.preventDefault();

        // Extract slug from href
        const href = fileLink.getAttribute('href');
        if (href) {
          const slug = href.replace('/notes/', '');
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
            slug,
          });
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  if (!contextMenu) return null;

  const copyInternalLink = () => {
    const link = `${window.location.origin}/notes/${contextMenu.slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyShareLink = async () => {
    try {
      // Check if note is shared
      const response = await fetch(`/api/share/status?slug=${encodeURIComponent(contextMenu.slug)}`);
      const data = await response.json();

      if (data.success && data.data.enabled && data.data.publicUrl) {
        // Already shared - copy the public URL
        await navigator.clipboard.writeText(data.data.publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Not shared - enable sharing first
        const toggleResponse = await fetch('/api/share/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: contextMenu.slug,
            enabled: true,
          }),
        });

        const toggleData = await toggleResponse.json();

        if (toggleData.success && toggleData.data.publicUrl) {
          await navigator.clipboard.writeText(toggleData.data.publicUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          alert('Failed to create share link');
        }
      }
    } catch (error) {
      console.error('[ContextMenu] Failed to copy share link:', error);
      alert('Failed to copy share link');
    }
  };

  const menuItems = [
    {
      label: copied ? 'Copied!' : 'Copy internal link',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      onClick: copyInternalLink,
    },
    {
      label: copied ? 'Copied!' : 'Copy share link',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      ),
      onClick: copyShareLink,
    },
  ];

  return (
    <ContextMenu
      items={menuItems}
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={() => setContextMenu(null)}
    />
  );
}
