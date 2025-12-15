import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const [profileData, setProfileData] = useState({
    // Business Owner fields
    businessName: '',
    businessType: '',
    phone: '',
    city: '',
    yearsInBusiness: '',
    // NGO fields
    organizationName: '',
    focusAreas: [],
    registrationNumber: '',
    mission: ''
  });

  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onProfileChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setProfileData(prev => ({
        ...prev,
        focusAreas: checked
          ? [...prev.focusAreas, value]
          : prev.focusAreas.filter(area => area !== value)
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let finalProfileData = null;

    if (role === 'business-owner') {
      finalProfileData = {
        businessName: profileData.businessName,
        businessType: profileData.businessType,
        phone: profileData.phone,
        address: {
          city: profileData.city,
          country: 'Bangladesh'
        },
        yearsInBusiness: profileData.yearsInBusiness ? parseInt(profileData.yearsInBusiness) : undefined
      };
    } else if (role === 'ngo') {
      finalProfileData = {
        businessName: profileData.organizationName,
        phone: profileData.phone,
        bio: profileData.mission,
        address: {
          country: 'Bangladesh'
        }
      };
      if (profileData.focusAreas.length > 0) {
        finalProfileData.bio = `Focus Areas: ${profileData.focusAreas.join(', ')}\n\n${profileData.mission}`;
      }
      if (profileData.registrationNumber) {
        finalProfileData.businessType = `Reg: ${profileData.registrationNumber}`;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profileData: finalProfileData
        }),
      });
      const data = await response.json();

      if (response.ok) {
        alert('Registration Successful! Please login.');
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    }
  };

  return (
    <div className="w-full min-h-screen bg-light flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-primary">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Join the Network</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-dark font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-dark font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-dark font-medium mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
              placeholder="********"
              required
            />
          </div>

          <div>
            <label className="block text-dark font-medium mb-1">I am a: *</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary bg-white"
            >
              <option value="user">Regular User</option>
              <option value="business-owner">Business Owner</option>
              <option value="ngo">NGO</option>
            </select>
          </div>

          {/* Business Owner Fields */}
          {role === 'business-owner' && (
            <div className="border-t-2 border-gray-200 pt-4 space-y-4">
              <h3 className="font-bold text-lg text-dark">Business Information</h3>

              <div>
                <label className="block text-dark font-medium mb-1">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={profileData.businessName}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  placeholder="Dhaka Handicrafts"
                  required
                />
              </div>

              <div>
                <label className="block text-dark font-medium mb-1">Business Type *</label>
                <select
                  name="businessType"
                  value={profileData.businessType}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary bg-white"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Handicrafts">Handicrafts</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Pottery">Pottery</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Food Products">Food Products</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Farming">Farming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-dark font-medium mb-1">Contact Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  placeholder="+880 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-dark font-medium mb-1">City/District *</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  placeholder="Dhaka"
                  required
                />
              </div>

              <div>
                <label className="block text-dark font-medium mb-1">Years in Business</label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={profileData.yearsInBusiness}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* NGO Fields */}
          {role === 'ngo' && (
            <div className="border-t-2 border-gray-200 pt-4 space-y-4">
              <h3 className="font-bold text-lg text-dark">Organization Details</h3>

              <div>
                <label className="block text-dark font-medium mb-1">Organization Name *</label>
                <input
                  type="text"
                  name="organizationName"
                  value={profileData.organizationName}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  placeholder="Rural Development Foundation"
                  required
                />
              </div>

              <div>
                <label className="block text-dark font-medium mb-2">Focus Areas * (Select at least one)</label>
                <div className="space-y-2 p-3 border border-gray-300 rounded bg-gray-50">
                  {['Education', 'Healthcare', 'Women Empowerment', 'Rural Development', 'Artisan Support', 'Youth Development'].map(area => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        value={area}
                        checked={profileData.focusAreas.includes(area)}
                        onChange={onProfileChange}
                        className="mr-2"
                      />
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-dark font-medium mb-1">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={profileData.registrationNumber}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  placeholder="NGO-BD-12345"
                />
              </div>

              <div>
                <label className="block text-dark font-medium mb-1">Contact Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  placeholder="+880 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-dark font-medium mb-1">Mission Statement</label>
                <textarea
                  name="mission"
                  value={profileData.mission}
                  onChange={onProfileChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-secondary"
                  rows="3"
                  placeholder="Brief description of your organization's mission..."
                  maxLength="500"
                />
                <p className="text-xs text-gray-500 mt-1">{profileData.mission.length}/500</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-green-800 transition font-bold mt-6"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-dark">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;