import { api } from "@/lib/axios";

// Define Razorpay response interface
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Interface for order creation response
export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

// Interface for verification response
export interface RazorpayVerificationResponse {
  message: string;
  orderId: string;
  paymentId: string;
}

// Interface for options used to initialize Razorpay
export interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (
  amount: number,
  currency: string = "INR",
  receipt: string = `order-${Date.now()}`
): Promise<RazorpayOrderResponse> => {
  try {
    const response = await api.post("/razorpay/create-order", {
      amount,
      currency,
      receipt,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (
  orderCreationId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<RazorpayVerificationResponse> => {
  try {
    const response = await api.post("/razorpay/verify", {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    throw error;
  }
};

// Initialize Razorpay
export const initializeRazorpay = (options: RazorpayOptions): void => {
  if (!(window as any).Razorpay) {
    throw new Error("Razorpay SDK not loaded");
  }
  
  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}; 