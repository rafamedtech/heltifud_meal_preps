import { _ as __nuxt_component_0, a as steps, m as menuItems, b as benefits, c as faqQuestions } from './helpers-W5IJF87J.mjs';
import { a as useSeoMeta, O as __nuxt_component_1, _ as _sfc_main$a, f as useAppConfig, g as useComponentUI, t as tv } from './server.mjs';
import { _ as _sfc_main$4 } from './Separator-BcjYB7qk.mjs';
import { _ as __nuxt_component_3 } from './Section-DrncyQpB.mjs';
import { _ as _sfc_main$5 } from './Carousel-BfFI0l6z.mjs';
import { _ as __nuxt_component_5 } from './Card-iiFrhLVA.mjs';
import { defineComponent, withCtx, createVNode, createTextVNode, unref, openBlock, createBlock, Fragment, renderList, mergeProps, toDisplayString, useSlots, computed, renderSlot, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { useForwardPropsEmits, CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from 'reka-ui';
import { reactivePick } from '@vueuse/core';
import './Modal-DHNNY9I2.mjs';
import './overlay-CjyBzL1C.mjs';
import '../nitro/nitro.mjs';
import 'zod';
import '@prisma/adapter-pg';
import 'pg';
import 'node:path';
import 'node:url';
import '@prisma/client/runtime/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'vue-router';
import '@supabase/ssr';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'embla-carousel-vue';
import './Card-BsgwMRuG.mjs';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "Gallery",
  __ssrInlineRender: true,
  props: {
    items: {},
    autoplay: { type: [Number, Boolean], default: false },
    arrows: { type: Boolean, default: false },
    dots: { type: Boolean, default: false },
    loop: { type: Boolean, default: false }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCarousel = _sfc_main$5;
      const _component_BaseCard = __nuxt_component_5;
      _push(ssrRenderComponent(_component_UCarousel, mergeProps({
        loop: __props.loop,
        dots: __props.dots,
        arrows: __props.arrows,
        autoplay: __props.autoplay ? { delay: Number(__props.autoplay) } : false,
        items: __props.items,
        ui: { item: "md:basis-1/3", dots: "-bottom-4" }
      }, _attrs), {
        default: withCtx(({ item }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="p-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_BaseCard, {
              key: item.id,
              title: item.title,
              "title-style": "center",
              description: item.description,
              image: item.image
            }, null, _parent2, _scopeId));
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "p-2" }, [
                (openBlock(), createBlock(_component_BaseCard, {
                  key: item.id,
                  title: item.title,
                  "title-style": "center",
                  description: item.description,
                  image: item.image
                }, null, 8, ["title", "description", "image"]))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/base/Gallery.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$3, { __name: "BaseGallery" });
const theme = {
  "slots": {
    "root": "",
    "content": "data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden"
  }
};
const _sfc_main$2 = {
  __name: "UCollapsible",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    disabled: { type: Boolean, required: false },
    unmountOnHide: { type: Boolean, required: false, default: true }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("collapsible", props);
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "defaultOpen", "open", "disabled", "unmountOnHide"), emits);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.collapsible || {} })());
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(CollapsibleRoot), mergeProps(unref(rootProps), {
        "data-slot": "root",
        class: ui.value.root({ class: [unref(uiProp)?.root, props.class] })
      }, _attrs), {
        default: withCtx(({ open }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.default) {
              _push2(ssrRenderComponent(unref(CollapsibleTrigger), { "as-child": "" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(CollapsibleContent), {
              "data-slot": "content",
              class: ui.value.content({ class: unref(uiProp)?.content })
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "content", {}, null, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    renderSlot(_ctx.$slots, "content")
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              !!slots.default ? (openBlock(), createBlock(unref(CollapsibleTrigger), {
                key: 0,
                "as-child": ""
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1024)) : createCommentVNode("", true),
              createVNode(unref(CollapsibleContent), {
                "data-slot": "content",
                class: ui.value.content({ class: unref(uiProp)?.content })
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "content")
                ]),
                _: 3
              }, 8, ["class"])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.5.1_@tiptap+extensions@3.20.4_@tiptap+core@3.20.4_@tiptap+pm@3.20.4__@tiptap_e4a31b51003d92b668867b8854240143/node_modules/@nuxt/ui/dist/runtime/components/Collapsible.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "FaqQuestion",
  __ssrInlineRender: true,
  props: {
    question: {},
    answer: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCollapsible = _sfc_main$2;
      const _component_UButton = _sfc_main$a;
      _push(ssrRenderComponent(_component_UCollapsible, mergeProps({
        "default-open": "",
        class: "flex flex-col gap-4 px-2"
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p${_scopeId}>${ssrInterpolate(__props.answer)}</p>`);
          } else {
            return [
              createVNode("p", null, toDisplayString(__props.answer), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              class: "group text-primary-500 font-bold md:text-xl",
              label: __props.question,
              color: "neutral",
              variant: "outline",
              "trailing-icon": "i-lucide-chevron-down",
              ui: {
                trailingIcon: "group-data-[state=open]:rotate-180 transition-transform duration-200"
              },
              block: ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                class: "group text-primary-500 font-bold md:text-xl",
                label: __props.question,
                color: "neutral",
                variant: "outline",
                "trailing-icon": "i-lucide-chevron-down",
                ui: {
                  trailingIcon: "group-data-[state=open]:rotate-180 transition-transform duration-200"
                },
                block: ""
              }, null, 8, ["label"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/FaqQuestion.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$1, { __name: "FaqQuestion" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Heltifud Meal Preps | Comidas saludables a domicilio",
      description: "Comidas caseras, balanceadas y listas para disfrutar. Descubre planes semanales, menú de la semana y promociones de Heltifud Meal Preps.",
      ogTitle: "Heltifud Meal Preps | Comidas saludables a domicilio",
      ogDescription: "Descubre planes semanales, menú actualizado y comidas saludables directas a tu puerta.",
      twitterTitle: "Heltifud Meal Preps | Comidas saludables a domicilio",
      twitterDescription: "Planes semanales y menú saludable listo para disfrutar en casa."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseButton = __nuxt_component_0;
      const _component_NuxtImg = __nuxt_component_1;
      const _component_USeparator = _sfc_main$4;
      const _component_BaseSection = __nuxt_component_3;
      const _component_BaseGallery = __nuxt_component_4;
      const _component_BaseCard = __nuxt_component_5;
      const _component_FaqQuestion = __nuxt_component_6;
      _push(`<div${ssrRenderAttrs(_attrs)}><section class="container mx-auto flex w-full flex-col-reverse items-center justify-center gap-8 py-8 md:flex-row md:gap-12 md:py-20"><div class="md:w-1/2"><h1 class="mb-4 text-4xl leading-snug font-bold md:text-5xl">Comidas saludables, directo a tu puerta</h1><p class="mb-8 text-xl"> Transforma tu alimentación con comidas caseras, equilibradas y deliciosas, sin complicaciones. </p><section class="flex gap-4">`);
      _push(ssrRenderComponent(_component_BaseButton, {
        to: "/planes",
        size: "lg",
        icon: "i-heroicons-list-bullet-20-solid",
        label: "Ver planes"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseButton, {
        variant: "outline",
        to: "/menu",
        label: "Ver Menú",
        icon: "i-heroicons-newspaper"
      }, null, _parent));
      _push(`</section></div><figure class="aspect-[8/11] w-full max-w-[400px] overflow-hidden border border-primary-500 shadow-2xl md:ml-14">`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: "v1746204406/heltifud/hero-new_mkqivn.jpg",
        alt: "Hero",
        width: "400",
        height: "550",
        placeholder: "",
        loading: "eager",
        fetchpriority: "high",
        class: "h-full w-full object-cover"
      }, null, _parent));
      _push(`</figure></section>`);
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(ssrRenderComponent(_component_BaseSection, {
        title: "¿Qué es Heltifud Meal Preps?",
        layout: "columns"
      }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Somos un servicio de meal prep semanal que ofrece comida casera, saludable y balanceada. Te entregamos todo listo para disfrutar, sin cocinar ni preocuparte por planear tus comidas. `);
          } else {
            return [
              createTextVNode(" Somos un servicio de meal prep semanal que ofrece comida casera, saludable y balanceada. Te entregamos todo listo para disfrutar, sin cocinar ni preocuparte por planear tus comidas. ")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<figure class="flex w-full max-w-[440px] items-center justify-center overflow-hidden"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "v1746204408/heltifud/hero_or5twy.png",
              alt: "Meal prep saludable",
              placeholder: "",
              class: "h-auto w-full object-contain shadow-2xl md:m-12"
            }, null, _parent2, _scopeId));
            _push2(`</figure>`);
          } else {
            return [
              createVNode("figure", { class: "flex w-full max-w-[440px] items-center justify-center overflow-hidden" }, [
                createVNode(_component_NuxtImg, {
                  src: "v1746204408/heltifud/hero_or5twy.png",
                  alt: "Meal prep saludable",
                  placeholder: "",
                  class: "h-auto w-full object-contain shadow-2xl md:m-12"
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(ssrRenderComponent(_component_BaseSection, { title: "¿Cómo funciona el servicio?" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Para recibir tus meal preps a la puerta de tu hogar sólo sigue los siguientes pasos: `);
          } else {
            return [
              createTextVNode(" Para recibir tus meal preps a la puerta de tu hogar sólo sigue los siguientes pasos: ")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="md:hidden"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_BaseGallery, { items: "steps" in _ctx ? _ctx.steps : unref(steps) }, null, _parent2, _scopeId));
            _push2(`</div><div class="hidden md:grid md:grid-cols-4 md:justify-between md:gap-4 md:py-4"${_scopeId}><!--[-->`);
            ssrRenderList("steps" in _ctx ? _ctx.steps : unref(steps), ({ id, title, description, button, image }) => {
              _push2(ssrRenderComponent(_component_BaseCard, {
                key: id,
                "card-style": "complex",
                title,
                description,
                button,
                image
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "md:hidden" }, [
                createVNode(_component_BaseGallery, { items: "steps" in _ctx ? _ctx.steps : unref(steps) }, null, 8, ["items"])
              ]),
              createVNode("div", { class: "hidden md:grid md:grid-cols-4 md:justify-between md:gap-4 md:py-4" }, [
                (openBlock(true), createBlock(Fragment, null, renderList("steps" in _ctx ? _ctx.steps : unref(steps), ({ id, title, description, button, image }) => {
                  return openBlock(), createBlock(_component_BaseCard, {
                    key: id,
                    "card-style": "complex",
                    title,
                    description,
                    button,
                    image
                  }, null, 8, ["title", "description", "button", "image"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(ssrRenderComponent(_component_BaseSection, { title: "Menú de la semana" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Descubre nuestro menú semanal, lleno de opciones deliciosas y saludables. Cada semana, ofrecemos una variedad de platos para que disfrutes. `);
          } else {
            return [
              createTextVNode(" Descubre nuestro menú semanal, lleno de opciones deliciosas y saludables. Cada semana, ofrecemos una variedad de platos para que disfrutes. ")
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="text-center text-lg md:text-left"${_scopeId}>Consulta lo que prepararemos para la próxima semana</p>`);
            _push2(ssrRenderComponent(_component_BaseButton, {
              to: "/menu",
              label: "Ver Menú",
              icon: "i-heroicons-newspaper"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode("p", { class: "text-center text-lg md:text-left" }, "Consulta lo que prepararemos para la próxima semana"),
              createVNode(_component_BaseButton, {
                to: "/menu",
                label: "Ver Menú",
                icon: "i-heroicons-newspaper"
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="pb-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_BaseGallery, {
              items: "menuItems" in _ctx ? _ctx.menuItems : unref(menuItems),
              autoplay: 3e3
            }, null, _parent2, _scopeId));
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "pb-4" }, [
                createVNode(_component_BaseGallery, {
                  items: "menuItems" in _ctx ? _ctx.menuItems : unref(menuItems),
                  autoplay: 3e3
                }, null, 8, ["items"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(ssrRenderComponent(_component_BaseSection, {
        title: "¡Promoción en tu primer pedido!",
        "title-size": "lg",
        layout: "columns"
      }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Recibe $100 pesos de descuento así como un set de cubiertos reutilizables en tu primer pedido `);
          } else {
            return [
              createTextVNode(" Recibe $100 pesos de descuento así como un set de cubiertos reutilizables en tu primer pedido ")
            ];
          }
        }),
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_BaseButton, {
              label: "Reclamar promoción",
              icon: "i-lucide-rocket",
              to: "https://wa.me/c/5216648161284",
              target: "_blank"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_BaseButton, {
                label: "Reclamar promoción",
                icon: "i-lucide-rocket",
                to: "https://wa.me/c/5216648161284",
                target: "_blank"
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<figure class="flex aspect-[8/11] w-full max-w-[400px] items-center justify-center overflow-hidden"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "v1746204411/heltifud/promo_hbku0g.png",
              width: "400",
              height: "550",
              alt: "Promocion de primer pedido",
              placeholder: "",
              class: "h-full w-full object-cover shadow-2xl md:m-12"
            }, null, _parent2, _scopeId));
            _push2(`</figure>`);
          } else {
            return [
              createVNode("figure", { class: "flex aspect-[8/11] w-full max-w-[400px] items-center justify-center overflow-hidden" }, [
                createVNode(_component_NuxtImg, {
                  src: "v1746204411/heltifud/promo_hbku0g.png",
                  width: "400",
                  height: "550",
                  alt: "Promocion de primer pedido",
                  placeholder: "",
                  class: "h-full w-full object-cover shadow-2xl md:m-12"
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(ssrRenderComponent(_component_BaseSection, { title: "¿Por qué elegirnos?" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` En Heltifud nos preocupamos por ofrecerte un servicio de calidad y confianza. Nuestros ingredientes son frescos y seleccionados con cuidado. `);
          } else {
            return [
              createTextVNode(" En Heltifud nos preocupamos por ofrecerte un servicio de calidad y confianza. Nuestros ingredientes son frescos y seleccionados con cuidado. ")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="md:hidden"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_BaseGallery, {
              items: "benefits" in _ctx ? _ctx.benefits : unref(benefits),
              autoplay: 4e3,
              dots: ""
            }, null, _parent2, _scopeId));
            _push2(`</div><section class="hidden pt-4 md:grid md:grid-cols-4 md:justify-between md:gap-4"${_scopeId}><!--[-->`);
            ssrRenderList("benefits" in _ctx ? _ctx.benefits : unref(benefits), ({ id, title, description, image }) => {
              _push2(ssrRenderComponent(_component_BaseCard, {
                key: id,
                title,
                description,
                image
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></section>`);
          } else {
            return [
              createVNode("div", { class: "md:hidden" }, [
                createVNode(_component_BaseGallery, {
                  items: "benefits" in _ctx ? _ctx.benefits : unref(benefits),
                  autoplay: 4e3,
                  dots: ""
                }, null, 8, ["items"])
              ]),
              createVNode("section", { class: "hidden pt-4 md:grid md:grid-cols-4 md:justify-between md:gap-4" }, [
                (openBlock(true), createBlock(Fragment, null, renderList("benefits" in _ctx ? _ctx.benefits : unref(benefits), ({ id, title, description, image }) => {
                  return openBlock(), createBlock(_component_BaseCard, {
                    key: id,
                    title,
                    description,
                    image
                  }, null, 8, ["title", "description", "image"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(ssrRenderComponent(_component_BaseSection, { title: "Preguntas frecuentes" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Aquí encontrarás respuestas a las preguntas más comunes sobre nuestro servicio. Si tienes alguna duda adicional, no dudes en contactarnos. `);
          } else {
            return [
              createTextVNode(" Aquí encontrarás respuestas a las preguntas más comunes sobre nuestro servicio. Si tienes alguna duda adicional, no dudes en contactarnos. ")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="mx-auto flex flex-col justify-between gap-8 py-8 md:w-1/2"${_scopeId}><!--[-->`);
            ssrRenderList("faqQuestions" in _ctx ? _ctx.faqQuestions : unref(faqQuestions), (question) => {
              _push2(ssrRenderComponent(_component_FaqQuestion, {
                key: question.id,
                question: question.question,
                answer: question.answer
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></section>`);
          } else {
            return [
              createVNode("section", { class: "mx-auto flex flex-col justify-between gap-8 py-8 md:w-1/2" }, [
                (openBlock(true), createBlock(Fragment, null, renderList("faqQuestions" in _ctx ? _ctx.faqQuestions : unref(faqQuestions), (question) => {
                  return openBlock(), createBlock(_component_FaqQuestion, {
                    key: question.id,
                    question: question.question,
                    answer: question.answer
                  }, null, 8, ["question", "answer"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
