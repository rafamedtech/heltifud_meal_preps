import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Modal } from "#components";

export const menuDate = "20 Mayo - 24 Mayo";

export const links = [
  [
    {
      label: "Inicio",
      icon: "i-heroicons-home",
      to: "/",
    },
    {
      label: "Nuestros planes",
      icon: "i-heroicons-list-bullet-20-solid",
      to: "/nuestros-planes",
    },
    {
      label: "Menú",
      icon: "i-heroicons-newspaper",
      to: "/menu",
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
const count = ref(0);

const modal = overlay.create(Modal, {
  props: {
    count: count.value,
  },
});

export const steps = [
  {
    id: 1,
    title: "Elige tu plan",
    description: "Selecciona el plan que más se ajuste a tus necesidades.",
    button: {
      label: "Ver planes",
      icon: "i-heroicons-list-bullet-20-solid",
      click: () => {
        modal.open();
      },
    },
    image: "/step1.png",
  },
  {
    id: 2,
    title: "Realiza tu pedido",
    description: "Realiza tu pedido a través de WhatsApp y paga en línea.",
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
    title: "Confirma tu menú",
    description: "Confirma el menú recomendado o haz algún cambio.",
    button: {
      label: "Menú de la semana",
      icon: "i-heroicons-newspaper",
      click: () => navigateTo("/menu"),
    },
    image: "/step3.png",
  },
  {
    id: 4,
    title: "Recibe tus comidas",
    description: "Recibe tus comidas en la comodidad de tu hogar.",
    button: {
      label: "Mas información",
      icon: "i-heroicons-information-circle",
      click: () => {},
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
