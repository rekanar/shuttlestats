import { useState, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import type { FixtureMatch, MatchStatus, Partnership } from '../types';

interface SearchResultData {
  matches: FixtureMatch[];
  pending: FixtureMatch[];
  completed: FixtureMatch[];
  notPlayed: FixtureMatch[];
  partnerships: Partnership[];
}

interface Props {
  fixtureId: string;
  teamAName: string;
  teamBName: string;
  onSearch: (q: string) => Promise<SearchResultData | null>;
}

function statusBadge(s: MatchStatus) {
  if (s === 'pending') return <span className="px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">⏳</span>;
  if (s === 'not_played') return <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">—</span>;
  return <span className="px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700">✓</span>;
}

function resultLabel(m: FixtureMatch) {
  if (m.result === 'a_win') return '✅ A Won';
  if (m.result === 'b_win') return '✅ B Won';
  if (m.result === 'draw') return '🤝 Draw';
  return '';
}

function MatchRow({ m, highlight }: { m: FixtureMatch; highlight: string }) {
  const hl = (name: string) =>
    name.toLowerCase().includes(highlight.toLowerCase())
      ? <strong className="text-indigo-700">{name}</strong>
      : <span>{name}</span>;

  return (
    <tr className="border-b border-gray-50 text-xs hover:bg-gray-50">
      <td className="px-2 py-2 text-gray-500 whitespace-nowrap">R{(m as any).round_number || '?'} C{m.court}</td>
      <td className="px-2 py-2 text-blue-700">{hl(m.teamAPair[0])} &amp; {hl(m.teamAPair[1])}</td>
      <td className="px-2 py-2 text-center text-gray-500 whitespace-nowrap">vs</td>
      <td className="px-2 py-2 text-orange-700">{hl(m.teamBPair[0])} &amp; {hl(m.teamBPair[1])}</td>
      <td className="px-2 py-2 text-center">{statusBadge(m.status)}</td>
      <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{resultLabel(m)}</td>
    </tr>
  );
}

function Section({ title, matches, highlight, defaultOpen = true }: {
  title: string; matches: FixtureMatch[]; highlight: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 w-full text-left text-sm font-semibold text-gray-700 mb-1">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title} <span className="ml-1 text-xs font-normal text-gray-400">({matches.length})</span>
      </button>
      {open && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <th className="px-2 py-1.5 text-left">Rd/Ct</th>
                <th className="px-2 py-1.5 text-left">Team A Pair</th>
                <th className="px-2 py-1.5"></th>
                <th className="px-2 py-1.5 text-left">Team B Pair</th>
                <th className="px-2 py-1.5 text-center">Status</th>
                <th className="px-2 py-1.5 text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0
                ? <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400">None</td></tr>
                : matches.map(m => <MatchRow key={m.id} m={m} highlight={highlight} />)
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PlayerSearch({ onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!val.trim()) { setResults(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const data = await onSearch(val.trim());
      setResults(data);
      setLoading(false);
    }, 300);
    setDebounceTimer(t);
  }, [debounceTimer, onSearch]);

  const clear = () => { setQuery(''); setResults(null); };
  const totalFound = results ? results.matches.length : 0;

  return (
    <div className="mb-4">
      {/* Search Input */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
          placeholder="🔍 Search player name…"
          value={query}
          onChange={e => handleChange(e.target.value)}
        />
        {query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      {loading && <p className="text-xs text-gray-400 px-1">Searching…</p>}

      {!loading && results && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Results for <span className="text-indigo-600">"{query}"</span> — {totalFound} match{totalFound !== 1 ? 'es' : ''} found
          </p>

          {totalFound === 0 && (
            <p className="text-sm text-gray-400">No player found matching "{query}". Check spelling.</p>
          )}

          {totalFound > 0 && (
            <>
              <Section title="⏳ Pending" matches={results.pending} highlight={query} defaultOpen={true} />
              <Section title="✅ Completed" matches={results.completed} highlight={query} defaultOpen={false} />
              <Section title="— Not Played" matches={results.notPlayed} highlight={query} defaultOpen={false} />

              {/* Partnerships */}
              {results.partnerships.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    👥 Playing With (partnerships)
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b text-gray-500">
                          <th className="px-3 py-1.5 text-left">Partner</th>
                          <th className="px-3 py-1.5 text-center">Played</th>
                          <th className="px-3 py-1.5 text-center">Won</th>
                          <th className="px-3 py-1.5 text-center">Lost</th>
                          <th className="px-3 py-1.5 text-center">Win%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.partnerships.map((p: Partnership) => (
                          <tr key={p.partner} className="border-b border-gray-50">
                            <td className="px-3 py-1.5 font-medium text-gray-800">{p.partner}</td>
                            <td className="px-3 py-1.5 text-center">{p.played}</td>
                            <td className="px-3 py-1.5 text-center text-green-600">{p.won}</td>
                            <td className="px-3 py-1.5 text-center text-red-400">{p.lost}</td>
                            <td className="px-3 py-1.5 text-center font-semibold">{p.winPct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
