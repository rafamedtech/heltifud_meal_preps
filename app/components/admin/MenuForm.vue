<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

// interface Menu {
//   name: string;
//   startDate: Date;
//   endDate: Date;
//   isActive: boolean;
// }

const schema = z.object({
  name: z.string().min(2),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(false),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: '',
  startDate: new Date(),
  endDate: new Date(Date.now()),
  isActive: false,
});

const toast = useToast();
const { createMenuOnDB } = useMenu();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await createMenuOnDB(event.data);

  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' });
  console.log(event.data);
}
</script>

<template>
  <UCard>
    <UForm :state="state" :schema="schema" class="gap-4 flex flex-col w-96" @submit="onSubmit" :validate-on="['blur']">
      <UFormField label="Nombre" name="name">
        <UInput v-model="state.name" placeholder="Menu semanal 1" />
      </UFormField>

      <!-- <UForm
        v-for="(item, count) in state.items"
        :key="count"
        :state="item"
        :schema="itemSchema"
        attach
        class="flex gap-2"
      > -->
      <section class="flex gap-2">
        <UFormField label="Fecha de inicio" name="startDate">
          <DatePicker v-model="state.startDate" />
        </UFormField>
        <UFormField label="Fecha final" name="endDate">
          <DatePicker v-model="state.endDate" />
        </UFormField>
      </section>
      <!-- </UForm> -->

      <!-- <div class="flex gap-2">
        <UButton color="neutral" variant="subtle" size="sm" @click="addItem()"> Add Item </UButton>

        <UButton color="neutral" variant="ghost" size="sm" @click="removeItem()"> Remove Item </UButton>
      </div> -->
      <div class="flex justify-end">
        <UButton type="submit"> Continuar </UButton>
      </div>
    </UForm>
  </UCard>
</template>
