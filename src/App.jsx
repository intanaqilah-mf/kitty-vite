// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';
import './App.css';
import { Heart, X } from 'lucide-react';

function App() {
  // --- FIX: Added a dedicated 'isLoading' state for robust loading logic ---
  const [isLoading, setIsLoading] = useState(true);
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showSummary, setShowSummary] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [likedCats, setLikedCats] = useState([]);
  console.log('API response →', response.data);

  const fetchCats = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await axios.get('https://cataas.com/api/cats?limit=20&tags=cute');
    
    // --- DEBUGGING STEP 1: See the raw data from the API ---
    console.log('Raw response from API:', response.data);

    const catData = response.data
      .filter(cat => cat && cat._id)
      .map(cat => ({
        id: cat._id,
        name: `Kitty #${cat._id.slice(0, 4)}`,
        url: `https://cataas.com/cat/${cat._id}`,
      }));

    // --- DEBUGGING STEP 2: See what the data looks like after your filter/map ---
    console.log('Processed catData:', catData);
    console.log('Number of cats being set:', catData.length);

    setCats(catData);
    setCurrentIndex(catData.length - 1);
  } catch (error) {
    console.error("Error fetching cats:", error);
  } finally {
    setIsLoading(false);
  }
}, []);

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
      console.log(`You liked ${currentCat.name}`);
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
    // Show summary only when loading is done and there are no more cats
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
            {/* --- FIX: The main condition is now 'isLoading' --- */}
            {isLoading ? (
              <div className='card-placeholder'>Loading cats...</div>
            ) : (
              cats.map((cat, index) => {
                const isTopCard = index === currentIndex;
                const cardClass = isTopCard ? `card card--${swipeDirection}` : 'card';
                const style = {
                  backgroundImage: `url(${cat.url})`,
                  transform: `translateY(${(currentIndex - index) * -10}px) scale(${1 - (currentIndex - index) * 0.05})`,
                  zIndex: cats.length - index,
                  opacity: index >= currentIndex ? 1 : 0,
                };
                return (
                  <div key={cat.id} className={cardClass} style={style}>
                    <h3>{cat.name}</h3>
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
