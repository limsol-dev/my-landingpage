export type Program = {
  id: string
  category: "healing" | "education" | "pension"
  title: string
  description: string
  duration: string
  price: number
  minParticipants: number
  image: string
  tags: string[]
  isRecommended?: boolean
  details: {
    schedule: string[]
    includes: string[]
    notice: string[]
  }
} 