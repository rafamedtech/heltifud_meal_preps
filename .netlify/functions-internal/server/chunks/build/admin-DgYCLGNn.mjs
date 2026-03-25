import { r as _export_sfc, F as useState, C as __nuxt_component_0$1, n as _sfc_main$g, q as _sfc_main$a, B as useRoute, D as useToast, E as navigateTo } from './server.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, toDisplayString, ref, createTextVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { c as adminLinks, d as _sfc_main$2$1, l as links } from './helpers-DvbKa16t.mjs';
import { _ as __nuxt_component_3, a as _sfc_main$1$1 } from './ColorMode-CRH3sfgh.mjs';
import { _ as _sfc_main$5 } from './Alert-_2s6ixe-.mjs';
import { _ as _sfc_main$4 } from './Card-BPxSZRcN.mjs';
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
import 'reka-ui/namespaced';

const collapsedItemIconClass = "size-7 shrink-0";
const collapsedItemLabelClass = "text-[11px] font-medium leading-tight";
const expandedItemIconClass = "size-[18px] shrink-0";
const expandedItemLabelClass = "text-[15px] font-medium";
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "NavigationMenu",
  __ssrInlineRender: true,
  props: {
    collapsed: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const collapsed = computed(() => props.collapsed ?? false);
    const route = useRoute();
    const sections = computed(() => adminLinks);
    const flatItems = computed(
      () => sections.value.flatMap(
        (group) => group.flatMap((item) => {
          if (item.children?.length) {
            return item.children;
          }
          return [item];
        })
      )
    );
    function isCurrent(item) {
      if (!item.to) {
        return false;
      }
      const normalizeAdminPath = (path) => path.replace(/\/$/, "").split("/").filter(Boolean).slice(1);
      const currentSegments = normalizeAdminPath(route.path);
      const itemSegments = normalizeAdminPath(item.to);
      if (!itemSegments.length) {
        return currentSegments.length === 0;
      }
      return itemSegments.every((segment, index) => currentSegments[index] === segment);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_UIcon = _sfc_main$g;
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "flex h-full flex-col" }, _attrs))}>`);
      if (unref(collapsed)) {
        _push(`<section class="flex flex-1 flex-col items-center gap-2 py-1"><!--[-->`);
        ssrRenderList(unref(flatItems), (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: `${item.label}-${item.to}`,
            to: item.to,
            class: [
              "app-nav-item app-sidebar-link group relative flex w-full max-w-[3.75rem] flex-col items-center justify-center gap-1.5 px-1 py-2.5 text-center transition-all duration-200",
              isCurrent(item) ? "app-sidebar-link-active text-primary" : "text-muted hover:text-highlighted"
            ]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: item.icon || "i-heroicons-chevron-right",
                  class: collapsedItemIconClass
                }, null, _parent2, _scopeId));
                _push2(`<span class="${ssrRenderClass(collapsedItemLabelClass)}"${_scopeId}>${ssrInterpolate(item.label)}</span>`);
              } else {
                return [
                  createVNode(_component_UIcon, {
                    name: item.icon || "i-heroicons-chevron-right",
                    class: collapsedItemIconClass
                  }, null, 8, ["name"]),
                  createVNode("span", { class: collapsedItemLabelClass }, toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></section>`);
      } else {
        _push(`<section class="flex flex-1 flex-col gap-2.5 py-0.5"><!--[-->`);
        ssrRenderList(unref(sections), (group, groupIndex) => {
          _push(`<section class="space-y-1"><!--[-->`);
          ssrRenderList(group, (item) => {
            _push(`<!--[-->`);
            if (!item.children?.length && item.to) {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: item.to,
                class: [
                  "app-nav-item app-sidebar-link group flex items-center gap-3 px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  isCurrent(item) ? "app-sidebar-link-active text-primary" : "text-muted hover:text-highlighted"
                ]
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(ssrRenderComponent(_component_UIcon, {
                      name: item.icon || "i-heroicons-chevron-right",
                      class: expandedItemIconClass
                    }, null, _parent2, _scopeId));
                    _push2(`<span class="${ssrRenderClass(expandedItemLabelClass)}"${_scopeId}>${ssrInterpolate(item.label)}</span>`);
                  } else {
                    return [
                      createVNode(_component_UIcon, {
                        name: item.icon || "i-heroicons-chevron-right",
                        class: expandedItemIconClass
                      }, null, 8, ["name"]),
                      createVNode("span", { class: expandedItemLabelClass }, toDisplayString(item.label), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<section class="space-y-0.5"><div class="flex items-center gap-2.5 px-3 py-0.5 text-[14px] font-medium text-muted">`);
              _push(ssrRenderComponent(_component_UIcon, {
                name: item.icon || "i-heroicons-chevron-right",
                class: expandedItemIconClass
              }, null, _parent));
              _push(`<span>${ssrInterpolate(item.label)}</span></div><div class="app-sidebar-subtree ml-2 space-y-0 pl-4"><!--[-->`);
              ssrRenderList(item.children, (child) => {
                _push(ssrRenderComponent(_component_NuxtLink, {
                  key: `${child.label}-${child.to}`,
                  to: child.to,
                  class: [
                    "app-nav-item app-sidebar-link flex items-center gap-2.5 px-3 py-1 text-[14px] transition-all duration-200",
                    isCurrent(child) ? "app-sidebar-link-active font-medium text-primary" : "text-muted hover:text-highlighted"
                  ]
                }, {
                  default: withCtx((_, _push2, _parent2, _scopeId) => {
                    if (_push2) {
                      _push2(ssrRenderComponent(_component_UIcon, {
                        name: child.icon || "i-heroicons-chevron-right",
                        class: expandedItemIconClass
                      }, null, _parent2, _scopeId));
                      _push2(`<span class="${ssrRenderClass(expandedItemLabelClass)}"${_scopeId}>${ssrInterpolate(child.label)}</span>`);
                    } else {
                      return [
                        createVNode(_component_UIcon, {
                          name: child.icon || "i-heroicons-chevron-right",
                          class: expandedItemIconClass
                        }, null, 8, ["name"]),
                        createVNode("span", { class: expandedItemLabelClass }, toDisplayString(child.label), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent));
              });
              _push(`<!--]--></div></section>`);
            }
            _push(`<!--]-->`);
          });
          _push(`<!--]--></section>`);
        });
        _push(`<!--]--></section>`);
      }
      _push(`</nav>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/NavigationMenu.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$3, { __name: "AdminNavigationMenu" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Header",
  __ssrInlineRender: true,
  props: {
    collapsed: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const toast = useToast();
    const isConfirmOpen = ref(false);
    const isLoggingOut = ref(false);
    const collapsed = computed(() => props.collapsed ?? false);
    async function logout() {
      isLoggingOut.value = true;
      isLoggingOut.value = false;
      isConfirmOpen.value = false;
      toast.add({
        title: "Sesión cerrada",
        description: "Redirigiendo al login.",
        color: "success"
      });
      await navigateTo("/login");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$a;
      const _component_UModal = _sfc_main$2$1;
      const _component_UAlert = _sfc_main$5;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "flex min-h-24 items-center justify-between gap-4" }, _attrs))}><div class="min-w-0"><div class="min-w-0"><h1 class="truncate text-xl font-semibold text-highlighted">Panel de gestión</h1><p class="mt-1 text-sm text-muted">${ssrInterpolate(unref(collapsed) ? "Navegación compacta activa." : "Controla menús, platillos y rotación semanal.")}</p></div></div><div class="hidden items-center gap-3 lg:flex">`);
      _push(ssrRenderComponent(_component_UButton, {
        color: "neutral",
        variant: "outline",
        icon: "i-lucide-log-out",
        class: "app-chip-surface",
        onClick: ($event) => isConfirmOpen.value = true
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Logout `);
          } else {
            return [
              createTextVNode(" Logout ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UModal, {
        open: unref(isConfirmOpen),
        "onUpdate:open": ($event) => isRef(isConfirmOpen) ? isConfirmOpen.value = $event : null,
        title: "Cerrar sesión",
        description: "¿Seguro que quieres salir del panel administrativo?",
        ui: { content: "max-w-md" }
      }, {
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UAlert, {
              color: "error",
              variant: "soft",
              icon: "i-lucide-log-out",
              title: "Confirma esta acción",
              description: "Se cerrará tu sesión actual y regresarás a la pantalla de login."
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UAlert, {
                color: "error",
                variant: "soft",
                icon: "i-lucide-log-out",
                title: "Confirma esta acción",
                description: "Se cerrará tu sesión actual y regresarás a la pantalla de login."
              })
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex w-full justify-end gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "ghost",
              disabled: unref(isLoggingOut),
              onClick: ($event) => isConfirmOpen.value = false
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
              loading: unref(isLoggingOut),
              disabled: unref(isLoggingOut),
              icon: "i-lucide-log-out",
              onClick: logout
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Cerrar sesión `);
                } else {
                  return [
                    createTextVNode(" Cerrar sesión ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex w-full justify-end gap-3" }, [
                createVNode(_component_UButton, {
                  color: "neutral",
                  variant: "ghost",
                  disabled: unref(isLoggingOut),
                  onClick: ($event) => isConfirmOpen.value = false
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Cancelar ")
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                createVNode(_component_UButton, {
                  color: "error",
                  loading: unref(isLoggingOut),
                  disabled: unref(isLoggingOut),
                  icon: "i-lucide-log-out",
                  onClick: logout
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Cerrar sesión ")
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/Header.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$2, { __name: "AdminHeader" });
const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_UNavigationMenu = _sfc_main$1$1;
  _push(ssrRenderComponent(_component_UNavigationMenu, mergeProps({
    orientation: "horizontal",
    variant: "link",
    items: "links" in _ctx ? _ctx.links : unref(links),
    ui: {
      root: "justify-between w-full [&>div]:min-w-full",
      item: "flex-[1]",
      link: "flex-col "
    }
  }, _attrs), null, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/MobileNav.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]), { __name: "MobileNav" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const isSidebarCollapsed = useState("admin-sidebar-collapsed", () => false);
    const sidebarWidthClass = computed(() => isSidebarCollapsed.value ? "md:w-24 xl:w-24" : "md:w-24 xl:w-64");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_UIcon = _sfc_main$g;
      const _component_AdminNavigationMenu = __nuxt_component_2;
      const _component_ColorMode = __nuxt_component_3;
      const _component_UButton = _sfc_main$a;
      const _component_AdminHeader = __nuxt_component_5;
      const _component_UCard = _sfc_main$4;
      const _component_MobileNav = __nuxt_component_7;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-shell h-dvh min-h-dvh overflow-hidden bg-neutral-50 text-highlighted dark:bg-neutral-950" }, _attrs))} data-v-0fd5801f><div class="flex h-full w-full" data-v-0fd5801f><aside class="${ssrRenderClass([unref(sidebarWidthClass), "app-sidebar hidden h-full shrink-0 transition-[width] duration-200 md:flex md:flex-col"])}" data-v-0fd5801f><div class="app-sidebar-header relative flex min-h-20 items-center px-4 py-3" data-v-0fd5801f><div class="relative flex w-full flex-col items-center gap-3 xl:hidden" data-v-0fd5801f>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin",
        class: "flex items-center justify-center rounded-xl"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary" data-v-0fd5801f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-heroicons-squares-2x2",
              class: "size-6"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary" }, [
                createVNode(_component_UIcon, {
                  name: "i-heroicons-squares-2x2",
                  class: "size-6"
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(isSidebarCollapsed)) {
        _push(`<div class="relative hidden w-full flex-col items-center gap-3 xl:flex" data-v-0fd5801f>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin",
          class: "flex items-center justify-center rounded-xl"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary" data-v-0fd5801f${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-heroicons-squares-2x2",
                class: "size-6"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex size-9 items-center justify-center rounded-xl bg-primary/8 text-primary" }, [
                  createVNode(_component_UIcon, {
                    name: "i-heroicons-squares-2x2",
                    class: "size-6"
                  })
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="relative hidden w-full items-center xl:flex" data-v-0fd5801f>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin",
          class: "flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-0.5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex size-7 items-center justify-center rounded-lg bg-primary/8 text-primary" data-v-0fd5801f${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-heroicons-squares-2x2",
                class: "size-4"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="min-w-0" data-v-0fd5801f${_scopeId}><p class="truncate text-sm font-semibold text-highlighted" data-v-0fd5801f${_scopeId}>Heltifud Admin</p><p class="truncate text-[11px] text-muted" data-v-0fd5801f${_scopeId}>Operación interna</p></div>`);
            } else {
              return [
                createVNode("div", { class: "flex size-7 items-center justify-center rounded-lg bg-primary/8 text-primary" }, [
                  createVNode(_component_UIcon, {
                    name: "i-heroicons-squares-2x2",
                    class: "size-4"
                  })
                ]),
                createVNode("div", { class: "min-w-0" }, [
                  createVNode("p", { class: "truncate text-sm font-semibold text-highlighted" }, "Heltifud Admin"),
                  createVNode("p", { class: "truncate text-[11px] text-muted" }, "Operación interna")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div><div class="admin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-4 px-4 xl:hidden" data-v-0fd5801f>`);
      _push(ssrRenderComponent(_component_AdminNavigationMenu, { collapsed: "" }, null, _parent));
      _push(`</div><div class="hidden min-h-0 flex-1 xl:block" data-v-0fd5801f>`);
      if (unref(isSidebarCollapsed)) {
        _push(`<div class="admin-scrollbar min-h-0 h-full flex-1 flex-col overflow-y-auto py-4 px-4" data-v-0fd5801f>`);
        _push(ssrRenderComponent(_component_AdminNavigationMenu, { collapsed: "" }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="admin-scrollbar min-h-0 h-full flex-1 flex-col overflow-y-auto py-4 px-4" data-v-0fd5801f>`);
        _push(ssrRenderComponent(_component_AdminNavigationMenu, { collapsed: false }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div><div class="app-sidebar-footer py-4 px-4 xl:hidden" data-v-0fd5801f><div class="flex w-full justify-center" data-v-0fd5801f>`);
      _push(ssrRenderComponent(_component_ColorMode, { compact: "" }, null, _parent));
      _push(`</div></div><div class="app-sidebar-footer hidden py-4 px-4 xl:block" data-v-0fd5801f>`);
      if (unref(isSidebarCollapsed)) {
        _push(`<div class="flex flex-col items-center gap-3" data-v-0fd5801f><div class="flex w-full justify-center" data-v-0fd5801f>`);
        _push(ssrRenderComponent(_component_ColorMode, { compact: "" }, null, _parent));
        _push(`</div><div class="flex w-full justify-center" data-v-0fd5801f>`);
        _push(ssrRenderComponent(_component_UButton, {
          square: "",
          size: "sm",
          variant: "ghost",
          color: "neutral",
          icon: "i-lucide-panel-left-open",
          class: "app-nav-item app-sidebar-link border-0 bg-transparent text-muted shadow-none flex size-11 items-center justify-center p-0",
          ui: { leadingIcon: "m-0 size-5 shrink-0" },
          onClick: ($event) => isSidebarCollapsed.value = !unref(isSidebarCollapsed)
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<div class="flex flex-col items-stretch gap-3" data-v-0fd5801f>`);
        _push(ssrRenderComponent(_component_ColorMode, null, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          size: "sm",
          variant: "ghost",
          color: "neutral",
          class: "app-nav-item app-sidebar-link justify-start border-0 bg-transparent px-3 py-2.5 text-sm font-medium text-muted shadow-none",
          ui: { base: "justify-start", leadingIcon: "m-0 size-5 shrink-0" },
          icon: "i-lucide-panel-left-close",
          onClick: ($event) => isSidebarCollapsed.value = !unref(isSidebarCollapsed)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-0fd5801f${_scopeId}>Colapsar</span>`);
            } else {
              return [
                createVNode("span", null, "Colapsar")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div></aside><main class="flex min-w-0 flex-1 flex-col overflow-hidden" data-v-0fd5801f><div class="h-24 border-b border-default/70 bg-default/70 px-4 backdrop-blur-xl md:px-8" data-v-0fd5801f><div class="mx-auto flex w-full max-w-400 items-center justify-between gap-3" data-v-0fd5801f><section class="min-w-0 flex-1" data-v-0fd5801f>`);
      _push(ssrRenderComponent(_component_AdminHeader, { collapsed: unref(isSidebarCollapsed) }, null, _parent));
      _push(`</section></div></div><section class="admin-scrollbar min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] px-4 py-6 pb-24 md:px-8 md:pb-8" data-v-0fd5801f><div class="mx-auto w-full max-w-400" data-v-0fd5801f>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></section></main></div><section class="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden" data-v-0fd5801f>`);
      _push(ssrRenderComponent(_component_UCard, {
        class: "w-full border-default/70 shadow-lg",
        ui: { body: "p-0 sm:p-0 px-2" }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_MobileNav, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_MobileNav)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const admin = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0fd5801f"]]);

export { admin as default };
//# sourceMappingURL=admin-DgYCLGNn.mjs.map
