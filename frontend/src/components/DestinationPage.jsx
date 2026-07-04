import React, { useState } from "react";
import {
  ArrowLeft, Star, DollarSign, Heart, Sunrise,
  MapPin, Check, ThumbsUp, BadgeCheck, MessageSquare
} from "lucide-react";

const REVIEWS = [
  { name: "Dara", initials: "DA", color: "#7A4FA0", rating: 5, time: "2 days ago", visited: true, text: "Went up early morning and the fog over the old ruins was unreal. Bring a light jacket — it's noticeably colder at the top than in town.", helpful: 12 },
  { name: "Bopha", initials: "BO", color: "#D9633B", rating: 4, time: "1 week ago", visited: false, text: "Beautiful views but the road up is rough — wouldn't recommend a small scooter. We hired a tuk-tuk driver for the whole half-day and it worked out well.", helpful: 8 },
  { name: "Visal", initials: "VT", color: "#2F6B4F", rating: 5, time: "3 weeks ago", visited: true, text: "Underrated spot. The abandoned church and casino make for great photos. Entry fee was $10 when we went, worth every cent for the views alone.", helpful: 21 },
];

function Avatar({ initials, color, size = 32 }) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.36 }}
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

export default function DestinationPage({ dest, onBack, fav, onToggleFav }) {
  const [idx, setIdx] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [posted, setPosted] = useState(false);
  const [sort, setSort] = useState("Most recent");

  if (!dest) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center text-[#6B7280]">
        No destination data provided.
      </div>
    );
  }

  const images = dest.images && dest.images.length ? dest.images : [dest.img];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans antialiased">
      
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#0F5132] transition-colors group"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Explore</span>
        </button>
        <h1 className="hidden md:block font-['Playfair_Display'] font-bold text-lg text-[#111827]">
          {dest.name}
        </h1>
        <button
          onClick={onToggleFav}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
            fav 
              ? 'bg-[#F0FDF4] text-[#0F5132] border-[#34D399]' 
              : 'bg-white text-[#111827] border-gray-200 hover:border-gray-300'
          }`}
        >
          <Heart size={14} fill={fav ? "#0F5132" : "none"} color={fav ? "#0F5132" : "#111827"} />
          <span>{fav ? "Saved" : "Save to Trips"}</span>
        </button>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Media, Info, details) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main Visual Display Block */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative h-64 sm:h-96 w-full bg-gray-900">
              <img src={images[idx]} className="w-full h-full object-cover" alt={dest.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Bottom Title Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block text-xs uppercase tracking-wider font-bold text-[#34D399] mb-1">
                  {dest.category} · {dest.location}
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-['Playfair_Display']">
                  {dest.name}
                </h2>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {images.length > 1 && (
              <div className="p-4 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      i === idx ? 'border-[#0F5132] scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Info Details Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1.5 font-bold text-gray-900">
                  <Star size={16} fill="#E8B33D" color="#E8B33D" /> 
                  <span>{dest.rating}</span>
                  <span className="text-[#6B7280] font-medium">
                    ({dest.reviews >= 1000 ? (dest.reviews / 1000).toFixed(1) + "K" : dest.reviews} reviews)
                  </span>
                </span>
                <span className="flex items-center gap-1 font-bold text-[#0F5132]">
                  <DollarSign size={15} />
                  <span>${dest.price} / day</span>
                </span>
              </div>

              {/* Tags Strip */}
              <div className="flex flex-wrap gap-1.5">
                {(dest.tags || []).map((t) => (
                  <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F0FDF4] text-[#0F5132]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {dest.highlight && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold bg-[#F0FDF4] text-[#0F5132] border border-[#34D399]/20">
                <Sunrise size={18} className="text-[#34D399]" /> 
                <span>{dest.highlight}</span>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">About destination</h3>
              <p className="text-sm md:text-base text-[#111827] leading-relaxed font-normal">{dest.description}</p>
            </div>
          </div>

          {/* Embedded Reviews List Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-lg text-[#111827] flex items-center gap-2">
                <MessageSquare size={18} className="text-[#0F5132]" />
                <span>Community Logs ({REVIEWS.length})</span>
              </h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 outline-none bg-white text-[#6B7280] hover:border-gray-300 transition-colors"
              >
                <option>Most recent</option>
                <option>Most helpful</option>
              </select>
            </div>

            <div className="space-y-3">
              {REVIEWS.map((r, i) => (
                <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar initials={r.initials} color={r.color} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#111827]">{r.name}</span>
                        {r.visited && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 bg-[#F0FDF4] text-[#0F5132]">
                            <BadgeCheck size={11} className="text-[#34D399]" /> Visited
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                        <span className="flex">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={11} fill={s < r.rating ? "#E8B33D" : "none"} color={s < r.rating ? "#E8B33D" : "#E5E7EB"} />
                          ))}
                        </span>
                        <span>·</span>
                        <span>{r.time}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#111827] leading-relaxed mb-3">{r.text}</p>
                  <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-1 border-t border-gray-50">
                    <button className="flex items-center gap-1 hover:text-[#0F5132] font-medium transition-colors">
                      <ThumbsUp size={13} /> 
                      <span>{r.helpful} helpful</span>
                    </button>
                    <button className="font-semibold hover:text-[#0F5132] transition-colors">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sticky Sidebar Column (Location Map & Composer) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Location / Navigation Mini Widget */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Geographic Location</h3>
            <div className="h-32 rounded-2xl border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center text-center px-4 bg-[#F0FDF4]/30">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-2 border border-[#34D399]/20">
                <MapPin size={20} className="text-[#0F5132]" />
              </div>
              <span className="text-xs font-bold text-[#0F5132] leading-snug">{dest.mapLabel}</span>
              <span className="text-[11px] text-[#6B7280] mt-0.5">{dest.location}</span>
            </div>
          </div>

          {/* Floating Review Composer Form */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm sticky top-24">
            <span className="block text-[10px] font-bold tracking-wider text-[#0F5132] uppercase mb-1">
              Share Your Experience
            </span>
            <h3 className="text-lg font-bold text-[#111827] mb-4 font-['Playfair_Display']">
              Write a review
            </h3>

            <div className="text-xs font-bold text-[#6B7280] mb-1.5">Your rating</div>
            <div className="flex items-center gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button 
                  key={n} 
                  onClick={() => setRating(n)} 
                  onMouseEnter={() => setHoverRating(n)} 
                  onMouseLeave={() => setHoverRating(0)}
                  type="button"
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    size={22} 
                    fill={(hoverRating || rating) >= n ? "#E8B33D" : "none"} 
                    color={(hoverRating || rating) >= n ? "#E8B33D" : "#E5E7EB"} 
                  />
                </button>
              ))}
              {!rating && <span className="text-xs text-[#6B7280] ml-1 font-medium">Tap to rate</span>}
            </div>

            <div className="text-xs font-bold text-[#6B7280] mb-1.5">Your comment</div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 400))}
              placeholder="What was the visit like? Any tips for other travellers?"
              className="w-full h-28 p-3 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] transition-all bg-[#F9FAFB]"
            />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[#6B7280] font-medium">{comment.length} / 400</span>
              <button
                disabled={!rating || !comment.trim()}
                onClick={() => { setPosted(true); setComment(""); setRating(0); }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F5132] hover:bg-[#0B3D25] disabled:opacity-40 disabled:hover:bg-[#0F5132] transition-colors shadow-sm"
              >
                Post Review
              </button>
            </div>

            {posted && (
              <div className="text-xs mt-3 p-3 rounded-xl bg-[#F0FDF4] border border-[#34D399]/30 text-[#0F5132] flex items-center gap-1.5 font-medium animate-fadeIn">
                <Check size={14} className="text-[#34D399] shrink-0" /> 
                <span>Review posted — thanks for sharing!</span>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}