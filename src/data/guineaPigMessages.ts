export interface ReactionMessage {
  message: string
  emoji?: string
  variant: 'positive' | 'neutral' | 'negative' | 'warning' | 'critical'
  duration?: number
}

export interface MessageContext {
  interactionType: 'feed' | 'play' | 'socialize' | 'groom' | 'general'
  wellnessTier: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  preferenceLevel?: 'favorite' | 'liked' | 'neutral' | 'disliked'
  needLevel?: number
  rejectionReason?: 'tired' | 'stressed' | 'full' | 'limit_reached' | 'low_friendship' | 'low_wellness' | 'dirty_habitat' | 'too_shy' | 'not_bold_enough'
}

export const guineaPigMessages = {
  // Feeding reactions
  feeding: {
    favorite: {
      excellent: [
        { message: 'Wheek! I love this!', emoji: '✨', variant: 'positive' as const },
        { message: 'Yum yum yum!', emoji: '😋', variant: 'positive' as const },
        { message: 'Popcorn! So happy!', emoji: '🎉', variant: 'positive' as const },
        { message: 'My favorite!!', emoji: '❤️', variant: 'positive' as const }
      ],
      good: [
        { message: 'Munch munch~', emoji: '😊', variant: 'positive' as const },
        { message: 'This is good!', emoji: '👍', variant: 'positive' as const },
        { message: 'Nom nom nom', emoji: '🥰', variant: 'positive' as const }
      ],
      fair: [
        { message: 'Thanks...', emoji: '😌', variant: 'neutral' as const },
        { message: 'Okay...', emoji: '', variant: 'neutral' as const }
      ],
      poor: [
        { message: 'Too tired...', emoji: '😓', variant: 'negative' as const },
        { message: 'Not now...', emoji: '', variant: 'negative' as const }
      ],
      critical: [
        { message: "Can't...", emoji: '😰', variant: 'negative' as const },
        { message: 'Too weak...', emoji: '', variant: 'critical' as const }
      ]
    },
    neutral: {
      excellent: [
        { message: 'Munch munch', emoji: '🍽️', variant: 'neutral' as const },
        { message: 'Not bad!', emoji: '', variant: 'neutral' as const },
        { message: 'Okay!', emoji: '', variant: 'neutral' as const }
      ],
      good: [
        { message: 'Okay...', emoji: '', variant: 'neutral' as const },
        { message: "I'll eat this", emoji: '', variant: 'neutral' as const }
      ],
      fair: [
        { message: 'If I must...', emoji: '😐', variant: 'neutral' as const },
        { message: 'Fine...', emoji: '', variant: 'neutral' as const }
      ],
      poor: [
        { message: 'Too tired...', emoji: '😓', variant: 'negative' as const },
        { message: 'Not hungry...', emoji: '', variant: 'negative' as const }
      ],
      critical: [
        { message: "Can't eat...", emoji: '😰', variant: 'negative' as const }
      ]
    },
    disliked: {
      excellent: [
        { message: 'Not my favorite...', emoji: '😕', variant: 'neutral' as const },
        { message: 'Sniff... okay', emoji: '', variant: 'neutral' as const }
      ],
      good: [
        { message: 'Ugh...', emoji: '😒', variant: 'negative' as const },
        { message: 'Really?', emoji: '', variant: 'negative' as const }
      ],
      fair: [
        { message: 'No thanks!', emoji: '❌', variant: 'negative' as const },
        { message: "Don't want it!", emoji: '', variant: 'negative' as const }
      ],
      poor: [
        { message: 'No way!', emoji: '🚫', variant: 'negative' as const }
      ],
      critical: [
        { message: 'No...', emoji: '😰', variant: 'negative' as const }
      ]
    },
    rejected: {
      full: [
        { message: "I'm full!", emoji: '🤚', variant: 'negative' as const },
        { message: 'Not hungry!', emoji: '', variant: 'negative' as const },
        { message: "Can't eat more!", emoji: '😓', variant: 'negative' as const }
      ],
      limit_reached: [
        { message: 'Had enough!', emoji: '🛑', variant: 'negative' as const },
        { message: 'No more!', emoji: '', variant: 'negative' as const }
      ],
      tired: [
        { message: 'Too tired...', emoji: '😴', variant: 'negative' as const },
        { message: 'Need rest...', emoji: '💤', variant: 'negative' as const }
      ],
      low_wellness: [
        { message: "Not feeling well...", emoji: '😔', variant: 'negative' as const },
        { message: "Too uncomfortable...", emoji: '😓', variant: 'negative' as const },
        { message: "Need to rest...", emoji: '💤', variant: 'warning' as const }
      ],
      dirty_habitat: [
        { message: "Habitat is dirty!", emoji: '🧹', variant: 'warning' as const },
        { message: "Clean my cage first!", emoji: '🚫', variant: 'warning' as const },
        { message: "Too uncomfortable here...", emoji: '😣', variant: 'negative' as const }
      ],
      too_shy: [
        { message: "Too nervous...", emoji: '😰', variant: 'neutral' as const },
        { message: "Need more time...", emoji: '🙈', variant: 'neutral' as const },
        { message: "I'm shy...", emoji: '😳', variant: 'neutral' as const }
      ],
      not_bold_enough: [
        { message: "Scared...", emoji: '😟', variant: 'neutral' as const },
        { message: "Not ready yet...", emoji: '😌', variant: 'neutral' as const }
      ],
      low_friendship: [
        { message: "Don't know you well...", emoji: '🤔', variant: 'neutral' as const },
        { message: "Need more bonding...", emoji: '💭', variant: 'neutral' as const }
      ],
      stressed: [
        { message: "Too stressed...", emoji: '😰', variant: 'warning' as const },
        { message: "Need calm...", emoji: '😥', variant: 'warning' as const }
      ]
    }
  },

  // Play reactions
  play: {
    success: {
      excellent: [
        { message: 'Wheee!', emoji: '🎉', variant: 'positive' as const },
        { message: 'Fun fun fun!', emoji: '🎮', variant: 'positive' as const },
        { message: "Let's go!", emoji: '⚡', variant: 'positive' as const }
      ],
      good: [
        { message: 'Okay!', emoji: '👍', variant: 'positive' as const },
        { message: 'Sure!', emoji: '', variant: 'positive' as const }
      ],
      fair: [
        { message: 'A bit tired...', emoji: '😌', variant: 'neutral' as const },
        { message: 'Quick game...', emoji: '', variant: 'neutral' as const }
      ],
      poor: [
        { message: 'Not feeling it...', emoji: '😓', variant: 'negative' as const }
      ],
      critical: [
        { message: 'Too weak...', emoji: '😰', variant: 'negative' as const }
      ]
    },
    rejected: {
      tired: [
        { message: 'Too tired...', emoji: '😴', variant: 'negative' as const },
        { message: 'Need sleep...', emoji: '💤', variant: 'negative' as const },
        { message: 'Maybe later...', emoji: '', variant: 'negative' as const }
      ],
      stressed: [
        { message: 'Not feeling it...', emoji: '😓', variant: 'negative' as const },
        { message: 'Leave me alone!', emoji: '🚫', variant: 'negative' as const }
      ],
      low_friendship: [
        { message: "I don't know you...", emoji: '😐', variant: 'negative' as const },
        { message: 'No thanks!', emoji: '', variant: 'negative' as const }
      ],
      low_wellness: [
        { message: "Not feeling well...", emoji: '😔', variant: 'negative' as const },
        { message: "Too uncomfortable...", emoji: '😓', variant: 'negative' as const }
      ],
      dirty_habitat: [
        { message: "Clean my cage first!", emoji: '🧹', variant: 'warning' as const },
        { message: "Too messy here...", emoji: '😣', variant: 'negative' as const }
      ],
      too_shy: [
        { message: "Too nervous...", emoji: '😰', variant: 'neutral' as const },
        { message: "I'm shy...", emoji: '🙈', variant: 'neutral' as const }
      ],
      not_bold_enough: [
        { message: "Scared...", emoji: '😟', variant: 'neutral' as const },
        { message: "Not ready...", emoji: '😌', variant: 'neutral' as const }
      ]
    }
  },

  // Socialize reactions
  socialize: {
    success: {
      excellent: [
        { message: 'Wheek wheek!', emoji: '🔊', variant: 'positive' as const },
        { message: 'Hi hi!', emoji: '👋', variant: 'positive' as const },
        { message: 'Pet me!', emoji: '🥰', variant: 'positive' as const }
      ],
      good: [
        { message: 'Hello!', emoji: '😊', variant: 'positive' as const },
        { message: 'Nice!', emoji: '', variant: 'positive' as const }
      ],
      fair: [
        { message: 'Okay...', emoji: '😌', variant: 'neutral' as const },
        { message: 'Hi...', emoji: '', variant: 'neutral' as const }
      ],
      poor: [
        { message: 'Not now...', emoji: '😓', variant: 'negative' as const }
      ],
      critical: [
        { message: 'Leave me...', emoji: '😰', variant: 'negative' as const }
      ]
    },
    rejected: {
      tired: [
        { message: 'Too tired...', emoji: '😴', variant: 'negative' as const },
        { message: 'Not now...', emoji: '💤', variant: 'negative' as const }
      ],
      stressed: [
        { message: 'Go away!', emoji: '😤', variant: 'negative' as const },
        { message: 'Leave me alone!', emoji: '🚫', variant: 'negative' as const }
      ],
      low_friendship: [
        { message: 'Who are you?', emoji: '😐', variant: 'negative' as const },
        { message: 'No!', emoji: '', variant: 'negative' as const }
      ],
      low_wellness: [
        { message: "Not feeling well...", emoji: '😔', variant: 'negative' as const },
        { message: "Too uncomfortable...", emoji: '😓', variant: 'negative' as const }
      ],
      dirty_habitat: [
        { message: "Habitat is dirty!", emoji: '🧹', variant: 'warning' as const },
        { message: "Clean my cage!", emoji: '🚫', variant: 'warning' as const }
      ],
      too_shy: [
        { message: "Too nervous...", emoji: '😰', variant: 'neutral' as const },
        { message: "Need more time...", emoji: '🙈', variant: 'neutral' as const }
      ],
      not_bold_enough: [
        { message: "Scared...", emoji: '😟', variant: 'neutral' as const },
        { message: "Not ready yet...", emoji: '😌', variant: 'neutral' as const }
      ]
    }
  },

  // Autonomous eating reactions
  autonomous: {
    eating: {
      favorite: [
        { message: 'Yum!', emoji: '😋', variant: 'positive' as const },
        { message: 'My favorite!', emoji: '❤️', variant: 'positive' as const },
        { message: 'So good!', emoji: '✨', variant: 'positive' as const },
        { message: 'Munch munch~', emoji: '😊', variant: 'positive' as const }
      ],
      neutral: [
        { message: 'Nom nom', emoji: '🍽️', variant: 'neutral' as const },
        { message: 'Eating...', emoji: '', variant: 'neutral' as const },
        { message: 'Munch', emoji: '', variant: 'neutral' as const }
      ],
      disliked: [
        { message: 'Not my fave...', emoji: '😕', variant: 'neutral' as const },
        { message: 'Meh...', emoji: '', variant: 'neutral' as const },
        { message: 'I guess...', emoji: '😒', variant: 'neutral' as const }
      ]
    },
    activity: {
      favorite: [
        { message: 'Love this!', emoji: '😍', variant: 'positive' as const },
        { message: 'My favorite!', emoji: '⭐', variant: 'positive' as const },
        { message: 'So fun!', emoji: '🎉', variant: 'positive' as const }
      ],
      neutral: [
        { message: 'Okay', emoji: '', variant: 'neutral' as const },
        { message: 'This is fine', emoji: '', variant: 'neutral' as const }
      ]
    },
    habitat: {
      favorite: [
        { message: 'Perfect spot!', emoji: '😌', variant: 'positive' as const },
        { message: 'Love it here!', emoji: '🏠', variant: 'positive' as const },
        { message: 'So cozy!', emoji: '✨', variant: 'positive' as const }
      ],
      neutral: [
        { message: 'Nice', emoji: '', variant: 'neutral' as const },
        { message: 'This works', emoji: '', variant: 'neutral' as const }
      ]
    },
    social: {
      bonded: [
        { message: 'My bestie!', emoji: '💕', variant: 'positive' as const },
        { message: 'Love you!', emoji: '🥰', variant: 'positive' as const },
        { message: 'So happy!', emoji: '✨', variant: 'positive' as const },
        { message: 'Popcorn!', emoji: '🎉', variant: 'positive' as const }
      ],
      friends: [
        { message: 'Hey friend!', emoji: '😊', variant: 'positive' as const },
        { message: 'Nice to see you!', emoji: '👋', variant: 'positive' as const },
        { message: 'Wheek!', emoji: '😄', variant: 'positive' as const },
        { message: 'Fun!', emoji: '🎈', variant: 'neutral' as const }
      ],
      neutral: [
        { message: 'Oh, hi', emoji: '', variant: 'neutral' as const },
        { message: 'Hmm', emoji: '🤔', variant: 'neutral' as const },
        { message: 'Sniff sniff', emoji: '👃', variant: 'neutral' as const },
        { message: 'Okay', emoji: '', variant: 'neutral' as const }
      ]
    }
  },

  // Care action reactions
  care: {
    cageClean: [
      { message: 'So fresh!', emoji: '✨', variant: 'positive' as const },
      { message: 'Much better!', emoji: '😊', variant: 'positive' as const },
      { message: 'Nice and clean!', emoji: '🧹', variant: 'positive' as const },
      { message: 'Wheek!', emoji: '🎉', variant: 'positive' as const }
    ],
    beddingRefresh: [
      { message: 'Cozy!', emoji: '😌', variant: 'positive' as const },
      { message: 'Soft bedding!', emoji: '✨', variant: 'positive' as const },
      { message: 'Comfy!', emoji: '🥰', variant: 'positive' as const }
    ],
    waterRefill: [
      { message: 'Fresh water!', emoji: '💧', variant: 'positive' as const },
      { message: 'Thank you!', emoji: '😊', variant: 'positive' as const },
      { message: 'Perfect!', emoji: '✨', variant: 'positive' as const }
    ],
    hayRackFill: [
      { message: 'Hay time!', emoji: '🌾', variant: 'positive' as const },
      { message: 'Yum yum!', emoji: '😋', variant: 'positive' as const },
      { message: 'Fresh hay!', emoji: '✨', variant: 'positive' as const }
    ],
    bowlFill: [
      { message: 'Food!', emoji: '🍽️', variant: 'positive' as const },
      { message: 'Wheek wheek!', emoji: '😍', variant: 'positive' as const },
      { message: 'Nom time!', emoji: '😋', variant: 'positive' as const }
    ]
  },

  // Need warnings
  needWarnings: {
    hunger: {
      warning: [
        { message: "I'm hungry...", emoji: '🍽️', variant: 'warning' as const },
        { message: 'Sniff sniff... food?', emoji: '👃', variant: 'warning' as const }
      ],
      critical: [
        { message: 'HUNGRY!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'NEED FOOD!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    thirst: {
      warning: [
        { message: 'Need water...', emoji: '💧', variant: 'warning' as const },
        { message: 'So thirsty...', emoji: '', variant: 'warning' as const }
      ],
      critical: [
        { message: 'WATER!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'THIRSTY!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    energy: {
      warning: [
        { message: 'Yawn~', emoji: '😴', variant: 'warning' as const },
        { message: 'So sleepy...', emoji: '💤', variant: 'warning' as const }
      ],
      critical: [
        { message: 'EXHAUSTED!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'NEED SLEEP!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    social: {
      warning: [
        { message: 'Lonely...', emoji: '😢', variant: 'warning' as const },
        { message: 'Wheek... anyone?', emoji: '🔊', variant: 'warning' as const }
      ],
      critical: [
        { message: 'SO LONELY!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'WHERE IS EVERYONE?!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    hygiene: {
      warning: [
        { message: 'I need a bath...', emoji: '🛁', variant: 'warning' as const },
        { message: 'Feel dirty...', emoji: '', variant: 'warning' as const }
      ],
      critical: [
        { message: 'VERY DIRTY!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'NEED CLEANING!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    shelter: {
      warning: [
        { message: 'Need safe spot...', emoji: '🏠', variant: 'warning' as const },
        { message: 'Where to hide?', emoji: '', variant: 'warning' as const }
      ],
      critical: [
        { message: 'NEED SHELTER!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'NOT SAFE!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    play: {
      warning: [
        { message: 'So bored...', emoji: '😐', variant: 'warning' as const },
        { message: 'Need fun...', emoji: '', variant: 'warning' as const }
      ],
      critical: [
        { message: 'EXTREMELY BORED!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'NEED TO PLAY!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    comfort: {
      warning: [
        { message: 'Uncomfortable...', emoji: '😣', variant: 'warning' as const },
        { message: 'Bedding is bad...', emoji: '', variant: 'warning' as const }
      ],
      critical: [
        { message: 'VERY UNCOMFORTABLE!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'NEED COMFORT!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    nails: {
      warning: [
        { message: 'Nails are long...', emoji: '💅', variant: 'warning' as const },
        { message: 'Need nail trim...', emoji: '', variant: 'warning' as const }
      ],
      critical: [
        { message: 'NAILS TOO LONG!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'TRIM MY NAILS!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    },
    chew: {
      warning: [
        { message: 'Teeth hurt...', emoji: '🦷', variant: 'warning' as const },
        { message: 'Need to chew...', emoji: '', variant: 'warning' as const }
      ],
      critical: [
        { message: 'TEETH PAIN!!', emoji: '🚨', variant: 'critical' as const },
        { message: 'NEED CHEW TOYS!!', emoji: '⚠️', variant: 'critical' as const }
      ]
    }
  },

  // General wellness messages
  wellness: {
    excellent: [
      { message: 'I feel great!', emoji: '😄', variant: 'positive' as const, duration: 4000 },
      { message: 'Life is good!', emoji: '✨', variant: 'positive' as const, duration: 4000 },
      { message: 'Popcorn!', emoji: '🎉', variant: 'positive' as const, duration: 3000 }
    ],
    good: [
      { message: 'Feeling good', emoji: '😊', variant: 'neutral' as const, duration: 4000 },
      { message: 'Content~', emoji: '', variant: 'neutral' as const, duration: 4000 }
    ],
    fair: [
      { message: 'Could be better...', emoji: '😐', variant: 'neutral' as const, duration: 4000 },
      { message: 'Not great...', emoji: '', variant: 'neutral' as const, duration: 4000 }
    ],
    poor: [
      { message: 'Not feeling well...', emoji: '😞', variant: 'warning' as const, duration: 5000 },
      { message: 'Need help...', emoji: '⚠️', variant: 'warning' as const, duration: 5000 }
    ],
    critical: [
      { message: 'HELP ME!!', emoji: '🚨', variant: 'critical' as const, duration: 6000 },
      { message: 'URGENT!!', emoji: '⚠️', variant: 'critical' as const, duration: 6000 }
    ]
  },

  // Companion interactions
  companion: {
    play: [
      { message: "Let's play!", emoji: '🎮', variant: 'positive' as const },
      { message: 'Zoom zoom!', emoji: '💨', variant: 'positive' as const }
    ],
    groom: [
      { message: 'Groom groom~', emoji: '✨', variant: 'positive' as const },
      { message: 'Looking good!', emoji: '😊', variant: 'positive' as const }
    ],
    cuddle: [
      { message: 'Cozy~', emoji: '🥰', variant: 'positive' as const },
      { message: 'Warm!', emoji: '❤️', variant: 'positive' as const }
    ],
    sniff: [
      { message: 'Sniff sniff', emoji: '👃', variant: 'neutral' as const },
      { message: 'Hello!', emoji: '👋', variant: 'neutral' as const }
    ]
  }
} as const

function selectRandomMessage(messages: readonly ReactionMessage[]): ReactionMessage {
  return messages[Math.floor(Math.random() * messages.length)]
}

export function generateReactionMessage(context: MessageContext): ReactionMessage {
  const { interactionType, wellnessTier, preferenceLevel, rejectionReason } = context

  // Handle rejections
  if (rejectionReason) {
    if (interactionType === 'feed') {
      if (rejectionReason === 'full' || rejectionReason === 'limit_reached' || rejectionReason === 'tired' || rejectionReason === 'low_wellness' || rejectionReason === 'dirty_habitat' || rejectionReason === 'too_shy' || rejectionReason === 'not_bold_enough' || rejectionReason === 'low_friendship' || rejectionReason === 'stressed') {
        return selectRandomMessage(guineaPigMessages.feeding.rejected[rejectionReason])
      }
    } else if (interactionType === 'play') {
      if (rejectionReason === 'tired' || rejectionReason === 'stressed' || rejectionReason === 'low_friendship' || rejectionReason === 'low_wellness' || rejectionReason === 'dirty_habitat' || rejectionReason === 'too_shy' || rejectionReason === 'not_bold_enough') {
        return selectRandomMessage(guineaPigMessages.play.rejected[rejectionReason])
      }
    } else if (interactionType === 'socialize') {
      if (rejectionReason === 'tired' || rejectionReason === 'stressed' || rejectionReason === 'low_friendship' || rejectionReason === 'low_wellness' || rejectionReason === 'dirty_habitat' || rejectionReason === 'too_shy' || rejectionReason === 'not_bold_enough') {
        return selectRandomMessage(guineaPigMessages.socialize.rejected[rejectionReason])
      }
    }
  }

  // Handle preference-based reactions (feeding)
  if (interactionType === 'feed' && preferenceLevel) {
    if (preferenceLevel === 'favorite') {
      return selectRandomMessage(guineaPigMessages.feeding.favorite[wellnessTier])
    } else if (preferenceLevel === 'neutral') {
      return selectRandomMessage(guineaPigMessages.feeding.neutral[wellnessTier])
    } else if (preferenceLevel === 'disliked') {
      return selectRandomMessage(guineaPigMessages.feeding.disliked[wellnessTier])
    }
  }

  // Handle success reactions
  if (interactionType === 'play') {
    return selectRandomMessage(guineaPigMessages.play.success[wellnessTier])
  } else if (interactionType === 'socialize') {
    return selectRandomMessage(guineaPigMessages.socialize.success[wellnessTier])
  } else if (interactionType === 'feed') {
    return selectRandomMessage(guineaPigMessages.feeding.neutral[wellnessTier])
  }

  // Fallback to generic wellness message
  const wellnessMessages = guineaPigMessages.wellness[wellnessTier]
  return selectRandomMessage(wellnessMessages)
}

export function generateNeedWarning(
  needType: string,
  severity: 'warning' | 'critical'
): ReactionMessage | null {
  const needMessages = (guineaPigMessages.needWarnings as any)[needType]
  if (!needMessages) return null

  const messages = needMessages[severity]
  if (!messages) return null

  return selectRandomMessage(messages)
}
