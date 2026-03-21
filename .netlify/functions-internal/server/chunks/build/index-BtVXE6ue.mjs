import { a as useSeoMeta, u as useRoute, b as useToast, _ as _sfc_main$a } from './server.mjs';
import { _ as _sfc_main$1 } from './Card-BsgwMRuG.mjs';
import { a as __nuxt_component_2 } from './FoodCatalogTable-DqonpOrN.mjs';
import { _ as _sfc_main$2 } from './Modal-DHNNY9I2.mjs';
import { _ as _sfc_main$3 } from './Alert-DmPqFZyZ.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useLazyFetch } from './fetch-Corms2LC.mjs';
import { u as useFoodCatalog } from './useFoodCatalog-ZWMZGalP.mjs';
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
import './Input-DL0XnWnl.mjs';
import './Select-CO4MAQzv.mjs';
import './Skeleton-BGefXGSy.mjs';
import './Badge-BtXv9wz2.mjs';
import 'reka-ui/namespaced';
import './overlay-CjyBzL1C.mjs';
import '@vue/shared';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Gestión de platillos | Heltifud Meal Preps",
      description: "Administra el catálogo de platillos reutilizables dentro del panel administrativo de Heltifud Meal Preps.",
      robots: "noindex, nofollow"
    });
    const route = useRoute();
    const toast = useToast();
    const deletingId = ref(null);
    const pendingDeleteItem = ref(null);
    const {
      data: items,
      refresh,
      status
    } = useLazyFetch(
      "/api/food-components",
      {
        default: () => []
      },
      "$IPAQWp2R8P"
      /* nuxt-injected */
    );
    const isLoading = computed(() => status.value === "idle" || status.value === "pending");
    const deleteModalDescription = computed(
      () => pendingDeleteItem.value ? `Se eliminará "${pendingDeleteItem.value.nombre}". Esta acción no se puede deshacer.` : void 0
    );
    const isDeleteModalOpen = computed({
      get: () => Boolean(pendingDeleteItem.value),
      set: (value) => {
        if (!value) {
          pendingDeleteItem.value = null;
        }
      }
    });
    const { deleteFoodCatalogItem } = useFoodCatalog();
    const returnTo = computed(() => typeof route.query.returnTo === "string" ? route.query.returnTo : void 0);
    function requestDelete(item) {
      pendingDeleteItem.value = item;
    }
    async function onDelete(item) {
      deletingId.value = item.id;
      try {
        await deleteFoodCatalogItem(item.id);
        await refresh();
        toast.add({ title: "Platillo eliminado", color: "success" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo eliminar el platillo";
        toast.add({ title: "Error", description: message, color: "error" });
      } finally {
        deletingId.value = null;
        pendingDeleteItem.value = null;
      }
    }
    function editTo(item) {
      return { path: `/admin/platillos/${item.id}`, query: returnTo.value ? { returnTo: returnTo.value } : {} };
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$a;
      const _component_UCard = _sfc_main$1;
      const _component_AdminFoodCatalogTable = __nuxt_component_2;
      const _component_UModal = _sfc_main$2;
      const _component_UAlert = _sfc_main$3;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "flex min-h-full flex-col space-y-6" }, _attrs))}><section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div class="space-y-2"><div class="space-y-1"><h1 class="text-3xl font-semibold tracking-tight text-primary">Platillos</h1><p class="max-w-2xl text-sm text-muted">Administra el catálogo de platillos para los menús semanales.</p></div></div><div class="flex items-center gap-3 lg:justify-end">`);
      if (unref(returnTo)) {
        _push(ssrRenderComponent(_component_UButton, {
          to: unref(returnTo),
          variant: "ghost",
          color: "neutral",
          icon: "i-lucide-arrow-left"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Regresar `);
            } else {
              return [
                createTextVNode(" Regresar ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UButton, {
        to: { path: "/admin/platillos/crear-nuevo", query: unref(returnTo) ? { returnTo: unref(returnTo) } : {} },
        icon: "i-lucide-plus"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Nuevo platillo `);
          } else {
            return [
              createTextVNode(" Nuevo platillo ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section><div class="mx-auto w-full max-w-5xl">`);
      _push(ssrRenderComponent(_component_UCard, {
        class: "app-surface flex-1 overflow-hidden",
        ui: { body: "p-0 sm:p-0", header: "p-0 sm:p-0", footer: "p-0 sm:p-0" }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminFoodCatalogTable, {
              items: unref(items),
              loading: unref(isLoading),
              "deleting-id": unref(deletingId),
              "edit-to": editTo,
              onDelete: requestDelete
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminFoodCatalogTable, {
                items: unref(items),
                loading: unref(isLoading),
                "deleting-id": unref(deletingId),
                "edit-to": editTo,
                onDelete: requestDelete
              }, null, 8, ["items", "loading", "deleting-id"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UModal, {
        open: unref(isDeleteModalOpen),
        "onUpdate:open": ($event) => isRef(isDeleteModalOpen) ? isDeleteModalOpen.value = $event : null,
        title: "Eliminar platillo",
        description: unref(deleteModalDescription),
        ui: { content: "max-w-md" }
      }, {
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UAlert, {
              color: "error",
              variant: "soft",
              icon: "i-lucide-triangle-alert",
              title: "Confirma esta acción",
              description: "El platillo dejará de estar disponible para futuras selecciones en el catálogo."
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UAlert, {
                color: "error",
                variant: "soft",
                icon: "i-lucide-triangle-alert",
                title: "Confirma esta acción",
                description: "El platillo dejará de estar disponible para futuras selecciones en el catálogo."
              })
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex w-full justify-end gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "ghost",
              color: "neutral",
              onClick: ($event) => pendingDeleteItem.value = null
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
              loading: unref(deletingId) === unref(pendingDeleteItem)?.id,
              onClick: ($event) => unref(pendingDeleteItem) && onDelete(unref(pendingDeleteItem))
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Eliminar platillo `);
                } else {
                  return [
                    createTextVNode(" Eliminar platillo ")
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
                  variant: "ghost",
                  color: "neutral",
                  onClick: ($event) => pendingDeleteItem.value = null
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Cancelar ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  color: "error",
                  loading: unref(deletingId) === unref(pendingDeleteItem)?.id,
                  onClick: ($event) => unref(pendingDeleteItem) && onDelete(unref(pendingDeleteItem))
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Eliminar platillo ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/admin/platillos/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
