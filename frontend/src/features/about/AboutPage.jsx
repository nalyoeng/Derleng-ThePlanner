import { Compass, Sparkles, ShieldCheck, Users, HeartHandshake, MapPin, MessageSquare, CalendarDays } from 'lucide-react';

const values = [
  {
    title: 'Plan together',
    description: 'Turn scattered ideas into one clear itinerary with shared polls, notes, and favorites.',
    icon: Users,
  },
  {
    title: 'Explore with confidence',
    description: 'Discover places that fit your mood, budget, and travel style without the usual guesswork.',
    icon: Compass,
  },
  {
    title: 'Stay organized',
    description: 'Keep your trip details, reminders, and must-see stops beautifully grouped in one place.',
    icon: CalendarDays,
  },
  {
    title: 'Travel safely',
    description: 'We focus on trusted destinations and simple, transparent planning tools you can rely on.',
    icon: ShieldCheck,
  },
];

const team = [
  { name: 'Naly', role: 'Founder & Product', bio: 'Turns travel ideas into simple, joyful experiences.' },
  { name: 'Xing', role: 'Lead Engineer', bio: 'Builds the tools that keep every trip plan running smoothly.' },
  { name: 'Hong', role: 'Design Lead', bio: 'Shapes the warm, modern experience across the platform.' },
 
];

const milestones = [
  { year: '2024', title: 'The idea', description: 'A small group trip sparked the vision for a calmer, clearer planning experience.' },
  { year: '2025', title: 'Growing community', description: 'More travelers joined, and the platform evolved around real group needs.' },
  { year: '2026', title: 'Built for everyday adventures', description: 'We expanded the experience to support quick weekend getaways and big journeys alike.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f2] text-gray-800">
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-emerald-100">
              <Sparkles size={16} />
              About Der Leng
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Planning a trip should feel exciting, not chaotic.
            </h1>
            <p className="mt-4 text-lg leading-8 text-emerald-50/90">
              Der Leng brings together destination inspiration, shared decisions, and trip organization so your group can move from ideas to plans without the usual confusion.
            </p>
          </div>

          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/20 p-3">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-100">Made for travelers</p>
                <p className="text-xl font-semibold">From weekend escapes to dream journeys</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-emerald-50/90">
              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-3">
                <MessageSquare size={16} className="mt-0.5" />
                <span>Share ideas, vote on favorites, and keep everyone in the loop.</span>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-3">
                <HeartHandshake size={16} className="mt-0.5" />
                <span>Save places you love and revisit them whenever your next trip begins.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Why we started</p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">Group travel deserves a calmer way to plan.</h2>
            <p className="mt-4 text-base leading-8 text-gray-600">
              We noticed that planning a trip together often meant juggling chats, notes, and half-finished spreadsheets. Der Leng was created to bring all of that into one shared space that feels simple, beautiful, and useful.
            </p>
            <p className="mt-4 text-base leading-8 text-gray-600">
              Whether you are organizing a quick weekend escape or a full family vacation, the goal is the same: make the planning part feel lighter so the trip itself can feel more memorable.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white">
                <Compass size={18} />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">A place for every journey</p>
                <p className="text-sm text-gray-600">We help you discover, decide, and enjoy.</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Discover inspiring destinations</p>
                <p className="mt-1 text-sm text-gray-600">Browse curated places that match your travel mood.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Build a plan together</p>
                <p className="mt-1 text-sm text-gray-600">Gather opinions, compare ideas, and agree on what matters most.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">What we believe</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900">Simple tools, thoughtful travel.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Our journey</p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">A growing platform for real travelers.</h2>
            <div className="mt-8 space-y-6">
              {milestones.map((item) => (
                <div key={item.year} className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{item.year}</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Meet the team</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {team.map((person) => (
                <div key={person.name} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {person.name.charAt(0)}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{person.name}</h3>
                  <p className="mt-1 text-sm font-medium text-emerald-600">{person.role}</p>
                  <p className="mt-2 text-sm leading-7 text-gray-600">{person.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14 lg:px-8">
        <div className="rounded-[2rem] bg-emerald-900 px-8 py-10 text-center text-white shadow-xl sm:px-10">
          <h2 className="text-3xl font-semibold">Ready to plan your next adventure?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-emerald-100">
            Start with a destination, build your shared plan, and make the trip feel effortless from the very first idea.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="rounded-full bg-emerald-400 px-5 py-2.5 font-semibold text-emerald-950 transition hover:bg-emerald-300">
              Start planning
            </button>
            <button className="rounded-full border border-white/25 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10">
              View destinations
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
