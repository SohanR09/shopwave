import SearchPageComponent from "@/components/Pages/SearchPageComponent";

interface SearchPageProps {
  searchParams: {
    q: string
  }
}

export default function SearchPage({ searchParams: { q } }: SearchPageProps) {
  return <SearchPageComponent q={q} />
}
