import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Plus, Minus, Trash2, ShoppingBag, ArrowRight, 
  ShoppingCart, Download, Receipt, Package, Truck, 
  Shield, CreditCard, AlertCircle, CheckCircle, Loader2 
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

  const generateInvoicePDF = (orderData = null) => {
    try {
      const doc = new jsPDF('p', 'pt', 'letter');
      
      // Set document properties
      doc.setProperties({
        title: `Invoice - Morden Safety`,
        subject: 'Invoice',
        author: 'Morden Safety',
        keywords: 'invoice, receipt, safety equipment',
        creator: 'Morden Safety System'
      });
      
      // Add watermark effect
      doc.setGState(new doc.GState({ opacity: 0.05 }));
      doc.setFontSize(120);
      doc.setTextColor(200, 200, 200);
      doc.text('MORDEN SAFETY', 200, 350, { angle: 45 });
      doc.setGState(new doc.GState({ opacity: 1 }));
      
      // Invoice header with gradient effect
      doc.setFillColor(30, 64, 175);
      doc.rect(40, 40, 520, 80, 'F');
      
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('MORDEN SAFETY', 60, 75);
      
      doc.setFontSize(18);
      doc.text('INVOICE', 60, 100);
      
      // Company info box
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(40, 140, 250, 80, 10, 10, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('SUPPLIER DETAILS', 50, 160);
      
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      doc.text('Morden Safety Equipment Suppliers', 50, 180);
      doc.text('P.O. Box 1234, Lilongwe, Malawi', 50, 195);
      doc.text('Phone: +265 999 999 999', 50, 210);
      doc.text('Email: info@mordensafety.com', 50, 225);
      
      // Customer info box
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(310, 140, 250, 80, 10, 10, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER DETAILS', 320, 160);
      
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      
      const currentUser = getCurrentUser() || contextUser;
      if (currentUser) {
        doc.text(currentUser.name || 'Customer', 320, 180);
        if (currentUser.email) doc.text(currentUser.email, 320, 195);
        if (phoneNumber) doc.text(`Phone: ${phoneNumber}`, 320, 210);
        if (shippingAddress) doc.text(`Address: ${shippingAddress}`, 320, 225);
      } else {
        doc.text('Guest Customer', 320, 180);
        if (phoneNumber) doc.text(`Phone: ${phoneNumber}`, 320, 195);
        if (shippingAddress) doc.text(`Address: ${shippingAddress}`, 320, 210);
      }
      
      // Invoice details box
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(40, 240, 520, 40, 10, 10, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      
      const invoiceDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const invoiceNumber = orderData?.order_id 
        ? `INV-${orderData.order_id}`
        : `DRAFT-${Date.now().toString().slice(-8)}`;
      
      const status = orderData?.status || 'Draft';
      const details = [
        `Invoice #: ${invoiceNumber}`,
        `Date: ${invoiceDate}`,
        `Status: ${status}`,
        `Payment Method: ${paymentMethod.toUpperCase()}`
      ];
      
      details.forEach((detail, index) => {
        doc.text(detail, 50 + (index * 130), 265);
      });
      
      // Table header
      const tableTop = 300;
      doc.setFillColor(30, 64, 175);
      doc.roundedRect(40, tableTop, 520, 30, 5, 5, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      
      const headers = ['#', 'Description', 'Quantity', 'Unit Price', 'Total'];
      const headerPositions = [60, 150, 350, 430, 510];
      
      headers.forEach((header, index) => {
        doc.text(header, headerPositions[index], tableTop + 20);
      });
      
      // Table data
      let tableY = tableTop + 30;
      
      cart.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(40, tableY, 520, 30, 'F');
        }
        
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        // Item number
        doc.text((index + 1).toString(), 60, tableY + 20);
        
        // Item name (truncated if too long)
        const itemName = item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name;
        doc.text(itemName, 150, tableY + 20);
        
        // Quantity
        doc.text(item.quantity.toString(), 350, tableY + 20);
        
        // Unit price
        doc.text(`MK ${item.price.toLocaleString()}`, 430, tableY + 20);
        
        // Total
        const itemTotal = item.price * item.quantity;
        doc.text(`MK ${itemTotal.toLocaleString()}`, 510, tableY + 20);
        
        tableY += 30;
      });
      
      // Summary section
      const summaryTop = Math.max(tableY, 600) + 30;
      
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(40, summaryTop, 520, 150, 10, 10, 'F');
      
      // Summary title
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE SUMMARY', 50, summaryTop + 25);
      
      // Summary details
      const summaryItems = [
        { label: `Subtotal (${cartItemsCount} items)`, value: `MK ${cartTotal.toLocaleString()}` },
        { label: 'Shipping & Handling', value: 'MK 0' },
        { label: 'Tax (0%)', value: 'MK 0' },
        { label: 'Discount', value: 'MK 0' }
      ];
      
      summaryItems.forEach((item, index) => {
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.setFont('helvetica', 'normal');
        doc.text(item.label, 50, summaryTop + 50 + (index * 20));
        
        doc.text(item.value, 500, summaryTop + 50 + (index * 20), { align: 'right' });
      });
      
      // Total
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL AMOUNT', 50, summaryTop + 130);
      doc.text(`MK ${cartTotal.toLocaleString()}`, 500, summaryTop + 130, { align: 'right' });
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      
      const footerY = 750;
      doc.text('Thank you for choosing Morden Safety for your safety needs.', 300, footerY, { align: 'center' });
      doc.text('All equipment meets international safety standards and comes with warranty.', 300, footerY + 12, { align: 'center' });
      doc.text('For inquiries: info@mordensafety.com | Phone: +265 999 999 999', 300, footerY + 24, { align: 'center' });
      doc.text('Terms: Payment due within 30 days. Late payments subject to 2% monthly interest.', 300, footerY + 36, { align: 'center' });
      
      // Add safety certification badge
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(40, footerY + 50, 520, 30, 5, 5, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(21, 128, 61);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ Certified Safety Equipment | ✓ ISO 9001 Certified | ✓ 24/7 Customer Support', 300, footerY + 70, { align: 'center' });
      
      // Add page border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(1);
      doc.rect(20, 20, 560, 780);
      
      return doc;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  };

  const generateDraftInvoice = () => {
    setIsGeneratingInvoice(true);
    
    try {
      const doc = generateInvoicePDF();
      
      // Save the PDF - FIXED: Use a valid file name
      const invoiceNumber = `DRAFT-${Date.now().toString().slice(-8)}`;
      const fileName = `Morden-Safety-Invoice-${invoiceNumber}.pdf`;
      
      // Save the PDF directly
      doc.save(fileName);
      
      showToast(`Invoice ${invoiceNumber} downloaded successfully!`, 'success');
    } catch (error) {
      console.error('Error generating draft invoice:', error);
      showToast('Failed to generate invoice. Please try again or contact support.', 'error');
    } finally {
      setIsGeneratingInvoice(false);
    }
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

      // Call the API to create order
      const response = await ordersAPI.checkout(orderData);
      const order = response.data;

      // Generate invoice with order data
      const doc = generateInvoicePDF(order);
      const invoiceNumber = `INV-${order.order_id}`;
      const fileName = `Morden-Safety-Order-${invoiceNumber}.pdf`;
      
      // Save the PDF directly
      doc.save(fileName);

      // Clear cart after successful checkout
      handleClearCart();

      // Show success message
      showToast(`Order #${order.order_id} placed successfully! Invoice downloaded.`, 'success');

      // Navigate to orders page or home
      setTimeout(() => {
        navigate('/my-orders');
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
    if (!isAuthenticated() || !shippingAddress || !phoneNumber) {
      setShowCheckoutForm(true);
      return;
    }
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