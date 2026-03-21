import { b as useToast, a as useSeoMeta, _ as _sfc_main$a } from './server.mjs';
import { _ as _sfc_main$1 } from './Skeleton-BGefXGSy.mjs';
import { _ as _sfc_main$2 } from './Alert-DmPqFZyZ.mjs';
import { _ as _sfc_main$3 } from './Card-BsgwMRuG.mjs';
import { _ as _sfc_main$4 } from './Modal-DHNNY9I2.mjs';
import { f as formatDate } from './helpers-W5IJF87J.mjs';
import { defineComponent, computed, ref, mergeProps, withCtx, createTextVNode, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useLazyFetch } from './fetch-Corms2LC.mjs';
import { u as useMenu } from './useMenu-jaOsa-c9.mjs';
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
import './overlay-CjyBzL1C.mjs';
import '@vue/shared';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      data: menus,
      refresh,
      status
    } = useLazyFetch(
      "/api/menu/all",
      {
        default: () => []
      },
      "$WqQXe5uEtg"
      /* nuxt-injected */
    );
    const isLoading = computed(() => status.value === "idle" || status.value === "pending");
    const activeMenu = computed(() => menus.value.find((menu) => menu.isActive) ?? null);
    const latestCreatedMenu = computed(() => menus.value[0] ?? null);
    const { deleteMenuOnDB, setActiveMenuOnDB } = useMenu();
    const toast = useToast();
    const deletingId = ref(null);
    const activatingId = ref(null);
    const pendingDeleteMenu = ref(null);
    const deleteModalDescription = computed(
      () => pendingDeleteMenu.value ? `Se eliminará "${pendingDeleteMenu.value.name}". Esta acción no se puede deshacer.` : void 0
    );
    const isDeleteModalOpen = computed({
      get: () => Boolean(pendingDeleteMenu.value),
      set: (value) => {
        if (!value) {
          pendingDeleteMenu.value = null;
        }
      }
    });
    function requestDelete(menu) {
      pendingDeleteMenu.value = menu;
    }
    async function onDelete(id) {
      deletingId.value = id;
      try {
        await deleteMenuOnDB(id);
        await refresh();
        toast.add({ title: "Menú eliminado", color: "success" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo eliminar";
        toast.add({ title: "Error", description: message, color: "error" });
      } finally {
        deletingId.value = null;
        pendingDeleteMenu.value = null;
      }
    }
    async function onSetActive(id) {
      activatingId.value = id;
      try {
        await setActiveMenuOnDB(id);
        await refresh();
        toast.add({ title: "Menú activo actualizado", color: "success" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo actualizar el menú activo";
        toast.add({ title: "Error", description: message, color: "error" });
      } finally {
        activatingId.value = null;
      }
    }
    useSeoMeta({
      title: "Gestión de menús semanales | Heltifud Meal Preps",
      description: "Administra la rotación semanal de menús dentro del panel administrativo de Heltifud Meal Preps.",
      robots: "noindex, nofollow"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$a;
      const _component_USkeleton = _sfc_main$1;
      const _component_UAlert = _sfc_main$2;
      const _component_UCard = _sfc_main$3;
      const _component_UModal = _sfc_main$4;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "flex min-h-full flex-col space-y-6" }, _attrs))}><section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div class="space-y-2"><div class="space-y-1"><h1 class="text-3xl font-semibold tracking-tight text-primary">Menú semanal</h1><p class="max-w-2xl text-sm text-muted"> Crea nuevos menús, edita los existentes y mantén visible la próxima rotación semanal. </p></div></div><div class="flex items-center gap-3 lg:justify-end">`);
      _push(ssrRenderComponent(_component_UButton, {
        to: "/admin/menu/crear-nuevo",
        icon: "i-lucide-plus"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Nuevo menú `);
          } else {
            return [
              createTextVNode(" Nuevo menú ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section><section class="space-y-4"><section class="grid gap-3 lg:grid-cols-3"><div class="app-surface-soft relative px-4 py-4"><p class="pr-20 text-xs uppercase tracking-[0.18em] text-muted">Menú activo</p>`);
      if (unref(activeMenu)) {
        _push(ssrRenderComponent(_component_UButton, {
          to: `/admin/menu/${unref(activeMenu).id}`,
          size: "sm",
          variant: "outline",
          color: "neutral",
          icon: "i-lucide-square-arrow-out-up-right",
          class: "absolute right-4 top-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Abrir `);
            } else {
              return [
                createTextVNode(" Abrir ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isLoading)) {
        _push(ssrRenderComponent(_component_USkeleton, { class: "mt-3 h-6 w-40 rounded-lg" }, null, _parent));
      } else {
        _push(`<div class="mt-3 space-y-1"><p class="line-clamp-1 text-base font-semibold text-highlighted">${ssrInterpolate(unref(activeMenu)?.name ?? "Sin menú activo")}</p><p class="text-sm text-muted">${ssrInterpolate(unref(activeMenu) ? `${("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(unref(activeMenu).startDate)} - ${("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(unref(activeMenu).endDate)}` : "Activa uno desde la lista inferior.")}</p></div>`);
      }
      _push(`</div><div class="app-surface-soft px-4 py-4"><p class="text-xs uppercase tracking-[0.18em] text-muted">Último agregado</p>`);
      if (unref(isLoading)) {
        _push(ssrRenderComponent(_component_USkeleton, { class: "mt-3 h-6 w-40 rounded-lg" }, null, _parent));
      } else {
        _push(`<div class="mt-3 space-y-1"><p class="line-clamp-1 text-base font-semibold text-highlighted">${ssrInterpolate(unref(latestCreatedMenu)?.name ?? "Sin registros")}</p><p class="text-sm text-muted">${ssrInterpolate(unref(latestCreatedMenu) ? `Creado el ${("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(unref(latestCreatedMenu).createdAt)}` : "Crea tu primer menú semanal.")}</p></div>`);
      }
      _push(`</div><div class="app-surface-soft px-4 py-4"><p class="text-xs uppercase tracking-[0.18em] text-muted">Menús creados</p>`);
      if (unref(isLoading)) {
        _push(ssrRenderComponent(_component_USkeleton, { class: "mt-3 h-8 w-14 rounded-lg" }, null, _parent));
      } else {
        _push(`<div class="mt-3 space-y-1"><p class="text-2xl font-bold text-highlighted">${ssrInterpolate(unref(menus).length)}</p><p class="text-sm text-muted">Total de menús semanales registrados.</p></div>`);
      }
      _push(`</div></section>`);
      if (unref(isLoading)) {
        _push(`<section class="grid grid-cols-1 xl:grid-cols-2 gap-4"><!--[-->`);
        ssrRenderList(4, (index) => {
          _push(ssrRenderComponent(_component_USkeleton, {
            key: index,
            class: "h-48 w-full"
          }, null, _parent));
        });
        _push(`<!--]--></section>`);
      } else if (!unref(menus).length) {
        _push(ssrRenderComponent(_component_UAlert, {
          title: "Aún no hay menús",
          description: "Empieza creando el primer menú semanal desde el botón de arriba.",
          color: "neutral",
          variant: "soft",
          icon: "i-lucide-notebook-tabs"
        }, null, _parent));
      } else {
        _push(`<section class="grid grid-cols-1 xl:grid-cols-2 gap-4"><!--[-->`);
        ssrRenderList(unref(menus), (menu) => {
          _push(ssrRenderComponent(_component_UCard, {
            key: menu.id,
            class: "app-surface",
            ui: {
              header: menu.isActive ? "bg-primary/18 text-highlighted px-5 py-4 sm:px-6" : "bg-default text-highlighted px-5 py-4 sm:px-6",
              body: "px-5 py-5 sm:px-6",
              footer: "px-5 py-4 sm:px-6"
            }
          }, {
            header: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<section class="flex items-start justify-between gap-3"${_scopeId}><div${_scopeId}><h3 class="${ssrRenderClass([menu.isActive ? "text-primary" : "text-highlighted", "text-lg font-bold"])}"${_scopeId}>${ssrInterpolate(menu.name)}</h3><p class="${ssrRenderClass([menu.isActive ? "text-slate-700 dark:text-slate-200" : "text-muted", "mt-1 text-sm"])}"${_scopeId}>${ssrInterpolate(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.startDate))} - ${ssrInterpolate(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.endDate))}</p></div><section class="flex flex-wrap justify-end gap-2"${_scopeId}>`);
                if (menu.isActive) {
                  _push2(ssrRenderComponent(_component_UButton, {
                    to: "/menu",
                    variant: "ghost",
                    icon: "i-lucide-eye",
                    class: "text-slate-700 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-200"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` Ver público `);
                      } else {
                        return [
                          createTextVNode(" Ver público ")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(ssrRenderComponent(_component_UButton, {
                  variant: menu.isActive ? "solid" : "soft",
                  color: menu.isActive ? "success" : "primary",
                  icon: "i-lucide-badge-check",
                  loading: unref(activatingId) === menu.id,
                  disabled: menu.isActive,
                  class: menu.isActive ? "text-white dark:text-black" : "",
                  onClick: ($event) => onSetActive(menu.id)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(menu.isActive ? "Activo" : "Activar")}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(menu.isActive ? "Activo" : "Activar"), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</section></section>`);
              } else {
                return [
                  createVNode("section", { class: "flex items-start justify-between gap-3" }, [
                    createVNode("div", null, [
                      createVNode("h3", {
                        class: ["text-lg font-bold", menu.isActive ? "text-primary" : "text-highlighted"]
                      }, toDisplayString(menu.name), 3),
                      createVNode("p", {
                        class: ["mt-1 text-sm", menu.isActive ? "text-slate-700 dark:text-slate-200" : "text-muted"]
                      }, toDisplayString(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.startDate)) + " - " + toDisplayString(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.endDate)), 3)
                    ]),
                    createVNode("section", { class: "flex flex-wrap justify-end gap-2" }, [
                      menu.isActive ? (openBlock(), createBlock(_component_UButton, {
                        key: 0,
                        to: "/menu",
                        variant: "ghost",
                        icon: "i-lucide-eye",
                        class: "text-slate-700 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-200"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Ver público ")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_UButton, {
                        variant: menu.isActive ? "solid" : "soft",
                        color: menu.isActive ? "success" : "primary",
                        icon: "i-lucide-badge-check",
                        loading: unref(activatingId) === menu.id,
                        disabled: menu.isActive,
                        class: menu.isActive ? "text-white dark:text-black" : "",
                        onClick: ($event) => onSetActive(menu.id)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(menu.isActive ? "Activo" : "Activar"), 1)
                        ]),
                        _: 2
                      }, 1032, ["variant", "color", "loading", "disabled", "class", "onClick"])
                    ])
                  ])
                ];
              }
            }),
            footer: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<section class="flex flex-wrap justify-end gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UButton, {
                  to: `/admin/menu/${menu.id}`,
                  variant: "ghost",
                  color: "neutral",
                  icon: "i-lucide-square-pen"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Editar `);
                    } else {
                      return [
                        createTextVNode(" Editar ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UButton, {
                  color: "error",
                  variant: "ghost",
                  icon: "i-lucide-trash",
                  loading: unref(deletingId) === menu.id,
                  onClick: ($event) => requestDelete(menu)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Eliminar `);
                    } else {
                      return [
                        createTextVNode(" Eliminar ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</section>`);
              } else {
                return [
                  createVNode("section", { class: "flex flex-wrap justify-end gap-2" }, [
                    createVNode(_component_UButton, {
                      to: `/admin/menu/${menu.id}`,
                      variant: "ghost",
                      color: "neutral",
                      icon: "i-lucide-square-pen"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Editar ")
                      ]),
                      _: 1
                    }, 8, ["to"]),
                    createVNode(_component_UButton, {
                      color: "error",
                      variant: "ghost",
                      icon: "i-lucide-trash",
                      loading: unref(deletingId) === menu.id,
                      onClick: ($event) => requestDelete(menu)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Eliminar ")
                      ]),
                      _: 1
                    }, 8, ["loading", "onClick"])
                  ])
                ];
              }
            }),
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<section class="space-y-3"${_scopeId}><section class="grid grid-cols-2 gap-2 text-sm"${_scopeId}><div class="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900"${_scopeId}><span class="text-muted"${_scopeId}>Creado</span><p class="font-medium text-highlighted"${_scopeId}>${ssrInterpolate(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.createdAt))}</p></div><div class="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900"${_scopeId}><span class="text-muted"${_scopeId}>Actualizado</span><p class="font-medium text-highlighted"${_scopeId}>${ssrInterpolate(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.updatedAt))}</p></div></section></section>`);
              } else {
                return [
                  createVNode("section", { class: "space-y-3" }, [
                    createVNode("section", { class: "grid grid-cols-2 gap-2 text-sm" }, [
                      createVNode("div", { class: "rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900" }, [
                        createVNode("span", { class: "text-muted" }, "Creado"),
                        createVNode("p", { class: "font-medium text-highlighted" }, toDisplayString(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.createdAt)), 1)
                      ]),
                      createVNode("div", { class: "rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900" }, [
                        createVNode("span", { class: "text-muted" }, "Actualizado"),
                        createVNode("p", { class: "font-medium text-highlighted" }, toDisplayString(("formatDate" in _ctx ? _ctx.formatDate : unref(formatDate))(menu.updatedAt)), 1)
                      ])
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></section>`);
      }
      _push(`</section>`);
      _push(ssrRenderComponent(_component_UModal, {
        open: unref(isDeleteModalOpen),
        "onUpdate:open": ($event) => isRef(isDeleteModalOpen) ? isDeleteModalOpen.value = $event : null,
        title: "Eliminar menú",
        description: unref(deleteModalDescription),
        ui: { content: "max-w-md" }
      }, {
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UAlert, {
              color: "error",
              variant: "soft",
              icon: "i-lucide-triangle-alert",
              title: "Confirma la eliminación",
              description: "Si continúas, el menú semanal y su configuración asociada dejarán de estar disponibles."
            }, null, _parent2, _scopeId));
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "space-y-4" }, [
                createVNode(_component_UAlert, {
                  color: "error",
                  variant: "soft",
                  icon: "i-lucide-triangle-alert",
                  title: "Confirma la eliminación",
                  description: "Si continúas, el menú semanal y su configuración asociada dejarán de estar disponibles."
                })
              ])
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="flex w-full justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "ghost",
              color: "neutral",
              onClick: ($event) => pendingDeleteMenu.value = null
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Cancelar `);
                } else {
                  return [
                    createTextVNode(" Cancelar ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              color: "error",
              loading: unref(deletingId) === unref(pendingDeleteMenu)?.id,
              icon: "i-lucide-trash",
              onClick: ($event) => unref(pendingDeleteMenu) && onDelete(unref(pendingDeleteMenu).id)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Eliminar menú `);
                } else {
                  return [
                    createTextVNode(" Eliminar menú ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "flex w-full justify-end gap-2" }, [
                createVNode(_component_UButton, {
                  variant: "ghost",
                  color: "neutral",
                  onClick: ($event) => pendingDeleteMenu.value = null
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Cancelar ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  color: "error",
                  loading: unref(deletingId) === unref(pendingDeleteMenu)?.id,
                  icon: "i-lucide-trash",
                  onClick: ($event) => unref(pendingDeleteMenu) && onDelete(unref(pendingDeleteMenu).id)
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Eliminar menú ")
                  ]),
                  _: 1
                }, 8, ["loading", "onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/admin/menu/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
