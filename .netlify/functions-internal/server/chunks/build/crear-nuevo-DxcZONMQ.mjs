import { _ as __nuxt_component_2 } from './MenuForm-BF0jQvpY.mjs';
import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { a as useSeoMeta, n as navigateTo } from './server.mjs';
import './Form-BatySvBg.mjs';
import '@vueuse/core';
import './Card-BsgwMRuG.mjs';
import 'reka-ui';
import './FormField-Dr2ldvax.mjs';
import './Input-DL0XnWnl.mjs';
import './Popover-CMIe6n2p.mjs';
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
import './Alert-DmPqFZyZ.mjs';
import './menuSchema-i-S62L_E.mjs';
import './useMenu-jaOsa-c9.mjs';
import './fetch-Corms2LC.mjs';
import '@vue/shared';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "crear-nuevo",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Gestión de menús semanales | Crear nuevo menú | Heltifud Meal Preps",
      description: "Crea un nuevo menú semanal dentro del panel de gestión de menús de Heltifud Meal Preps.",
      robots: "noindex, nofollow"
    });
    function onSaved() {
      navigateTo("/admin/menu");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminMenuForm = __nuxt_component_2;
      _push(`<main${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminMenuForm, { onSaved }, null, _parent));
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/admin/menu/crear-nuevo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
