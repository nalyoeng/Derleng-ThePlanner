import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  DollarSign,
  Heart,
  Sunrise,
  MapPin,
} from "lucide-react";
import ReviewSection from "./ReviewSection";

export default function DestinationPage({
  destinationsList,
  favorites,
  onToggleFav,
  user,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idx, setIdx] = useState(0);

  const dest = destinationsList?.find(
    (item) => String(item.id) === String(id)
  );

  const isFavorite = favorites?.has(dest?.id);

  if (!dest) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center text-[#6B7280] gap-4">
        <p>No destination data found.</p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm font-semibold text-[#0F5132] underline"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const images =
    dest.images && dest.images.length > 0
      ? dest.images
      : [dest.img];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased">
      {/* Top header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#0F5132] transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="transform group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back to Explore</span>
        </button>

        <h1 className="hidden md:block font-serif font-bold text-lg text-[#111827]">
          {dest.name}
        </h1>

        <button
          type="button"
          onClick={() => onToggleFav(dest.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
            isFavorite
              ? "bg-[#F0FDF4] text-[#0F5132] border-[#34D399]"
              : "bg-white text-[#111827] border-gray-200 hover:border-gray-300"
          }`}
        >
          <Heart
            size={14}
            fill={isFavorite ? "#0F5132" : "none"}
            color={isFavorite ? "#0F5132" : "#111827"}
          />

          <span>{isFavorite ? "Saved" : "Save to Trips"}</span>
        </button>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main image */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative h-64 sm:h-96 w-full bg-gray-900">
              <img
                src={images[idx]}
                className="w-full h-full object-cover"
                alt={dest.name}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block text-xs uppercase tracking-wider font-bold text-[#34D399] mb-1">
                  {dest.category} · {dest.location}
                </span>

                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-serif">
                  {dest.name}
                </h2>
              </div>
            </div>

            {/* Image thumbnails */}
            {images.length > 1 && (
              <div className="p-4 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      i === idx
                        ? "border-[#0F5132] scale-95 shadow-sm"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`${dest.name} ${i + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination details */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-1.5 font-bold text-gray-900">
                  <Star
                    size={16}
                    fill="#E8B33D"
                    color="#E8B33D"
                  />

                  <span>{dest.rating}</span>

                  <span className="text-[#6B7280] font-medium">
                    (
                    {dest.reviews >= 1000
                      ? `${(dest.reviews / 1000).toFixed(1)}K`
                      : dest.reviews}{" "}
                    reviews)
                  </span>
                </span>

                <span className="flex items-center gap-1 font-bold text-[#0F5132]">
                  <DollarSign size={15} />
                  <span>${dest.price} / day</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(dest.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F0FDF4] text-[#0F5132]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {dest.highlight && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold bg-[#F0FDF4] text-[#0F5132] border border-[#34D399]/20">
                <Sunrise
                  size={18}
                  className="text-[#34D399]"
                />

                <span>{dest.highlight}</span>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                About destination
              </h3>

              <p className="text-sm md:text-base text-[#111827] leading-relaxed font-normal">
                {dest.description}
              </p>
            </div>
          </div>

          {/* Real Supabase reviews */}
          <ReviewSection
            destinationId={dest.id}
            user={user}
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm sticky top-24">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
              Geographic Location
            </h3>

            <div className="h-32 rounded-2xl border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center text-center px-4 bg-[#F0FDF4]/30">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-2 border border-[#34D399]/20">
                <MapPin
                  size={20}
                  className="text-[#0F5132]"
                />
              </div>

              <span className="text-xs font-bold text-[#0F5132] leading-snug">
                {dest.mapLabel}
              </span>

              <span className="text-[11px] text-[#6B7280] mt-0.5">
                {dest.location}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}