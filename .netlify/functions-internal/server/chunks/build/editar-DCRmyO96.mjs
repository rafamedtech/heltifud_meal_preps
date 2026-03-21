import { _ as __nuxt_component_3 } from './Section-DrncyQpB.mjs';
import { _ as _sfc_main$3 } from './Popover-CMIe6n2p.mjs';
import { a as useSeoMeta, _ as _sfc_main$a } from './server.mjs';
import { _ as _sfc_main$4 } from './Calendar-DiIhPoAA.mjs';
import { defineComponent, withAsyncContext, ref, withCtx, unref, createVNode, openBlock, createBlock, createCommentVNode, Fragment, renderList, isRef, shallowRef, useModel, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date';
import { _ as _sfc_main$2 } from './Carousel-BfFI0l6z.mjs';
import { _ as __nuxt_component_6 } from './MenuCard-CujHG3XL.mjs';
import { a as useFetch } from './fetch-Corms2LC.mjs';
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
import 'reka-ui';
import 'reka-ui/namespaced';
import '@vueuse/core';
import './overlay-CjyBzL1C.mjs';
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
import 'reka-ui/date';
import 'embla-carousel-vue';
import './Card-BsgwMRuG.mjs';
import '@vue/shared';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "StartDate",
  __ssrInlineRender: true,
  props: {
    "modelValue": new CalendarDate(2022, 1, 11),
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const df = new DateFormatter("en-US", {
      dateStyle: "medium"
    });
    const modelValue = shallowRef(new CalendarDate(2022, 1, 10));
    const startDate = useModel(__props, "modelValue", new CalendarDate(2022, 1, 11));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UPopover = _sfc_main$3;
      const _component_UButton = _sfc_main$a;
      const _component_UCalendar = _sfc_main$4;
      _push(ssrRenderComponent(_component_UPopover, _attrs, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCalendar, {
              modelValue: startDate.value,
              "onUpdate:modelValue": ($event) => startDate.value = $event,
              class: "p-2"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UCalendar, {
                modelValue: startDate.value,
                "onUpdate:modelValue": ($event) => startDate.value = $event,
                class: "p-2"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "subtle",
              icon: "i-lucide-calendar"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(modelValue) ? unref(df).format(unref(modelValue).toDate(unref(getLocalTimeZone)())) : "Select a date")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(modelValue) ? unref(df).format(unref(modelValue).toDate(unref(getLocalTimeZone)())) : "Select a date"), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                color: "neutral",
                variant: "subtle",
                icon: "i-lucide-calendar"
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(modelValue) ? unref(df).format(unref(modelValue).toDate(unref(getLocalTimeZone)())) : "Select a date"), 1)
                ]),
                _: 1
              })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/menu/app/components/StartDate.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "StartDate" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "editar",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: activeMenu, status } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/menu`,
      {
        default: () => ({}),
        lazy: true
      },
      "$cozZJbYIrY"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const startDate = ref(/* @__PURE__ */ new Date());
    useSeoMeta({
      title: "Editar menú semanal | Heltifud Meal Preps",
      description: "Vista de edición del menú semanal para administración interna.",
      robots: "noindex, nofollow"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseSection = __nuxt_component_3;
      const _component_StartDate = __nuxt_component_1;
      const _component_UCarousel = _sfc_main$2;
      const _component_MenuCard = __nuxt_component_6;
      const _component_UButton = _sfc_main$a;
      _push(`<section${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_BaseSection, { title: "Editar menú de la semana" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_StartDate, {
              "start-date": unref(startDate),
              "onUpdate:startDate": ($event) => isRef(startDate) ? startDate.value = $event : null
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_StartDate, {
                "start-date": unref(startDate),
                "onUpdate:startDate": ($event) => isRef(startDate) ? startDate.value = $event : null
              }, null, 8, ["start-date", "onUpdate:startDate"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section${_scopeId}><section class="mb-8 md:hidden"${_scopeId}>`);
            if (unref(status) === "pending") {
              _push2(`<section${_scopeId}>cargado...</section>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(status) === "success") {
              _push2(ssrRenderComponent(_component_UCarousel, {
                ref: "carousel",
                items: unref(activeMenu)?.days,
                class: "w-full max-w-xs mx-auto pt-6",
                "wheel-gestures": "",
                dots: ""
              }, {
                default: withCtx(({ item }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_MenuCard, { day: item }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_MenuCard, { day: item }, null, 8, ["day"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</section><section class="hidden md:flex md:flex-col md:gap-8"${_scopeId}><!--[-->`);
            ssrRenderList(unref(activeMenu)?.days, (item) => {
              _push2(ssrRenderComponent(_component_MenuCard, {
                key: item.dayOfWeek,
                day: item
              }, null, _parent2, _scopeId));
            });
            _push2(`<!--]--></section><section class="pt-8 flex justify-center items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              label: "Quiero hacer un pedido",
              icon: "i-mdi-whatsapp",
              prefetch: "",
              size: "lg"
            }, null, _parent2, _scopeId));
            _push2(`</section></section>`);
          } else {
            return [
              createVNode("section", null, [
                createVNode("section", { class: "mb-8 md:hidden" }, [
                  unref(status) === "pending" ? (openBlock(), createBlock("section", { key: 0 }, "cargado...")) : createCommentVNode("", true),
                  unref(status) === "success" ? (openBlock(), createBlock(_component_UCarousel, {
                    key: 1,
                    ref: "carousel",
                    items: unref(activeMenu)?.days,
                    class: "w-full max-w-xs mx-auto pt-6",
                    "wheel-gestures": "",
                    dots: ""
                  }, {
                    default: withCtx(({ item }) => [
                      createVNode(_component_MenuCard, { day: item }, null, 8, ["day"])
                    ]),
                    _: 1
                  }, 8, ["items"])) : createCommentVNode("", true)
                ]),
                createVNode("section", { class: "hidden md:flex md:flex-col md:gap-8" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(activeMenu)?.days, (item) => {
                    return openBlock(), createBlock(_component_MenuCard, {
                      key: item.dayOfWeek,
                      day: item
                    }, null, 8, ["day"]);
                  }), 128))
                ]),
                createVNode("section", { class: "pt-8 flex justify-center items-center" }, [
                  createVNode(_component_UButton, {
                    label: "Quiero hacer un pedido",
                    icon: "i-mdi-whatsapp",
                    prefetch: "",
                    size: "lg"
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/menu/app/pages/menu/editar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
