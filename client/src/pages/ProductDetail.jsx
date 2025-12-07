import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`);
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
            } else {
                alert('Product not found');
                navigate('/marketplace');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error loading product');
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = () => {
        if (quantity > product.stock) {
            alert(`Only ${product.stock} items available in stock`);
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        const cartKey = user ? `cart_${user._id}` : 'cart_guest';
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const existingItem = cart.find(item => item.productId === product._id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity,
                stock: product.stock
            });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        alert(`${quantity} × ${product.name} added to cart!`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Product not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="container mx-auto px-4 py-8">
                <Link
                    to="/marketplace"
                    className="inline-block mb-6 text-primary hover:text-green-800 font-medium"
                >
                    ← Back to Marketplace
                </Link>

                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-96 object-cover rounded-lg shadow-md"
                            />
                        </div>

                        <div className="p-8">
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-secondary text-dark text-sm font-semibold rounded-full uppercase">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold text-dark mb-4">{product.name}</h1>

                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-4xl font-bold text-primary">৳{product.price}</span>
                                <span className="text-gray-600">
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-dark mb-2">Description</h2>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-bold text-dark mb-2">Seller Information</h3>
                                <p className="text-gray-700">
                                    <span className="font-medium">Name:</span> {product.seller?.name || 'Unknown'}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">Email:</span> {product.seller?.email || 'N/A'}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-dark font-medium mb-2">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="bg-gray-300 hover:bg-gray-400 text-dark font-bold w-10 h-10 rounded"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                        className="bg-gray-300 hover:bg-gray-400 text-dark font-bold w-10 h-10 rounded disabled:opacity-50"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={addToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-primary text-white font-bold py-4 rounded-lg hover:bg-green-800 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                                </button>
                                <Link
                                    to="/cart"
                                    className="bg-secondary text-dark font-bold py-4 px-8 rounded-lg hover:bg-yellow-500 transition text-lg text-center"
                                >
                                    View Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
