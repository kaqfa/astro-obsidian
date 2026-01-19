import { useEffect, useState } from 'react';

interface ShareModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareStatus {
  enabled: boolean;
  publicUrl: string | null;
  expiresAt: string | null;
}

export default function ShareModal({ slug, isOpen, onClose }: ShareModalProps) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>({
    enabled: false,
    publicUrl: null,
    expiresAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch current share status when modal opens
  useEffect(() => {
    if (isOpen && slug) {
      fetchShareStatus();
    }
  }, [isOpen, slug]);

  const fetchShareStatus = async () => {
    try {
      const response = await fetch(`/api/share/status?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (data.success) {
        setShareStatus(data.data);
      }
    } catch (error) {
      console.error('[ShareModal] Failed to fetch status:', error);
    }
  };

  const toggleSharing = async (enabled: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/share/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          enabled,
          expiresInDays: null, // No expiry by default
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShareStatus(data.data);
      } else {
        alert(`Failed to ${enabled ? 'enable' : 'disable'} sharing: ${data.error}`);
      }
    } catch (error) {
      console.error('[ShareModal] Toggle failed:', error);
      alert('Failed to toggle sharing');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareStatus.publicUrl) return;

    try {
      await navigator.clipboard.writeText(shareStatus.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('[ShareModal] Copy failed:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareStatus.publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Share</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Share Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Shared to web</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {shareStatus.enabled
                  ? 'Anyone with the link can view this page'
                  : 'Only you can view this page'}
              </p>
            </div>
            <button
              onClick={() => toggleSharing(!shareStatus.enabled)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shareStatus.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              role="switch"
              aria-checked={shareStatus.enabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shareStatus.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Share Link (only show when enabled) */}
        {shareStatus.enabled && shareStatus.publicUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Share link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareStatus.publicUrl}
                className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={shareStatus.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                title="Open in new tab"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Future: Additional options */}
        {/* <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>Include sub-pages</span>
            <input type="checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <span>Search engine indexing</span>
            <input type="checkbox" />
          </div>
        </div> */}
      </div>
    </div>
  );
}
