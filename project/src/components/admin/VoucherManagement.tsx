import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Voucher } from '../../types';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Loader, 
  CheckCircle, 
  Calendar, 
  Percent,
  DollarSign
} from 'lucide-react';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Voucher>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 0,
    max_uses: 100,
    valid_from: new Date().toISOString(),
    valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    is_active: true
  });

  // Fetch vouchers on component mount
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setVouchers(data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVoucher = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .insert([formData])
        .select();

      if (error) {
        throw error;
      }

      // Reset form and refresh vouchers list
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_value: 0,
        max_uses: 100,
        valid_from: new Date().toISOString(),
        valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        is_active: true
      });
      setShowAddModal(false);
      fetchVouchers();

    } catch (error) {
      console.error('Error adding voucher:', error);
      alert('Failed to add voucher. Make sure the code is unique.');
    }
  };

  const handleEditVoucher = async () => {
    if (!currentVoucher) return;

    try {
      const { data, error } = await supabase
        .from('vouchers')
        .update(formData)
        .eq('id', currentVoucher.id)
        .select();

      if (error) {
        throw error;
      }

      setShowEditModal(false);
      fetchVouchers();

    } catch (error) {
      console.error('Error editing voucher:', error);
      alert('Failed to update voucher');
    }
  };

  const handleDeleteVoucher = async () => {
    if (!currentVoucher) return;

    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', currentVoucher.id);

      if (error) {
        throw error;
      }

      setShowDeleteModal(false);
      fetchVouchers();

    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Failed to delete voucher');
    }
  };

  const handleToggleActive = async (voucher: Voucher) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .update({ is_active: !voucher.is_active })
        .eq('id', voucher.id);

      if (error) {
        throw error;
      }

      // Update local state
      setVouchers(vouchers.map(v => 
        v.id === voucher.id 
          ? { ...v, is_active: !v.is_active } 
          : v
      ));

    } catch (error) {
      console.error('Error toggling voucher status:', error);
      alert('Failed to update voucher status');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: isChecked }));
    } else if (name === 'discount_value' || name === 'min_order_value' || name === 'max_uses') {
      // Handle number inputs
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      // Handle other inputs
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openAddModal = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_value: 0,
      max_uses: 100,
      valid_from: new Date().toISOString(),
      valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      is_active: true
    });
    setShowAddModal(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    setFormData({
      ...voucher,
      valid_from: voucher.valid_from,
      valid_until: voucher.valid_until
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    setShowDeleteModal(true);
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  // Helper to format ISO date for date inputs
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const isVoucherExpired = (voucher: Voucher) => {
    const now = new Date();
    const validUntil = new Date(voucher.valid_until);
    return validUntil < now;
  };

  const isVoucherActive = (voucher: Voucher) => {
    return voucher.is_active && !isVoucherExpired(voucher);
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = searchTerm === '' || 
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'active') {
      return matchesSearch && isVoucherActive(voucher);
    } else if (statusFilter === 'inactive') {
      return matchesSearch && (!voucher.is_active || isVoucherExpired(voucher));
    }
    
    return matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Voucher Management</h1>
          <p className="text-gray-600">Create and manage discount vouchers</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
          aria-label="Add new voucher"
        >
          <Plus size={18} />
          Add New Voucher
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search vouchers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Search vouchers"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive/Expired</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin text-teal-500" size={36} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Code</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 font-semibold">Discount</th>
                  <th className="text-left py-3 px-4 font-semibold">Min Order</th>
                  <th className="text-left py-3 px-4 font-semibold">Validity</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Usage</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No vouchers found
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-1">
                          <Tag size={16} className="text-teal-500" />
                          {voucher.code}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{voucher.description}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {voucher.discount_type === 'percentage' ? (
                            <Percent size={16} className="text-blue-500" />
                          ) : (
                            <DollarSign size={16} className="text-green-500" />
                          )}
                          {voucher.discount_value}{voucher.discount_type === 'percentage' ? '%' : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        ${voucher.min_order_value}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">From: {formatDate(voucher.valid_from)}</span>
                          <span className="text-xs text-gray-500">To: {formatDate(voucher.valid_until)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isVoucherActive(voucher)
                              ? 'bg-green-100 text-green-700'
                              : isVoucherExpired(voucher)
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {isVoucherActive(voucher)
                            ? 'Active'
                            : isVoucherExpired(voucher)
                            ? 'Expired'
                            : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm">
                          {voucher.used_count} / {voucher.max_uses === 0 ? '∞' : voucher.max_uses}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleToggleActive(voucher)}
                            className={`p-1 rounded ${voucher.is_active ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
                            aria-label={voucher.is_active ? "Deactivate voucher" : "Activate voucher"}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => openEditModal(voucher)}
                            className="p-1 text-blue-500 hover:text-blue-600"
                            aria-label="Edit voucher"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(voucher)}
                            className="p-1 text-red-500 hover:text-red-600"
                            aria-label="Delete voucher"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Voucher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Voucher</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Voucher Code*
                </label>
                <div className="flex">
                  <input
                    id="code"
                    type="text"
                    name="code"
                    value={formData.code || ''}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200"
                    aria-label="Generate random code"
                  >
                    Random
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type*
                </label>
                <select
                  id="discount_type"
                  name="discount_type"
                  value={formData.discount_type || 'percentage'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Describe the purpose of this voucher"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}*
                </label>
                <input
                  id="discount_value"
                  type="number"
                  name="discount_value"
                  value={formData.discount_value || 0}
                  onChange={handleInputChange}
                  min="0"
                  step={formData.discount_type === 'percentage' ? "1" : "0.01"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="min_order_value" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Order Value ($)
                </label>
                <input
                  id="min_order_value"
                  type="number"
                  name="min_order_value"
                  value={formData.min_order_value || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uses (0 = unlimited)
                </label>
                <input
                  id="max_uses"
                  type="number"
                  name="max_uses"
                  value={formData.max_uses || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From*
                </label>
                <input
                  id="valid_from"
                  type="date"
                  name="valid_from"
                  value={formatDateForInput(formData.valid_from || new Date().toISOString())}
                  onChange={(e) => setFormData({...formData, valid_from: new Date(e.target.value).toISOString()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until*
                </label>
                <input
                  id="valid_until"
                  type="date"
                  name="valid_until"
                  value={formatDateForInput(formData.valid_until || '')}
                  onChange={(e) => setFormData({...formData, valid_until: new Date(e.target.value).toISOString()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active (immediately available for use)
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddVoucher}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center gap-2"
              >
                <Save size={18} />
                Save Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Voucher Modal */}
      {showEditModal && currentVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Voucher</h2>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="edit_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Voucher Code*
                </label>
                <input
                  id="edit_code"
                  type="text"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit_discount_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type*
                </label>
                <select
                  id="edit_discount_type"
                  name="discount_type"
                  value={formData.discount_type || 'percentage'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="edit_description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Describe the purpose of this voucher"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="edit_discount_value" className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}*
                </label>
                <input
                  id="edit_discount_value"
                  type="number"
                  name="discount_value"
                  value={formData.discount_value || 0}
                  onChange={handleInputChange}
                  min="0"
                  step={formData.discount_type === 'percentage' ? "1" : "0.01"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit_min_order_value" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Order Value ($)
                </label>
                <input
                  id="edit_min_order_value"
                  type="number"
                  name="min_order_value"
                  value={formData.min_order_value || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="edit_max_uses" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uses (0 = unlimited)
                </label>
                <input
                  id="edit_max_uses"
                  type="number"
                  name="max_uses"
                  value={formData.max_uses || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="edit_valid_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From*
                </label>
                <input
                  id="edit_valid_from"
                  type="date"
                  name="valid_from"
                  value={formatDateForInput(formData.valid_from || '')}
                  onChange={(e) => setFormData({...formData, valid_from: new Date(e.target.value).toISOString()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit_valid_until" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until*
                </label>
                <input
                  id="edit_valid_until"
                  type="date"
                  name="valid_until"
                  value={formatDateForInput(formData.valid_until || '')}
                  onChange={(e) => setFormData({...formData, valid_until: new Date(e.target.value).toISOString()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="edit_is_active"
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  Used: {currentVoucher.used_count} times
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditVoucher}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center gap-2"
              >
                <Save size={18} />
                Update Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
            </div>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete the voucher code "{currentVoucher.code}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVoucher}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}