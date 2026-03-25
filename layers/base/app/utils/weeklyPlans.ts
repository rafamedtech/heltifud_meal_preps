import type { WeeklyPlan } from "~~/layers/menu/shared/types/types"

export const weeklyPlans: WeeklyPlan[] = [
  {
    id: 1,
    title: "Plan desayunos",
    price: 1200,
    description: "Desayunos saludables a domicilio para empezar tu día con energía.",
    image: "v1746204413/heltifud/desayunos_xoypat.png",
    variants: [
      { title: "3 días", price: "400" },
      { title: "4 días", price: "500" },
      { title: "5 días", price: "600" }
    ],
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list"
    }
  },
  {
    id: 2,
    title: "Plan comidas",
    price: 2400,
    description: "Comidas caseras y balanceadas listas para tu semana sin cocinar.",
    image: "v1746204412/heltifud/comidas_zjbuum.png",
    variants: [
      { title: "3 días", price: "500" },
      { title: "4 días", price: "600" },
      { title: "5 días", price: "700" }
    ],
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list"
    }
  },
  {
    id: 3,
    title: "Plan cenas",
    price: 4800,
    description: "Cenas ligeras y deliciosas, entregadas listas para servir.",
    image: "v1746204411/heltifud/cenas_wfp48j.png",
    variants: [
      { title: "3 días", price: "450" },
      { title: "4 días", price: "550" },
      { title: "5 días", price: "650" }
    ],
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list"
    }
  },
  {
    id: 4,
    title: "Plan toda la semana",
    price: 1900,
    description: "Meal prep completo semanal con desayuno, comida y cena.",
    image: "v1746204413/heltifud/todas_pdzwgw.png",
    variants: [
      { title: "3 días", price: "1300" },
      { title: "5 días", price: "1900" }
    ],
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list"
    }
  }
]
