import AdminCustomersDetailsPage from "@/components/Pages/AdminCustomersDetailsPage";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params
  return <AdminCustomersDetailsPage idParam={id} />
}

