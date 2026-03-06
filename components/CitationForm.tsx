import { useState } from 'react';

const CitationForm = () => {
  const [text, setText] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value) {
      setError('');
    }
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCitationStyle(e.target.value);
  };

  const getCitations = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!text) {
      setError('Please paste a sentence or paragraph to get Citations');
      return;
    }
    setLoading(true);
    setCitations([]);
    setError('');

    try {
      const response = await fetch('/api/citation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, style: citationStyle }),
      });
      const data = await response.json();
      setCitations(data.citations);
    } catch (error) {
      console.error('Error fetching citations:', error);
      setError('An error occurred while fetching citations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-lg">
      <div className="p-2 mb-2 font-bold">🧙‍♂️ Citation Genius 📚</div>
      <textarea
        value={text}
        onChange={handleTextChange}
        maxLength={1000}
        placeholder="Enter a sentence or paragraph here to generate citations/references..."
        className="w-full p-2 border rounded-md"
        style={{ height: '200px' }}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-2 flex items-center">
        <select value={citationStyle} onChange={handleStyleChange} className="p-2 border rounded-md mr-2">
          <option value="APA">APA</option>
          <option value="APA7">APA 7</option>
          <option value="MLA">MLA 9</option>
          <option value="Harvard">Harvard</option>
          <option value="IEEE">IEEE</option>
          <option value="Chicago">Chicago</option>
        </select>
        <div className="bg-green-500 rounded-full">
          <button
            onClick={getCitations}
            type="button"
            className="px-4 py-2 bg-green-500 text-white rounded-md"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Citations'}
          </button>
        </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="p-2 mb-2 border rounded-md">
            <p className="animate-colorCycle">🔮 Retrieving the best Publications for you...</p>
          </div>
        ) : (
          citations.map((citation, index) => (
            <div key={index} className="p-2 mb-2 border border-green-300 rounded-md">
              <p dangerouslySetInnerHTML={{ __html: citation }}></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CitationForm;
