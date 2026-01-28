import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShoppingCart, Download, Receipt } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartItemsCount, user } = useApp();
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const generateInvoice = () => {
    setIsGeneratingInvoice(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Invoice header
      doc.setFontSize(24);
      doc.setTextColor(30, 64, 175); // Blue color
      doc.text('MORDEN SAFETY', 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE', 20, 45);
      
      // Company info
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Morden Safety Equipment Suppliers', 20, 55);
      doc.text('P.O. Box 1234, Lilongwe', 20, 60);
      doc.text('Phone: +265 999 999 999', 20, 65);
      doc.text('Email: info@mordensafety.com', 20, 70);
      
      // Customer info
      const customerY = 85;
      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text('BILL TO:', 20, customerY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      if (user) {
        doc.text(user.name || 'Customer', 20, customerY + 8);
        if (user.email) doc.text(user.email, 20, customerY + 15);
        if (user.phone) doc.text(`Phone: ${user.phone}`, 20, customerY + 22);
      } else {
        doc.text('Guest Customer', 20, customerY + 8);
      }
      
      // Invoice details
      const invoiceY = customerY;
      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text('INVOICE DETAILS', 140, invoiceY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const invoiceDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
      
      doc.text(`Invoice #: ${invoiceNumber}`, 140, invoiceY + 8);
      doc.text(`Date: ${invoiceDate}`, 140, invoiceY + 15);
      doc.text(`Status: Pending Payment`, 140, invoiceY + 22);
      
      // Table data
      const tableData = cart.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        `MK ${item.price.toLocaleString()}`,
        `MK ${(item.price * item.quantity).toLocaleString()}`
      ]);
      
      // Add table
      doc.autoTable({
        startY: customerY + 40,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 15 }, // #
          1: { cellWidth: 80 }, // Description
          2: { cellWidth: 25 }, // Qty
          3: { cellWidth: 40 }, // Unit Price
          4: { cellWidth: 40 }  // Total
        }
      });
      
      // Get final Y position after table
      const finalY = doc.lastAutoTable.finalY + 10;
      
      // Summary
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.text('SUMMARY', 140, finalY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Subtotal (${cartItemsCount} items):`, 140, finalY + 10);
      doc.text(`MK ${cartTotal.toLocaleString()}`, 180, finalY + 10, { align: 'right' });
      
      doc.text('Shipping:', 140, finalY + 17);
      doc.text('MK 0', 180, finalY + 17, { align: 'right' });
      
      doc.text('Tax:', 140, finalY + 24);
      doc.text('MK 0', 180, finalY + 24, { align: 'right' });
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Total Amount:', 140, finalY + 35);
      doc.text(`MK ${cartTotal.toLocaleString()}`, 180, finalY + 35, { align: 'right' });
      
      // Footer
      const footerY = 280;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
      doc.text('Terms & Conditions: Payment due within 30 days', 105, footerY + 5, { align: 'center' });
      doc.text('For any inquiries, contact us at info@mordensafety.com', 105, footerY + 10, { align: 'center' });
      
      // Save PDF
      doc.save(`invoice-${invoiceNumber}.pdf`);
      
      // Show success message
      const event = new CustomEvent('showToast', {
        detail: {
          message: `Invoice downloaded successfully!`,
          type: 'success'
        }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Failed to generate invoice. Please try again.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleCheckout = () => {
    // Generate invoice first
    generateInvoice();
    
    // Then proceed to service request (if you want to keep both actions)
    // You could also redirect immediately after PDF download
  };

  // Modern styles
  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const emptyStateContainer = {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  };

  const emptyIconContainer = {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 32px',
  };

  const emptyTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '16px',
    letterSpacing: '-0.025em',
  };

  const emptyTextStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto 32px',
    lineHeight: '1.6',
  };

  const browseButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 32px',
    borderRadius: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
  };

  const browseButtonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  };

  const headerContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  };

  const cartTitleStyle = {
    fontSize: '3rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.025em',
  };

  const clearCartButtonStyle = {
    padding: '10px 20px',
    borderRadius: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const clearCartButtonHoverStyle = {
    backgroundColor: '#fecaca',
    transform: 'translateY(-2px)',
  };

  const cartGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
  };

  const cartItemCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.3s ease',
  };

  const cartItemCardHoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
    borderColor: '#dbeafe',
  };

  const cartItemContentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  };

  const cartItemImageStyle = {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '15px',
    flexShrink: '0',
  };

  const cartItemInfoStyle = {
    flex: '1',
    minWidth: '0',
  };

  const cartItemNameStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const cartItemPriceStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e40af',
  };

  const cartItemControlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const quantityContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#f9fafb',
    padding: '8px',
    borderRadius: '12px',
  };

  const quantityButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const quantityButtonHoverStyle = {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  };

  const quantityDisplayStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    width: '40px',
    textAlign: 'center',
  };

  const deleteButtonStyle = {
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const deleteButtonHoverStyle = {
    backgroundColor: '#fecaca',
    transform: 'scale(1.1)',
  };

  const subtotalContainerStyle = {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const subtotalLabelStyle = {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  };

  const subtotalValueStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
  };

  const summaryCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    position: 'sticky',
    top: '100px',
  };

  const summaryTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px',
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const summaryLabelStyle = {
    fontSize: '1rem',
    color: '#6b7280',
  };

  const summaryValueStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
  };

  const totalRowStyle = {
    ...summaryRowStyle,
    borderBottom: 'none',
    paddingTop: '20px',
    marginTop: '12px',
  };

  const totalLabelStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
  };

  const totalValueStyle = {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e40af',
  };

  const actionButtonsContainer = {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const primaryActionButton = {
    padding: '18px 24px',
    borderRadius: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  const primaryActionButtonHover = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  };

  const downloadButton = {
    padding: '18px 24px',
    borderRadius: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  const downloadButtonHover = {
    backgroundColor: '#059669',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
  };

  const secondaryActionButton = {
    padding: '18px 24px',
    borderRadius: '12px',
    backgroundColor: 'white',
    color: '#4b5563',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  const secondaryActionButtonHover = {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  };

  if (cart.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateContainer}>
          <div style={emptyIconContainer}>
            <ShoppingBag size={48} color="#9ca3af" />
          </div>
          <h2 style={emptyTitleStyle}>Your cart is empty</h2>
          <p style={emptyTextStyle}>
            Browse our products and add some items to your cart to get started
          </p>
          <Link 
            to="/products"
            style={browseButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, browseButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, browseButtonStyle)}
          >
            <ShoppingCart size={20} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerContainerStyle}>
        <h1 style={cartTitleStyle}>Shopping Cart</h1>
        <button
          onClick={clearCart}
          style={clearCartButtonStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, clearCartButtonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, clearCartButtonStyle)}
        >
          <Trash2 size={16} />
          Clear Cart
        </button>
      </div>

      {/* Main Content */}
      <div style={cartGridStyle}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map((item) => (
            <div 
              key={item.id} 
              style={cartItemCardStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, cartItemCardHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, cartItemCardStyle)}
            >
              <div style={cartItemContentStyle}>
                {item.image_url && (
                  <img
                    src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000${item.image_url}`}
                    alt={item.name}
                    style={cartItemImageStyle}
                  />
                )}
                
                <div style={cartItemInfoStyle}>
                  <h3 style={cartItemNameStyle}>
                    {item.name}
                  </h3>
                  <p style={cartItemPriceStyle}>
                    MK {item.price.toLocaleString()}
                  </p>
                </div>

                <div style={cartItemControlsStyle}>
                  <div style={quantityContainerStyle}>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      style={quantityButtonStyle}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, quantityButtonStyle)}
                    >
                      <Minus size={16} color="#4b5563" />
                    </button>
                    <span style={quantityDisplayStyle}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      style={quantityButtonStyle}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, quantityButtonHoverStyle)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, quantityButtonStyle)}
                    >
                      <Plus size={16} color="#4b5563" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, deleteButtonHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, deleteButtonStyle)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={subtotalContainerStyle}>
                <span style={subtotalLabelStyle}>Subtotal:</span>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Items ({cartItemsCount})</span>
                <span style={summaryValueStyle}>MK {cartTotal.toLocaleString()}</span>
              </div>
              
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Shipping</span>
                <span style={summaryValueStyle}>MK 0</span>
              </div>
              
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Tax</span>
                <span style={summaryValueStyle}>MK 0</span>
              </div>
              
              <div style={totalRowStyle}>
                <span style={totalLabelStyle}>Total</span>
                <span style={totalValueStyle}>MK {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div style={actionButtonsContainer}>
              {/* Download Invoice Button */}
              <button
                onClick={handleCheckout}
                disabled={isGeneratingInvoice}
                style={downloadButton}
                onMouseEnter={(e) => !isGeneratingInvoice && Object.assign(e.currentTarget.style, downloadButtonHover)}
                onMouseLeave={(e) => !isGeneratingInvoice && Object.assign(e.currentTarget.style, downloadButton)}
              >
                {isGeneratingInvoice ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Generating Invoice...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Invoice & Checkout
                  </>
                )}
              </button>

              {/* Alternative: Separate invoice download button */}
              <button
                onClick={generateInvoice}
                disabled={isGeneratingInvoice}
                style={secondaryActionButton}
                onMouseEnter={(e) => !isGeneratingInvoice && Object.assign(e.currentTarget.style, secondaryActionButtonHover)}
                onMouseLeave={(e) => !isGeneratingInvoice && Object.assign(e.currentTarget.style, secondaryActionButton)}
              >
                <Receipt size={20} />
                Download Invoice Only
              </button>

              {/* Proceed to Service Request */}
              <Link
                to="/service-request"
                style={primaryActionButton}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, primaryActionButtonHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, primaryActionButton)}
              >
                Proceed to Service Request
                <ArrowRight size={20} />
              </Link>
              
              {/* Continue Shopping */}
              <Link
                to="/products"
                style={secondaryActionButton}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, secondaryActionButtonHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, secondaryActionButton)}
              >
                Continue Shopping
              </Link>
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
          
          button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          button:disabled:hover {
            transform: none !important;
            box-shadow: none !important;
          }
          
          @media (min-width: 1024px) {
            .cart-grid {
              grid-template-columns: 2fr 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Cart;