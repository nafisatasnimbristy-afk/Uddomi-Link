import { useState } from 'react';

function RoleRequestModal({ isOpen, onClose, onSubmit }) {
    const [selectedRole, setSelectedRole] = useState('business-owner');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(selectedRole, reason);
        setLoading(false);
        setReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-dark">Request Account Upgrade</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-dark font-semibold mb-2">
                                Select Role *
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="business-owner">Business Owner</option>
                                <option value="ngo">NGO / Non-Profit</option>
                            </select>
                            <p className="text-sm text-gray-600 mt-1">
                                {selectedRole === 'business-owner'
                                    ? 'Sell products and manage your shop'
                                    : 'Support local businesses and artisans'}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-dark font-semibold mb-2">
                                Why do you want this role? *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                rows="5"
                                placeholder="Tell us why you want to become a business owner or NGO..."
                                maxLength="500"
                                required
                            />
                            <p className="text-sm text-gray-500 text-right">{reason.length}/500</p>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Your request will be reviewed by an admin.
                                You'll receive the role once approved.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-green-800 transition font-bold disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-300 text-dark py-3 rounded-lg hover:bg-gray-400 transition font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RoleRequestModal;
