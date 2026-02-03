import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Plus, Minus, Trash2, ShoppingBag, ArrowRight, 
  ShoppingCart, Download, Receipt, Package, Truck, 
  Shield, CreditCard, AlertCircle, CheckCircle 
} from 'lucide-react';
import { 
  cartAPI, 
  ordersAPI, 
  showToast, 
  handleApiError, 
  getCurrentUser, 
  isAuthenticated 
} from '../services/api';

const Cart = () => {
  const { 
    cart: contextCart, 
    updateCartQuantity: contextUpdateCart, 
    removeFromCart: contextRemoveFromCart, 
    clearCart: contextClearCart, 
    cartTotal, 
    cartItemsCount, 
    user: contextUser,
    setCart: setContextCart
  } = useApp();
  
  const [cart, setCart] = useState([]);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Load cart from localStorage on component mount
  useEffect(() => {
    loadCart();
    
    // Load user info if authenticated
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setShippingAddress(currentUser.address || '');
        setPhoneNumber(currentUser.phone || '');
      }
    }
  }, []);

  // Sync cart with context
  useEffect(() => {
    if (contextCart) {
      setCart(contextCart);
    }
  }, [contextCart]);

  const loadCart = () => {
    try {
      const loadedCart = cartAPI.getCart();
      setCart(loadedCart);
      setContextCart(loadedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      showToast('Error loading cart', 'error');
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        handleRemoveItem(productId);
        return;
      }

      const product = cart.find(item => item.id === productId);
      if (!product) return;

      if (newQuantity > product.stock_quantity) {
        showToast(`Only ${product.stock_quantity} items available in stock`, 'warning');
        return;
      }

      const updatedCart = cartAPI.updateQuantity(productId, newQuantity);
      setCart(updatedCart);
      setContextCart(updatedCart);
      
      if (contextUpdateCart) {
        contextUpdateCart(productId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast(error.message || 'Error updating quantity', 'error');
    }
  };

  const handleRemoveItem = (productId) => {
    try {
      const updatedCart = cartAPI.removeFromCart(productId);
      setCart(updatedCart);
      setContextCart(updatedCart);
      
      if (contextRemoveFromCart) {
        contextRemoveFromCart(productId);
      }
      
      showToast('Item removed from cart', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Error removing item', 'error');
    }
  };

  const handleClearCart = () => {
    try {
      cartAPI.clearCart();
      setCart([]);
      setContextCart([]);
      
      if (contextClearCart) {
        contextClearCart();
      }
      
      showToast('Cart cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast('Error clearing cart', 'error');
    }
  };

  // Server-side invoice generation for completed orders
  const downloadOrderInvoice = async (orderId) => {
    try {
      setIsGeneratingInvoice(true);
      console.log('Requesting invoice for order:', orderId);
      
      const response = await ordersAPI.generateInvoice(orderId);
      console.log('Invoice response:', response);
      
      // Get the full URL
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const invoiceUrl = response.data.invoice_url 
        ? `${baseURL}${response.data.invoice_url}`
        : response.data.download_url;
      
      console.log('Opening invoice URL:', invoiceUrl);
      
      // Open in new tab
      window.open(invoiceUrl, '_blank');
      
      showToast('Invoice downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast('Failed to download invoice. Please try again.', 'error');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Main checkout function - creates order and gets invoice from server
  const handleCheckout = async () => {
    // Validate form
    if (showCheckoutForm) {
      if (!shippingAddress.trim()) {
        showToast('Please enter shipping address', 'error');
        return;
      }
      if (!phoneNumber.trim()) {
        showToast('Please enter phone number', 'error');
        return;
      }
    }

    setIsProcessingCheckout(true);

    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        total_amount: cartTotal,
        shipping_address: shippingAddress,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
        notes: ''
      };

      console.log('Submitting order to backend:', orderData);

      // Step 1: Create order via API
      const checkoutResponse = await ordersAPI.checkout(orderData);
      const order = checkoutResponse.data;
      
      console.log('Order created successfully:', order);

      // Step 2: Try to get invoice from server
      try {
        if (order.order_id || order.id) {
          const orderId = order.order_id || order.id;
          console.log('Order ID for invoice:', orderId);
          
          // Wait a moment for order to be fully processed
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get invoice from server
          await downloadOrderInvoice(orderId);
        } else {
          throw new Error('No order ID received');
        }
      } catch (invoiceError) {
        console.warn('Server invoice not available:', invoiceError);
        showToast('Order placed! Invoice will be available in your orders.', 'success');
      }

      // Step 3: Clear cart
      handleClearCart();

      // Step 4: Navigate to home with success message
      setTimeout(() => {
        navigate('/', { 
          state: { 
            orderSuccess: true,
            orderId: order.order_id || order.id 
          } 
        });
      }, 1500);

    } catch (error) {
      console.error('Checkout error:', error);
      const userError = handleApiError(error);
      showToast(userError.message, 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Download draft invoice (before checkout)
  const handleDownloadInvoice = () => {
    console.log('Download invoice clicked');
    
    if (!isAuthenticated()) {
      showToast('Please login to download invoice', 'warning');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    if (!shippingAddress.trim() || !phoneNumber.trim()) {
      showToast('Please complete your shipping information first', 'info');
      setShowCheckoutForm(true);
      return;
    }
    
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    
    showToast('Invoice will be available after order placement', 'info');
    setShowCheckoutForm(true);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated()) {
      showToast('Please login to proceed with checkout', 'warning');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setShowCheckoutForm(true);
  };

  // Responsive container style
  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isMobile ? '20px 16px' : isTablet ? '30px 20px' : '40px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    minHeight: '100vh',
  };

  const emptyStateContainer = {
    textAlign: 'center',
    padding: isMobile ? '60px 20px' : isTablet ? '80px 30px' : '100px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
  };

  const emptyIconContainer = {
    width: isMobile ? '120px' : isTablet ? '140px' : '160px',
    height: isMobile ? '120px' : isTablet ? '140px' : '160px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 30px',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
    animation: 'float 3s ease-in-out infinite',
  };

  const emptyTitleStyle = {
    fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
    letterSpacing: '-0.025em',
    padding: isMobile ? '0 10px' : '0',
  };

  const emptyTextStyle = {
    fontSize: isMobile ? '1rem' : isTablet ? '1.125rem' : '1.25rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto 30px',
    lineHeight: '1.8',
    padding: isMobile ? '0 10px' : '0',
  };

  const browseButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
    padding: isMobile ? '14px 28px' : isTablet ? '16px 32px' : '18px 40px',
    borderRadius: isMobile ? '12px' : '15px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '700',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  };

  const browseButtonHoverStyle = {
    transform: 'translateY(-3px)',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
    background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
  };

  const headerContainerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? '30px' : '50px',
    padding: isMobile ? '20px' : isTablet ? '25px' : '30px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: isMobile ? '20px' : '25px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    gap: isMobile ? '20px' : '0',
  };

  const cartTitleStyle = {
    fontSize: isMobile ? '2rem' : isTablet ? '2.8rem' : '3.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.025em',
    margin: '0',
    position: 'relative',
  };

  const cartSubtitleStyle = {
    fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.125rem',
    color: '#64748b',
    marginTop: isMobile ? '8px' : '12px',
    fontWeight: '500',
  };

  const clearCartButtonStyle = {
    padding: isMobile ? '12px 20px' : isTablet ? '13px 24px' : '14px 28px',
    borderRadius: isMobile ? '10px' : '12px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#dc2626',
    border: 'none',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '10px',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.1)',
    alignSelf: isMobile ? 'stretch' : 'auto',
    justifyContent: 'center',
  };

  const clearCartButtonHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)',
    background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
  };

  const cartGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr',
    gap: isMobile ? '25px' : '40px',
  };

  const cartItemCardStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: isMobile ? '20px' : '25px',
    padding: isMobile ? '20px' : isTablet ? '25px' : '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  };

  const cartItemCardHoverStyle = {
    transform: isMobile ? 'translateY(-4px)' : 'translateY(-8px)',
    boxShadow: '0 25px 50px rgba(59, 130, 246, 0.15)',
    borderColor: '#dbeafe',
  };

  const cartItemContentStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'center' : 'center',
    gap: isMobile ? '20px' : '30px',
    textAlign: isMobile ? 'center' : 'left',
  };

  const cartItemImageStyle = {
    width: isMobile ? '120px' : isTablet ? '130px' : '140px',
    height: isMobile ? '120px' : isTablet ? '130px' : '140px',
    objectFit: 'cover',
    borderRadius: isMobile ? '15px' : '20px',
    flexShrink: '0',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  };

  const cartItemInfoStyle = {
    flex: '1',
    minWidth: '0',
    width: isMobile ? '100%' : 'auto',
  };

  const cartItemNameStyle = {
    fontSize: isMobile ? '1.2rem' : isTablet ? '1.3rem' : '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: isMobile ? '8px' : '12px',
    lineHeight: '1.3',
  };

  const cartItemDescStyle = {
    fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '1rem',
    color: '#64748b',
    marginBottom: isMobile ? '12px' : '15px',
    lineHeight: '1.6',
  };

  const cartItemPriceStyle = {
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    marginBottom: isMobile ? '15px' : '0',
  };

  const cartItemControlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '15px' : '25px',
    justifyContent: isMobile ? 'center' : 'flex-start',
    width: isMobile ? '100%' : 'auto',
  };

  const quantityContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '10px' : '15px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    padding: isMobile ? '10px' : '12px',
    borderRadius: isMobile ? '12px' : '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    border: '2px solid #e2e8f0',
  };

  const quantityButtonStyle = {
    width: isMobile ? '40px' : '48px',
    height: isMobile ? '40px' : '48px',
    borderRadius: isMobile ? '10px' : '12px',
    background: 'white',
    border: '2px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '700',
    color: '#475569',
  };

  const quantityButtonHoverStyle = {
    background: '#f8fafc',
    borderColor: '#cbd5e1',
    transform: 'scale(1.05)',
  };

  const quantityDisplayStyle = {
    fontSize: isMobile ? '1.1rem' : '1.25rem',
    fontWeight: '800',
    color: '#1e293b',
    width: isMobile ? '40px' : '50px',
    textAlign: 'center',
  };

  const deleteButtonStyle = {
    width: isMobile ? '44px' : '50px',
    height: isMobile ? '44px' : '50px',
    borderRadius: isMobile ? '10px' : '12px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#dc2626',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.1)',
  };

  const deleteButtonHoverStyle = {
    transform: isMobile ? 'scale(1.05) rotate(5deg)' : 'scale(1.1) rotate(5deg)',
    boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)',
  };

  const subtotalContainerStyle = {
    marginTop: isMobile ? '20px' : '25px',
    paddingTop: isMobile ? '20px' : '25px',
    borderTop: '2px dashed #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const subtotalLabelStyle = {
    fontSize: isMobile ? '1rem' : '1.125rem',
    color: '#64748b',
    fontWeight: '600',
  };

  const subtotalValueStyle = {
    fontSize: isMobile ? '1.25rem' : '1.5rem',
    fontWeight: '800',
    color: '#1e40af',
  };

  const summaryCardStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: isMobile ? '20px' : '25px',
    padding: isMobile ? '25px' : isTablet ? '30px' : '40px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    position: isMobile ? 'static' : 'sticky',
    top: '120px',
  };

  const summaryTitleStyle = {
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.6rem' : '1.75rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: isMobile ? '25px' : '30px',
    paddingBottom: isMobile ? '15px' : '20px',
    borderBottom: '3px solid #dbeafe',
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '12px 0' : '16px 0',
    borderBottom: '1px dashed #e2e8f0',
  };

  const summaryLabelStyle = {
    fontSize: isMobile ? '1rem' : '1.125rem',
    color: '#64748b',
    fontWeight: '500',
  };

  const summaryValueStyle = {
    fontSize: isMobile ? '1rem' : '1.125rem',
    fontWeight: '700',
    color: '#334155',
  };

  const totalRowStyle = {
    ...summaryRowStyle,
    borderBottom: 'none',
    paddingTop: isMobile ? '20px' : '25px',
    marginTop: isMobile ? '12px' : '15px',
    borderTop: '2px solid #dbeafe',
  };

  const totalLabelStyle = {
    fontSize: isMobile ? '1.25rem' : isTablet ? '1.4rem' : '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
  };

  const totalValueStyle = {
    fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const actionButtonsContainer = {
    marginTop: isMobile ? '30px' : '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '15px' : '20px',
  };

  const primaryActionButton = {
    padding: isMobile ? '18px 24px' : isTablet ? '20px 28px' : '22px 32px',
    borderRadius: isMobile ? '12px' : '15px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '700',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '12px',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  };

  const primaryActionButtonHover = {
    transform: 'translateY(-3px)',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
    background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
  };

  const downloadButton = {
    padding: isMobile ? '18px 24px' : isTablet ? '20px 28px' : '22px 32px',
    borderRadius: isMobile ? '12px' : '15px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '700',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '12px',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  };

  const downloadButtonHover = {
    transform: 'translateY(-3px)',
    boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  };

  const secondaryActionButton = {
    padding: isMobile ? '18px 24px' : isTablet ? '20px 28px' : '22px 32px',
    borderRadius: isMobile ? '12px' : '15px',
    background: 'white',
    color: '#475569',
    textDecoration: 'none',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '12px',
  };

  const secondaryActionButtonHover = {
    background: '#f8fafc',
    borderColor: '#cbd5e1',
    transform: 'translateY(-2px)',
  };

  // Checkout Form Styles
  const checkoutFormStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: isMobile ? '20px' : '25px',
    padding: isMobile ? '20px' : '30px',
    marginBottom: isMobile ? '20px' : '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
    border: '2px solid rgba(59, 130, 246, 0.1)',
  };

  const formTitleStyle = {
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.4rem' : '1.5rem',
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: isMobile ? '20px' : '25px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '10px',
  };

  const formGroupStyle = {
    marginBottom: isMobile ? '15px' : '20px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: isMobile ? '0.85rem' : '0.9rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '8px',
  };

  const inputStyle = {
    width: '100%',
    padding: isMobile ? '12px 14px' : '14px 16px',
    borderRadius: isMobile ? '10px' : '12px',
    border: '2px solid #e2e8f0',
    fontSize: isMobile ? '0.9rem' : '1rem',
    color: '#1e293b',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
  };

  const inputFocusStyle = {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  const paymentMethodContainer = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: isMobile ? '10px' : '15px',
    marginTop: isMobile ? '12px' : '15px',
  };

  const paymentMethodButton = {
    padding: isMobile ? '12px' : '15px',
    borderRadius: isMobile ? '10px' : '12px',
    border: '2px solid #e2e8f0',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    fontWeight: '600',
    color: '#475569',
    fontSize: isMobile ? '0.9rem' : '1rem',
  };

  const paymentMethodButtonSelected = {
    borderColor: '#3b82f6',
    background: '#eff6ff',
    color: '#1e40af',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  // Safety Features Section
  const safetyFeaturesStyle = {
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    borderRadius: isMobile ? '20px' : '25px',
    padding: isMobile ? '20px' : '30px',
    marginTop: isMobile ? '30px' : '40px',
    border: '2px solid #dbeafe',
  };

  const safetyFeaturesTitleStyle = {
    fontSize: isMobile ? '1.3rem' : isTablet ? '1.4rem' : '1.5rem',
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: isMobile ? '15px' : '20px',
    textAlign: 'center',
  };

  const safetyFeaturesGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: isMobile ? '15px' : '20px',
    marginTop: isMobile ? '15px' : '20px',
  };

  const safetyFeatureCardStyle = {
    background: 'white',
    borderRadius: isMobile ? '12px' : '15px',
    padding: isMobile ? '15px' : '20px',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
  };

  // Mobile optimized styles
  const mobileOnlyStyle = {
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px 0',
  };

  const mobileBottomBarStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    padding: isMobile ? '15px' : '20px',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
    borderTop: '1px solid #e5e7eb',
    display: isMobile ? 'flex' : 'none',
    flexDirection: 'column',
    gap: isMobile ? '10px' : '15px',
    zIndex: 100,
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #e2e8f0', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateContainer}>
          <div style={emptyIconContainer}>
            <ShoppingBag size={isMobile ? 48 : isTablet ? 56 : 64} color="#3b82f6" />
          </div>
          <h2 style={emptyTitleStyle}>Your Safety Cart is Empty</h2>
          <p style={emptyTextStyle}>
            Add premium fire safety equipment to your cart and ensure the safety of your premises. 
            All our products meet international safety standards and come with expert guidance.
          </p>
          <Link 
            to="/products"
            style={browseButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, browseButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, browseButtonStyle)}
          >
            <ShoppingCart size={isMobile ? 20 : 24} />
            Browse Safety Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerContainerStyle}>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <h1 style={cartTitleStyle}>Your Safety Cart</h1>
          <p style={cartSubtitleStyle}>
            Review your safety equipment selection {cartItemsCount > 0 && `(${cartItemsCount} items)`}
          </p>
        </div>
        <button
          onClick={handleClearCart}
          style={clearCartButtonStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, clearCartButtonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, clearCartButtonStyle)}
        >
          <Trash2 size={isMobile ? 16 : 18} />
          Clear Cart
        </button>
      </div>

      {/* Main Content */}
      <div style={cartGridStyle}>
        {/* Checkout Form (if shown) */}
        {showCheckoutForm && (
          <div style={checkoutFormStyle}>
            <h3 style={formTitleStyle}>
              <CreditCard size={isMobile ? 20 : 24} />
              Checkout Information
            </h3>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Shipping Address *</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter complete shipping address"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Phone Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number for delivery"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Payment Method</label>
              <div style={paymentMethodContainer}>
                {['cash', 'mpesa', 'airtel_money', 'bank_transfer'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      ...paymentMethodButton,
                      ...(paymentMethod === method ? paymentMethodButtonSelected : {})
                    }}
                  >
                    {method === 'cash' && 'Cash on Delivery'}
                    {method === 'mpesa' && 'M-Pesa'}
                    {method === 'airtel_money' && 'Airtel Money'}
                    {method === 'bank_transfer' && 'Bank Transfer'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '15px' : '25px' }}>
          {cart.map((item) => (
            <div 
              key={item.id} 
              style={cartItemCardStyle}
              onMouseEnter={(e) => !isMobile && Object.assign(e.currentTarget.style, cartItemCardHoverStyle)}
              onMouseLeave={(e) => !isMobile && Object.assign(e.currentTarget.style, cartItemCardStyle)}
            >
              <div style={cartItemContentStyle}>
                {item.images && item.images[0] && (
                  <img
                    src={item.images[0].startsWith('http') 
                      ? item.images[0] 
                      : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${item.images[0]}`
                    }
                    alt={item.name}
                    style={cartItemImageStyle}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop';
                    }}
                  />
                )}
                
                <div style={cartItemInfoStyle}>
                  <h3 style={cartItemNameStyle}>
                    {item.name}
                    {item.stock_quantity < 10 && (
                      <span style={{
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: isMobile ? '3px 6px' : '4px 8px',
                        borderRadius: '6px',
                        marginLeft: '8px',
                        fontWeight: '600',
                        display: 'inline-block',
                        marginTop: isMobile ? '5px' : '0',
                      }}>
                        Only {item.stock_quantity} left
                      </span>
                    )}
                  </h3>
                  {item.description && (
                    <p style={cartItemDescStyle}>
                      {item.description.length > 120 ? item.description.substring(0, 117) + '...' : item.description}
                    </p>
                  )}
                  <div style={cartItemPriceStyle}>
                    MK {item.price.toLocaleString()}
                  </div>
                </div>

                <div style={cartItemControlsStyle}>
                  <div style={quantityContainerStyle}>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      style={quantityButtonStyle}
                      onMouseEnter={(e) => !isMobile && Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                      onMouseLeave={(e) => !isMobile && Object.assign(e.currentTarget.style, quantityButtonStyle)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={isMobile ? 16 : 20} />
                    </button>
                    <span style={quantityDisplayStyle}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      style={quantityButtonStyle}
                      onMouseEnter={(e) => !isMobile && Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                      onMouseLeave={(e) => !isMobile && Object.assign(e.currentTarget.style, quantityButtonStyle)}
                      disabled={item.quantity >= item.stock_quantity}
                    >
                      <Plus size={isMobile ? 16 : 20} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => !isMobile && Object.assign(e.currentTarget.style, deleteButtonHoverStyle)}
                    onMouseLeave={(e) => !isMobile && Object.assign(e.currentTarget.style, deleteButtonStyle)}
                    title="Remove item"
                  >
                    <Trash2 size={isMobile ? 18 : 22} />
                  </button>
                </div>
              </div>

              <div style={subtotalContainerStyle}>
                <span style={subtotalLabelStyle}>Item Subtotal:</span>
                <span style={subtotalValueStyle}>
                  MK {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div style={summaryCardStyle}>
            <h3 style={summaryTitleStyle}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Items ({cartItemsCount})</span>
                <span style={summaryValueStyle}>MK {cartTotal.toLocaleString()}</span>
              </div>
              
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Shipping</span>
                <span style={{ ...summaryValueStyle, color: '#059669' }}>FREE</span>
              </div>
              
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Tax</span>
                <span style={summaryValueStyle}>MK 0</span>
              </div>
              
              <div style={totalRowStyle}>
                <span style={totalLabelStyle}>Total Amount</span>
                <span style={totalValueStyle}>MK {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Mobile Quick Actions */}
            {!showCheckoutForm && isMobile && (
              <div style={mobileOnlyStyle}>
                <button
                  onClick={handleProceedToCheckout}
                  style={{
                    ...primaryActionButton,
                    width: '100%',
                  }}
                >
                  <CreditCard size={20} />
                  Checkout MK {cartTotal.toLocaleString()}
                </button>
              </div>
            )}

            {!showCheckoutForm ? (
              <div style={{ ...actionButtonsContainer, display: isMobile ? 'none' : 'flex' }}>
                {/* Download Invoice Button */}
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isGeneratingInvoice}
                  style={downloadButton}
                  onMouseEnter={(e) => !isGeneratingInvoice && !isMobile && Object.assign(e.currentTarget.style, downloadButtonHover)}
                  onMouseLeave={(e) => !isGeneratingInvoice && !isMobile && Object.assign(e.currentTarget.style, downloadButton)}
                >
                  {isGeneratingInvoice ? (
                    <>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Generating Invoice...
                    </>
                  ) : (
                    <>
                      <Download size={24} />
                      Download Invoice (After Checkout)
                    </>
                  )}
                </button>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  style={primaryActionButton}
                  onMouseEnter={(e) => !isMobile && Object.assign(e.currentTarget.style, primaryActionButtonHover)}
                  onMouseLeave={(e) => !isMobile && Object.assign(e.currentTarget.style, primaryActionButton)}
                >
                  <CreditCard size={24} />
                  Proceed to Checkout
                  <ArrowRight size={24} />
                </button>
                
                {/* Continue Shopping */}
                <Link
                  to="/products"
                  style={secondaryActionButton}
                  onMouseEnter={(e) => !isMobile && Object.assign(e.currentTarget.style, secondaryActionButtonHover)}
                  onMouseLeave={(e) => !isMobile && Object.assign(e.currentTarget.style, secondaryActionButton)}
                >
                  <ShoppingCart size={20} />
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div style={{ ...actionButtonsContainer, display: isMobile ? 'none' : 'flex' }}>
                {/* Confirm Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout}
                  style={downloadButton}
                  onMouseEnter={(e) => !isProcessingCheckout && !isMobile && Object.assign(e.currentTarget.style, downloadButtonHover)}
                  onMouseLeave={(e) => !isProcessingCheckout && !isMobile && Object.assign(e.currentTarget.style, downloadButton)}
                >
                  {isProcessingCheckout ? (
                    <>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} />
                      Confirm Order & Get Invoice
                    </>
                  )}
                </button>

                {/* Back to Cart Button */}
                <button
                  onClick={() => setShowCheckoutForm(false)}
                  style={secondaryActionButton}
                  onMouseEnter={(e) => !isMobile && Object.assign(e.currentTarget.style, secondaryActionButtonHover)}
                  onMouseLeave={(e) => !isMobile && Object.assign(e.currentTarget.style, secondaryActionButton)}
                >
                  <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                  Back to Cart
                </button>

                {/* Important Note */}
                <div style={{
                  background: '#fef3c7',
                  border: '2px solid #fbbf24',
                  borderRadius: '12px',
                  padding: isMobile ? '12px' : '15px',
                  marginTop: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertCircle size={isMobile ? 16 : 20} color="#92400e" />
                    <div>
                      <p style={{ 
                        fontSize: isMobile ? '0.85rem' : '0.9rem', 
                        color: '#92400e', 
                        fontWeight: '600',
                        margin: '0 0 5px 0'
                      }}>
                        Important:
                      </p>
                      <p style={{ 
                        fontSize: isMobile ? '0.8rem' : '0.85rem', 
                        color: '#92400e', 
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        • Invoice will be generated and downloaded after order confirmation<br/>
                        • You'll receive order updates via email/SMS<br/>
                        • Delivery within 3-5 business days<br/>
                        • View and download invoices from "My Orders" page
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety Features Section */}
          <div style={safetyFeaturesStyle}>
            <h4 style={safetyFeaturesTitleStyle}>Why Choose Morden Safety?</h4>
            <div style={safetyFeaturesGridStyle}>
              <div style={safetyFeatureCardStyle}>
                <Shield size={isMobile ? 28 : 32} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h5 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '8px', fontSize: isMobile ? '1rem' : '1.1rem' }}>Certified Equipment</h5>
                <p style={{ color: '#64748b', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>All products meet international safety standards</p>
              </div>
              <div style={safetyFeatureCardStyle}>
                <Truck size={isMobile ? 28 : 32} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h5 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '8px', fontSize: isMobile ? '1rem' : '1.1rem' }}>Quick Delivery</h5>
                <p style={{ color: '#64748b', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>Fast and reliable delivery across Malawi</p>
              </div>
              <div style={safetyFeatureCardStyle}>
                <Package size={isMobile ? 28 : 32} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h5 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '8px', fontSize: isMobile ? '1rem' : '1.1rem' }}>Warranty Included</h5>
                <p style={{ color: '#64748b', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>All equipment comes with manufacturer warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      {!showCheckoutForm && isMobile && (
        <div style={mobileBottomBarStyle}>
          <button
            onClick={handleProceedToCheckout}
            style={{
              ...primaryActionButton,
              width: '100%',
              margin: 0,
            }}
          >
            <CreditCard size={20} />
            Proceed to Checkout - MK {cartTotal.toLocaleString()}
          </button>
        </div>
      )}

      {showCheckoutForm && isMobile && (
        <div style={mobileBottomBarStyle}>
          <button
            onClick={handleCheckout}
            disabled={isProcessingCheckout}
            style={{
              ...downloadButton,
              width: '100%',
              margin: 0,
            }}
          >
            {isProcessingCheckout ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Confirm Order
              </>
            )}
          </button>
          <button
            onClick={() => setShowCheckoutForm(false)}
            style={{
              ...secondaryActionButton,
              width: '100%',
              margin: 0,
            }}
          >
            Back to Cart
          </button>
        </div>
      )}

      {/* Add padding bottom for mobile bottom bar */}
      {isMobile && !showCheckoutForm && <div style={{ height: '100px' }} />}
      {isMobile && showCheckoutForm && <div style={{ height: '150px' }} />}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          button:disabled:hover {
            transform: none !important;
          }
          
          img {
            transition: transform 0.3s ease;
          }
          
          img:hover {
            transform: scale(1.05);
          }
          
          @media (min-width: 1024px) {
            .cart-grid {
              grid-template-columns: 2fr 1fr;
            }
          }
          
          @media (max-width: 768px) {
            .header-container {
              flex-direction: column;
              gap: 20px;
              text-align: center;
            }
            
            .cart-title {
              font-size: 2.5rem;
            }
            
            .cart-item-content {
              flex-direction: column;
              text-align: center;
            }
            
            .cart-item-controls {
              width: 100%;
              justify-content: center;
            }
            
            .summary-card {
              position: static;
            }
            
            .payment-method-container {
              grid-template-columns: 1fr;
            }
            
            .mobile-bottom-bar {
              display: flex;
            }
          }
          
          /* Mobile specific touch improvements */
          @media (max-width: 768px) {
            button {
              min-height: 44px; /* Minimum touch target size */
            }
            
            input, select {
              font-size: 16px; /* Prevents iOS zoom on focus */
            }
            
            .cart-item-card {
              touch-action: manipulation;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Cart;