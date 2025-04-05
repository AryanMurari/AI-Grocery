import React, { useState } from 'react';
import { ShoppingBag, Package, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderItem } from '@/lib/mockData';
import { formatCurrency, calculateTotalPrice } from '@/lib/processingUtils';
import PaymentDialog from './PaymentDialog';

interface OrderSummaryProps {
  items: OrderItem[];
  unmatchedItems: string[];
  onClearOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  unmatchedItems,
  onClearOrder,
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
              {items.map((item) => (
                <li key={item.product.id} className="py-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-700 mr-2">
                      {item.quantity}
                    </span>
                    <span className="text-sm">{item.product.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
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
