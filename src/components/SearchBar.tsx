import { useState, useEffect } from 'react';
import FlexSearch from 'flexsearch';

interface Note {
  slug: string;
  title: string;
  content: string;
}

interface Props {
  notes: Note[];
}

export default function SearchBar({ notes }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [index, setIndex] = useState<any>(null);

  useEffect(() => {
    // Handle CommonJS import interop
    const Index = (FlexSearch as any).Index || FlexSearch;
    
    const searchIndex = new Index({
      tokenize: 'forward',
      cache: true
    });

    notes.forEach((note, i) => {
      searchIndex.add(i, `${note.title} ${note.content}`);
    });

    setIndex(searchIndex);
  }, [notes]);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (!value.trim() || !index) {
      setResults([]);
      return;
    }

    const searchResults = index.search(value);
    const matched = searchResults
      .map((idx: any) => notes[idx as number])
      .slice(0, 5);

    setResults(matched);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="🔍 Search notes..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-text-secondary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
      />

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.map((note) => (
            <a
              key={note.slug}
              href={`/notes/${note.slug}`}
              className="block px-3 py-3 border-b border-border last:border-b-0 hover:bg-bg-tertiary transition-colors"
            >
              <div className="font-medium text-text-primary text-sm truncate">
                {note.title}
              </div>
              <div className="text-xs text-text-muted truncate mt-1">
                {note.content.substring(0, 80)}...
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
