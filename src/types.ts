export type Meal = {
  description: string
  link?: string
  ingredients?: string
}

export type MealPlan = {
  lunches: Meal[]
  dinners: Meal[]
}

export type GroceryItem = {
  name: string
  quantity: string
  category: string
}

export type GroceryList = GroceryItem[]

export type MealPreferences = {
  dietaryRestrictions: string
  cuisinePreferences: string
  dislikedIngredients: string
  mealFrequency: {
    lunchesPerWeek: number
    dinnersPerWeek: number
  }
  portionsPerMeal: number
}
