
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleClear = () => {
    setQuery('');
    onSearch('');
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };
  
  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for products..."
          className="pl-10 pr-10 py-6 w-full rounded-full border-gray-200 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          value={query}
          onChange={handleChange}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
