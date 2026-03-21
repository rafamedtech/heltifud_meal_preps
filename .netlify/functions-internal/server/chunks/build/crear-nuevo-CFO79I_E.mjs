import { u as useRoute, a as useSeoMeta, _ as _sfc_main$a, n as navigateTo } from './server.mjs';
import { _ as __nuxt_component_3 } from './FoodCatalogForm-Bwv9kY2h.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
import './Card-BsgwMRuG.mjs';
import './Form-BatySvBg.mjs';
import './Input-DL0XnWnl.mjs';
import './Select-CO4MAQzv.mjs';
import './menuSchema-i-S62L_E.mjs';
import './useFoodCatalog-ZWMZGalP.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "crear-nuevo",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const returnTo = computed(() => typeof route.query.returnTo === "string" ? route.query.returnTo : void 0);
    const backTo = computed(() => returnTo.value ?? "/admin/platillos");
    useSeoMeta({
      title: "Gestión de platillos | Crear nuevo platillo | Heltifud Meal Preps",
      description: "Crea un nuevo platillo dentro del catálogo reutilizable del panel administrativo de Heltifud Meal Preps.",
      robots: "noindex, nofollow"
    });
    async function onSaved() {
      if (typeof route.query.returnTo === "string") {
        await navigateTo(route.query.returnTo);
        return;
      }
      await navigateTo("/admin/platillos");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$a;
      const _component_AdminFoodCatalogForm = __nuxt_component_3;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div class="space-y-1"><h1 class="text-3xl font-semibold tracking-tight text-primary">Crear nuevo platillo</h1><p class="max-w-2xl text-sm text-muted"> Crea un nuevo platillo y guárdalo en el catálogo reusable para usarlo en los menús semanales. </p></div><div class="flex items-center gap-3 lg:justify-end">`);
      _push(ssrRenderComponent(_component_UButton, {
        to: unref(backTo),
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
      _push(`</div></section><div class="mx-auto w-full max-w-5xl">`);
      _push(ssrRenderComponent(_component_AdminFoodCatalogForm, {
        mode: "create",
        onSaved
      }, null, _parent));
      _push(`</div></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/admin/platillos/crear-nuevo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
