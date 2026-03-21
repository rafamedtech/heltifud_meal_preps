import { _ as _sfc_main$3 } from './Input-DL0XnWnl.mjs';
import { _ as _sfc_main$4 } from './Select-CO4MAQzv.mjs';
import { _ as _sfc_main$5 } from './Skeleton-BGefXGSy.mjs';
import { u as useRoute, e as _sfc_main$g, _ as _sfc_main$a, f as useAppConfig, g as useComponentUI, t as tv, n as navigateTo, k as useLocale, m as usePortal, o as isArrayOfArray, j as _sfc_main$d, p as get, q as _sfc_main$b, r as pickLinkProps, s as _sfc_main$c, v as omit } from './server.mjs';
import { _ as _sfc_main$6, a as _sfc_main$1$1 } from './Badge-BtXv9wz2.mjs';
import { defineComponent, computed, ref, mergeProps, unref, isRef, withCtx, createTextVNode, toDisplayString, createVNode, useSlots, toRef, renderSlot, createSlots, openBlock, createBlock, createCommentVNode, renderList, Fragment, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderSlot, ssrRenderVNode } from 'vue/server-renderer';
import { D as defu } from '../nitro/nitro.mjs';
import { useForwardPropsEmits, DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuArrow } from 'reka-ui';
import { reactivePick, reactiveOmit, createReusableTemplate } from '@vueuse/core';
import { DropdownMenu } from 'reka-ui/namespaced';

const _sfc_main$2 = {
  __name: "UDropdownMenuContent",
  __ssrInlineRender: true,
  props: {
    items: { type: null, required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true },
    sub: { type: Boolean, required: false },
    labelKey: { type: null, required: true },
    descriptionKey: { type: null, required: true },
    checkedIcon: { type: null, required: false },
    loadingIcon: { type: null, required: false },
    externalIcon: { type: [Boolean, String], required: false, skipCheck: true },
    class: { type: null, required: false },
    ui: { type: null, required: true },
    uiOverride: { type: null, required: false },
    loop: { type: Boolean, required: false },
    side: { type: null, required: false },
    sideOffset: { type: Number, required: false },
    sideFlip: { type: Boolean, required: false },
    align: { type: null, required: false },
    alignOffset: { type: Number, required: false },
    alignFlip: { type: Boolean, required: false },
    avoidCollisions: { type: Boolean, required: false },
    collisionBoundary: { type: null, required: false },
    collisionPadding: { type: [Number, Object], required: false },
    arrowPadding: { type: Number, required: false },
    hideShiftedArrow: { type: Boolean, required: false },
    sticky: { type: String, required: false },
    hideWhenDetached: { type: Boolean, required: false },
    positionStrategy: { type: String, required: false },
    updatePositionStrategy: { type: String, required: false },
    disableUpdateOnLayoutShift: { type: Boolean, required: false },
    prioritizePosition: { type: Boolean, required: false },
    reference: { type: null, required: false }
  },
  emits: ["escapeKeyDown", "pointerDownOutside", "focusOutside", "interactOutside", "closeAutoFocus"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const { dir } = useLocale();
    const appConfig = useAppConfig();
    const portalProps = usePortal(toRef(() => props.portal));
    const contentProps = useForwardPropsEmits(reactiveOmit(props, "sub", "items", "portal", "labelKey", "descriptionKey", "checkedIcon", "loadingIcon", "externalIcon", "class", "ui", "uiOverride"), emits);
    const getProxySlots = () => omit(slots, ["default"]);
    const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate();
    const childrenIcon = computed(() => dir.value === "rtl" ? appConfig.ui.icons.chevronLeft : appConfig.ui.icons.chevronRight);
    const groups = computed(
      () => props.items?.length ? isArrayOfArray(props.items) ? props.items : [props.items] : []
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(DefineItemTemplate), null, {
        default: withCtx(({ item, active, index }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, item.slot || "item", {
              item,
              index,
              ui: __props.ui
            }, () => {
              ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                item,
                active,
                index,
                ui: __props.ui
              }, () => {
                if (item.loading) {
                  _push2(ssrRenderComponent(_sfc_main$g, {
                    name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                    "data-slot": "itemLeadingIcon",
                    class: __props.ui.itemLeadingIcon({ class: [__props.uiOverride?.itemLeadingIcon, item.ui?.itemLeadingIcon], color: item?.color, loading: true })
                  }, null, _parent2, _scopeId));
                } else if (item.icon) {
                  _push2(ssrRenderComponent(_sfc_main$g, {
                    name: item.icon,
                    "data-slot": "itemLeadingIcon",
                    class: __props.ui.itemLeadingIcon({ class: [__props.uiOverride?.itemLeadingIcon, item.ui?.itemLeadingIcon], color: item?.color, active })
                  }, null, _parent2, _scopeId));
                } else if (item.avatar) {
                  _push2(ssrRenderComponent(_sfc_main$d, mergeProps({
                    size: item.ui?.itemLeadingAvatarSize || __props.uiOverride?.itemLeadingAvatarSize || __props.ui.itemLeadingAvatarSize()
                  }, item.avatar, {
                    "data-slot": "itemLeadingAvatar",
                    class: __props.ui.itemLeadingAvatar({ class: [__props.uiOverride?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active })
                  }), null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              if (unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"] || (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : "item-description"])) {
                _push2(`<span data-slot="itemWrapper" class="${ssrRenderClass(__props.ui.itemWrapper({ class: [__props.uiOverride?.itemWrapper, item.ui?.itemWrapper] }))}"${_scopeId}><span data-slot="itemLabel" class="${ssrRenderClass(__props.ui.itemLabel({ class: [__props.uiOverride?.itemLabel, item.ui?.itemLabel], active }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                  item,
                  active,
                  index
                }, () => {
                  _push2(`${ssrInterpolate(unref(get)(item, props.labelKey))}`);
                }, _push2, _parent2, _scopeId);
                if (item.target === "_blank" && __props.externalIcon !== false) {
                  _push2(ssrRenderComponent(_sfc_main$g, {
                    name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                    "data-slot": "itemLabelExternalIcon",
                    class: __props.ui.itemLabelExternalIcon({ class: [__props.uiOverride?.itemLabelExternalIcon, item.ui?.itemLabelExternalIcon], color: item?.color, active })
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</span>`);
                if (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : "item-description"]) {
                  _push2(`<span data-slot="itemDescription" class="${ssrRenderClass(__props.ui.itemDescription({ class: [__props.uiOverride?.itemDescription, item.ui?.itemDescription] }))}"${_scopeId}>`);
                  ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-description` : "item-description", {
                    item,
                    active,
                    index
                  }, () => {
                    _push2(`${ssrInterpolate(unref(get)(item, props.descriptionKey))}`);
                  }, _push2, _parent2, _scopeId);
                  _push2(`</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<span data-slot="itemTrailing" class="${ssrRenderClass(__props.ui.itemTrailing({ class: [__props.uiOverride?.itemTrailing, item.ui?.itemTrailing] }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                item,
                active,
                index,
                ui: __props.ui
              }, () => {
                if (item.children?.length) {
                  _push2(ssrRenderComponent(_sfc_main$g, {
                    name: childrenIcon.value,
                    "data-slot": "itemTrailingIcon",
                    class: __props.ui.itemTrailingIcon({ class: [__props.uiOverride?.itemTrailingIcon, item.ui?.itemTrailingIcon], color: item?.color, active })
                  }, null, _parent2, _scopeId));
                } else if (item.kbds?.length) {
                  _push2(`<span data-slot="itemTrailingKbds" class="${ssrRenderClass(__props.ui.itemTrailingKbds({ class: [__props.uiOverride?.itemTrailingKbds, item.ui?.itemTrailingKbds] }))}"${_scopeId}><!--[-->`);
                  ssrRenderList(item.kbds, (kbd, kbdIndex) => {
                    _push2(ssrRenderComponent(_sfc_main$1$1, mergeProps({
                      key: kbdIndex,
                      size: item.ui?.itemTrailingKbdsSize || __props.uiOverride?.itemTrailingKbdsSize || __props.ui.itemTrailingKbdsSize()
                    }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, _parent2, _scopeId));
                  });
                  _push2(`<!--]--></span>`);
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(ssrRenderComponent(unref(DropdownMenu).ItemIndicator, { "as-child": "" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_sfc_main$g, {
                      name: __props.checkedIcon || unref(appConfig).ui.icons.check,
                      "data-slot": "itemTrailingIcon",
                      class: __props.ui.itemTrailingIcon({ class: [__props.uiOverride?.itemTrailingIcon, item.ui?.itemTrailingIcon], color: item?.color })
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_sfc_main$g, {
                        name: __props.checkedIcon || unref(appConfig).ui.icons.check,
                        "data-slot": "itemTrailingIcon",
                        class: __props.ui.itemTrailingIcon({ class: [__props.uiOverride?.itemTrailingIcon, item.ui?.itemTrailingIcon], color: item?.color })
                      }, null, 8, ["name", "class"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</span>`);
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, item.slot || "item", {
                item,
                index,
                ui: __props.ui
              }, () => [
                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                  item,
                  active,
                  index,
                  ui: __props.ui
                }, () => [
                  item.loading ? (openBlock(), createBlock(_sfc_main$g, {
                    key: 0,
                    name: __props.loadingIcon || unref(appConfig).ui.icons.loading,
                    "data-slot": "itemLeadingIcon",
                    class: __props.ui.itemLeadingIcon({ class: [__props.uiOverride?.itemLeadingIcon, item.ui?.itemLeadingIcon], color: item?.color, loading: true })
                  }, null, 8, ["name", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$g, {
                    key: 1,
                    name: item.icon,
                    "data-slot": "itemLeadingIcon",
                    class: __props.ui.itemLeadingIcon({ class: [__props.uiOverride?.itemLeadingIcon, item.ui?.itemLeadingIcon], color: item?.color, active })
                  }, null, 8, ["name", "class"])) : item.avatar ? (openBlock(), createBlock(_sfc_main$d, mergeProps({
                    key: 2,
                    size: item.ui?.itemLeadingAvatarSize || __props.uiOverride?.itemLeadingAvatarSize || __props.ui.itemLeadingAvatarSize()
                  }, item.avatar, {
                    "data-slot": "itemLeadingAvatar",
                    class: __props.ui.itemLeadingAvatar({ class: [__props.uiOverride?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active })
                  }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                ]),
                unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"] || (unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : "item-description"]) ? (openBlock(), createBlock("span", {
                  key: 0,
                  "data-slot": "itemWrapper",
                  class: __props.ui.itemWrapper({ class: [__props.uiOverride?.itemWrapper, item.ui?.itemWrapper] })
                }, [
                  createVNode("span", {
                    "data-slot": "itemLabel",
                    class: __props.ui.itemLabel({ class: [__props.uiOverride?.itemLabel, item.ui?.itemLabel], active })
                  }, [
                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                      item,
                      active,
                      index
                    }, () => [
                      createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                    ]),
                    item.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$g, {
                      key: 0,
                      name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                      "data-slot": "itemLabelExternalIcon",
                      class: __props.ui.itemLabelExternalIcon({ class: [__props.uiOverride?.itemLabelExternalIcon, item.ui?.itemLabelExternalIcon], color: item?.color, active })
                    }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                  ], 2),
                  unref(get)(item, props.descriptionKey) || !!slots[item.slot ? `${item.slot}-description` : "item-description"] ? (openBlock(), createBlock("span", {
                    key: 0,
                    "data-slot": "itemDescription",
                    class: __props.ui.itemDescription({ class: [__props.uiOverride?.itemDescription, item.ui?.itemDescription] })
                  }, [
                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-description` : "item-description", {
                      item,
                      active,
                      index
                    }, () => [
                      createTextVNode(toDisplayString(unref(get)(item, props.descriptionKey)), 1)
                    ])
                  ], 2)) : createCommentVNode("", true)
                ], 2)) : createCommentVNode("", true),
                createVNode("span", {
                  "data-slot": "itemTrailing",
                  class: __props.ui.itemTrailing({ class: [__props.uiOverride?.itemTrailing, item.ui?.itemTrailing] })
                }, [
                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                    item,
                    active,
                    index,
                    ui: __props.ui
                  }, () => [
                    item.children?.length ? (openBlock(), createBlock(_sfc_main$g, {
                      key: 0,
                      name: childrenIcon.value,
                      "data-slot": "itemTrailingIcon",
                      class: __props.ui.itemTrailingIcon({ class: [__props.uiOverride?.itemTrailingIcon, item.ui?.itemTrailingIcon], color: item?.color, active })
                    }, null, 8, ["name", "class"])) : item.kbds?.length ? (openBlock(), createBlock("span", {
                      key: 1,
                      "data-slot": "itemTrailingKbds",
                      class: __props.ui.itemTrailingKbds({ class: [__props.uiOverride?.itemTrailingKbds, item.ui?.itemTrailingKbds] })
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(item.kbds, (kbd, kbdIndex) => {
                        return openBlock(), createBlock(_sfc_main$1$1, mergeProps({
                          key: kbdIndex,
                          size: item.ui?.itemTrailingKbdsSize || __props.uiOverride?.itemTrailingKbdsSize || __props.ui.itemTrailingKbdsSize()
                        }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                      }), 128))
                    ], 2)) : createCommentVNode("", true)
                  ]),
                  createVNode(unref(DropdownMenu).ItemIndicator, { "as-child": "" }, {
                    default: withCtx(() => [
                      createVNode(_sfc_main$g, {
                        name: __props.checkedIcon || unref(appConfig).ui.icons.check,
                        "data-slot": "itemTrailingIcon",
                        class: __props.ui.itemTrailingIcon({ class: [__props.uiOverride?.itemTrailingIcon, item.ui?.itemTrailingIcon], color: item?.color })
                      }, null, 8, ["name", "class"])
                    ]),
                    _: 2
                  }, 1024)
                ], 2)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(ssrRenderComponent(unref(DropdownMenu).Portal, unref(portalProps), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(__props.sub ? unref(DropdownMenu).SubContent : unref(DropdownMenu).Content), mergeProps({
              "data-slot": "content",
              class: __props.ui.content({ class: [__props.uiOverride?.content, props.class] })
            }, unref(contentProps)), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "content-top", {
                    sub: __props.sub ?? false
                  }, null, _push3, _parent3, _scopeId2);
                  _push3(`<div role="presentation" data-slot="viewport" class="${ssrRenderClass(__props.ui.viewport({ class: __props.uiOverride?.viewport }))}"${_scopeId2}><!--[-->`);
                  ssrRenderList(groups.value, (group, groupIndex) => {
                    _push3(ssrRenderComponent(unref(DropdownMenu).Group, {
                      key: `group-${groupIndex}`,
                      "data-slot": "group",
                      class: __props.ui.group({ class: __props.uiOverride?.group })
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<!--[-->`);
                          ssrRenderList(group, (item, index) => {
                            _push4(`<!--[-->`);
                            if (item.type === "label") {
                              _push4(ssrRenderComponent(unref(DropdownMenu).Label, {
                                "data-slot": "label",
                                class: __props.ui.label({ class: [__props.uiOverride?.label, item.ui?.label, item.class] })
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(ssrRenderComponent(unref(ReuseItemTemplate), {
                                      item,
                                      index
                                    }, null, _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createVNode(unref(ReuseItemTemplate), {
                                        item,
                                        index
                                      }, null, 8, ["item", "index"])
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            } else if (item.type === "separator") {
                              _push4(ssrRenderComponent(unref(DropdownMenu).Separator, {
                                "data-slot": "separator",
                                class: __props.ui.separator({ class: [__props.uiOverride?.separator, item.ui?.separator, item.class] })
                              }, null, _parent4, _scopeId3));
                            } else if (item?.children?.length) {
                              _push4(ssrRenderComponent(unref(DropdownMenu).Sub, {
                                open: item.open,
                                "default-open": item.defaultOpen
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(ssrRenderComponent(unref(DropdownMenu).SubTrigger, {
                                      as: "button",
                                      type: "button",
                                      disabled: item.disabled,
                                      "text-value": unref(get)(item, props.labelKey),
                                      "data-slot": "item",
                                      class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color })
                                    }, {
                                      default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent(unref(ReuseItemTemplate), {
                                            item,
                                            index
                                          }, null, _parent6, _scopeId5));
                                        } else {
                                          return [
                                            createVNode(unref(ReuseItemTemplate), {
                                              item,
                                              index
                                            }, null, 8, ["item", "index"])
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                    _push5(ssrRenderComponent(_sfc_main$2, mergeProps({
                                      sub: "",
                                      class: item.ui?.content,
                                      ui: __props.ui,
                                      "ui-override": __props.uiOverride,
                                      portal: __props.portal,
                                      items: item.children,
                                      align: "start",
                                      "align-offset": -4,
                                      "side-offset": 3,
                                      "label-key": __props.labelKey,
                                      "description-key": __props.descriptionKey,
                                      "checked-icon": __props.checkedIcon,
                                      "loading-icon": __props.loadingIcon,
                                      "external-icon": __props.externalIcon
                                    }, { ref_for: true }, item.content), createSlots({ _: 2 }, [
                                      renderList(getProxySlots(), (_5, name) => {
                                        return {
                                          name,
                                          fn: withCtx((slotData, _push6, _parent6, _scopeId5) => {
                                            if (_push6) {
                                              ssrRenderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData), null, _push6, _parent6, _scopeId5);
                                            } else {
                                              return [
                                                renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData))
                                              ];
                                            }
                                          })
                                        };
                                      })
                                    ]), _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createVNode(unref(DropdownMenu).SubTrigger, {
                                        as: "button",
                                        type: "button",
                                        disabled: item.disabled,
                                        "text-value": unref(get)(item, props.labelKey),
                                        "data-slot": "item",
                                        class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color })
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(unref(ReuseItemTemplate), {
                                            item,
                                            index
                                          }, null, 8, ["item", "index"])
                                        ]),
                                        _: 2
                                      }, 1032, ["disabled", "text-value", "class"]),
                                      createVNode(_sfc_main$2, mergeProps({
                                        sub: "",
                                        class: item.ui?.content,
                                        ui: __props.ui,
                                        "ui-override": __props.uiOverride,
                                        portal: __props.portal,
                                        items: item.children,
                                        align: "start",
                                        "align-offset": -4,
                                        "side-offset": 3,
                                        "label-key": __props.labelKey,
                                        "description-key": __props.descriptionKey,
                                        "checked-icon": __props.checkedIcon,
                                        "loading-icon": __props.loadingIcon,
                                        "external-icon": __props.externalIcon
                                      }, { ref_for: true }, item.content), createSlots({ _: 2 }, [
                                        renderList(getProxySlots(), (_5, name) => {
                                          return {
                                            name,
                                            fn: withCtx((slotData) => [
                                              renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData))
                                            ])
                                          };
                                        })
                                      ]), 1040, ["class", "ui", "ui-override", "portal", "items", "label-key", "description-key", "checked-icon", "loading-icon", "external-icon"])
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            } else if (item.type === "checkbox") {
                              _push4(ssrRenderComponent(unref(DropdownMenu).CheckboxItem, {
                                "model-value": item.checked,
                                disabled: item.disabled,
                                "text-value": unref(get)(item, props.labelKey),
                                "data-slot": "item",
                                class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color }),
                                "onUpdate:modelValue": item.onUpdateChecked,
                                onSelect: item.onSelect
                              }, {
                                default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(ssrRenderComponent(unref(ReuseItemTemplate), {
                                      item,
                                      index
                                    }, null, _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createVNode(unref(ReuseItemTemplate), {
                                        item,
                                        index
                                      }, null, 8, ["item", "index"])
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            } else {
                              _push4(ssrRenderComponent(_sfc_main$b, mergeProps({ ref_for: true }, unref(pickLinkProps)(item), { custom: "" }), {
                                default: withCtx(({ active, ...slotProps }, _push5, _parent5, _scopeId4) => {
                                  if (_push5) {
                                    _push5(ssrRenderComponent(unref(DropdownMenu).Item, {
                                      "as-child": "",
                                      disabled: item.disabled,
                                      "text-value": unref(get)(item, props.labelKey),
                                      onSelect: item.onSelect
                                    }, {
                                      default: withCtx((_4, _push6, _parent6, _scopeId5) => {
                                        if (_push6) {
                                          _push6(ssrRenderComponent(_sfc_main$c, mergeProps({ ref_for: true }, slotProps, {
                                            "data-slot": "item",
                                            class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color, active })
                                          }), {
                                            default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                              if (_push7) {
                                                _push7(ssrRenderComponent(unref(ReuseItemTemplate), {
                                                  item,
                                                  active,
                                                  index
                                                }, null, _parent7, _scopeId6));
                                              } else {
                                                return [
                                                  createVNode(unref(ReuseItemTemplate), {
                                                    item,
                                                    active,
                                                    index
                                                  }, null, 8, ["item", "active", "index"])
                                                ];
                                              }
                                            }),
                                            _: 2
                                          }, _parent6, _scopeId5));
                                        } else {
                                          return [
                                            createVNode(_sfc_main$c, mergeProps({ ref_for: true }, slotProps, {
                                              "data-slot": "item",
                                              class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color, active })
                                            }), {
                                              default: withCtx(() => [
                                                createVNode(unref(ReuseItemTemplate), {
                                                  item,
                                                  active,
                                                  index
                                                }, null, 8, ["item", "active", "index"])
                                              ]),
                                              _: 2
                                            }, 1040, ["class"])
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent5, _scopeId4));
                                  } else {
                                    return [
                                      createVNode(unref(DropdownMenu).Item, {
                                        "as-child": "",
                                        disabled: item.disabled,
                                        "text-value": unref(get)(item, props.labelKey),
                                        onSelect: item.onSelect
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(_sfc_main$c, mergeProps({ ref_for: true }, slotProps, {
                                            "data-slot": "item",
                                            class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color, active })
                                          }), {
                                            default: withCtx(() => [
                                              createVNode(unref(ReuseItemTemplate), {
                                                item,
                                                active,
                                                index
                                              }, null, 8, ["item", "active", "index"])
                                            ]),
                                            _: 2
                                          }, 1040, ["class"])
                                        ]),
                                        _: 2
                                      }, 1032, ["disabled", "text-value", "onSelect"])
                                    ];
                                  }
                                }),
                                _: 2
                              }, _parent4, _scopeId3));
                            }
                            _push4(`<!--]-->`);
                          });
                          _push4(`<!--]-->`);
                        } else {
                          return [
                            (openBlock(true), createBlock(Fragment, null, renderList(group, (item, index) => {
                              return openBlock(), createBlock(Fragment, {
                                key: `group-${groupIndex}-${index}`
                              }, [
                                item.type === "label" ? (openBlock(), createBlock(unref(DropdownMenu).Label, {
                                  key: 0,
                                  "data-slot": "label",
                                  class: __props.ui.label({ class: [__props.uiOverride?.label, item.ui?.label, item.class] })
                                }, {
                                  default: withCtx(() => [
                                    createVNode(unref(ReuseItemTemplate), {
                                      item,
                                      index
                                    }, null, 8, ["item", "index"])
                                  ]),
                                  _: 2
                                }, 1032, ["class"])) : item.type === "separator" ? (openBlock(), createBlock(unref(DropdownMenu).Separator, {
                                  key: 1,
                                  "data-slot": "separator",
                                  class: __props.ui.separator({ class: [__props.uiOverride?.separator, item.ui?.separator, item.class] })
                                }, null, 8, ["class"])) : item?.children?.length ? (openBlock(), createBlock(unref(DropdownMenu).Sub, {
                                  key: 2,
                                  open: item.open,
                                  "default-open": item.defaultOpen
                                }, {
                                  default: withCtx(() => [
                                    createVNode(unref(DropdownMenu).SubTrigger, {
                                      as: "button",
                                      type: "button",
                                      disabled: item.disabled,
                                      "text-value": unref(get)(item, props.labelKey),
                                      "data-slot": "item",
                                      class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color })
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(unref(ReuseItemTemplate), {
                                          item,
                                          index
                                        }, null, 8, ["item", "index"])
                                      ]),
                                      _: 2
                                    }, 1032, ["disabled", "text-value", "class"]),
                                    createVNode(_sfc_main$2, mergeProps({
                                      sub: "",
                                      class: item.ui?.content,
                                      ui: __props.ui,
                                      "ui-override": __props.uiOverride,
                                      portal: __props.portal,
                                      items: item.children,
                                      align: "start",
                                      "align-offset": -4,
                                      "side-offset": 3,
                                      "label-key": __props.labelKey,
                                      "description-key": __props.descriptionKey,
                                      "checked-icon": __props.checkedIcon,
                                      "loading-icon": __props.loadingIcon,
                                      "external-icon": __props.externalIcon
                                    }, { ref_for: true }, item.content), createSlots({ _: 2 }, [
                                      renderList(getProxySlots(), (_4, name) => {
                                        return {
                                          name,
                                          fn: withCtx((slotData) => [
                                            renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData))
                                          ])
                                        };
                                      })
                                    ]), 1040, ["class", "ui", "ui-override", "portal", "items", "label-key", "description-key", "checked-icon", "loading-icon", "external-icon"])
                                  ]),
                                  _: 2
                                }, 1032, ["open", "default-open"])) : item.type === "checkbox" ? (openBlock(), createBlock(unref(DropdownMenu).CheckboxItem, {
                                  key: 3,
                                  "model-value": item.checked,
                                  disabled: item.disabled,
                                  "text-value": unref(get)(item, props.labelKey),
                                  "data-slot": "item",
                                  class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color }),
                                  "onUpdate:modelValue": item.onUpdateChecked,
                                  onSelect: item.onSelect
                                }, {
                                  default: withCtx(() => [
                                    createVNode(unref(ReuseItemTemplate), {
                                      item,
                                      index
                                    }, null, 8, ["item", "index"])
                                  ]),
                                  _: 2
                                }, 1032, ["model-value", "disabled", "text-value", "class", "onUpdate:modelValue", "onSelect"])) : (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                  key: 4,
                                  ref_for: true
                                }, unref(pickLinkProps)(item), { custom: "" }), {
                                  default: withCtx(({ active, ...slotProps }) => [
                                    createVNode(unref(DropdownMenu).Item, {
                                      "as-child": "",
                                      disabled: item.disabled,
                                      "text-value": unref(get)(item, props.labelKey),
                                      onSelect: item.onSelect
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_sfc_main$c, mergeProps({ ref_for: true }, slotProps, {
                                          "data-slot": "item",
                                          class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color, active })
                                        }), {
                                          default: withCtx(() => [
                                            createVNode(unref(ReuseItemTemplate), {
                                              item,
                                              active,
                                              index
                                            }, null, 8, ["item", "active", "index"])
                                          ]),
                                          _: 2
                                        }, 1040, ["class"])
                                      ]),
                                      _: 2
                                    }, 1032, ["disabled", "text-value", "onSelect"])
                                  ]),
                                  _: 2
                                }, 1040))
                              ], 64);
                            }), 128))
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  });
                  _push3(`<!--]--></div>`);
                  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                  ssrRenderSlot(_ctx.$slots, "content-bottom", {
                    sub: __props.sub ?? false
                  }, null, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    renderSlot(_ctx.$slots, "content-top", {
                      sub: __props.sub ?? false
                    }),
                    createVNode("div", {
                      role: "presentation",
                      "data-slot": "viewport",
                      class: __props.ui.viewport({ class: __props.uiOverride?.viewport })
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(groups.value, (group, groupIndex) => {
                        return openBlock(), createBlock(unref(DropdownMenu).Group, {
                          key: `group-${groupIndex}`,
                          "data-slot": "group",
                          class: __props.ui.group({ class: __props.uiOverride?.group })
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createBlock(Fragment, null, renderList(group, (item, index) => {
                              return openBlock(), createBlock(Fragment, {
                                key: `group-${groupIndex}-${index}`
                              }, [
                                item.type === "label" ? (openBlock(), createBlock(unref(DropdownMenu).Label, {
                                  key: 0,
                                  "data-slot": "label",
                                  class: __props.ui.label({ class: [__props.uiOverride?.label, item.ui?.label, item.class] })
                                }, {
                                  default: withCtx(() => [
                                    createVNode(unref(ReuseItemTemplate), {
                                      item,
                                      index
                                    }, null, 8, ["item", "index"])
                                  ]),
                                  _: 2
                                }, 1032, ["class"])) : item.type === "separator" ? (openBlock(), createBlock(unref(DropdownMenu).Separator, {
                                  key: 1,
                                  "data-slot": "separator",
                                  class: __props.ui.separator({ class: [__props.uiOverride?.separator, item.ui?.separator, item.class] })
                                }, null, 8, ["class"])) : item?.children?.length ? (openBlock(), createBlock(unref(DropdownMenu).Sub, {
                                  key: 2,
                                  open: item.open,
                                  "default-open": item.defaultOpen
                                }, {
                                  default: withCtx(() => [
                                    createVNode(unref(DropdownMenu).SubTrigger, {
                                      as: "button",
                                      type: "button",
                                      disabled: item.disabled,
                                      "text-value": unref(get)(item, props.labelKey),
                                      "data-slot": "item",
                                      class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color })
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(unref(ReuseItemTemplate), {
                                          item,
                                          index
                                        }, null, 8, ["item", "index"])
                                      ]),
                                      _: 2
                                    }, 1032, ["disabled", "text-value", "class"]),
                                    createVNode(_sfc_main$2, mergeProps({
                                      sub: "",
                                      class: item.ui?.content,
                                      ui: __props.ui,
                                      "ui-override": __props.uiOverride,
                                      portal: __props.portal,
                                      items: item.children,
                                      align: "start",
                                      "align-offset": -4,
                                      "side-offset": 3,
                                      "label-key": __props.labelKey,
                                      "description-key": __props.descriptionKey,
                                      "checked-icon": __props.checkedIcon,
                                      "loading-icon": __props.loadingIcon,
                                      "external-icon": __props.externalIcon
                                    }, { ref_for: true }, item.content), createSlots({ _: 2 }, [
                                      renderList(getProxySlots(), (_3, name) => {
                                        return {
                                          name,
                                          fn: withCtx((slotData) => [
                                            renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData))
                                          ])
                                        };
                                      })
                                    ]), 1040, ["class", "ui", "ui-override", "portal", "items", "label-key", "description-key", "checked-icon", "loading-icon", "external-icon"])
                                  ]),
                                  _: 2
                                }, 1032, ["open", "default-open"])) : item.type === "checkbox" ? (openBlock(), createBlock(unref(DropdownMenu).CheckboxItem, {
                                  key: 3,
                                  "model-value": item.checked,
                                  disabled: item.disabled,
                                  "text-value": unref(get)(item, props.labelKey),
                                  "data-slot": "item",
                                  class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color }),
                                  "onUpdate:modelValue": item.onUpdateChecked,
                                  onSelect: item.onSelect
                                }, {
                                  default: withCtx(() => [
                                    createVNode(unref(ReuseItemTemplate), {
                                      item,
                                      index
                                    }, null, 8, ["item", "index"])
                                  ]),
                                  _: 2
                                }, 1032, ["model-value", "disabled", "text-value", "class", "onUpdate:modelValue", "onSelect"])) : (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                  key: 4,
                                  ref_for: true
                                }, unref(pickLinkProps)(item), { custom: "" }), {
                                  default: withCtx(({ active, ...slotProps }) => [
                                    createVNode(unref(DropdownMenu).Item, {
                                      "as-child": "",
                                      disabled: item.disabled,
                                      "text-value": unref(get)(item, props.labelKey),
                                      onSelect: item.onSelect
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_sfc_main$c, mergeProps({ ref_for: true }, slotProps, {
                                          "data-slot": "item",
                                          class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color, active })
                                        }), {
                                          default: withCtx(() => [
                                            createVNode(unref(ReuseItemTemplate), {
                                              item,
                                              active,
                                              index
                                            }, null, 8, ["item", "active", "index"])
                                          ]),
                                          _: 2
                                        }, 1040, ["class"])
                                      ]),
                                      _: 2
                                    }, 1032, ["disabled", "text-value", "onSelect"])
                                  ]),
                                  _: 2
                                }, 1040))
                              ], 64);
                            }), 128))
                          ]),
                          _: 2
                        }, 1032, ["class"]);
                      }), 128))
                    ], 2),
                    renderSlot(_ctx.$slots, "default"),
                    renderSlot(_ctx.$slots, "content-bottom", {
                      sub: __props.sub ?? false
                    })
                  ];
                }
              }),
              _: 3
            }), _parent2, _scopeId);
          } else {
            return [
              (openBlock(), createBlock(resolveDynamicComponent(__props.sub ? unref(DropdownMenu).SubContent : unref(DropdownMenu).Content), mergeProps({
                "data-slot": "content",
                class: __props.ui.content({ class: [__props.uiOverride?.content, props.class] })
              }, unref(contentProps)), {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "content-top", {
                    sub: __props.sub ?? false
                  }),
                  createVNode("div", {
                    role: "presentation",
                    "data-slot": "viewport",
                    class: __props.ui.viewport({ class: __props.uiOverride?.viewport })
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(groups.value, (group, groupIndex) => {
                      return openBlock(), createBlock(unref(DropdownMenu).Group, {
                        key: `group-${groupIndex}`,
                        "data-slot": "group",
                        class: __props.ui.group({ class: __props.uiOverride?.group })
                      }, {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(group, (item, index) => {
                            return openBlock(), createBlock(Fragment, {
                              key: `group-${groupIndex}-${index}`
                            }, [
                              item.type === "label" ? (openBlock(), createBlock(unref(DropdownMenu).Label, {
                                key: 0,
                                "data-slot": "label",
                                class: __props.ui.label({ class: [__props.uiOverride?.label, item.ui?.label, item.class] })
                              }, {
                                default: withCtx(() => [
                                  createVNode(unref(ReuseItemTemplate), {
                                    item,
                                    index
                                  }, null, 8, ["item", "index"])
                                ]),
                                _: 2
                              }, 1032, ["class"])) : item.type === "separator" ? (openBlock(), createBlock(unref(DropdownMenu).Separator, {
                                key: 1,
                                "data-slot": "separator",
                                class: __props.ui.separator({ class: [__props.uiOverride?.separator, item.ui?.separator, item.class] })
                              }, null, 8, ["class"])) : item?.children?.length ? (openBlock(), createBlock(unref(DropdownMenu).Sub, {
                                key: 2,
                                open: item.open,
                                "default-open": item.defaultOpen
                              }, {
                                default: withCtx(() => [
                                  createVNode(unref(DropdownMenu).SubTrigger, {
                                    as: "button",
                                    type: "button",
                                    disabled: item.disabled,
                                    "text-value": unref(get)(item, props.labelKey),
                                    "data-slot": "item",
                                    class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color })
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(unref(ReuseItemTemplate), {
                                        item,
                                        index
                                      }, null, 8, ["item", "index"])
                                    ]),
                                    _: 2
                                  }, 1032, ["disabled", "text-value", "class"]),
                                  createVNode(_sfc_main$2, mergeProps({
                                    sub: "",
                                    class: item.ui?.content,
                                    ui: __props.ui,
                                    "ui-override": __props.uiOverride,
                                    portal: __props.portal,
                                    items: item.children,
                                    align: "start",
                                    "align-offset": -4,
                                    "side-offset": 3,
                                    "label-key": __props.labelKey,
                                    "description-key": __props.descriptionKey,
                                    "checked-icon": __props.checkedIcon,
                                    "loading-icon": __props.loadingIcon,
                                    "external-icon": __props.externalIcon
                                  }, { ref_for: true }, item.content), createSlots({ _: 2 }, [
                                    renderList(getProxySlots(), (_2, name) => {
                                      return {
                                        name,
                                        fn: withCtx((slotData) => [
                                          renderSlot(_ctx.$slots, name, mergeProps({ ref_for: true }, slotData))
                                        ])
                                      };
                                    })
                                  ]), 1040, ["class", "ui", "ui-override", "portal", "items", "label-key", "description-key", "checked-icon", "loading-icon", "external-icon"])
                                ]),
                                _: 2
                              }, 1032, ["open", "default-open"])) : item.type === "checkbox" ? (openBlock(), createBlock(unref(DropdownMenu).CheckboxItem, {
                                key: 3,
                                "model-value": item.checked,
                                disabled: item.disabled,
                                "text-value": unref(get)(item, props.labelKey),
                                "data-slot": "item",
                                class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color }),
                                "onUpdate:modelValue": item.onUpdateChecked,
                                onSelect: item.onSelect
                              }, {
                                default: withCtx(() => [
                                  createVNode(unref(ReuseItemTemplate), {
                                    item,
                                    index
                                  }, null, 8, ["item", "index"])
                                ]),
                                _: 2
                              }, 1032, ["model-value", "disabled", "text-value", "class", "onUpdate:modelValue", "onSelect"])) : (openBlock(), createBlock(_sfc_main$b, mergeProps({
                                key: 4,
                                ref_for: true
                              }, unref(pickLinkProps)(item), { custom: "" }), {
                                default: withCtx(({ active, ...slotProps }) => [
                                  createVNode(unref(DropdownMenu).Item, {
                                    "as-child": "",
                                    disabled: item.disabled,
                                    "text-value": unref(get)(item, props.labelKey),
                                    onSelect: item.onSelect
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_sfc_main$c, mergeProps({ ref_for: true }, slotProps, {
                                        "data-slot": "item",
                                        class: __props.ui.item({ class: [__props.uiOverride?.item, item.ui?.item, item.class], color: item?.color, active })
                                      }), {
                                        default: withCtx(() => [
                                          createVNode(unref(ReuseItemTemplate), {
                                            item,
                                            active,
                                            index
                                          }, null, 8, ["item", "active", "index"])
                                        ]),
                                        _: 2
                                      }, 1040, ["class"])
                                    ]),
                                    _: 2
                                  }, 1032, ["disabled", "text-value", "onSelect"])
                                ]),
                                _: 2
                              }, 1040))
                            ], 64);
                          }), 128))
                        ]),
                        _: 2
                      }, 1032, ["class"]);
                    }), 128))
                  ], 2),
                  renderSlot(_ctx.$slots, "default"),
                  renderSlot(_ctx.$slots, "content-bottom", {
                    sub: __props.sub ?? false
                  })
                ]),
                _: 3
              }, 16, ["class"]))
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.5.1_@tiptap+extensions@3.20.4_@tiptap+core@3.20.4_@tiptap+pm@3.20.4__@tiptap_e4a31b51003d92b668867b8854240143/node_modules/@nuxt/ui/dist/runtime/components/DropdownMenuContent.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "content": "min-w-32 bg-default shadow-lg rounded-md ring ring-default overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-dropdown-menu-content-transform-origin) flex flex-col",
    "viewport": "relative divide-y divide-default scroll-py-1 overflow-y-auto flex-1",
    "arrow": "fill-bg stroke-default",
    "group": "p-1 isolate",
    "label": "w-full flex items-center font-semibold text-highlighted",
    "separator": "-mx-1 my-1 h-px bg-border",
    "item": "group relative w-full flex items-start select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75",
    "itemLeadingIcon": "shrink-0",
    "itemLeadingAvatar": "shrink-0",
    "itemLeadingAvatarSize": "",
    "itemTrailing": "ms-auto inline-flex gap-1.5 items-center",
    "itemTrailingIcon": "shrink-0",
    "itemTrailingKbds": "hidden lg:inline-flex items-center shrink-0",
    "itemTrailingKbdsSize": "",
    "itemWrapper": "flex-1 flex flex-col text-start min-w-0",
    "itemLabel": "truncate",
    "itemDescription": "truncate text-muted",
    "itemLabelExternalIcon": "inline-block size-3 align-top text-dimmed"
  },
  "variants": {
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "active": {
      "true": {
        "item": "text-highlighted before:bg-elevated",
        "itemLeadingIcon": "text-default"
      },
      "false": {
        "item": [
          "text-default data-highlighted:text-highlighted data-[state=open]:text-highlighted data-highlighted:before:bg-elevated/50 data-[state=open]:before:bg-elevated/50",
          "transition-colors before:transition-colors"
        ],
        "itemLeadingIcon": [
          "text-dimmed group-data-highlighted:text-default group-data-[state=open]:text-default",
          "transition-colors"
        ]
      }
    },
    "loading": {
      "true": {
        "itemLeadingIcon": "animate-spin"
      }
    },
    "size": {
      "xs": {
        "label": "p-1 text-xs gap-1",
        "item": "p-1 text-xs gap-1",
        "itemLeadingIcon": "size-4",
        "itemLeadingAvatarSize": "3xs",
        "itemTrailingIcon": "size-4",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "sm"
      },
      "sm": {
        "label": "p-1.5 text-xs gap-1.5",
        "item": "p-1.5 text-xs gap-1.5",
        "itemLeadingIcon": "size-4",
        "itemLeadingAvatarSize": "3xs",
        "itemTrailingIcon": "size-4",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "sm"
      },
      "md": {
        "label": "p-1.5 text-sm gap-1.5",
        "item": "p-1.5 text-sm gap-1.5",
        "itemLeadingIcon": "size-5",
        "itemLeadingAvatarSize": "2xs",
        "itemTrailingIcon": "size-5",
        "itemTrailingKbds": "gap-0.5",
        "itemTrailingKbdsSize": "md"
      },
      "lg": {
        "label": "p-2 text-sm gap-2",
        "item": "p-2 text-sm gap-2",
        "itemLeadingIcon": "size-5",
        "itemLeadingAvatarSize": "2xs",
        "itemTrailingIcon": "size-5",
        "itemTrailingKbds": "gap-1",
        "itemTrailingKbdsSize": "md"
      },
      "xl": {
        "label": "p-2 text-base gap-2",
        "item": "p-2 text-base gap-2",
        "itemLeadingIcon": "size-6",
        "itemLeadingAvatarSize": "xs",
        "itemTrailingIcon": "size-6",
        "itemTrailingKbds": "gap-1",
        "itemTrailingKbdsSize": "lg"
      }
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "active": false,
      "class": {
        "item": "text-primary data-highlighted:text-primary data-highlighted:before:bg-primary/10 data-[state=open]:before:bg-primary/10",
        "itemLeadingIcon": "text-primary/75 group-data-highlighted:text-primary group-data-[state=open]:text-primary"
      }
    },
    {
      "color": "secondary",
      "active": false,
      "class": {
        "item": "text-secondary data-highlighted:text-secondary data-highlighted:before:bg-secondary/10 data-[state=open]:before:bg-secondary/10",
        "itemLeadingIcon": "text-secondary/75 group-data-highlighted:text-secondary group-data-[state=open]:text-secondary"
      }
    },
    {
      "color": "success",
      "active": false,
      "class": {
        "item": "text-success data-highlighted:text-success data-highlighted:before:bg-success/10 data-[state=open]:before:bg-success/10",
        "itemLeadingIcon": "text-success/75 group-data-highlighted:text-success group-data-[state=open]:text-success"
      }
    },
    {
      "color": "info",
      "active": false,
      "class": {
        "item": "text-info data-highlighted:text-info data-highlighted:before:bg-info/10 data-[state=open]:before:bg-info/10",
        "itemLeadingIcon": "text-info/75 group-data-highlighted:text-info group-data-[state=open]:text-info"
      }
    },
    {
      "color": "warning",
      "active": false,
      "class": {
        "item": "text-warning data-highlighted:text-warning data-highlighted:before:bg-warning/10 data-[state=open]:before:bg-warning/10",
        "itemLeadingIcon": "text-warning/75 group-data-highlighted:text-warning group-data-[state=open]:text-warning"
      }
    },
    {
      "color": "error",
      "active": false,
      "class": {
        "item": "text-error data-highlighted:text-error data-highlighted:before:bg-error/10 data-[state=open]:before:bg-error/10",
        "itemLeadingIcon": "text-error/75 group-data-highlighted:text-error group-data-[state=open]:text-error"
      }
    },
    {
      "color": "primary",
      "active": true,
      "class": {
        "item": "text-primary before:bg-primary/10",
        "itemLeadingIcon": "text-primary"
      }
    },
    {
      "color": "secondary",
      "active": true,
      "class": {
        "item": "text-secondary before:bg-secondary/10",
        "itemLeadingIcon": "text-secondary"
      }
    },
    {
      "color": "success",
      "active": true,
      "class": {
        "item": "text-success before:bg-success/10",
        "itemLeadingIcon": "text-success"
      }
    },
    {
      "color": "info",
      "active": true,
      "class": {
        "item": "text-info before:bg-info/10",
        "itemLeadingIcon": "text-info"
      }
    },
    {
      "color": "warning",
      "active": true,
      "class": {
        "item": "text-warning before:bg-warning/10",
        "itemLeadingIcon": "text-warning"
      }
    },
    {
      "color": "error",
      "active": true,
      "class": {
        "item": "text-error before:bg-error/10",
        "itemLeadingIcon": "text-error"
      }
    }
  ],
  "defaultVariants": {
    "size": "md"
  }
};
const _sfc_main$1 = {
  __name: "UDropdownMenu",
  __ssrInlineRender: true,
  props: {
    size: { type: null, required: false },
    items: { type: null, required: false },
    checkedIcon: { type: null, required: false },
    loadingIcon: { type: null, required: false },
    externalIcon: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    content: { type: Object, required: false },
    arrow: { type: [Boolean, Object], required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    labelKey: { type: null, required: false, default: "label" },
    descriptionKey: { type: null, required: false, default: "description" },
    disabled: { type: Boolean, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    modal: { type: Boolean, required: false, default: true }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("dropdownMenu", props);
    const rootProps = useForwardPropsEmits(reactivePick(props, "defaultOpen", "open", "modal"), emits);
    const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }));
    const arrowProps = toRef(() => defu(props.arrow, { rounded: true }));
    const getProxySlots = () => omit(slots, ["default"]);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.dropdownMenu || {} })({
      size: props.size
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuRoot), mergeProps(unref(rootProps), _attrs), {
        default: withCtx(({ open }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.default) {
              _push2(ssrRenderComponent(unref(DropdownMenuTrigger), {
                "as-child": "",
                class: props.class,
                disabled: __props.disabled
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_sfc_main$2, mergeProps({
              class: ui.value.content({ class: [!slots.default && props.class, unref(uiProp)?.content] }),
              ui: ui.value,
              "ui-override": unref(uiProp)
            }, contentProps.value, {
              items: __props.items,
              portal: __props.portal,
              "label-key": __props.labelKey,
              "description-key": __props.descriptionKey,
              "checked-icon": __props.checkedIcon,
              "loading-icon": __props.loadingIcon,
              "external-icon": __props.externalIcon
            }), createSlots({
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (!!__props.arrow) {
                    _push3(ssrRenderComponent(unref(DropdownMenuArrow), mergeProps(arrowProps.value, {
                      "data-slot": "arrow",
                      class: ui.value.arrow({ class: unref(uiProp)?.arrow })
                    }), null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    !!__props.arrow ? (openBlock(), createBlock(unref(DropdownMenuArrow), mergeProps({ key: 0 }, arrowProps.value, {
                      "data-slot": "arrow",
                      class: ui.value.arrow({ class: unref(uiProp)?.arrow })
                    }), null, 16, ["class"])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, [
              renderList(getProxySlots(), (_, name) => {
                return {
                  name,
                  fn: withCtx((slotData, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, name, slotData, null, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, name, slotData)
                      ];
                    }
                  })
                };
              })
            ]), _parent2, _scopeId));
          } else {
            return [
              !!slots.default ? (openBlock(), createBlock(unref(DropdownMenuTrigger), {
                key: 0,
                "as-child": "",
                class: props.class,
                disabled: __props.disabled
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1032, ["class", "disabled"])) : createCommentVNode("", true),
              createVNode(_sfc_main$2, mergeProps({
                class: ui.value.content({ class: [!slots.default && props.class, unref(uiProp)?.content] }),
                ui: ui.value,
                "ui-override": unref(uiProp)
              }, contentProps.value, {
                items: __props.items,
                portal: __props.portal,
                "label-key": __props.labelKey,
                "description-key": __props.descriptionKey,
                "checked-icon": __props.checkedIcon,
                "loading-icon": __props.loadingIcon,
                "external-icon": __props.externalIcon
              }), createSlots({
                default: withCtx(() => [
                  !!__props.arrow ? (openBlock(), createBlock(unref(DropdownMenuArrow), mergeProps({ key: 0 }, arrowProps.value, {
                    "data-slot": "arrow",
                    class: ui.value.arrow({ class: unref(uiProp)?.arrow })
                  }), null, 16, ["class"])) : createCommentVNode("", true)
                ]),
                _: 2
              }, [
                renderList(getProxySlots(), (_, name) => {
                  return {
                    name,
                    fn: withCtx((slotData) => [
                      renderSlot(_ctx.$slots, name, slotData)
                    ])
                  };
                })
              ]), 1040, ["class", "ui", "ui-override", "items", "portal", "label-key", "description-key", "checked-icon", "loading-icon", "external-icon"])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.5.1_@tiptap+extensions@3.20.4_@tiptap+core@3.20.4_@tiptap+pm@3.20.4__@tiptap_e4a31b51003d92b668867b8854240143/node_modules/@nuxt/ui/dist/runtime/components/DropdownMenu.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
function getFoodTypeAppearance(tipo) {
  const normalizedType = (tipo || "").trim().toLowerCase();
  switch (normalizedType) {
    case "desayuno":
      return {
        color: "neutral",
        className: "bg-cyan-500/12 text-cyan-700 ring-cyan-500/25 dark:bg-cyan-400/14 dark:text-cyan-300 dark:ring-cyan-400/25",
        icon: "i-lucide-sunrise",
        label: "Desayuno"
      };
    case "comida":
      return {
        color: "neutral",
        className: "bg-amber-500/12 text-amber-700 ring-amber-500/25 dark:bg-amber-400/14 dark:text-amber-300 dark:ring-amber-400/25",
        icon: "i-lucide-utensils-crossed",
        label: "Comida"
      };
    case "cena":
      return {
        color: "neutral",
        className: "bg-indigo-500/12 text-indigo-700 ring-indigo-500/25 dark:bg-indigo-400/14 dark:text-indigo-300 dark:ring-indigo-400/25",
        icon: "i-lucide-moon-star",
        label: "Cena"
      };
    case "snack":
      return {
        color: "neutral",
        className: "bg-rose-500/12 text-rose-700 ring-rose-500/25 dark:bg-rose-400/14 dark:text-rose-300 dark:ring-rose-400/25",
        icon: "i-lucide-apple",
        label: "Snack"
      };
    case "guarnicion":
      return {
        color: "neutral",
        className: "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300 dark:ring-zinc-400/20",
        icon: "i-lucide-leaf",
        label: "Guarnición"
      };
    case "ramekin":
      return {
        color: "info",
        className: "",
        icon: "i-lucide-cooking-pot",
        label: "Ramekin"
      };
    default:
      return {
        color: "neutral",
        className: "",
        icon: "i-lucide-tag",
        label: normalizedType ? normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1) : "Sin tipo"
      };
  }
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FoodCatalogTable",
  __ssrInlineRender: true,
  props: {
    items: {},
    loading: { type: Boolean },
    mode: {},
    deletingId: {},
    editTo: { type: Function },
    searchPlaceholder: {},
    emptyTitle: {},
    emptyDescription: {},
    noResultsTitle: {},
    noResultsDescription: {},
    selectLabel: {},
    selectedId: {},
    autofocusSearch: { type: Boolean }
  },
  emits: ["delete", "select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const items = computed(() => props.items ?? []);
    const route = useRoute();
    const loading = computed(() => props.loading ?? false);
    const mode = computed(() => props.mode ?? "manage");
    const deletingId = computed(() => props.deletingId ?? null);
    const searchPlaceholder = computed(() => props.searchPlaceholder ?? "Buscar platillo");
    const emptyTitle = computed(() => props.emptyTitle ?? "No hay platillos guardados");
    const emptyDescription = computed(() => props.emptyDescription ?? "Empieza creando el primero para que aparezca disponible en los tiempos del menú semanal.");
    const noResultsTitle = computed(() => props.noResultsTitle ?? "Sin resultados");
    const noResultsDescription = computed(() => props.noResultsDescription ?? "Ajusta la búsqueda o cambia el filtro para volver a ver platillos.");
    const selectLabel = computed(() => props.selectLabel ?? "Seleccionar");
    const selectedId = computed(() => props.selectedId ?? null);
    const autofocusSearch = computed(() => props.autofocusSearch ?? false);
    const isSelectMode = computed(() => mode.value === "select");
    const search = ref("");
    const selectedType = ref("todos");
    const sortKey = ref(mode.value === "manage" ? "createdAt" : "nombre");
    const sortDirection = ref(mode.value === "manage" ? "desc" : "asc");
    const preferredTypeOptions = [
      { label: "Desayuno", value: "desayuno" },
      { label: "Comida", value: "comida" },
      { label: "Cena", value: "cena" },
      { label: "Snack", value: "snack" },
      { label: "Guarnición", value: "guarnicion" },
      { label: "Ramekin", value: "ramekin" }
    ];
    const preferredTypeOrder = preferredTypeOptions.map((option) => option.value);
    const typeOptions = computed(() => {
      const dynamicTypes = Array.from(new Set(items.value.map((item) => item.tipo).filter(Boolean))).filter((tipo) => !preferredTypeOrder.includes(tipo)).sort((a, b) => a.localeCompare(b, "es")).map((tipo) => ({
        label: getFoodTypeAppearance(tipo).label,
        value: tipo
      }));
      return [
        { label: "Todos", value: "todos" },
        ...preferredTypeOptions,
        ...dynamicTypes
      ];
    });
    function normalizeTypeValue(value) {
      if (typeof value === "string") {
        return value;
      }
      if (value && typeof value === "object" && "value" in value && typeof value.value === "string") {
        return value.value;
      }
      return "todos";
    }
    const normalizedSelectedType = computed(() => normalizeTypeValue(selectedType.value));
    const selectedTypeLabel = computed(() => {
      if (normalizedSelectedType.value === "todos") {
        return "";
      }
      return getFoodTypeAppearance(normalizedSelectedType.value).label;
    });
    const filteredItems = computed(() => {
      const query = search.value.trim().toLowerCase();
      return items.value.filter((item) => {
        const matchesType = normalizedSelectedType.value === "todos" || item.tipo === normalizedSelectedType.value;
        const matchesSearch = !query || item.nombre.toLowerCase().includes(query) || item.descripcion.toLowerCase().includes(query) || item.tipo.toLowerCase().includes(query);
        return matchesType && matchesSearch;
      });
    });
    const sortedItems = computed(() => {
      return [...filteredItems.value].sort((a, b) => {
        let comparison = 0;
        switch (sortKey.value) {
          case "nombre":
            comparison = a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
            break;
          case "calorias":
            comparison = a.calorias - b.calorias;
            break;
          case "createdAt":
          default:
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return sortDirection.value === "asc" ? comparison : -comparison;
      });
    });
    const normalizedSearch = computed(() => search.value.trim());
    const canCreateFromSearch = computed(() => mode.value === "manage" && normalizedSearch.value.length > 0);
    const canCreateFromFilter = computed(
      () => mode.value === "manage" && normalizedSearch.value.length === 0 && normalizedSelectedType.value !== "todos"
    );
    const createFilterLabel = computed(() => {
      switch (normalizedSelectedType.value) {
        case "snack":
          return "Crear un snack";
        case "ramekin":
          return "Crear un ramekin";
        case "desayuno":
          return "Crear un desayuno";
        case "comida":
          return "Crear una comida";
        case "cena":
          return "Crear una cena";
        case "guarnicion":
          return "Crear una guarnición";
        default:
          return `Crear ${selectedTypeLabel.value}`;
      }
    });
    const createButtonLabel = computed(() => {
      if (canCreateFromSearch.value) {
        return `Crear "${normalizedSearch.value}"`;
      }
      if (canCreateFromFilter.value) {
        return createFilterLabel.value;
      }
      return "Crear platillo";
    });
    const createFromSearchTo = computed(() => ({
      path: "/admin/platillos/crear-nuevo",
      query: {
        ...normalizedSearch.value ? { nombre: normalizedSearch.value } : {},
        ...normalizedSelectedType.value !== "todos" ? { tipo: normalizedSelectedType.value } : {},
        returnTo: route.fullPath
      }
    }));
    function onDelete(item) {
      emit("delete", item);
    }
    function onSelect(id) {
      emit("select", id);
    }
    function sortIcon(key) {
      if (sortKey.value !== key) {
        return "i-lucide-arrow-up-down";
      }
      return sortDirection.value === "asc" ? "i-lucide-arrow-up" : "i-lucide-arrow-down";
    }
    function actionItems(item) {
      if (mode.value !== "manage") {
        return [];
      }
      return [[
        {
          label: "Editar",
          icon: "i-lucide-square-pen",
          onSelect: () => {
            if (props.editTo) {
              navigateTo(props.editTo(item));
            }
          }
        },
        {
          label: "Eliminar",
          icon: "i-lucide-trash",
          color: "error",
          onSelect: () => onDelete(item)
        }
      ]];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UInput = _sfc_main$3;
      const _component_USelect = _sfc_main$4;
      const _component_USkeleton = _sfc_main$5;
      const _component_UIcon = _sfc_main$g;
      const _component_UButton = _sfc_main$a;
      const _component_UBadge = _sfc_main$6;
      const _component_UDropdownMenu = _sfc_main$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-0" }, _attrs))}><section class="${ssrRenderClass([unref(isSelectMode) ? "px-4 py-4 sm:px-4" : "px-5 py-4 sm:px-6", "border-b border-default/70"])}"><div class="${ssrRenderClass([unref(isSelectMode) ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_740px] lg:items-center", "grid gap-4"])}">`);
      if (!unref(isSelectMode)) {
        _push(`<div class="flex flex-col gap-1"><h2 class="text-sm font-semibold text-highlighted">Buscar y filtrar</h2><p class="text-sm text-muted">Busca por nombre o tipo.</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([unref(isSelectMode) ? "sm:grid-cols-[minmax(0,1fr)_220px]" : "md:grid-cols-[360px_220px] md:justify-end", "grid grid-cols-1 gap-3"])}">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(search),
        "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
        icon: "i-lucide-search",
        autofocus: unref(autofocusSearch),
        placeholder: unref(searchPlaceholder),
        size: "lg",
        class: "w-full"
      }, null, _parent));
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(selectedType),
        "onUpdate:modelValue": ($event) => isRef(selectedType) ? selectedType.value = $event : null,
        items: unref(typeOptions),
        "value-key": "value",
        placeholder: "Filtrar por tipo",
        size: "lg",
        content: { position: "popper", side: "bottom", align: "end", sideOffset: 8 },
        class: "w-full"
      }, null, _parent));
      _push(`</div></div></section>`);
      if (unref(loading)) {
        _push(`<section class="space-y-3 px-5 py-5 sm:px-6"><!--[-->`);
        ssrRenderList(8, (index) => {
          _push(ssrRenderComponent(_component_USkeleton, {
            key: index,
            class: "h-12 w-full rounded-xl"
          }, null, _parent));
        });
        _push(`<!--]--></section>`);
      } else if (!unref(items).length) {
        _push(`<section class="flex min-h-[360px] items-center justify-center px-5 py-10 sm:px-6"><div class="max-w-md space-y-3 text-center"><div class="mx-auto flex size-12 items-center justify-center rounded-xl border border-default bg-elevated">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-package-open",
          class: "size-5 text-muted"
        }, null, _parent));
        _push(`</div><div class="space-y-1"><h3 class="text-base font-semibold text-highlighted">${ssrInterpolate(unref(emptyTitle))}</h3><p class="text-sm text-muted">${ssrInterpolate(unref(emptyDescription))}</p></div></div></section>`);
      } else if (!unref(filteredItems).length) {
        _push(`<section class="flex min-h-[360px] items-center justify-center px-5 py-10 sm:px-6"><div class="max-w-md space-y-4 text-center"><div class="mx-auto flex size-12 items-center justify-center rounded-xl border border-default bg-elevated">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "size-5 text-muted"
        }, null, _parent));
        _push(`</div><div class="space-y-1"><h3 class="text-base font-semibold text-highlighted">${ssrInterpolate(unref(noResultsTitle))}</h3><p class="text-sm text-muted">${ssrInterpolate(unref(noResultsDescription))} `);
        if (unref(canCreateFromSearch)) {
          _push(`<!--[--> También puedes crear un nuevo platillo usando <span class="font-medium text-highlighted">&quot;${ssrInterpolate(unref(normalizedSearch))}&quot;</span>. <!--]-->`);
        } else if (unref(canCreateFromFilter)) {
          _push(`<!--[--> Todavía no hay platillos de tipo <span class="font-medium text-highlighted">${ssrInterpolate(unref(selectedTypeLabel))}</span>, pero puedes crear el primero desde aquí. <!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p></div>`);
        if (unref(canCreateFromSearch) || unref(canCreateFromFilter)) {
          _push(ssrRenderComponent(_component_UButton, {
            to: unref(createFromSearchTo),
            icon: "i-lucide-plus"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(createButtonLabel))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(createButtonLabel)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section>`);
      } else {
        _push(`<div class="overflow-x-auto"><table class="min-w-full table-fixed text-sm"><colgroup><col class="w-[72%] sm:w-[58%]"><col class="hidden sm:table-column sm:w-[18%]"><col class="w-[28%] sm:w-[24%]"></colgroup><thead class="bg-elevated/50"><tr class="border-b border-default/70"><th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6"><button type="button" class="inline-flex items-center gap-2"><span>Platillo</span>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: sortIcon("nombre"),
          class: "size-3.5"
        }, null, _parent));
        _push(`</button></th><th class="hidden px-5 py-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted sm:table-cell sm:px-6"><button type="button" class="inline-flex items-center justify-center gap-2"><span>Calorías</span>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: sortIcon("calorias"),
          class: "size-3.5"
        }, null, _parent));
        _push(`</button></th><th class="px-5 py-3 text-right text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">Acciones</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(sortedItems), (item) => {
          _push(`<tr class="border-b border-default/60 transition-colors hover:bg-elevated/30 last:border-b-0"><td class="px-5 py-4 sm:px-6"><div class="min-w-0 space-y-1"><p class="truncate font-medium text-highlighted">${ssrInterpolate(item.nombre)}</p><div class="flex flex-wrap items-center gap-2">`);
          _push(ssrRenderComponent(_component_UBadge, {
            color: unref(getFoodTypeAppearance)(item.tipo).color,
            variant: "soft",
            class: ["inline-flex max-w-fit rounded-xl px-2.5 py-1 ring-1 ring-inset", unref(getFoodTypeAppearance)(item.tipo).className]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: unref(getFoodTypeAppearance)(item.tipo).icon,
                  class: "size-3.5 shrink-0"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(unref(getFoodTypeAppearance)(item.tipo).label)}`);
              } else {
                return [
                  createVNode(_component_UIcon, {
                    name: unref(getFoodTypeAppearance)(item.tipo).icon,
                    class: "size-3.5 shrink-0"
                  }, null, 8, ["name"]),
                  createTextVNode(" " + toDisplayString(unref(getFoodTypeAppearance)(item.tipo).label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-sm font-medium text-muted sm:hidden">${ssrInterpolate(item.calorias)} cal </span></div></div></td><td class="hidden px-5 py-4 text-center font-medium text-highlighted sm:table-cell sm:px-6">${ssrInterpolate(item.calorias)} cal </td><td class="px-5 py-4 sm:px-6"><div class="flex justify-end">`);
          if (unref(mode) === "manage") {
            _push(`<!--[--><div class="hidden items-center justify-end gap-2 lg:flex">`);
            _push(ssrRenderComponent(_component_UButton, {
              variant: "ghost",
              color: "neutral",
              icon: "i-lucide-square-pen",
              to: __props.editTo?.(item),
              ui: {
                base: "justify-center px-0 lg:flex-col lg:gap-1 lg:py-1.5",
                leadingIcon: "size-4.5 lg:size-5"
              }
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="inline-block w-[8ch] text-center text-[11px] leading-none xl:text-xs"${_scopeId}>Editar</span>`);
                } else {
                  return [
                    createVNode("span", { class: "inline-block w-[8ch] text-center text-[11px] leading-none xl:text-xs" }, "Editar")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              variant: "ghost",
              color: "error",
              icon: "i-lucide-trash",
              loading: unref(deletingId) === item.id,
              ui: {
                base: "justify-center px-0 lg:flex-col lg:gap-1 lg:py-1.5",
                leadingIcon: "size-4.5 lg:size-5"
              },
              onClick: ($event) => onDelete(item)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="inline-block w-[8ch] text-center text-[11px] leading-none xl:text-xs"${_scopeId}>Eliminar</span>`);
                } else {
                  return [
                    createVNode("span", { class: "inline-block w-[8ch] text-center text-[11px] leading-none xl:text-xs" }, "Eliminar")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
            _push(ssrRenderComponent(_component_UDropdownMenu, {
              items: actionItems(item),
              class: "lg:hidden"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UButton, {
                    size: "sm",
                    variant: "ghost",
                    color: "neutral",
                    icon: "i-lucide-ellipsis-vertical",
                    square: "",
                    loading: unref(deletingId) === item.id
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      size: "sm",
                      variant: "ghost",
                      color: "neutral",
                      icon: "i-lucide-ellipsis-vertical",
                      square: "",
                      loading: unref(deletingId) === item.id
                    }, null, 8, ["loading"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<!--]-->`);
          } else {
            _push(ssrRenderComponent(_component_UButton, {
              size: "sm",
              color: "primary",
              variant: "soft",
              icon: "i-lucide-check",
              disabled: unref(selectedId) === item.id,
              onClick: ($event) => onSelect(item.id)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(selectedId) === item.id ? "Seleccionado" : unref(selectLabel))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(selectedId) === item.id ? "Seleccionado" : unref(selectLabel)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      if (unref(mode) === "manage") {
        _push(`<section class="flex flex-col gap-3 border-t border-default/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p class="text-sm text-muted"> Mostrando <span class="font-medium text-highlighted">${ssrInterpolate(unref(filteredItems).length)}</span> de <span class="font-medium text-highlighted">${ssrInterpolate(unref(items).length)}</span> platillos registrados. </p></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/FoodCatalogTable.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "AdminFoodCatalogTable" });

export { _sfc_main$1 as _, __nuxt_component_2 as a, getFoodTypeAppearance as g };
