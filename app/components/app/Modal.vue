<script setup lang="ts">
type Variant = {
  title: string;
  price: string;
};

interface ModalProps {
  title: string;
  description?: string;
  variants?: Variant[];
  button?: {
    label: string;
    icon: string;
    click: () => void;
  };
}

defineProps<ModalProps>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }" :title="title">
    <template #body>
      <p v-if="description">{{ description }}</p>

      <section v-if="variants?.length">
        <ul>
          <li
            v-for="(variant, index) in variants"
            :key="index"
            class="flex items-center justify-between py-2"
          >
            <span class="text-primary-500 text-lg font-semibold">{{
              variant.title
            }}</span>
            <span class="text-lg font-bold"> ${{ variant.price }} pesos</span>
          </li>
        </ul>
      </section>
    </template>
    <template v-if="button" #footer>
      <div class="flex w-full justify-center">
        <BaseButton
          :icon="button.icon"
          :label="button.label"
          @click="button.click"
        />
      </div>
    </template>
  </UModal>
</template>
