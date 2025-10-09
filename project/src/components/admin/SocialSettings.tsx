import { useState } from 'react';

export default function SocialSettings() {
  const [formData, setFormData] = useState({
    facebook: 'https://facebook.com/xecongtrinhn',
    twitter: 'https://twitter.com/xecongtrinhn',
    instagram: 'https://instagram.com/xecongtrinhn',
    linkedin: 'https://linkedin.com/company/xecongtrinhn'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Mạng xã hội</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook
          </label>
          <input
            type="text"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/xecongtrinhn"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twitter
          </label>
          <input
            type="text"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            placeholder="https://twitter.com/xecongtrinhn"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>

        <div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
