import type { WeeklyMenu } from "~~/layers/menu/shared/types/types"

export const menus: WeeklyMenu[] = [
  {
    id: 1,
    createdAt: "2023-10-01",
    updatedAt: "2023-10-01",
    startDate: "2026/03/02",
    endDate: "2026/03/06",
    name: "Menú Semanal 1",
    isActive: true,
    daysStd: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Omelette vegetariano", calories: 309 },
          side1: { id: 201, name: "Chilaquiles rojos", calories: 169 },
          side2: null,
          ramekin: { id: 301, name: "Salsa", calories: 0 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Pasta con pollo en crema de cilantro", calories: 374 },
          side1: { id: 203, name: "Verduras al vapor", calories: 43 },
          side2: null,
          ramekin: { id: 302, name: "", calories: 0 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Quesadillas de pollo", calories: 444 },
          side1: null,
          side2: null,
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Breakfast burrito", calories: 501 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Bistec ranchero", calories: 318 },
          side1: { id: 213, name: "Frijol", calories: 278 },
          side2: null,
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pescado empanizado", calories: 304 },
          side1: { id: 215, name: "Puré de papa", calories: 123 },
          side2: { id: 215, name: "Verduras al vapor", calories: 29 },

          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 3,
        dayOfWeek: "Miércoles",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Bowl de avena con fruta", calories: 530 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Miel de abeja", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,

          mainDish: { id: 107, name: "Fajitas de pollo", calories: 305 },
          side1: { id: 213, name: "Lentejas", calories: 174 },
          side2: null,
          ramekin: { id: 307, name: "", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Huarache de carne asada", calories: 527 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Salsa", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 4,
        dayOfWeek: "Jueves",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Sándwich de huevo", calories: 353 },
          side1: { id: 107, name: "Fruta de temporada", calories: 74 },
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Salteado de res", calories: 271 },
          side1: { id: 207, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Ensalada de pollo fría", calories: 568 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 5,
        dayOfWeek: "Viernes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Tortilla española", calories: 504 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Wrap de ensalada cesar", calories: 347 },
          side1: { id: 213, name: "Puré de papa", calories: 123 },

          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Sándwich de panela", calories: 411 },
          side1: { id: 205, name: "Camote horneado", calories: 114 },
          side2: null,
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ],
    daysVeg: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Tortilla de espinacas", calories: 300 },
          side1: { id: 201, name: "Fruta de temporada", calories: 80 },
          side2: null,
          ramekin: { id: 301, name: "Mermelada de fresa", calories: 50 },
          contenedor: "Contenedor 1",
          image: "/tortilla-espinacas.jpeg",
          description:
            "Tortilla de espinacas con queso feta y tomate, acompañada de fruta de temporada y yogur natural."
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Portobello asado", calories: 350 },
          side1: { id: 203, name: "Ensalada de lechuga y tomate", calories: 70 },
          side2: { id: 204, name: "Quinoa", calories: 180 },
          ramekin: { id: 302, name: "Aderezo de mostaza y miel", calories: 90 },
          contenedor: "Contenedor 2",
          image: "/pechuga-plancha.jpeg",
          description: "Pechuga a la plancha con ensalada de lechuga y tomate, acompañada de arroz integral."
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Salmón al horno", calories: 400 },
          side1: { id: 205, name: "Espárragos al vapor", calories: 60 },
          side2: { id: 206, name: "Quinoa", calories: 170 },
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "/salmón-horno.jpeg",
          description: "Salmón al horno con espárragos al vapor y quinoa, acompañado de salsa de yogur y eneldo."
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Tostadas de aguacate", calories: 320 },
          side1: { id: 211, name: "Huevo pochado", calories: 140 },
          side2: { id: 212, name: "Fruta de temporada", calories: 80 },
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "/tostadas-aguacate.jpeg",
          description: "Tostadas de aguacate con huevo pochado y fruta de temporada, acompañadas de salsa picante."
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Ensalada César con pollo", calories: 400 },
          side1: { id: 213, name: "Crutones", calories: 90 },
          side2: { id: 214, name: "Queso parmesano", calories: 120 },
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "/ensalada-cesar.jpeg",
          description: "Ensalada César con pollo, crutones y queso parmesano, acompañada de aderezo César."
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pasta integral con verduras salteadas", calories: 420 },
          side1: { id: 215, name: "Aceitunas negras", calories: 60 },
          side2: { id: 216, name: "Parmesano rallado", calories: 100 },
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "/pasta-verduras.jpeg",
          description:
            "Pasta integral con verduras salteadas, aceitunas negras y parmesano rallado, acompañada de aceite de oliva virgen extra."
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ]
  },
  {
    id: 2,
    createdAt: "2023/10/01",
    updatedAt: "2023/10/01",
    startDate: "2026/03/09",
    endDate: "2026/03/13",
    name: "Menú Semanal 2",
    isActive: false,
    daysStd: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Toasts de aguacate y huevo", calories: 491 },
          side1: null,
          side2: null,
          ramekin: { id: 301, name: "Salsa", calories: 0 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Enchiladas verdes", calories: 413 },
          side1: { id: 203, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 302, name: "", calories: 0 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 1,
          mainDish: { id: 108, name: "Pescado cajún", calories: 202 },
          side1: { id: 215, name: "Arroz blanco", calories: 222 },
          side2: { id: 216, name: "Verduras al vapor", calories: 43 },
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Hash de papa", calories: 487 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 3,
          mainDish: { id: 107, name: "Sándwich patty melt", calories: 410 },
          side1: { id: 213, name: "Fries de camote", calories: 114 },
          side2: null,
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Tacos de pollo adobado", calories: 418 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },

        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 3,
        dayOfWeek: "Miércoles",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Deshebrada con huevo", calories: 333 },
          side1: { id: 107, name: "Frijol", calories: 278 },
          side2: null,
          ramekin: { id: 306, name: "Miel de abeja", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Papa rellena con pollo", calories: 427 },
          side1: null,
          side2: null,
          ramekin: { id: 307, name: "", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Chow mein de pollo", calories: 545 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Salsa", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 4,
        dayOfWeek: "Jueves",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Omelette italiano", calories: 274 },
          side1: { id: 107, name: "Papas campesinas", calories: 171 },
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Carne en su jugo", calories: 524 },
          side1: null,
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },

        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Sándwich de pollo pesto", calories: 435 },
          side1: { id: 215, name: "Fries de camote", calories: 114 },
          side2: null,
          ramekin: null,
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },

        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 5,
        dayOfWeek: "Viernes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Wrap de huevo con tocino", calories: 488 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Pechuga en salsa tatemada", calories: 305 },
          side1: { id: 213, name: "Arroz rojo", calories: 226 },
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Deshebrada de res en salsa", calories: 386 },
          side1: { id: 109, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ],
    daysVeg: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Tortilla de espinacas", calories: 300 },
          side1: { id: 201, name: "Fruta de temporada", calories: 80 },
          side2: null,
          ramekin: { id: 301, name: "Mermelada de fresa", calories: 50 },
          contenedor: "Contenedor 1",
          image: "/tortilla-espinacas.jpeg",
          description:
            "Tortilla de espinacas con queso feta y tomate, acompañada de fruta de temporada y yogur natural."
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Portobello asado", calories: 350 },
          side1: { id: 203, name: "Ensalada de lechuga y tomate", calories: 70 },
          side2: { id: 204, name: "Quinoa", calories: 180 },
          ramekin: { id: 302, name: "Aderezo de mostaza y miel", calories: 90 },
          contenedor: "Contenedor 2",
          image: "/pechuga-plancha.jpeg",
          description: "Pechuga a la plancha con ensalada de lechuga y tomate, acompañada de arroz integral."
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Salmón al horno", calories: 400 },
          side1: { id: 205, name: "Espárragos al vapor", calories: 60 },
          side2: { id: 206, name: "Quinoa", calories: 170 },
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "/salmón-horno.jpeg",
          description: "Salmón al horno con espárragos al vapor y quinoa, acompañado de salsa de yogur y eneldo."
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Tostadas de aguacate", calories: 320 },
          side1: { id: 211, name: "Huevo pochado", calories: 140 },
          side2: { id: 212, name: "Fruta de temporada", calories: 80 },
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "/tostadas-aguacate.jpeg",
          description: "Tostadas de aguacate con huevo pochado y fruta de temporada, acompañadas de salsa picante."
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Ensalada César con pollo", calories: 400 },
          side1: { id: 213, name: "Crutones", calories: 90 },
          side2: { id: 214, name: "Queso parmesano", calories: 120 },
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "/ensalada-cesar.jpeg",
          description: "Ensalada César con pollo, crutones y queso parmesano, acompañada de aderezo César."
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pasta integral con verduras salteadas", calories: 420 },
          side1: { id: 215, name: "Aceitunas negras", calories: 60 },
          side2: { id: 216, name: "Parmesano rallado", calories: 100 },
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "/pasta-verduras.jpeg",
          description:
            "Pasta integral con verduras salteadas, aceitunas negras y parmesano rallado, acompañada de aceite de oliva virgen extra."
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ]
  },
  {
    id: 3,
    createdAt: "2023/10/01",
    updatedAt: "2023/10/01",
    startDate: "2026/02/2",
    endDate: "2026/02/6",
    name: "Menú Semanal 3",
    isActive: false,
    daysStd: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Omelette de pechuga de pavo", calories: 324 },
          side1: { id: 201, name: "Chilaquiles verdes", calories: 228 },
          side2: null,
          ramekin: { id: 301, name: "Salsa", calories: 0 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Pollo en crema de chipotle", calories: 256 },
          side1: { id: 202, name: "Arroz blanco", calories: 222 },
          side2: { id: 203, name: "Verduras al vapor", calories: 43 },
          ramekin: { id: 302, name: "", calories: 0 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 1,
          mainDish: { id: 108, name: "Ensalada de pollo", calories: 416 },
          side1: null,
          side2: null,
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Huevo en salsa roja", calories: 310 },
          side1: { id: 211, name: "Frijol", calories: 278 },
          side2: null,
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Fajitas de res", calories: 386 },
          side1: { id: 207, name: "Arroz con cilantro", calories: 222 },
          side2: null,
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pescado teriyaki", calories: 294 },
          side1: { id: 215, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 3,
        dayOfWeek: "Miércoles",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Papa con salchicha y huevo", calories: 479 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Miel de abeja", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Pechuga a la plancha", calories: 250 },
          side1: { id: 213, name: "Puré de camote y papa", calories: 184 },
          side2: { id: 214, name: "Verduras salteadas", calories: 35 },
          ramekin: { id: 307, name: "", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pita de pollo pesto", calories: 455 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Salsa", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 4,
        dayOfWeek: "Jueves",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Burritos de huevo con chorizo", calories: 558 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Salsa", calories: 20 },
          contenedor: "Sin división",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Bistec en salsa roja", calories: 306 },
          side1: { id: 213, name: "Frijol", calories: 278 },
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Sin división",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Chiles rellenos de panela", calories: 440 },
          side1: { id: 215, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 5,
        dayOfWeek: "Viernes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Huevos a la mexicana", calories: 222 },
          side1: { id: 107, name: "Frijol", calories: 278 },
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Milanesa de pollo", calories: 259 },
          side1: { id: 213, name: "Mac n cheese", calories: 282 },
          side2: { id: 214, name: "Verduras salteadas", calories: 43 },
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pescado al vapor", calories: 242 },
          side1: { id: 109, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ],
    daysVeg: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Tortilla de espinacas", calories: 300 },
          side1: { id: 201, name: "Fruta de temporada", calories: 80 },
          side2: null,
          ramekin: { id: 301, name: "Mermelada de fresa", calories: 50 },
          contenedor: "Contenedor 1",
          image: "/tortilla-espinacas.jpeg",
          description:
            "Tortilla de espinacas con queso feta y tomate, acompañada de fruta de temporada y yogur natural."
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Portobello asado", calories: 350 },
          side1: { id: 203, name: "Ensalada de lechuga y tomate", calories: 70 },
          side2: { id: 204, name: "Quinoa", calories: 180 },
          ramekin: { id: 302, name: "Aderezo de mostaza y miel", calories: 90 },
          contenedor: "Contenedor 2",
          image: "/pechuga-plancha.jpeg",
          description: "Pechuga a la plancha con ensalada de lechuga y tomate, acompañada de arroz integral."
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Salmón al horno", calories: 400 },
          side1: { id: 205, name: "Espárragos al vapor", calories: 60 },
          side2: { id: 206, name: "Quinoa", calories: 170 },
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "/salmón-horno.jpeg",
          description: "Salmón al horno con espárragos al vapor y quinoa, acompañado de salsa de yogur y eneldo."
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Tostadas de aguacate", calories: 320 },
          side1: { id: 211, name: "Huevo pochado", calories: 140 },
          side2: { id: 212, name: "Fruta de temporada", calories: 80 },
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "/tostadas-aguacate.jpeg",
          description: "Tostadas de aguacate con huevo pochado y fruta de temporada, acompañadas de salsa picante."
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Ensalada César con pollo", calories: 400 },
          side1: { id: 213, name: "Crutones", calories: 90 },
          side2: { id: 214, name: "Queso parmesano", calories: 120 },
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "/ensalada-cesar.jpeg",
          description: "Ensalada César con pollo, crutones y queso parmesano, acompañada de aderezo César."
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pasta integral con verduras salteadas", calories: 420 },
          side1: { id: 215, name: "Aceitunas negras", calories: 60 },
          side2: { id: 216, name: "Parmesano rallado", calories: 100 },
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "/pasta-verduras.jpeg",
          description:
            "Pasta integral con verduras salteadas, aceitunas negras y parmesano rallado, acompañada de aceite de oliva virgen extra."
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ]
  },
  {
    id: 4,
    createdAt: "2023-10-01",
    updatedAt: "2023-10-01",
    startDate: "2026/02/09",
    endDate: "2026/02/13",
    name: "Menú Semanal 4",
    isActive: false,
    daysStd: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Pancakes de zanahoria", calories: 456 },
          side1: null,
          side2: null,
          ramekin: { id: 301, name: "Salsa", calories: 0 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Pollo ranchero", calories: 240 },
          side1: { id: 202, name: "Arroz rojo", calories: 226 },
          side2: null,
          ramekin: { id: 302, name: "", calories: 0 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 1,
          mainDish: { id: 108, name: "Quesadilla de carne asada", calories: 459 },
          side1: null,
          side2: null,
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Sándwich japonés", calories: 416 },
          side1: { id: 211, name: "Fruta de temporada", calories: 74 },
          side2: null,
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Pasta stroganoff de res", calories: 507 },
          side1: null,
          side2: null,
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Spring rolls de pollo", calories: 403 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 3,
        dayOfWeek: "Miércoles",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Huevos con verduras", calories: 270 },
          side1: { id: 206, name: "Frijol", calories: 278 },
          side2: null,
          ramekin: { id: 306, name: "Miel de abeja", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Estofado de pollo", calories: 355 },
          side1: { id: 213, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 307, name: "", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Atún a la mexicana", calories: 420 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Salsa", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 4,
        dayOfWeek: "Jueves",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Chilaquiles en chipotle con huevo", calories: 492 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Pescado a la mostaza", calories: 154 },
          side1: { id: 213, name: "Arroz rojo", calories: 226 },
          side2: { id: 213, name: "Verduras al vapor", calories: 43 },

          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Wrap de pollo con tocino", calories: 601 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 5,
        dayOfWeek: "Viernes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Omelette de jamón serrano", calories: 311 },
          side1: { id: 107, name: "Papas horneadas", calories: 131 },
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Teriyaki de pollo", calories: 278 },
          side1: { id: 213, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Sopa de verduras con pollo", calories: 445 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ],
    daysVeg: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Tortilla de espinacas", calories: 300 },
          side1: { id: 201, name: "Fruta de temporada", calories: 80 },
          side2: null,
          ramekin: { id: 301, name: "Mermelada de fresa", calories: 50 },
          contenedor: "Contenedor 1",
          image: "/tortilla-espinacas.jpeg",
          description:
            "Tortilla de espinacas con queso feta y tomate, acompañada de fruta de temporada y yogur natural."
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Portobello asado", calories: 350 },
          side1: { id: 203, name: "Ensalada de lechuga y tomate", calories: 70 },
          side2: { id: 204, name: "Quinoa", calories: 180 },
          ramekin: { id: 302, name: "Aderezo de mostaza y miel", calories: 90 },
          contenedor: "Contenedor 2",
          image: "/pechuga-plancha.jpeg",
          description: "Pechuga a la plancha con ensalada de lechuga y tomate, acompañada de arroz integral."
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Salmón al horno", calories: 400 },
          side1: { id: 205, name: "Espárragos al vapor", calories: 60 },
          side2: { id: 206, name: "Quinoa", calories: 170 },
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "/salmón-horno.jpeg",
          description: "Salmón al horno con espárragos al vapor y quinoa, acompañado de salsa de yogur y eneldo."
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Tostadas de aguacate", calories: 320 },
          side1: { id: 211, name: "Huevo pochado", calories: 140 },
          side2: { id: 212, name: "Fruta de temporada", calories: 80 },
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "/tostadas-aguacate.jpeg",
          description: "Tostadas de aguacate con huevo pochado y fruta de temporada, acompañadas de salsa picante."
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Ensalada César con pollo", calories: 400 },
          side1: { id: 213, name: "Crutones", calories: 90 },
          side2: { id: 214, name: "Queso parmesano", calories: 120 },
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "/ensalada-cesar.jpeg",
          description: "Ensalada César con pollo, crutones y queso parmesano, acompañada de aderezo César."
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pasta integral con verduras salteadas", calories: 420 },
          side1: { id: 215, name: "Aceitunas negras", calories: 60 },
          side2: { id: 216, name: "Parmesano rallado", calories: 100 },
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "/pasta-verduras.jpeg",
          description:
            "Pasta integral con verduras salteadas, aceitunas negras y parmesano rallado, acompañada de aceite de oliva virgen extra."
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ]
  },
  {
    id: 5,
    createdAt: "2023-10-01",
    updatedAt: "2023-10-01",
    startDate: "2026/02/16",
    endDate: "2026/02/20",
    name: "Menú Semanal 5",
    isActive: false,
    daysStd: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Omelette de panela y nopales", calories: 324 },
          side1: { id: 201, name: "Papas campesinas", calories: 171 },
          side2: null,
          ramekin: { id: 301, name: "Salsa", calories: 0 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Pechuga con rajas", calories: 245 },
          side1: { id: 213, name: "Arroz rojo", calories: 226 },
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },

        dinner: {
          id: 1,
          mainDish: { id: 108, name: "Tortitas de atún", calories: 447 },
          side1: null,
          side2: null,
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Bagel de pechuga de pavo", calories: 505 },
          side1: { id: 206, name: "Fruta de temporada", calories: 50 },
          side2: null,
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Espagueti con albóndigas", calories: 408 },
          side1: null,
          side2: null,
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Tinga de pollo", calories: 558 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 3,
        dayOfWeek: "Miércoles",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Huevos con pechuga de pavo", calories: 257 },
          side1: { id: 206, name: "Frijol", calories: 278 },
          side2: null,
          ramekin: { id: 306, name: "Miel de abeja", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Alambre de pollo", calories: 359 },
          side1: { id: 206, name: "Lentejas", calories: 174 },
          side2: null,
          ramekin: { id: 307, name: "", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pescado al mojo de ajo", calories: 266 },
          side1: { id: 307, name: "Verduras al vapor", calories: 29 },
          side2: { id: 202, name: "Arroz blanco", calories: 222 },
          ramekin: { id: 308, name: "Salsa", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 4,
        dayOfWeek: "Jueves",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Pan francés", calories: 394 },
          side1: { id: 206, name: "Fruta de temporada", calories: 74 },
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Salteado de carne molida", calories: 230 },
          side1: { id: 202, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Tenders de pechuga de pollo", calories: 265 },
          side1: { id: 206, name: "Papas horneadas", calories: 174 },
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 5,
        dayOfWeek: "Viernes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Omelette de champiñones", calories: 293 },
          side1: { id: 107, name: "Papas horneadas", calories: 131 },
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Pechuga BBQ", calories: 293 },
          side1: { id: 202, name: "Puré de papa", calories: 123 },
          side2: null,
          ramekin: { id: 302, name: "", calories: 0 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Panela en salsa", calories: 361 },
          side1: { id: 208, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ],
    daysVeg: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Tortilla de espinacas", calories: 300 },
          side1: { id: 201, name: "Fruta de temporada", calories: 80 },
          side2: null,
          ramekin: { id: 301, name: "Mermelada de fresa", calories: 50 },
          contenedor: "Contenedor 1",
          image: "/tortilla-espinacas.jpeg",
          description:
            "Tortilla de espinacas con queso feta y tomate, acompañada de fruta de temporada y yogur natural."
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Portobello asado", calories: 350 },
          side1: { id: 203, name: "Ensalada de lechuga y tomate", calories: 70 },
          side2: { id: 204, name: "Quinoa", calories: 180 },
          ramekin: { id: 302, name: "Aderezo de mostaza y miel", calories: 90 },
          contenedor: "Contenedor 2",
          image: "/pechuga-plancha.jpeg",
          description: "Pechuga a la plancha con ensalada de lechuga y tomate, acompañada de arroz integral."
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Salmón al horno", calories: 400 },
          side1: { id: 205, name: "Espárragos al vapor", calories: 60 },
          side2: { id: 206, name: "Quinoa", calories: 170 },
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "/salmón-horno.jpeg",
          description: "Salmón al horno con espárragos al vapor y quinoa, acompañado de salsa de yogur y eneldo."
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Tostadas de aguacate", calories: 320 },
          side1: { id: 211, name: "Huevo pochado", calories: 140 },
          side2: { id: 212, name: "Fruta de temporada", calories: 80 },
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "/tostadas-aguacate.jpeg",
          description: "Tostadas de aguacate con huevo pochado y fruta de temporada, acompañadas de salsa picante."
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Ensalada César con pollo", calories: 400 },
          side1: { id: 213, name: "Crutones", calories: 90 },
          side2: { id: 214, name: "Queso parmesano", calories: 120 },
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "/ensalada-cesar.jpeg",
          description: "Ensalada César con pollo, crutones y queso parmesano, acompañada de aderezo César."
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pasta integral con verduras salteadas", calories: 420 },
          side1: { id: 215, name: "Aceitunas negras", calories: 60 },
          side2: { id: 216, name: "Parmesano rallado", calories: 100 },
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "/pasta-verduras.jpeg",
          description:
            "Pasta integral con verduras salteadas, aceitunas negras y parmesano rallado, acompañada de aceite de oliva virgen extra."
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ]
  },
  {
    id: 6,
    createdAt: "02/23/2026",
    updatedAt: "02/23/2026",
    startDate: "02/23/2026",
    endDate: "02/27/2026",
    name: "Menú Semanal 6",
    isActive: false,
    daysStd: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Pancakes de chocolate con plátano", calories: 543 },
          side1: null,
          side2: null,
          ramekin: { id: 301, name: "Miel", calories: 0 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Shawarma de pollo", calories: 335 },
          side1: { id: 202, name: "Papas a la francesa", calories: 131 },
          side2: null,
          ramekin: { id: 302, name: "", calories: 0 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 1,
          mainDish: { id: 108, name: "Calabacitas suizas", calories: 307 },
          side1: { id: 208, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Croissant de pechuga de pavo", calories: 376 },
          side1: { id: 211, name: "Fruta de temporada", calories: 74 },
          side2: null,
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Chile relleno de carne y queso", calories: 266 },
          side1: { id: 213, name: "Arroz rojo", calories: 226 },
          side2: null,
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pollo coreano", calories: 317 },
          side1: { id: 208, name: "Arroz blanco", calories: 222 },
          side2: null,
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 3,
        dayOfWeek: "Miércoles",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Omelette de rajas", calories: 315 },
          side1: { id: 206, name: "Papas campesinas", calories: 171 },
          side2: null,
          ramekin: { id: 306, name: "Miel de abeja", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Pechuga rellena", calories: 319 },
          side1: { id: 207, name: "Puré de papa", calories: 123 },
          side2: null,
          ramekin: { id: 307, name: "", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Picadillo", calories: 410 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Salsa", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 4,
        dayOfWeek: "Jueves",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Entomatadas de queso panela", calories: 456 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Taco bowl", calories: 510 },
          side1: null,
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Sándwich de pollo", calories: 353 },
          side1: { id: 208, name: "Papas horneadas", calories: 131 },
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      },
      {
        id: 5,
        dayOfWeek: "Viernes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Papas mexicanas con huevo", calories: 442 },
          side1: null,
          side2: null,
          ramekin: { id: 306, name: "Catsup", calories: 20 },
          contenedor: "Contenedor 1",
          image: "",
          description: ""
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Enmoladas de pollo", calories: 333 },
          side1: { id: 213, name: "Arroz rojo", calories: 226 },
          side2: null,
          ramekin: { id: 307, name: "Salsa", calories: 100 },
          contenedor: "Contenedor 2",
          image: "",
          description: ""
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Crunchwrap de carne", calories: 353 },
          side1: null,
          side2: null,
          ramekin: { id: 308, name: "Aguacate", calories: 80 },
          contenedor: "Contenedor 3",
          image: "",
          description: ""
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ],
    daysVeg: [
      {
        id: 1,
        dayOfWeek: "Lunes",
        breakfast: {
          id: 1,
          mainDish: { id: 101, name: "Tortilla de espinacas", calories: 300 },
          side1: { id: 201, name: "Fruta de temporada", calories: 80 },
          side2: null,
          ramekin: { id: 301, name: "Mermelada de fresa", calories: 50 },
          contenedor: "Contenedor 1",
          image: "/tortilla-espinacas.jpeg",
          description:
            "Tortilla de espinacas con queso feta y tomate, acompañada de fruta de temporada y yogur natural."
        },
        lunch: {
          id: 1,
          mainDish: { id: 102, name: "Portobello asado", calories: 350 },
          side1: { id: 203, name: "Ensalada de lechuga y tomate", calories: 70 },
          side2: { id: 204, name: "Quinoa", calories: 180 },
          ramekin: { id: 302, name: "Aderezo de mostaza y miel", calories: 90 },
          contenedor: "Contenedor 2",
          image: "/pechuga-plancha.jpeg",
          description: "Pechuga a la plancha con ensalada de lechuga y tomate, acompañada de arroz integral."
        },
        dinner: {
          id: 1,
          mainDish: { id: 103, name: "Salmón al horno", calories: 400 },
          side1: { id: 205, name: "Espárragos al vapor", calories: 60 },
          side2: { id: 206, name: "Quinoa", calories: 170 },
          ramekin: { id: 303, name: "Salsa de yogur y eneldo", calories: 50 },
          contenedor: "Contenedor 3",
          image: "/salmón-horno.jpeg",
          description: "Salmón al horno con espárragos al vapor y quinoa, acompañado de salsa de yogur y eneldo."
        },
        snack1: {
          id: 1,
          mainDish: { id: 104, name: "Barra de granola", calories: 150 },
          side1: { id: 207, name: "Fruta de temporada", calories: 80 },
          side2: { id: 208, name: "Nueces", calories: 100 },
          ramekin: { id: 304, name: "Miel", calories: 60 },
          contenedor: "Contenedor 4",
          image: "/barra-granola.jpeg",
          description: "Barra de granola con fruta de temporada y nueces, acompañada de miel."
        },
        snack2: {
          id: 1,
          mainDish: { id: 105, name: "Batido de plátano y espinacas", calories: 200 },
          side1: { id: 209, name: "Semillas de chía", calories: 90 },
          side2: { id: 210, name: "Leche de almendras", calories: 70 },
          ramekin: { id: 305, name: "Proteína en polvo", calories: 110 },
          contenedor: "Contenedor 5",
          image: "/batido-espinacas.jpeg",
          description:
            "Batido de plátano y espinacas con semillas de chía y leche de almendras, acompañado de proteína en polvo."
        }
      },
      {
        id: 2,
        dayOfWeek: "Martes",
        breakfast: {
          id: 2,
          mainDish: { id: 106, name: "Tostadas de aguacate", calories: 320 },
          side1: { id: 211, name: "Huevo pochado", calories: 140 },
          side2: { id: 212, name: "Fruta de temporada", calories: 80 },
          ramekin: { id: 306, name: "Salsa picante", calories: 20 },
          contenedor: "Contenedor 1",
          image: "/tostadas-aguacate.jpeg",
          description: "Tostadas de aguacate con huevo pochado y fruta de temporada, acompañadas de salsa picante."
        },
        lunch: {
          id: 2,
          mainDish: { id: 107, name: "Ensalada César con pollo", calories: 400 },
          side1: { id: 213, name: "Crutones", calories: 90 },
          side2: { id: 214, name: "Queso parmesano", calories: 120 },
          ramekin: { id: 307, name: "Aderezo César", calories: 100 },
          contenedor: "Contenedor 2",
          image: "/ensalada-cesar.jpeg",
          description: "Ensalada César con pollo, crutones y queso parmesano, acompañada de aderezo César."
        },
        dinner: {
          id: 2,
          mainDish: { id: 108, name: "Pasta integral con verduras salteadas", calories: 420 },
          side1: { id: 215, name: "Aceitunas negras", calories: 60 },
          side2: { id: 216, name: "Parmesano rallado", calories: 100 },
          ramekin: { id: 308, name: "Aceite de oliva virgen extra", calories: 80 },
          contenedor: "Contenedor 3",
          image: "/pasta-verduras.jpeg",
          description:
            "Pasta integral con verduras salteadas, aceitunas negras y parmesano rallado, acompañada de aceite de oliva virgen extra."
        },
        snack1: {
          id: 2,
          mainDish: { id: 109, name: "Yogur griego con miel y nueces", calories: 200 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 4",
          image: "/yogur-griego.jpeg",
          description: "Yogur griego con miel y nueces."
        },
        snack2: {
          id: 2,
          mainDish: { id: 110, name: "Palitos de zanahoria y apio con hummus", calories: 160 },
          side1: { id: 0, name: "", calories: 0 },
          side2: { id: 0, name: "", calories: 0 },
          ramekin: { id: 0, name: "", calories: 0 },
          contenedor: "Contenedor 5",
          image: "/palitos-zanahoria.jpeg",
          description: "Palitos de zanahoria y apio con hummus."
        }
      }
    ]
  }
]
