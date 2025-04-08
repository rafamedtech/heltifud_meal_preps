<template>
  <div>
    <section
      class="container mx-auto flex w-full flex-col-reverse items-center justify-center gap-8 py-8 md:flex-row md:gap-12 md:py-20"
    >
      <div class="md:w-1/2">
        <h1 class="mb-4 text-4xl leading-snug font-bold md:text-5xl">
          Comidas saludables, directo a tu puerta
        </h1>
        <p class="mb-8 text-xl">
          Transforma tu alimentación con comidas caseras, equilibradas y
          deliciosas, sin complicaciones.
        </p>
        <section class="flex gap-4">
          <UButton to="/" size="lg"> Ver planes </UButton>
          <UButton variant="outline" to="/" size="lg"> Ver Menú </UButton>
        </section>
      </div>
      <figure class="overflow-hidden rounded-2xl shadow-2xl">
        <NuxtImg src="/hero-new.jpeg" alt="Hero" width="400" height="550" />
      </figure>
    </section>

    <USeparator />

    <section
      class="container mx-auto flex w-full flex-col-reverse items-center justify-center gap-8 py-8 md:flex-row md:gap-12 md:py-20"
    >
      <figure class="overflow-hidden rounded-2xl shadow-2xl">
        <NuxtImg src="/hero.png" alt="Why Us" width="400" height="400" />
      </figure>
      <div class="md:w-1/2">
        <h2 class="text-primary-500 mb-4 text-3xl font-bold">
          ¿Qué es Heltifud Meal Preps?
        </h2>
        <p class="pt-2 text-lg">
          Somos un servicio de meal prep semanal que ofrece comida casera,
          saludable y balanceada. Te entregamos todo listo para disfrutar, sin
          cocinar ni preocuparte por planear tus comidas.
        </p>
      </div>
    </section>

    <USeparator />

    <section class="py-8">
      <article>
        <h2 class="text-primary-500 mb-4 text-3xl font-bold">
          ¿Cómo funciona el servicio?
        </h2>
        <p class="pt-2 text-lg lg:w-1/2">
          Para recibir tus meal preps a la puerta de tu hogar sólo sigue los
          siguientes pasos:
        </p>
      </article>

      <!-- Como funciona el servicio -->
      <section>
        <!-- Versión movil -->
        <div class="py-8 md:hidden">
          <BaseGallery :items="steps" />
        </div>

        <!-- Versión desktop -->
        <div
          class="hidden grid-cols-1 justify-between gap-4 py-8 md:grid md:grid-cols-4"
        >
          <BaseCard
            v-for="{ id, title, description, button, image } in steps"
            card-style="complex"
            :key="id"
            :title
            :description
            :button
            :image
          />
        </div>
      </section>
    </section>

    <USeparator />

    <section class="py-8">
      <article>
        <h2 class="text-primary-500 mb-4 text-3xl font-bold">
          Menú de la semana
        </h2>
        <p class="pt-2 text-lg lg:w-1/2">
          Descubre nuestro menú semanal, lleno de opciones deliciosas y
          saludables. Cada semana, ofrecemos una variedad de platos para que
          disfrutes.
        </p>
      </article>

      <section class="pt-4 pb-8">
        <BaseGallery :items="menuItems" :autoplay="3000" />
      </section>

      <section class="flex flex-col items-center justify-center gap-4 pt-8">
        <p class="text-center text-lg md:text-left">
          Consulta lo que prepararemos para la próxima semana
        </p>
        <UButton to="/menu" size="lg">Ver Menú</UButton>
      </section>
    </section>

    <USeparator />

    <section class="py-8">
      <article>
        <h2 class="text-primary-500 mb-4 text-3xl font-bold">
          ¿Por qué elegirnos?
        </h2>
        <p class="pt-2 text-lg lg:w-1/2">
          En Heltifud nos preocupamos por ofrecerte un servicio de calidad y
          confianza. Nuestros ingredientes son frescos y seleccionados con
          cuidado.
        </p>
      </article>

      <div class="py-8 md:hidden">
        <BaseGallery :items="benefits" :autoplay="4000" />
      </div>

      <section
        class="hidden grid-cols-1 justify-between gap-4 py-8 md:grid md:grid-cols-4"
      >
        <BaseCard
          v-for="{ id, title, description, image } in benefits"
          :key="id"
          :title
          :description
          :image
        >
        </BaseCard>
      </section>
    </section>
  </div>
</template>
