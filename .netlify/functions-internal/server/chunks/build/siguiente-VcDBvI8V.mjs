import { _ as __nuxt_component_3 } from './Section-DrncyQpB.mjs';
import { z as useSupabaseSession, a as useSeoMeta, _ as _sfc_main$a, A as __nuxt_component_0$3 } from './server.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BGefXGSy.mjs';
import { _ as _sfc_main$1 } from './Card-BsgwMRuG.mjs';
import { _ as _sfc_main$3 } from './Carousel-BfFI0l6z.mjs';
import { _ as __nuxt_component_6 } from './MenuCard-CujHG3XL.mjs';
import { defineComponent, withAsyncContext, computed, withCtx, unref, createVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useLazyFetch } from './fetch-Corms2LC.mjs';
import { f as formatDate } from './helpers-W5IJF87J.mjs';
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
import 'reka-ui';
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
import 'embla-carousel-vue';
import '@vue/shared';
import './Modal-DHNNY9I2.mjs';
import './overlay-CjyBzL1C.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "siguiente",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: nextMenu, status } = ([__temp, __restore] = withAsyncContext(() => useLazyFetch(
      `/api/menu/next`,
      {
        default: () => ({})
      },
      "$_pXiaSok2t"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const session = useSupabaseSession();
    const startDate = computed(() => formatDate(nextMenu.value?.startDate));
    const endDate = computed(() => formatDate(nextMenu.value?.endDate));
    const skeletonDays = Array.from({ length: 3 }, (_, index) => index);
    const canEditMenu = computed(() => Boolean(session.value && nextMenu.value?.id));
    const editMenuLink = computed(() => nextMenu.value?.id ? `/admin/menu/${nextMenu.value.id}` : "/admin/menu");
    const publicDays = computed(
      () => (nextMenu.value?.days ?? []).filter((day) => !["SABADO", "DOMINGO"].includes(day.dayOfWeek))
    );
    useSeoMeta({
      title: "Próximo menú semanal | Heltifud Meal Preps",
      description: "Revisa el próximo menú semanal de Heltifud Meal Preps y conoce la siguiente rotación disponible.",
      ogTitle: "Próximo menú semanal | Heltifud Meal Preps",
      ogDescription: "Consulta la siguiente rotación del menú semanal de Heltifud.",
      twitterTitle: "Próximo menú semanal | Heltifud Meal Preps",
      twitterDescription: "Conoce el próximo menú semanal de Heltifud."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseSection = __nuxt_component_3;
      const _component_Icon = __nuxt_component_0$3;
      const _component_USkeleton = _sfc_main$2;
      const _component_UButton = _sfc_main$a;
      const _component_UCard = _sfc_main$1;
      const _component_UCarousel = _sfc_main$3;
      const _component_MenuCard = __nuxt_component_6;
      _push(`<section${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_BaseSection, { title: "Menú de la siguiente semana" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center justify-between gap-3"${_scopeId}>`);
            if (unref(status) === "success") {
              _push2(`<section class="flex items-center gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:calendar-days",
                size: "24"
              }, null, _parent2, _scopeId));
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(startDate))}</span> - <span${_scopeId}>${ssrInterpolate(unref(endDate))}</span></section>`);
            } else {
              _push2(ssrRenderComponent(_component_USkeleton, { class: "h-6 w-[220px]" }, null, _parent2, _scopeId));
            }
            if (unref(canEditMenu)) {
              _push2(ssrRenderComponent(_component_UButton, {
                label: "Editar este menú",
                icon: "i-lucide-square-pen",
                color: "neutral",
                variant: "outline",
                to: unref(editMenuLink),
                size: "sm"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center justify-between gap-3" }, [
                unref(status) === "success" ? (openBlock(), createBlock("section", {
                  key: 0,
                  class: "flex items-center gap-2"
                }, [
                  createVNode(_component_Icon, {
                    name: "lucide:calendar-days",
                    size: "24"
                  }),
                  createVNode("span", null, toDisplayString(unref(startDate)), 1),
                  createTextVNode(" - "),
                  createVNode("span", null, toDisplayString(unref(endDate)), 1)
                ])) : (openBlock(), createBlock(_component_USkeleton, {
                  key: 1,
                  class: "h-6 w-[220px]"
                })),
                unref(canEditMenu) ? (openBlock(), createBlock(_component_UButton, {
                  key: 2,
                  label: "Editar este menú",
                  icon: "i-lucide-square-pen",
                  color: "neutral",
                  variant: "outline",
                  to: unref(editMenuLink),
                  size: "sm"
                }, null, 8, ["to"])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section${_scopeId}><section class="mb-8 md:hidden"${_scopeId}>`);
            if (unref(status) === "pending") {
              _push2(`<section class="w-full max-w-xs mx-auto py-6"${_scopeId}>`);
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
            } else {
              _push2(`<!---->`);
            }
            if (unref(status) === "success") {
              _push2(ssrRenderComponent(_component_UCarousel, {
                ref: "carousel",
                items: unref(publicDays),
                class: "w-full max-w-xs mx-auto py-6",
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
            if (unref(status) === "pending") {
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
                createVNode("section", { class: "mb-8 md:hidden" }, [
                  unref(status) === "pending" ? (openBlock(), createBlock("section", {
                    key: 0,
                    class: "w-full max-w-xs mx-auto py-6"
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
                  ])) : createCommentVNode("", true),
                  unref(status) === "success" ? (openBlock(), createBlock(_component_UCarousel, {
                    key: 1,
                    ref: "carousel",
                    items: unref(publicDays),
                    class: "w-full max-w-xs mx-auto py-6",
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
                  unref(status) === "pending" ? (openBlock(), createBlock(Fragment, { key: 0 }, renderList(5, (day) => {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/menu/app/pages/menu/siguiente.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
