import { b as useToast, _ as _sfc_main$a, e as _sfc_main$g, u as useRoute, n as navigateTo, f as useAppConfig, g as useComponentUI, h as useFormField, i as useComponentIcons, t as tv, j as _sfc_main$d$1, l as looseToNumber } from './server.mjs';
import { _ as _sfc_main$6 } from './Form-BatySvBg.mjs';
import { _ as _sfc_main$7 } from './Card-BsgwMRuG.mjs';
import { _ as _sfc_main$8 } from './FormField-Dr2ldvax.mjs';
import { defineComponent, computed, reactive, ref, withAsyncContext, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, useModel, isRef, useAttrs, watchEffect, withModifiers, Transition, mergeModels, useSlots, useTemplateRef, nextTick, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderClass } from 'vue/server-renderer';
import { _ as _sfc_main$9 } from './Input-DL0XnWnl.mjs';
import { _ as _sfc_main$b } from './Popover-CMIe6n2p.mjs';
import { _ as _sfc_main$c } from './Calendar-DiIhPoAA.mjs';
import { DateFormatter, getLocalTimeZone, CalendarDate, parseDate } from '@internationalized/date';
import { _ as _sfc_main$1$1, a as __nuxt_component_2$1, g as getFoodTypeAppearance } from './FoodCatalogTable-DqonpOrN.mjs';
import { _ as _sfc_main$d } from './Modal-DHNNY9I2.mjs';
import { _ as _sfc_main$e } from './Select-CO4MAQzv.mjs';
import { _ as _sfc_main$f } from './Alert-DmPqFZyZ.mjs';
import { _ as _sfc_main$h } from './Badge-BtXv9wz2.mjs';
import { Primitive } from 'reka-ui';
import { useVModel } from '@vueuse/core';
import { D as DAY_OF_WEEK_VALUES, w as weeklyMenuInputSchema } from './menuSchema-i-S62L_E.mjs';
import { u as useMenu } from './useMenu-jaOsa-c9.mjs';
import { a as useFetch } from './fetch-Corms2LC.mjs';

const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "MetaField",
  __ssrInlineRender: true,
  props: {
    label: {},
    invalid: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const containerClass = computed(() => [
      "app-control-surface px-4 py-3",
      props.invalid ? "ring-1 ring-error/40 border-error/50" : ""
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: unref(containerClass) }, _attrs))}><span class="block text-[10px] uppercase tracking-[0.16em] text-muted">${ssrInterpolate(__props.label)}</span><div class="mt-1.5 flex min-h-5 items-center">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/MetaField.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$5, { __name: "AdminMetaField" });
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "DatePicker",
  __ssrInlineRender: true,
  props: {
    "modelValue": {
      required: true
    },
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const df = new DateFormatter("es-MX", {
      dateStyle: "medium",
      timeZone: "UTC"
    });
    const model = useModel(__props, "modelValue");
    function toCalendarDate(value) {
      if (value instanceof Date) {
        const year = value.getFullYear();
        const month = value.getMonth() + 1;
        const day = value.getDate();
        return new CalendarDate(year, month, day);
      }
      if (typeof value === "string" && value) {
        return parseDate(value.slice(0, 10));
      }
      const now = /* @__PURE__ */ new Date();
      return new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
    const calendarValue = computed({
      get() {
        return toCalendarDate(model.value);
      },
      set(value) {
        model.value = value.toDate(getLocalTimeZone());
      }
    });
    const displayDate = computed(() => df.format(calendarValue.value.toDate("UTC")));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UPopover = _sfc_main$b;
      const _component_UButton = _sfc_main$a;
      const _component_UCalendar = _sfc_main$c;
      _push(ssrRenderComponent(_component_UPopover, _attrs, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCalendar, {
              modelValue: unref(calendarValue),
              "onUpdate:modelValue": ($event) => isRef(calendarValue) ? calendarValue.value = $event : null,
              class: "p-2"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UCalendar, {
                modelValue: unref(calendarValue),
                "onUpdate:modelValue": ($event) => isRef(calendarValue) ? calendarValue.value = $event : null,
                class: "p-2"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "ghost",
              icon: "i-lucide-calendar",
              "trailing-icon": "i-lucide-chevron-down",
              class: "w-full justify-between text-left text-sm font-medium text-highlighted hover:bg-transparent",
              ui: {
                base: "w-full h-5 min-h-5 max-h-5 justify-between border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                leadingIcon: "size-4 text-muted",
                trailingIcon: "size-4 text-muted"
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(displayDate))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(displayDate)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                color: "neutral",
                variant: "ghost",
                icon: "i-lucide-calendar",
                "trailing-icon": "i-lucide-chevron-down",
                class: "w-full justify-between text-left text-sm font-medium text-highlighted hover:bg-transparent",
                ui: {
                  base: "w-full h-5 min-h-5 max-h-5 justify-between border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                  leadingIcon: "size-4 text-muted",
                  trailingIcon: "size-4 text-muted"
                }
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(displayDate)), 1)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/DatePicker.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$4, { __name: "DatePicker" });
const theme = {
  "slots": {
    "root": "relative inline-flex items-center",
    "base": [
      "w-full rounded-md border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
      "transition-colors"
    ],
    "leading": "absolute start-0 flex items-start",
    "leadingIcon": "shrink-0 text-dimmed",
    "leadingAvatar": "shrink-0",
    "leadingAvatarSize": "",
    "trailing": "absolute end-0 flex items-start",
    "trailingIcon": "shrink-0 text-dimmed"
  },
  "variants": {
    "fieldGroup": {
      "horizontal": {
        "root": "group has-focus-visible:z-[1]",
        "base": "group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none group-not-last:group-not-first:rounded-none"
      },
      "vertical": {
        "root": "group has-focus-visible:z-[1]",
        "base": "group-not-only:group-first:rounded-b-none group-not-only:group-last:rounded-t-none group-not-last:group-not-first:rounded-none"
      }
    },
    "size": {
      "xs": {
        "base": "px-2 py-1 text-sm/4 gap-1",
        "leading": "ps-2 inset-y-1",
        "trailing": "pe-2 inset-y-1",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-4"
      },
      "sm": {
        "base": "px-2.5 py-1.5 text-sm/4 gap-1.5",
        "leading": "ps-2.5 inset-y-1.5",
        "trailing": "pe-2.5 inset-y-1.5",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-4"
      },
      "md": {
        "base": "px-2.5 py-1.5 text-base/5 gap-1.5",
        "leading": "ps-2.5 inset-y-1.5",
        "trailing": "pe-2.5 inset-y-1.5",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-5"
      },
      "lg": {
        "base": "px-3 py-2 text-base/5 gap-2",
        "leading": "ps-3 inset-y-2",
        "trailing": "pe-3 inset-y-2",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-5"
      },
      "xl": {
        "base": "px-3 py-2 text-base gap-2",
        "leading": "ps-3 inset-y-2",
        "trailing": "pe-3 inset-y-2",
        "leadingIcon": "size-6",
        "leadingAvatarSize": "xs",
        "trailingIcon": "size-6"
      }
    },
    "variant": {
      "outline": "text-highlighted bg-default ring ring-inset ring-accented",
      "soft": "text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50",
      "subtle": "text-highlighted bg-elevated ring ring-inset ring-accented",
      "ghost": "text-highlighted bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent dark:disabled:bg-transparent",
      "none": "text-highlighted bg-transparent"
    },
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "leading": {
      "true": ""
    },
    "trailing": {
      "true": ""
    },
    "loading": {
      "true": ""
    },
    "highlight": {
      "true": ""
    },
    "fixed": {
      "false": ""
    },
    "type": {
      "file": "file:me-1.5 file:font-medium file:text-muted file:outline-none"
    },
    "autoresize": {
      "true": {
        "base": "resize-none"
      }
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
    },
    {
      "color": "secondary",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
    },
    {
      "color": "success",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success"
    },
    {
      "color": "info",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info"
    },
    {
      "color": "warning",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning"
    },
    {
      "color": "error",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error"
    },
    {
      "color": "primary",
      "highlight": true,
      "class": "ring ring-inset ring-primary"
    },
    {
      "color": "secondary",
      "highlight": true,
      "class": "ring ring-inset ring-secondary"
    },
    {
      "color": "success",
      "highlight": true,
      "class": "ring ring-inset ring-success"
    },
    {
      "color": "info",
      "highlight": true,
      "class": "ring ring-inset ring-info"
    },
    {
      "color": "warning",
      "highlight": true,
      "class": "ring ring-inset ring-warning"
    },
    {
      "color": "error",
      "highlight": true,
      "class": "ring ring-inset ring-error"
    },
    {
      "color": "neutral",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted"
    },
    {
      "color": "neutral",
      "highlight": true,
      "class": "ring ring-inset ring-inverted"
    },
    {
      "leading": true,
      "size": "xs",
      "class": "ps-7"
    },
    {
      "leading": true,
      "size": "sm",
      "class": "ps-8"
    },
    {
      "leading": true,
      "size": "md",
      "class": "ps-9"
    },
    {
      "leading": true,
      "size": "lg",
      "class": "ps-10"
    },
    {
      "leading": true,
      "size": "xl",
      "class": "ps-11"
    },
    {
      "trailing": true,
      "size": "xs",
      "class": "pe-7"
    },
    {
      "trailing": true,
      "size": "sm",
      "class": "pe-8"
    },
    {
      "trailing": true,
      "size": "md",
      "class": "pe-9"
    },
    {
      "trailing": true,
      "size": "lg",
      "class": "pe-10"
    },
    {
      "trailing": true,
      "size": "xl",
      "class": "pe-11"
    },
    {
      "loading": true,
      "leading": true,
      "class": {
        "leadingIcon": "animate-spin"
      }
    },
    {
      "loading": true,
      "leading": false,
      "trailing": true,
      "class": {
        "trailingIcon": "animate-spin"
      }
    },
    {
      "fixed": false,
      "size": "xs",
      "class": "md:text-xs"
    },
    {
      "fixed": false,
      "size": "sm",
      "class": "md:text-xs"
    },
    {
      "fixed": false,
      "size": "md",
      "class": "md:text-sm"
    },
    {
      "fixed": false,
      "size": "lg",
      "class": "md:text-sm"
    }
  ],
  "defaultVariants": {
    "size": "md",
    "color": "primary",
    "variant": "outline"
  }
};
const _sfc_main$3 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UTextarea",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    id: { type: String, required: false },
    name: { type: String, required: false },
    placeholder: { type: String, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    required: { type: Boolean, required: false },
    autofocus: { type: Boolean, required: false },
    autofocusDelay: { type: Number, required: false, default: 0 },
    autoresize: { type: Boolean, required: false },
    autoresizeDelay: { type: Number, required: false, default: 0 },
    disabled: { type: Boolean, required: false },
    rows: { type: Number, required: false, default: 3 },
    maxrows: { type: Number, required: false, default: 0 },
    highlight: { type: Boolean, required: false },
    fixed: { type: Boolean, required: false },
    defaultValue: { type: null, required: false },
    modelValue: { type: null, required: false },
    modelModifiers: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    icon: { type: null, required: false },
    avatar: { type: Object, required: false },
    leading: { type: Boolean, required: false },
    leadingIcon: { type: null, required: false },
    trailing: { type: Boolean, required: false },
    trailingIcon: { type: null, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: null, required: false }
  },
  emits: ["update:modelValue", "blur", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const modelValue = useVModel(props, "modelValue", emits, { defaultValue: props.defaultValue });
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("textarea", props);
    const { emitFormFocus, emitFormBlur, emitFormInput, emitFormChange, size, color, id, name, highlight, disabled, ariaAttrs } = useFormField(props, { deferInputValidation: true });
    const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.textarea || {} })({
      color: color.value,
      variant: props.variant,
      size: size?.value,
      loading: props.loading,
      highlight: highlight.value,
      fixed: props.fixed,
      autoresize: props.autoresize,
      leading: isLeading.value || !!props.avatar || !!slots.leading,
      trailing: isTrailing.value || !!slots.trailing
    }));
    const textareaRef = useTemplateRef("textareaRef");
    function updateInput(value) {
      if (props.modelModifiers?.trim && (typeof value === "string" || value === null || value === void 0)) {
        value = value?.trim() ?? null;
      }
      if (props.modelModifiers?.number) {
        value = looseToNumber(value);
      }
      if (props.modelModifiers?.nullable) {
        value ||= null;
      }
      if (props.modelModifiers?.optional && !props.modelModifiers?.nullable && value !== null) {
        value ||= void 0;
      }
      modelValue.value = value;
      emitFormInput();
    }
    function onInput(event) {
      autoResize();
      if (!props.modelModifiers?.lazy) {
        updateInput(event.target.value);
      }
    }
    function onChange(event) {
      const value = event.target.value;
      if (props.modelModifiers?.lazy) {
        updateInput(value);
      }
      if (props.modelModifiers?.trim) {
        event.target.value = value.trim();
      }
      emitFormChange();
      emits("change", event);
    }
    function onBlur(event) {
      emitFormBlur();
      emits("blur", event);
    }
    function autoResize() {
      if (props.autoresize && textareaRef.value) {
        textareaRef.value.rows = props.rows;
        const overflow = textareaRef.value.style.overflow;
        textareaRef.value.style.overflow = "hidden";
        const styles = (void 0).getComputedStyle(textareaRef.value);
        const paddingTop = Number.parseInt(styles.paddingTop);
        const paddingBottom = Number.parseInt(styles.paddingBottom);
        const padding = paddingTop + paddingBottom;
        const lineHeight = Number.parseInt(styles.lineHeight);
        const { scrollHeight } = textareaRef.value;
        const newRows = (scrollHeight - padding) / lineHeight;
        if (newRows > props.rows) {
          textareaRef.value.rows = props.maxrows ? Math.min(newRows, props.maxrows) : newRows;
        }
        textareaRef.value.style.overflow = overflow;
      }
    }
    watch(modelValue, () => {
      nextTick(autoResize);
    });
    __expose({
      textareaRef
    });
    return (_ctx, _push, _parent, _attrs) => {
      let _temp0;
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-slot": "root",
        class: ui.value.root({ class: [unref(uiProp)?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<textarea${ssrRenderAttrs(_temp0 = mergeProps({
              id: unref(id),
              ref_key: "textareaRef",
              ref: textareaRef,
              value: unref(modelValue),
              name: unref(name),
              rows: __props.rows,
              placeholder: __props.placeholder,
              "data-slot": "base",
              class: ui.value.base({ class: unref(uiProp)?.base }),
              disabled: unref(disabled),
              required: __props.required
            }, { ..._ctx.$attrs, ...unref(ariaAttrs) }), "textarea")}${_scopeId}>${ssrInterpolate("value" in _temp0 ? _temp0.value : "")}</textarea>`);
            ssrRenderSlot(_ctx.$slots, "default", { ui: ui.value }, null, _push2, _parent2, _scopeId);
            if (unref(isLeading) || !!__props.avatar || !!slots.leading) {
              _push2(`<span data-slot="leading" class="${ssrRenderClass(ui.value.leading({ class: unref(uiProp)?.leading }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => {
                if (unref(isLeading) && unref(leadingIconName)) {
                  _push2(ssrRenderComponent(_sfc_main$g, {
                    name: unref(leadingIconName),
                    "data-slot": "leadingIcon",
                    class: ui.value.leadingIcon({ class: unref(uiProp)?.leadingIcon })
                  }, null, _parent2, _scopeId));
                } else if (!!__props.avatar) {
                  _push2(ssrRenderComponent(_sfc_main$d$1, mergeProps({
                    size: unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                  }, __props.avatar, {
                    "data-slot": "leadingAvatar",
                    class: ui.value.leadingAvatar({ class: unref(uiProp)?.leadingAvatar })
                  }), null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(isTrailing) || !!slots.trailing) {
              _push2(`<span data-slot="trailing" class="${ssrRenderClass(ui.value.trailing({ class: unref(uiProp)?.trailing }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => {
                if (unref(trailingIconName)) {
                  _push2(ssrRenderComponent(_sfc_main$g, {
                    name: unref(trailingIconName),
                    "data-slot": "trailingIcon",
                    class: ui.value.trailingIcon({ class: unref(uiProp)?.trailingIcon })
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("textarea", mergeProps({
                id: unref(id),
                ref_key: "textareaRef",
                ref: textareaRef,
                value: unref(modelValue),
                name: unref(name),
                rows: __props.rows,
                placeholder: __props.placeholder,
                "data-slot": "base",
                class: ui.value.base({ class: unref(uiProp)?.base }),
                disabled: unref(disabled),
                required: __props.required
              }, { ..._ctx.$attrs, ...unref(ariaAttrs) }, {
                onInput,
                onBlur,
                onChange,
                onFocus: unref(emitFormFocus)
              }), null, 16, ["id", "value", "name", "rows", "placeholder", "disabled", "required", "onFocus"]),
              renderSlot(_ctx.$slots, "default", { ui: ui.value }),
              unref(isLeading) || !!__props.avatar || !!slots.leading ? (openBlock(), createBlock("span", {
                key: 0,
                "data-slot": "leading",
                class: ui.value.leading({ class: unref(uiProp)?.leading })
              }, [
                renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                  unref(isLeading) && unref(leadingIconName) ? (openBlock(), createBlock(_sfc_main$g, {
                    key: 0,
                    name: unref(leadingIconName),
                    "data-slot": "leadingIcon",
                    class: ui.value.leadingIcon({ class: unref(uiProp)?.leadingIcon })
                  }, null, 8, ["name", "class"])) : !!__props.avatar ? (openBlock(), createBlock(_sfc_main$d$1, mergeProps({
                    key: 1,
                    size: unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                  }, __props.avatar, {
                    "data-slot": "leadingAvatar",
                    class: ui.value.leadingAvatar({ class: unref(uiProp)?.leadingAvatar })
                  }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                ])
              ], 2)) : createCommentVNode("", true),
              unref(isTrailing) || !!slots.trailing ? (openBlock(), createBlock("span", {
                key: 1,
                "data-slot": "trailing",
                class: ui.value.trailing({ class: unref(uiProp)?.trailing })
              }, [
                renderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => [
                  unref(trailingIconName) ? (openBlock(), createBlock(_sfc_main$g, {
                    key: 0,
                    name: unref(trailingIconName),
                    "data-slot": "trailingIcon",
                    class: ui.value.trailingIcon({ class: unref(uiProp)?.trailingIcon })
                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                ])
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.5.1_@tiptap+extensions@3.20.4_@tiptap+core@3.20.4_@tiptap+pm@3.20.4__@tiptap_e4a31b51003d92b668867b8854240143/node_modules/@nuxt/ui/dist/runtime/components/Textarea.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "FoodItemFields",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    title: {},
    optional: { type: Boolean },
    catalogItems: {}
  }, {
    "modelValue": { required: true },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const props = __props;
    const model = useModel(__props, "modelValue");
    const route = useRoute();
    const optional = computed(() => props.optional ?? false);
    const catalogItems = computed(() => props.catalogItems ?? []);
    const typeOptions = [
      { label: "Desayuno", value: "desayuno" },
      { label: "Comida", value: "comida" },
      { label: "Cena", value: "cena" },
      { label: "Snack", value: "snack" },
      { label: "Guarnición", value: "guarnicion" },
      { label: "Ramekin", value: "ramekin" },
      { label: "Proteína", value: "proteina" },
      { label: "Verdura", value: "verdura" },
      { label: "Fruta", value: "fruta" },
      { label: "Salsa", value: "salsa" },
      { label: "Adicional", value: "adicional" }
    ];
    const selectedCatalogId = ref();
    const catalogOptions = computed(
      () => catalogItems.value.map((item) => ({
        label: item.nombre,
        calorias: item.calorias,
        tipo: item.tipo,
        value: item.id
      }))
    );
    const returnTo = computed(() => route.fullPath);
    const createComponentLink = computed(() => ({
      path: "/admin/platillos/crear-nuevo",
      query: { returnTo: returnTo.value }
    }));
    const editComponentLink = computed(() => ({
      path: `/admin/platillos/${selectedCatalogId.value}`,
      query: {
        returnTo: returnTo.value
      }
    }));
    function applyCatalogItem(itemId) {
      selectedCatalogId.value = itemId;
      if (!itemId) {
        model.value.catalogItemId = null;
        return;
      }
      const selected = catalogItems.value.find((item) => item.id === itemId);
      if (!selected) {
        return;
      }
      model.value.catalogItemId = selected.id;
      model.value.nombre = selected.nombre;
      model.value.descripcion = selected.descripcion;
      model.value.calorias = selected.calorias;
      model.value.imagen = selected.imagen;
      model.value.tipo = selected.tipo;
    }
    watchEffect(() => {
      selectedCatalogId.value = model.value.catalogItemId ?? void 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$7;
      const _component_UFormField = _sfc_main$8;
      const _component_USelect = _sfc_main$e;
      const _component_UBadge = _sfc_main$h;
      const _component_UIcon = _sfc_main$g;
      const _component_UButton = _sfc_main$a;
      const _component_UInput = _sfc_main$9;
      const _component_UTextarea = _sfc_main$3;
      _push(ssrRenderComponent(_component_UCard, mergeProps({
        variant: "subtle",
        class: "app-surface",
        ui: { body: "space-y-3" }
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h4 class="font-semibold text-sm"${_scopeId}>${ssrInterpolate(__props.title)} `);
            if (unref(optional)) {
              _push2(`<span class="text-xs opacity-70"${_scopeId}>(opcional)</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</h4>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Seleccionar platillo" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<section class="flex flex-col gap-2 xl:flex-row"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(selectedCatalogId),
                    "onUpdate:modelValue": [($event) => isRef(selectedCatalogId) ? selectedCatalogId.value = $event : null, applyCatalogItem],
                    items: unref(catalogOptions),
                    "value-key": "value",
                    class: "flex-1",
                    placeholder: "Selecciona un platillo guardado"
                  }, {
                    "item-label": withCtx(({ item }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="flex items-center justify-between gap-3"${_scopeId3}><span${_scopeId3}>${ssrInterpolate(item.label)}</span><span class="flex items-center gap-2"${_scopeId3}><span class="text-primary"${_scopeId3}>${ssrInterpolate(item.calorias)} cal</span>`);
                        _push4(ssrRenderComponent(_component_UBadge, {
                          color: unref(getFoodTypeAppearance)(item.tipo).color,
                          variant: "soft",
                          size: "sm",
                          class: ["ring-1 ring-inset", unref(getFoodTypeAppearance)(item.tipo).className]
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_UIcon, {
                                name: unref(getFoodTypeAppearance)(item.tipo).icon,
                                class: "size-3 shrink-0"
                              }, null, _parent5, _scopeId4));
                              _push5(` ${ssrInterpolate(unref(getFoodTypeAppearance)(item.tipo).label)}`);
                            } else {
                              return [
                                createVNode(_component_UIcon, {
                                  name: unref(getFoodTypeAppearance)(item.tipo).icon,
                                  class: "size-3 shrink-0"
                                }, null, 8, ["name"]),
                                createTextVNode(" " + toDisplayString(unref(getFoodTypeAppearance)(item.tipo).label), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                        _push4(`</span></span>`);
                      } else {
                        return [
                          createVNode("span", { class: "flex items-center justify-between gap-3" }, [
                            createVNode("span", null, toDisplayString(item.label), 1),
                            createVNode("span", { class: "flex items-center gap-2" }, [
                              createVNode("span", { class: "text-primary" }, toDisplayString(item.calorias) + " cal", 1),
                              createVNode(_component_UBadge, {
                                color: unref(getFoodTypeAppearance)(item.tipo).color,
                                variant: "soft",
                                size: "sm",
                                class: ["ring-1 ring-inset", unref(getFoodTypeAppearance)(item.tipo).className]
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UIcon, {
                                    name: unref(getFoodTypeAppearance)(item.tipo).icon,
                                    class: "size-3 shrink-0"
                                  }, null, 8, ["name"]),
                                  createTextVNode(" " + toDisplayString(unref(getFoodTypeAppearance)(item.tipo).label), 1)
                                ]),
                                _: 2
                              }, 1032, ["color", "class"])
                            ])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<section class="flex gap-2"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    to: unref(createComponentLink),
                    variant: "outline",
                    size: "sm",
                    icon: "i-lucide-plus"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Nuevo`);
                      } else {
                        return [
                          createTextVNode("Nuevo")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    to: unref(selectedCatalogId) ? unref(editComponentLink) : unref(createComponentLink),
                    variant: "ghost",
                    size: "sm",
                    icon: "i-lucide-pencil",
                    disabled: !unref(selectedCatalogId)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Editar `);
                      } else {
                        return [
                          createTextVNode(" Editar ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</section></section>`);
                } else {
                  return [
                    createVNode("section", { class: "flex flex-col gap-2 xl:flex-row" }, [
                      createVNode(_component_USelect, {
                        modelValue: unref(selectedCatalogId),
                        "onUpdate:modelValue": [($event) => isRef(selectedCatalogId) ? selectedCatalogId.value = $event : null, applyCatalogItem],
                        items: unref(catalogOptions),
                        "value-key": "value",
                        class: "flex-1",
                        placeholder: "Selecciona un platillo guardado"
                      }, {
                        "item-label": withCtx(({ item }) => [
                          createVNode("span", { class: "flex items-center justify-between gap-3" }, [
                            createVNode("span", null, toDisplayString(item.label), 1),
                            createVNode("span", { class: "flex items-center gap-2" }, [
                              createVNode("span", { class: "text-primary" }, toDisplayString(item.calorias) + " cal", 1),
                              createVNode(_component_UBadge, {
                                color: unref(getFoodTypeAppearance)(item.tipo).color,
                                variant: "soft",
                                size: "sm",
                                class: ["ring-1 ring-inset", unref(getFoodTypeAppearance)(item.tipo).className]
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_UIcon, {
                                    name: unref(getFoodTypeAppearance)(item.tipo).icon,
                                    class: "size-3 shrink-0"
                                  }, null, 8, ["name"]),
                                  createTextVNode(" " + toDisplayString(unref(getFoodTypeAppearance)(item.tipo).label), 1)
                                ]),
                                _: 2
                              }, 1032, ["color", "class"])
                            ])
                          ])
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                      createVNode("section", { class: "flex gap-2" }, [
                        createVNode(_component_UButton, {
                          to: unref(createComponentLink),
                          variant: "outline",
                          size: "sm",
                          icon: "i-lucide-plus"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Nuevo")
                          ]),
                          _: 1
                        }, 8, ["to"]),
                        createVNode(_component_UButton, {
                          to: unref(selectedCatalogId) ? unref(editComponentLink) : unref(createComponentLink),
                          variant: "ghost",
                          size: "sm",
                          icon: "i-lucide-pencil",
                          disabled: !unref(selectedCatalogId)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Editar ")
                          ]),
                          _: 1
                        }, 8, ["to", "disabled"])
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, { label: "Nombre" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: model.value.nombre,
                    "onUpdate:modelValue": ($event) => model.value.nombre = $event,
                    placeholder: "Nombre"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: model.value.nombre,
                      "onUpdate:modelValue": ($event) => model.value.nombre = $event,
                      placeholder: "Nombre"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, { label: "Descripción" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UTextarea, {
                    modelValue: model.value.descripcion,
                    "onUpdate:modelValue": ($event) => model.value.descripcion = $event,
                    rows: 2,
                    placeholder: "Descripción"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UTextarea, {
                      modelValue: model.value.descripcion,
                      "onUpdate:modelValue": ($event) => model.value.descripcion = $event,
                      rows: 2,
                      placeholder: "Descripción"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<section class="grid grid-cols-1 md:grid-cols-2 gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Calorías" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: model.value.calorias,
                    "onUpdate:modelValue": ($event) => model.value.calorias = $event,
                    modelModifiers: { number: true },
                    type: "number",
                    min: "0"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: model.value.calorias,
                      "onUpdate:modelValue": ($event) => model.value.calorias = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      min: "0"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, { label: "Tipo" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: model.value.tipo,
                    "onUpdate:modelValue": ($event) => model.value.tipo = $event,
                    items: typeOptions,
                    "value-key": "value",
                    placeholder: "Selecciona un tipo"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USelect, {
                      modelValue: model.value.tipo,
                      "onUpdate:modelValue": ($event) => model.value.tipo = $event,
                      items: typeOptions,
                      "value-key": "value",
                      placeholder: "Selecciona un tipo"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</section>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Imagen (URL)" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: model.value.imagen,
                    "onUpdate:modelValue": ($event) => model.value.imagen = $event,
                    placeholder: "https://..."
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: model.value.imagen,
                      "onUpdate:modelValue": ($event) => model.value.imagen = $event,
                      placeholder: "https://..."
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("h4", { class: "font-semibold text-sm" }, [
                createTextVNode(toDisplayString(__props.title) + " ", 1),
                unref(optional) ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-xs opacity-70"
                }, "(opcional)")) : createCommentVNode("", true)
              ]),
              createVNode(_component_UFormField, { label: "Seleccionar platillo" }, {
                default: withCtx(() => [
                  createVNode("section", { class: "flex flex-col gap-2 xl:flex-row" }, [
                    createVNode(_component_USelect, {
                      modelValue: unref(selectedCatalogId),
                      "onUpdate:modelValue": [($event) => isRef(selectedCatalogId) ? selectedCatalogId.value = $event : null, applyCatalogItem],
                      items: unref(catalogOptions),
                      "value-key": "value",
                      class: "flex-1",
                      placeholder: "Selecciona un platillo guardado"
                    }, {
                      "item-label": withCtx(({ item }) => [
                        createVNode("span", { class: "flex items-center justify-between gap-3" }, [
                          createVNode("span", null, toDisplayString(item.label), 1),
                          createVNode("span", { class: "flex items-center gap-2" }, [
                            createVNode("span", { class: "text-primary" }, toDisplayString(item.calorias) + " cal", 1),
                            createVNode(_component_UBadge, {
                              color: unref(getFoodTypeAppearance)(item.tipo).color,
                              variant: "soft",
                              size: "sm",
                              class: ["ring-1 ring-inset", unref(getFoodTypeAppearance)(item.tipo).className]
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UIcon, {
                                  name: unref(getFoodTypeAppearance)(item.tipo).icon,
                                  class: "size-3 shrink-0"
                                }, null, 8, ["name"]),
                                createTextVNode(" " + toDisplayString(unref(getFoodTypeAppearance)(item.tipo).label), 1)
                              ]),
                              _: 2
                            }, 1032, ["color", "class"])
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                    createVNode("section", { class: "flex gap-2" }, [
                      createVNode(_component_UButton, {
                        to: unref(createComponentLink),
                        variant: "outline",
                        size: "sm",
                        icon: "i-lucide-plus"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Nuevo")
                        ]),
                        _: 1
                      }, 8, ["to"]),
                      createVNode(_component_UButton, {
                        to: unref(selectedCatalogId) ? unref(editComponentLink) : unref(createComponentLink),
                        variant: "ghost",
                        size: "sm",
                        icon: "i-lucide-pencil",
                        disabled: !unref(selectedCatalogId)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Editar ")
                        ]),
                        _: 1
                      }, 8, ["to", "disabled"])
                    ])
                  ])
                ]),
                _: 1
              }),
              createVNode(_component_UFormField, { label: "Nombre" }, {
                default: withCtx(() => [
                  createVNode(_component_UInput, {
                    modelValue: model.value.nombre,
                    "onUpdate:modelValue": ($event) => model.value.nombre = $event,
                    placeholder: "Nombre"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              }),
              createVNode(_component_UFormField, { label: "Descripción" }, {
                default: withCtx(() => [
                  createVNode(_component_UTextarea, {
                    modelValue: model.value.descripcion,
                    "onUpdate:modelValue": ($event) => model.value.descripcion = $event,
                    rows: 2,
                    placeholder: "Descripción"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              }),
              createVNode("section", { class: "grid grid-cols-1 md:grid-cols-2 gap-3" }, [
                createVNode(_component_UFormField, { label: "Calorías" }, {
                  default: withCtx(() => [
                    createVNode(_component_UInput, {
                      modelValue: model.value.calorias,
                      "onUpdate:modelValue": ($event) => model.value.calorias = $event,
                      modelModifiers: { number: true },
                      type: "number",
                      min: "0"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_UFormField, { label: "Tipo" }, {
                  default: withCtx(() => [
                    createVNode(_component_USelect, {
                      modelValue: model.value.tipo,
                      "onUpdate:modelValue": ($event) => model.value.tipo = $event,
                      items: typeOptions,
                      "value-key": "value",
                      placeholder: "Selecciona un tipo"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                })
              ]),
              createVNode(_component_UFormField, { label: "Imagen (URL)" }, {
                default: withCtx(() => [
                  createVNode(_component_UInput, {
                    modelValue: model.value.imagen,
                    "onUpdate:modelValue": ($event) => model.value.imagen = $event,
                    placeholder: "https://..."
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/FoodItemFields.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_9 = Object.assign(_sfc_main$2, { __name: "AdminFoodItemFields" });
const selectFieldClass = "app-control-surface relative flex min-h-[96px] items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-[var(--app-surface-soft)]";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "MenuSlotEditor",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    title: {},
    showSides: { type: Boolean, default: true },
    catalogItems: { default: () => [] },
    showToggle: { type: Boolean, default: true }
  }, {
    "modelValue": { required: true },
    "modelModifiers": {},
    "open": { type: Boolean, ...{ default: true } },
    "openModifiers": {}
  }),
  emits: ["update:modelValue", "update:open"],
  setup(__props) {
    const attrs = useAttrs();
    const route = useRoute();
    const contenedorOptions = [
      { label: "Charola", value: "Charola" },
      { label: "Bowl kraft", value: "Bowl kraft" },
      { label: "Contenedor desayuno", value: "Contenedor desayuno" },
      { label: "Contenedor comida", value: "Contenedor comida" },
      { label: "Contenedor cena", value: "Contenedor cena" },
      { label: "Contenedor colación 1", value: "Contenedor colacion 1" },
      { label: "Contenedor colación 2", value: "Contenedor colacion 2" },
      { label: "Vaso", value: "Vaso" },
      { label: "Caja", value: "Caja" }
    ];
    const PLATILLO_PRINCIPAL_TYPES = /* @__PURE__ */ new Set(["desayuno", "comida", "cena"]);
    const SNACK_TYPES = /* @__PURE__ */ new Set(["snack"]);
    const GUARNICION_TYPES = /* @__PURE__ */ new Set(["guarnicion"]);
    const ADICIONAL_TYPES = /* @__PURE__ */ new Set(["ramekin"]);
    const platilloPrincipalItems = computed(
      () => __props.catalogItems.filter((item) => PLATILLO_PRINCIPAL_TYPES.has(item.tipo))
    );
    const snackItems = computed(
      () => __props.catalogItems.filter((item) => SNACK_TYPES.has(item.tipo))
    );
    const guarnicionItems = computed(
      () => __props.catalogItems.filter((item) => GUARNICION_TYPES.has(item.tipo))
    );
    const adicionalItems = computed(
      () => __props.catalogItems.filter((item) => ADICIONAL_TYPES.has(item.tipo))
    );
    const model = useModel(__props, "modelValue");
    const isOpen = useModel(__props, "open");
    const modalView = ref(null);
    function createEmptyFoodItem() {
      return {
        catalogItemId: null,
        nombre: "",
        descripcion: "",
        calorias: 0,
        imagen: "",
        tipo: ""
      };
    }
    const guarnicion1Model = computed({
      get() {
        return model.value.guarnicion1 ?? createEmptyFoodItem();
      },
      set(value) {
        model.value.guarnicion1 = value;
      }
    });
    const guarnicion2Model = computed({
      get() {
        return model.value.guarnicion2 ?? createEmptyFoodItem();
      },
      set(value) {
        model.value.guarnicion2 = value;
      }
    });
    watchEffect(() => {
      if (__props.showSides) {
        if (!model.value.guarnicion1) {
          model.value.guarnicion1 = createEmptyFoodItem();
        }
        if (!model.value.guarnicion2) {
          model.value.guarnicion2 = createEmptyFoodItem();
        }
      } else {
        model.value.guarnicion1 = null;
        model.value.guarnicion2 = null;
      }
      if (!model.value.adicionales) {
        model.value.adicionales = [];
      }
    });
    function addAdicional() {
      model.value.adicionales.push(createEmptyFoodItem());
    }
    function removeAdicional(index) {
      model.value.adicionales.splice(index, 1);
    }
    function getAdicional(index) {
      const item = model.value.adicionales[index];
      if (!item) {
        const emptyItem = createEmptyFoodItem();
        model.value.adicionales[index] = emptyItem;
        return emptyItem;
      }
      return item;
    }
    function setAdicional(index, value) {
      model.value.adicionales[index] = value;
    }
    const isModalOpen = computed({
      get: () => modalView.value !== null,
      set: (value) => {
        if (!value) {
          modalView.value = null;
        }
      }
    });
    const detailModalTitle = computed(() => {
      switch (modalView.value) {
        case "select-platillo-principal":
          return "Seleccionar platillo principal";
        case "select-guarnicion-1":
          return "Seleccionar guarnición 1";
        case "select-guarnicion-2":
          return "Seleccionar guarnición 2";
        case "extras":
          return "Adicionales y contenedor";
        default:
          return "";
      }
    });
    function openSelectionModal(view) {
      modalView.value = view;
    }
    function openSelectionModalFromKeyboard(event, view) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSelectionModal(view);
      }
    }
    function openExtrasFromKeyboard(event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        modalView.value = "extras";
      }
    }
    const contenedorModel = computed({
      get: () => model.value.contenedor ?? void 0,
      set: (value) => {
        model.value.contenedor = value ?? "";
      }
    });
    function itemSummary(item, fallback = "Sin capturar") {
      return item?.nombre?.trim() || fallback;
    }
    function caloriesSummary(item) {
      if (!item?.nombre?.trim()) {
        return "0 cal";
      }
      return `${item.calorias ?? 0} cal`;
    }
    const extrasSummary = computed(() => {
      const parts = [];
      if (model.value.adicionales.length) {
        parts.push(`${model.value.adicionales.length} adicional(es)`);
      }
      if (model.value.contenedor?.trim()) {
        parts.push(model.value.contenedor);
      }
      return parts.length ? parts.join(" · ") : "Sin capturar";
    });
    function hasValue(item) {
      return Boolean(item?.nombre?.trim());
    }
    function clearFoodItem(target) {
      target.catalogItemId = null;
      target.nombre = "";
      target.descripcion = "";
      target.calorias = 0;
      target.imagen = "";
      target.tipo = "";
    }
    function editCatalogItem(target) {
      if (!target?.catalogItemId) {
        return;
      }
      navigateTo({
        path: `/admin/platillos/${target.catalogItemId}`,
        query: {
          returnTo: route.fullPath
        }
      });
    }
    function actionItems(target) {
      return [[
        {
          label: "Editar platillo",
          icon: "i-lucide-square-pen",
          disabled: !target.catalogItemId,
          onSelect: () => editCatalogItem(target)
        },
        {
          label: "Limpiar campo",
          icon: "i-lucide-eraser",
          disabled: !hasValue(target),
          onSelect: () => clearFoodItem(target)
        }
      ]];
    }
    function applyCatalogItem(target, itemId) {
      if (!itemId) {
        target.catalogItemId = null;
        target.nombre = "";
        target.descripcion = "";
        target.calorias = 0;
        target.imagen = "";
        target.tipo = "";
        return;
      }
      const selected = __props.catalogItems.find((item) => item.id === itemId);
      if (!selected) {
        return;
      }
      target.catalogItemId = selected.id;
      target.nombre = selected.nombre;
      target.descripcion = selected.descripcion;
      target.calorias = selected.calorias;
      target.imagen = selected.imagen;
      target.tipo = selected.tipo;
    }
    const summary = computed(() => {
      const items = [model.value.platilloPrincipal?.nombre, model.value.contenedor].filter(Boolean);
      return items.length ? items.join(" · ") : "Sin capturar";
    });
    const cardUi = computed(() => ({
      root: __props.showToggle ? "app-surface" : "h-full rounded-none border-0 bg-transparent shadow-none ring-0",
      header: __props.showToggle ? "px-5 py-4 sm:px-5" : "border-b border-default/60 bg-elevated/30 px-4 py-3 sm:px-4",
      body: isOpen.value ? __props.showToggle ? "space-y-4 px-5 py-5 sm:px-5 sm:py-5" : "space-y-3 px-4 py-4 sm:px-4 sm:py-4" : "p-0 sm:p-0"
    }));
    function beforeEnter(el) {
      const element = el;
      element.style.height = "0";
      element.style.opacity = "0";
      element.style.transform = "translateY(-8px)";
    }
    function enter(el) {
      const element = el;
      element.style.transition = "height 220ms ease, opacity 180ms ease, transform 220ms ease";
      requestAnimationFrame(() => {
        element.style.height = `${element.scrollHeight}px`;
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      });
    }
    function afterEnter(el) {
      const element = el;
      element.style.height = "auto";
      element.style.transition = "";
    }
    function beforeLeave(el) {
      const element = el;
      element.style.height = `${element.scrollHeight}px`;
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
    function leave(el) {
      const element = el;
      element.style.transition = "height 220ms ease, opacity 160ms ease, transform 220ms ease";
      requestAnimationFrame(() => {
        element.style.height = "0";
        element.style.opacity = "0";
        element.style.transform = "translateY(-8px)";
      });
    }
    function afterLeave(el) {
      const element = el;
      element.style.transition = "";
    }
    const detailFieldInputUi = {
      base: "app-control-surface px-3.5 py-2.5 hover:bg-[var(--app-surface-soft)] focus:bg-[var(--app-surface-soft)]",
      leading: "ps-0",
      trailing: "pe-0"
    };
    const selectionOptions = computed(() => {
      switch (modalView.value) {
        case "select-platillo-principal":
          return __props.showSides ? platilloPrincipalItems.value : snackItems.value;
        case "select-guarnicion-1":
        case "select-guarnicion-2":
          return guarnicionItems.value;
        default:
          return [];
      }
    });
    function selectCatalogItemFromModal(itemId) {
      switch (modalView.value) {
        case "select-platillo-principal":
          applyCatalogItem(model.value.platilloPrincipal, itemId);
          break;
        case "select-guarnicion-1":
          applyCatalogItem(guarnicion1Model.value, itemId);
          break;
        case "select-guarnicion-2":
          applyCatalogItem(guarnicion2Model.value, itemId);
          break;
      }
      modalView.value = null;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$7;
      const _component_UButton = _sfc_main$a;
      const _component_UDropdownMenu = _sfc_main$1$1;
      const _component_UIcon = _sfc_main$g;
      const _component_UModal = _sfc_main$d;
      const _component_AdminFoodCatalogTable = __nuxt_component_2$1;
      const _component_UFormField = _sfc_main$8;
      const _component_USelect = _sfc_main$e;
      const _component_UAlert = _sfc_main$f;
      const _component_AdminFoodItemFields = __nuxt_component_9;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_UCard, mergeProps(unref(attrs), { ui: unref(cardUi) }), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="flex items-center justify-between gap-3"${_scopeId}><div${_scopeId}><h3 class="${ssrRenderClass(__props.showToggle ? "text-lg font-bold text-primary" : "text-sm font-semibold uppercase tracking-[0.18em] text-toned")}"${_scopeId}>${ssrInterpolate(__props.title)}</h3>`);
            if (__props.showToggle && !isOpen.value) {
              _push2(`<p class="text-xs text-muted mt-1"${_scopeId}>${ssrInterpolate(unref(summary))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (__props.showToggle) {
              _push2(ssrRenderComponent(_component_UButton, {
                size: "sm",
                variant: "ghost",
                color: "neutral",
                icon: isOpen.value ? "i-lucide-chevron-up" : "i-lucide-chevron-down",
                onClick: ($event) => isOpen.value = !isOpen.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(isOpen.value ? "Ocultar" : "Mostrar")}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(isOpen.value ? "Ocultar" : "Mostrar"), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "flex items-center justify-between gap-3" }, [
                createVNode("div", null, [
                  createVNode("h3", {
                    class: __props.showToggle ? "text-lg font-bold text-primary" : "text-sm font-semibold uppercase tracking-[0.18em] text-toned"
                  }, toDisplayString(__props.title), 3),
                  __props.showToggle && !isOpen.value ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-xs text-muted mt-1"
                  }, toDisplayString(unref(summary)), 1)) : createCommentVNode("", true)
                ]),
                __props.showToggle ? (openBlock(), createBlock(_component_UButton, {
                  key: 0,
                  size: "sm",
                  variant: "ghost",
                  color: "neutral",
                  icon: isOpen.value ? "i-lucide-chevron-up" : "i-lucide-chevron-down",
                  onClick: ($event) => isOpen.value = !isOpen.value
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(isOpen.value ? "Ocultar" : "Mostrar"), 1)
                  ]),
                  _: 1
                }, 8, ["icon", "onClick"])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(``);
            if (isOpen.value) {
              _push2(`<section class="space-y-3 overflow-hidden"${_scopeId}>`);
              if (__props.showSides) {
                _push2(`<section class="space-y-3"${_scopeId}><div role="button" tabindex="0" class="${ssrRenderClass(`${selectFieldClass} w-full cursor-pointer`)}"${_scopeId}><span class="min-w-0"${_scopeId}><span class="block text-[10px] uppercase tracking-[0.16em] text-muted"${_scopeId}>Platillo principal</span><span class="mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted"${_scopeId}>${ssrInterpolate(itemSummary(model.value.platilloPrincipal))}</span><span class="mt-1 block text-xs font-semibold text-primary"${_scopeId}>${ssrInterpolate(caloriesSummary(model.value.platilloPrincipal))}</span></span><span class="relative z-10 flex shrink-0 self-start"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UDropdownMenu, {
                  items: actionItems(model.value.platilloPrincipal)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UButton, {
                        type: "button",
                        size: "xs",
                        variant: "ghost",
                        color: "neutral",
                        icon: "i-lucide-ellipsis-vertical",
                        square: "",
                        class: "text-muted hover:text-highlighted",
                        onClick: () => {
                        }
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UButton, {
                          type: "button",
                          size: "xs",
                          variant: "ghost",
                          color: "neutral",
                          icon: "i-lucide-ellipsis-vertical",
                          square: "",
                          class: "text-muted hover:text-highlighted",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, null, 8, ["onClick"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</span></div><section class="grid grid-cols-1 gap-3"${_scopeId}><div role="button" tabindex="0" class="${ssrRenderClass(`${selectFieldClass} cursor-pointer`)}"${_scopeId}><span class="min-w-0"${_scopeId}><span class="block text-[10px] uppercase tracking-[0.16em] text-muted"${_scopeId}>Guarnición 1</span><span class="mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted"${_scopeId}>${ssrInterpolate(itemSummary(model.value.guarnicion1))}</span><span class="mt-1 block text-xs font-semibold text-primary"${_scopeId}>${ssrInterpolate(caloriesSummary(model.value.guarnicion1))}</span></span><span class="relative z-10 flex shrink-0 self-start"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UDropdownMenu, {
                  items: actionItems(unref(guarnicion1Model))
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UButton, {
                        type: "button",
                        size: "xs",
                        variant: "ghost",
                        color: "neutral",
                        icon: "i-lucide-ellipsis-vertical",
                        square: "",
                        class: "text-muted hover:text-highlighted",
                        onClick: () => {
                        }
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UButton, {
                          type: "button",
                          size: "xs",
                          variant: "ghost",
                          color: "neutral",
                          icon: "i-lucide-ellipsis-vertical",
                          square: "",
                          class: "text-muted hover:text-highlighted",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, null, 8, ["onClick"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</span></div><div role="button" tabindex="0" class="${ssrRenderClass(`${selectFieldClass} cursor-pointer`)}"${_scopeId}><span class="min-w-0"${_scopeId}><span class="block text-[10px] uppercase tracking-[0.16em] text-muted"${_scopeId}>Guarnición 2</span><span class="mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted"${_scopeId}>${ssrInterpolate(itemSummary(model.value.guarnicion2))}</span><span class="mt-1 block text-xs font-semibold text-primary"${_scopeId}>${ssrInterpolate(caloriesSummary(model.value.guarnicion2))}</span></span><span class="relative z-10 flex shrink-0 self-start"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UDropdownMenu, {
                  items: actionItems(unref(guarnicion2Model))
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UButton, {
                        type: "button",
                        size: "xs",
                        variant: "ghost",
                        color: "neutral",
                        icon: "i-lucide-ellipsis-vertical",
                        square: "",
                        class: "text-muted hover:text-highlighted",
                        onClick: () => {
                        }
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UButton, {
                          type: "button",
                          size: "xs",
                          variant: "ghost",
                          color: "neutral",
                          icon: "i-lucide-ellipsis-vertical",
                          square: "",
                          class: "text-muted hover:text-highlighted",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, null, 8, ["onClick"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</span></div></section></section>`);
              } else {
                _push2(`<section class="grid grid-cols-1 gap-3"${_scopeId}><div role="button" tabindex="0" class="${ssrRenderClass(`${selectFieldClass} w-full cursor-pointer`)}"${_scopeId}><span class="min-w-0"${_scopeId}><span class="block text-[10px] uppercase tracking-[0.16em] text-muted"${_scopeId}>Principal</span><span class="mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted"${_scopeId}>${ssrInterpolate(itemSummary(model.value.platilloPrincipal))}</span><span class="mt-1 block text-xs font-semibold text-primary"${_scopeId}>${ssrInterpolate(caloriesSummary(model.value.platilloPrincipal))}</span></span><span class="relative z-10 flex shrink-0 self-start"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UDropdownMenu, {
                  items: actionItems(model.value.platilloPrincipal)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UButton, {
                        type: "button",
                        size: "xs",
                        variant: "ghost",
                        color: "neutral",
                        icon: "i-lucide-ellipsis-vertical",
                        square: "",
                        class: "text-muted hover:text-highlighted",
                        onClick: () => {
                        }
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UButton, {
                          type: "button",
                          size: "xs",
                          variant: "ghost",
                          color: "neutral",
                          icon: "i-lucide-ellipsis-vertical",
                          square: "",
                          class: "text-muted hover:text-highlighted",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, null, 8, ["onClick"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</span></div></section>`);
              }
              _push2(`<section class="grid grid-cols-1 gap-3"${_scopeId}><div role="button" tabindex="0" class="${ssrRenderClass(`${selectFieldClass} w-full`)}"${_scopeId}><span class="min-w-0"${_scopeId}><span class="block text-[10px] uppercase tracking-[0.16em] text-muted"${_scopeId}>Adicionales y contenedor</span><span class="mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted"${_scopeId}>${ssrInterpolate(unref(extrasSummary))}</span></span>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-chevron-right",
                class: "size-4 shrink-0 text-muted"
              }, null, _parent2, _scopeId));
              _push2(`</div></section></section>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(Transition, {
                onBeforeEnter: beforeEnter,
                onEnter: enter,
                onAfterEnter: afterEnter,
                onBeforeLeave: beforeLeave,
                onLeave: leave,
                onAfterLeave: afterLeave
              }, {
                default: withCtx(() => [
                  isOpen.value ? (openBlock(), createBlock("section", {
                    key: 0,
                    class: "space-y-3 overflow-hidden"
                  }, [
                    __props.showSides ? (openBlock(), createBlock("section", {
                      key: 0,
                      class: "space-y-3"
                    }, [
                      createVNode("div", {
                        role: "button",
                        tabindex: "0",
                        class: `${selectFieldClass} w-full cursor-pointer`,
                        onClick: ($event) => openSelectionModal("select-platillo-principal"),
                        onKeydown: ($event) => openSelectionModalFromKeyboard($event, "select-platillo-principal")
                      }, [
                        createVNode("span", { class: "min-w-0" }, [
                          createVNode("span", { class: "block text-[10px] uppercase tracking-[0.16em] text-muted" }, "Platillo principal"),
                          createVNode("span", { class: "mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted" }, toDisplayString(itemSummary(model.value.platilloPrincipal)), 1),
                          createVNode("span", { class: "mt-1 block text-xs font-semibold text-primary" }, toDisplayString(caloriesSummary(model.value.platilloPrincipal)), 1)
                        ]),
                        createVNode("span", { class: "relative z-10 flex shrink-0 self-start" }, [
                          createVNode(_component_UDropdownMenu, {
                            items: actionItems(model.value.platilloPrincipal)
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UButton, {
                                type: "button",
                                size: "xs",
                                variant: "ghost",
                                color: "neutral",
                                icon: "i-lucide-ellipsis-vertical",
                                square: "",
                                class: "text-muted hover:text-highlighted",
                                onClick: withModifiers(() => {
                                }, ["stop"])
                              }, null, 8, ["onClick"])
                            ]),
                            _: 1
                          }, 8, ["items"])
                        ])
                      ], 42, ["onClick", "onKeydown"]),
                      createVNode("section", { class: "grid grid-cols-1 gap-3" }, [
                        createVNode("div", {
                          role: "button",
                          tabindex: "0",
                          class: `${selectFieldClass} cursor-pointer`,
                          onClick: ($event) => openSelectionModal("select-guarnicion-1"),
                          onKeydown: ($event) => openSelectionModalFromKeyboard($event, "select-guarnicion-1")
                        }, [
                          createVNode("span", { class: "min-w-0" }, [
                            createVNode("span", { class: "block text-[10px] uppercase tracking-[0.16em] text-muted" }, "Guarnición 1"),
                            createVNode("span", { class: "mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted" }, toDisplayString(itemSummary(model.value.guarnicion1)), 1),
                            createVNode("span", { class: "mt-1 block text-xs font-semibold text-primary" }, toDisplayString(caloriesSummary(model.value.guarnicion1)), 1)
                          ]),
                          createVNode("span", { class: "relative z-10 flex shrink-0 self-start" }, [
                            createVNode(_component_UDropdownMenu, {
                              items: actionItems(unref(guarnicion1Model))
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UButton, {
                                  type: "button",
                                  size: "xs",
                                  variant: "ghost",
                                  color: "neutral",
                                  icon: "i-lucide-ellipsis-vertical",
                                  square: "",
                                  class: "text-muted hover:text-highlighted",
                                  onClick: withModifiers(() => {
                                  }, ["stop"])
                                }, null, 8, ["onClick"])
                              ]),
                              _: 1
                            }, 8, ["items"])
                          ])
                        ], 42, ["onClick", "onKeydown"]),
                        createVNode("div", {
                          role: "button",
                          tabindex: "0",
                          class: `${selectFieldClass} cursor-pointer`,
                          onClick: ($event) => openSelectionModal("select-guarnicion-2"),
                          onKeydown: ($event) => openSelectionModalFromKeyboard($event, "select-guarnicion-2")
                        }, [
                          createVNode("span", { class: "min-w-0" }, [
                            createVNode("span", { class: "block text-[10px] uppercase tracking-[0.16em] text-muted" }, "Guarnición 2"),
                            createVNode("span", { class: "mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted" }, toDisplayString(itemSummary(model.value.guarnicion2)), 1),
                            createVNode("span", { class: "mt-1 block text-xs font-semibold text-primary" }, toDisplayString(caloriesSummary(model.value.guarnicion2)), 1)
                          ]),
                          createVNode("span", { class: "relative z-10 flex shrink-0 self-start" }, [
                            createVNode(_component_UDropdownMenu, {
                              items: actionItems(unref(guarnicion2Model))
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_UButton, {
                                  type: "button",
                                  size: "xs",
                                  variant: "ghost",
                                  color: "neutral",
                                  icon: "i-lucide-ellipsis-vertical",
                                  square: "",
                                  class: "text-muted hover:text-highlighted",
                                  onClick: withModifiers(() => {
                                  }, ["stop"])
                                }, null, 8, ["onClick"])
                              ]),
                              _: 1
                            }, 8, ["items"])
                          ])
                        ], 42, ["onClick", "onKeydown"])
                      ])
                    ])) : (openBlock(), createBlock("section", {
                      key: 1,
                      class: "grid grid-cols-1 gap-3"
                    }, [
                      createVNode("div", {
                        role: "button",
                        tabindex: "0",
                        class: `${selectFieldClass} w-full cursor-pointer`,
                        onClick: ($event) => openSelectionModal("select-platillo-principal"),
                        onKeydown: ($event) => openSelectionModalFromKeyboard($event, "select-platillo-principal")
                      }, [
                        createVNode("span", { class: "min-w-0" }, [
                          createVNode("span", { class: "block text-[10px] uppercase tracking-[0.16em] text-muted" }, "Principal"),
                          createVNode("span", { class: "mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted" }, toDisplayString(itemSummary(model.value.platilloPrincipal)), 1),
                          createVNode("span", { class: "mt-1 block text-xs font-semibold text-primary" }, toDisplayString(caloriesSummary(model.value.platilloPrincipal)), 1)
                        ]),
                        createVNode("span", { class: "relative z-10 flex shrink-0 self-start" }, [
                          createVNode(_component_UDropdownMenu, {
                            items: actionItems(model.value.platilloPrincipal)
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UButton, {
                                type: "button",
                                size: "xs",
                                variant: "ghost",
                                color: "neutral",
                                icon: "i-lucide-ellipsis-vertical",
                                square: "",
                                class: "text-muted hover:text-highlighted",
                                onClick: withModifiers(() => {
                                }, ["stop"])
                              }, null, 8, ["onClick"])
                            ]),
                            _: 1
                          }, 8, ["items"])
                        ])
                      ], 42, ["onClick", "onKeydown"])
                    ])),
                    createVNode("section", { class: "grid grid-cols-1 gap-3" }, [
                      createVNode("div", {
                        role: "button",
                        tabindex: "0",
                        class: `${selectFieldClass} w-full`,
                        onClick: ($event) => modalView.value = "extras",
                        onKeydown: openExtrasFromKeyboard
                      }, [
                        createVNode("span", { class: "min-w-0" }, [
                          createVNode("span", { class: "block text-[10px] uppercase tracking-[0.16em] text-muted" }, "Adicionales y contenedor"),
                          createVNode("span", { class: "mt-1.5 block line-clamp-2 text-sm font-medium text-highlighted" }, toDisplayString(unref(extrasSummary)), 1)
                        ]),
                        createVNode(_component_UIcon, {
                          name: "i-lucide-chevron-right",
                          class: "size-4 shrink-0 text-muted"
                        })
                      ], 42, ["onClick"])
                    ])
                  ])) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UModal, {
        open: unref(isModalOpen),
        "onUpdate:open": ($event) => isRef(isModalOpen) ? isModalOpen.value = $event : null,
        title: unref(detailModalTitle),
        description: __props.title,
        ui: { content: "max-w-3xl" }
      }, {
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(modalView) === "select-platillo-principal" || unref(modalView) === "select-guarnicion-1" || unref(modalView) === "select-guarnicion-2") {
              _push2(`<section class="-mx-6 -my-5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_AdminFoodCatalogTable, {
                items: unref(selectionOptions),
                mode: "select",
                "selected-id": null,
                "autofocus-search": true,
                "search-placeholder": "Escribe para buscar un platillo",
                "empty-title": "No hay platillos disponibles",
                "empty-description": "Crea platillos en el catálogo para poder seleccionarlos aquí.",
                "no-results-title": "Sin resultados",
                "no-results-description": "Prueba con otro término o cambia el tipo de platillo.",
                "select-label": "Usar",
                onSelect: selectCatalogItemFromModal
              }, null, _parent2, _scopeId));
              _push2(`</section>`);
            } else if (unref(modalView) === "extras") {
              _push2(`<section class="space-y-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UFormField, { label: "Contenedor" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelect, {
                      modelValue: unref(contenedorModel),
                      "onUpdate:modelValue": ($event) => isRef(contenedorModel) ? contenedorModel.value = $event : null,
                      items: contenedorOptions,
                      placeholder: "Selecciona un contenedor",
                      icon: "i-lucide-package",
                      ui: detailFieldInputUi
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelect, {
                        modelValue: unref(contenedorModel),
                        "onUpdate:modelValue": ($event) => isRef(contenedorModel) ? contenedorModel.value = $event : null,
                        items: contenedorOptions,
                        placeholder: "Selecciona un contenedor",
                        icon: "i-lucide-package",
                        ui: detailFieldInputUi
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<section class="flex items-center justify-between gap-3"${_scopeId}><p class="text-sm text-muted"${_scopeId}> Agrega y organiza los adicionales de este tiempo. </p>`);
              _push2(ssrRenderComponent(_component_UButton, {
                size: "sm",
                variant: "outline",
                icon: "i-lucide-plus",
                onClick: addAdicional
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Agregar adicional `);
                  } else {
                    return [
                      createTextVNode(" Agregar adicional ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</section>`);
              if (!model.value.adicionales.length) {
                _push2(ssrRenderComponent(_component_UAlert, {
                  title: "Sin adicionales",
                  description: "Agrega adicionales si este tiempo los necesita.",
                  color: "neutral",
                  variant: "soft"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(model.value.adicionales, (adicional, index) => {
                _push2(`<section class="space-y-3 rounded-xl border border-default p-3"${_scopeId}><section class="flex items-center justify-between gap-3"${_scopeId}><h4 class="font-medium text-highlighted"${_scopeId}>Adicional ${ssrInterpolate(index + 1)}</h4>`);
                _push2(ssrRenderComponent(_component_UButton, {
                  size: "xs",
                  color: "error",
                  variant: "ghost",
                  icon: "i-lucide-trash",
                  onClick: ($event) => removeAdicional(index)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Eliminar `);
                    } else {
                      return [
                        createTextVNode(" Eliminar ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</section>`);
                _push2(ssrRenderComponent(_component_AdminFoodItemFields, {
                  "model-value": getAdicional(index),
                  title: `Adicional ${index + 1}`,
                  "catalog-items": unref(adicionalItems),
                  "onUpdate:modelValue": ($event) => setAdicional(index, $event)
                }, null, _parent2, _scopeId));
                _push2(`</section>`);
              });
              _push2(`<!--]--></section>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(modalView) === "select-platillo-principal" || unref(modalView) === "select-guarnicion-1" || unref(modalView) === "select-guarnicion-2" ? (openBlock(), createBlock("section", {
                key: 0,
                class: "-mx-6 -my-5"
              }, [
                createVNode(_component_AdminFoodCatalogTable, {
                  items: unref(selectionOptions),
                  mode: "select",
                  "selected-id": null,
                  "autofocus-search": true,
                  "search-placeholder": "Escribe para buscar un platillo",
                  "empty-title": "No hay platillos disponibles",
                  "empty-description": "Crea platillos en el catálogo para poder seleccionarlos aquí.",
                  "no-results-title": "Sin resultados",
                  "no-results-description": "Prueba con otro término o cambia el tipo de platillo.",
                  "select-label": "Usar",
                  onSelect: selectCatalogItemFromModal
                }, null, 8, ["items"])
              ])) : unref(modalView) === "extras" ? (openBlock(), createBlock("section", {
                key: 1,
                class: "space-y-4"
              }, [
                createVNode(_component_UFormField, { label: "Contenedor" }, {
                  default: withCtx(() => [
                    createVNode(_component_USelect, {
                      modelValue: unref(contenedorModel),
                      "onUpdate:modelValue": ($event) => isRef(contenedorModel) ? contenedorModel.value = $event : null,
                      items: contenedorOptions,
                      placeholder: "Selecciona un contenedor",
                      icon: "i-lucide-package",
                      ui: detailFieldInputUi
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  _: 1
                }),
                createVNode("section", { class: "flex items-center justify-between gap-3" }, [
                  createVNode("p", { class: "text-sm text-muted" }, " Agrega y organiza los adicionales de este tiempo. "),
                  createVNode(_component_UButton, {
                    size: "sm",
                    variant: "outline",
                    icon: "i-lucide-plus",
                    onClick: addAdicional
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Agregar adicional ")
                    ]),
                    _: 1
                  })
                ]),
                !model.value.adicionales.length ? (openBlock(), createBlock(_component_UAlert, {
                  key: 0,
                  title: "Sin adicionales",
                  description: "Agrega adicionales si este tiempo los necesita.",
                  color: "neutral",
                  variant: "soft"
                })) : createCommentVNode("", true),
                (openBlock(true), createBlock(Fragment, null, renderList(model.value.adicionales, (adicional, index) => {
                  return openBlock(), createBlock("section", {
                    key: index,
                    class: "space-y-3 rounded-xl border border-default p-3"
                  }, [
                    createVNode("section", { class: "flex items-center justify-between gap-3" }, [
                      createVNode("h4", { class: "font-medium text-highlighted" }, "Adicional " + toDisplayString(index + 1), 1),
                      createVNode(_component_UButton, {
                        size: "xs",
                        color: "error",
                        variant: "ghost",
                        icon: "i-lucide-trash",
                        onClick: ($event) => removeAdicional(index)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Eliminar ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    createVNode(_component_AdminFoodItemFields, {
                      "model-value": getAdicional(index),
                      title: `Adicional ${index + 1}`,
                      "catalog-items": unref(adicionalItems),
                      "onUpdate:modelValue": ($event) => setAdicional(index, $event)
                    }, null, 8, ["model-value", "title", "catalog-items", "onUpdate:modelValue"])
                  ]);
                }), 128))
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/MenuSlotEditor.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = Object.assign(_sfc_main$1, { __name: "AdminMenuSlotEditor" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MenuForm",
  __ssrInlineRender: true,
  props: {
    menu: {},
    mode: {}
  },
  emits: ["saved"],
  async setup(__props, { emit: __emit }) {
    let __temp, __restore;
    const props = __props;
    const menu = computed(() => props.menu ?? null);
    const mode = computed(() => props.mode ?? "create");
    const emit = __emit;
    const DAY_LABELS = {
      LUNES: "Lunes",
      MARTES: "Martes",
      MIERCOLES: "Miércoles",
      JUEVES: "Jueves",
      VIERNES: "Viernes",
      SABADO: "Sábado",
      DOMINGO: "Domingo"
    };
    const SLOT_LABELS = {
      desayuno: "Desayuno",
      comida: "Comida",
      cena: "Cena",
      snack1: "Snack 1",
      snack2: "Snack 2"
    };
    function createEmptyFoodItem() {
      return {
        catalogItemId: null,
        nombre: "",
        descripcion: "",
        calorias: 0,
        imagen: "",
        tipo: ""
      };
    }
    function createEmptySlot() {
      return {
        platilloPrincipal: createEmptyFoodItem(),
        guarnicion1: createEmptyFoodItem(),
        guarnicion2: createEmptyFoodItem(),
        contenedor: "",
        adicionales: []
      };
    }
    function createDay(dayOfWeek) {
      return {
        dayOfWeek,
        desayuno: createEmptySlot(),
        comida: createEmptySlot(),
        cena: createEmptySlot(),
        snack1: createEmptySlot(),
        snack2: createEmptySlot()
      };
    }
    function cloneFoodItem(item) {
      if (!item) {
        return createEmptyFoodItem();
      }
      return {
        catalogItemId: item.catalogItemId ?? null,
        nombre: item.nombre ?? "",
        descripcion: item.descripcion ?? "",
        calorias: item.calorias ?? 0,
        imagen: item.imagen ?? "",
        tipo: item.tipo ?? ""
      };
    }
    function cloneSlot(slot) {
      return {
        platilloPrincipal: cloneFoodItem(slot?.platilloPrincipal),
        guarnicion1: cloneFoodItem(slot?.guarnicion1),
        guarnicion2: cloneFoodItem(slot?.guarnicion2),
        contenedor: slot?.contenedor ?? "",
        adicionales: (slot?.adicionales ?? []).map((item) => cloneFoodItem(item))
      };
    }
    function createStateFromMenu(menu2) {
      if (!menu2) {
        return {
          name: "",
          startDate: /* @__PURE__ */ new Date(),
          endDate: /* @__PURE__ */ new Date(),
          days: DAY_OF_WEEK_VALUES.map((day) => createDay(day))
        };
      }
      const byDay = new Map(menu2.days.map((day) => [day.dayOfWeek, day]));
      return {
        name: menu2.name,
        startDate: new Date(menu2.startDate),
        endDate: new Date(menu2.endDate),
        days: DAY_OF_WEEK_VALUES.map((dayOfWeek) => {
          const source = byDay.get(dayOfWeek);
          return {
            dayOfWeek,
            desayuno: cloneSlot(source?.desayuno),
            comida: cloneSlot(source?.comida),
            cena: cloneSlot(source?.cena),
            snack1: cloneSlot(source?.snack1),
            snack2: cloneSlot(source?.snack2)
          };
        })
      };
    }
    const state = reactive(createStateFromMenu(menu.value));
    const loading = ref(false);
    const hiddenDays = /* @__PURE__ */ new Set(["SABADO", "DOMINGO"]);
    const markAsActive = ref(Boolean(menu.value?.isActive));
    const snacksExpanded = reactive(
      DAY_OF_WEEK_VALUES.reduce((acc, day) => {
        acc[day] = false;
        return acc;
      }, {})
    );
    const title = computed(() => {
      if (mode.value === "edit") {
        return state.name.trim() ? `Editar ${state.name}` : "Editar menú semanal";
      }
      return "Nuevo menú semanal";
    });
    const actionLabel = computed(() => mode.value === "edit" ? "Guardar cambios" : "Crear menú");
    const activeActionLabel = computed(() => {
      if (menu.value?.isActive || markAsActive.value) {
        return "Menú activo";
      }
      return "Hacer menú activo";
    });
    const visibleDayEntries = computed(
      () => state.days.map((day) => ({ day })).filter(({ day }) => !hiddenDays.has(day.dayOfWeek))
    );
    const cardSurfaceUi = {
      root: "app-surface",
      body: "p-0 sm:p-0",
      header: "px-6 py-5 sm:px-6",
      footer: "px-6 py-5 sm:px-6"
    };
    const toast = useToast();
    const { createMenuOnDB, updateMenuOnDB, setActiveMenuOnDB } = useMenu();
    const { data: catalogItems } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/food-components",
      {
        default: () => []
      },
      "$qyhz3E5J7l"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const resolvedCatalogItems = computed(() => catalogItems.value ?? []);
    const invalidFields = reactive({
      name: false,
      startDate: false,
      endDate: false
    });
    const invalidDays = ref(/* @__PURE__ */ new Set());
    const invalidSlots = ref(
      DAY_OF_WEEK_VALUES.reduce((acc, day) => {
        acc[day] = /* @__PURE__ */ new Set();
        return acc;
      }, {})
    );
    function toComparableDate(value) {
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
    }
    function comparableFoodItem(item) {
      return {
        catalogItemId: item?.catalogItemId ?? null,
        nombre: item?.nombre ?? "",
        descripcion: item?.descripcion ?? "",
        calorias: item?.calorias ?? 0,
        imagen: item?.imagen ?? "",
        tipo: item?.tipo ?? ""
      };
    }
    function comparableSlot(slot) {
      return {
        platilloPrincipal: comparableFoodItem(slot.platilloPrincipal),
        guarnicion1: comparableFoodItem(slot.guarnicion1),
        guarnicion2: comparableFoodItem(slot.guarnicion2),
        contenedor: slot.contenedor ?? "",
        adicionales: slot.adicionales.map((item) => comparableFoodItem(item))
      };
    }
    function comparableMenuInput(input) {
      return {
        name: input.name.trim(),
        startDate: toComparableDate(input.startDate),
        endDate: toComparableDate(input.endDate),
        days: input.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          desayuno: comparableSlot(day.desayuno),
          comida: comparableSlot(day.comida),
          cena: comparableSlot(day.cena),
          snack1: comparableSlot(day.snack1),
          snack2: comparableSlot(day.snack2)
        }))
      };
    }
    const canSubmitByValidation = computed(() => weeklyMenuInputSchema.safeParse(state).success);
    const isDirty = computed(() => {
      if (mode.value !== "edit") {
        return true;
      }
      const original = comparableMenuInput(createStateFromMenu(menu.value));
      const current = comparableMenuInput(state);
      const activeChanged = markAsActive.value !== Boolean(menu.value?.isActive);
      return JSON.stringify(original) !== JSON.stringify(current) || activeChanged;
    });
    const canSubmit = computed(() => canSubmitByValidation.value && isDirty.value && !loading.value);
    watch(
      () => menu.value,
      (menu2) => {
        Object.assign(state, createStateFromMenu(menu2));
        markAsActive.value = Boolean(menu2?.isActive);
        clearValidationHighlights();
        for (const day of DAY_OF_WEEK_VALUES) {
          snacksExpanded[day] = false;
        }
      }
    );
    function toggleSnacks(dayOfWeek) {
      snacksExpanded[dayOfWeek] = !snacksExpanded[dayOfWeek];
    }
    function clearValidationHighlights() {
      invalidFields.name = false;
      invalidFields.startDate = false;
      invalidFields.endDate = false;
      invalidDays.value = /* @__PURE__ */ new Set();
      invalidSlots.value = DAY_OF_WEEK_VALUES.reduce((acc, day) => {
        acc[day] = /* @__PURE__ */ new Set();
        return acc;
      }, {});
    }
    function applyValidationHighlights(issues) {
      clearValidationHighlights();
      for (const issue of issues) {
        const [root, dayIndex, slotKey] = issue.path;
        if (root === "name") {
          invalidFields.name = true;
          continue;
        }
        if (root === "startDate") {
          invalidFields.startDate = true;
          continue;
        }
        if (root === "endDate") {
          invalidFields.endDate = true;
          continue;
        }
        if (root === "days" && typeof dayIndex === "number" && typeof slotKey === "string") {
          const day = state.days[dayIndex];
          const normalizedSlotKey = slotKey;
          if (!day || !(normalizedSlotKey in SLOT_LABELS)) {
            continue;
          }
          if (hiddenDays.has(day.dayOfWeek)) {
            continue;
          }
          invalidDays.value.add(day.dayOfWeek);
          invalidSlots.value[day.dayOfWeek].add(normalizedSlotKey);
          if (normalizedSlotKey === "snack1" || normalizedSlotKey === "snack2") {
            snacksExpanded[day.dayOfWeek] = true;
          }
        }
      }
    }
    function isDayInvalid(dayOfWeek) {
      return invalidDays.value.has(dayOfWeek);
    }
    function isSlotInvalid(dayOfWeek, slotKey) {
      return invalidSlots.value[dayOfWeek].has(slotKey);
    }
    function formatValidationIssue(issue) {
      if (!issue) {
        return "Verifica la información del menú.";
      }
      const [root, dayIndex, slotKey, fieldKey, nestedField] = issue.path;
      if (root === "name") {
        return "El nombre del menú es obligatorio.";
      }
      if (root === "days" && typeof dayIndex === "number" && typeof slotKey === "string" && typeof fieldKey === "string") {
        const day = state.days[dayIndex];
        const dayLabel = day ? DAY_LABELS[day.dayOfWeek] : "el día seleccionado";
        const slotLabel = SLOT_LABELS[slotKey] ?? "este tiempo";
        if (day && hiddenDays.has(day.dayOfWeek)) {
          return "Verifica la información opcional capturada en fin de semana.";
        }
        if (fieldKey === "platilloPrincipal" && nestedField === "nombre") {
          return `Falta el nombre del platillo principal en ${slotLabel} de ${dayLabel}.`;
        }
        if ((fieldKey === "guarnicion1" || fieldKey === "guarnicion2") && nestedField === "nombre") {
          const guarnicionLabel = fieldKey === "guarnicion1" ? "guarnición 1" : "guarnición 2";
          return `Falta el nombre de ${guarnicionLabel} en ${slotLabel} de ${dayLabel}.`;
        }
        if (fieldKey === "adicionales" && nestedField !== void 0) {
          return `Hay un adicional incompleto en ${slotLabel} de ${dayLabel}.`;
        }
        if (fieldKey === "platilloPrincipal" && nestedField === "tipo") {
          return `Falta el tipo del platillo principal en ${slotLabel} de ${dayLabel}.`;
        }
      }
      return issue.message || "Verifica la información del menú.";
    }
    async function onSubmit() {
      const parsed = weeklyMenuInputSchema.safeParse(state);
      if (!parsed.success) {
        applyValidationHighlights(parsed.error.issues);
        const firstIssue = parsed.error.issues[0];
        toast.add({
          title: "Error de validación",
          description: formatValidationIssue(firstIssue),
          color: "error"
        });
        return;
      }
      clearValidationHighlights();
      loading.value = true;
      try {
        const savedMenu = mode.value === "edit" && menu.value?.id ? await updateMenuOnDB(menu.value.id, parsed.data) : await createMenuOnDB(parsed.data);
        if (markAsActive.value && !savedMenu.isActive) {
          await setActiveMenuOnDB(savedMenu.id);
        }
        toast.add({
          title: mode.value === "edit" ? "Menú actualizado" : "Menú creado",
          description: markAsActive.value ? "La información se guardó y este menú quedó como activo." : "La información se guardó correctamente.",
          color: "success"
        });
        emit("saved", savedMenu.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo guardar el menú";
        toast.add({ title: "Error", description: message, color: "error" });
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$a;
      const _component_UForm = _sfc_main$6;
      const _component_UCard = _sfc_main$7;
      const _component_UFormField = _sfc_main$8;
      const _component_AdminMetaField = __nuxt_component_4;
      const _component_UInput = _sfc_main$9;
      const _component_DatePicker = __nuxt_component_6;
      const _component_AdminMenuSlotEditor = __nuxt_component_7;
      const _component_UIcon = _sfc_main$g;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex items-center justify-between gap-4"><div><h1 class="text-2xl font-semibold text-primary">${ssrInterpolate(unref(title))}</h1><p class="mt-1 text-sm text-muted"> Captura una semana completa, define el menú activo y administra cada día desde una sola vista. </p></div>`);
      _push(ssrRenderComponent(_component_UButton, {
        to: "/admin/menu",
        variant: "ghost",
        color: "neutral",
        icon: "i-lucide-arrow-left"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Volver `);
          } else {
            return [
              createTextVNode(" Volver ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UForm, {
        class: "space-y-6",
        onSubmit
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UCard, { ui: cardSurfaceUi }, {
              header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex items-start justify-between gap-4"${_scopeId2}><div${_scopeId2}><h2 class="text-base font-semibold text-highlighted"${_scopeId2}> Información general </h2><p class="mt-1 text-sm text-muted"${_scopeId2}> Define el nombre del menú y el rango de fechas en el que estará disponible. </p></div><div class="flex items-center gap-3"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    type: "submit",
                    loading: unref(loading),
                    disabled: !unref(canSubmit),
                    color: unref(canSubmit) ? "primary" : "neutral",
                    icon: "i-lucide-save"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(actionLabel))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(actionLabel)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    variant: unref(markAsActive) || unref(menu)?.isActive ? "soft" : "outline",
                    color: unref(markAsActive) || unref(menu)?.isActive ? "success" : "primary",
                    icon: "i-lucide-badge-check",
                    onClick: ($event) => markAsActive.value = true
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(unref(activeActionLabel))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(unref(activeActionLabel)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                      createVNode("div", null, [
                        createVNode("h2", { class: "text-base font-semibold text-highlighted" }, " Información general "),
                        createVNode("p", { class: "mt-1 text-sm text-muted" }, " Define el nombre del menú y el rango de fechas en el que estará disponible. ")
                      ]),
                      createVNode("div", { class: "flex items-center gap-3" }, [
                        createVNode(_component_UButton, {
                          type: "submit",
                          loading: unref(loading),
                          disabled: !unref(canSubmit),
                          color: unref(canSubmit) ? "primary" : "neutral",
                          icon: "i-lucide-save"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(actionLabel)), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "disabled", "color"]),
                        createVNode(_component_UButton, {
                          variant: unref(markAsActive) || unref(menu)?.isActive ? "soft" : "outline",
                          color: unref(markAsActive) || unref(menu)?.isActive ? "success" : "primary",
                          icon: "i-lucide-badge-check",
                          onClick: ($event) => markAsActive.value = true
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(activeActionLabel)), 1)
                          ]),
                          _: 1
                        }, 8, ["variant", "color", "onClick"])
                      ])
                    ])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="grid gap-6 px-6 py-6 lg:grid-cols-3"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { name: "name" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_AdminMetaField, {
                          label: "Nombre del menú",
                          invalid: unref(invalidFields).name
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_UInput, {
                                modelValue: unref(state).name,
                                "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                placeholder: "Ej. Menú Semana 12",
                                icon: "i-lucide-notebook-pen",
                                variant: "ghost",
                                class: "w-full",
                                ui: {
                                  base: "h-5 min-h-5 max-h-5 border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                                  leading: "ps-0",
                                  leadingIcon: "size-4 text-muted"
                                }
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_UInput, {
                                  modelValue: unref(state).name,
                                  "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                  placeholder: "Ej. Menú Semana 12",
                                  icon: "i-lucide-notebook-pen",
                                  variant: "ghost",
                                  class: "w-full",
                                  ui: {
                                    base: "h-5 min-h-5 max-h-5 border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                                    leading: "ps-0",
                                    leadingIcon: "size-4 text-muted"
                                  }
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_AdminMetaField, {
                            label: "Nombre del menú",
                            invalid: unref(invalidFields).name
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(state).name,
                                "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                placeholder: "Ej. Menú Semana 12",
                                icon: "i-lucide-notebook-pen",
                                variant: "ghost",
                                class: "w-full",
                                ui: {
                                  base: "h-5 min-h-5 max-h-5 border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                                  leading: "ps-0",
                                  leadingIcon: "size-4 text-muted"
                                }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }, 8, ["invalid"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { name: "startDate" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_AdminMetaField, {
                          label: "Fecha de inicio",
                          invalid: unref(invalidFields).startDate
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_DatePicker, {
                                modelValue: unref(state).startDate,
                                "onUpdate:modelValue": ($event) => unref(state).startDate = $event
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_DatePicker, {
                                  modelValue: unref(state).startDate,
                                  "onUpdate:modelValue": ($event) => unref(state).startDate = $event
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_AdminMetaField, {
                            label: "Fecha de inicio",
                            invalid: unref(invalidFields).startDate
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_DatePicker, {
                                modelValue: unref(state).startDate,
                                "onUpdate:modelValue": ($event) => unref(state).startDate = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }, 8, ["invalid"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { name: "endDate" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_AdminMetaField, {
                          label: "Fecha final",
                          invalid: unref(invalidFields).endDate
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_DatePicker, {
                                modelValue: unref(state).endDate,
                                "onUpdate:modelValue": ($event) => unref(state).endDate = $event
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_DatePicker, {
                                  modelValue: unref(state).endDate,
                                  "onUpdate:modelValue": ($event) => unref(state).endDate = $event
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_AdminMetaField, {
                            label: "Fecha final",
                            invalid: unref(invalidFields).endDate
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_DatePicker, {
                                modelValue: unref(state).endDate,
                                "onUpdate:modelValue": ($event) => unref(state).endDate = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }, 8, ["invalid"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "grid gap-6 px-6 py-6 lg:grid-cols-3" }, [
                      createVNode(_component_UFormField, { name: "name" }, {
                        default: withCtx(() => [
                          createVNode(_component_AdminMetaField, {
                            label: "Nombre del menú",
                            invalid: unref(invalidFields).name
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: unref(state).name,
                                "onUpdate:modelValue": ($event) => unref(state).name = $event,
                                placeholder: "Ej. Menú Semana 12",
                                icon: "i-lucide-notebook-pen",
                                variant: "ghost",
                                class: "w-full",
                                ui: {
                                  base: "h-5 min-h-5 max-h-5 border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                                  leading: "ps-0",
                                  leadingIcon: "size-4 text-muted"
                                }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }, 8, ["invalid"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { name: "startDate" }, {
                        default: withCtx(() => [
                          createVNode(_component_AdminMetaField, {
                            label: "Fecha de inicio",
                            invalid: unref(invalidFields).startDate
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_DatePicker, {
                                modelValue: unref(state).startDate,
                                "onUpdate:modelValue": ($event) => unref(state).startDate = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }, 8, ["invalid"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { name: "endDate" }, {
                        default: withCtx(() => [
                          createVNode(_component_AdminMetaField, {
                            label: "Fecha final",
                            invalid: unref(invalidFields).endDate
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_DatePicker, {
                                modelValue: unref(state).endDate,
                                "onUpdate:modelValue": ($event) => unref(state).endDate = $event
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }, 8, ["invalid"])
                        ]),
                        _: 1
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<section class="space-y-5"${_scopeId}><!--[-->`);
            ssrRenderList(unref(visibleDayEntries), (entry) => {
              _push2(ssrRenderComponent(_component_UCard, {
                key: entry.day.dayOfWeek,
                variant: "subtle",
                class: [
                  "app-surface-soft overflow-hidden",
                  isDayInvalid(entry.day.dayOfWeek) ? "ring-1 ring-error/35 border-error/50" : ""
                ],
                ui: { root: "app-surface-soft overflow-hidden", header: "px-5 py-4 sm:px-5", body: "p-0 sm:p-0" }
              }, {
                header: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="flex items-center justify-between gap-4"${_scopeId2}><h3 class="text-base font-semibold text-primary"${_scopeId2}>${ssrInterpolate(DAY_LABELS[entry.day.dayOfWeek])}</h3></div>`);
                  } else {
                    return [
                      createVNode("div", { class: "flex items-center justify-between gap-4" }, [
                        createVNode("h3", { class: "text-base font-semibold text-primary" }, toDisplayString(DAY_LABELS[entry.day.dayOfWeek]), 1)
                      ])
                    ];
                  }
                }),
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<section class="grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-3"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_AdminMenuSlotEditor, {
                      modelValue: entry.day.desayuno,
                      "onUpdate:modelValue": ($event) => entry.day.desayuno = $event,
                      title: "Desayuno",
                      "show-toggle": false,
                      "catalog-items": unref(resolvedCatalogItems),
                      class: [
                        "lg:border-r lg:border-default/70",
                        isSlotInvalid(entry.day.dayOfWeek, "desayuno") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                      ]
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_AdminMenuSlotEditor, {
                      modelValue: entry.day.comida,
                      "onUpdate:modelValue": ($event) => entry.day.comida = $event,
                      title: "Comida",
                      "show-toggle": false,
                      "catalog-items": unref(resolvedCatalogItems),
                      class: [
                        "lg:border-r lg:border-default/70",
                        isSlotInvalid(entry.day.dayOfWeek, "comida") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                      ]
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_AdminMenuSlotEditor, {
                      modelValue: entry.day.cena,
                      "onUpdate:modelValue": ($event) => entry.day.cena = $event,
                      title: "Cena",
                      "show-toggle": false,
                      "catalog-items": unref(resolvedCatalogItems),
                      class: isSlotInvalid(entry.day.dayOfWeek, "cena") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                    }, null, _parent3, _scopeId2));
                    _push3(`</section><section class="border-t border-default/70"${_scopeId2}><button type="button" class="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-elevated/20"${_scopeId2}><span${_scopeId2}><span class="block text-sm font-semibold text-primary"${_scopeId2}>Snacks</span><span class="mt-1 block text-xs text-muted"${_scopeId2}>${ssrInterpolate(unref(snacksExpanded)[entry.day.dayOfWeek] ? "Oculta colaciones y snacks de este día." : "Muestra Snack 1 y Snack 2 de este día.")}</span></span>`);
                    _push3(ssrRenderComponent(_component_UIcon, {
                      name: unref(snacksExpanded)[entry.day.dayOfWeek] ? "i-lucide-chevron-up" : "i-lucide-chevron-down",
                      class: "size-4 text-muted"
                    }, null, _parent3, _scopeId2));
                    _push3(`</button>`);
                    if (unref(snacksExpanded)[entry.day.dayOfWeek]) {
                      _push3(`<section class="grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-2"${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_AdminMenuSlotEditor, {
                        modelValue: entry.day.snack1,
                        "onUpdate:modelValue": ($event) => entry.day.snack1 = $event,
                        title: "Snack 1",
                        "show-sides": false,
                        "show-toggle": false,
                        "catalog-items": unref(resolvedCatalogItems),
                        class: [
                          "lg:border-r lg:border-default/70",
                          isSlotInvalid(entry.day.dayOfWeek, "snack1") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                        ]
                      }, null, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_AdminMenuSlotEditor, {
                        modelValue: entry.day.snack2,
                        "onUpdate:modelValue": ($event) => entry.day.snack2 = $event,
                        title: "Snack 2",
                        "show-sides": false,
                        "show-toggle": false,
                        "catalog-items": unref(resolvedCatalogItems),
                        class: isSlotInvalid(entry.day.dayOfWeek, "snack2") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                      }, null, _parent3, _scopeId2));
                      _push3(`</section>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</section>`);
                  } else {
                    return [
                      createVNode("section", { class: "grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-3" }, [
                        createVNode(_component_AdminMenuSlotEditor, {
                          modelValue: entry.day.desayuno,
                          "onUpdate:modelValue": ($event) => entry.day.desayuno = $event,
                          title: "Desayuno",
                          "show-toggle": false,
                          "catalog-items": unref(resolvedCatalogItems),
                          class: [
                            "lg:border-r lg:border-default/70",
                            isSlotInvalid(entry.day.dayOfWeek, "desayuno") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                          ]
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"]),
                        createVNode(_component_AdminMenuSlotEditor, {
                          modelValue: entry.day.comida,
                          "onUpdate:modelValue": ($event) => entry.day.comida = $event,
                          title: "Comida",
                          "show-toggle": false,
                          "catalog-items": unref(resolvedCatalogItems),
                          class: [
                            "lg:border-r lg:border-default/70",
                            isSlotInvalid(entry.day.dayOfWeek, "comida") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                          ]
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"]),
                        createVNode(_component_AdminMenuSlotEditor, {
                          modelValue: entry.day.cena,
                          "onUpdate:modelValue": ($event) => entry.day.cena = $event,
                          title: "Cena",
                          "show-toggle": false,
                          "catalog-items": unref(resolvedCatalogItems),
                          class: isSlotInvalid(entry.day.dayOfWeek, "cena") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"])
                      ]),
                      createVNode("section", { class: "border-t border-default/70" }, [
                        createVNode("button", {
                          type: "button",
                          class: "flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-elevated/20",
                          onClick: ($event) => toggleSnacks(entry.day.dayOfWeek)
                        }, [
                          createVNode("span", null, [
                            createVNode("span", { class: "block text-sm font-semibold text-primary" }, "Snacks"),
                            createVNode("span", { class: "mt-1 block text-xs text-muted" }, toDisplayString(unref(snacksExpanded)[entry.day.dayOfWeek] ? "Oculta colaciones y snacks de este día." : "Muestra Snack 1 y Snack 2 de este día."), 1)
                          ]),
                          createVNode(_component_UIcon, {
                            name: unref(snacksExpanded)[entry.day.dayOfWeek] ? "i-lucide-chevron-up" : "i-lucide-chevron-down",
                            class: "size-4 text-muted"
                          }, null, 8, ["name"])
                        ], 8, ["onClick"]),
                        unref(snacksExpanded)[entry.day.dayOfWeek] ? (openBlock(), createBlock("section", {
                          key: 0,
                          class: "grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-2"
                        }, [
                          createVNode(_component_AdminMenuSlotEditor, {
                            modelValue: entry.day.snack1,
                            "onUpdate:modelValue": ($event) => entry.day.snack1 = $event,
                            title: "Snack 1",
                            "show-sides": false,
                            "show-toggle": false,
                            "catalog-items": unref(resolvedCatalogItems),
                            class: [
                              "lg:border-r lg:border-default/70",
                              isSlotInvalid(entry.day.dayOfWeek, "snack1") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                            ]
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"]),
                          createVNode(_component_AdminMenuSlotEditor, {
                            modelValue: entry.day.snack2,
                            "onUpdate:modelValue": ($event) => entry.day.snack2 = $event,
                            title: "Snack 2",
                            "show-sides": false,
                            "show-toggle": false,
                            "catalog-items": unref(resolvedCatalogItems),
                            class: isSlotInvalid(entry.day.dayOfWeek, "snack2") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"])
                        ])) : createCommentVNode("", true)
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></section>`);
          } else {
            return [
              createVNode(_component_UCard, { ui: cardSurfaceUi }, {
                header: withCtx(() => [
                  createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                    createVNode("div", null, [
                      createVNode("h2", { class: "text-base font-semibold text-highlighted" }, " Información general "),
                      createVNode("p", { class: "mt-1 text-sm text-muted" }, " Define el nombre del menú y el rango de fechas en el que estará disponible. ")
                    ]),
                    createVNode("div", { class: "flex items-center gap-3" }, [
                      createVNode(_component_UButton, {
                        type: "submit",
                        loading: unref(loading),
                        disabled: !unref(canSubmit),
                        color: unref(canSubmit) ? "primary" : "neutral",
                        icon: "i-lucide-save"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(actionLabel)), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled", "color"]),
                      createVNode(_component_UButton, {
                        variant: unref(markAsActive) || unref(menu)?.isActive ? "soft" : "outline",
                        color: unref(markAsActive) || unref(menu)?.isActive ? "success" : "primary",
                        icon: "i-lucide-badge-check",
                        onClick: ($event) => markAsActive.value = true
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(activeActionLabel)), 1)
                        ]),
                        _: 1
                      }, 8, ["variant", "color", "onClick"])
                    ])
                  ])
                ]),
                default: withCtx(() => [
                  createVNode("div", { class: "grid gap-6 px-6 py-6 lg:grid-cols-3" }, [
                    createVNode(_component_UFormField, { name: "name" }, {
                      default: withCtx(() => [
                        createVNode(_component_AdminMetaField, {
                          label: "Nombre del menú",
                          invalid: unref(invalidFields).name
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(state).name,
                              "onUpdate:modelValue": ($event) => unref(state).name = $event,
                              placeholder: "Ej. Menú Semana 12",
                              icon: "i-lucide-notebook-pen",
                              variant: "ghost",
                              class: "w-full",
                              ui: {
                                base: "h-5 min-h-5 max-h-5 border-0 bg-transparent px-0 py-0 text-sm font-medium leading-5 text-highlighted shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
                                leading: "ps-0",
                                leadingIcon: "size-4 text-muted"
                              }
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }, 8, ["invalid"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UFormField, { name: "startDate" }, {
                      default: withCtx(() => [
                        createVNode(_component_AdminMetaField, {
                          label: "Fecha de inicio",
                          invalid: unref(invalidFields).startDate
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_DatePicker, {
                              modelValue: unref(state).startDate,
                              "onUpdate:modelValue": ($event) => unref(state).startDate = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }, 8, ["invalid"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UFormField, { name: "endDate" }, {
                      default: withCtx(() => [
                        createVNode(_component_AdminMetaField, {
                          label: "Fecha final",
                          invalid: unref(invalidFields).endDate
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_DatePicker, {
                              modelValue: unref(state).endDate,
                              "onUpdate:modelValue": ($event) => unref(state).endDate = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }, 8, ["invalid"])
                      ]),
                      _: 1
                    })
                  ])
                ]),
                _: 1
              }),
              createVNode("section", { class: "space-y-5" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(visibleDayEntries), (entry) => {
                  return openBlock(), createBlock(_component_UCard, {
                    key: entry.day.dayOfWeek,
                    variant: "subtle",
                    class: [
                      "app-surface-soft overflow-hidden",
                      isDayInvalid(entry.day.dayOfWeek) ? "ring-1 ring-error/35 border-error/50" : ""
                    ],
                    ui: { root: "app-surface-soft overflow-hidden", header: "px-5 py-4 sm:px-5", body: "p-0 sm:p-0" }
                  }, {
                    header: withCtx(() => [
                      createVNode("div", { class: "flex items-center justify-between gap-4" }, [
                        createVNode("h3", { class: "text-base font-semibold text-primary" }, toDisplayString(DAY_LABELS[entry.day.dayOfWeek]), 1)
                      ])
                    ]),
                    default: withCtx(() => [
                      createVNode("section", { class: "grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-3" }, [
                        createVNode(_component_AdminMenuSlotEditor, {
                          modelValue: entry.day.desayuno,
                          "onUpdate:modelValue": ($event) => entry.day.desayuno = $event,
                          title: "Desayuno",
                          "show-toggle": false,
                          "catalog-items": unref(resolvedCatalogItems),
                          class: [
                            "lg:border-r lg:border-default/70",
                            isSlotInvalid(entry.day.dayOfWeek, "desayuno") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                          ]
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"]),
                        createVNode(_component_AdminMenuSlotEditor, {
                          modelValue: entry.day.comida,
                          "onUpdate:modelValue": ($event) => entry.day.comida = $event,
                          title: "Comida",
                          "show-toggle": false,
                          "catalog-items": unref(resolvedCatalogItems),
                          class: [
                            "lg:border-r lg:border-default/70",
                            isSlotInvalid(entry.day.dayOfWeek, "comida") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                          ]
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"]),
                        createVNode(_component_AdminMenuSlotEditor, {
                          modelValue: entry.day.cena,
                          "onUpdate:modelValue": ($event) => entry.day.cena = $event,
                          title: "Cena",
                          "show-toggle": false,
                          "catalog-items": unref(resolvedCatalogItems),
                          class: isSlotInvalid(entry.day.dayOfWeek, "cena") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"])
                      ]),
                      createVNode("section", { class: "border-t border-default/70" }, [
                        createVNode("button", {
                          type: "button",
                          class: "flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-elevated/20",
                          onClick: ($event) => toggleSnacks(entry.day.dayOfWeek)
                        }, [
                          createVNode("span", null, [
                            createVNode("span", { class: "block text-sm font-semibold text-primary" }, "Snacks"),
                            createVNode("span", { class: "mt-1 block text-xs text-muted" }, toDisplayString(unref(snacksExpanded)[entry.day.dayOfWeek] ? "Oculta colaciones y snacks de este día." : "Muestra Snack 1 y Snack 2 de este día."), 1)
                          ]),
                          createVNode(_component_UIcon, {
                            name: unref(snacksExpanded)[entry.day.dayOfWeek] ? "i-lucide-chevron-up" : "i-lucide-chevron-down",
                            class: "size-4 text-muted"
                          }, null, 8, ["name"])
                        ], 8, ["onClick"]),
                        unref(snacksExpanded)[entry.day.dayOfWeek] ? (openBlock(), createBlock("section", {
                          key: 0,
                          class: "grid grid-cols-1 gap-0 border-t border-default/70 lg:grid-cols-2"
                        }, [
                          createVNode(_component_AdminMenuSlotEditor, {
                            modelValue: entry.day.snack1,
                            "onUpdate:modelValue": ($event) => entry.day.snack1 = $event,
                            title: "Snack 1",
                            "show-sides": false,
                            "show-toggle": false,
                            "catalog-items": unref(resolvedCatalogItems),
                            class: [
                              "lg:border-r lg:border-default/70",
                              isSlotInvalid(entry.day.dayOfWeek, "snack1") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                            ]
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"]),
                          createVNode(_component_AdminMenuSlotEditor, {
                            modelValue: entry.day.snack2,
                            "onUpdate:modelValue": ($event) => entry.day.snack2 = $event,
                            title: "Snack 2",
                            "show-sides": false,
                            "show-toggle": false,
                            "catalog-items": unref(resolvedCatalogItems),
                            class: isSlotInvalid(entry.day.dayOfWeek, "snack2") ? "bg-error/5 ring-1 ring-inset ring-error/30" : ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "catalog-items", "class"])
                        ])) : createCommentVNode("", true)
                      ])
                    ]),
                    _: 2
                  }, 1032, ["class"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/MenuForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "AdminMenuForm" });

export { __nuxt_component_2 as _ };
