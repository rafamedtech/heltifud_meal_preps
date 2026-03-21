import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { a as useSeoMeta } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "blog",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Blog | Heltifud Meal Preps",
      description: "Artículos, novedades y contenido relacionado con alimentación saludable, meal prep y estilo de vida.",
      ogTitle: "Blog | Heltifud Meal Preps",
      ogDescription: "Contenido y novedades sobre meal prep, salud y alimentación balanceada.",
      twitterTitle: "Blog | Heltifud Meal Preps",
      twitterDescription: "Novedades y contenido sobre alimentación saludable y meal prep."
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>blog</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/blog.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
