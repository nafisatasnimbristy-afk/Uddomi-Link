import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [navigate, user]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/orders/my-orders', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">📦 My Orders</h1>
                    <p className="text-lg opacity-90">Track your order history</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow-md text-center max-w-md mx-auto">
                        <p className="text-2xl font-bold text-dark mb-4">No orders yet</p>
                        <p className="text-gray-600 mb-6">Start shopping in the marketplace!</p>
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-green-800 transition font-bold"
                        >
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4 border-b pb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                                        <p className="text-sm text-gray-600">
                                            Placed: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">৳{order.totalAmount}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <img
                                                src={item.product?.imageUrl || 'https://via.placeholder.com/80'}
                                                alt={item.product?.name || 'Product'}
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold">{item.product?.name || 'Product'}</p>
                                                <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold">৳{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-bold mb-2">Shipping Address</h3>
                                    <p className="text-gray-700">{order.shippingAddress.fullName}</p>
                                    <p className="text-gray-700">{order.shippingAddress.phone}</p>
                                    <p className="text-gray-700">
                                        {order.shippingAddress.addressLine1}
                                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                    </p>
                                    <p className="text-gray-700">
                                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                    </p>
                                </div>

                                {order.paymentIntentId && (
                                    <div className="mt-4 bg-green-50 border border-green-300 p-3 rounded">
                                        <p className="text-sm">
                                            <span className="font-semibold">Payment ID:</span> {order.paymentIntentId}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">(Mock Stripe Payment)</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderHistory;
