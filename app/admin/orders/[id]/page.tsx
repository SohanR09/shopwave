import AdminOrderDetailsPage from "@/components/Pages/AdminOrderDetailsPage"

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params
  return (
    <AdminOrderDetailsPage idParam={id} />
  )
}
