import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';
import './App.css';
import { Heart, X } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showSummary, setShowSummary] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [likedCats, setLikedCats] = useState([]);

  const fetchCats = useCallback(async () => {
  setIsLoading(true);
  let response = null; 
  try {
    response = await axios.get('https://cataas.com/api/cats?limit=20&tags=cute');

    const catData = response.data
      .filter(cat => cat && cat.id)
      .map(cat => ({
        id: cat.id,
        name: `Kitty #${cat.id.slice(0, 4)}`,
        url: null,
      }));

    if (catData.length === 0 && response.data.length > 0) {
      console.warn('Warning: The filtered catData array is empty, but the API returned data. Check if the object properties (like _id) are correct.');
    }

    setCats(catData);
    setCurrentIndex(catData.length - 1);

  } catch (error) {
    console.error("Error during fetchCats execution:", error);
  
    if (response) {
      console.error('The API response at the time of error was:', response);
    } else {
      console.error('The request likely failed before any response was received.');
    }
  } finally {
    setIsLoading(false);
  }
}, []);
useEffect(() => {
  if (cats.length === 0 || currentIndex < 0) return;

  const currentCat = cats[currentIndex];

  // Jika kad semasa belum mempunyai URL, muat turunnya
  if (currentCat && !currentCat.url) {
    const newCats = [...cats];
    newCats[currentIndex].url = `https://cataas.com/cat/${currentCat.id}`;
    setCats(newCats);
  }

}, [currentIndex, cats]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const advanceToNextCard = useCallback(() => {
    setSwipeDirection(null);
    setCurrentIndex(prevIndex => prevIndex - 1);
  }, []);

  const handleSwipe = useCallback((direction) => {
    if (currentIndex < 0) return;
    setSwipeDirection(direction);
    const currentCat = cats[currentIndex];
    if (direction === 'right') {
      setLikedCats(prevLiked => [...prevLiked, currentCat]);
    }
    setTimeout(() => advanceToNextCard(), 300);
  }, [currentIndex, cats, advanceToNextCard]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  useEffect(() => {
    if (!isLoading && cats.length > 0 && currentIndex < 0) {
      setShowSummary(true);
    }
  }, [currentIndex, cats.length, isLoading]);

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__title">Paws & Preferences</h1>
        <p className="app__subtitle">Find your purrfect match!</p>
      </div>

      {!showSummary ? (
        <>
          <div className="app__cardContainer" {...handlers}>
            {isLoading ? (
              <div className='card-placeholder'>Loading cats...</div>
            ) : (
              // App.jsx (Kod Baharu yang Diperbaiki)
cats.map((cat, index) => {
  // --- FIX: Hanya paparkan 3 kad teratas untuk prestasi yang lebih baik ---
  if (index < currentIndex - 2) {
    return null;
  }

  const isTopCard = index === currentIndex;
  const cardClass = isTopCard ? `card card--${swipeDirection}` : 'card';
  const style = {
    // Gunakan cat.url hanya jika ia wujud (untuk lazy loading)
    backgroundImage: cat.url ? `url(${cat.url})` : 'none',
    backgroundColor: cat.url ? 'transparent' : '#333', // Latar belakang sementara
    transform: `translateY(${(currentIndex - index) * -10}px) scale(${1 - (currentIndex - index) * 0.05})`,
    zIndex: cats.length - index,
    // Pastikan hanya kad dalam tindanan yang kelihatan
    opacity: index <= currentIndex ? 1 : 0,
  };

  return (
    <div key={cat.id} className={cardClass} style={style}>
      {/* Hanya tunjukkan nama jika gambar telah dimuat turun */}
      {cat.url && <h3>{cat.name}</h3>}
    </div>
  );
})
            )}
            {!isLoading && currentIndex < 0 && (<div className='card-placeholder'>All done!</div>)}
          </div>
          <div className="app__buttons">
            <button onClick={() => handleSwipe('left')} className="button" disabled={isLoading || currentIndex < 0}><X size={30} color="#ec5e6f" /></button>
            <button onClick={() => handleSwipe('right')} className="button" disabled={isLoading || currentIndex < 0}><Heart size={30} color="#6ee3b4" fill="#6ee3b4" /></button>
          </div>
        </>
      ) : (
        <div className="summary">
          <h2>Your Favorite Kitties!</h2>
          <p>You liked {likedCats.length} cat{likedCats.length !== 1 ? 's' : ''}.</p>
          <div className="summary__grid">
            {likedCats.map(cat => (
              <div key={cat.id} className="summary__card">
                <img src={cat.url} alt={cat.name} /><p>{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
