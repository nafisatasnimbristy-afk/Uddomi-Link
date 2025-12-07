import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyProducts() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'handicrafts',
        imageUrl: '',
        stock: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || !user.roles || !user.roles.includes('business-owner')) {
            navigate('/');
            return;
        }
        fetchMyProducts();
    }, [navigate, user]);

    const fetchMyProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products/seller/my-products', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingProduct
            ? `http://localhost:5000/api/products/${editingProduct._id}`
            : 'http://localhost:5000/api/products';

        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(editingProduct ? 'Product updated!' : 'Product created!');
                setShowForm(false);
                setEditingProduct(null);
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    category: 'handicrafts',
                    imageUrl: '',
                    stock: ''
                });
                fetchMyProducts();
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            stock: product.stock
        });
        setShowForm(true);
    };

    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Delete ${productName}?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                alert('Product deleted!');
                fetchMyProducts();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting product');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'handicrafts',
            imageUrl: '',
            stock: ''
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">📦 My Products</h1>
                    <p className="text-lg opacity-90">Manage your product inventory</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-bold"
                    >
                        + Add New Product
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-dark font-medium mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-dark font-medium mb-1">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary bg-white"
                                        required
                                    >
                                        <option value="handicrafts">Handicrafts</option>
                                        <option value="textiles">Textiles</option>
                                        <option value="pottery">Pottery</option>
                                        <option value="jewelry">Jewelry</option>
                                        <option value="food">Food</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-dark font-medium mb-1">Price (৳) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-dark font-medium mb-1">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-dark font-medium mb-1">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-dark font-medium mb-1">Image URL *</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                                    placeholder="https://example.com/image.jpg"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">Use free images from Unsplash.com</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition font-bold"
                                >
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow-md text-center">
                        <p className="text-gray-600 text-lg mb-4">You haven't added any products yet</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-primary text-white px-6 py-2 rounded hover:bg-green-800 transition font-bold"
                        >
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xl font-bold text-primary">৳{product.price}</span>
                                        <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 bg-secondary text-dark py-2 rounded hover:bg-yellow-500 transition font-bold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id, product.name)}
                                            className="flex-1 bg-accent text-white py-2 rounded hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyProducts;
