import type { MessageCategory } from '../stores/loggingStore'

// Message templates organized by category
interface MessageTemplate {
  message: string
  emoji?: string
  weight?: number // For random selection weighting (default: 1)
}

// Player Action Messages
const playerActionTemplates: MessageTemplate[] = [
  { message: "You place a cherry tomato in the food dish", emoji: "🍅" },
  { message: "You offer your guinea pig a strawberry treat", emoji: "🍓" },
  { message: "You gently pet your guinea pig behind the ears", emoji: "👋" },
  { message: "You clean the cage thoroughly", emoji: "🧽" },
  { message: "You refresh the bedding with botanical hay", emoji: "🌿" },
  { message: "You fill the water bottle with fresh water", emoji: "💧" },
  { message: "You place a cozy hideout in the corner", emoji: "🏠" },
  { message: "You add some fresh timothy hay to the feeder", emoji: "🌾" },
  { message: "You give your guinea pig a gentle belly rub", emoji: "🤗" },
  { message: "You scatter some pellets in the food bowl", emoji: "🥄" },
  { message: "You arrange a comfortable resting area", emoji: "🛏️" },
  { message: "You place a new chew toy near the hideout", emoji: "🧸" }
]

// Guinea Pig Reaction Messages
const guineaPigReactionTemplates: MessageTemplate[] = [
  { message: "Guinea pig popcorns excitedly! ✨", emoji: "🐹" },
  { message: "Guinea pig turns nose up at the broccoli", emoji: "😤" },
  { message: "Guinea pig munches happily - nom nom nom!", emoji: "😋" },
  { message: "Guinea pig purrs contentedly during petting", emoji: "😌" },
  { message: "Guinea pig wheeks loudly for more treats!", emoji: "📢" },
  { message: "Guinea pig sniffs the new item curiously", emoji: "👃" },
  { message: "Guinea pig does a happy dance!", emoji: "💃" },
  { message: "Guinea pig chatters teeth in excitement", emoji: "😁" },
  { message: "Guinea pig stretches out in total relaxation", emoji: "😴" },
  { message: "Guinea pig makes soft rumbling sounds", emoji: "🎵" },
  { message: "Guinea pig's eyes sparkle with joy", emoji: "✨" },
  { message: "Guinea pig tilts head thoughtfully", emoji: "🤔" }
]

// Autonomous Behavior Messages
const autonomousBehaviorTemplates: MessageTemplate[] = [
  { message: "Guinea pig runs to the water bottle and drinks", emoji: "🏃" },
  { message: "Guinea pig investigates the new tunnel curiously", emoji: "🔍" },
  { message: "Guinea pig does zoomies around the cage!", emoji: "💨" },
  { message: "Guinea pig stretches and yawns in the sunbeam", emoji: "☀️" },
  { message: "Guinea pig hides in the cozy shelter", emoji: "🏠" },
  { message: "Guinea pig nibbles on some timothy hay", emoji: "🌾" },
  { message: "Guinea pig explores every corner of the habitat", emoji: "🗺️" },
  { message: "Guinea pig settles down for a peaceful nap", emoji: "😴" },
  { message: "Guinea pig grooms their fur meticulously", emoji: "🧽" },
  { message: "Guinea pig claims the food bowl as their throne", emoji: "👑" },
  { message: "Guinea pig performs acrobatic leaps and bounds", emoji: "🤸" },
  { message: "Guinea pig organizes their bedding just right", emoji: "🏗️" }
]

// Environmental Event Messages
const environmentalEventTemplates: MessageTemplate[] = [
  { message: "The bedding freshness is getting low", emoji: "🌿" },
  { message: "Guinea pig drops a poop near the food dish", emoji: "💩" },
  { message: "Water level needs attention", emoji: "💧" },
  { message: "The cage could use a good cleaning", emoji: "🧽" },
  { message: "The hay supply is running low", emoji: "🌾" },
  { message: "A pleasant breeze flows through the habitat", emoji: "🌬️" },
  { message: "The temperature feels just right", emoji: "🌡️" },
  { message: "Sunlight streams in, creating a warm spot", emoji: "☀️" },
  { message: "The food dish is looking empty", emoji: "🍽️" },
  { message: "Fresh air circulates through the space", emoji: "💨" },
  { message: "The hideout could use some fresh bedding", emoji: "🏠" },
  { message: "A quiet, peaceful atmosphere settles in", emoji: "🌙" }
]

// Achievement Messages
const achievementTemplates: MessageTemplate[] = [
  { message: "🏆 Achievement unlocked: First Pet!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Happy Guinea Pig!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Excellent Caretaker!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Preference Detective!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Clean Home Master!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Guinea Pig Whisperer!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Devoted Friend!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Habitat Designer!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Nutrition Expert!", emoji: "🏆" },
  { message: "🏆 Achievement unlocked: Comfort Specialist!", emoji: "🏆" }
]

// Template collections
const messageTemplates: Record<MessageCategory, MessageTemplate[]> = {
  player_action: playerActionTemplates,
  guinea_pig_reaction: guineaPigReactionTemplates,
  autonomous_behavior: autonomousBehaviorTemplates,
  environmental: environmentalEventTemplates,
  achievement: achievementTemplates,
  system: [] // System messages are generated directly, not from templates
}

// Message generation functions
export class MessageGenerator {
  private static getRandomTemplate(templates: MessageTemplate[]): MessageTemplate {
    if (templates.length === 0) {
      return { message: "Something happened", emoji: "💭" }
    }

    // Use weight-based selection if weights are provided
    const hasWeights = templates.some(t => t.weight !== undefined)

    if (hasWeights) {
      const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 1), 0)
      let random = Math.random() * totalWeight

      for (const template of templates) {
        random -= (template.weight || 1)
        if (random <= 0) {
          return template
        }
      }
    }

    // Simple random selection
    const randomIndex = Math.floor(Math.random() * templates.length)
    return templates[randomIndex]
  }

  static generatePlayerAction(
    action?: string,
    item?: string,
    customEmoji?: string
  ): { message: string; emoji?: string } {
    if (action && item) {
      // Generate custom message based on action and item
      return {
        message: `You ${action} ${item}`,
        emoji: customEmoji || "👆"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.player_action)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateGuineaPigReaction(
    reaction?: string,
    intensity?: 'mild' | 'moderate' | 'strong'
  ): { message: string; emoji?: string } {
    if (reaction) {
      const intensityModifiers = {
        mild: ['slightly', 'gently', 'softly'],
        moderate: ['', 'noticeably', 'clearly'],
        strong: ['very', 'extremely', 'intensely']
      }

      const modifier = intensity ?
        intensityModifiers[intensity][Math.floor(Math.random() * intensityModifiers[intensity].length)] : ''

      return {
        message: `Guinea pig ${modifier} ${reaction}`.trim(),
        emoji: "🐹"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.guinea_pig_reaction)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateAutonomousBehavior(
    behavior?: string
  ): { message: string; emoji?: string } {
    if (behavior) {
      return {
        message: `Guinea pig ${behavior}`,
        emoji: "🎯"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.autonomous_behavior)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateEnvironmentalEvent(
    event?: string,
    severity?: 'low' | 'medium' | 'high'
  ): { message: string; emoji?: string } {
    if (event) {
      const severityPrefixes = {
        low: ['Notice:', 'Reminder:'],
        medium: ['Alert:', 'Attention:'],
        high: ['Warning:', 'Urgent:']
      }

      const prefix = severity ?
        severityPrefixes[severity][Math.floor(Math.random() * severityPrefixes[severity].length)] : ''

      return {
        message: prefix ? `${prefix} ${event}` : event,
        emoji: severity === 'high' ? "⚠️" : "🌿"
      }
    }

    const template = this.getRandomTemplate(messageTemplates.environmental)
    return {
      message: template.message,
      emoji: template.emoji
    }
  }

  static generateAchievement(
    achievementName: string,
    description?: string
  ): { message: string; emoji?: string } {
    const baseMessage = `🏆 Achievement unlocked: ${achievementName}!`
    const fullMessage = description ? `${baseMessage} ${description}` : baseMessage

    return {
      message: fullMessage,
      emoji: "🏆"
    }
  }

  // Preference-based message generation
  static generatePreferenceReaction(
    item: string,
    preference: 'love' | 'like' | 'neutral' | 'dislike' | 'hate',
    isNewDiscovery: boolean = false
  ): { message: string; emoji?: string } {
    const reactions = {
      love: [
        `Guinea pig absolutely adores the ${item}!`,
        `Guinea pig's eyes light up at the sight of ${item}!`,
        `Guinea pig does a joyful popcorn dance for the ${item}!`
      ],
      like: [
        `Guinea pig enjoys the ${item}`,
        `Guinea pig seems pleased with the ${item}`,
        `Guinea pig munches the ${item} contentedly`
      ],
      neutral: [
        `Guinea pig accepts the ${item} without much reaction`,
        `Guinea pig sniffs the ${item} thoughtfully`,
        `Guinea pig tries the ${item} cautiously`
      ],
      dislike: [
        `Guinea pig turns away from the ${item}`,
        `Guinea pig sniffs the ${item} and walks away`,
        `Guinea pig seems uninterested in the ${item}`
      ],
      hate: [
        `Guinea pig completely rejects the ${item}!`,
        `Guinea pig makes a face at the ${item}`,
        `Guinea pig pushes the ${item} away with their nose`
      ]
    }

    const emojis = {
      love: "😍",
      like: "😊",
      neutral: "🤔",
      dislike: "😐",
      hate: "🙄"
    }

    const reactionMessages = reactions[preference]
    const message = reactionMessages[Math.floor(Math.random() * reactionMessages.length)]
    const discoveryPrefix = isNewDiscovery ? "✨ Discovery: " : ""

    return {
      message: `${discoveryPrefix}${message}`,
      emoji: emojis[preference]
    }
  }

  // Context-aware message generation
  static generateContextualMessage(
    context: {
      category: MessageCategory
      action?: string
      item?: string
      preference?: string
      intensity?: string
      isFirstTime?: boolean
    }
  ): { message: string; emoji?: string } {
    switch (context.category) {
      case 'player_action':
        return this.generatePlayerAction(context.action, context.item)

      case 'guinea_pig_reaction':
        return this.generateGuineaPigReaction(
          context.action,
          context.intensity as 'mild' | 'moderate' | 'strong'
        )

      case 'autonomous_behavior':
        return this.generateAutonomousBehavior(context.action)

      case 'environmental':
        return this.generateEnvironmentalEvent(
          context.action,
          context.intensity as 'low' | 'medium' | 'high'
        )

      case 'achievement':
        return this.generateAchievement(context.action || 'Unknown Achievement')

      default:
        return { message: "Something interesting happened", emoji: "💭" }
    }
  }

  // Get all available templates for a category (useful for testing)
  static getTemplatesForCategory(category: MessageCategory): MessageTemplate[] {
    return messageTemplates[category] || []
  }

  // Add new template to a category (for extensibility)
  static addTemplate(category: MessageCategory, template: MessageTemplate): void {
    if (!messageTemplates[category]) {
      messageTemplates[category] = []
    }
    messageTemplates[category].push(template)
  }

  // Helper function to get article (a/an) based on first letter
  private static getArticle(word: string): string {
    const vowels = ['a', 'e', 'i', 'o', 'u']
    const firstLetter = word.toLowerCase().charAt(0)
    return vowels.includes(firstLetter) ? 'an' : 'a'
  }

  // Helper function to format food name for piece messages
  private static formatFoodForPiece(foodType: string): string {
    // For fruits and vegetables, use "a [food] piece"
    const article = this.getArticle(foodType)
    return `${article} ${foodType} piece`
  }

  // Action-specific message generators for guinea pig interactions
  static generateFeedMessage(
    guineaPigName: string,
    foodType: string,
    isFavorite: boolean = false,
    isDisliked: boolean = false
  ): { message: string; emoji: string } {
    const foodEmojis: Record<string, string> = {
      pellets: '🥄',
      vegetables: '🥬',
      fruits: '🍓',
      hay: '🌾'
    }

    let templates: string[]

    // Check if this is pellets or hay (should not use "piece" format)
    const isPelletsOrHay = foodType.toLowerCase().includes('pellet') || foodType.toLowerCase().includes('hay')

    // Check if this is fruits or vegetables (use "piece" format)
    const usePieceFormat = !isPelletsOrHay

    // Clean up food name and apply formatting
    const cleanedFood = this.cleanFoodName(foodType)
    const foodText = usePieceFormat ? this.formatFoodForPiece(cleanedFood) : cleanedFood

    if (isFavorite) {
      // Favorite food - enthusiastic messages (Phase 2.5 - System 2)
      if (usePieceFormat) {
        templates = [
          `✨ ${guineaPigName}'s eyes light up! They absolutely love ${cleanedFood}!`,
          `${guineaPigName} does excited popcorns - this is their favorite!`,
          `${guineaPigName} devours ${foodText} with enthusiasm!`,
          `${guineaPigName} can't get enough of ${cleanedFood}!`,
          `You treat ${guineaPigName} to their beloved ${cleanedFood}! ✨`
        ]
      } else {
        templates = [
          `✨ ${guineaPigName}'s eyes light up! They absolutely love ${cleanedFood}!`,
          `${guineaPigName} does excited popcorns - this is their favorite!`,
          `${guineaPigName} devours ${cleanedFood} with enthusiasm!`,
          `${guineaPigName} can't get enough of ${cleanedFood}!`,
          `You treat ${guineaPigName} to their beloved ${cleanedFood}! ✨`
        ]
      }
    } else if (isDisliked) {
      // Disliked food - reluctant messages (Phase 2.5 - System 2)
      if (usePieceFormat) {
        templates = [
          `${guineaPigName} sniffs ${foodText} and eats it reluctantly 😐`,
          `${guineaPigName} shows little interest but eventually eats ${foodText}`,
          `${guineaPigName} accepts ${foodText} without much enthusiasm`,
          `${guineaPigName} clearly doesn't enjoy ${cleanedFood}...`,
          `${guineaPigName} eats ${foodText} half-heartedly`
        ]
      } else {
        templates = [
          `${guineaPigName} sniffs ${cleanedFood} and eats it reluctantly 😐`,
          `${guineaPigName} shows little interest but eventually eats ${cleanedFood}`,
          `${guineaPigName} accepts ${cleanedFood} without much enthusiasm`,
          `${guineaPigName} clearly doesn't enjoy ${cleanedFood}...`,
          `${guineaPigName} eats ${cleanedFood} half-heartedly`
        ]
      }
    } else {
      // Neutral food - standard messages
      if (usePieceFormat) {
        templates = [
          `${guineaPigName} ate ${foodText}.`,
          `${guineaPigName} munches on ${foodText}.`,
          `${guineaPigName} eats ${foodText} contentedly.`,
          `${guineaPigName} nibbles ${foodText}.`,
          `${guineaPigName} enjoys ${foodText}.`
        ]
      } else {
        templates = [
          `${guineaPigName} ate ${cleanedFood}.`,
          `${guineaPigName} munches on ${cleanedFood}.`,
          `${guineaPigName} eats ${cleanedFood} contentedly.`,
          `${guineaPigName} nibbles ${cleanedFood}.`,
          `${guineaPigName} enjoys ${cleanedFood}.`
        ]
      }
    }

    const message = templates[Math.floor(Math.random() * templates.length)]
    const emoji = foodEmojis[foodType] || '🍽️'

    return { message, emoji }
  }

  static generateWaterMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You fill ${guineaPigName}'s water bottle with fresh water`,
      `${guineaPigName} gets clean, refreshing water`,
      `You refresh ${guineaPigName}'s water supply`,
      `${guineaPigName} receives fresh water`,
      `You ensure ${guineaPigName} has plenty of water`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '💧' }
  }

  static generateCleanMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You give ${guineaPigName} a gentle cleaning`,
      `${guineaPigName} gets groomed and pampered`,
      `You brush ${guineaPigName}'s fur lovingly`,
      `${guineaPigName} gets a spa treatment`,
      `You clean ${guineaPigName} with care`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🧼' }
  }

  static generatePlayMessage(
    guineaPigName: string,
    activityType: string = 'general_play',
    isFavorite: boolean = false,
    isRejected: boolean = false
  ): { message: string; emoji: string } {
    const formattedActivity = activityType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Rejection messages (Phase 2.5 - System 2)
    if (isRejected) {
      const templates = [
        `${guineaPigName} has no interest in ${formattedActivity.toLowerCase()}`,
        `${guineaPigName} avoids ${formattedActivity.toLowerCase()} entirely`,
        `${guineaPigName} refuses to participate in ${formattedActivity.toLowerCase()}`,
        `${guineaPigName} clearly dislikes ${formattedActivity.toLowerCase()}`
      ]
      const message = templates[Math.floor(Math.random() * templates.length)]
      return { message, emoji: '😐' }
    }

    // Favorite activity messages (Phase 2.5 - System 2)
    if (isFavorite) {
      const templates = [
        `${guineaPigName} absolutely loves ${formattedActivity.toLowerCase()}! 🎉`,
        `${guineaPigName} engages enthusiastically with ${formattedActivity.toLowerCase()}!`,
        `${guineaPigName} zooms around during ${formattedActivity.toLowerCase()} with pure joy!`,
        `✨ ${formattedActivity} is clearly ${guineaPigName}'s favorite thing!`
      ]
      const message = templates[Math.floor(Math.random() * templates.length)]
      return { message, emoji: '🎉' }
    }

    // Neutral activity messages
    const templates = [
      `You play ${formattedActivity.toLowerCase()} with ${guineaPigName}`,
      `${guineaPigName} participates in ${formattedActivity.toLowerCase()} comfortably`,
      `${guineaPigName} seems content with ${formattedActivity.toLowerCase()}`,
      `${guineaPigName} engages with ${formattedActivity.toLowerCase()} normally`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🎮' }
  }

  static generateChewToyMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You give ${guineaPigName} a new chew toy`,
      `${guineaPigName} receives a fresh chew toy`,
      `You place a chew toy for ${guineaPigName}`,
      `${guineaPigName} gets something to gnaw on`,
      `You provide ${guineaPigName} with a chew toy`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🦷' }
  }

  static generateTrimNailsMessage(
    guineaPigName: string,
    wasSuccessful: boolean
  ): { message: string; emoji: string } {
    const templates = wasSuccessful ? [
      `You successfully trim ${guineaPigName}'s nails`,
      `${guineaPigName} sits still for a nail trim`,
      `You carefully trim ${guineaPigName}'s nails`,
      `${guineaPigName} gets a pedicure`,
      `You gently trim ${guineaPigName}'s tiny nails`
    ] : [
      `You attempt to trim ${guineaPigName}'s nails`,
      `${guineaPigName} squirms during the nail trim`,
      `You try your best with ${guineaPigName}'s nails`,
      `${guineaPigName} isn't cooperating with nail trimming`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '✂️' }
  }

  static generateShelterMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You arrange a cozy shelter for ${guineaPigName}`,
      `${guineaPigName} gets a comfortable hideout`,
      `You set up a safe space for ${guineaPigName}`,
      `${guineaPigName} receives a secure hideaway`,
      `You create a peaceful retreat for ${guineaPigName}`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🏠' }
  }

  static generateSootheToSleepMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You gently soothe ${guineaPigName} to sleep`,
      `${guineaPigName} drifts off peacefully`,
      `You help ${guineaPigName} settle down for a nap`,
      `${guineaPigName} relaxes and falls asleep`,
      `You create a calm environment for ${guineaPigName} to rest`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '😴' }
  }

  static generateSocializeMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You spend quality social time with ${guineaPigName}`,
      `${guineaPigName} enjoys your companionship`,
      `You give ${guineaPigName} gentle attention and affection`,
      `${guineaPigName} bonds with you`,
      `You interact warmly with ${guineaPigName}`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🤝' }
  }

  static generateRearrangeCageMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You rearrange ${guineaPigName}'s cage with new enrichment`,
      `${guineaPigName} explores the newly arranged habitat`,
      `You add variety to ${guineaPigName}'s environment`,
      `${guineaPigName} investigates the changes curiously`,
      `You provide ${guineaPigName} with environmental enrichment`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🔄' }
  }

  static generateProvideBeddingMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `You provide fresh, soft bedding for ${guineaPigName}`,
      `${guineaPigName} gets cozy new bedding`,
      `You refresh ${guineaPigName}'s bedding for maximum comfort`,
      `${guineaPigName} snuggles into the fresh bedding`,
      `You ensure ${guineaPigName} has comfortable bedding`
    ]

    const message = templates[Math.floor(Math.random() * templates.length)]
    return { message, emoji: '🛏️' }
  }

  // Helper to clean up food names (remove "(Bag)" suffix)
  private static cleanFoodName(foodName: string): string {
    return foodName.replace(/\s*\(Bag\)\s*$/i, '').trim()
  }

  // System 19: Autonomous behavior messages
  static generateAutonomousEatMessage(guineaPigName: string, foodType?: string): { message: string; emoji: string } {
    const food = foodType || 'food from the bowl'

    // Check if this is pellets or hay (should not use "piece" format)
    const isPelletsOrHay = foodType && (
      foodType.toLowerCase().includes('pellet') ||
      foodType.toLowerCase().includes('hay')
    )

    // Check if this is fruits or vegetables (use "piece" format)
    const usePieceFormat = foodType && !isPelletsOrHay && foodType !== 'food from the bowl'

    // Clean up food name and apply formatting
    const cleanedFood = this.cleanFoodName(food)
    const foodText = usePieceFormat ? this.formatFoodForPiece(cleanedFood) : cleanedFood

    const templates = [
      `${guineaPigName} walks to the food bowl and munches on ${foodText}.`,
      `${guineaPigName} eats ${foodText} contentedly.`,
      `${guineaPigName} enjoys ${foodText}.`,
      `${guineaPigName} nibbles ${foodText} with satisfaction.`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '🍽️' }
  }

  static generateAutonomousEatHayMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `${guineaPigName} pulls fresh hay from the rack`,
      `${guineaPigName} munches contentedly on timothy hay`,
      `${guineaPigName} enjoys some nutritious hay`,
      `${guineaPigName} chews on hay from the rack`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '🌾' }
  }

  static generateAutonomousDrinkMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `${guineaPigName} drinks deeply from the water bottle`,
      `${guineaPigName} takes a refreshing drink`,
      `${guineaPigName} hydrates at the water bottle`,
      `${guineaPigName} laps up cool water`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '💧' }
  }

  static generateAutonomousSleepMessage(guineaPigName: string, location?: string): { message: string; emoji: string } {
    const place = location || 'a cozy spot'
    const templates = [
      `${guineaPigName} settles down to sleep in ${place}`,
      `${guineaPigName} naps peacefully in ${place}`,
      `${guineaPigName} dozes off in ${place}`,
      `${guineaPigName} takes a restful nap in ${place}`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '😴' }
  }

  static generateAutonomousGroomMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `${guineaPigName} grooms their fur meticulously`,
      `${guineaPigName} cleans themselves carefully`,
      `${guineaPigName} tidies up their fur`,
      `${guineaPigName} preens and grooms`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '🧼' }
  }

  static generateAutonomousChewMessage(guineaPigName: string, itemName?: string): { message: string; emoji: string } {
    const item = itemName || 'a chew item'
    const templates = [
      `${guineaPigName} gnaws on ${item}`,
      `${guineaPigName} chews ${item} contentedly`,
      `${guineaPigName} works on ${item} to trim their teeth`,
      `${guineaPigName} enjoys chewing on ${item}`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '🪵' }
  }

  static generateAutonomousPlayMessage(guineaPigName: string, toyName?: string): { message: string; emoji: string } {
    const toy = toyName || 'a toy'
    const templates = [
      `${guineaPigName} plays with ${toy}`,
      `${guineaPigName} pushes ${toy} around playfully`,
      `${guineaPigName} investigates ${toy} with curiosity`,
      `${guineaPigName} has fun with ${toy}`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '🎾' }
  }

  static generateAutonomousShelterMessage(guineaPigName: string, shelterName?: string): { message: string; emoji: string } {
    const shelter = shelterName || 'a cozy shelter'
    const templates = [
      `${guineaPigName} seeks shelter in ${shelter}`,
      `${guineaPigName} retreats to ${shelter}`,
      `${guineaPigName} finds security in ${shelter}`,
      `${guineaPigName} settles into ${shelter}`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '🏠' }
  }

  static generateAutonomousPopcornMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `${guineaPigName} does excited popcorn jumps!`,
      `${guineaPigName} popcorns with joy! ✨`,
      `${guineaPigName} leaps and twists happily!`,
      `${guineaPigName} bounces around excitedly!`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '✨' }
  }

  static generateAutonomousZoomiesMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `${guineaPigName} does zoomies around the habitat!`,
      `${guineaPigName} races around with excitement!`,
      `${guineaPigName} runs laps at full speed!`,
      `${guineaPigName} zooms around energetically!`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '💨' }
  }

  static generateAutonomousWatchMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `${guineaPigName} watches you with curiosity`,
      `${guineaPigName} observes you quietly`,
      `${guineaPigName} looks at you with interest`,
      `${guineaPigName} pays attention to your activities`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '👀' }
  }

  static generateAutonomousHideMessage(guineaPigName: string): { message: string; emoji: string } {
    const templates = [
      `${guineaPigName} hides nervously in their shelter`,
      `${guineaPigName} retreats to a safe hiding spot`,
      `${guineaPigName} seeks shelter cautiously`,
      `${guineaPigName} tucks into their hideaway`
    ]
    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '😰' }
  }

  static generateAutonomousPoopMessage(guineaPigName: string, location?: string): { message: string; emoji: string } {
    // Only show meaningful locations (water bottle, food bowl, shelter, igloo)
    const meaningfulLocations = ['water bottle', 'food bowl', 'shelter', 'hideaway', 'hideout', 'igloo', 'bottle', 'bowl']
    const hasLocation = location && meaningfulLocations.some(loc => location.toLowerCase().includes(loc))

    let templates: string[]

    if (hasLocation) {
      templates = [
        `${guineaPigName} left a poop near the ${location}.`,
        `${guineaPigName} pooped near the ${location}.`,
        `${guineaPigName} made a little mess near the ${location}.`
      ]
    } else {
      templates = [
        `${guineaPigName} left a poop.`,
        `${guineaPigName} pooped.`,
        `${guineaPigName} made a little mess.`,
        `${guineaPigName} contributed to habitat maintenance.`
      ]
    }

    return { message: templates[Math.floor(Math.random() * templates.length)], emoji: '💩' }
  }
}

// Convenience functions for direct use
export const generatePlayerAction = MessageGenerator.generatePlayerAction
export const generateGuineaPigReaction = MessageGenerator.generateGuineaPigReaction
export const generateAutonomousBehavior = MessageGenerator.generateAutonomousBehavior
export const generateEnvironmentalEvent = MessageGenerator.generateEnvironmentalEvent
export const generateAchievement = MessageGenerator.generateAchievement
export const generatePreferenceReaction = MessageGenerator.generatePreferenceReaction
export const generateContextualMessage = MessageGenerator.generateContextualMessage