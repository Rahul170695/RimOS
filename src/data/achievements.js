export const achievementCatalog = [
  {
    id: 'warm-boot',
    title: 'Warm Boot',
    tier: 'common',
    icon: '✨',
    description: 'Open your first app in RIMos.',
    personalLine: 'Every big memory starts with one tiny click.',
    points: 80,
    award: {
      title: 'Sweet Start Voucher',
      summary: 'Redeem for one chai + walk date curated by Rahul.',
      token: 'RIM-WARM-001',
    },
    target: 1,
    metricLabel: 'apps opened',
  },
  {
    id: 'memory-keeper',
    title: 'Memory Keeper',
    tier: 'rare',
    icon: '🫙',
    description: 'Pull 3 moments from the Memory Jar.',
    personalLine: 'You never let beautiful little moments disappear.',
    points: 120,
    award: {
      title: 'Memory Capsule',
      summary: 'Unlock a private mini letter and one throwback photo drop.',
      token: 'RIM-MEM-003',
    },
    target: 3,
    metricLabel: 'jar pulls',
  },
  {
    id: 'snack-commander',
    title: 'Snack Commander',
    tier: 'rare',
    icon: '🍜',
    description: 'Spin SnackRoulette 5 times.',
    personalLine: 'Food + stories + you = perfect combo.',
    points: 130,
    award: {
      title: 'Snack Queen Pass',
      summary: 'Redeem for a surprise snack treat chosen by Rahul.',
      token: 'RIM-SNACK-005',
    },
    target: 5,
    metricLabel: 'spins',
  },
  {
    id: 'quest-hero',
    title: 'Quest Hero',
    tier: 'epic',
    icon: '🗝',
    description: 'Complete the birthday quest challenge.',
    personalLine: 'You solved the lock and unlocked the heart.',
    points: 180,
    award: {
      title: 'Vault Key Reward',
      summary: 'Redeem for one custom date plan with zero negotiation.',
      token: 'RIM-QUEST-777',
    },
    target: 1,
    metricLabel: 'quest',
  },
  {
    id: 'kannada-scholar',
    title: 'Kannada Scholar',
    tier: 'epic',
    icon: '📘',
    description: 'Score 8/10 or higher in Kannada quiz.',
    personalLine: 'Learning together makes this story even richer.',
    points: 170,
    award: {
      title: 'Scholar Star Medal',
      summary: 'Redeem for a personalized Kannada voice-note lesson.',
      token: 'RIM-KAN-810',
    },
    target: 8,
    metricLabel: 'best quiz score',
  },
  {
    id: 'streak-star',
    title: 'Streak Star',
    tier: 'epic',
    icon: '⭐',
    description: 'Reach a 3-day Kannada learning streak.',
    personalLine: 'Consistency looks very good on you.',
    points: 160,
    award: {
      title: 'Streak Crown',
      summary: 'Redeem for one appreciation note written that same day.',
      token: 'RIM-STREAK-333',
    },
    target: 3,
    metricLabel: 'best streak',
  },
  {
    id: 'surprise-ignition',
    title: 'Surprise Ignition',
    tier: 'legendary',
    icon: '🎆',
    description: 'Trigger the final surprise at least once.',
    personalLine: 'You turned this build into a celebration.',
    points: 250,
    award: {
      title: 'Fireworks Privilege',
      summary: 'Redeem for one “your wish is command” day token.',
      token: 'RIM-SPARK-999',
    },
    target: 1,
    metricLabel: 'surprises',
  },
  {
    id: 'forever-build',
    title: 'Forever Build',
    tier: 'legendary',
    icon: '💍',
    description: 'Complete the full memory loop across major apps.',
    personalLine: 'Not just a milestone, this is our signature release.',
    points: 400,
    award: {
      title: 'Forever Build Relic',
      summary: 'Redeem for a handcrafted keepsake letter + date experience.',
      token: 'RIM-FOREVER-000',
    },
    target: 8,
    metricLabel: 'milestones',
    hidden: true,
  },
]

export function createAchievementSnapshot(stateLike) {
  const appLaunchCounts = stateLike?.activity?.appLaunchCounts ?? {}

  return {
    appsOpenedTotal: Object.values(appLaunchCounts).reduce((sum, count) => sum + count, 0),
    memoryJarPulls: stateLike?.activity?.memoryJarPulls ?? 0,
    snackSpins: stateLike?.activity?.snackSpins ?? 0,
    bestKannadaQuizScore: stateLike?.activity?.bestKannadaQuizScore ?? 0,
    kannadaBestStreak: stateLike?.activity?.kannadaBestStreak ?? 0,
    surpriseReveals: stateLike?.activity?.surpriseReveals ?? 0,
    questSolved: Boolean(stateLike?.questSolved),
    hiddenUnlocked: Boolean(stateLike?.hiddenUnlocked),
  }
}

function checkForeverBuild(snapshot) {
  const completedMilestones = [
    snapshot.appsOpenedTotal >= 6,
    snapshot.memoryJarPulls >= 3,
    snapshot.snackSpins >= 5,
    snapshot.questSolved,
    snapshot.bestKannadaQuizScore >= 8,
    snapshot.kannadaBestStreak >= 3,
    snapshot.surpriseReveals >= 1,
    snapshot.hiddenUnlocked,
  ].filter(Boolean).length

  return {
    current: completedMilestones,
    target: 8,
    unlocked: completedMilestones >= 8,
  }
}

export function evaluateAchievementProgress(achievementId, snapshot) {
  switch (achievementId) {
    case 'warm-boot': {
      const current = snapshot.appsOpenedTotal
      return { current, target: 1, unlocked: current >= 1 }
    }
    case 'memory-keeper': {
      const current = snapshot.memoryJarPulls
      return { current, target: 3, unlocked: current >= 3 }
    }
    case 'snack-commander': {
      const current = snapshot.snackSpins
      return { current, target: 5, unlocked: current >= 5 }
    }
    case 'quest-hero': {
      const current = snapshot.questSolved ? 1 : 0
      return { current, target: 1, unlocked: snapshot.questSolved }
    }
    case 'kannada-scholar': {
      const current = snapshot.bestKannadaQuizScore
      return { current, target: 8, unlocked: current >= 8 }
    }
    case 'streak-star': {
      const current = snapshot.kannadaBestStreak
      return { current, target: 3, unlocked: current >= 3 }
    }
    case 'surprise-ignition': {
      const current = snapshot.surpriseReveals
      return { current, target: 1, unlocked: current >= 1 }
    }
    case 'forever-build':
      return checkForeverBuild(snapshot)
    default:
      return { current: 0, target: 1, unlocked: false }
  }
}
