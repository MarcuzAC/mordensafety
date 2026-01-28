import React, { useState, useEffect } from 'react';
import { productsAPI, getFullImageUrl } from '../services/api';
import { useApp } from '../context/AppContext';
import { Search, Filter, Plus, Minus, ShoppingCart, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const Products = () => {
  const { addToCart } = useApp();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    // Filter products locally for search and category
    const filtered = products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getProducts({
        available_only: true,
        page: currentPage,
        limit: 12 // Show 12 products per page
      });
      
      const { products: fetchedProducts, total, pages } = response.data;
      setProducts(fetchedProducts);
      setTotalProducts(total);
      setTotalPages(pages);
      
      // Initialize quantities
      const initialQuantities = {};
      fetchedProducts.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    
    // Check stock availability
    if (quantity > product.stock_quantity) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: `Only ${product.stock_quantity} items available in stock`,
          type: 'error'
        }
      });
      window.dispatchEvent(event);
      return;
    }
    
    // Add to cart with normalized product data
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images || [],
      stock_quantity: product.stock_quantity,
      category: product.category
    };
    
    addToCart(cartProduct, quantity);
    
    // Show success feedback
    const event = new CustomEvent('showToast', {
      detail: {
        message: `${quantity} ${product.name} added to cart`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  const openImagePreview = (product, imageIndex = 0) => {
    const images = product.images || [];
    if (images.length > 0) {
      setPreviewImage({
        product,
        currentIndex: imageIndex,
        images: images
      });
    }
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const navigateImage = (direction) => {
    if (!previewImage || previewImage.images.length <= 1) return;
    
    const newIndex = direction === 'next' 
      ? (previewImage.currentIndex + 1) % previewImage.images.length
      : (previewImage.currentIndex - 1 + previewImage.images.length) % previewImage.images.length;
    
    setPreviewImage({
      ...previewImage,
      currentIndex: newIndex
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fire_extinguishers', label: 'Fire Extinguishers' },
    { value: 'safety_equipment', label: 'Safety Equipment' },
    { value: 'maintenance_kits', label: 'Maintenance Kits' },
    { value: 'other', label: 'Other' },
  ];

  // Modern styles
  const containerStyle = {
    padding: '32px 24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
    letterSpacing: '-0.025em',
  };

  const subtitleStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const filterCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    marginBottom: '40px',
    border: '1px solid #f1f5f9',
  };

  const inputContainerStyle = {
    position: 'relative',
    flex: '1',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '16px 16px 16px 48px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#f9fafb',
  };

  const searchInputFocusStyle = {
    borderColor: '#3b82f6',
    backgroundColor: 'white',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  const selectStyle = {
    padding: '16px 20px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    minWidth: '200px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const selectFocusStyle = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  const productGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  };

  const productCardStyle = {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.3s ease',
    position: 'relative',
  };

  const productCardHoverStyle = {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    borderColor: '#dbeafe',
  };

  const imageContainerStyle = {
    width: '100%',
    height: '240px',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  };

  const imageHoverStyle = {
    transform: 'scale(1.05)',
  };

  const productContentStyle = {
    padding: '24px',
  };

  const productNameStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const productDescStyle = {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const priceStockContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  };

  const priceStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e40af',
  };

  const stockBadgeStyle = (stock) => ({
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: stock > 10 ? '#dcfce7' : stock > 0 ? '#ffedd5' : '#fee2e2',
    color: stock > 10 ? '#166534' : stock > 0 ? '#9a3412' : '#dc2626',
  });

  const quantityContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const quantityControlStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const quantityButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const quantityButtonHoverStyle = {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  };

  const quantityDisplayStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    width: '40px',
    textAlign: 'center',
  };

  const addToCartButtonStyle = (disabled = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '12px',
    backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: disabled ? 0.7 : 1,
  });

  const addToCartButtonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    flexDirection: 'column',
    gap: '20px',
  };

  const spinnerStyle = {
    width: '60px',
    height: '60px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const errorContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center',
    padding: '40px',
  };

  const errorIconStyle = {
    width: '80px',
    height: '80px',
    color: '#ef4444',
    marginBottom: '20px',
  };

  const errorTextStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '20px',
  };

  const retryButtonStyle = {
    padding: '12px 24px',
    borderRadius: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const retryButtonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    gridColumn: '1 / -1',
  };

  const emptyIconStyle = {
    fontSize: '4rem',
    color: '#d1d5db',
    marginBottom: '24px',
  };

  const emptyTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
  };

  const emptyTextStyle = {
    fontSize: '1rem',
    color: '#6b7280',
  };

  const filterContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const filterRowStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  // Pagination styles
  const paginationContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '40px',
  };

  const pageButtonStyle = (active = false) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: active ? '2px solid #3b82f6' : '2px solid #e5e7eb',
    backgroundColor: active ? '#3b82f6' : 'white',
    color: active ? 'white' : '#4b5563',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const pageButtonHoverStyle = {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  };

  const arrowButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const arrowButtonHoverStyle = {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  };

  const resultsInfoStyle = {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '20px',
  };

  // Image Gallery Indicators
  const galleryIndicatorsStyle = {
    position: 'absolute',
    bottom: '12px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    zIndex: 2,
  };

  const indicatorStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const activeIndicatorStyle = {
    backgroundColor: 'white',
    width: '20px',
    borderRadius: '3px',
  };

  const imageCountBadgeStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    backdropFilter: 'blur(4px)',
    zIndex: 2,
  };

  // Image Preview Modal Styles
  const previewOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
  };

  const previewContainerStyle = {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: 'auto',
    height: 'auto',
  };

  const previewImageStyle = {
    maxWidth: '100%',
    maxHeight: '85vh',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '-50px',
    right: '0',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    zIndex: 1001,
  };

  const closeButtonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  };

  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'white',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(4px)',
    zIndex: 1001,
  };

  const navButtonHoverStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-50%) scale(1.1)',
  };

  const previewInfoStyle = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    textAlign: 'center',
    color: 'white',
    padding: '20px',
    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
  };

  const previewTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '4px',
  };

  const previewCounterStyle = {
    fontSize: '0.875rem',
    opacity: '0.8',
    marginBottom: '10px',
  };

  const thumbnailStripStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    maxWidth: '100%',
    overflowX: 'auto',
    padding: '5px 0',
  };

  const thumbnailStyle = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  const activeThumbnailStyle = {
    borderColor: '#3b82f6',
    transform: 'scale(1.05)',
  };

  if (loading && currentPage === 1) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Loading products...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorContainerStyle}>
          <AlertCircle size={80} style={errorIconStyle} />
          <h3 style={emptyTitleStyle}>Error Loading Products</h3>
          <p style={errorTextStyle}>{error}</p>
          <button
            onClick={fetchProducts}
            style={retryButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, retryButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, retryButtonStyle)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Our Products</h1>
          <p style={subtitleStyle}>
            Discover our range of premium fire safety equipment and accessories
          </p>
        </div>

        {/* Filters */}
        <div style={filterCardStyle}>
          <div style={filterContainerStyle}>
            <div style={filterRowStyle}>
              <div style={inputContainerStyle}>
                <Search 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                  }} 
                  size={20} 
                />
                <input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={searchInputStyle}
                  onFocus={(e) => Object.assign(e.target.style, searchInputFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, searchInputStyle)}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Filter size={20} color="#6b7280" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={selectStyle}
                  onFocus={(e) => Object.assign(e.target.style, selectFocusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, selectStyle)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {filteredProducts.length > 0 && (
          <div style={resultsInfoStyle}>
            Showing {filteredProducts.length} of {totalProducts} products
            {searchTerm && ` matching "${searchTerm}"`}
            {categoryFilter !== 'all' && ` in ${categories.find(c => c.value === categoryFilter)?.label}`}
          </div>
        )}

        {/* Products Grid */}
        <div style={productGridStyle}>
          {filteredProducts.map((product) => {
            const images = product.images || [];
            const mainImage = images.length > 0 ? getFullImageUrl(images[0]) : null;
            const isOutOfStock = product.stock_quantity <= 0;
            const currentQuantity = quantities[product.id] || 1;
            const canAddToCart = !isOutOfStock && currentQuantity <= product.stock_quantity;
            
            return (
              <div 
                key={product.id} 
                style={{
                  ...productCardStyle,
                  opacity: isOutOfStock ? 0.7 : 1
                }}
                onMouseEnter={(e) => !isOutOfStock && Object.assign(e.currentTarget.style, productCardHoverStyle)}
                onMouseLeave={(e) => !isOutOfStock && Object.assign(e.currentTarget.style, productCardStyle)}
              >
                {isOutOfStock && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    zIndex: 3,
                  }}>
                    Out of Stock
                  </div>
                )}
                
                <div 
                  style={{
                    ...imageContainerStyle,
                    cursor: images.length > 0 ? 'pointer' : 'default'
                  }}
                  onClick={() => images.length > 0 && openImagePreview(product, 0)}
                >
                  {mainImage ? (
                    <>
                      <img
                        src={mainImage}
                        alt={product.name}
                        style={{
                          ...imageStyle,
                          filter: isOutOfStock ? 'grayscale(0.5)' : 'none'
                        }}
                        onMouseEnter={(e) => !isOutOfStock && Object.assign(e.target.style, imageHoverStyle)}
                        onMouseLeave={(e) => !isOutOfStock && Object.assign(e.target.style, imageStyle)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x240?text=No+Image';
                        }}
                      />
                      
                      {/* Image Gallery Indicators */}
                      {images.length > 1 && (
                        <div style={galleryIndicatorsStyle}>
                          {images.slice(0, 5).map((_, index) => (
                            <div
                              key={index}
                              style={{
                                ...indicatorStyle,
                                ...(index === 0 ? activeIndicatorStyle : {})
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openImagePreview(product, index);
                              }}
                            />
                          ))}
                          {images.length > 5 && (
                            <div style={{
                              ...indicatorStyle,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              width: 'auto',
                              padding: '0 6px',
                              fontSize: '10px',
                              borderRadius: '3px',
                            }}>
                              +{images.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Image Count Badge */}
                      {images.length > 0 && (
                        <div style={imageCountBadgeStyle}>
                          {images.length} image{images.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#9ca3af',
                      fontSize: '14px',
                    }}>
                      No image available
                    </div>
                  )}
                </div>
                
                <div style={productContentStyle}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={productNameStyle}>
                      {product.name}
                    </h3>
                    <p style={productDescStyle}>
                      {product.description}
                    </p>
                  </div>

                  <div style={priceStockContainerStyle}>
                    <span style={priceStyle}>
                      MK {product.price?.toLocaleString() || '0'}
                    </span>
                    <span style={stockBadgeStyle(product.stock_quantity)}>
                      {product.stock_quantity || 0} in stock
                    </span>
                  </div>

                  {/* Specifications (if available) */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div style={{
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                    }}>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '4px',
                        fontWeight: '600',
                      }}>
                        Specifications:
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#4b5563',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {Object.entries(product.specifications)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div style={quantityContainerStyle}>
                    <div style={quantityControlStyle}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, -1);
                        }}
                        disabled={isOutOfStock}
                        style={{
                          ...quantityButtonStyle,
                          opacity: isOutOfStock ? 0.5 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => !isOutOfStock && Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                        onMouseLeave={(e) => !isOutOfStock && Object.assign(e.currentTarget.style, quantityButtonStyle)}
                      >
                        <Minus size={16} color="#4b5563" />
                      </button>
                      <span style={quantityDisplayStyle}>
                        {currentQuantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock && currentQuantity < product.stock_quantity) {
                            updateQuantity(product.id, 1);
                          }
                        }}
                        disabled={isOutOfStock || currentQuantity >= product.stock_quantity}
                        style={{
                          ...quantityButtonStyle,
                          opacity: (isOutOfStock || currentQuantity >= product.stock_quantity) ? 0.5 : 1,
                          cursor: (isOutOfStock || currentQuantity >= product.stock_quantity) ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => !isOutOfStock && currentQuantity < product.stock_quantity && Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                        onMouseLeave={(e) => !isOutOfStock && currentQuantity < product.stock_quantity && Object.assign(e.currentTarget.style, quantityButtonStyle)}
                      >
                        <Plus size={16} color="#4b5563" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAddToCart) {
                          handleAddToCart(product);
                        }
                      }}
                      disabled={!canAddToCart}
                      style={addToCartButtonStyle(!canAddToCart)}
                      onMouseEnter={(e) => canAddToCart && Object.assign(e.currentTarget.style, addToCartButtonHoverStyle)}
                      onMouseLeave={(e) => canAddToCart && Object.assign(e.currentTarget.style, addToCartButtonStyle(!canAddToCart))}
                    >
                      <ShoppingCart size={18} />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>🔍</div>
            <h3 style={emptyTitleStyle}>
              No products found
            </h3>
            <p style={emptyTextStyle}>
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No products available at the moment'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={paginationContainerStyle}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...arrowButtonStyle,
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => currentPage > 1 && Object.assign(e.currentTarget.style, arrowButtonHoverStyle)}
              onMouseLeave={(e) => currentPage > 1 && Object.assign(e.currentTarget.style, arrowButtonStyle)}
            >
              ←
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={pageButtonStyle(currentPage === pageNum)}
                  onMouseEnter={(e) => currentPage !== pageNum && Object.assign(e.currentTarget.style, pageButtonHoverStyle)}
                  onMouseLeave={(e) => currentPage !== pageNum && Object.assign(e.currentTarget.style, pageButtonStyle(false))}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...arrowButtonStyle,
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => currentPage < totalPages && Object.assign(e.currentTarget.style, arrowButtonHoverStyle)}
              onMouseLeave={(e) => currentPage < totalPages && Object.assign(e.currentTarget.style, arrowButtonStyle)}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={previewOverlayStyle} onClick={closeImagePreview}>
          <div 
            style={previewContainerStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              style={closeButtonStyle}
              onClick={closeImagePreview}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, closeButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, closeButtonStyle)}
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {previewImage.images.length > 1 && (
              <>
                <button
                  style={{ ...navButtonStyle, left: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, navButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...navButtonStyle, left: '20px' })}
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button
                  style={{ ...navButtonStyle, right: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, navButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...navButtonStyle, right: '20px' })}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Main Image */}
            {previewImage.images[previewImage.currentIndex] ? (
              <img
                src={getFullImageUrl(previewImage.images[previewImage.currentIndex])}
                alt={`${previewImage.product.name} - Image ${previewImage.currentIndex + 1}`}
                style={previewImageStyle}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
              />
            ) : (
              <div style={{
                width: '800px',
                height: '600px',
                backgroundColor: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                borderRadius: '8px',
              }}>
                No image available
              </div>
            )}

            {/* Image Info */}
            <div style={previewInfoStyle}>
              <h4 style={previewTitleStyle}>
                {previewImage.product.name}
              </h4>
              <div style={previewCounterStyle}>
                Image {previewImage.currentIndex + 1} of {previewImage.images.length}
              </div>

              {/* Thumbnail Strip */}
              {previewImage.images.length > 1 && (
                <div style={thumbnailStripStyle}>
                  {previewImage.images.map((image, index) => (
                    <img
                      key={index}
                      src={getFullImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        ...thumbnailStyle,
                        ...(index === previewImage.currentIndex ? activeThumbnailStyle : {})
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage({
                          ...previewImage,
                          currentIndex: index
                        });
                      }}
                      onMouseEnter={(e) => {
                        if (index !== previewImage.currentIndex) {
                          e.target.style.borderColor = '#94a3b8';
                          e.target.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== previewImage.currentIndex) {
                          e.target.style.borderColor = 'transparent';
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/60x60?text=Error';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;