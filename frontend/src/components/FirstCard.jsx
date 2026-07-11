import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  MapPin,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function FirstCard({ destinations = [] }) {
  const navigate = useNavigate()
  const [destination, setDestination] = useState(null)
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    if (!destinations.length) {
      setDestination(null)
      return
    }

    const randomIndex = Math.floor(
      Math.random() * destinations.length
    )

    setDestination(destinations[randomIndex])
    setImageIndex(0)
  }, [destinations])

  const galleryImages = useMemo(() => {
    if (!destination) return []

    const images = [
      ...(Array.isArray(destination.images)
        ? destination.images
        : []),
      destination.image_url,
      destination.img,
    ].filter(
      (image, index, array) =>
        image && array.indexOf(image) === index
    )

    return images.length
      ? images
      : ['/Angkorwat-fristcard.jpg']
  }, [destination])

  if (!destination) {
    return (
      <section className="w-full px-6 py-4">
        <div className="flex min-h-[340px] items-center justify-center rounded-2xl bg-[#0F5132] px-6">
          <p className="text-center text-white">
            No destinations are available.
          </p>
        </div>
      </section>
    )
  }

  const currentImage = galleryImages[imageIndex]

  const previousImage = () => {
    setImageIndex((current) =>
      current === 0
        ? galleryImages.length - 1
        : current - 1
    )
  }

  const nextImage = () => {
    setImageIndex((current) =>
      current === galleryImages.length - 1
        ? 0
        : current + 1
    )
  }

  const description =
    destination.short_description ||
    destination.description ||
    'Discover a beautiful destination in Cambodia.'

  const reviewCount =
    destination.reviews_count ||
    destination.review_count ||
    destination.reviews ||
    0

  return (
    <section className="w-full px-6 py-4">
      <div
        className="relative flex min-h-[340px] w-full flex-col justify-center overflow-hidden rounded-2xl bg-cover bg-center px-8 transition-all duration-500 md:min-h-[400px] md:px-16"
        style={{
          backgroundImage: `url("${currentImage}")`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/70 md:left-5"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/70 md:right-5"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="relative z-10 flex max-w-2xl flex-col items-start gap-4 text-white">
          <div className="flex items-center gap-1.5 rounded-full bg-[#D1FAE5] px-4 py-1.5 text-xs font-semibold text-[#065F46] shadow-sm">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Featured destination</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase text-gray-200">
            {destination.category && (
              <span>{destination.category}</span>
            )}

            {destination.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {destination.location}
              </span>
            )}

            {destination.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star
                  size={13}
                  fill="#FBBF24"
                  color="#FBBF24"
                />
                {destination.rating}
                {reviewCount > 0 && (
                  <span>({reviewCount} reviews)</span>
                )}
              </span>
            )}
          </div>

          <h1 className="max-w-xl font-['Playfair_Display'] text-4xl font-semibold leading-[1.15] tracking-wide text-[#F9F6F0] drop-shadow-sm md:text-6xl">
            {destination.name}
          </h1>

          <p className="max-w-lg text-sm font-light leading-relaxed tracking-wide text-gray-200 md:text-base">
            {description}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(`/destination/${destination.id}`)
            }
            className="mt-2 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0F5132] transition-colors hover:bg-[#D1FAE5]"
          >
            Explore destination
            <ArrowRight size={16} />
          </button>
        </div>

        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={`Show image ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  imageIndex === index
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}