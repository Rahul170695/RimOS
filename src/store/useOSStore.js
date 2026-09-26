import { create } from 'zustand'
import {
  achievementCatalog,
  createAchievementSnapshot,
  evaluateAchievementProgress,
} from '../data/achievements.js'

const initialWindows = []
const DEFAULT_WINDOW_SIZE = { width: 680, height: 440 }
const PLAYLIST_WINDOW_SIZE = { width: 430, height: 620 }
const MILESTONES_WINDOW_SIZE = { width: 860, height: 640 }
const QUEST_WINDOW_SIZE = { width: 640, height: 620 }
const MEMORIES_WINDOW_SIZE = { width: 880, height: 640 }
const SNACK_WINDOW_SIZE = { width: 680, height: 620 }
const initialActivity = {
  appLaunchCounts: {},
  memoryJarPulls: 0,
  snackSpins: 0,
  bestKannadaQuizScore: 0,
  kannadaBestStreak: 0,
  surpriseReveals: 0,
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function withAchievementUnlocks(state, partial) {
  const mergedState = { ...state, ...partial }
  const snapshot = createAchievementSnapshot(mergedState)
  let unlockMap = state.achievementUnlocks
  let hasNewUnlock = false

  achievementCatalog.forEach((achievement) => {
    const progress = evaluateAchievementProgress(achievement.id, snapshot)
    if (!progress.unlocked || unlockMap[achievement.id]) {
      return
    }

    if (!hasNewUnlock) {
      unlockMap = { ...unlockMap }
      hasNewUnlock = true
    }

    unlockMap[achievement.id] = new Date().toISOString()
  })

  if (!hasNewUnlock) {
    return partial
  }

  return {
    ...partial,
    achievementUnlocks: unlockMap,
  }
}

export const useOSStore = create((set) => ({
  phase: 'boot',
  windows: initialWindows,
  zCounter: 1,
  surpriseOpen: false,
  hiddenUnlocked: false,
  questSolved: false,
  questNickname: '',
  activity: initialActivity,
  achievementUnlocks: {},
  claimedRewards: {},

  setPhase: (phase) => set({ phase }),
  unlockSystem: () => set({ phase: 'desktop' }),

  openApp: (appId) =>
    set((state) => {
      const nextActivity = {
        ...state.activity,
        appLaunchCounts: {
          ...state.activity.appLaunchCounts,
          [appId]: (state.activity.appLaunchCounts[appId] ?? 0) + 1,
        },
      }
      const existing = state.windows.find((windowItem) => windowItem.appId === appId)

      if (existing) {
        const nextZ = state.zCounter + 1
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900
        const desktopHeight = Math.max(360, viewportHeight - 106)
        const shouldExpandMilestones = appId === 'achievements'
        const width = shouldExpandMilestones
          ? Math.min(MILESTONES_WINDOW_SIZE.width, Math.max(380, viewportWidth - 40))
          : existing.width
        const height = shouldExpandMilestones
          ? Math.min(MILESTONES_WINDOW_SIZE.height, Math.max(320, viewportHeight - 140))
          : existing.height

        return withAchievementUnlocks(state, {
          zCounter: nextZ,
          activity: nextActivity,
          windows: state.windows.map((windowItem) =>
            windowItem.appId === appId
              ? {
                  ...windowItem,
                  minimized: false,
                  z: nextZ,
                  width,
                  height,
                  x: shouldExpandMilestones
                    ? clamp(Math.round((viewportWidth - width) / 2), 12, Math.max(12, viewportWidth - width - 24))
                    : windowItem.x,
                  y: shouldExpandMilestones
                    ? clamp(24, 10, Math.max(10, desktopHeight - height - 12))
                    : windowItem.y,
                }
              : windowItem,
          ),
        })
      }

      const nextZ = state.zCounter + 1
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900
      const desktopHeight = Math.max(360, viewportHeight - 106)

      const preferredSize =
        appId === 'playlist'
          ? PLAYLIST_WINDOW_SIZE
          : appId === 'achievements'
            ? MILESTONES_WINDOW_SIZE
            : appId === 'birthday-quest'
              ? QUEST_WINDOW_SIZE
              : appId === 'memories'
                ? MEMORIES_WINDOW_SIZE
                : appId === 'snack-roulette'
                  ? SNACK_WINDOW_SIZE
                  : DEFAULT_WINDOW_SIZE
      const width = Math.min(preferredSize.width, Math.max(380, viewportWidth - 40))
      const height = Math.min(preferredSize.height, Math.max(320, viewportHeight - 140))

      const centerAligned =
        appId === 'playlist' ||
        appId === 'achievements' ||
        appId === 'birthday-quest' ||
        appId === 'memories' ||
        appId === 'snack-roulette'
      const xBase = centerAligned ? Math.round((viewportWidth - width) / 2) : 110
      const yBase = appId === 'playlist' ? 12 : centerAligned ? 24 : 56
      const x = clamp(
        xBase + state.windows.length * 18,
        12,
        Math.max(12, viewportWidth - width - 24),
      )
      const y = clamp(
        yBase + state.windows.length * 12,
        10,
        Math.max(10, desktopHeight - height - 12),
      )

      return withAchievementUnlocks(state, {
        zCounter: nextZ,
        activity: nextActivity,
        windows: [
          ...state.windows,
          {
            appId,
            z: nextZ,
            x,
            y,
            width,
            height,
            minimized: false,
          },
        ],
      })
    }),

  focusApp: (appId) =>
    set((state) => {
      const nextZ = state.zCounter + 1
      return {
        zCounter: nextZ,
        windows: state.windows.map((windowItem) =>
          windowItem.appId === appId ? { ...windowItem, z: nextZ } : windowItem,
        ),
      }
    }),

  closeApp: (appId) =>
    set((state) => ({
      windows: state.windows.filter((windowItem) => windowItem.appId !== appId),
    })),

  minimizeApp: (appId) =>
    set((state) => ({
      windows: state.windows.map((windowItem) =>
        windowItem.appId === appId ? { ...windowItem, minimized: true } : windowItem,
      ),
    })),

  updateBounds: (appId, nextBounds) =>
    set((state) => ({
      windows: state.windows.map((windowItem) =>
        windowItem.appId === appId ? { ...windowItem, ...nextBounds } : windowItem,
      ),
    })),

  revealSurprise: () =>
    set((state) => {
      const partial = {
        surpriseOpen: true,
        activity: {
          ...state.activity,
          surpriseReveals: state.activity.surpriseReveals + 1,
        },
      }
      return withAchievementUnlocks(state, partial)
    }),

  closeSurprise: () => set({ surpriseOpen: false }),

  unlockHiddenApp: () =>
    set((state) => withAchievementUnlocks(state, { hiddenUnlocked: true })),

  solveQuest: (nickname) =>
    set((state) => {
      const partial = {
        questSolved: true,
        questNickname: nickname,
        surpriseOpen: true,
        activity: {
          ...state.activity,
          surpriseReveals: state.activity.surpriseReveals + 1,
        },
      }
      return withAchievementUnlocks(state, partial)
    }),

  trackMemoryJarPull: () =>
    set((state) => {
      const partial = {
        activity: {
          ...state.activity,
          memoryJarPulls: state.activity.memoryJarPulls + 1,
        },
      }
      return withAchievementUnlocks(state, partial)
    }),

  trackSnackSpin: () =>
    set((state) => {
      const partial = {
        activity: {
          ...state.activity,
          snackSpins: state.activity.snackSpins + 1,
        },
      }
      return withAchievementUnlocks(state, partial)
    }),

  trackKannadaQuizAttempt: (score) =>
    set((state) => {
      const partial = {
        activity: {
          ...state.activity,
          bestKannadaQuizScore: Math.max(state.activity.bestKannadaQuizScore, score),
        },
      }
      return withAchievementUnlocks(state, partial)
    }),

  trackKannadaStreak: (bestStreak) =>
    set((state) => {
      const partial = {
        activity: {
          ...state.activity,
          kannadaBestStreak: Math.max(state.activity.kannadaBestStreak, bestStreak),
        },
      }
      return withAchievementUnlocks(state, partial)
    }),

  claimAchievementReward: (achievementId) =>
    set((state) => ({
      claimedRewards: {
        ...state.claimedRewards,
        [achievementId]: state.claimedRewards[achievementId] ?? new Date().toISOString(),
      },
    })),
}))
