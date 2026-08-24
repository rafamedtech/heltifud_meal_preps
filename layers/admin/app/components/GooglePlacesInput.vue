<script setup lang="ts">
import { loadGooglePlacesLibrary } from "../utils/googleMaps"

type LoadStatus = "loading" | "ready" | "unconfigured" | "error"

const props = withDefaults(defineProps<{
  name: string
  placeholder?: string
  description?: string
  disabled?: boolean
}>(), {
  placeholder: "Busca una dirección o lugar",
  description: "Busca y selecciona una ubicación sugerida por Google Maps.",
  disabled: false
})

const model = defineModel<string>({ default: "" })
const config = useRuntimeConfig()
const apiKey = String(config.public.googleMapsApiKey ?? "").trim()
const host = ref<HTMLElement | null>(null)
const status = ref<LoadStatus>(apiKey ? "loading" : "unconfigured")
const {
  id,
  color,
  highlight,
  disabled: fieldDisabled,
  emitFormBlur,
  emitFormChange,
  emitFormFocus,
  emitFormInput,
  ariaAttrs
} = useFormField(props, { deferInputValidation: true })

let autocomplete: google.maps.places.PlaceAutocompleteElement | null = null
let destroyed = false

function syncTypedValue() {
  if (!autocomplete) return

  if (model.value !== autocomplete.value) {
    model.value = autocomplete.value
  }
}

function handleInput() {
  syncTypedValue()
  emitFormInput()
}

function handleChange() {
  syncTypedValue()
  emitFormChange()
}

function handleBlur() {
  syncTypedValue()
  emitFormBlur()
}

async function selectPlace(event: google.maps.places.PlacePredictionSelectEvent) {
  if (!autocomplete) return

  const prediction = event.placePrediction
  const predictionText = prediction.text.toString()
  model.value = predictionText
  autocomplete.value = predictionText

  try {
    const place = prediction.toPlace()
    await place.fetchFields({ fields: ["formattedAddress"] })

    const address = place.formattedAddress?.trim() || predictionText
    model.value = address
    autocomplete.value = address
  } catch {
    // The prediction is still a useful, human-readable address if Place Details fails.
  }

  emitFormInput()
  emitFormChange()
}

function handleGoogleError() {
  status.value = "error"
}

function syncAccessibilityAttributes() {
  if (!autocomplete) return

  autocomplete.id = id.value || props.name
  autocomplete.removeAttribute("aria-invalid")
  autocomplete.removeAttribute("aria-describedby")

  for (const [attribute, value] of Object.entries(ariaAttrs.value ?? {})) {
    autocomplete.setAttribute(attribute, String(value))
  }
}

async function initializeAutocomplete() {
  if (!apiKey || !host.value) return

  status.value = "loading"

  try {
    const { PlaceAutocompleteElement } = await loadGooglePlacesLibrary(apiKey)
    if (destroyed || !host.value) return

    autocomplete = new PlaceAutocompleteElement({
      description: props.description,
      disabled: fieldDisabled.value,
      locationBias: {
        center: { lat: 32.5149, lng: -117.0382 },
        radius: 50_000
      },
      maxlength: 300,
      name: props.name,
      noInputIcon: true,
      placeholder: props.placeholder,
      requestedLanguage: "es",
      requestedRegion: "mx",
      value: model.value
    })

    autocomplete.addEventListener("gmp-select", selectPlace)
    autocomplete.addEventListener("gmp-error", handleGoogleError)
    autocomplete.addEventListener("input", handleInput)
    autocomplete.addEventListener("change", handleChange)
    autocomplete.addEventListener("focusin", emitFormFocus)
    autocomplete.addEventListener("focusout", handleBlur)
    host.value.replaceChildren(autocomplete)
    syncAccessibilityAttributes()
    status.value = "ready"
  } catch {
    status.value = "error"
  }
}

watch(model, (value) => {
  if (autocomplete && autocomplete.value !== value) {
    autocomplete.value = value
  }
})

watch(fieldDisabled, (disabled) => {
  if (autocomplete) autocomplete.disabled = disabled
})

watch([id, ariaAttrs], syncAccessibilityAttributes, { deep: true })

onMounted(initializeAutocomplete)
onBeforeUnmount(() => {
  destroyed = true
  autocomplete?.removeEventListener("gmp-select", selectPlace)
  autocomplete?.removeEventListener("gmp-error", handleGoogleError)
  autocomplete?.removeEventListener("input", handleInput)
  autocomplete?.removeEventListener("change", handleChange)
  autocomplete?.removeEventListener("focusin", emitFormFocus)
  autocomplete?.removeEventListener("focusout", handleBlur)
})
</script>

<template>
  <div class="space-y-1.5">
    <div class="relative">
      <div
        ref="host"
        class="google-places-host"
        :class="{
          hidden: status !== 'ready',
          'google-places-host-error': color === 'error'
        }"
      />

      <UInput
        v-if="status !== 'ready'"
        :id="id"
        v-model="model"
        v-bind="ariaAttrs"
        icon="i-lucide-map-pin"
        :name="name"
        :placeholder="placeholder"
        :disabled="fieldDisabled"
        :loading="status === 'loading'"
        :color="color"
        :highlight="highlight"
        maxlength="300"
        size="lg"
        class="w-full"
      />

      <UIcon
        v-if="status === 'ready'"
        name="i-lucide-map-pin"
        class="pointer-events-none absolute inset-y-0 start-3 my-auto size-5 text-dimmed"
      />
    </div>

    <p v-if="status === 'unconfigured'" class="flex items-center gap-1.5 text-xs text-warning">
      <UIcon name="i-lucide-key-round" class="size-3.5 shrink-0" />
      Configura Google Maps para activar las sugerencias; mientras tanto puedes escribir la dirección.
    </p>
    <p v-else-if="status === 'error'" class="flex items-center gap-1.5 text-xs text-warning">
      <UIcon name="i-lucide-triangle-alert" class="size-3.5 shrink-0" />
      Google Maps no está disponible; puedes escribir la dirección manualmente.
    </p>
  </div>
</template>

<style scoped>
.google-places-host {
  min-height: 2.25rem;
  width: 100%;
}

.google-places-host :deep(gmp-place-autocomplete) {
  display: block;
  height: 2.25rem;
  width: 100%;
  border: 0;
  border-radius: var(--ui-radius);
  background-color: var(--ui-bg);
  color: var(--ui-text-highlighted);
  color-scheme: inherit;
  box-shadow: inset 0 0 0 1px var(--ui-border-accented);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.25rem;
  transition: color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}

.google-places-host :deep(gmp-place-autocomplete[disabled]) {
  cursor: not-allowed;
  opacity: 0.75;
}

.google-places-host :deep(gmp-place-autocomplete:focus-within) {
  box-shadow: inset 0 0 0 2px var(--ui-primary);
}

.google-places-host :deep(gmp-place-autocomplete)::part(focus-ring) {
  display: none;
  outline: none;
  box-shadow: none;
}

.google-places-host-error :deep(gmp-place-autocomplete),
.google-places-host-error :deep(gmp-place-autocomplete:focus-within) {
  box-shadow: inset 0 0 0 2px var(--ui-error);
}

.google-places-host :deep(gmp-place-autocomplete)::part(input) {
  box-sizing: border-box;
  height: 2.25rem;
  min-height: 2.25rem;
  padding: 0.5rem 2.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  outline: none;
}

.google-places-host :deep(gmp-place-autocomplete)::part(input)::placeholder {
  color: var(--ui-text-dimmed);
}

.google-places-host :deep(gmp-place-autocomplete)::part(prediction-list) {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius);
  background-color: var(--ui-bg-elevated);
  box-shadow: var(--app-shadow-sm);
}

@media (min-width: 48rem) {
  .google-places-host :deep(gmp-place-autocomplete) {
    font-size: 0.875rem;
  }
}
</style>
