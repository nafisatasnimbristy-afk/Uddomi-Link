import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const cartKey = user ? `cart_${user._id}` : 'cart_guest';
        const savedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        setCart(savedCart);
    };

    const updateQuantity = (productId, newQuantity) => {
        const updatedCart = cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: Math.max(1, Math.min(item.stock, newQuantity)) }
                : item
        );
        setCart(updatedCart);
        const cartKey = user ? `cart_${user._id}` : 'cart_guest';
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    };

    const removeItem = (productId) => {
        const updatedCart = cart.filter(item => item.productId !== productId);
        setCart(updatedCart);
        const cartKey = user ? `cart_${user._id}` : 'cart_guest';
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Please login to place an order');
            navigate('/login');
            return;
        }

        const orderData = {
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            shippingAddress
        };

        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Order placed successfully! Payment ID: ${data.mockPayment.paymentIntentId}`);
                const cartKey = `cart_${user._id}`;
                localStorage.removeItem(cartKey);
                setCart([]);
                setShowCheckout(false);
                navigate('/orders');
            } else {
                const error = await response.json();
                alert(error.message || 'Error placing order');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error placing order');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-light">
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="bg-white p-12 rounded-lg shadow-md max-w-md mx-auto">
                        <p className="text-2xl font-bold text-dark mb-4">🛒 Your cart is empty</p>
                        <p className="text-gray-600 mb-6">Start adding products to your cart!</p>
                        <Link
                            to="/marketplace"
                            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-green-800 transition font-bold"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🛒 Shopping Cart</h1>
                    <p className="text-lg opacity-90">Review your items and checkout</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md">
                            {cart.map(item => (
                                <div key={item.productId} className="flex gap-4 p-6 border-b last:border-b-0">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-24 h-24 object-cover rounded"
                                    />

                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                                        <p className="text-primary font-bold text-xl">৳{item.price}</p>

                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="bg-gray-300 hover:bg-gray-400 w-8 h-8 rounded font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="font-bold w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="bg-gray-300 hover:bg-gray-400 w-8 h-8 rounded font-bold disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="text-accent hover:text-red-700 font-medium ml-auto"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-xl">৳{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-bold">৳{getTotalAmount()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="font-bold">৳0</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-xl">
                                    <span className="font-bold">Total:</span>
                                    <span className="font-bold text-primary">৳{getTotalAmount()}</span>
                                </div>
                            </div>

                            {!showCheckout ? (
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            alert('Please login to checkout');
                                            navigate('/login');
                                        } else {
                                            setShowCheckout(true);
                                        }
                                    }}
                                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-green-800 transition"
                                >
                                    Proceed to Checkout
                                </button>
                            ) : (
                                <form onSubmit={handleCheckout} className="space-y-3">
                                    <h3 className="font-bold text-lg mb-2">Shipping Address</h3>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={shippingAddress.fullName}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={shippingAddress.phone}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 1"
                                        value={shippingAddress.addressLine1}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 2 (Optional)"
                                        value={shippingAddress.addressLine2}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                                        className="w-full p-2 border rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={shippingAddress.city}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={shippingAddress.postalCode}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />

                                    <div className="bg-yellow-50 border border-yellow-300 p-3 rounded text-sm">
                                        <p className="font-semibold mb-1">💳 Mock Payment</p>
                                        <p className="text-gray-700">This is a demo. Payment will be simulated.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-secondary text-dark font-bold py-3 rounded-lg hover:bg-yellow-500 transition"
                                    >
                                        Place Order (Mock Payment)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCheckout(false)}
                                        className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
