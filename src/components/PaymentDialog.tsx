import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QrCode, MapPin, Check } from 'lucide-react';
import UPIImage from '@/Assets/UPI.jpg';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onOpenChange, totalAmount }) => {
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Demo saved addresses
  const savedAddresses = [
    '123 Main Street, Mumbai, Maharashtra 400001',
    '456 Park Avenue, New Delhi, Delhi 110001',
  ];

  const handleAddNewAddress = () => {
    if (newAddress.trim()) {
      savedAddresses.push(newAddress);
      setSelectedAddress(newAddress);
      setNewAddress('');
    }
  };

  const handlePaymentComplete = () => {
    if (selectedAddress) {
      setPaymentComplete(true);
      // Reset after 3 seconds
      setTimeout(() => {
        setPaymentComplete(false);
        onOpenChange(false);
      }, 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {paymentComplete ? (
            <div className="flex flex-col items-center justify-center p-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center">Payment Successful!</h3>
              <p className="text-gray-500 text-center mt-2">
                Your order is being processed. Thank you for shopping with us!
              </p>
            </div>
          ) : (
            <>
              {/* UPI QR Code Section */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <QrCode className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">UPI Payment</h3>
                </div>
                <div className="flex flex-col items-center">
                  {/* UPI QR Code Image */}
                  <div className="w-48 h-48 flex items-center justify-center mb-2 overflow-hidden">
                    <img 
                      src={UPIImage} 
                      alt="UPI QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR code using any UPI app to pay ₹{totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    UPI ID: smartgrocery@upi
                  </p>
                </div>
              </div>

              {/* Address Selection Section */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">Delivery Address</h3>
                </div>

                <RadioGroup
                  value={selectedAddress || ''}
                  onValueChange={setSelectedAddress}
                  className="gap-2"
                >
                  {savedAddresses.map((address, index) => (
                    <div key={index} className="flex items-start space-x-2 border p-3 rounded">
                      <RadioGroupItem value={address} id={`address-${index}`} />
                      <Label 
                        htmlFor={`address-${index}`}
                        className="cursor-pointer text-sm leading-tight"
                      >
                        {address}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Add New Address</h4>
                  <div className="flex gap-2">
                    <Input
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Enter your full address"
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleAddNewAddress}
                      disabled={!newAddress.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!paymentComplete && (
            <Button 
              onClick={handlePaymentComplete} 
              disabled={!selectedAddress}
              className="w-full"
            >
              Complete Order
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog; 