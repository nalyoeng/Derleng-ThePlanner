import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Star, DollarSign, Heart, Sunrise,
  MapPin, Check, ThumbsUp, BadgeCheck
} from "lucide-react";

const COLORS = {
  forest: "#1F3A33",
  mint: "#E3F3EA",
  cream: "#F7F2E9",
  border: "#ECE3D3",
  orange: "#DD6B3B",
  orangeSoft: "#FBE3D5",
  ink: "#23231F",
  muted: "#8A8276",
};

const REVIEWS = [
  { name: "Dara", initials: "DA", color: "#7A4FA0", rating: 5, time: "2 days ago", visited: true, text: "Went up early morning and the fog over the old ruins was unreal. Bring a light jacket — it's noticeably colder at the top than in town.", helpful: 12 },
  { name: "Bopha", initials: "BO", color: "#D9633B", rating: 4, time: "1 week ago", visited: false, text: "Beautiful views but the road up is rough — wouldn't recommend a small scooter. We hired a tuk-tuk driver for the whole half-day and it worked out well.", helpful: 8 },
  { name: "Visal", initials: "VT", color: "#2F6B4F", rating: 5, time: "3 weeks ago", visited: true, text: "Underrated spot. The abandoned church and casino make for great photos. Entry fee was $10 when we went, worth every cent for the views alone.", helpful: 21 },
];

function Avatar({ initials, color, size = 32 }) {
  return (
    <div
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

// dest shape: { name, category, location, rating, reviews, price, highlight,
//               description, tags: [], mapLabel, images: [], img }
export default function DestinationModal({ dest, onClose, fav, onToggleFav }) {
  const [idx, setIdx] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [posted, setPosted] = useState(false);
  const [sort, setSort] = useState("Most recent");

  if (!dest) return null;
  const images = dest.images && dest.images.length ? dest.images : [dest.img];

  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };
  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4" onClick={onClose}>
      <div className="bg-transparent w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        {/* Top card: image + info */}
        <div className="rounded-3xl overflow-hidden bg-white border shadow-xl" style={{ borderColor: COLORS.border }}>
          <div className="relative h-64">
            <img src={images[idx]} className="w-full h-full object-cover" alt={dest.name} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55))" }} />

            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <X size={15} />
            </button>

            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: COLORS.orange }}>
                  <ChevronRight size={16} color="white" />
                </button>
                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === idx ? "white" : "rgba(255,255,255,0.5)" }} />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-3 left-4 right-4">
              <div className="text-[11px] text-white/80 font-medium mb-0.5">{dest.category} · {dest.location}</div>
              <h2 className="text-2xl text-white font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{dest.name}</h2>
            </div>
          </div>

          <div className="p-5" style={{ background: COLORS.cream }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <Star size={14} fill="#E8B33D" color="#E8B33D" /> {dest.rating}{" "}
                  <span style={{ color: COLORS.muted }}>
                    ({dest.reviews >= 1000 ? (dest.reviews / 1000).toFixed(1) + "M" : dest.reviews} reviews)
                  </span>
                </span>
                <span className="flex items-center gap-1 font-medium" style={{ color: COLORS.muted }}>
                  <DollarSign size={13} /> ${dest.price}/day
                </span>
              </div>
              <button
                onClick={onToggleFav}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium"
                style={{ background: fav ? COLORS.mint : "white", color: fav ? COLORS.forest : COLORS.ink, border: `1px solid ${fav ? "transparent" : COLORS.border}` }}
              >
                <Heart size={13} fill={fav ? COLORS.forest : "none"} /> {fav ? "Saved" : "Save"}
              </button>
            </div>

            {dest.highlight && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-sm font-medium" style={{ background: COLORS.orangeSoft, color: COLORS.orange }}>
                <Sunrise size={15} /> {dest.highlight}
              </div>
            )}

            <p className="text-sm mb-4" style={{ color: COLORS.ink }}>{dest.description}</p>

            <div className="grid grid-cols-[1fr_140px] gap-4 items-start">
              <div className="flex flex-wrap gap-2">
                {(dest.tags || []).map((t) => (
                  <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border" style={{ borderColor: COLORS.border }}>{t}</span>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-center mb-1" style={{ color: COLORS.muted }}>LOCATION</div>
                <div
                  className="h-20 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center text-center px-2"
                  style={{ borderColor: COLORS.border, background: COLORS.orangeSoft + "33" }}
                >
                  <MapPin size={16} color={COLORS.orange} />
                  <span className="text-[10px] font-medium mt-1 leading-tight" style={{ color: COLORS.orange }}>{dest.mapLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review composer */}
        <div className="rounded-3xl bg-white border shadow-xl mt-4 p-5" style={{ borderColor: COLORS.border }}>
          <div className="text-[11px] font-semibold tracking-wide" style={{ color: COLORS.orange }}>SHARE YOUR EXPERIENCE</div>
          <h3 className="text-xl font-semibold mt-0.5 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Write a review</h3>

          <div className="text-xs font-medium mb-1.5" style={{ color: COLORS.muted }}>Your rating</div>
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}>
                <Star size={20} fill={(hoverRating || rating) >= n ? "#E8B33D" : "none"} color={(hoverRating || rating) >= n ? "#E8B33D" : "#D8D2C4"} />
              </button>
            ))}
            {!rating && <span className="text-xs ml-2" style={{ color: COLORS.muted }}>Tap to rate</span>}
          </div>

          <div className="text-xs font-medium mb-1.5" style={{ color: COLORS.muted }}>Your comment</div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 400))}
            placeholder="What was the visit like? Any tips for other travellers?"
            className="w-full h-24 p-3 rounded-2xl border text-sm outline-none resize-none"
            style={{ borderColor: COLORS.border, background: COLORS.cream }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: COLORS.muted }}>{comment.length} / 400</span>
            <button
              disabled={!rating || !comment.trim()}
              onClick={() => { setPosted(true); setComment(""); setRating(0); }}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: COLORS.orange }}
            >
              Post review
            </button>
          </div>
          {posted && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: COLORS.forest }}>
              <Check size={12} /> Review posted — thanks for sharing!
            </p>
          )}
        </div>

        {/* Reviews list */}
        <div className="flex items-center justify-between mt-5 mb-2 px-1">
          <span className="text-sm font-semibold" style={{ color: COLORS.ink }}>{REVIEWS.length} reviews</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-full border outline-none"
            style={{ borderColor: COLORS.border, color: COLORS.muted, background: "white" }}
          >
            <option>Most recent</option>
            <option>Most helpful</option>
          </select>
        </div>

        <div className="space-y-3 pb-6">
          {REVIEWS.map((r, i) => (
            <div key={i} className="rounded-2xl bg-white border p-4 shadow-sm" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-3 mb-2">
                <Avatar initials={r.initials} color={r.color} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.name}</span>
                    {r.visited && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: COLORS.mint, color: COLORS.forest }}>
                        <BadgeCheck size={10} /> Visited
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.muted }}>
                    <span className="flex">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={11} fill={s < r.rating ? "#E8B33D" : "none"} color={s < r.rating ? "#E8B33D" : "#D8D2C4"} />
                      ))}
                    </span>
                    · {r.time}
                  </div>
                </div>
              </div>
              <p className="text-sm mb-2" style={{ color: COLORS.ink }}>{r.text}</p>
              <div className="flex items-center gap-4 text-xs" style={{ color: COLORS.muted }}>
                <span className="flex items-center gap-1"><ThumbsUp size={12} /> {r.helpful} helpful</span>
                <span className="font-medium cursor-pointer">Reply</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}