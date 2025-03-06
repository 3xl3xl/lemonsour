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
      const prompt = isDetailed
        ? `英単語「${wordToSearch}」の意味、品詞、例文（3つ以上）、および類義語、反意語を日本語で詳しく説明してください。発音記号も含めてください。`
        : `英単語「${wordToSearch}」の意味を日本語で簡潔に説明してください。品詞も含めてください。`;

      // モックデータを使用（本番では実際のAPIコールに置き換える）
      const mockResponse = {
        data: {
          candidates: [{
            content: {
              parts: [{
                text: `${wordToSearch}は、「テスト」や「挑戦」を意味する名詞・動詞です。例えば、"I accept this challenge"（この挑戦を受け入れる）のように使用されます。`
              }]
            }
          }]
        }
      };

      const generatedText = mockResponse.data.candidates[0].content.parts[0].text;

      if (isDetailed) {
        setDetailedMeaning(generatedText);
      } else {
        // 重複を避けるためにすでに存在するカードを確認
        if (!cards.some(card => card.word.toLowerCase() === wordToSearch.toLowerCase())) {
          const newCard: WordCard = { word: wordToSearch, meaning: generatedText };
          setCards(prevCards => [...prevCards, newCard]);
          
          // 履歴も更新
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

  // 単語カードクリック時のハンドラ
  const handleCardClick = async (selectedWord: string) => {
    setSelectedWord(selectedWord);
    setModalOpen(true);
    await fetchMeaning(selectedWord, true);
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    setModalOpen(false);
    setDetailedMeaning('');
    setSelectedWord(null);
  };

  // 単語入力の変更ハンドラ
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value);
  };

  // 検索ボタンクリック時のハンドラ
  const handleSearch = () => {
    if (word.trim()) {
      fetchMeaning(word);
      setWord('');
    }
  };

  // Enterキー押下時のハンドラ
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && word.trim()) {
      fetchMeaning(word);
      setWord('');
    }
  };

  // マウント時に履歴を読み込む
  useEffect(() => {
    const savedHistory = localStorage.getItem('wordHistory');
    if (savedHistory) {
      try {
        setWordHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('履歴の読み込みに失敗しました:', e);
      }
    }
  }, []);

  return (
    <div className="app-container">
      <h1>英単語学習アプリ</h1>
      
      <div className="search-box">
        <input
          type="text"
          value={word}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="英単語を入力"
          className="word-input"
        />
        <button 
          onClick={handleSearch} 
          className="search-button"
          disabled={loading}
        >
          {loading ? '読み込み中...' : '検索'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="card-section">
        <h2>単語カード</h2>
        {loading && !modalOpen && <p className="loading-message">読み込み中...</p>}
        <div className="card-container">
          {cards.map((card, index) => (
            <div 
              key={index}
              className="word-card"
              onClick={() => handleCardClick(card.word)}
            >
              <h3>{card.word}</h3>
              <p>{card.meaning.length > 100 ? card.meaning.substring(0, 100) + '...' : card.meaning}</p>
            </div>
          ))}
          {cards.length === 0 && !loading && (
            <p>単語を検索して単語カードを追加しましょう。</p>
          )}
        </div>
      </div>

      <div className="history-section">
        <h2>学習履歴</h2>
        <div className="card-container">
          {wordHistory.map((card, index) => (
            <div 
              key={index}
              className="word-card history-card"
              onClick={() => handleCardClick(card.word)}
            >
              <h3>{card.word}</h3>
              <p>{card.meaning.length > 100 ? card.meaning.substring(0, 100) + '...' : card.meaning}</p>
            </div>
          ))}
          {wordHistory.length === 0 && (
            <p>まだ学習履歴がありません。</p>
          )}
        </div>
      </div>

      {/* モーダル */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            <h2>{selectedWord} の詳細</h2>
            
            {loading ? (
              <p className="loading-message">詳細を読み込み中...</p>
            ) : (
              <div className="detailed-meaning">
                {detailedMeaning}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;