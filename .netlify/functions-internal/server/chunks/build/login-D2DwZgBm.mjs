import { _ as __nuxt_component_0, a as __nuxt_component_3 } from './TheFooter-UdWFcnC-.mjs';
import { _ as _sfc_main$1 } from './Separator-BcjYB7qk.mjs';
import { _ as _sfc_main$2 } from './Card-BsgwMRuG.mjs';
import { c as _export_sfc, b as useToast, u as useRoute, z as useSupabaseSession, a as useSeoMeta, e as _sfc_main$g, _ as _sfc_main$a, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$3 } from './Alert-DmPqFZyZ.mjs';
import { _ as _sfc_main$4 } from './Form-BatySvBg.mjs';
import { _ as _sfc_main$5 } from './FormField-Dr2ldvax.mjs';
import { _ as _sfc_main$6 } from './Input-DL0XnWnl.mjs';
import { defineComponent, reactive, ref, mergeProps, withCtx, unref, createVNode, createTextVNode, openBlock, createBlock, createCommentVNode, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import * as z from 'zod';
import { u as useSupabaseClient } from './useSupabaseClient-COavZuE6.mjs';
import 'reka-ui';
import '../nitro/nitro.mjs';
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
import './overlay-CjyBzL1C.mjs';
import './Modal-DHNNY9I2.mjs';
import 'vaul-vue';
import './ColorMode-DPRaW54j.mjs';
import './Badge-BtXv9wz2.mjs';
import './Popover-CMIe6n2p.mjs';
import 'reka-ui/namespaced';
import './helpers-W5IJF87J.mjs';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const schema = z.object({
      email: z.email("Ingresa un correo electrónico válido."),
      password: z.string("La contraseña es obligatoria.").min(8, "La contraseña debe tener al menos 8 caracteres.")
    });
    const supabase = useSupabaseClient();
    const toast = useToast();
    const route = useRoute();
    const currentSession = useSupabaseSession();
    const state = reactive({
      email: "",
      password: ""
    });
    const isSubmitting = ref(false);
    const authError = ref("");
    async function onSubmit(event) {
      authError.value = "";
      isSubmitting.value = true;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: event.data.email,
        password: event.data.password
      });
      isSubmitting.value = false;
      if (error) {
        authError.value = error.message || "No fue posible iniciar sesión.";
        toast.add({
          title: "Error al iniciar sesión",
          description: authError.value,
          color: "error"
        });
        return;
      }
      toast.add({
        title: "Sesión iniciada",
        description: "Redirigiendo al panel administrativo.",
        color: "success"
      });
      currentSession.value = data.session ?? null;
      const redirectTo = typeof route.query.redirect === "string" ? route.query.redirect : "/admin";
      await nextTick();
      await navigateTo(redirectTo, { replace: true });
    }
    useSeoMeta({
      title: "Iniciar sesión | Heltifud Meal Preps",
      description: "Accede al panel administrativo de Heltifud Meal Preps.",
      robots: "noindex, nofollow"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TheHeader = __nuxt_component_0;
      const _component_USeparator = _sfc_main$1;
      const _component_UCard = _sfc_main$2;
      const _component_UIcon = _sfc_main$g;
      const _component_UAlert = _sfc_main$3;
      const _component_UForm = _sfc_main$4;
      const _component_UFormField = _sfc_main$5;
      const _component_UInput = _sfc_main$6;
      const _component_UButton = _sfc_main$a;
      const _component_TheFooter = __nuxt_component_3;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "login-page bg-green-50/50 text-highlighted dark:bg-neutral-950" }, _attrs))} data-v-6e9e9e50>`);
      _push(ssrRenderComponent(_component_TheHeader, null, null, _parent));
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(`<main class="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8 md:px-6 bg-[linear-gradient(180deg,rgb(248_249_245)_0%,rgb(241_244_239)_100%)] dark:bg-[linear-gradient(180deg,rgb(8_10_14)_0%,rgb(5_7_11)_100%)]" data-v-6e9e9e50><div aria-hidden="true" class="pointer-events-none absolute inset-0" data-v-6e9e9e50><div class="login-glow login-glow-left" data-v-6e9e9e50></div><div class="login-glow login-glow-right" data-v-6e9e9e50></div><div class="login-grid" data-v-6e9e9e50></div></div><section class="relative z-10 w-full max-w-md" data-v-6e9e9e50>`);
      _push(ssrRenderComponent(_component_UCard, {
        class: "overflow-hidden shadow-2xl shadow-black/8 dark:shadow-black/45",
        ui: {
          root: "rounded-2xl border border-default/70 bg-default/92 backdrop-blur-sm dark:border-white/8 dark:bg-neutral-900/90",
          body: "p-0 sm:p-0"
        }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="space-y-6 px-6 py-6 sm:px-7 sm:py-7" data-v-6e9e9e50${_scopeId}><div class="space-y-3" data-v-6e9e9e50${_scopeId}><div class="flex items-center gap-3" data-v-6e9e9e50${_scopeId}><div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 dark:bg-primary/12 dark:ring-primary/15" data-v-6e9e9e50${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-lock-keyhole",
              class: "size-5"
            }, null, _parent2, _scopeId));
            _push2(`</div><div data-v-6e9e9e50${_scopeId}><p class="text-lg font-semibold text-highlighted" data-v-6e9e9e50${_scopeId}>Iniciar sesión</p><p class="text-sm text-muted" data-v-6e9e9e50${_scopeId}>Accede para entrar a la sección admin.</p></div></div></div>`);
            if (unref(authError)) {
              _push2(ssrRenderComponent(_component_UAlert, {
                color: "error",
                variant: "soft",
                icon: "i-lucide-circle-alert",
                title: unref(authError)
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_UForm, {
              schema: unref(schema),
              state: unref(state),
              class: "space-y-5",
              onSubmit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UFormField, {
                    name: "email",
                    label: "Correo electrónico",
                    class: "space-y-2",
                    ui: { label: "text-sm font-medium text-highlighted" }
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(state).email,
                          "onUpdate:modelValue": ($event) => unref(state).email = $event,
                          type: "email",
                          size: "xl",
                          autofocus: "",
                          autocomplete: "email",
                          icon: "i-lucide-mail",
                          placeholder: "tu@correo.com",
                          class: "w-full",
                          ui: {
                            base: "h-12",
                            leadingIcon: "size-5 text-muted"
                          }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(state).email,
                            "onUpdate:modelValue": ($event) => unref(state).email = $event,
                            type: "email",
                            size: "xl",
                            autofocus: "",
                            autocomplete: "email",
                            icon: "i-lucide-mail",
                            placeholder: "tu@correo.com",
                            class: "w-full",
                            ui: {
                              base: "h-12",
                              leadingIcon: "size-5 text-muted"
                            }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    name: "password",
                    class: "space-y-2",
                    ui: { label: "text-sm font-medium text-highlighted" }
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex items-center justify-between gap-3" data-v-6e9e9e50${_scopeId3}><label for="login-password" class="text-sm font-medium text-highlighted" data-v-6e9e9e50${_scopeId3}> Contraseña </label><button type="button" class="text-xs font-medium text-primary transition-colors hover:text-primary/80" data-v-6e9e9e50${_scopeId3}> ¿Olvidaste tu contraseña? </button></div>`);
                        _push4(ssrRenderComponent(_component_UInput, {
                          id: "login-password",
                          modelValue: unref(state).password,
                          "onUpdate:modelValue": ($event) => unref(state).password = $event,
                          type: "password",
                          size: "xl",
                          autocomplete: "current-password",
                          icon: "i-lucide-key-round",
                          placeholder: "Ingresa tu contraseña",
                          class: "w-full",
                          ui: {
                            base: "h-12",
                            leadingIcon: "size-5 text-muted"
                          }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                            createVNode("label", {
                              for: "login-password",
                              class: "text-sm font-medium text-highlighted"
                            }, " Contraseña "),
                            createVNode("button", {
                              type: "button",
                              class: "text-xs font-medium text-primary transition-colors hover:text-primary/80"
                            }, " ¿Olvidaste tu contraseña? ")
                          ]),
                          createVNode(_component_UInput, {
                            id: "login-password",
                            modelValue: unref(state).password,
                            "onUpdate:modelValue": ($event) => unref(state).password = $event,
                            type: "password",
                            size: "xl",
                            autocomplete: "current-password",
                            icon: "i-lucide-key-round",
                            placeholder: "Ingresa tu contraseña",
                            class: "w-full",
                            ui: {
                              base: "h-12",
                              leadingIcon: "size-5 text-muted"
                            }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    type: "submit",
                    block: "",
                    size: "xl",
                    color: "primary",
                    class: "justify-center",
                    loading: unref(isSubmitting),
                    disabled: unref(isSubmitting)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Entrar al admin `);
                      } else {
                        return [
                          createTextVNode(" Entrar al admin ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UFormField, {
                      name: "email",
                      label: "Correo electrónico",
                      class: "space-y-2",
                      ui: { label: "text-sm font-medium text-highlighted" }
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(state).email,
                          "onUpdate:modelValue": ($event) => unref(state).email = $event,
                          type: "email",
                          size: "xl",
                          autofocus: "",
                          autocomplete: "email",
                          icon: "i-lucide-mail",
                          placeholder: "tu@correo.com",
                          class: "w-full",
                          ui: {
                            base: "h-12",
                            leadingIcon: "size-5 text-muted"
                          }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UFormField, {
                      name: "password",
                      class: "space-y-2",
                      ui: { label: "text-sm font-medium text-highlighted" }
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                          createVNode("label", {
                            for: "login-password",
                            class: "text-sm font-medium text-highlighted"
                          }, " Contraseña "),
                          createVNode("button", {
                            type: "button",
                            class: "text-xs font-medium text-primary transition-colors hover:text-primary/80"
                          }, " ¿Olvidaste tu contraseña? ")
                        ]),
                        createVNode(_component_UInput, {
                          id: "login-password",
                          modelValue: unref(state).password,
                          "onUpdate:modelValue": ($event) => unref(state).password = $event,
                          type: "password",
                          size: "xl",
                          autocomplete: "current-password",
                          icon: "i-lucide-key-round",
                          placeholder: "Ingresa tu contraseña",
                          class: "w-full",
                          ui: {
                            base: "h-12",
                            leadingIcon: "size-5 text-muted"
                          }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UButton, {
                      type: "submit",
                      block: "",
                      size: "xl",
                      color: "primary",
                      class: "justify-center",
                      loading: unref(isSubmitting),
                      disabled: unref(isSubmitting)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Entrar al admin ")
                      ]),
                      _: 1
                    }, 8, ["loading", "disabled"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "space-y-6 px-6 py-6 sm:px-7 sm:py-7" }, [
                createVNode("div", { class: "space-y-3" }, [
                  createVNode("div", { class: "flex items-center gap-3" }, [
                    createVNode("div", { class: "flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 dark:bg-primary/12 dark:ring-primary/15" }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-lock-keyhole",
                        class: "size-5"
                      })
                    ]),
                    createVNode("div", null, [
                      createVNode("p", { class: "text-lg font-semibold text-highlighted" }, "Iniciar sesión"),
                      createVNode("p", { class: "text-sm text-muted" }, "Accede para entrar a la sección admin.")
                    ])
                  ])
                ]),
                unref(authError) ? (openBlock(), createBlock(_component_UAlert, {
                  key: 0,
                  color: "error",
                  variant: "soft",
                  icon: "i-lucide-circle-alert",
                  title: unref(authError)
                }, null, 8, ["title"])) : createCommentVNode("", true),
                createVNode(_component_UForm, {
                  schema: unref(schema),
                  state: unref(state),
                  class: "space-y-5",
                  onSubmit
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UFormField, {
                      name: "email",
                      label: "Correo electrónico",
                      class: "space-y-2",
                      ui: { label: "text-sm font-medium text-highlighted" }
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UInput, {
                          modelValue: unref(state).email,
                          "onUpdate:modelValue": ($event) => unref(state).email = $event,
                          type: "email",
                          size: "xl",
                          autofocus: "",
                          autocomplete: "email",
                          icon: "i-lucide-mail",
                          placeholder: "tu@correo.com",
                          class: "w-full",
                          ui: {
                            base: "h-12",
                            leadingIcon: "size-5 text-muted"
                          }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UFormField, {
                      name: "password",
                      class: "space-y-2",
                      ui: { label: "text-sm font-medium text-highlighted" }
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                          createVNode("label", {
                            for: "login-password",
                            class: "text-sm font-medium text-highlighted"
                          }, " Contraseña "),
                          createVNode("button", {
                            type: "button",
                            class: "text-xs font-medium text-primary transition-colors hover:text-primary/80"
                          }, " ¿Olvidaste tu contraseña? ")
                        ]),
                        createVNode(_component_UInput, {
                          id: "login-password",
                          modelValue: unref(state).password,
                          "onUpdate:modelValue": ($event) => unref(state).password = $event,
                          type: "password",
                          size: "xl",
                          autocomplete: "current-password",
                          icon: "i-lucide-key-round",
                          placeholder: "Ingresa tu contraseña",
                          class: "w-full",
                          ui: {
                            base: "h-12",
                            leadingIcon: "size-5 text-muted"
                          }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_UButton, {
                      type: "submit",
                      block: "",
                      size: "xl",
                      color: "primary",
                      class: "justify-center",
                      loading: unref(isSubmitting),
                      disabled: unref(isSubmitting)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Entrar al admin ")
                      ]),
                      _: 1
                    }, 8, ["loading", "disabled"])
                  ]),
                  _: 1
                }, 8, ["schema", "state"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section></main>`);
      _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
      _push(ssrRenderComponent(_component_TheFooter, null, null, _parent));
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../layers/base/app/pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6e9e9e50"]]);

export { login as default };
