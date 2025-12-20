const Portfolio = require('../models/portfolioModel');

// Get all portfolios (public)
const getAllPortfolios = async (req, res) => {
    try {
        const { category, search, featured } = req.query;
        let filter = { isPublished: true };

        if (category) filter.category = category;
        if (featured === 'true') filter.featured = true;
        if (search) filter.$text = { $search: search };

        const portfolios = await Portfolio.find(filter)
            .populate('creator', 'name email profileImage')
            .sort({ createdAt: -1 });

        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single portfolio
const getPortfolioById = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id)
            .populate('creator', 'name email profileImage bio location');

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        // Increment view count
        portfolio.views += 1;
        await portfolio.save();

        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create portfolio
const createPortfolio = async (req, res) => {
    try {
        const { title, description, category, media, tags, skills, priceRange, availability } = req.body;

        // Check if user is a creator/business owner
        if (!req.user.roles || (!req.user.roles.includes('business-owner') && !req.user.roles.includes('artist'))) {
            return res.status(403).json({ message: 'Only creators can create portfolios' });
        }

        const portfolio = await Portfolio.create({
            title,
            description,
            category,
            media,
            tags,
            skills,
            priceRange,
            availability,
            creator: req.user._id
        });

        res.status(201).json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update portfolio
const updatePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        // Check ownership
        if (portfolio.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this portfolio' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            portfolio[key] = updates[key];
        });

        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete portfolio
const deletePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        if (portfolio.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this portfolio' });
        }

        await Portfolio.findByIdAndDelete(req.params.id);
        res.json({ message: 'Portfolio deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get my portfolios
const getMyPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ creator: req.user._id })
            .populate('creator', 'name email')
            .sort({ createdAt: -1 });

        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Toggle like
const toggleLike = async (req, res) => {
    try {
        // In a real app, you'd have a separate Likes model
        // For simplicity, we'll just increment/decrement
        const portfolio = await Portfolio.findById(req.params.id);

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        // This is simplified - you'd track which users liked it
        portfolio.likes += 1;
        await portfolio.save();

        res.json({ likes: portfolio.likes });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllPortfolios,
    getPortfolioById,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    getMyPortfolios,
    toggleLike
};
