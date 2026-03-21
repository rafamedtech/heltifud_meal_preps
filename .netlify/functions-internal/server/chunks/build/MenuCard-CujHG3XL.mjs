import { _ as _sfc_main$2 } from './Card-BsgwMRuG.mjs';
import { A as __nuxt_component_0$3 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, toDisplayString, computed, unref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttrs, ssrRenderList } from 'vue/server-renderer';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MenuMeal",
  __ssrInlineRender: true,
  props: {
    meal: {},
    title: {}
  },
  setup(__props) {
    const iconByTitle = {
      Desayuno: "lucide:egg-fried",
      Comida: "lucide:drumstick",
      Cena: "lucide:soup",
      "Snack 1": "lucide:apple",
      "Snack 2": "lucide:sandwich"
    };
    const icon = computed(() => iconByTitle[__props.title] ?? "lucide:utensils");
    const totalCalories = computed(() => {
      const base = __props.meal.platilloPrincipal.calorias;
      const side1 = __props.meal.guarnicion1?.calorias ?? 0;
      const side2 = __props.meal.guarnicion2?.calorias ?? 0;
      const adicionales = __props.meal.adicionales.reduce((sum, item) => sum + item.calorias, 0);
      return (base + side1 + side2 + adicionales).toLocaleString("es-MX", {
        maximumFractionDigits: 0
      });
    });
    const guarnicion1Name = computed(() => __props.meal.guarnicion1?.nombre?.trim());
    const guarnicion2Name = computed(() => __props.meal.guarnicion2?.nombre?.trim());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$3;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "h-full px-4 py-4" }, _attrs))}><h3 class="font-bold text-lg flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Icon, { name: unref(icon) }, null, _parent));
      _push(`<span>${ssrInterpolate(__props.title)}</span></h3><section class="flex items-start justify-between gap-2 mt-2 text-sm"><article class="flex flex-col gap-2 basis-3/4"><span class="min-h-[1.25rem]">- ${ssrInterpolate(__props.meal.platilloPrincipal.nombre)}</span><span class="min-h-[1.25rem]">`);
      if (unref(guarnicion1Name)) {
        _push(`<!--[-->- ${ssrInterpolate(unref(guarnicion1Name))}<!--]-->`);
      } else {
        _push(`<!--[--> <!--]-->`);
      }
      _push(`</span><span class="min-h-[1.25rem]">`);
      if (unref(guarnicion2Name)) {
        _push(`<!--[-->- ${ssrInterpolate(unref(guarnicion2Name))}<!--]-->`);
      } else {
        _push(`<!--[--> <!--]-->`);
      }
      _push(`</span><!--[-->`);
      ssrRenderList(__props.meal.adicionales, (adicional, index) => {
        _push(`<span>- ${ssrInterpolate(adicional.nombre)}</span>`);
      });
      _push(`<!--]--></article><article class="basis-1/4 w-full flex items-start justify-end"><span class="font-semibold text-primary-500">${ssrInterpolate(unref(totalCalories))} Cal</span></article></section></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/MenuMeal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "MenuMeal" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MenuCard",
  __ssrInlineRender: true,
  props: {
    day: {}
  },
  setup(__props) {
    const labels = {
      LUNES: "Lunes",
      MARTES: "Martes",
      MIERCOLES: "Miércoles",
      JUEVES: "Jueves",
      VIERNES: "Viernes",
      SABADO: "Sábado",
      DOMINGO: "Domingo"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$2;
      const _component_MenuMeal = __nuxt_component_1;
      _push(ssrRenderComponent(_component_UCard, mergeProps({
        variant: "subtle",
        class: "m-1 h-full min-h-[360px] md:min-h-0",
        ui: { root: "h-full", body: "p-0 sm:p-0 h-full" }
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-xl font-bold text-primary-500"${_scopeId}>${ssrInterpolate(labels[__props.day.dayOfWeek])}</h3>`);
          } else {
            return [
              createVNode("h3", { class: "text-xl font-bold text-primary-500" }, toDisplayString(labels[__props.day.dayOfWeek]), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="grid grid-cols-1 gap-0 divide-y divide-default/70 md:grid-cols-3 md:divide-y-0 md:divide-x"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_MenuMeal, {
              meal: __props.day.desayuno,
              title: "Desayuno"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_MenuMeal, {
              meal: __props.day.comida,
              title: "Comida"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_MenuMeal, {
              meal: __props.day.cena,
              title: "Cena"
            }, null, _parent2, _scopeId));
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "grid grid-cols-1 gap-0 divide-y divide-default/70 md:grid-cols-3 md:divide-y-0 md:divide-x" }, [
                createVNode(_component_MenuMeal, {
                  meal: __props.day.desayuno,
                  title: "Desayuno"
                }, null, 8, ["meal"]),
                createVNode(_component_MenuMeal, {
                  meal: __props.day.comida,
                  title: "Comida"
                }, null, 8, ["meal"]),
                createVNode(_component_MenuMeal, {
                  meal: __props.day.cena,
                  title: "Cena"
                }, null, 8, ["meal"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/MenuCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main, { __name: "MenuCard" });

export { __nuxt_component_6 as _ };
