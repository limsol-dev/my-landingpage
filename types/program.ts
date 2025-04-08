export type Program = {
  id: string
  category: "healing" | "education" | "family" | "health"
  title: string
  description: string
  duration: string
  price: number
  minParticipants: number
  image: string
  tags: string[]
  details: {
    schedule: string[]
    includes: string[]
    notice: string[]
  }
} 