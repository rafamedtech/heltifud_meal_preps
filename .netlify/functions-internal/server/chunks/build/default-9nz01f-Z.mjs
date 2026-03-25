import { _ as __nuxt_component_0, b as _sfc_main$8, a as __nuxt_component_3 } from './TheFooter-CMqDDMO_.mjs';
import { _ as _sfc_main$1 } from './Separator-wL2r3kyL.mjs';
import { mergeProps, withCtx, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { r as _export_sfc } from './server.mjs';
import 'reka-ui';
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
import '@vueuse/core';
import './helpers-DvbKa16t.mjs';
import 'vaul-vue';
import './ColorMode-CRH3sfgh.mjs';
import 'reka-ui/namespaced';
import 'vue-router';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_TheHeader = __nuxt_component_0;
  const _component_USeparator = _sfc_main$1;
  const _component_UContainer = _sfc_main$8;
  const _component_TheFooter = __nuxt_component_3;
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "bg-green-50/50 dark:bg-neutral-900/50" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_TheHeader, null, null, _parent));
  _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
  _push(ssrRenderComponent(_component_UContainer, { class: "relative py-4" }, {
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
  _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
  _push(ssrRenderComponent(_component_TheFooter, null, null, _parent));
  _push(`</section>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-9nz01f-Z.mjs.map
