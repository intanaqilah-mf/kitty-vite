import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';
import './App.css';
import { Heart, X, RotateCcw, Share2 } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cats, setCats] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showSummary, setShowSummary] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [likedCats, setLikedCats] = useState([]);
  const [lastSwiped, setLastSwiped] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [shareText, setShareText] = useState("Share Favorites");

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
      setCats(catData);
      setCurrentIndex(catData.length - 1);
    } catch (error) {
      console.error("Error during fetchCats execution:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  useEffect(() => {
    if (!cats[currentIndex]) return;
    if (cats[currentIndex].url) return;
    setCats(prevCats =>
      prevCats.map((cat, index) => {
        if (index === currentIndex) {
          return { ...cat, url: `https://cataas.com/cat/${cat.id}` };
        }
        return cat;
      })
    );
  }, [currentIndex, cats]);

  const advanceToNextCard = useCallback(() => {
    setSwipeDirection(null);
    setCurrentIndex(prevIndex => prevIndex - 1);
  }, []);

  const handleSwipe = useCallback((direction) => {
    if (currentIndex < 0) return;
    const currentCat = cats[currentIndex];
    setLastSwiped({ cat: currentCat, direction: direction });
    setSwipeDirection(direction);
    if (direction === 'right') {
      setLikedCats(prevLiked => [...prevLiked, currentCat]);
    }
    setTimeout(() => advanceToNextCard(), 300);
  }, [currentIndex, cats, advanceToNextCard]);

  const handleUndo = () => {
    if (!lastSwiped) return;
    const { cat, direction } = lastSwiped;
    setSwipeDirection(null);
    setCurrentIndex(prevIndex => prevIndex + 1);
    if (direction === 'right') {
      setLikedCats(prevLiked => prevLiked.filter(likedCat => likedCat.id !== cat.id));
    }
    setLastSwiped(null);
  };

  const handleShare = () => {
    const shareContent = `I liked ${likedCats.length} cats on Paws & Preferences! 🐾 Check it out: ${window.location.href}`;
    navigator.clipboard.writeText(shareContent);
    setShareText("Copied!");
    setTimeout(() => setShareText("Share Favorites"), 2000);
  };

  const handleRedo = useCallback(() => {
    setShowSummary(false);
    setLikedCats([]);
    setLastSwiped(null);
    fetchCats();
  }, [fetchCats]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  useEffect(() => {
    if (!isLoading && cats.length > 0 && currentIndex < 0) {
      setTimeout(() => setShowSummary(true), 500);
    }
  }, [currentIndex, cats.length, isLoading]);

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__title">Paws & Preferences</h1>
        <p className="app__subtitle">Find your purrfect match!</p>
      </div>

      <div className={`swipe-view ${!showSummary ? 'visible' : ''}`}>
        <div className="app__cardContainer" {...handlers}>
          {isLoading ? (
            <div className='card-placeholder'>Loading cats...</div>
          ) : (
            cats.map((cat, index) => {
              if (index < currentIndex - 2) {
                return null;
              }

              const isTopCard = index === currentIndex;
              const cardClass = isTopCard ? `card card--${swipeDirection}` : 'card';

              const style = {
                visibility: cat.url ? 'visible' : 'hidden',
                backgroundImage: cat.url ? `url(${cat.url})` : 'none',
                transform: `translateY(${(currentIndex - index) * -10}px) scale(${1 - (currentIndex - index) * 0.05})`,
                zIndex: cats.length - index,
                opacity: index <= currentIndex ? 1 : 0,
              };

              return (
                <div key={cat.id} className={cardClass} style={style}>
                  {isTopCard && swipeDirection && (
                    <div className={`swipe-feedback ${swipeDirection === 'right' ? 'like' : 'nope'}`}>
                      {swipeDirection === 'right' ? 'LIKE' : 'NOPE'}
                    </div>
                  )}
                  {cat.url && <h3>{cat.name}</h3>}
                </div>
              );
            })
          )}
          {!isLoading && currentIndex < 0 && (<div className='card-placeholder'>All done!</div>)}
        </div>
        <div className="app__buttons">
          <button onClick={() => handleSwipe('left')} className="button" disabled={isLoading || currentIndex < 0}>
            <X size={30} color="var(--dislike-color)" />
          </button>
          <button onClick={handleUndo} className="button button--undo" disabled={!lastSwiped}>
            <RotateCcw size={26} color="#f0b800" />
          </button>
          <button onClick={() => handleSwipe('right')} className="button" disabled={isLoading || currentIndex < 0}>
            <Heart size={30} color="var(--like-color)" fill="var(--like-color)" />
          </button>
        </div>
      </div>

      <div className={`summary ${showSummary ? 'visible' : ''}`}>
        <h2>Your Favorite Kitties!</h2>
        <p>You liked {likedCats.length} cat{likedCats.length !== 1 ? 's' : ''}.</p>
        <div className="summary__grid">
          {likedCats.map(cat => (
            <div key={cat.id} className="summary__card" onClick={() => setSelectedImage(cat.url)}>
              <img src={cat.url} alt={cat.name} /><p>{cat.name}</p>
            </div>
          ))}
        </div>
        <div className="summary__actions">
          <button onClick={handleShare} className="button button--share">
            <Share2 size={20} /> {shareText}
          </button>
          <button onClick={handleRedo} className="button button--redo">
            Swipe Again!
          </button>
        </div>
      </div>

      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <img src={selectedImage} alt="A cute cat, up close" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;