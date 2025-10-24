export type WeeklyPlan = {
  id: number
  title: string
  price: number
  description: string
  image: string
  button: {
    label: string
    icon: string
    click: () => void
  }
}

export interface FoodItem {
  id: number
  name: string
  calories: number
}

export interface Meal {
  id: number
  mainDish: FoodItem
  side1?: FoodItem | null
  side2?: FoodItem | null
  ramekin: FoodItem | null
  contenedor: string
  image: string
  description: string
}

export interface DayMenu {
  id: number
  dayOfWeek: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snack1: Meal
  snack2: Meal
}

export interface WeeklyMenu {
  id: number
  createdAt: string
  updatedAt: string
  startDate: string
  endDate: string
  name: string
  isActive: boolean
  daysStd: DayMenu[]
  daysVeg: DayMenu[]
}

export interface Menu {
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}
