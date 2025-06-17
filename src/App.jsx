// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';
import './App.css';
import { Heart, X } from 'lucide-react';

function App() {
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showSummary, setShowSummary] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [likedCats, setLikedCats] = useState([]); // We will manage this locally for now

  const fetchCats = useCallback(async () => {
    try {
      const response = await axios.get('https://cataas.com/api/cats?limit=20&tags=cute');
      const catData = response.data
        .filter(cat => cat && cat._id)
        .map(cat => ({
          id: cat._id,
          name: `Kitty #${cat._id.slice(0, 4)}`,
          url: `https://cataas.com/cat/${cat._id}`,
        }));
      setCats(catData);
      setCurrentIndex(catData.length - 1);
    } catch (error) {
      console.error("Error fetching cats:", error);
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
      // Add the liked cat to our local list
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
    if (cats.length > 0 && currentIndex < 0) {
      setShowSummary(true);
    }
  }, [currentIndex, cats.length]);

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__title">Paws & Preferences</h1>
        <p className="app__subtitle">Find your purrrfect match!</p>
      </div>

      {!showSummary ? (
        <>
          <div className="app__cardContainer" {...handlers}>
            {cats.length > 0 ? (
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
            ) : (<div className='card-placeholder'>Load cats...</div>)}
            {cats.length > 0 && currentIndex < 0 && (<div className='card-placeholder'>Selesai!</div>)}
          </div>
          <div className="app__buttons">
            <button onClick={() => handleSwipe('left')} className="button" disabled={currentIndex < 0}><X size={30} color="#ec5e6f" /></button>
            <button onClick={() => handleSwipe('right')} className="button" disabled={currentIndex < 0}><Heart size={30} color="#6ee3b4" fill="#6ee3b4" /></button>
          </div>
        </>
      ) : (
        <div className="summary">
          <h2>Your favorite cat!</h2>
          <p>You have swapped like {likedCats.length} cats.</p>
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
