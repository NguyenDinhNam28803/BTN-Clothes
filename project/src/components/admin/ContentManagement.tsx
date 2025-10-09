import { useState } from 'react';
import { useToast } from '../Toast';
import { Upload, Trash2, Edit, Search, Plus, ArrowUpDown } from 'lucide-react';

export default function ContentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('products');
  const [isUploading, setIsUploading] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { showToast } = useToast();

  // Mock content data for demonstration
  const mockProducts = [
    { id: 1, name: 'Black T-Shirt', category: 'T-Shirts', status: 'active', created_at: '2025-09-15T14:30:00Z' },
    { id: 2, name: 'Denim Jacket', category: 'Outerwear', status: 'active', created_at: '2025-09-10T09:15:00Z' },
    { id: 3, name: 'Summer Shorts', category: 'Bottoms', status: 'active', created_at: '2025-09-05T11:45:00Z' },
    { id: 4, name: 'Winter Coat', category: 'Outerwear', status: 'draft', created_at: '2025-08-28T16:20:00Z' },
    { id: 5, name: 'Casual Sneakers', category: 'Footwear', status: 'active', created_at: '2025-08-20T08:30:00Z' }
  ];
  
  const mockCategories = [
    { id: 1, name: 'T-Shirts', product_count: 15, status: 'active', created_at: '2025-07-10T10:00:00Z' },
    { id: 2, name: 'Outerwear', product_count: 8, status: 'active', created_at: '2025-07-12T11:30:00Z' },
    { id: 3, name: 'Bottoms', product_count: 12, status: 'active', created_at: '2025-07-15T09:45:00Z' },
    { id: 4, name: 'Footwear', product_count: 6, status: 'active', created_at: '2025-07-20T14:15:00Z' },
    { id: 5, name: 'Accessories', product_count: 10, status: 'active', created_at: '2025-07-25T16:00:00Z' }
  ];
  
  const mockContent = {
    products: mockProducts,
    categories: mockCategories
  };
  
  // Filter content based on search query
  interface Product {
    id: number;
    name: string;
    category: string;
    status: string;
    created_at: string;
  }
  
  interface Category {
    id: number;
    name: string;
    product_count: number;
    status: string;
    created_at: string;
  }
  
  const filteredContent = mockContent[contentType as keyof typeof mockContent].filter((item: Product | Category) => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle content upload
  const handleUpload = () => {
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      showToast('Content uploaded successfully', 'success');
    }, 2000);
  };

  // Handle content deletion
  const handleDelete = (id: number) => {
    if (window.confirm(`Are you sure you want to delete item ${id}?`)) {
      console.log(`Deleting item with ID: ${id}`);
      showToast('Content deleted successfully', 'success');
    }
  };

  // Handle content edit
  const handleEdit = (id: number) => {
    console.log(`Editing item with ID: ${id}`);
    showToast('Edit feature is currently under development', 'info');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Content Management</h1>
        
        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800 text-white'
          }`}
          onClick={handleUpload}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Content'}</span>
        </button>
      </div>

      {/* Content Type Selector */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex border rounded-lg overflow-hidden">
          <button 
            className={`px-4 py-2 ${contentType === 'products' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setContentType('products')}
          >
            Products
          </button>
          <button 
            className={`px-4 py-2 ${contentType === 'categories' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setContentType('categories')}
          >
            Categories
          </button>
        </div>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={`Search ${contentType}...`}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          onClick={() => showToast('Create feature is currently under development', 'info')}
        >
          <Plus className="h-4 w-4" />
          <span>Create New</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {contentType === 'products' ? 'Category' : 'Products'}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    if (sortField === 'created_at') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('created_at');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContent.length > 0 ? (
                filteredContent.map((item: Product | Category) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {contentType === 'products' 
                          ? (item as Product).category 
                          : `${(item as Category).product_count} products`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      No {contentType} found matching your search.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredContent.length}</span> of{' '}
              <span className="font-medium">{filteredContent.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-4 py-2 text-sm border rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-not-allowed opacity-50"
                disabled
              >
                Previous
              </button>
              <button 
                className="px-4 py-2 text-sm border rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-not-allowed opacity-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}