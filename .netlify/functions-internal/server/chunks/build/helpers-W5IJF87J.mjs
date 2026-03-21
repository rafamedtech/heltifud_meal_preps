import { _ as _sfc_main$a, n as navigateTo, T as useOverlay } from './server.mjs';
import { _ as _sfc_main$2 } from './Modal-DHNNY9I2.mjs';
import { defineComponent, mergeProps, useSSRContext, createSlots, withCtx, openBlock, createBlock, toDisplayString, createCommentVNode, createVNode, Fragment, renderList } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Button",
  __ssrInlineRender: true,
  props: {
    label: {},
    color: {},
    activeColor: {},
    variant: {},
    activeVariant: {},
    size: {},
    square: { type: Boolean },
    block: { type: Boolean },
    loadingAuto: { type: Boolean },
    onClick: { type: [Function, Array] },
    class: {},
    ui: {},
    icon: {},
    avatar: {},
    leading: { type: Boolean },
    leadingIcon: {},
    trailing: { type: Boolean },
    trailingIcon: {},
    loading: { type: Boolean },
    loadingIcon: {},
    as: {},
    type: {},
    disabled: { type: Boolean },
    active: { type: Boolean },
    exact: { type: Boolean },
    exactQuery: { type: [Boolean, String] },
    exactHash: { type: Boolean },
    inactiveClass: {},
    to: {},
    href: {},
    external: { type: Boolean },
    target: {},
    rel: {},
    noRel: { type: Boolean },
    prefetchedClass: {},
    prefetch: { type: Boolean },
    prefetchOn: {},
    noPrefetch: { type: Boolean },
    trailingSlash: {},
    activeClass: {},
    exactActiveClass: {},
    ariaCurrentValue: {},
    viewTransition: { type: Boolean },
    replace: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$a;
      _push(ssrRenderComponent(_component_UButton, mergeProps(props, {
        ui: { leadingIcon: "text-xl" },
        size: "lg"
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/base/Button.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$1, { __name: "BaseButton" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Modal",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {},
    variants: {},
    button: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$2;
      const _component_BaseButton = __nuxt_component_0;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        close: { onClick: () => emit("close", false) },
        title: __props.title
      }, _attrs), createSlots({
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.description) {
              _push2(`<p${_scopeId}>${ssrInterpolate(__props.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.variants?.length) {
              _push2(`<section${_scopeId}><ul${_scopeId}><!--[-->`);
              ssrRenderList(__props.variants, (variant, index) => {
                _push2(`<li class="flex items-center justify-between py-2"${_scopeId}><span class="text-primary-500 text-lg font-semibold"${_scopeId}>${ssrInterpolate(variant.title)}</span><span class="text-lg font-bold"${_scopeId}> $${ssrInterpolate(variant.price)} pesos</span></li>`);
              });
              _push2(`<!--]--></ul></section>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              __props.description ? (openBlock(), createBlock("p", { key: 0 }, toDisplayString(__props.description), 1)) : createCommentVNode("", true),
              __props.variants?.length ? (openBlock(), createBlock("section", { key: 1 }, [
                createVNode("ul", null, [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.variants, (variant, index) => {
                    return openBlock(), createBlock("li", {
                      key: index,
                      class: "flex items-center justify-between py-2"
                    }, [
                      createVNode("span", { class: "text-primary-500 text-lg font-semibold" }, toDisplayString(variant.title), 1),
                      createVNode("span", { class: "text-lg font-bold" }, " $" + toDisplayString(variant.price) + " pesos", 1)
                    ]);
                  }), 128))
                ])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 2
      }, [
        __props.button ? {
          name: "footer",
          fn: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex w-full justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_BaseButton, {
                icon: __props.button.icon,
                label: __props.button.label,
                onClick: __props.button.click
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex w-full justify-center" }, [
                  createVNode(_component_BaseButton, {
                    icon: __props.button.icon,
                    label: __props.button.label,
                    onClick: __props.button.click
                  }, null, 8, ["icon", "label", "onClick"])
                ])
              ];
            }
          }),
          key: "0"
        } : void 0
      ]), _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/app/Modal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AppModal = Object.assign(_sfc_main, { __name: "AppModal" });
const links = [
  [
    {
      label: "Inicio",
      icon: "i-heroicons-home",
      to: "/"
    },
    {
      label: "Planes",
      icon: "i-heroicons-newspaper",
      to: "/planes"
    },
    {
      label: "Menú",
      icon: "i-heroicons-clipboard-document-list",
      to: "/menu"
    }
    // {
    //   label: 'Blog',
    //   icon: 'i-heroicons-chat-bubble-bottom-center-text',
    //   to: '/blog',
    // },
  ]
];
const adminLinks = [
  [
    {
      label: "Inicio",
      icon: "i-lucide-house",
      to: "/admin"
    },
    {
      label: "Planes",
      icon: "i-lucide-clipboard-list",
      to: "/admin/planes"
    },
    {
      label: "Menús",
      icon: "i-lucide-notebook-tabs",
      type: "trigger",
      value: "menús",
      defaultOpen: true,
      children: [
        {
          label: "Menú",
          icon: "i-lucide-calendar-range",
          to: "/admin/menu"
        },
        {
          label: "Platillos",
          icon: "i-lucide-utensils-crossed",
          to: "/admin/platillos"
        }
      ]
    }
  ]
];
const shortDateOptions = {
  month: "short",
  day: "numeric"
};
function formatDate(date) {
  return new Intl.DateTimeFormat("es-MX", shortDateOptions).format(new Date(date));
}
function openInfoModal(title, description) {
  const overlay = useOverlay();
  const modal = overlay.create(AppModal, {
    props: {
      title,
      description
    }
  });
  modal.open();
}
function openPlanModal(title, variants) {
  const overlay = useOverlay();
  const modal = overlay.create(AppModal, {
    props: {
      title,
      variants,
      button: {
        icon: "i-heroicons-rocket-launch",
        label: "Ordenar",
        click: () => navigateTo("https://wa.me/c/5216648161284", { external: true })
      }
    }
  });
  modal.open();
}
const steps = [
  {
    id: 1,
    title: "(1) Elige tu plan",
    description: "Selecciona el plan que más se ajuste a tus necesidades.",
    button: {
      label: "Ver planes",
      icon: "i-heroicons-list-bullet-20-solid",
      click: () => {
        return navigateTo("/planes");
      }
    },
    image: "v1746204407/heltifud/step1_drzeo7.png"
  },
  {
    id: 2,
    title: "(2) Realiza tu pedido",
    description: "Realiza tu pedido por WhatsApp y paga en línea.",
    button: {
      label: "¡Ordenar ahora!",
      icon: "i-heroicons-rocket-launch",
      click: () => navigateTo("https://wa.me/c/5216648161284", { external: true })
    },
    image: "v1746204409/heltifud/step2_m2tljn.png"
  },
  {
    id: 3,
    title: "(3) Confirma tu menú",
    description: "Confirma el menú o haz algún cambio.",
    button: {
      label: "Ver menú",
      icon: "i-heroicons-newspaper",
      click: () => navigateTo("/menu")
    },
    image: "v1746204411/heltifud/step3_m9ust9.png"
  },
  {
    id: 4,
    title: "(4) Recibe tus comidas",
    description: "Recibe tu pedido a domicilio sin costo adicional.",
    button: {
      label: "Más información",
      icon: "i-heroicons-information-circle",
      click: () => {
        openInfoModal(
          "¿Cómo funcionan las entregas?",
          "Realizamos las entregas en dos partes a la semana, la primera mitad el domingo por la tarde o el lunes por la mañana y la segunda mitad el miércoles por la tarde o el jueves por la mañana. Las entregas son gratuitas y el horario depende de tu ubicación."
        );
      }
    },
    image: "v1746204410/heltifud/step4_ztgrwf.png"
  }
];
const benefits = [
  {
    id: 1,
    title: "Comodidad",
    description: "Olvídate de las compras y el tiempo en la cocina.",
    image: "v1746204407/heltifud/comodidad_yai8kj.png"
  },
  {
    id: 2,
    title: "Salud",
    description: "Menús diseñados para mantener una dieta equilibrada y nutritiva.",
    image: "v1746204409/heltifud/salud_ywsmel.png"
  },
  {
    id: 3,
    title: "Variedad",
    description: "Nuevos menús cada semana para mantener tu dieta interesante.",
    image: "v1746204408/heltifud/variedad_bobmoo.png"
  },
  {
    id: 4,
    title: "Personalización",
    description: "Adapta tus comidas a tus necesidades y preferencias.",
    image: "v1746204408/heltifud/personalizacion_ketk6a.png"
  }
];
const menuItems = [
  {
    id: 1,
    title: "",
    image: "v1715308238/heltifud/IMG_1704_Large_k5jt5v.jpg"
  },
  {
    id: 2,
    title: "",
    image: "v1746205300/heltifud/pechuga-plancha_qjd7a5.jpg"
  },
  {
    id: 3,
    title: "",
    image: "v1715308239/heltifud/IMG_1709_Large_nfmo3s.jpg"
  },
  {
    id: 4,
    title: "",
    image: "v1746205298/heltifud/nopales_hry5rp.jpg"
  },
  {
    id: 5,
    title: "",
    image: "v1715308238/heltifud/IMG_1698_Large_pgmvgu.jpg"
  },
  {
    id: 6,
    title: "",
    image: "v1746205297/heltifud/pechuga-chipotle_oopb3b.jpg"
  },
  {
    id: 7,
    title: "",
    image: "v1715308238/heltifud/IMG_1707_Large_euasv8.jpg"
  },
  {
    id: 8,
    title: "",
    image: "v1746205297/heltifud/albondigas_cguj6x.jpg"
  }
];
const faqQuestions = [
  {
    id: 1,
    question: "¿Dónde están ubicados?",
    answer: "Estamos ubicados en Tijuana, Baja California. Hacemos entregas en Tijuana y Rosarito."
  },
  {
    id: 2,
    question: "¿Cómo funcionan las entregas?",
    answer: "Realizamos las entregas en dos partes a la semana, la primera mitad el domingo por la tarde o el lunes por la mañana y la segunda mitad el miércoles por la tarde o el jueves por la mañana. Las entregas son gratuitas y el horario depende de tu ubicación."
  },
  {
    id: 3,
    question: "¿Qué tipo de comidas ofrecen?",
    answer: "Ofrecemos una variedad de comidas saludables y caseras pensados en la dieta flexible, incluyendo opciones vegetarianas. Puedes ver el menú semanal en nuestra página."
  },
  {
    id: 4,
    question: "¿Puedo personalizar mi menú?",
    answer: "Sí, puedes personalizar tu menú según tus preferencias con cualquiera de las demás opciones del menú de la semana."
  },
  {
    id: 5,
    question: "¿Cómo puedo realizar un pedido?",
    answer: "Puedes realizar tu pedido a través de WhatsApp. Haz clic en el botón 'Ordenar' para comenzar."
  }
];
const socialLinks = [
  {
    id: 1,
    icon: "i-mdi-instagram",
    link: "https://www.instagram.com/heltifud/"
  },
  {
    id: 2,
    icon: "i-mdi-whatsapp",
    link: "https://wa.me/c/5216648161284"
  },
  {
    id: 3,
    icon: "i-mdi-facebook-box",
    link: "https://www.facebook.com/heltifud"
  }
];
const weeklyPlans = [
  {
    id: 1,
    title: "Plan desayunos",
    price: 1200,
    description: "Desayunos saludables a domicilio para empezar tu día con energía.",
    image: "v1746204413/heltifud/desayunos_xoypat.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => openPlanModal("Opciones del plan desayunos", [
        {
          title: "3 días",
          price: "400"
        },
        {
          title: "4 días",
          price: "500"
        },
        {
          title: "5 días",
          price: "600"
        }
      ])
    }
  },
  {
    id: 2,
    title: "Plan comidas",
    price: 2400,
    description: "Comidas caseras y balanceadas listas para tu semana sin cocinar.",
    image: "v1746204412/heltifud/comidas_zjbuum.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => openPlanModal("Opciones del plan comidas", [
        {
          title: "3 días",
          price: "500"
        },
        {
          title: "4 días",
          price: "600"
        },
        {
          title: "5 días",
          price: "700"
        }
      ])
    }
  },
  {
    id: 3,
    title: "Plan cenas",
    price: 4800,
    description: "Cenas ligeras, nutritivas y deliciosas, entregadas listas para servir.",
    image: "v1746204411/heltifud/cenas_wfp48j.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => openPlanModal("Opciones del plan cenas", [
        {
          title: "3 días",
          price: "450"
        },
        {
          title: "4 días",
          price: "550"
        },
        {
          title: "5 días",
          price: "650"
        }
      ])
    }
  },
  {
    id: 4,
    title: "Plan toda la semana",
    price: 1900,
    description: "Meal prep completo semanal con desayuno, comida y cena saludable.",
    image: "v1746204413/heltifud/todas_pdzwgw.png",
    button: {
      label: "Ver opciones",
      icon: "i-heroicons-numbered-list",
      click: () => openPlanModal("Opciones del plan Toda la semana", [
        {
          title: "3 días",
          price: "1300"
        },
        {
          title: "5 días",
          price: "1900"
        }
      ])
    }
  }
];

export { __nuxt_component_0 as _, steps as a, benefits as b, faqQuestions as c, adminLinks as d, formatDate as f, links as l, menuItems as m, socialLinks as s, weeklyPlans as w };
