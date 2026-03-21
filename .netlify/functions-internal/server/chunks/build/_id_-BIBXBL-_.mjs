import { u as useRoute, a as useSeoMeta, e as _sfc_main$g, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$1 } from './Alert-DmPqFZyZ.mjs';
import { _ as __nuxt_component_2 } from './MenuForm-BF0jQvpY.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useLazyFetch } from './fetch-Corms2LC.mjs';
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
import './Form-BatySvBg.mjs';
import './Card-BsgwMRuG.mjs';
import './FormField-Dr2ldvax.mjs';
import './Input-DL0XnWnl.mjs';
import './Popover-CMIe6n2p.mjs';
import 'reka-ui/namespaced';
import './overlay-CjyBzL1C.mjs';
import './Calendar-DiIhPoAA.mjs';
import 'reka-ui/date';
import '@internationalized/date';
import './FoodCatalogTable-DqonpOrN.mjs';
import './Select-CO4MAQzv.mjs';
import './Skeleton-BGefXGSy.mjs';
import './Badge-BtXv9wz2.mjs';
import './Modal-DHNNY9I2.mjs';
import './menuSchema-i-S62L_E.mjs';
import './useMenu-jaOsa-c9.mjs';
import '@vue/shared';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { data: menu, status, refresh, error } = useLazyFetch(
      `/api/menu/${route.params.id}`,
      {
        key: `admin-menu-${route.params.id}`
      },
      "$MeLFhcrHhj"
      /* nuxt-injected */
    );
    const isLoading = computed(() => status.value === "idle" || status.value === "pending");
    useSeoMeta({
      title: "Gestión de menús semanales | Editar menú | Heltifud Meal Preps",
      description: "Edita un menú semanal existente dentro del panel de gestión de menús de Heltifud Meal Preps.",
      robots: "noindex, nofollow"
    });
    async function onSaved() {
      await refresh();
      await navigateTo("/admin/menu");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$g;
      const _component_UAlert = _sfc_main$1;
      const _component_AdminMenuForm = __nuxt_component_2;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "min-h-full space-y-6" }, _attrs))}>`);
      if (unref(isLoading)) {
        _push(`<section class="flex min-h-[70vh] items-center justify-center"><div class="flex flex-col items-center gap-4 text-center"><div class="flex size-14 items-center justify-center rounded-full border border-default/70 bg-elevated shadow-sm">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-circle",
          class: "size-7 animate-spin text-primary"
        }, null, _parent));
        _push(`</div><div class="space-y-1"><p class="text-lg font-semibold text-primary">Cargando</p><p class="text-sm text-muted">Estamos preparando el menú semanal para editarlo.</p></div></div></section>`);
      } else if (unref(error)) {
        _push(ssrRenderComponent(_component_UAlert, {
          color: "error",
          variant: "soft",
          title: "No se pudo cargar el menú",
          description: unref(error).statusMessage || "Intenta de nuevo en unos segundos.",
          icon: "i-lucide-circle-alert"
        }, null, _parent));
      } else if (unref(menu)) {
        _push(ssrRenderComponent(_component_AdminMenuForm, {
          menu: unref(menu),
          mode: "edit",
          onSaved
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/admin/menu/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
