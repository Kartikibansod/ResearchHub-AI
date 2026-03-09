import React, { useState, useEffect } from 'react';
import { papers, workspaces } from '../api';

interface Paper {
  title: string;
  authors: string;
  abstract: string;
  date: string;
  url: string;
}

interface Workspace {
  id: number;
  name: string;
}

interface SearchPapersProps {
  workspaceId: number | null;
}

const SearchPapers: React.FC<SearchPapersProps> = ({ workspaceId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [selectedWorkspaceForImport, setSelectedWorkspaceForImport] = useState<number | null>(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [paperToImport, setPaperToImport] = useState<Paper | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await workspaces.getAll();
      setWorkspaceList(response.data);
    } catch (err) {
      console.error('Failed to load workspaces', err);
    }
  };

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      console.log('Searching for:', query);
      const response = await papers.search(query);
      console.log('Search response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setResults(response.data);
        if (response.data.length === 0) {
          setError('No papers found. Try different keywords.');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Search failed', err);
      setError(err.response?.data?.detail || 'Search failed. Please try again.');
    }
    setLoading(false);
  };

  const handleImportClick = (paper: Paper) => {
    if (workspaceList.length === 0) {
      alert('Please create a workspace first!');
      return;
    }
    if (workspaceList.length === 1) {
      // Only one workspace, import directly
      handleImport(paper, workspaceList[0].id);
    } else {
      // Multiple workspaces, show selector
      setPaperToImport(paper);
      setSelectedWorkspaceForImport(workspaceId || workspaceList[0].id);
      setShowWorkspaceModal(true);
    }
  };

  const handleImport = async (paper: Paper, targetWorkspaceId: number) => {
    try {
      await papers.import(paper, targetWorkspaceId);
      alert('Paper imported successfully!');
      setShowWorkspaceModal(false);
      setPaperToImport(null);
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to import paper. Please try again.');
    }
  };

  const confirmImport = () => {
    if (paperToImport && selectedWorkspaceForImport) {
      handleImport(paperToImport, selectedWorkspaceForImport);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Search Research Papers</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search papers... (e.g., 'machine learning', 'neural networks')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
          disabled={loading || !query}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Searching arXiv database...</p>
        </div>
      )}
      
      {!loading && results.length === 0 && !error && query && (
        <div className="text-center py-8 text-gray-500">
          <p>No results yet. Try searching for papers!</p>
        </div>
      )}
      
      <div className="space-y-4">
        {results.map((paper, idx) => (
          <div key={idx} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-2 text-gray-800">{paper.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Authors:</span> {paper.authors}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              <span className="font-medium">Published:</span> {paper.date}
            </p>
            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
              {paper.abstract.substring(0, 300)}...
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleImportClick(paper)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Import to Workspace
              </button>
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                View on arXiv
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {results.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          Found {results.length} papers
        </div>
      )}

      {/* Workspace Selection Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Select Workspace</h3>
            <p className="text-gray-600 mb-4">Choose which workspace to import this paper to:</p>
            <div className="space-y-2 mb-6">
              {workspaceList.map((ws) => (
                <label key={ws.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="workspace"
                    value={ws.id}
                    checked={selectedWorkspaceForImport === ws.id}
                    onChange={() => setSelectedWorkspaceForImport(ws.id)}
                    className="mr-3"
                  />
                  <span className="font-medium">{ws.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmImport}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setShowWorkspaceModal(false);
                  setPaperToImport(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPapers;
