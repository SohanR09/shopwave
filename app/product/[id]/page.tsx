import ProductDetailsPage from "@/components/Pages/ProductDetailsPage"

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params
  return <ProductDetailsPage productId={id} />
}
