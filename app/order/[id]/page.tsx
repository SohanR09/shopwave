import OrderDetailsPageWrapper from "@/components/Pages/OrderDetailsPage";
import { List } from "lucide-react";

export default async function Page({ params }: { params: { id: string } }) {
    return (
        <OrderDetailsPageWrapper
            idParam={params.id}
            icon={<List className="h-12 w-12 text-glacier-500" />}
            title="Order Details"
            description="View your order details"
        />
    )
}

