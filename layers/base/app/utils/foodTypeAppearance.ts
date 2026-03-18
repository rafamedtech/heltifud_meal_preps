export interface FoodTypeAppearance {
  color: "neutral" | "info"
  className: string
  icon: string
  label: string
}

export function getFoodTypeAppearance(tipo: string): FoodTypeAppearance {
  const normalizedType = (tipo || "").trim().toLowerCase()

  switch (normalizedType) {
    case "desayuno":
      return {
        color: "neutral",
        className: "bg-cyan-500/12 text-cyan-700 ring-cyan-500/25 dark:bg-cyan-400/14 dark:text-cyan-300 dark:ring-cyan-400/25",
        icon: "i-lucide-sunrise",
        label: "Desayuno"
      }
    case "comida":
      return {
        color: "neutral",
        className: "bg-amber-500/12 text-amber-700 ring-amber-500/25 dark:bg-amber-400/14 dark:text-amber-300 dark:ring-amber-400/25",
        icon: "i-lucide-utensils-crossed",
        label: "Comida"
      }
    case "cena":
      return {
        color: "neutral",
        className: "bg-indigo-500/12 text-indigo-700 ring-indigo-500/25 dark:bg-indigo-400/14 dark:text-indigo-300 dark:ring-indigo-400/25",
        icon: "i-lucide-moon-star",
        label: "Cena"
      }
    case "snack":
      return {
        color: "neutral",
        className: "bg-rose-500/12 text-rose-700 ring-rose-500/25 dark:bg-rose-400/14 dark:text-rose-300 dark:ring-rose-400/25",
        icon: "i-lucide-apple",
        label: "Snack"
      }
    case "guarnicion":
      return {
        color: "neutral",
        className: "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300 dark:ring-zinc-400/20",
        icon: "i-lucide-leaf",
        label: "Guarnición"
      }
    case "ramekin":
      return {
        color: "info",
        className: "",
        icon: "i-lucide-cooking-pot",
        label: "Ramekin"
      }
    default:
      return {
        color: "neutral",
        className: "",
        icon: "i-lucide-tag",
        label: normalizedType ? normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1) : "Sin tipo"
      }
  }
}
