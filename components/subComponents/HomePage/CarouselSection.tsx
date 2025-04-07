export default function CarouselSection() {
    return (
        <section className="bg-glacier-100 hidden md:block py-10">
            <div className="carousel">
                <div className="carousel-inner">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="carousel-item mr-4">
                            <div className="bg-white p-4 rounded-md flex items-center justify-start gap-4 w-full">
                                <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md">
                                    <img src={`https://placehold.co/300x200?text=image-${index}`} alt="Product" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
