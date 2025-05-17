<script setup lang="ts">
const route = useRoute();
const { type = 'std' } = route.query;

const { data: activeMenu } = await useFetch<WeeklyMenu>(`/api/menu?type=${type}`, {
  default: () => ({} as WeeklyMenu),
});

const days = ref(activeMenu.value?.daysStd);

// function getMenu(type: string) {
//   const filteredDays = type === 'std' ? activeMenu.value?.daysStd : activeMenu.value?.daysVeg;

//   days.value = filteredDays;

//   return (
//     filteredDays &&
//     navigateTo(`/menu?type=${type}`, {
//       replace: true,
//     })
//   );
// }

const startDate = computed(() => formatDate(activeMenu.value?.startDate));
const endDate = computed(() => formatDate(activeMenu.value?.endDate));
// const carousel = useTemplateRef('carousel');
// const activeIndex = ref(0);

// function onClickPrev() {
//   activeIndex.value--;
// }
// function onClickNext() {
//   activeIndex.value++;
// }

// function onSelect(index: number) {
//   activeIndex.value = index;
//   carousel.value?.emblaApi?.scrollTo(index);
// }

// function select(index: number) {
//   activeIndex.value = index;

//   carousel.value?.emblaApi?.scrollTo(index);
// }

useSeoMeta({
  title: 'Menú de la semana',
  description: 'Consulta el menú de la semana',
});
</script>

<template>
  <section>
    <BaseSection title="Menú de la semana">
      <template #description>
        <ClientOnly>
          <Icon name="lucide:calendar-days" size="24" /> <span>{{ startDate }}</span> - <span>{{ endDate }}</span>
        </ClientOnly>
      </template>

      <section>
        <!-- <section class="flex justify-center md:justify-end">
          <SelectMenu @type-changed="(e) => getMenu(e)" />
        </section> -->
        <section class="mb-8 md:hidden">
          <UCarousel
            ref="carousel"
            v-slot="{ item }"
            :items="days"
            class="w-full max-w-xs mx-auto py-6"
            wheel-gestures
            dots
          >
            <MenuCard :day="item" />
          </UCarousel>

          <!-- <div class="flex gap-1 justify-between pt-4 max-w-xs mx-auto">
            <div
              v-for="(_, index) in days"
              :key="index"
              class="size-11 opacity-25 hover:opacity-100 transition-opacity"
              :class="{ 'opacity-100': activeIndex === index }"
              @click="select(index)"
            >
              <UButton :label="indexName(index + 1)" />
            </div>
          </div> -->
          <!-- <MenuCard :days="activeMenu?.days" /> -->
        </section>

        <section class="hidden md:flex md:flex-col md:gap-8">
          <MenuCard v-for="item in days" :day="item" :key="item.id" />
        </section>

        <section class="pt-8 flex justify-center items-center">
          <UButton label="Quiero hacer un pedido" icon="i-mdi-whatsapp" />
        </section>
      </section>
    </BaseSection>

    <!-- <USeparator /> -->
  </section>
</template>
