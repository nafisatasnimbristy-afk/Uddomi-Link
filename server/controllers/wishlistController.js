const User = require('../models/userModel');
const Product = require('../models/productModel');
const Portfolio = require('../models/portfolioModel');

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { itemId, itemType } = req.body;

        // Validate item exists
        if (itemType === 'product') {
            const product = await Product.findById(itemId);
            if (!product) return res.status(404).json({ message: 'Product not found' });
        } else if (itemType === 'portfolio') {
            const portfolio = await Portfolio.findById(itemId);
            if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
        } else if (itemType === 'seller') {
            const seller = await User.findById(itemId);
            if (!seller) return res.status(404).json({ message: 'Seller not found' });
        } else {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        // Check if already in wishlist
        const user = await User.findById(req.user._id);
        const exists = user.wishlist.some(item => 
            item.itemId.toString() === itemId && item.itemType === itemType
        );

        if (exists) {
            return res.status(400).json({ message: 'Item already in wishlist' });
        }

        user.wishlist.push({ itemId, itemType });
        await user.save();

        res.json({ 
            message: 'Added to wishlist', 
            wishlist: user.wishlist,
            total: user.wishlist.length 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { itemId, itemType } = req.body;

        const user = await User.findById(req.user._id);
        const initialLength = user.wishlist.length;
        
        user.wishlist = user.wishlist.filter(item => 
            !(item.itemId.toString() === itemId && item.itemType === itemType)
        );

        await user.save();
        
        res.json({ 
            message: 'Removed from wishlist', 
            wishlist: user.wishlist,
            removed: initialLength - user.wishlist.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get my wishlist with populated items
const getMyWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'wishlist.itemId',
                select: 'name title description price imageUrl category seller profileImage bio'
            });

        // Organize by type
        const wishlistByType = {
            products: [],
            portfolios: [],
            sellers: []
        };

        for (const item of user.wishlist) {
            if (item.itemId) {
                const wishlistItem = {
                    _id: item._id,
                    itemId: item.itemId._id,
                    itemType: item.itemType,
                    addedAt: item.addedAt,
                    item: item.itemId
                };

                if (item.itemType === 'product') {
                    wishlistByType.products.push(wishlistItem);
                } else if (item.itemType === 'portfolio') {
                    wishlistByType.portfolios.push(wishlistItem);
                } else if (item.itemType === 'seller') {
                    wishlistByType.sellers.push(wishlistItem);
                }
            }
        }

        res.json(wishlistByType);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check if item is in wishlist
const checkInWishlist = async (req, res) => {
    try {
        const { itemId, itemType } = req.params;

        const user = await User.findById(req.user._id);
        const inWishlist = user.wishlist.some(item => 
            item.itemId.toString() === itemId && item.itemType === itemType
        );

        res.json({ inWishlist });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const count = user.wishlist.length;
        
        user.wishlist = [];
        await user.save();

        res.json({ 
            message: 'Wishlist cleared', 
            itemsRemoved: count 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getMyWishlist,
    checkInWishlist,
    clearWishlist
};
