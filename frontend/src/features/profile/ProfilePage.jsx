import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Compass,
  Edit3,
  Heart,
  Plane,
} from 'lucide-react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import { profileApi } from '../../lib/profileApi'
import { supabase } from '../../lib/supabaseClient'

const ALLOWED_TABS = [
  'overview',
  'trips',
  'friends',
  'saved',
  'settings',
]

const tripItems = [
  {
    id: 1,
    title: 'Kampot Trip 2026',
    subtitle:
      'Jul 18–20 · 4 travellers · You are the planner',
    icon: Plane,
    status: 'Confirmed',
    statusStyle:
      'bg-emerald-50 text-emerald-700',
  },
  {
    id: 2,
    title: 'Siem Reap Weekend',
    subtitle: 'Aug 2–3 · 6 travellers',
    icon: Compass,
    status: 'Planning',
    statusStyle:
      'bg-amber-50 text-amber-700',
  },
  {
    id: 3,
    title: 'Mondulkiri Forest Trip',
    subtitle: 'Sep 2026 · 3 travellers',
    icon: CalendarDays,
    status: 'Planning',
    statusStyle:
      'bg-amber-50 text-amber-700',
  },
]

const friends = [
  {
    name: 'Sreynich',
    role: 'Travel buddy',
    initials: 'SN',
    status: 'Following you',
  },
  {
    name: 'Dara',
    role: 'Weekend explorer',
    initials: 'DR',
    status: 'Mutual',
  },
  {
    name: 'Mina',
    role: 'Food & beach lover',
    initials: 'MN',
    status: 'Following',
  },
  {
    name: 'Rithy',
    role: 'Nature trip planner',
    initials: 'RT',
    status: 'Mutual',
  },
  {
    name: 'Kosal',
    role: 'City break partner',
    initials: 'KS',
    status: 'Following you',
  },
  {
    name: 'Lina',
    role: 'Mountain trip fan',
    initials: 'LN',
    status: 'Mutual',
  },
]

function TabButton({
  active,
  label,
  value,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
    >
      {label}
    </button>
  )
}

function getFirstImage(place) {
  if (place?.image_url) {
    return place.image_url
  }

  if (Array.isArray(place?.images)) {
    return place.images[0] || ''
  }

  if (typeof place?.images === 'string') {
    try {
      const parsed = JSON.parse(place.images)

      if (Array.isArray(parsed)) {
        return parsed[0] || ''
      }
    } catch {
      return place.images
    }
  }

  return ''
}

function createInitials(name) {
  return String(name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfilePage({ user }) {
  const [searchParams, setSearchParams] =
    useSearchParams()

  const requestedTab =
    searchParams.get('tab') || 'overview'

  const activeTab = ALLOWED_TABS.includes(
    requestedTab
  )
    ? requestedTab
    : 'overview'

  const [profile, setProfile] = useState(null)

  const [profileLoading, setProfileLoading] =
    useState(true)

  const [profileError, setProfileError] =
    useState('')

  const [savedPlaces, setSavedPlaces] =
    useState([])

  const [savedLoading, setSavedLoading] =
    useState(true)

  const [savedError, setSavedError] =
    useState('')

  const [saveState, setSaveState] =
    useState('idle')

  const [settingsForm, setSettingsForm] =
    useState({
      full_name: '',
      username: '',
      email: '',
      phone: '',
      bio: '',
      avatar_url: '',
    })

  const onTabChange = (value) => {
    setSearchParams({
      tab: value,
    })
  }

  /*
   * Load profile through Express:
   * GET /api/profile/me
   */
  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      if (!user?.id) {
        if (active) {
          setProfile(null)
          setProfileLoading(false)
          setProfileError(
            'No logged-in user was found.'
          )
        }

        return
      }

      try {
        setProfileLoading(true)
        setProfileError('')

        const result = await profileApi.getMe()
        const data = result?.data

        if (!active) return

        if (!data) {
          throw new Error(
            'Profile information was not returned.'
          )
        }

        setProfile(data)

        setSettingsForm({
          full_name: data.full_name || '',
          username: data.username || '',
          email:
            data.email ||
            user.email ||
            '',
          phone: data.phone || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        })
      } catch (error) {
        if (!active) return

        console.error(
          'Load profile error:',
          error
        )

        setProfile(null)

        setProfileError(
          error.response?.data?.message ||
            error.message ||
            'Could not load profile.'
        )
      } finally {
        if (active) {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [user?.id, user?.email])

  /*
   * Saved places continue using the existing
   * favorites table in Supabase.
   */
  useEffect(() => {
    let active = true

    const loadSavedPlaces = async () => {
      if (!user?.id) {
        if (active) {
          setSavedPlaces([])
          setSavedLoading(false)
          setSavedError('')
        }

        return
      }

      try {
        setSavedLoading(true)
        setSavedError('')

        const {
          data,
          error,
        } = await supabase
          .from('favorites')
          .select(`
            destination_id,
            created_at,
            destinations (
              id,
              name,
              location,
              categories,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', {
            ascending: false,
          })

        if (!active) return

        if (error) {
          throw error
        }

        const places = (data || [])
          .map((item) => {
            if (
              Array.isArray(item.destinations)
            ) {
              return item.destinations[0]
            }

            return item.destinations
          })
          .filter(Boolean)

        setSavedPlaces(places)
      } catch (error) {
        if (!active) return

        console.error(
          'Saved places error:',
          error
        )

        setSavedPlaces([])

        setSavedError(
          error.message ||
            'Could not load saved places.'
        )
      } finally {
        if (active) {
          setSavedLoading(false)
        }
      }
    }

    loadSavedPlaces()

    return () => {
      active = false
    }
  }, [user?.id])

  const stats = useMemo(
    () => [
      {
        value: String(tripItems.length),
        label: 'Trips planned',
      },
      {
        value: '0',
        label: 'Groups joined',
      },
      {
        value: String(savedPlaces.length),
        label: 'Saved places',
      },
      {
        value: '0',
        label: 'Times elected planner',
      },
    ],
    [savedPlaces.length]
  )

  const updateField = (key) => (event) => {
    setSettingsForm((previous) => ({
      ...previous,
      [key]: event.target.value,
    }))
  }

  /*
   * Save profile through Express:
   * PATCH /api/profile/me
   */
  const handleSaveChanges = async () => {
    if (!user?.id || saveState === 'saving') {
      return
    }

    const fullName =
      settingsForm.full_name.trim()

    if (!fullName) {
      setProfileError(
        'Full name is required.'
      )
      return
    }

    try {
      setSaveState('saving')
      setProfileError('')

      const result =
        await profileApi.updateMe({
          full_name: fullName,
          phone: settingsForm.phone.trim(),
          bio: settingsForm.bio.trim(),
          avatar_url:
            settingsForm.avatar_url.trim() ||
            null,
        })

      const data = result?.data

      if (!data) {
        throw new Error(
          'Updated profile information was not returned.'
        )
      }

      setProfile(data)

      setSettingsForm((previous) => ({
        ...previous,
        full_name: data.full_name || '',
        username: data.username || '',
        email:
          data.email ||
          user.email ||
          '',
        phone: data.phone || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
      }))

      setSaveState('saved')

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2000)
    } catch (error) {
      console.error(
        'Save profile error:',
        error
      )

      setProfileError(
        error.response?.data?.message ||
          error.message ||
          'Could not update profile.'
      )

      setSaveState('error')
    }
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    'User'

  const displayUsername =
    profile?.username ||
    user?.user_metadata?.username ||
    'guest'

  const displayInitials =
    profile?.initials ||
    createInitials(displayName)

  const displayBio =
    profile?.bio ||
    'Tell other travelers something about yourself.'

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f2]">
        <p className="text-gray-500">
          Loading profile...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] pb-12 text-gray-800">
      <div className="h-32 bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-400" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="-mt-12 flex flex-col gap-6 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-24 w-24 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-800 text-3xl font-semibold text-white">
                {displayInitials}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                {displayName}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                @{displayUsername}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  🧳 {tripItems.length} trips
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ❤️ {savedPlaces.length} saved
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onTabChange('settings')
            }
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Edit3 size={16} />
            Edit profile
          </button>
        </div>

        {profileError &&
          activeTab !== 'settings' && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {profileError}
            </div>
          )}

        <p className="mt-6 max-w-3xl text-sm leading-8 text-gray-600">
          {displayBio}
        </p>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-2xl font-semibold text-emerald-700">
                {item.value}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <TabButton
            active={activeTab === 'overview'}
            label="Overview"
            value="overview"
            onClick={onTabChange}
          />

          <TabButton
            active={activeTab === 'trips'}
            label="My Trips"
            value="trips"
            onClick={onTabChange}
          />

          <TabButton
            active={activeTab === 'friends'}
            label="Friends"
            value="friends"
            onClick={onTabChange}
          />

          <TabButton
            active={activeTab === 'saved'}
            label="Saved Places"
            value="saved"
            onClick={onTabChange}
          />

          <TabButton
            active={activeTab === 'settings'}
            label="Settings"
            value="settings"
            onClick={onTabChange}
          />
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-3">
            {tripItems
              .slice(0, 2)
              .map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon size={20} />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.subtitle}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statusStyle}`}
                    >
                      {item.status}
                    </span>
                  </div>
                )
              })}
          </div>
        )}

        {/* Trips tab */}
        {activeTab === 'trips' && (
          <div className="mt-6 space-y-3">
            {tripItems.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon size={20} />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.subtitle}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statusStyle}`}
                  >
                    {item.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Friends tab */}
        {activeTab === 'friends' && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {friends.map((friend) => (
              <div
                key={friend.name}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
                    {friend.initials}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {friend.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {friend.role}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {friend.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Saved places tab */}
        {activeTab === 'saved' && (
          <div className="mt-6">
            {savedLoading ? (
              <p className="text-sm text-gray-500">
                Loading saved places...
              </p>
            ) : savedError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                Could not load saved places:{' '}
                {savedError}
              </div>
            ) : savedPlaces.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <Heart
                  className="mx-auto text-gray-300"
                  size={32}
                />

                <p className="mt-3 font-semibold text-gray-800">
                  No saved places yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Save a destination and it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {savedPlaces.map((place) => {
                  const image =
                    getFirstImage(place)

                  return (
                    <Link
                      key={place.id}
                      to={`/destination/${place.id}`}
                      className="block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={place.name}
                          loading="lazy"
                          decoding="async"
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center bg-emerald-50 text-3xl">
                          📍
                        </div>
                      )}

                      <div className="p-4">
                        <p className="font-semibold text-gray-900">
                          {place.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {place.location}
                        </p>

                        {Array.isArray(
                          place.categories
                        ) &&
                          place.categories.length >
                            0 && (
                            <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {
                                place
                                  .categories[0]
                              }
                            </span>
                          )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile information
                </h2>

                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={
                    saveState === 'saving'
                  }
                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveState === 'saving'
                    ? 'Saving...'
                    : saveState === 'saved'
                      ? 'Saved ✓'
                      : 'Save changes'}
                </button>
              </div>

              {saveState === 'error' && (
                <p className="mt-3 text-sm text-rose-600">
                  Something went wrong while saving.
                </p>
              )}

              {profileError && (
                <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
                  {profileError}
                </p>
              )}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">
                    Full name
                  </span>

                  <input
                    value={settingsForm.full_name}
                    onChange={updateField(
                      'full_name'
                    )}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </label>

                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">
                    Username
                  </span>

                  <input
                    value={settingsForm.username}
                    readOnly
                    title="Username cannot be changed"
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-400"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Your username cannot be changed.
                  </p>
                </label>

                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">
                    Email
                  </span>

                  <input
                    value={settingsForm.email}
                    readOnly
                    title="Changing email requires verification"
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-400"
                  />
                </label>

                <label className="text-sm text-gray-600">
                  <span className="mb-2 block font-medium">
                    Phone
                  </span>

                  <input
                    value={settingsForm.phone}
                    onChange={updateField('phone')}
                    placeholder="+855 12 345 678"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
                  />
                </label>

                <label className="text-sm text-gray-600 md:col-span-2">
                  <span className="mb-2 block font-medium">
                    Profile picture URL
                  </span>

                  <input
                    type="url"
                    value={settingsForm.avatar_url}
                    onChange={updateField(
                      'avatar_url'
                    )}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Paste a direct link to your profile image.
                  </p>
                </label>

                <label className="text-sm text-gray-600 md:col-span-2">
                  <span className="mb-2 block font-medium">
                    About me
                  </span>

                  <textarea
                    rows={4}
                    maxLength={300}
                    value={settingsForm.bio}
                    onChange={updateField('bio')}
                    placeholder="Tell other travelers about yourself..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
                  />

                  <span className="mt-1 block text-xs text-gray-400">
                    {settingsForm.bio.length} / 300
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>

              <label className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-emerald-50 p-4 text-sm text-gray-700">
                <span>
                  Email me about new votes in my groups
                </span>

                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-rose-700">
                Danger zone
              </h2>

              <p className="mt-2 text-sm text-rose-600">
                Account deletion is not connected yet.
              </p>

              <button
                type="button"
                disabled
                className="mt-4 cursor-not-allowed rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-400 opacity-70"
              >
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}