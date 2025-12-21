import { useState, useEffect } from 'react';

function WishlistButton({ itemId, itemType }) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && itemId && itemType) {
            checkWishlistStatus();
        }
    }, [user, itemId, itemType]);

    const checkWishlistStatus = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/wishlist/check/${itemType}/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsInWishlist(data.inWishlist);
            }
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const toggleWishlist = async () => {
        if (!user) {
            alert('Please login to save to wishlist');
            return;
        }

        setLoading(true);
        try {
            const endpoint = isInWishlist ? 'remove' : 'add';
            const response = await fetch(`http://localhost:5000/api/wishlist/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ itemId, itemType })
            });

            if (response.ok) {
                setIsInWishlist(!isInWishlist);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <button
            onClick={toggleWishlist}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            disabled={loading}
            className={`p-2 rounded-full transition ${
                isInWishlist 
                    ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {loading ? '...' : (isInWishlist ? (hover ? '❌' : '❤️') : (hover ? '❤️' : '🤍'))}
        </button>
    );
}

export default WishlistButton;
