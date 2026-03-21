import { _ as _sfc_main$1 } from './Card-BsgwMRuG.mjs';
import { O as __nuxt_component_1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './helpers-W5IJF87J.mjs';
import { defineComponent, mergeProps, createSlots, withCtx, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, renderSlot, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Card",
  __ssrInlineRender: true,
  props: {
    cardStyle: { default: "basic" },
    variant: { default: "subtle" },
    titleStyle: { default: "left" },
    title: {},
    description: { default: "" },
    button: { default: () => ({
      label: "",
      icon: "",
      click: () => {
      }
    }) },
    image: {},
    imageWidth: { default: () => void 0 },
    imageHeight: { default: () => void 0 },
    imageAlt: { default: "" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$1;
      const _component_NuxtImg = __nuxt_component_1;
      const _component_BaseButton = __nuxt_component_0;
      _push(ssrRenderComponent(_component_UCard, mergeProps({
        variant: __props.variant,
        class: "shadow"
      }, _attrs), createSlots({
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<figure class="mx-auto mb-4 overflow-hidden"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: __props.image,
              alt: __props.imageAlt,
              width: __props.imageWidth,
              height: __props.imageHeight,
              class: "block h-auto w-full",
              placeholder: ""
            }, null, _parent2, _scopeId));
            _push2(`</figure>`);
            if (__props.cardStyle === "basic") {
              _push2(`<h3 class="${ssrRenderClass([{ "text-center": __props.titleStyle === "center" }, "text-primary-500 text-xl"])}"${_scopeId}>${ssrInterpolate(__props.title)}</h3>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.description) {
              _push2(`<p class="text-lg md:text-base dark:text-gray-50"${_scopeId}>${ssrInterpolate(__props.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              createVNode("figure", { class: "mx-auto mb-4 overflow-hidden" }, [
                createVNode(_component_NuxtImg, {
                  src: __props.image,
                  alt: __props.imageAlt,
                  width: __props.imageWidth,
                  height: __props.imageHeight,
                  class: "block h-auto w-full",
                  placeholder: ""
                }, null, 8, ["src", "alt", "width", "height"])
              ]),
              __props.cardStyle === "basic" ? (openBlock(), createBlock("h3", {
                key: 0,
                class: ["text-primary-500 text-xl", { "text-center": __props.titleStyle === "center" }]
              }, toDisplayString(__props.title), 3)) : createCommentVNode("", true),
              __props.description ? (openBlock(), createBlock("p", {
                key: 1,
                class: "text-lg md:text-base dark:text-gray-50"
              }, toDisplayString(__props.description), 1)) : createCommentVNode("", true),
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 2
      }, [
        __props.cardStyle === "complex" ? {
          name: "header",
          fn: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-xl font-bold"${_scopeId}>${ssrInterpolate(__props.title)}</h3>`);
            } else {
              return [
                createVNode("h3", { class: "text-xl font-bold" }, toDisplayString(__props.title), 1)
              ];
            }
          }),
          key: "0"
        } : void 0,
        __props.button.label !== "" ? {
          name: "footer",
          fn: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<section class="flex items-center justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_BaseButton, {
                label: __props.button?.label,
                icon: __props.button?.icon,
                onClick: __props.button?.click
              }, null, _parent2, _scopeId));
              _push2(`</section>`);
            } else {
              return [
                createVNode("section", { class: "flex items-center justify-center" }, [
                  createVNode(_component_BaseButton, {
                    label: __props.button?.label,
                    icon: __props.button?.icon,
                    onClick: __props.button?.click
                  }, null, 8, ["label", "icon", "onClick"])
                ])
              ];
            }
          }),
          key: "1"
        } : void 0
      ]), _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/base/Card.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main, { __name: "BaseCard" });

export { __nuxt_component_5 as _ };
