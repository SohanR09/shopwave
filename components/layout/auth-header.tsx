import Link from "next/link"

export default function AuthHeader() {
  return (
    <header className="py-4 px-4 border-b shadow-md z-50">
      <div className="container mx-auto">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-glacier-600">ShopWave</span>
        </Link>
      </div>
    </header>
  )
}

