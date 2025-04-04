import CategoryPage from "@/components/Pages/CategoryPage"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function Page({ params: { slug } }: CategoryPageProps) {
  return <CategoryPage slug={slug} />
}