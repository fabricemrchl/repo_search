import React, { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import axios from 'axios';

interface ExplorerProps {
  onSelect: (filepath: string, code: string) => void; // Updated to include code
}

export const Explorer: React.FC<ExplorerProps> = ({ onSelect }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(''); 
  const [prevQuery, setPrevQuery] = useState(''); // New state to keep track of the previous query
  const [hasMore, setHasMore] = useState(true); // New state to track if more results are available

  const handleSearch = async (query: string, page: number) => {
    if (!query) return;

    try {
      const skip = (page - 1) * 20;  // Calculate the skip value based on the current page
      const response = await axios.post(
          'http://127.0.0.1:8000/search',
          { query, skip, limit: 20 },  // Include skip and limit in the body
          { headers: { 'Content-Type': 'application/json' } }
      );

        const newResults = response.data.results;
        setSearchResults(page === 1 ? newResults : [...searchResults, ...newResults]);
        setHasMore(newResults.length > 0);
    } catch (error) {
        console.error('There was an error with the search!', error);
    }
  };

  const handleSeeMore = () => {
    const newPage = page + 1;
    setPage(newPage);
    handleSearch(query, newPage); 
    console.log(`new page value: ${newPage}`)
  };

  useEffect(() => {
    handleSearch(query, 1);
  }, [query]);

  return (
    <div className="max-h-[calc(100vh - headerHeight - footerHeight)]">
      <div className="grid grid-cols-1 gap-4">
        <div style={{ backgroundColor: '#0D1116' }} className="sticky top-0 z-10 bg-white mx-4">
          <SearchBar onSearch={setQuery} /> 
        </div>
        {searchResults.map((result, index) => {
          const filePathParts = result.filepath.split('/');
          const fileName = filePathParts[filePathParts.length - 1];

          return (
            <div 
              key={index} 
              className="mx-4 p-4 border rounded cursor-pointer transition-all duration-300 ease-in-out hover:border-cyan-500 text-white overflow-hidden"
              onClick={() => onSelect(result.filepath, result.code)}
                >
              <div className="font-bold overflow-auto scrollbar-hide">{fileName}</div>
              <div 
                className="text-sm overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {result.code}
              </div>
            </div>
          );
        })}
        {hasMore && (
          <button onClick={handleSeeMore} className="mx-4 p-2 border rounded cursor-pointer text-white">
            See More Results
          </button>
        )}
      </div>
    </div>
  );
};