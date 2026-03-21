import { _ as _sfc_main$1 } from './Card-BsgwMRuG.mjs';
import { _ as _sfc_main$2 } from './Form-BatySvBg.mjs';
import { _ as _sfc_main$3 } from './Input-DL0XnWnl.mjs';
import { _ as _sfc_main$4 } from './Select-CO4MAQzv.mjs';
import { u as useRoute, b as useToast, _ as _sfc_main$a } from './server.mjs';
import { defineComponent, computed, reactive, ref, watch, mergeProps, withCtx, unref, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { f as foodCatalogItemInputSchema } from './menuSchema-i-S62L_E.mjs';
import { u as useFoodCatalog } from './useFoodCatalog-ZWMZGalP.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FoodCatalogForm",
  __ssrInlineRender: true,
  props: {
    item: {},
    mode: {}
  },
  emits: ["saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const item = computed(() => props.item ?? null);
    const mode = computed(() => props.mode ?? "create");
    const emit = __emit;
    const route = useRoute();
    const toast = useToast();
    function getSingleQueryValue(value) {
      if (typeof value === "string") {
        return value.trim();
      }
      if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0].trim();
      }
      return "";
    }
    const prefilledName = computed(
      () => getSingleQueryValue(route.query.nombre)
    );
    const prefilledType = computed(
      () => getSingleQueryValue(route.query.tipo)
    );
    const emptyState = (nombre = "", tipo = "") => ({
      nombre,
      descripcion: "",
      calorias: 0,
      imagen: "",
      tipo
    });
    const typeOptions = [
      { label: "Desayuno", value: "desayuno" },
      { label: "Comida", value: "comida" },
      { label: "Cena", value: "cena" },
      { label: "Snack", value: "snack" },
      { label: "Guarnición", value: "guarnicion" },
      { label: "Ramekin", value: "ramekin" }
    ];
    const state = reactive(emptyState());
    const saving = ref(false);
    const invalidFields = reactive({
      nombre: false,
      descripcion: false,
      calorias: false,
      imagen: false,
      tipo: false
    });
    const actionLabel = computed(() => mode.value === "edit" ? "Guardar cambios" : "Crear platillo");
    const { createFoodCatalogItem, updateFoodCatalogItem } = useFoodCatalog();
    function clearValidationHighlights() {
      invalidFields.nombre = false;
      invalidFields.descripcion = false;
      invalidFields.calorias = false;
      invalidFields.imagen = false;
      invalidFields.tipo = false;
    }
    function applyValidationHighlights(issues) {
      clearValidationHighlights();
      for (const issue of issues) {
        const [field] = issue.path;
        if (typeof field === "string" && field in invalidFields) {
          invalidFields[field] = true;
        }
      }
    }
    watch(
      [() => item.value, () => prefilledName.value, () => prefilledType.value],
      ([item2, nombre, tipo]) => {
        Object.assign(state, item2 ? {
          nombre: item2.nombre,
          descripcion: item2.descripcion,
          calorias: item2.calorias,
          imagen: item2.imagen,
          tipo: item2.tipo
        } : emptyState(mode.value === "create" ? nombre : "", mode.value === "create" ? tipo : ""));
        clearValidationHighlights();
      },
      { immediate: true }
    );
    watch(() => state.nombre, () => {
      invalidFields.nombre = false;
    });
    watch(() => state.descripcion, () => {
      invalidFields.descripcion = false;
    });
    watch(() => state.calorias, () => {
      invalidFields.calorias = false;
    });
    watch(() => state.imagen, () => {
      invalidFields.imagen = false;
    });
    watch(() => state.tipo, () => {
      invalidFields.tipo = false;
    });
    async function onSubmit() {
      const parsed = foodCatalogItemInputSchema.safeParse(state);
      if (!parsed.success) {
        applyValidationHighlights(parsed.error.issues);
        toast.add({
          title: "Error de validación",
          description: parsed.error.issues[0]?.message ?? "Revisa la información del platillo.",
          color: "error"
        });
        return;
      }
      saving.value = true;
      try {
        const savedItem = mode.value === "edit" && item.value?.id ? await updateFoodCatalogItem(item.value.id, parsed.data) : await createFoodCatalogItem(parsed.data);
        clearValidationHighlights();
        toast.add({
          title: mode.value === "edit" ? "Platillo actualizado" : "Platillo creado",
          color: "success"
        });
        emit("saved", savedItem.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo guardar el platillo";
        toast.add({ title: "Error", description: message, color: "error" });
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$1;
      const _component_UForm = _sfc_main$2;
      const _component_UInput = _sfc_main$3;
      const _component_USelect = _sfc_main$4;
      const _component_UButton = _sfc_main$a;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UCard, { class: "app-surface" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UForm, {
              state: unref(state),
              class: "space-y-4",
              onSubmit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<section class="${ssrRenderClass(["app-control-surface px-4 py-3", unref(invalidFields).nombre ? "app-control-surface-error" : ""])}"${_scopeId2}><p class="text-xs uppercase tracking-[0.18em] text-muted"${_scopeId2}>Nombre</p>`);
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(state).nombre,
                    "onUpdate:modelValue": ($event) => unref(state).nombre = $event,
                    class: "mt-2 w-full",
                    variant: "ghost",
                    placeholder: "Ej. Pechuga a la plancha",
                    ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                  }, null, _parent3, _scopeId2));
                  _push3(`</section><section class="${ssrRenderClass(["app-control-surface px-4 py-3", unref(invalidFields).descripcion ? "app-control-surface-error" : ""])}"${_scopeId2}><p class="text-xs uppercase tracking-[0.18em] text-muted"${_scopeId2}>Descripción</p>`);
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(state).descripcion,
                    "onUpdate:modelValue": ($event) => unref(state).descripcion = $event,
                    class: "mt-2 w-full",
                    variant: "ghost",
                    placeholder: "Descripción breve",
                    ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                  }, null, _parent3, _scopeId2));
                  _push3(`</section><section class="${ssrRenderClass(["app-control-surface px-4 py-3", unref(invalidFields).calorias ? "app-control-surface-error" : ""])}"${_scopeId2}><p class="text-xs uppercase tracking-[0.18em] text-muted"${_scopeId2}>Calorías</p>`);
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(state).calorias,
                    "onUpdate:modelValue": ($event) => unref(state).calorias = $event,
                    modelModifiers: { number: true },
                    class: "mt-2 w-full",
                    variant: "ghost",
                    type: "number",
                    min: "0",
                    ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                  }, null, _parent3, _scopeId2));
                  _push3(`</section><section class="${ssrRenderClass(["app-control-surface px-4 py-3", unref(invalidFields).tipo ? "app-control-surface-error" : ""])}"${_scopeId2}><p class="text-xs uppercase tracking-[0.18em] text-muted"${_scopeId2}>Tipo</p>`);
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(state).tipo,
                    "onUpdate:modelValue": ($event) => unref(state).tipo = $event,
                    items: typeOptions,
                    "value-key": "value",
                    class: "mt-2 w-full",
                    variant: "ghost",
                    placeholder: "Selecciona un tipo",
                    ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent" }
                  }, null, _parent3, _scopeId2));
                  _push3(`</section><section class="${ssrRenderClass(["app-control-surface px-4 py-3", unref(invalidFields).imagen ? "app-control-surface-error" : ""])}"${_scopeId2}><p class="text-xs uppercase tracking-[0.18em] text-muted"${_scopeId2}>Imagen (URL)</p>`);
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(state).imagen,
                    "onUpdate:modelValue": ($event) => unref(state).imagen = $event,
                    class: "mt-2 w-full",
                    variant: "ghost",
                    placeholder: "https://...",
                    ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                  }, null, _parent3, _scopeId2));
                  _push3(`</section><section class="flex justify-end pt-2"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    type: "submit",
                    loading: unref(saving),
                    icon: "i-lucide-save",
                    class: "shadow-sm"
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
                  _push3(`</section>`);
                } else {
                  return [
                    createVNode("section", {
                      class: ["app-control-surface px-4 py-3", unref(invalidFields).nombre ? "app-control-surface-error" : ""]
                    }, [
                      createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Nombre"),
                      createVNode(_component_UInput, {
                        modelValue: unref(state).nombre,
                        "onUpdate:modelValue": ($event) => unref(state).nombre = $event,
                        class: "mt-2 w-full",
                        variant: "ghost",
                        placeholder: "Ej. Pechuga a la plancha",
                        ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ], 2),
                    createVNode("section", {
                      class: ["app-control-surface px-4 py-3", unref(invalidFields).descripcion ? "app-control-surface-error" : ""]
                    }, [
                      createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Descripción"),
                      createVNode(_component_UInput, {
                        modelValue: unref(state).descripcion,
                        "onUpdate:modelValue": ($event) => unref(state).descripcion = $event,
                        class: "mt-2 w-full",
                        variant: "ghost",
                        placeholder: "Descripción breve",
                        ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ], 2),
                    createVNode("section", {
                      class: ["app-control-surface px-4 py-3", unref(invalidFields).calorias ? "app-control-surface-error" : ""]
                    }, [
                      createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Calorías"),
                      createVNode(_component_UInput, {
                        modelValue: unref(state).calorias,
                        "onUpdate:modelValue": ($event) => unref(state).calorias = $event,
                        modelModifiers: { number: true },
                        class: "mt-2 w-full",
                        variant: "ghost",
                        type: "number",
                        min: "0",
                        ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ], 2),
                    createVNode("section", {
                      class: ["app-control-surface px-4 py-3", unref(invalidFields).tipo ? "app-control-surface-error" : ""]
                    }, [
                      createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Tipo"),
                      createVNode(_component_USelect, {
                        modelValue: unref(state).tipo,
                        "onUpdate:modelValue": ($event) => unref(state).tipo = $event,
                        items: typeOptions,
                        "value-key": "value",
                        class: "mt-2 w-full",
                        variant: "ghost",
                        placeholder: "Selecciona un tipo",
                        ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ], 2),
                    createVNode("section", {
                      class: ["app-control-surface px-4 py-3", unref(invalidFields).imagen ? "app-control-surface-error" : ""]
                    }, [
                      createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Imagen (URL)"),
                      createVNode(_component_UInput, {
                        modelValue: unref(state).imagen,
                        "onUpdate:modelValue": ($event) => unref(state).imagen = $event,
                        class: "mt-2 w-full",
                        variant: "ghost",
                        placeholder: "https://...",
                        ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ], 2),
                    createVNode("section", { class: "flex justify-end pt-2" }, [
                      createVNode(_component_UButton, {
                        type: "submit",
                        loading: unref(saving),
                        icon: "i-lucide-save",
                        class: "shadow-sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(actionLabel)), 1)
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UForm, {
                state: unref(state),
                class: "space-y-4",
                onSubmit
              }, {
                default: withCtx(() => [
                  createVNode("section", {
                    class: ["app-control-surface px-4 py-3", unref(invalidFields).nombre ? "app-control-surface-error" : ""]
                  }, [
                    createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Nombre"),
                    createVNode(_component_UInput, {
                      modelValue: unref(state).nombre,
                      "onUpdate:modelValue": ($event) => unref(state).nombre = $event,
                      class: "mt-2 w-full",
                      variant: "ghost",
                      placeholder: "Ej. Pechuga a la plancha",
                      ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ], 2),
                  createVNode("section", {
                    class: ["app-control-surface px-4 py-3", unref(invalidFields).descripcion ? "app-control-surface-error" : ""]
                  }, [
                    createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Descripción"),
                    createVNode(_component_UInput, {
                      modelValue: unref(state).descripcion,
                      "onUpdate:modelValue": ($event) => unref(state).descripcion = $event,
                      class: "mt-2 w-full",
                      variant: "ghost",
                      placeholder: "Descripción breve",
                      ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ], 2),
                  createVNode("section", {
                    class: ["app-control-surface px-4 py-3", unref(invalidFields).calorias ? "app-control-surface-error" : ""]
                  }, [
                    createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Calorías"),
                    createVNode(_component_UInput, {
                      modelValue: unref(state).calorias,
                      "onUpdate:modelValue": ($event) => unref(state).calorias = $event,
                      modelModifiers: { number: true },
                      class: "mt-2 w-full",
                      variant: "ghost",
                      type: "number",
                      min: "0",
                      ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ], 2),
                  createVNode("section", {
                    class: ["app-control-surface px-4 py-3", unref(invalidFields).tipo ? "app-control-surface-error" : ""]
                  }, [
                    createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Tipo"),
                    createVNode(_component_USelect, {
                      modelValue: unref(state).tipo,
                      "onUpdate:modelValue": ($event) => unref(state).tipo = $event,
                      items: typeOptions,
                      "value-key": "value",
                      class: "mt-2 w-full",
                      variant: "ghost",
                      placeholder: "Selecciona un tipo",
                      ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent" }
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ], 2),
                  createVNode("section", {
                    class: ["app-control-surface px-4 py-3", unref(invalidFields).imagen ? "app-control-surface-error" : ""]
                  }, [
                    createVNode("p", { class: "text-xs uppercase tracking-[0.18em] text-muted" }, "Imagen (URL)"),
                    createVNode(_component_UInput, {
                      modelValue: unref(state).imagen,
                      "onUpdate:modelValue": ($event) => unref(state).imagen = $event,
                      class: "mt-2 w-full",
                      variant: "ghost",
                      placeholder: "https://...",
                      ui: { base: "px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent", leading: "ps-0", trailing: "pe-0" }
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ], 2),
                  createVNode("section", { class: "flex justify-end pt-2" }, [
                    createVNode(_component_UButton, {
                      type: "submit",
                      loading: unref(saving),
                      icon: "i-lucide-save",
                      class: "shadow-sm"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(actionLabel)), 1)
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ])
                ]),
                _: 1
              }, 8, ["state"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/components/admin/FoodCatalogForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main, { __name: "AdminFoodCatalogForm" });

export { __nuxt_component_3 as _ };
