import { _ as __nuxt_component_3 } from './Section-DrncyQpB.mjs';
import { u as useSeoMeta, n as _sfc_main$g, q as _sfc_main$a, a as useAppConfig, b as useComponentUI, t as tv, v as defineKeyedFunctionFactory, w as fetchDefaults, x as useAsyncData, y as useRequestFetch, s as __nuxt_component_0$2 } from './server.mjs';
import { defineComponent, computed, withCtx, unref, createVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, mergeProps, renderSlot, toValue, reactive, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { Primitive } from 'reka-ui';
import { _ as _sfc_main$5 } from './Card-BPxSZRcN.mjs';
import { _ as _sfc_main$6 } from './Carousel-DXpkVikY.mjs';
import { V as hash } from '../nitro/nitro.mjs';
import { isPlainObject } from '@vue/shared';
import { f as formatDate } from './helpers-DvbKa16t.mjs';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import '@vueuse/core';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
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
import 'embla-carousel-vue';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "MenuDate",
  __ssrInlineRender: true,
  props: {
    startDate: {},
    endDate: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$2;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-2" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:calendar-days",
        size: "24"
      }, null, _parent));
      _push(`<span>${ssrInterpolate(__props.startDate)}</span> - <span>${ssrInterpolate(__props.endDate)}</span></section>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/menu/app/components/MenuDate.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1$1 = Object.assign(_sfc_main$4, { __name: "MenuDate" });
const theme = {
  "base": "animate-pulse rounded-md bg-elevated"
};
const _sfc_main$3 = {
  __name: "USkeleton",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false }
  },
  setup(__props) {
    const props = __props;
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("skeleton", props);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.skeleton || {} }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "aria-busy": "true",
        "aria-label": "loading",
        "aria-live": "polite",
        role: "alert",
        class: ui.value({ class: [unref(uiProp)?.base, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.5.1_@tiptap+extensions@3.20.4_@tiptap+core@3.20.4_@tiptap+pm@3.20.4__@tiptap_e4a31b51003d92b668867b8854240143/node_modules/@nuxt/ui/dist/runtime/components/Skeleton.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MenuMeal",
  __ssrInlineRender: true,
  props: {
    meal: {},
    title: {}
  },
  setup(__props) {
    const iconByTitle = {
      Desayuno: "lucide:egg-fried",
      Comida: "lucide:drumstick",
      Cena: "lucide:soup",
      "Snack 1": "lucide:apple",
      "Snack 2": "lucide:sandwich"
    };
    const icon = computed(() => iconByTitle[__props.title] ?? "lucide:utensils");
    const totalCalories = computed(() => {
      const base = __props.meal.platilloPrincipal.calorias;
      const side1 = __props.meal.guarnicion1?.calorias ?? 0;
      const side2 = __props.meal.guarnicion2?.calorias ?? 0;
      const adicionales = __props.meal.adicionales.reduce((sum, item) => sum + item.calorias, 0);
      return (base + side1 + side2 + adicionales).toLocaleString("es-MX", {
        maximumFractionDigits: 0
      });
    });
    const guarnicion1Name = computed(() => __props.meal.guarnicion1?.nombre?.trim());
    const guarnicion2Name = computed(() => __props.meal.guarnicion2?.nombre?.trim());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$2;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "h-full px-4 py-4" }, _attrs))}><h3 class="font-bold text-lg flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Icon, { name: unref(icon) }, null, _parent));
      _push(`<span>${ssrInterpolate(__props.title)}</span></h3><section class="flex items-start justify-between gap-2 mt-2 text-sm"><article class="flex flex-col gap-2 basis-3/4"><span class="min-h-[1.25rem]">- ${ssrInterpolate(__props.meal.platilloPrincipal.nombre)}</span><span class="min-h-[1.25rem]">`);
      if (unref(guarnicion1Name)) {
        _push(`<!--[-->- ${ssrInterpolate(unref(guarnicion1Name))}<!--]-->`);
      } else {
        _push(`<!--[--> <!--]-->`);
      }
      _push(`</span><span class="min-h-[1.25rem]">`);
      if (unref(guarnicion2Name)) {
        _push(`<!--[-->- ${ssrInterpolate(unref(guarnicion2Name))}<!--]-->`);
      } else {
        _push(`<!--[--> <!--]-->`);
      }
      _push(`</span><!--[-->`);
      ssrRenderList(__props.meal.adicionales, (adicional, index) => {
        _push(`<span>- ${ssrInterpolate(adicional.nombre)}</span>`);
      });
      _push(`<!--]--></article><article class="basis-1/4 w-full flex items-start justify-end"><span class="font-semibold text-primary-500">${ssrInterpolate(unref(totalCalories))} Cal</span></article></section></section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/MenuMeal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$2, { __name: "MenuMeal" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MenuCard",
  __ssrInlineRender: true,
  props: {
    day: {}
  },
  setup(__props) {
    const labels = {
      LUNES: "Lunes",
      MARTES: "Martes",
      MIERCOLES: "Miércoles",
      JUEVES: "Jueves",
      VIERNES: "Viernes",
      SABADO: "Sábado",
      DOMINGO: "Domingo"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$5;
      const _component_MenuMeal = __nuxt_component_1;
      _push(ssrRenderComponent(_component_UCard, mergeProps({
        variant: "subtle",
        class: "m-1 h-full min-h-[360px] md:min-h-0",
        ui: { root: "h-full", body: "p-0 sm:p-0 h-full" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-xl font-bold text-primary-500"${_scopeId}>${ssrInterpolate(labels[__props.day.dayOfWeek])}</h3>`);
          } else {
            return [
              createVNode("h3", { class: "text-xl font-bold text-primary-500" }, toDisplayString(labels[__props.day.dayOfWeek]), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="grid grid-cols-1 gap-0 divide-y divide-default/70 md:grid-cols-3 md:divide-y-0 md:divide-x"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_MenuMeal, {
              meal: __props.day.desayuno,
              title: "Desayuno"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_MenuMeal, {
              meal: __props.day.comida,
              title: "Comida"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_MenuMeal, {
              meal: __props.day.cena,
              title: "Cena"
            }, null, _parent2, _scopeId));
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "grid grid-cols-1 gap-0 divide-y divide-default/70 md:grid-cols-3 md:divide-y-0 md:divide-x" }, [
                createVNode(_component_MenuMeal, {
                  meal: __props.day.desayuno,
                  title: "Desayuno"
                }, null, 8, ["meal"]),
                createVNode(_component_MenuMeal, {
                  meal: __props.day.comida,
                  title: "Comida"
                }, null, 8, ["meal"]),
                createVNode(_component_MenuMeal, {
                  meal: __props.day.cena,
                  title: "Cena"
                }, null, 8, ["meal"])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/MenuCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$1, { __name: "MenuCard" });
function generateOptionSegments(opts) {
  const segments = [
    toValue(opts.method)?.toUpperCase() || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.query || opts.params]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  if (opts.body) {
    const value = toValue(opts.body);
    if (!value) {
      segments.push(hash(value));
    } else if (value instanceof ArrayBuffer) {
      segments.push(hash(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
    } else if (value instanceof FormData) {
      const obj = {};
      for (const entry of value.entries()) {
        const [key, val] = entry;
        obj[key] = val instanceof File ? val.name : val;
      }
      segments.push(hash(obj));
    } else if (isPlainObject(value)) {
      segments.push(hash(reactive(value)));
    } else {
      try {
        segments.push(hash(value));
      } catch {
        console.warn("[useFetch] Failed to hash body", value);
      }
    }
  }
  return segments;
}
const createUseFetch = defineKeyedFunctionFactory({
  name: "createUseFetch",
  factory(options = {}) {
    function useFetch2(request, arg1, arg2) {
      const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
      const _request = computed(() => toValue(request));
      const key = computed(() => toValue(opts.key) || "$f" + hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(opts)]));
      if (!opts.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
        throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
      }
      const factoryOptions = typeof options === "function" ? options(opts) : options;
      const {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick,
        watch: watchSources,
        immediate,
        getCachedData,
        deep,
        dedupe,
        timeout,
        ...fetchOptions
      } = {
        ...typeof options === "function" ? {} : factoryOptions,
        ...opts,
        ...typeof options === "function" ? factoryOptions : {}
      };
      const _fetchOptions = reactive({
        ...fetchDefaults,
        ...fetchOptions,
        cache: typeof fetchOptions.cache === "boolean" ? void 0 : fetchOptions.cache
      });
      const _asyncDataOptions = {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick,
        immediate,
        getCachedData,
        deep,
        dedupe,
        timeout,
        watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
      };
      const asyncData = useAsyncData(watchSources === false ? key.value : key, (_, { signal }) => {
        let _$fetch = opts.$fetch || globalThis.$fetch;
        if (!opts.$fetch) {
          const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(opts.baseURL) || toValue(opts.baseURL)[0] === "/");
          if (isLocalFetch) {
            _$fetch = useRequestFetch();
          }
        }
        return _$fetch(_request.value, { signal, ..._fetchOptions });
      }, _asyncDataOptions);
      return asyncData;
    }
    return useFetch2;
  }
});
createUseFetch.__nuxt_factory();
const useLazyFetch = createUseFetch.__nuxt_factory({
  lazy: true,
  // @ts-expect-error private property
  _functionName: "useLazyFetch"
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: activeMenu, status } = useLazyFetch(
      `/api/menu`,
      "$QqBBqs6SCK"
      /* nuxt-injected */
    );
    const startDate = computed(() => activeMenu.value?.startDate ? formatDate(activeMenu.value.startDate) : "");
    const endDate = computed(() => activeMenu.value?.endDate ? formatDate(activeMenu.value.endDate) : "");
    const skeletonDays = Array.from({ length: 3 }, (_, index) => index);
    const isLoading = computed(() => status.value === "idle" || status.value === "pending");
    const hasMenu = computed(() => Boolean(activeMenu.value));
    const publicDays = computed(
      () => (activeMenu.value?.days ?? []).filter((day) => !["SABADO", "DOMINGO"].includes(day.dayOfWeek))
    );
    useSeoMeta({
      title: "Menú de la semana | Heltifud Meal Preps",
      description: "Consulta el menú semanal vigente de Heltifud Meal Preps con desayuno, comida y cena de lunes a viernes.",
      ogTitle: "Menú de la semana | Heltifud Meal Preps",
      ogDescription: "Consulta el menú semanal vigente de Heltifud Meal Preps.",
      twitterTitle: "Menú de la semana | Heltifud Meal Preps",
      twitterDescription: "Descubre el menú semanal vigente de Heltifud."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseSection = __nuxt_component_3;
      const _component_MenuDate = __nuxt_component_1$1;
      const _component_USkeleton = _sfc_main$3;
      const _component_UCard = _sfc_main$5;
      const _component_UIcon = _sfc_main$g;
      const _component_UCarousel = _sfc_main$6;
      const _component_MenuCard = __nuxt_component_6;
      const _component_UButton = _sfc_main$a;
      _push(`<section${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_BaseSection, { title: "Menú de la semana" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center justify-between gap-3"${_scopeId}>`);
            if (unref(status) === "success" && unref(hasMenu)) {
              _push2(ssrRenderComponent(_component_MenuDate, {
                "start-date": unref(startDate),
                "end-date": unref(endDate)
              }, null, _parent2, _scopeId));
            } else if (unref(isLoading)) {
              _push2(ssrRenderComponent(_component_USkeleton, { class: "h-6 w-55" }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center justify-between gap-3" }, [
                unref(status) === "success" && unref(hasMenu) ? (openBlock(), createBlock(_component_MenuDate, {
                  key: 0,
                  "start-date": unref(startDate),
                  "end-date": unref(endDate)
                }, null, 8, ["start-date", "end-date"])) : unref(isLoading) ? (openBlock(), createBlock(_component_USkeleton, {
                  key: 1,
                  class: "h-6 w-55"
                })) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section${_scopeId}>`);
            if (unref(status) === "success" && !unref(hasMenu)) {
              _push2(ssrRenderComponent(_component_UCard, {
                variant: "subtle",
                class: "mx-auto mt-6 max-w-2xl",
                ui: { body: "px-6 py-8 sm:px-8 sm:py-10" }
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="flex flex-col items-center justify-center gap-3 text-center"${_scopeId2}><div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_UIcon, {
                      name: "i-lucide-calendar-x2",
                      class: "size-6"
                    }, null, _parent3, _scopeId2));
                    _push3(`</div><div class="space-y-1"${_scopeId2}><p class="text-lg font-semibold text-highlighted"${_scopeId2}>No hay menú activo por el momento</p><p class="max-w-xl text-sm text-muted"${_scopeId2}> Estamos preparando el próximo menú semanal. Vuelve en unos momentos para consultarlo. </p></div></div>`);
                  } else {
                    return [
                      createVNode("div", { class: "flex flex-col items-center justify-center gap-3 text-center" }, [
                        createVNode("div", { class: "flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary" }, [
                          createVNode(_component_UIcon, {
                            name: "i-lucide-calendar-x2",
                            class: "size-6"
                          })
                        ]),
                        createVNode("div", { class: "space-y-1" }, [
                          createVNode("p", { class: "text-lg font-semibold text-highlighted" }, "No hay menú activo por el momento"),
                          createVNode("p", { class: "max-w-xl text-sm text-muted" }, " Estamos preparando el próximo menú semanal. Vuelve en unos momentos para consultarlo. ")
                        ])
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<section class="mb-8 md:hidden"${_scopeId}>`);
            if (unref(isLoading)) {
              _push2(`<section class="w-full max-w-xs mx-auto pt-6"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UCard, {
                variant: "subtle",
                ui: { body: "sm:p-4 p-4" }
              }, {
                header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USkeleton, { class: "h-7 w-28" }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USkeleton, { class: "h-7 w-28" })
                    ];
                  }
                }),
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<section class="grid grid-cols-1 gap-3"${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(skeletonDays), (day) => {
                      _push3(ssrRenderComponent(_component_USkeleton, {
                        key: `mobile-main-${day}`,
                        class: "h-36 w-full rounded-xl"
                      }, null, _parent3, _scopeId2));
                    });
                    _push3(`<!--]--></section><section class="grid grid-cols-1 gap-3 mt-3"${_scopeId2}><!--[-->`);
                    ssrRenderList(2, (day) => {
                      _push3(ssrRenderComponent(_component_USkeleton, {
                        key: `mobile-snack-${day}`,
                        class: "h-28 w-full rounded-xl"
                      }, null, _parent3, _scopeId2));
                    });
                    _push3(`<!--]--></section>`);
                  } else {
                    return [
                      createVNode("section", { class: "grid grid-cols-1 gap-3" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(skeletonDays), (day) => {
                          return openBlock(), createBlock(_component_USkeleton, {
                            key: `mobile-main-${day}`,
                            class: "h-36 w-full rounded-xl"
                          });
                        }), 128))
                      ]),
                      createVNode("section", { class: "grid grid-cols-1 gap-3 mt-3" }, [
                        (openBlock(), createBlock(Fragment, null, renderList(2, (day) => {
                          return createVNode(_component_USkeleton, {
                            key: `mobile-snack-${day}`,
                            class: "h-28 w-full rounded-xl"
                          });
                        }), 64))
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</section>`);
            } else if (unref(status) === "success") {
              _push2(ssrRenderComponent(_component_UCarousel, {
                ref: "carousel",
                items: unref(publicDays),
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
            _push2(`</section><section class="hidden md:flex md:flex-col md:gap-8"${_scopeId}>`);
            if (unref(isLoading)) {
              _push2(`<!--[-->`);
              ssrRenderList(5, (day) => {
                _push2(ssrRenderComponent(_component_UCard, {
                  key: `desktop-skeleton-${day}`,
                  variant: "subtle",
                  ui: { body: "sm:p-4 p-4" }
                }, {
                  header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_USkeleton, { class: "h-7 w-32" }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_USkeleton, { class: "h-7 w-32" })
                      ];
                    }
                  }),
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<section class="grid grid-cols-3 gap-3"${_scopeId2}><!--[-->`);
                      ssrRenderList(3, (meal) => {
                        _push3(ssrRenderComponent(_component_USkeleton, {
                          key: `desktop-main-${day}-${meal}`,
                          class: "h-36 w-full rounded-xl"
                        }, null, _parent3, _scopeId2));
                      });
                      _push3(`<!--]--></section><section class="grid grid-cols-2 gap-3 mt-3"${_scopeId2}><!--[-->`);
                      ssrRenderList(2, (snack) => {
                        _push3(ssrRenderComponent(_component_USkeleton, {
                          key: `desktop-snack-${day}-${snack}`,
                          class: "h-28 w-full rounded-xl"
                        }, null, _parent3, _scopeId2));
                      });
                      _push3(`<!--]--></section>`);
                    } else {
                      return [
                        createVNode("section", { class: "grid grid-cols-3 gap-3" }, [
                          (openBlock(), createBlock(Fragment, null, renderList(3, (meal) => {
                            return createVNode(_component_USkeleton, {
                              key: `desktop-main-${day}-${meal}`,
                              class: "h-36 w-full rounded-xl"
                            });
                          }), 64))
                        ]),
                        createVNode("section", { class: "grid grid-cols-2 gap-3 mt-3" }, [
                          (openBlock(), createBlock(Fragment, null, renderList(2, (snack) => {
                            return createVNode(_component_USkeleton, {
                              key: `desktop-snack-${day}-${snack}`,
                              class: "h-28 w-full rounded-xl"
                            });
                          }), 64))
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              _push2(`<!--[-->`);
              ssrRenderList(unref(publicDays), (item) => {
                _push2(ssrRenderComponent(_component_MenuCard, {
                  key: item.dayOfWeek,
                  day: item
                }, null, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            }
            _push2(`</section><section class="pt-8 flex justify-center items-center"${_scopeId}>`);
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
                unref(status) === "success" && !unref(hasMenu) ? (openBlock(), createBlock(_component_UCard, {
                  key: 0,
                  variant: "subtle",
                  class: "mx-auto mt-6 max-w-2xl",
                  ui: { body: "px-6 py-8 sm:px-8 sm:py-10" }
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "flex flex-col items-center justify-center gap-3 text-center" }, [
                      createVNode("div", { class: "flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary" }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-calendar-x2",
                          class: "size-6"
                        })
                      ]),
                      createVNode("div", { class: "space-y-1" }, [
                        createVNode("p", { class: "text-lg font-semibold text-highlighted" }, "No hay menú activo por el momento"),
                        createVNode("p", { class: "max-w-xl text-sm text-muted" }, " Estamos preparando el próximo menú semanal. Vuelve en unos momentos para consultarlo. ")
                      ])
                    ])
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                createVNode("section", { class: "mb-8 md:hidden" }, [
                  unref(isLoading) ? (openBlock(), createBlock("section", {
                    key: 0,
                    class: "w-full max-w-xs mx-auto pt-6"
                  }, [
                    createVNode(_component_UCard, {
                      variant: "subtle",
                      ui: { body: "sm:p-4 p-4" }
                    }, {
                      header: withCtx(() => [
                        createVNode(_component_USkeleton, { class: "h-7 w-28" })
                      ]),
                      default: withCtx(() => [
                        createVNode("section", { class: "grid grid-cols-1 gap-3" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(skeletonDays), (day) => {
                            return openBlock(), createBlock(_component_USkeleton, {
                              key: `mobile-main-${day}`,
                              class: "h-36 w-full rounded-xl"
                            });
                          }), 128))
                        ]),
                        createVNode("section", { class: "grid grid-cols-1 gap-3 mt-3" }, [
                          (openBlock(), createBlock(Fragment, null, renderList(2, (day) => {
                            return createVNode(_component_USkeleton, {
                              key: `mobile-snack-${day}`,
                              class: "h-28 w-full rounded-xl"
                            });
                          }), 64))
                        ])
                      ]),
                      _: 1
                    })
                  ])) : unref(status) === "success" ? (openBlock(), createBlock(_component_UCarousel, {
                    key: 1,
                    ref: "carousel",
                    items: unref(publicDays),
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
                  unref(isLoading) ? (openBlock(), createBlock(Fragment, { key: 0 }, renderList(5, (day) => {
                    return createVNode(_component_UCard, {
                      key: `desktop-skeleton-${day}`,
                      variant: "subtle",
                      ui: { body: "sm:p-4 p-4" }
                    }, {
                      header: withCtx(() => [
                        createVNode(_component_USkeleton, { class: "h-7 w-32" })
                      ]),
                      default: withCtx(() => [
                        createVNode("section", { class: "grid grid-cols-3 gap-3" }, [
                          (openBlock(), createBlock(Fragment, null, renderList(3, (meal) => {
                            return createVNode(_component_USkeleton, {
                              key: `desktop-main-${day}-${meal}`,
                              class: "h-36 w-full rounded-xl"
                            });
                          }), 64))
                        ]),
                        createVNode("section", { class: "grid grid-cols-2 gap-3 mt-3" }, [
                          (openBlock(), createBlock(Fragment, null, renderList(2, (snack) => {
                            return createVNode(_component_USkeleton, {
                              key: `desktop-snack-${day}-${snack}`,
                              class: "h-28 w-full rounded-xl"
                            });
                          }), 64))
                        ])
                      ]),
                      _: 2
                    }, 1024);
                  }), 64)) : (openBlock(true), createBlock(Fragment, { key: 1 }, renderList(unref(publicDays), (item) => {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/menu/app/pages/menu/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-H-CpNwBb.mjs.map
