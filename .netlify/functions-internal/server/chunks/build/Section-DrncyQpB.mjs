import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Section",
  __ssrInlineRender: true,
  props: {
    title: {},
    titleSize: { default: "base" },
    layout: { default: "rows" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "py-8" }, _attrs))}><section class="${ssrRenderClass([{
        "flex-col": __props.layout === "rows",
        "flex-col-reverse gap-4 md:flex-row-reverse md:items-center md:justify-between": __props.layout === "columns"
      }, "flex"])}"><article class="${ssrRenderClass({ "md:w-1/2": __props.layout === "columns" })}"><h2 class="${ssrRenderClass([{
        "text-3xl": __props.titleSize === "base",
        "text-4xl": __props.titleSize === "lg"
      }, "text-primary-500 font-bold"])}">${ssrInterpolate(__props.title)}</h2><section class="${ssrRenderClass([{ "lg:w-1/2": __props.layout === "rows" }, "py-4 text-lg flex items-center gap-2"])}">`);
      ssrRenderSlot(_ctx.$slots, "description", {}, null, _push, _parent);
      _push(`</section>`);
      if (__props.layout === "columns") {
        _push(`<section class="flex justify-center md:justify-start">`);
        ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</article><article class="${ssrRenderClass({ "md:w-1/2": __props.layout === "columns" })}">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</article></section><article class="flex flex-col items-center justify-center gap-4">`);
      ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
      _push(`</article></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/base/Section.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main, { __name: "BaseSection" });

export { __nuxt_component_3 as _ };
//# sourceMappingURL=Section-DrncyQpB.mjs.map
