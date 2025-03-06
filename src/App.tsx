import React from 'react'; // Reactを明示的にインポート
import { useState, useEffect } from 'react';
import './App.css';

// 型定義
interface WordCard {
  word: string;
  meaning: string;
}

function App() {
  const [word, setWord] = useState('');
  const [cards, setCards] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailedMeaning, setDetailedMeaning] = useState('');
  const [wordHistory, setWordHistory] = useState<WordCard[]>([]);

  // APIリクエスト関数
  const fetchMeaning = async (wordToSearch: string, isDetailed = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const mockResponse = {
        data: {
          candidates: [{
            content: {
              parts: [{
                text: `${wordToSearch}は、「テスト」や「挑戦」を意味する名詞・動詞です。`
              }]
            }
          }]
        }
      };

      const generatedText = mockResponse.data.candidates[0].content.parts[0].text;

      if (isDetailed) {
        setDetailedMeaning(generatedText);
      } else {
        if (!cards.some(card => card.word.toLowerCase() === wordToSearch.toLowerCase())) {
          const newCard: WordCard = { word: wordToSearch, meaning: generatedText };
          setCards(prevCards => [...prevCards, newCard]);
          
          if (!wordHistory.some(item => item.word.toLowerCase() === wordToSearch.toLowerCase())) {
            const updatedHistory = [...wordHistory, newCard];
            setWordHistory(updatedHistory);
            localStorage.setItem('wordHistory', JSON.stringify(updatedHistory));
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知のエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>英単語学習アプリ</h1>
      
      <div className="search-box">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && word.trim() && fetchMeaning(word)}
          placeholder="英単語を入力"
          className="word-input"
        />
        <button 
          onClick={() => word.trim() && fetchMeaning(word)}
          className="search-button"
          disabled={loading}
        >
          {loading ? '読み込み中...' : '検索'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {/* その他のUI要素は変更なし */}
    </div>
  );
}

export default App;