import ProductsPage from "@/components/Pages/ProductsPage"

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
        <ProductsPage searchParams={searchParams} />
    )
}
