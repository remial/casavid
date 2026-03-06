"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

type SearchResult = {
  userId: string;
  email: string;
  channelName: string;
};

export default function AdminSearchClient() {
  const [channelName, setChannelName] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!channelName.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch("/api/admin/search-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: channelName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="YT name..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-gray-900"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !channelName.trim()}
          className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="ml-2">Search</span>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No matches found.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((result) => (
                <div
                  key={result.userId}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        YT Handle
                      </span>
                      <p className="text-gray-900 font-medium">
                        {result.channelName}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        UID
                      </span>
                      <p className="text-gray-900 font-mono text-sm break-all">
                        {result.userId}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        Addr
                      </span>
                      <p className="text-gray-900">{result.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

