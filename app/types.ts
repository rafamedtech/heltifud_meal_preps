export type WeeklyPlan = {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  button: {
    label: string;
    icon: string;
    click: () => void;
  };
};

export interface FoodItem {
  id: number;
  name: string;
  calories: number;
}

export interface Meal {
  id: number;
  mainDish: FoodItem;
  side1: FoodItem;
  side2: FoodItem;
  ramekin: FoodItem;
  contenedor: string;
  image: string;
  description: string;
}

export interface DayMenu {
  id: number;
  dayOfWeek: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack1: Meal;
  snack2: Meal;
}

export interface WeeklyMenu {
  id: number;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  name: string;
  type: 'std' | 'veg' | 'lowcarb' | string;
  isActive: boolean;
  days: DayMenu[];
}
