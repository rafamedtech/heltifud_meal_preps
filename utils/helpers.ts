import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Modal } from "#components";
import type { NavigationMenuItem } from "@nuxt/ui";
import type { WeeklyPlan } from "@/types";

export const menuDate = "20 Mayo - 24 Mayo";

export const links: NavigationMenuItem[] = [
  [
    {
      label: "Inicio",
      icon: "i-heroicons-home",
      to: "/",
    },
    {
      label: "Planes",
      icon: "i-heroicons-newspaper",
      to: "/planes",
    },
    {
      label: "Menú",
      icon: "i-heroicons-clipboard-document-list",
      to: "/menu",
    },
    {
      label: "Blog",
      icon: "i-heroicons-chat-bubble-bottom-center-text",
      to: "/blog",
    },
  ],
];

export const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};
export const shortDateOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

export const expenseOptions = ["Todas", "Gasto", "Ingreso"];

export const monthOptions = [
  "Todos",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const background =
  "https://res.cloudinary.com/rafamed-dev/image/upload/v1714075109/heltifud/background_xxcijf.jpg";

export function transformPrice(item: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(item);
}

export function formatDate(date: Date | string): string {
  const newDate = new Date(date);
  const formattedDate = format(newDate, "d MMMM", { locale: es });
  return formattedDate;
}

export function indexName(index: number) {
  if (index === 1) return "Lun";
  if (index === 2) return "Mar";
  if (index === 3) return "Mie";
  if (index === 4) return "Jue";
  if (index === 5) return "Vie";
}

export function indexPlans(index: number) {
  if (index === 1) return "Desayuno";
  if (index === 2) return "Comida";
  if (index === 3) return "Cena";
  if (index === 4) return "Todos";
}

const overlay = useOverlay();

export const steps = [
  {
    id: 1,
    title: "(1) Elige tu plan",
    description: "Selecciona el plan que más se ajuste a tus necesidades.",
    button: {
      label: "Ver planes",
      icon: "i-heroicons-list-bullet-20-solid",
      click: () => {
        return navigateTo("/planes");
      },
    },
    image: "/step1.png",
  },
  {
    id: 2,
    title: "(2) Realiza tu pedido",
    description: "Realiza tu pedido por WhatsApp y paga en línea.",
    button: {
      label: "¡Ordenar ahora!",
      icon: "i-heroicons-rocket-launch",
      click: () =>
        navigateTo("https://wa.me/c/5216648161284", { external: true }),
    },
    image: "/step2.png",
  },
  {
    id: 3,
    title: "(3) Confirma tu menú",
    description: "Confirma el menú o haz algún cambio.",
    button: {
      label: "Ver menú",
      icon: "i-heroicons-newspaper",
      click: () => navigateTo("/menu"),
    },
    image: "/step3.png",
  },
  {
    id: 4,
    title: "(4) Recibe tus comidas",
    description: "Recibe tu pedido a domicilio sin costo adicional.",
    button: {
      label: "Más información",
      icon: "i-heroicons-information-circle",
      click: () => {
        const modal = overlay.create(Modal, {
          props: {
            title: "¿Cómo funcionan las entregas?",
            description:
              "Realizamos las entregas en dos partes a la semana, la primera mitad el domingo por la tarde o el lunes por la mañana y la segunda mitad el miércoles por la tarde o el jueves por la mañana. Las entregas son gratuitas y el horario depende de tu ubicación.",
          },
        });
        modal.open();
      },
    },
    image: "/step4.png",
  },
];

export const benefits = [
  {
    id: 1,
    title: "Comodidad",
    description: "Olvídate de las compras y el tiempo en la cocina.",
    image: "/comodidad.png",
  },
  {
    id: 2,
    title: "Salud",
    description:
      "Menús diseñados para mantener una dieta equilibrada y nutritiva.",
    image: "/salud.png",
  },
  {
    id: 3,
    title: "Variedad",
    description: "Nuevos menús cada semana para mantener tu dieta interesante.",
    image: "/variedad.png",
  },
  {
    id: 4,
    title: "Personalización",
    description: "Adapta tus comidas a tus necesidades y preferencias.",
    image: "/personalizacion.png",
  },
];

export const menuItems = [
  {
    id: 1,
    title: "Albondigas",
    image: "/albondigas.jpeg",
  },
  {
    id: 2,
    title: "Pechuga a la plancha",
    image: "/pechuga-plancha.jpeg",
  },
  {
    id: 3,
    title: "Pechuga al chipotle",
    image: "/pechuga-chipotle.jpeg",
  },
  {
    id: 4,
    title: "Carne asada",
    image: "/carne-asada.jpeg",
  },
];

export const faqQuestions = [
  {
    id: 1,
    question: "¿Dónde están ubicados?",
    answer:
      "Estamos ubicados en Tijuana, Baja California. Hacemos entregas en Tijuana y Rosarito.",
  },
  {
    id: 2,
    question: "¿Cómo funcionan las entregas?",
    answer:
      "Realizamos las entregas en dos partes a la semana, la primera mitad el domingo por la tarde o el lunes por la mañana y la segunda mitad el miércoles por la tarde o el jueves por la mañana. Las entregas son gratuitas y el horario depende de tu ubicación.",
  },
  {
    id: 3,
    question: "¿Qué tipo de comidas ofrecen?",
    answer:
      "Ofrecemos una variedad de comidas saludables y caseras pensados en la dieta flexible, incluyendo opciones vegetarianas. Puedes ver el menú semanal en nuestra página.",
  },
  {
    id: 4,
    question: "¿Puedo personalizar mi menú?",
    answer:
      "Sí, puedes personalizar tu menú según tus preferencias con cualquiera de las demás opciones del menú de la semana.",
  },
  {
    id: 5,
    question: "¿Cómo puedo realizar un pedido?",
    answer:
      "Puedes realizar tu pedido a través de WhatsApp. Haz clic en el botón 'Ordenar' para comenzar.",
  },
];

export const socialLinks = [
  {
    id: 1,
    icon: "i-mdi-instagram",
    link: "https://www.instagram.com/heltifud/",
  },
  {
    id: 2,
    icon: "i-mdi-whatsapp",
    link: "https://wa.me/c/5216648161284",
  },
  {
    id: 3,
    icon: "i-mdi-facebook-box",
    link: "https://www.facebook.com/heltifud",
  },
];

export const weeklyPlans: WeeklyPlan[] = [
  {
    id: 1,
    title: "Plan desayunos",
    price: 1200,
    description:
      "Desayunos saludables a domicilio para empezar tu día con energía.",
    image: "/desayunos.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => {
        const modal = overlay.create(Modal, {
          props: {
            title: "Opciones del plan desayunos",
            variants: [
              {
                title: "3 días",
                price: "400",
              },
              {
                title: "4 días",
                price: "500",
              },
              {
                title: "5 días",
                price: "600",
              },
            ],
            button: {
              icon: "i-heroicons-rocket-launch",
              label: "Ordenar",
              click: () => navigateTo("/planes"),
            },
          },
        });
        modal.open();
      },
    },
  },
  {
    id: 2,
    title: "Plan comidas",
    price: 2400,
    description:
      "Comidas caseras y balanceadas listas para tu semana sin cocinar.",
    image: "/comidas.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => {
        const modal = overlay.create(Modal, {
          props: {
            title: "Opciones del plan comidas",
            variants: [
              {
                title: "3 días",
                price: "500",
              },
              {
                title: "4 días",
                price: "600",
              },
              {
                title: "5 días",
                price: "700",
              },
            ],
            button: {
              icon: "i-heroicons-rocket-launch",
              label: "Ordenar",
              click: () => navigateTo("/planes"),
            },
          },
        });
        modal.open();
      },
    },
  },
  {
    id: 3,
    title: "Plan cenas",
    price: 4800,
    description:
      "Cenas ligeras, nutritivas y deliciosas, entregadas listas para servir.",
    image: "/cenas.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => {
        const modal = overlay.create(Modal, {
          props: {
            title: "Opciones del plan cenas",
            variants: [
              {
                title: "3 días",
                price: "450",
              },
              {
                title: "4 días",
                price: "550",
              },
              {
                title: "5 días",
                price: "650",
              },
            ],
            button: {
              icon: "i-heroicons-rocket-launch",
              label: "Ordenar",
              click: () => navigateTo("/planes"),
            },
          },
        });
        modal.open();
      },
    },
  },
  {
    id: 4,
    title: "Plan toda la semana",
    price: 1900,
    description:
      "Meal prep completo semanal con desayuno, comida y cena saludable.",
    image: "/todas.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => {
        const modal = overlay.create(Modal, {
          props: {
            title: "Opciones del plan Toda la semana",
            variants: [
              {
                title: "5 días",
                price: "1900",
              },
            ],
            button: {
              icon: "i-heroicons-rocket-launch",
              label: "Ordenar",
              click: () => navigateTo("/planes"),
            },
          },
        });
        modal.open();
      },
    },
  },
];
