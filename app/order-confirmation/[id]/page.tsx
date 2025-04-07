import OrderDetailsPageWrapper from "@/components/Pages/OrderDetailsPage";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
    return (
        <OrderDetailsPageWrapper
            icon={<CheckCircle className="h-12 w-12 text-green-500" />}
            title="Order Confirmed!"
            description="Thank you for your purchase. Your order has been received and is being processed."
        />
    )
}


