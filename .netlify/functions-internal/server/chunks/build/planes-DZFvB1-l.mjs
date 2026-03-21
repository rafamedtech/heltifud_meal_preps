import { _ as __nuxt_component_3 } from './Section-DrncyQpB.mjs';
import { _ as __nuxt_component_5 } from './Card-iiFrhLVA.mjs';
import { defineComponent, withCtx, unref, mergeProps, createVNode, openBlock, createBlock, Fragment, renderList, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { _ as _sfc_main$2 } from './Separator-BcjYB7qk.mjs';
import { w as weeklyPlans } from './helpers-W5IJF87J.mjs';
import { a as useSeoMeta } from './server.mjs';
import './Card-BsgwMRuG.mjs';
import 'reka-ui';
import '@vueuse/core';
import './Modal-DHNNY9I2.mjs';
import './overlay-CjyBzL1C.mjs';
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
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "PlanCard",
  __ssrInlineRender: true,
  props: {
    id: {},
    title: {},
    price: {},
    description: {},
    image: {},
    button: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseCard = __nuxt_component_5;
      _push(ssrRenderComponent(_component_BaseCard, mergeProps({
        title: __props.title,
        description: __props.description,
        image: __props.image,
        button: __props.button,
        "card-style": "complex",
        "image-width": "340",
        "image-height": "480"
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/PlanCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "PlanCard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "planes",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Planes semanales | Heltifud Meal Preps",
      description: "Explora los planes semanales de Heltifud y elige la opción que mejor se adapte a tus objetivos y estilo de vida.",
      ogTitle: "Planes semanales | Heltifud Meal Preps",
      ogDescription: "Consulta los planes semanales disponibles y recibe tus comidas saludables en casa.",
      twitterTitle: "Planes semanales | Heltifud Meal Preps",
      twitterDescription: "Elige un plan semanal y recibe tus comidas saludables a domicilio."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseSection = __nuxt_component_3;
      const _component_PlanCard = __nuxt_component_1;
      const _component_USeparator = _sfc_main$2;
      _push(`<section${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_BaseSection, { title: "Planes semanales" }, {
        description: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Elige el plan que mejor se adapte a tus necesidades y disfruta de la comodidad de recibir tus comidas en casa. `);
          } else {
            return [
              createTextVNode(" Elige el plan que mejor se adapte a tus necesidades y disfruta de la comodidad de recibir tus comidas en casa. ")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="grid gap-8 py-8 md:grid-cols-4 md:gap-4"${_scopeId}><!--[-->`);
            ssrRenderList("weeklyPlans" in _ctx ? _ctx.weeklyPlans : unref(weeklyPlans), (plan) => {
              _push2(ssrRenderComponent(_component_PlanCard, mergeProps({
                key: plan.id
              }, { ref_for: true }, plan), null, _parent2, _scopeId));
            });
            _push2(`<!--]--></section>`);
          } else {
            return [
              createVNode("section", { class: "grid gap-8 py-8 md:grid-cols-4 md:gap-4" }, [
                (openBlock(true), createBlock(Fragment, null, renderList("weeklyPlans" in _ctx ? _ctx.weeklyPlans : unref(weeklyPlans), (plan) => {
                  return openBlock(), createBlock(_component_PlanCard, mergeProps({
                    key: plan.id
                  }, { ref_for: true }, plan), null, 16);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/planes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
