export type UserRole = 'student' | 'admin'
export type SubscriptionStatus = 'inactive' | 'active' | 'past_due' | 'canceled'
export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked'
export type ChallengeStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined' | 'expired'
export type ChatRole = 'user' | 'assistant'
export type CorrectAnswer = 'A' | 'B' | 'C' | 'D'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: UserRole
  avatar_color: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  xp: number
  streak_days: number
  last_active_date: string | null
  last_seen: string
  created_at: string
}

export interface Content {
  id: string
  title: string
  class_name: string
  topic: string
  file_url: string | null
  file_type: string | null
  raw_text: string | null
  is_published: boolean
  is_exam_priority: boolean
  created_at: string
}

export interface StudyGuide {
  id: string
  content_id: string
  guide_text: string | null
  created_at: string
}

export interface Flashcard {
  id: string
  content_id: string
  front: string
  back: string
  created_at: string
}

export interface QuizQuestion {
  id: string
  content_id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: CorrectAnswer
  explanation: string | null
  created_at: string
}

export interface Exam {
  id: string
  title: string
  exam_date: string
  topic_tags: string[] | null
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  content_id: string
  score: number | null
  total_questions: number | null
  xp_earned: number | null
  completed_at: string
}

export interface Challenge {
  id: string
  challenger_id: string
  challenged_id: string
  content_id: string
  status: ChallengeStatus
  challenger_score: number | null
  challenged_score: number | null
  winner_id: string | null
  xp_awarded: number
  created_at: string
}

export interface BadgeRow {
  id: string
  name: string
  description: string | null
  icon: string | null
  xp_threshold: number | null
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  content_id: string
  role: ChatRole
  message: string
  created_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export interface DirectMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
}

/* ---------- composite shapes used across the app ---------- */

export interface ContentWithExtras extends Content {
  study_guides?: StudyGuide[]
  flashcards?: Flashcard[]
  quiz_questions?: QuizQuestion[]
}

export interface FriendshipWithProfiles extends Friendship {
  requester?: Profile
  addressee?: Profile
}

export interface ChallengeWithRelations extends Challenge {
  challenger?: Profile
  challenged?: Profile
  content?: Content
}

export interface UserBadgeWithBadge extends UserBadge {
  badge?: BadgeRow
}
