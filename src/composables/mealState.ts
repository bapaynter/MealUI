import { ref } from 'vue'
import * as z from 'zod'
import { executeSearch } from '@/utils/bravesearch'
import { generate } from '@/utils/openrouter'
import { scrapeContent } from '@/utils/scrapeweb'
import type { MealPlan, MealPreferences, GroceryItem, GroceryList } from '@/types'
import { mealPlannerPrompt, groceryPlannerPrompt } from '@/utils/prompts'
import { useStorage } from '@vueuse/core'

const mealState = ref<'data_entry' | 'recipe_list' | 'grocery_list' | 'loading'>('data_entry')

const groceryList = ref<string>('') //ref<GroceryList>([])
const recipes = ref<MealPlan>({ lunches: [], dinners: [] })
const mealPreferences = {
  cuisinePreferences: '',
  lunchesPerWeek: 0,
  dinnersPerWeek: 0,
  portionsPerMeal: 2,
}
const preferenceState = useStorage('mealui_mealPreferences', mealPreferences, localStorage)
const mealuiSettings = { brave_api_key: '', openrouter_api_key: '' }
const settingsState = useStorage('mealui_settings', mealuiSettings, localStorage)
const realRecipes = ref<MealPlan>({ lunches: [], dinners: [] })
const tokensUsed = ref<{ in: number; out: number }>({ in: 0, out: 0 })
const searchesDone = ref<number>(0)

export function useMealState() {
  function generateMealPlan(): void {
    mealState.value = 'loading'
    const schema = z.toJSONSchema(
      z.object({
        dinners: z.array(z.string()).describe('List of dinner meals'),
        lunches: z.array(z.string()).describe('List of lunch meals'),
      }),
    )

    const instructions = `Generate a meal plan with ${preferenceState.value.lunchesPerWeek} lunches and ${preferenceState.value.dinnersPerWeek} dinners that fit the following preferences: ${preferenceState.value.cuisinePreferences}. Respond in JSON format with "lunches" and "dinners" arrays.`
    // Simulate an async operation to generate meal plan
    generate(mealPlannerPrompt, instructions, schema, settingsState.value.openrouter_api_key)
      .then(({ response, tokens }) => {
        tokensUsed.value.in += tokens.in as number
        tokensUsed.value.out += tokens.out as number
        const parsed = z
          .object({
            dinners: z.array(z.string()),
            lunches: z.array(z.string()),
          })
          .safeParse(response ? JSON.parse(response) : {})
        if (parsed.success) {
          recipes.value = {
            dinners: parsed.data.dinners
              .map((d) => ({ description: d }))
              .slice(-preferenceState.value.dinnersPerWeek),
            lunches: parsed.data.lunches
              .map((l) => ({ description: l }))
              .slice(-preferenceState.value.lunchesPerWeek),
          }
        } else {
          console.error('Failed to parse meal plan response:', parsed.error)
        }
        mealState.value = 'recipe_list'
      })
      .catch((error: Error | unknown) => {
        if (error instanceof Error) {
          console.error('Error generating meal plan:', error.message)
        } else {
          console.error('Unknown error generating meal plan')
        }
        mealState.value = 'data_entry'
      })
  }

  async function findRecipe(recipe: string, category: 'dinners' | 'lunches') {
    const search_response = await executeSearch(
      `${recipe} recipe`,
      5,
      settingsState.value.brave_api_key,
    )
    searchesDone.value += 1
    let webContent = ''
    let webUrl = ''
    while (!webContent && search_response.length > 0) {
      const currentResult = search_response.shift()
      if (!currentResult) break
      try {
        webContent = await scrapeContent(currentResult.url)
        if (webContent) {
          webUrl = currentResult.url
        }
      } catch (error) {
        console.error(`Error scraping web content for ${currentResult.url}:`, error)
        continue
      }
    }
    const schema = z.toJSONSchema(
      z.object({
        title: z.string().describe('Title of the recipe'),
        ingredientList: z.string().describe('Full list of ingredients for the recipe'),
      }),
    )
    const instructions = `Extract the ingredients needed for the recipe described in the following webpage content, and adjust them so they make ${preferenceState.value.portionsPerMeal} portions:\n\n${webContent}\n\n Reply with only the title of the recipe and the full list of ingredients, adjusted for the requested portions.`
    return generate('', instructions, schema, settingsState.value.openrouter_api_key)
      .then(({ response, tokens }) => {
        tokensUsed.value.in += tokens.in as number
        tokensUsed.value.out += tokens.out as number
        const parsed = z
          .object({
            title: z.string(),
            ingredientList: z.string(),
          })
          .safeParse(response ? JSON.parse(response) : {})
        if (parsed.success) {
          realRecipes.value[category].push({
            description: parsed.data.title,
            link: webUrl,
            ingredients: parsed.data.ingredientList,
          })
          return true
        } else {
          console.error('Failed to parse meal plan response:', parsed.error)
        }
      })
      .catch((error: Error | unknown) => {
        if (error instanceof Error) {
          console.error('Error generating ingredient list:', error.message)
        } else {
          console.error('Unknown error generating ingredient list')
        }
        mealState.value = 'recipe_list'
      })
  }

  async function generateGroceryList() {
    mealState.value = 'loading'
    // Simulate an async operation to generate grocery list
    const searchPromises = []
    for (const dinner of recipes.value.dinners) {
      searchPromises.push(findRecipe(dinner.description, 'dinners'))
    }
    for (const lunch of recipes.value.lunches) {
      searchPromises.push(findRecipe(lunch.description, 'lunches'))
    }
    await Promise.all(searchPromises)
    recipes.value = realRecipes.value

    let fullIngredientList = ''
    recipes.value.dinners.forEach((dinner) => (fullIngredientList += dinner.ingredients))
    recipes.value.lunches.forEach((lunch) => (fullIngredientList += lunch.ingredients))

    const instructions = `
Format the following grocery list into a readable format, grouped by type (e.g. Produce, Proteins, Pantry, Dairy).
Round the quantities to be formatted as nice fractions or whole numbers instead of decimals.
If there are 2 entries for the same item, combine them into one entry with the total quantity.
Do not include anything in your reply except the formatted list.
\n\n-----\n\n
${fullIngredientList}`

    generate(groceryPlannerPrompt, instructions, null, settingsState.value.openrouter_api_key)
      .then(({ response, tokens }) => {
        tokensUsed.value.in += tokens.in as number
        tokensUsed.value.out += tokens.out as number
        groceryList.value = response
        mealState.value = 'grocery_list'
      })
      .catch((error: Error | unknown) => {
        if (error instanceof Error) {
          console.error('Error generating meal plan:', error.message)
        } else {
          console.error('Unknown error generating meal plan')
        }
        mealState.value = 'recipe_list'
      })
  }

  return {
    mealState,
    groceryList,
    recipes,
    tokensUsed,
    searchesDone,
    generateMealPlan,
    generateGroceryList,
  }
}
