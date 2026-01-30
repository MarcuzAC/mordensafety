import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Plus, Minus, Trash2, ShoppingBag, ArrowRight, 
  ShoppingCart, Download, Receipt, Package, Truck, 
  Shield, CreditCard, AlertCircle, CheckCircle 
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  const navigate = useNavigate();

  // Load cart from localStorage on component mount
  useEffect(() => {
    console.log('Cart component mounted');
    loadCart();
    
    // Load user info if authenticated
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      console.log('Current user from auth:', currentUser);
      if (currentUser) {
        setShippingAddress(currentUser.address || '');
        setPhoneNumber(currentUser.phone || '');
      }
    }
  }, []);

  // Sync cart with context
  useEffect(() => {
    if (contextCart) {
      console.log('Context cart updated:', contextCart);
      setCart(contextCart);
    }
  }, [contextCart]);

  const loadCart = () => {
    try {
      console.log('Loading cart from localStorage...');
      const loadedCart = cartAPI.getCart();
      console.log('Loaded cart:', loadedCart);
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

      // Get product from cart to check stock
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

  const generateSimpleInvoicePDF = () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Cart:', cart);
      console.log('Cart total:', cartTotal);
      console.log('Items count:', cartItemsCount);
      
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: 'Invoice - Morden Safety',
        subject: 'Invoice',
        author: 'Morden Safety',
        creator: 'Morden Safety System'
      });
      
      // Add header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('MORDEN SAFETY', 20, 20);
      
      doc.setFontSize(16);
      doc.text('INVOICE', 20, 35);
      
      // Company info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Modern Safety Equipment Suppliers', 20, 50);
      doc.text('P.O. Box 1234, Lilongwe, Malawi', 20, 60);
      doc.text('Phone: +265 999 999 999', 20, 70);
      doc.text('Email: info@mordensafety.com', 20, 80);
      
      // Invoice details
      const invoiceDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
      
      doc.text(`Invoice #: ${invoiceNumber}`, 150, 50);
      doc.text(`Date: ${invoiceDate}`, 150, 60);
      doc.text(`Status: Draft`, 150, 70);
      doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 150, 80);
      
      // Customer info
      const currentUser = getCurrentUser() || contextUser;
      const customerName = currentUser ? (currentUser.name || currentUser.full_name || 'Customer') : 'Guest Customer';
      
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 20, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(customerName, 20, 110);
      
      if (phoneNumber) {
        doc.text(`Phone: ${phoneNumber}`, 20, 120);
      }
      if (shippingAddress) {
        // Split address if too long
        const addressLines = doc.splitTextToSize(`Address: ${shippingAddress}`, 150);
        addressLines.forEach((line, index) => {
          doc.text(line, 20, 130 + (index * 10));
        });
      }
      
      // Table header
      let yPos = 170;
      doc.setFont('helvetica', 'bold');
      doc.text('#', 20, yPos);
      doc.text('Description', 40, yPos);
      doc.text('Qty', 120, yPos);
      doc.text('Price', 140, yPos);
      doc.text('Total', 170, yPos);
      
      // Draw line under header
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(20, yPos + 2, 190, yPos + 2);
      
      // Table rows
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      
      let subtotal = 0;
      
      cart.forEach((item, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const itemNumber = index + 1;
        const itemName = item.name || 'Unnamed Product';
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        const itemTotal = quantity * price;
        subtotal += itemTotal;
        
        // Truncate item name if too long
        const truncatedName = itemName.length > 30 ? itemName.substring(0, 27) + '...' : itemName;
        
        doc.text(itemNumber.toString(), 20, yPos);
        doc.text(truncatedName, 40, yPos);
        doc.text(quantity.toString(), 120, yPos);
        doc.text(`MK ${price.toLocaleString()}`, 140, yPos);
        doc.text(`MK ${itemTotal.toLocaleString()}`, 170, yPos);
        
        yPos += 10;
      });
      
      // Summary section
      yPos = Math.max(yPos, 200);
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('SUMMARY', 20, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.text(`Subtotal (${cartItemsCount} items):`, 100, yPos);
      doc.text(`MK ${subtotal.toLocaleString()}`, 170, yPos, { align: 'right' });
      
      yPos += 10;
      doc.text('Shipping:', 100, yPos);
      doc.text('MK 0', 170, yPos, { align: 'right' });
      
      yPos += 10;
      doc.text('Tax:', 100, yPos);
      doc.text('MK 0', 170, yPos, { align: 'right' });
      
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', 100, yPos);
      doc.text(`MK ${subtotal.toLocaleString()}`, 170, yPos, { align: 'right' });
      
      // Footer
      yPos += 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for choosing Morden Safety for your safety needs.', 105, yPos, { align: 'center' });
      
      yPos += 5;
      doc.text('All equipment meets international safety standards and comes with warranty.', 105, yPos, { align: 'center' });
      
      yPos += 5;
      doc.text('For inquiries: info@mordensafety.com | Phone: +265 999 999 999', 105, yPos, { align: 'center' });
      
      console.log('PDF generation completed successfully');
      return doc;
      
    } catch (error) {
      console.error('Error in generateSimpleInvoicePDF:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  const generateDraftInvoice = () => {
    console.log('=== STARTING DRAFT INVOICE GENERATION ===');
    console.log('Cart state:', cart);
    console.log('Cart length:', cart.length);
    console.log('Cart items count:', cartItemsCount);
    console.log('Cart total:', cartTotal);
    
    setIsGeneratingInvoice(true);
    
    try {
      // Validate cart
      if (!cart || cart.length === 0) {
        showToast('Your cart is empty. Add items before downloading invoice.', 'error');
        setIsGeneratingInvoice(false);
        return;
      }
      
      // Validate cart data
      const validCart = cart.filter(item => 
        item && 
        item.id && 
        item.name && 
        typeof item.price === 'number' && 
        item.price > 0 &&
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );
      
      if (validCart.length === 0) {
        showToast('Cart contains invalid items. Please refresh and try again.', 'error');
        setIsGeneratingInvoice(false);
        return;
      }
      
      console.log('Valid cart items:', validCart);
      
      // Generate PDF
      const doc = generateSimpleInvoicePDF();
      
      // Generate filename
      const timestamp = Date.now();
      const invoiceNumber = `DRAFT-${timestamp.toString().slice(-8)}`;
      const fileName = `Morden-Safety-Invoice-${invoiceNumber}.pdf`;
      
      console.log('Saving PDF as:', fileName);
      
      // Save PDF
      doc.save(fileName);
      
      showToast(`Invoice ${invoiceNumber} downloaded successfully!`, 'success');
      
    } catch (error) {
      console.error('Error generating draft invoice:', error);
      
      // More user-friendly error messages
      let errorMessage = 'Failed to generate invoice. ';
      
      if (error.message.includes('jsPDF')) {
        errorMessage = 'PDF library error. Please refresh the page and try again.';
      } else if (error.message.includes('Cart is empty')) {
        errorMessage = 'Your cart is empty. Add items before downloading invoice.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      showToast(errorMessage, 'error');
      
      // Fallback: Try to create a simple text invoice
      try {
        console.log('Attempting fallback text invoice...');
        createTextInvoiceFallback();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const createTextInvoiceFallback = () => {
    const currentUser = getCurrentUser() || contextUser;
    const customerName = currentUser ? (currentUser.name || currentUser.full_name || 'Customer') : 'Guest Customer';
    const invoiceNumber = `DRAFT-${Date.now().toString().slice(-8)}`;
    const invoiceDate = new Date().toLocaleDateString();
    
    let textContent = `MORDEN SAFETY INVOICE\n`;
    textContent += `========================\n\n`;
    textContent += `Invoice #: ${invoiceNumber}\n`;
    textContent += `Date: ${invoiceDate}\n`;
    textContent += `Customer: ${customerName}\n`;
    if (phoneNumber) textContent += `Phone: ${phoneNumber}\n`;
    if (shippingAddress) textContent += `Address: ${shippingAddress}\n`;
    textContent += `\nITEMS:\n`;
    textContent += `----------------------------------------\n`;
    
    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      total += itemTotal;
      textContent += `${index + 1}. ${item.name || 'Item'} x ${item.quantity || 0} = MK ${itemTotal.toLocaleString()}\n`;
    });
    
    textContent += `\n----------------------------------------\n`;
    textContent += `TOTAL: MK ${total.toLocaleString()}\n\n`;
    textContent += `Thank you for choosing Morden Safety!\n`;
    
    // Create and download text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Morden-Safety-Invoice-${invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`Invoice downloaded as text file`, 'info');
  };

  const handleCheckout = async () => {
    // Validate form if checkout form is shown
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

      console.log('Submitting order:', orderData);

      // Call the API to create order
      const response = await ordersAPI.checkout(orderData);
      const order = response.data;
      
      console.log('Order created:', order);

      // Generate invoice with order data
      try {
        const doc = generateSimpleInvoicePDF();
        const invoiceNumber = order.order_id ? `INV-${order.order_id}` : `ORDER-${Date.now().toString().slice(-8)}`;
        const fileName = `Morden-Safety-Order-${invoiceNumber}.pdf`;
        
        // Save the PDF
        doc.save(fileName);
        console.log('Order invoice saved:', fileName);
      } catch (pdfError) {
        console.error('Failed to generate PDF invoice:', pdfError);
        // Continue with order even if PDF fails
      }

      // Clear cart after successful checkout
      handleClearCart();

      // Show success message
      showToast(`Order #${order.order_id || 'placed'} successfully!`, 'success');

      // Navigate to orders page or home
      setTimeout(() => {
        navigate('/my-requests');
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      
      const userError = handleApiError(error);
      showToast(userError.message, 'error');
      
      // Still allow downloading a draft invoice
      if (!showCheckoutForm) {
        generateDraftInvoice();
      }
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleDownloadInvoice = () => {
    console.log('Download invoice clicked');
    console.log('Is authenticated:', isAuthenticated());
    console.log('Shipping address:', shippingAddress);
    console.log('Phone number:', phoneNumber);
    
    // Check minimum requirements
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
    
    console.log('All conditions met, generating invoice...');
    generateDraftInvoice();
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated()) {
      showToast('Please login to proceed with checkout', 'warning');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setShowCheckoutForm(true);
  };

  // Modern enhanced styles
  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    minHeight: '100vh',
  };

  const emptyStateContainer = {
    textAlign: 'center',
    padding: '100px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
  };

  const emptyIconContainer = {
    width: '160px',
    height: '160px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 40px',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
    animation: 'float 3s ease-in-out infinite',
  };

  const emptyTitleStyle = {
    fontSize: '3rem',
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

  const browseButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 40px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '50px',
    padding: '30px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  };

  const cartTitleStyle = {
    fontSize: '3.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.025em',
    margin: '0',
    position: 'relative',
  };

  const cartSubtitleStyle = {
    fontSize: '1.125rem',
    color: '#64748b',
    marginTop: '12px',
    fontWeight: '500',
  };

  const clearCartButtonStyle = {
    padding: '14px 28px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#dc2626',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.1)',
  };

  const clearCartButtonHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)',
    background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
  };

  const cartGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '40px',
  };

  const cartItemCardStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  };

  const cartItemCardHoverStyle = {
    transform: 'translateY(-8px)',
    boxShadow: '0 25px 50px rgba(59, 130, 246, 0.15)',
    borderColor: '#dbeafe',
  };

  const cartItemContentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  };

  const cartItemImageStyle = {
    width: '140px',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '20px',
    flexShrink: '0',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  };

  const cartItemInfoStyle = {
    flex: '1',
    minWidth: '0',
  };

  const cartItemNameStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '12px',
    lineHeight: '1.3',
  };

  const cartItemDescStyle = {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '15px',
    lineHeight: '1.6',
  };

  const cartItemPriceStyle = {
    fontSize: '2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  };

  const cartItemControlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
  };

  const quantityContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    padding: '12px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
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
    transition: 'all 0.2s ease',
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

  const deleteButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
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
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)',
  };

  const subtotalContainerStyle = {
    marginTop: '25px',
    paddingTop: '25px',
    borderTop: '2px dashed #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const subtotalLabelStyle = {
    fontSize: '1.125rem',
    color: '#64748b',
    fontWeight: '600',
  };

  const subtotalValueStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e40af',
  };

  const summaryCardStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    padding: '40px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    position: 'sticky',
    top: '120px',
  };

  const summaryTitleStyle = {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '3px solid #dbeafe',
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px dashed #e2e8f0',
  };

  const summaryLabelStyle = {
    fontSize: '1.125rem',
    color: '#64748b',
    fontWeight: '500',
  };

  const summaryValueStyle = {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#334155',
  };

  const totalRowStyle = {
    ...summaryRowStyle,
    borderBottom: 'none',
    paddingTop: '25px',
    marginTop: '15px',
    borderTop: '2px solid #dbeafe',
  };

  const totalLabelStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
  };

  const totalValueStyle = {
    fontSize: '2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const actionButtonsContainer = {
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const primaryActionButton = {
    padding: '22px 32px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '700',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
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
    padding: '22px 32px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '700',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
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
    padding: '22px 32px',
    borderRadius: '15px',
    background: 'white',
    color: '#475569',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  };

  const secondaryActionButtonHover = {
    background: '#f8fafc',
    borderColor: '#cbd5e1',
    transform: 'translateY(-2px)',
  };

  // Checkout Form Styles
  const checkoutFormStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '25px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
    border: '2px solid rgba(59, 130, 246, 0.1)',
  };

  const formTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const formGroupStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '8px',
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  };

  const paymentMethodButton = {
    padding: '15px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    fontWeight: '600',
    color: '#475569',
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
    borderRadius: '25px',
    padding: '30px',
    marginTop: '40px',
    border: '2px solid #dbeafe',
  };

  const safetyFeaturesTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: '20px',
    textAlign: 'center',
  };

  const safetyFeaturesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  };

  const safetyFeatureCardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
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
            <ShoppingBag size={64} color="#3b82f6" />
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
            <ShoppingCart size={24} />
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
        <div>
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
          <Trash2 size={18} />
          Clear Cart
        </button>
      </div>

      {/* Main Content */}
      <div style={cartGridStyle}>
        {/* Checkout Form (if shown) */}
        {showCheckoutForm && (
          <div style={checkoutFormStyle}>
            <h3 style={formTitleStyle}>
              <CreditCard size={24} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {cart.map((item) => (
            <div 
              key={item.id} 
              style={cartItemCardStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, cartItemCardHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, cartItemCardStyle)}
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
                        fontSize: '0.75rem',
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginLeft: '10px',
                        fontWeight: '600'
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
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, quantityButtonStyle)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={20} />
                    </button>
                    <span style={quantityDisplayStyle}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      style={quantityButtonStyle}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, quantityButtonStyle)}
                      disabled={item.quantity >= item.stock_quantity}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, deleteButtonHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, deleteButtonStyle)}
                    title="Remove item"
                  >
                    <Trash2 size={22} />
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

            {!showCheckoutForm ? (
              <div style={actionButtonsContainer}>
                {/* Download Invoice Button */}
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isGeneratingInvoice}
                  style={downloadButton}
                  onMouseEnter={(e) => !isGeneratingInvoice && Object.assign(e.currentTarget.style, downloadButtonHover)}
                  onMouseLeave={(e) => !isGeneratingInvoice && Object.assign(e.currentTarget.style, downloadButton)}
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
                      Download Invoice
                    </>
                  )}
                </button>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  style={primaryActionButton}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, primaryActionButtonHover)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, primaryActionButton)}
                >
                  <CreditCard size={24} />
                  Proceed to Checkout
                  <ArrowRight size={24} />
                </button>
                
                {/* Continue Shopping */}
                <Link
                  to="/products"
                  style={secondaryActionButton}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, secondaryActionButtonHover)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, secondaryActionButton)}
                >
                  <ShoppingCart size={20} />
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div style={actionButtonsContainer}>
                {/* Confirm Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout}
                  style={downloadButton}
                  onMouseEnter={(e) => !isProcessingCheckout && Object.assign(e.currentTarget.style, downloadButtonHover)}
                  onMouseLeave={(e) => !isProcessingCheckout && Object.assign(e.currentTarget.style, downloadButton)}
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
                      Confirm Order & Download Invoice
                    </>
                  )}
                </button>

                {/* Back to Cart Button */}
                <button
                  onClick={() => setShowCheckoutForm(false)}
                  style={secondaryActionButton}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, secondaryActionButtonHover)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, secondaryActionButton)}
                >
                  <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                  Back to Cart
                </button>

                {/* Important Note */}
                <div style={{
                  background: '#fef3c7',
                  border: '2px solid #fbbf24',
                  borderRadius: '12px',
                  padding: '15px',
                  marginTop: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertCircle size={20} color="#92400e" />
                    <div>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: '#92400e', 
                        fontWeight: '600',
                        margin: '0 0 5px 0'
                      }}>
                        Important:
                      </p>
                      <p style={{ 
                        fontSize: '0.85rem', 
                        color: '#92400e', 
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        • Invoice will be downloaded after order confirmation<br/>
                        • You'll receive order updates via email/SMS<br/>
                        • Delivery within 3-5 business days<br/>
                        • Contact us for bulk orders or special requests
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
                <Shield size={32} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h5 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '8px' }}>Certified Equipment</h5>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>All products meet international safety standards</p>
              </div>
              <div style={safetyFeatureCardStyle}>
                <Truck size={32} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h5 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '8px' }}>Quick Delivery</h5>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Fast and reliable delivery across Malawi</p>
              </div>
              <div style={safetyFeatureCardStyle}>
                <Package size={32} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h5 style={{ color: '#1e40af', fontWeight: '700', marginBottom: '8px' }}>Warranty Included</h5>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>All equipment comes with manufacturer warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          }
        `}
      </style>
    </div>
  );
};

export default Cart;