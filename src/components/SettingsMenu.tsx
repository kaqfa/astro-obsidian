import { useState } from 'react';

interface SettingsMenuProps {
  currentSlug?: string;
  isPublic?: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  createdAt: number;
  lastUsedAt: number | null;
  isActive: number;
}

export default function SettingsMenu({ currentSlug, isPublic = false }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sharing' | 'api-keys' | 'users'>('sharing');
  const [showModal, setShowModal] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [notePublic, setNotePublic] = useState(isPublic);

  // Fetch API keys when modal opens
  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/v1/me/keys');
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  // Create new API key
  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/v1/me/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (data.success) {
        setNewKey(data.data.key);
        setNewKeyName('');
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  // Revoke API key
  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
      await fetch(`/api/v1/me/keys/${keyId}`, { method: 'DELETE' });
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  // Toggle note sharing
  const toggleSharing = async () => {
    try {
      if (!currentSlug) {
        console.error('No currentSlug provided');
        return;
      }

      const method = notePublic ? 'DELETE' : 'POST';
      // URL encode the slug but preserve slashes - replace %2F back to /
      const encodedSlug = encodeURIComponent(currentSlug).replace(/%2F/g, '/');
      console.log(`Toggling sharing: ${method} /api/v1/share/${encodedSlug}`);

      const res = await fetch(`/api/v1/share/${encodedSlug}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      console.log('Share response:', data);

      if (res.ok && data.success) {
        setNotePublic(!notePublic);
      } else {
        console.error('Failed to toggle sharing:', data.error);
        alert(data.error || 'Failed to toggle sharing');
      }
    } catch (error) {
      console.error('Failed to toggle sharing:', error);
      alert('Failed to toggle sharing. Check console for details.');
    }
  };

  const openModal = (tab: 'sharing' | 'api-keys' | 'users') => {
    setActiveTab(tab);
    setShowModal(true);
    setIsOpen(false);
    if (tab === 'api-keys') {
      fetchApiKeys();
    }
  };

  return (
    <>
      {/* Dropdown Menu */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-bg-tertiary hover:bg-accent/10 text-text-muted hover:text-accent rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 group border border-transparent hover:border-accent/20"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Settings</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-secondary border border-border rounded-lg shadow-lg overflow-hidden z-20">
              {currentSlug && (
                <button
                  onClick={() => openModal('sharing')}
                  className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-text-primary">Share Note</div>
                    <div className="text-xs text-text-muted">Make this note public</div>
                  </div>
                </button>
              )}
              <button
                onClick={() => openModal('api-keys')}
                className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-text-primary">API Keys</div>
                  <div className="text-xs text-text-muted">Manage your API keys</div>
                </div>
              </button>
              <div className="border-t border-border">
                <form action="/api/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full px-4 py-3 text-left hover:bg-error/10 transition-colors flex items-center gap-3 text-error"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-bg-secondary border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Settings</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {currentSlug && (
                <button
                  onClick={() => setActiveTab('sharing')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'sharing'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Share Note
                </button>
              )}
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'api-keys'
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                API Keys
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Sharing Tab */}
              {activeTab === 'sharing' && currentSlug && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-2">Share this note</h3>
                    <p className="text-sm text-text-muted mb-4">
                      Make this note accessible to anyone with the link, no login required.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg border border-border">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {notePublic ? 'Public' : 'Private'}
                      </div>
                      <div className="text-xs text-text-muted">
                        {notePublic
                          ? 'Anyone with the link can view'
                          : 'Only you can view this note'}
                      </div>
                    </div>
                    <button
                      onClick={toggleSharing}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        notePublic
                          ? 'bg-error/10 text-error hover:bg-error/20'
                          : 'bg-accent text-white hover:bg-accent-hover'
                      }`}
                    >
                      {notePublic ? 'Make Private' : 'Make Public'}
                    </button>
                  </div>

                  {notePublic && (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <div className="text-sm font-medium text-success mb-1">Public link:</div>
                      <div className="text-xs text-text-muted break-all">
                        {window.location.origin}/notes/{currentSlug}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api-keys' && (
                <div className="space-y-6">
                  {/* Create New Key */}
                  <form onSubmit={createApiKey} className="space-y-3">
                    <h3 className="text-sm font-medium text-text-primary">Create new API key</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key name (e.g., My App)"
                        className="flex-1 px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                  </form>

                  {/* New Key Display */}
                  {newKey && (
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
                      <div className="text-sm font-medium text-accent">Your new API key:</div>
                      <div className="p-3 bg-bg-primary rounded border border-accent/30">
                        <code className="text-sm text-accent break-all">{newKey}</code>
                      </div>
                      <div className="text-xs text-text-muted">
                        Save this key now. You won't be able to see it again!
                      </div>
                      <button
                        onClick={() => setNewKey(null)}
                        className="text-xs text-accent hover:underline"
                      >
                        I've saved it
                      </button>
                    </div>
                  )}

                  {/* Existing Keys */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-text-primary">Your API keys</h3>
                    {apiKeys.length === 0 ? (
                      <div className="text-sm text-text-muted text-center py-8">
                        No API keys yet. Create one above.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {apiKeys.map((key) => (
                          <div
                            key={key.id}
                            className="flex items-center justify-between p-3 bg-bg-tertiary border border-border rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-text-primary">{key.name}</div>
                              <div className="text-xs text-text-muted font-mono">
                                {key.id}... • Created {new Date(key.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={() => revokeApiKey(key.id)}
                              className="ml-3 px-3 py-1 text-xs text-error hover:bg-error/10 rounded transition-colors"
                            >
                              Revoke
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
