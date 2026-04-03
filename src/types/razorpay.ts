export interface RazorpayOptions {
    key: string;
    order_id?: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    notes: {
        batch: string;
        [key: string]: string | undefined;
    };
    theme: {
        color: string;
    };
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
    }) => void;
    modal: {
        ondismiss: () => void;
    };
}

export interface RazorpayInstance {
    open: () => void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}
