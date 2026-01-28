import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api'; // Removed getFullImageUrl from import
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Minus, ShoppingCart, X, ChevronLeft, ChevronRight, AlertCircle, Shield, Star, Eye } from 'lucide-react';

const Products = () => {
  const { addToCart, user } = useApp();
  const navigate = useNavigate();
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
  const [hoveredImage, setHoveredImage] = useState(null);

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
    // Check if user is authenticated
    if (!user) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Please login to add items to cart',
          type: 'warning'
        }
      });
      window.dispatchEvent(event);
      
      // Navigate to login page
      navigate('/login');
      return;
    }

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

  // Helper function to get full image URL (same as Cart component)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `http://localhost:8000${imagePath}`;
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

  // ... (all the style definitions remain the same as your enhanced version)

  // Only updating the JSX part where images are displayed:

  return (
    <>
      <div style={containerStyle}>
        {/* Header and filter sections remain the same */}

        {/* Products Grid */}
        <div style={productGridStyle}>
          {filteredProducts.map((product) => {
            const images = product.images || [];
            // Use the same logic as Cart component
            const mainImage = images.length > 0 ? getImageUrl(images[0]) : null;
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
                onMouseEnter={(e) => {
                  !isOutOfStock && Object.assign(e.currentTarget.style, productCardHoverStyle);
                  setHoveredImage(product.id);
                }}
                onMouseLeave={(e) => {
                  !isOutOfStock && Object.assign(e.currentTarget.style, productCardStyle);
                  setHoveredImage(null);
                }}
              >
                {isOutOfStock && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '15px',
                    fontSize: '13px',
                    fontWeight: '700',
                    zIndex: 3,
                    boxShadow: '0 5px 15px rgba(220, 38, 38, 0.3)',
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
                          filter: isOutOfStock ? 'grayscale(0.7) brightness(0.8)' : 'none'
                        }}
                        onMouseEnter={(e) => !isOutOfStock && Object.assign(e.target.style, imageHoverStyle)}
                        onMouseLeave={(e) => !isOutOfStock && Object.assign(e.target.style, imageStyle)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=500&fit=crop';
                        }}
                      />
                      
                      {/* View Image Button (appears on hover) */}
                      {images.length > 0 && hoveredImage === product.id && (
                        <button
                          style={{
                            ...viewImageButtonStyle,
                            opacity: '1',
                          }}
                          onMouseEnter={(e) => Object.assign(e.currentTarget.style, viewImageButtonHoverStyle)}
                          onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...viewImageButtonStyle, opacity: '1' })}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      )}
                      
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
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.transform = 'scale(1.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = index === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
                                e.target.style.transform = index === 0 ? 'scale(1.2)' : 'scale(1)';
                              }}
                            />
                          ))}
                          {images.length > 5 && (
                            <div style={{
                              ...indicatorStyle,
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              width: 'auto',
                              padding: '4px 10px',
                              fontSize: '12px',
                              borderRadius: '15px',
                            }}>
                              +{images.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Image Count Badge */}
                      {images.length > 0 && (
                        <div style={imageCountBadgeStyle}>
                          <Star size={14} />
                          {images.length} image{images.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#94a3b8',
                      fontSize: '16px',
                      gap: '15px',
                    }}>
                      <Shield size={48} />
                      <span>No image available</span>
                    </div>
                  )}
                </div>
                
                {/* Rest of the product content remains the same */}
                <div style={productContentStyle}>
                  {/* Product name, description, price, etc. */}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of the component remains the same */}
      </div>

      {/* Image Preview Modal - Updated to use getImageUrl */}
      {previewImage && (
        <div style={previewOverlayStyle} onClick={closeImagePreview}>
          <div 
            style={previewContainerStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}

            {/* Main Image */}
            {previewImage.images[previewImage.currentIndex] ? (
              <img
                src={getImageUrl(previewImage.images[previewImage.currentIndex])}
                alt={`${previewImage.product.name} - Image ${previewImage.currentIndex + 1}`}
                style={previewImageStyle}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop';
                }}
              />
            ) : (
              <div style={{
                width: '800px',
                height: '600px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                borderRadius: '15px',
                flexDirection: 'column',
                gap: '20px',
              }}>
                <Shield size={64} color="#64748b" />
                No image available
              </div>
            )}

            {/* Thumbnail Strip */}
            {previewImage.images.length > 1 && (
              <div style={thumbnailStripStyle}>
                {previewImage.images.map((image, index) => (
                  <img
                    key={index}
                    src={getImageUrl(image)}
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/70x70?text=Error';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Products;