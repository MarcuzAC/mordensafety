import React, { useState, useEffect } from 'react';
import { productsAPI, getFullImageUrl } from '../services/api';
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

  // Enhanced Modern styles matching Cart
  const containerStyle = {
    padding: '40px 24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    minHeight: '100vh',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '50px',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  };

  const titleStyle = {
    fontSize: '3.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
    letterSpacing: '-0.025em',
  };

  const subtitleStyle = {
    fontSize: '1.25rem',
    color: '#64748b',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: '1.8',
  };

  const filterCardStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    padding: '30px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
    marginBottom: '50px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  };

  const inputContainerStyle = {
    position: 'relative',
    flex: '1',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '20px 20px 20px 56px',
    borderRadius: '15px',
    border: '2px solid #e2e8f0',
    fontSize: '17px',
    fontFamily: 'inherit',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  };

  const searchInputFocusStyle = {
    borderColor: '#3b82f6',
    background: 'white',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)',
    transform: 'translateY(-2px)',
  };

  const selectStyle = {
    padding: '20px 24px',
    borderRadius: '15px',
    border: '2px solid #e2e8f0',
    fontSize: '17px',
    fontFamily: 'inherit',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    minWidth: '250px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '500',
  };

  const selectFocusStyle = {
    borderColor: '#3b82f6',
    background: 'white',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)',
    transform: 'translateY(-2px)',
  };

  const productGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '32px',
    marginBottom: '50px',
  };

  const productCardStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    overflow: 'hidden',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  };

  const productCardHoverStyle = {
    transform: 'translateY(-12px)',
    boxShadow: '0 25px 60px rgba(59, 130, 246, 0.15)',
    borderColor: '#dbeafe',
  };

  // Enhanced Image Container with better visibility
  const imageContainerStyle = {
    width: '100%',
    height: '280px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    borderRadius: '25px 25px 0 0',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const imageHoverStyle = {
    transform: 'scale(1.1)',
    filter: 'brightness(1.1) saturate(1.1)',
  };

  const productContentStyle = {
    padding: '30px',
  };

  const productNameStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '12px',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const productDescStyle = {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '20px',
    lineHeight: '1.6',
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const priceStockContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px dashed #e2e8f0',
  };

  const priceStyle = {
    fontSize: '2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const stockBadgeStyle = (stock) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '700',
    background: stock > 10 
      ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
      : stock > 0 
      ? 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)'
      : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: stock > 10 ? '#166534' : stock > 0 ? '#9a3412' : '#dc2626',
    border: stock > 10 ? '2px solid #86efac' : stock > 0 ? '2px solid #fdba74' : '2px solid #fca5a5',
  });

  const quantityContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '20px',
  };

  const quantityControlStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    padding: '15px',
    borderRadius: '15px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.05)',
    border: '2px solid #e2e8f0',
  };

  const quantityButtonStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'white',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '20px',
    fontWeight: '700',
    color: '#475569',
  };

  const quantityButtonHoverStyle = {
    background: '#f8fafc',
    borderColor: '#cbd5e1',
    transform: 'scale(1.05)',
  };

  const quantityDisplayStyle = {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1e293b',
    width: '50px',
    textAlign: 'center',
  };

  const addToCartButtonStyle = (disabled = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 32px',
    borderRadius: '15px',
    background: disabled 
      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    border: 'none',
    fontSize: '18px',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.7 : 1,
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
  });

  const addToCartButtonHoverStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '500px',
    flexDirection: 'column',
    gap: '25px',
  };

  const spinnerStyle = {
    width: '80px',
    height: '80px',
    border: '5px solid #e2e8f0',
    borderTop: '5px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1.5s linear infinite',
  };

  const errorContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '500px',
    textAlign: 'center',
    padding: '60px 30px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
  };

  const errorIconStyle = {
    width: '100px',
    height: '100px',
    color: '#ef4444',
    marginBottom: '30px',
  };

  const errorTextStyle = {
    fontSize: '1.25rem',
    color: '#64748b',
    marginBottom: '30px',
    maxWidth: '600px',
    lineHeight: '1.6',
  };

  const retryButtonStyle = {
    padding: '18px 36px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    border: 'none',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
  };

  const retryButtonHoverStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '100px 30px',
    gridColumn: '1 / -1',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
  };

  const emptyIconContainer = {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 40px',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
  };

  const emptyTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
    letterSpacing: '-0.025em',
  };

  const emptyTextStyle = {
    fontSize: '1.25rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto 40px',
    lineHeight: '1.8',
  };

  const filterContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  // COMBINED SEARCH AND FILTER ROW - Enhanced
  const filterRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '25px',
    flexWrap: 'wrap',
  };

  const leftFilterSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  };

  const searchSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  };

  // Pagination styles - Enhanced
  const paginationContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '50px',
  };

  const pageButtonStyle = (active = false) => ({
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    border: active ? '2px solid #3b82f6' : '2px solid #e2e8f0',
    background: active 
      ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    color: active ? 'white' : '#475569',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
  });

  const pageButtonHoverStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderColor: '#cbd5e1',
    transform: 'translateY(-2px)',
  };

  const arrowButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
  };

  const arrowButtonHoverStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderColor: '#cbd5e1',
    transform: 'translateY(-2px)',
  };

  const resultsInfoStyle = {
    textAlign: 'center',
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '15px',
    fontWeight: '500',
  };

  // Enhanced Image Gallery Indicators
  const galleryIndicatorsStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    zIndex: 2,
  };

  const indicatorStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  };

  const activeIndicatorStyle = {
    backgroundColor: '#ffffff',
    width: '24px',
    borderRadius: '4px',
    transform: 'scale(1.2)',
  };

  const imageCountBadgeStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '15px',
    fontSize: '13px',
    fontWeight: '700',
    backdropFilter: 'blur(8px)',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  // View Image Button
  const viewImageButtonStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(30, 64, 175, 0.9) 100%)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '15px',
    fontSize: '13px',
    fontWeight: '700',
    backdropFilter: 'blur(4px)',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    opacity: '0',
  };

  const viewImageButtonHoverStyle = {
    opacity: '1',
    transform: 'translateY(-2px)',
  };

  // Enhanced Image Preview Modal Styles
  const previewOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(12px)',
  };

  const previewContainerStyle = {
    position: 'relative',
    maxWidth: '95vw',
    maxHeight: '95vh',
    width: 'auto',
    height: 'auto',
  };

  const previewImageStyle = {
    maxWidth: '100%',
    maxHeight: '90vh',
    objectFit: 'contain',
    borderRadius: '15px',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '-60px',
    right: '0',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    zIndex: 1001,
    backdropFilter: 'blur(8px)',
  };

  const closeButtonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'rotate(90deg) scale(1.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  };

  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(8px)',
    zIndex: 1001,
  };

  const navButtonHoverStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.2) 100%)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-50%) scale(1.15)',
  };

  const previewInfoStyle = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    textAlign: 'center',
    color: 'white',
    padding: '30px',
    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.9))',
    borderBottomLeftRadius: '15px',
    borderBottomRightRadius: '15px',
  };

  const previewTitleStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
  };

  const previewCounterStyle = {
    fontSize: '1rem',
    opacity: '0.9',
    marginBottom: '15px',
    fontWeight: '500',
  };

  const thumbnailStripStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    maxWidth: '100%',
    overflowX: 'auto',
    padding: '10px 0',
  };

  const thumbnailStyle = {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '3px solid transparent',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  };

  const activeThumbnailStyle = {
    borderColor: '#3b82f6',
    transform: 'scale(1.1)',
    boxShadow: '0 5px 15px rgba(59, 130, 246, 0.4)',
  };

  if (loading && currentPage === 1) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
          <p style={{ 
            color: '#64748b', 
            fontSize: '1.25rem',
            fontWeight: '500' 
          }}>Loading premium safety products...</p>
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
          <AlertCircle size={100} style={errorIconStyle} />
          <h3 style={{ ...emptyTitleStyle, marginBottom: '20px' }}>Error Loading Products</h3>
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
          <h1 style={titleStyle}>Premium Safety Products</h1>
          <p style={subtitleStyle}>
            Discover our certified range of fire safety equipment and accessories. 
            All products meet international safety standards and come with expert guidance.
          </p>
        </div>

        {/* COMBINED FILTER AND SEARCH */}
        <div style={filterCardStyle}>
          <div style={filterContainerStyle}>
            <div style={filterRowStyle}>
              {/* Left side: Filter dropdown */}
              <div style={leftFilterSectionStyle}>
                <Filter size={24} color="#3b82f6" />
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
              
              {/* Right side: Search bar */}
              <div style={searchSectionStyle}>
                <div style={inputContainerStyle}>
                  <Search 
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                    }} 
                    size={24} 
                  />
                  <input
                    type="text"
                    placeholder="Search safety products by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInputStyle}
                    onFocus={(e) => Object.assign(e.target.style, searchInputFocusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, searchInputStyle)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {filteredProducts.length > 0 && (
          <div style={resultsInfoStyle}>
            Showing {filteredProducts.length} of {totalProducts} premium safety products
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
                
                <div style={productContentStyle}>
                  <div style={{ marginBottom: '20px' }}>
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
                      marginBottom: '20px',
                      padding: '15px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      borderRadius: '15px',
                      border: '2px solid #e2e8f0',
                    }}>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#3b82f6',
                        marginBottom: '8px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <Shield size={14} />
                        Specifications:
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#475569',
                        lineHeight: '1.5',
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
                        <Minus size={20} />
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
                        <Plus size={20} />
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
                      <ShoppingCart size={22} />
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
            <div style={emptyIconContainer}>
              <Shield size={56} color="#3b82f6" />
            </div>
            <h3 style={emptyTitleStyle}>
              No products found
            </h3>
            <p style={emptyTextStyle}>
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No premium safety products available at the moment. Please check back soon!'}
            </p>
          </div>
        )}

        {/* Enhanced Pagination */}
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

      {/* Enhanced Image Preview Modal */}
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
              aria-label="Close preview"
            >
              <X size={28} />
            </button>

            {/* Navigation Buttons */}
            {previewImage.images.length > 1 && (
              <>
                <button
                  style={{ ...navButtonStyle, left: '30px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, navButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...navButtonStyle, left: '30px' })}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
                
                <button
                  style={{ ...navButtonStyle, right: '30px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, navButtonHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...navButtonStyle, right: '30px' })}
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
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
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== previewImage.currentIndex) {
                          e.target.style.borderColor = 'transparent';
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }
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
        </div>
      )}
    </>
  );
};

export default Products;