import { useMemo } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Compass, Edit3, Heart, HelpCircle, LogOut, MapPin, Plane, Settings2, UserCircle2 } from 'lucide-react';

const tripItems = [
  {
    id: 1,
    title: 'Kampot Trip 2026',
    subtitle: 'Jul 18–20 · 4 travellers · You are the planner',
    icon: Plane,
    status: 'Confirmed',
    statusStyle: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 2,
    title: 'Siem Reap Weekend',
    subtitle: 'Aug 2–3 · 6 travellers',
    icon: Compass,
    status: 'Planning',
    statusStyle: 'bg-amber-50 text-amber-700',
  },
  {
    id: 3,
    title: 'Mondulkiri Forest Trip',
    subtitle: 'Sep 2026 · 3 travellers',
    icon: CalendarDays,
    status: 'Planning',
    statusStyle: 'bg-amber-50 text-amber-700',
  },
];

const savedPlaces = [
  { name: 'Bokor Hill Station', location: 'Kampot Province', emoji: '🏔️' },
  { name: 'Angkor Wat', location: 'Siem Reap', emoji: '🏛️' },
  { name: 'Kampot River', location: 'Kampot', emoji: '🌊' },
  { name: 'Mondulkiri', location: 'Nature · Forest', emoji: '🌿' },
  { name: 'Kep Crab Market', location: 'Kep', emoji: '🦀' },
  { name: 'Koh Rong', location: 'Island · Koh Kong', emoji: '🏖️' },
];

const friends = [
  { name: 'Sreynich', role: 'Travel buddy', initials: 'SN', status: 'Following you' },
  { name: 'Dara', role: 'Weekend explorer', initials: 'DR', status: 'Mutual' },
  { name: 'Mina', role: 'Food & beach lover', initials: 'MN', status: 'Following' },
  { name: 'Rithy', role: 'Nature trip planner', initials: 'RT', status: 'Mutual' },
  { name: 'Kosal', role: 'City break partner', initials: 'KS', status: 'Following you' },
  { name: 'Lina', role: 'Mountain trip fan', initials: 'LN', status: 'Mutual' },
];

function TabButton({ active, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
    >
      {label}
    </button>
  );
}

export default function ProfilePage({ activeTab, onTabChange }) {
  const stats = useMemo(
    () => [
      { value: '12', label: 'Trips planned' },
      { value: '4', label: 'Groups joined' },
      { value: '28', label: 'Saved places' },
      { value: '3', label: 'Times elected planner' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#f7f7f2] pb-12 text-gray-800">
      <div className="h-32 bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-400" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 flex flex-col gap-6 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-800 text-3xl font-semibold text-white">
              SV
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Sophea Vann</h1>
              <p className="mt-1 text-sm text-gray-500">@sopheav · Joined March 2026</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">🧳 12 trips</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">🌍 6 provinces visited</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('settings')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Edit3 size={16} /> Edit profile
          </button>
        </div>

        <p className="mt-6 max-w-3xl text-sm leading-8 text-gray-600">
          Weekend traveler based in Phnom Penh. Always planning the next group trip before the last one even ends. Currently saving for Mondulkiri 🌿
        </p>

        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Friends you follow</p>
              <p className="mt-1 text-sm text-gray-600">You and 18 friends are connected in the travel community.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['SL', 'DT', 'NK', 'MP'].map((initials) => (
                  <div key={initials} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-700 text-[10px] font-semibold text-white">
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-emerald-700">+14 more</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-semibold text-emerald-700">{item.value}</p>
              <p className="mt-1 text-sm text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 rounded-full border border-gray-200 bg-white p-2 shadow-sm">
          <TabButton active={activeTab === 'overview'} label="Overview" value="overview" onClick={onTabChange} />
          <TabButton active={activeTab === 'trips'} label="My Trips" value="trips" onClick={onTabChange} />
          <TabButton active={activeTab === 'friends'} label="Friends" value="friends" onClick={onTabChange} />
          <TabButton active={activeTab === 'saved'} label="Saved Places" value="saved" onClick={onTabChange} />
          <TabButton active={activeTab === 'settings'} label="Settings" value="settings" onClick={onTabChange} />
        </div>

        {activeTab === 'overview' && (
          <div className="mt-6 space-y-3">
            {tripItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.subtitle}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statusStyle}`}>{item.status}</span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="mt-6 space-y-3">
            {tripItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.subtitle}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statusStyle}`}>{item.status}</span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {friends.map((friend) => (
              <div key={friend.name} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
                    {friend.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{friend.name}</p>
                    <p className="text-sm text-gray-500">{friend.role}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {friend.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedPlaces.map((place) => (
              <div key={place.name} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex h-20 items-center justify-center bg-emerald-50 text-3xl">{place.emoji}</div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900">{place.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{place.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Profile information</h2>
                <button type="button" className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  Save changes
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">Full name</span>
                  <input className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" defaultValue="Sophea Vann" />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">Username</span>
                  <input className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" defaultValue="sopheav" />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">Email</span>
                  <input className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" defaultValue="sophea.v@gmail.com" />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">Phone</span>
                  <input className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" defaultValue="+855 12 345 678" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <label className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-emerald-50 p-4 text-sm text-gray-700">
                <span>Email me about new votes in my groups</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              </label>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-rose-700">Danger zone</h2>
              <p className="mt-2 text-sm text-rose-600">Deleting your account removes all your trips, groups, and saved places permanently.</p>
              <button type="button" className="mt-4 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
