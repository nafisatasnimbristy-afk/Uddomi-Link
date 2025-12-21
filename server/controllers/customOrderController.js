const CustomOrder = require('../models/customOrderModel');
const { sendNotification } = require('../utils/emailService');

// Create custom order request
const createCustomOrder = async (req, res) => {
    try {
        const { sellerId, title, description, category, budget, deadline, referenceImages, specifications } = req.body;

        const customOrder = await CustomOrder.create({
            customer: req.user._id,
            seller: sellerId,
            title,
            description,
            category,
            budget,
            deadline,
            referenceImages,
            specifications,
            status: 'pending'
        });

        // Send notification to seller
        await sendNotification(
            sellerId,
            null, // email would be fetched from user model
            {
                type: 'custom_order',
                title: 'New Custom Order Request',
                message: `You have a new custom order request: ${title}`,
                relatedId: customOrder._id,
                relatedModel: 'CustomOrder',
                actionUrl: `/custom-orders/${customOrder._id}`
            },
            {
                customerName: req.user.name,
                description,
                budget,
                deadline,
                requestId: customOrder._id
            }
        );

        res.status(201).json(customOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get orders where I'm the seller
const getOrdersForSeller = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = { seller: req.user._id };

        if (status) filter.status = status;

        const orders = await CustomOrder.find(filter)
            .populate('customer', 'name email profileImage')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get orders where I'm the customer
const getOrdersForCustomer = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = { customer: req.user._id };

        if (status) filter.status = status;

        const orders = await CustomOrder.find(filter)
            .populate('seller', 'name email profileImage')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single order
const getOrderById = async (req, res) => {
    try {
        const order = await CustomOrder.findById(req.params.id)
            .populate('customer', 'name email profileImage phone')
            .populate('seller', 'name email profileImage bio skills');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        if (order.customer._id.toString() !== req.user._id.toString() && 
            order.seller._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update order (seller response)
const updateOrder = async (req, res) => {
    try {
        const order = await CustomOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is the seller
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the seller can respond to this order' });
        }

        const { status, sellerResponse, message } = req.body;

        if (status) order.status = status;
        if (sellerResponse) {
            order.sellerResponse = {
                ...sellerResponse,
                responseDate: new Date()
            };
        }

        // Add to conversation if message provided
        if (message) {
            order.conversation.push({
                sender: req.user._id,
                message
            });
        }

        await order.save();

        // Notify customer
        if (status === 'quoted' || status === 'accepted' || status === 'rejected') {
            await sendNotification(
                order.customer,
                null,
                {
                    type: 'custom_order',
                    title: `Custom Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    message: `Your custom order "${order.title}" has been ${status}`,
                    relatedId: order._id,
                    relatedModel: 'CustomOrder',
                    actionUrl: `/custom-orders/${order._id}`
                }
            );
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add message to conversation
const addMessage = async (req, res) => {
    try {
        const order = await CustomOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        if (order.customer.toString() !== req.user._id.toString() && 
            order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to message this order' });
        }

        const { message, attachments } = req.body;

        order.conversation.push({
            sender: req.user._id,
            message,
            attachments: attachments || []
        });

        await order.save();

        // Notify the other party
        const recipientId = req.user._id.toString() === order.customer.toString() 
            ? order.seller 
            : order.customer;

        await sendNotification(
            recipientId,
            null,
            {
                type: 'message',
                title: 'New Message in Custom Order',
                message: `New message in your custom order: ${order.title}`,
                relatedId: order._id,
                relatedModel: 'CustomOrder',
                actionUrl: `/custom-orders/${order._id}`
            }
        );

        res.json(order.conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createCustomOrder,
    getOrdersForSeller,
    getOrdersForCustomer,
    getOrderById,
    updateOrder,
    addMessage
};
