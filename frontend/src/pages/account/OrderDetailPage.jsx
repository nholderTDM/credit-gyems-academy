import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  Clock,
  CreditCard,
  Package,
  Truck,
  Mail,
  Phone,
  MessageSquare,
  Star,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Video,
  Award,
  HelpCircle,
  ChevronRight,
  Shield,
  Zap,
  Receipt
} from 'lucide-react';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingItems, setDownloadingItems] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [resendingReceipt, setResendingReceipt] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      // Simulated order data
      const demoOrder = {
        _id: orderId,
        orderNumber: 'ORD-2024-001234',
        status: 'completed',
        createdAt: new Date('2024-01-15T10:30:00'),
        completedAt: new Date('2024-01-15T10:32:00'),
        items: [
          {
            _id: 'item1',
            productId: {
              _id: 'prod1',
              title: 'Complete Credit Repair Guide',
              type: 'ebook',
              price: 47,
              image: null,
              downloadUrl: '/downloads/credit-repair-guide.pdf',
              fileSize: '2.4 MB',
              format: 'PDF'
            },
            quantity: 1,
            price: 47
          },
          {
            _id: 'item2',
            productId: {
              _id: 'prod2',
              title: 'Credit Building Masterclass',
              type: 'course',
              price: 197,
              image: null,
              accessUrl: '/courses/credit-building-masterclass',
              duration: '6 hours',
              lessons: 24
            },
            quantity: 1,
            price: 197
          },
          {
            _id: 'item3',
            productId: {
              _id: 'prod3',
              title: 'Premium Credit Coaching - 3 Months',
              type: 'coaching',
              price: 597,
              image: null,
              startDate: new Date('2024-01-20'),
              sessions: 12
            },
            quantity: 1,
            price: 597
          }
        ],
        subtotal: 841,
        discount: {
          code: 'NEWYEAR24',
          amount: 84.10
        },
        tax: 0,
        total: 756.90,
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'Visa'
        },
        billing: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: {
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US'
          }
        },
        fulfillment: {
          status: 'delivered',
          deliveredAt: new Date('2024-01-15T10:35:00'),
          downloadLinks: [
            {
              productId: 'prod1',
              url: '/api/downloads/secure-link-1',
              expiresAt: new Date('2024-02-15')
            }
          ]
        },
        invoice: {
          id: 'INV-2024-001234',
          url: '/api/invoices/INV-2024-001234.pdf'
        }
      };

      setOrder(demoOrder);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [orderId]);

  const handleDownload = async (item) => {
    setDownloadingItems(prev => ({ ...prev, [item._id]: true }));
    
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would trigger the actual download
      console.log('Downloading:', item.productId.title);
      
      // Open download link
      if (item.productId.downloadUrl) {
        window.open(item.productId.downloadUrl, '_blank');
      }
    } catch {
      console.error('Download error');
      alert('Error downloading file. Please try again.');
    } finally {
      setDownloadingItems(prev => ({ ...prev, [item._id]: false }));
    }
  };

  const handleAccessCourse = (item) => {
    // Navigate to course or open in new tab
    if (item.productId.accessUrl) {
      navigate(item.productId.accessUrl);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const resendReceipt = async () => {
    setResendingReceipt(true);
    
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/orders/${orderId}/resend-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Receipt sent to your email!');
    } catch {
      alert('Error sending receipt. Please try again.');
    } finally {
      setResendingReceipt(false);
    }
  };

  const downloadInvoice = () => {
    if (order?.invoice?.url) {
      window.open(order.invoice.url, '_blank');
    }
  };

  const submitReview = async () => {
    setIsSubmittingReview(true);
    
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      setShowReviewModal(false);
      alert('Thank you for your review!');
    } catch {
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getProductIcon = (type) => {
    switch (type) {
      case 'ebook':
        return BookOpen;
      case 'course':
        return Video;
      case 'coaching':
        return Award;
      default:
        return Package;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFD700] mx-auto" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Order Not Found</h2>
          <p className="mt-2 text-gray-600">{error || 'The order you are looking for does not exist.'}</p>
          <Link 
            to="/account/orders"
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#FFD700] text-white rounded-lg hover:bg-[#FFD700]/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                to="/account/orders" 
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Order #{order.orderNumber}</span>
                  <button
                    onClick={copyOrderId}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedOrderId ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={resendReceipt}
                disabled={resendingReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {resendingReceipt ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Resend Receipt
              </button>
              <button
                onClick={downloadInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-white rounded-lg hover:bg-[#FFD700]/90 transition-colors"
              >
                <Receipt className="h-4 w-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                    <p className="text-sm text-gray-500">
                      {order.paymentMethod.brand} ending in {order.paymentMethod.last4}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Truck className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Products Delivered</p>
                    <p className="text-sm text-gray-500">
                      Digital products are ready for download
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item) => {
                  const ProductIcon = getProductIcon(item.productId.type);
                  
                  return (
                    <div key={item._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="h-12 w-12 bg-gradient-to-r from-[#FFD700]/20 to-[#FF0000]/20 rounded-lg flex items-center justify-center mr-4">
                            <ProductIcon className="h-6 w-6 text-[#FF0000]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.productId.title}</h3>
                            <p className="text-sm text-gray-500 capitalize">{item.productId.type}</p>
                            
                            {/* Product-specific details */}
                            {item.productId.type === 'ebook' && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.productId.format} • {item.productId.fileSize}
                              </p>
                            )}
                            {item.productId.type === 'course' && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.productId.lessons} lessons • {item.productId.duration}
                              </p>
                            )}
                            {item.productId.type === 'coaching' && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.productId.sessions} sessions • Starts {new Date(item.productId.startDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      
                      {/* Action buttons based on product type */}
                      <div className="mt-4">
                        {item.productId.type === 'ebook' && (
                          <button
                            onClick={() => handleDownload(item)}
                            disabled={downloadingItems[item._id]}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {downloadingItems[item._id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            Download PDF
                          </button>
                        )}
                        
                        {item.productId.type === 'course' && (
                          <button
                            onClick={() => handleAccessCourse(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white rounded-lg hover:opacity-90 transition-opacity"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Access Course
                          </button>
                        )}
                        
                        {item.productId.type === 'coaching' && (
                          <Link
                            to="/account/consultations"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white rounded-lg hover:opacity-90 transition-opacity"
                          >
                            <Calendar className="h-4 w-4" />
                            View Schedule
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/account/support"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  Contact Support
                </Link>
                
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Star className="h-5 w-5" />
                  Leave a Review
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                
                {order.discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount ({order.discount.code})
                    </span>
                    <span className="font-medium text-green-600">
                      -${order.discount.amount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-base font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.billing.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{order.billing.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{order.billing.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-3" />
                  <div className="text-sm text-gray-600">
                    <p>{order.billing.address.line1}</p>
                    {order.billing.address.line2 && <p>{order.billing.address.line2}</p>}
                    <p>
                      {order.billing.address.city}, {order.billing.address.state} {order.billing.address.postalCode}
                    </p>
                    <p>{order.billing.address.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FF0000]/10 rounded-xl p-6">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-[#FF0000] mt-0.5 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Transaction</h3>
                  <p className="text-sm text-gray-600">
                    Your payment was processed securely. We never store your full credit card information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewData(prev => ({ ...prev, rating }))}
                    className="text-2xl"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= reviewData.rating
                          ? 'text-[#FFD700] fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                placeholder="Tell us about your experience..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={isSubmittingReview || !reviewData.comment}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;