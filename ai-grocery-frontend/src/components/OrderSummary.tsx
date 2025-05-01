import React, { useState } from 'react';
import { ShoppingBag, Package, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, calculateTotalPrice } from '@/lib/processingUtils';
import PaymentDialog from './PaymentDialog';

// Define the interfaces that were previously imported from mockData
interface Product {
  id: string;
  name?: string;
  productname?: string;
  price: number;
  image?: string;
  image_url?: string;
  quantity?: string | number;
  packSize?: string | number;
  category?: string;
  subcategory?: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  unmatchedItems: string[];
  onClearOrder: () => void;
  onIncrementQuantity: (product: any) => void;
  onDecrementQuantity: (product: any) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  unmatchedItems,
  onClearOrder,
  onIncrementQuantity,
  onDecrementQuantity,
}) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const totalPrice = calculateTotalPrice(items);

  if (items.length === 0 && unmatchedItems.length === 0) {
    return null;
  }

  return (
    <div className="glassmorphism rounded-xl overflow-hidden animate-fade-in">
      <div className="bg-primary bg-opacity-10 px-4 py-3 border-b border-primary border-opacity-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium text-gray-900">Your Order</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 font-medium"
            onClick={onClearOrder}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="p-4">
        {items.length > 0 && (
          <div className="mb-4">
            <ul className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <li key={index} className="py-2 flex justify-between items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-700">
                        {item.quantity}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {item.product.name || item.product.productname}
                        {item.product.packSize && (
                          <span className="ml-2 font-normal text-gray-700 whitespace-nowrap">| {item.product.packSize}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7 p-0 rounded-full border-gray-300" onClick={() => item.product && onDecrementQuantity && onDecrementQuantity(item.product)} aria-label="Decrease quantity">
                        <span className="sr-only">Decrease</span>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="9" width="10" height="2" rx="1" fill="currentColor"/></svg>
                      </Button>
                      <Button size="icon" variant="outline" className="h-7 w-7 p-0 rounded-full border-gray-300" onClick={() => item.product && onIncrementQuantity && onIncrementQuantity(item.product)} aria-label="Increase quantity">
                        <span className="sr-only">Increase</span>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="5" width="2" height="10" rx="1" fill="currentColor"/><rect x="5" y="9" width="10" height="2" rx="1" fill="currentColor"/></svg>
                      </Button>
                    </div>
                    <span className="text-sm font-semibold text-right min-w-[60px]">
                      {formatCurrency((item.product.price || 0) * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        {unmatchedItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <h4 className="text-sm font-medium text-yellow-800 mb-1 flex items-center">
              <Package className="h-4 w-4 mr-1" />
              Unmatched Items
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {unmatchedItems.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          className="w-full mt-4" 
          disabled={items.length === 0}
          onClick={() => setPaymentDialogOpen(true)}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Pay
        </Button>
      </div>

      <PaymentDialog 
        open={paymentDialogOpen} 
        onOpenChange={setPaymentDialogOpen}
        totalAmount={totalPrice}
      />
    </div>
  );
};

export default OrderSummary;
