'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFilecoinArchive } from '@/hooks/useFilecoinArchive';
import { FiCheck, FiLoader, FiAlertCircle, FiLink } from 'react-icons/fi';

interface OrderData {
  orderId?: string;
  userId?: string;
  items?: any[];
  total?: number;
  timestamp?: string;
  _archived?: {
    timestamp: string;
    service: string;
    version: string;
  };
}

export default function VerifyOrderPage() {
  const params = useParams();
  const cid = params?.cid as string;
  const { retrieveOrder, isLoading, error } = useFilecoinArchive();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!cid) return;

      setVerificationStatus('loading');
      const result = await retrieveOrder(cid);

      if ('success' in result && result.success) {
        setOrderData(result.order);
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
      }
    };

    fetchOrder();
  }, [cid, retrieveOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify Order</h1>
          <p className="text-gray-600">Permanently archived on Filecoin</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Loading State */}
          {verificationStatus === 'loading' && (
            <div className="text-center">
              <FiLoader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Verifying order...</p>
              <p className="text-sm text-gray-500 mt-2">Retrieving from Filecoin network</p>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && orderData && (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-100 rounded-full p-3">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Order Verified</h2>

              {/* CID Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 break-all">
                <p className="text-sm text-gray-600 mb-1">Content ID (CID):</p>
                <p className="font-mono text-sm font-bold text-gray-900">{cid}</p>
              </div>

              {/* Order Details */}
              {orderData.orderId && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-semibold text-gray-900">{orderData.orderId}</p>
                  </div>

                  {orderData.total && (
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">${orderData.total.toFixed(2)}</p>
                    </div>
                  )}

                  {orderData.items && orderData.items.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Items ({orderData.items.length})</p>
                      <ul className="space-y-2">
                        {orderData.items.map((item: any, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {item.name || item.title || `Item ${idx + 1}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {orderData.timestamp && (
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="text-sm text-gray-900">{new Date(orderData.timestamp).toLocaleString()}</p>
                    </div>
                  )}

                  {orderData._archived && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-600 mb-2">Archive Information</p>
                      <div className="text-xs text-gray-700 space-y-1">
                        <p>
                          <span className="text-gray-500">Service:</span> {orderData._archived.service}
                        </p>
                        <p>
                          <span className="text-gray-500">Archived:</span> {new Date(orderData._archived.timestamp).toLocaleString()}
                        </p>
                        <p>
                          <span className="text-gray-500">Version:</span> {orderData._archived.version}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <a
                  href={`https://gateway.lighthouse.storage/ipfs/${cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  <FiLink className="w-4 h-4" />
                  View Raw Data
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cid);
                    alert('CID copied to clipboard!');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
                >
                  Copy CID
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-2">{error || 'Could not retrieve order from Filecoin'}</p>
              <p className="text-sm text-gray-500">CID: {cid}</p>
            </div>
          )}
        </div>

        {/* Information Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">🔗 Permanently Stored:</span> This order is immutably stored on the Filecoin network and can be verified at any time using this CID.
          </p>
        </div>
      </div>
    </div>
  );
}
