<template>
  <div>
    <section
      class="container mx-auto flex w-full flex-col-reverse items-center justify-center gap-8 py-8 md:flex-row md:gap-12 md:py-20"
    >
      <div class="md:w-1/2">
        <h1 class="mb-4 text-4xl leading-snug font-bold md:text-5xl">Comidas saludables, directo a tu puerta</h1>
        <p class="mb-8 text-xl">
          Transforma tu alimentación con comidas caseras, equilibradas y deliciosas, sin complicaciones.
        </p>
        <section class="flex gap-4">
          <BaseButton to="/planes" size="lg" icon="i-heroicons-list-bullet-20-solid" label="Ver planes" />

          <BaseButton variant="outline" to="/menu" label="Ver Menú" icon="i-heroicons-newspaper" />
        </section>
      </div>
      <figure class="overflow-hidden shadow-2xl md:ml-14 border border-primary-500">
        <!-- <img src="/hero-new.jpeg" alt="Hero" width="400" height="550" /> -->
        <NuxtImg
          src="https://res.cloudinary.com/rafamed-dev/image/upload/v1746204406/heltifud/hero-new_mkqivn.jpg"
          alt="Hero"
          width="400"
          height="550"
        />
      </figure>
    </section>

    <USeparator />

    <BaseSection title="¿Qué es Heltifud Meal Preps?" layout="columns">
      <template #description>
        Somos un servicio de meal prep semanal que ofrece comida casera, saludable y balanceada. Te entregamos todo
        listo para disfrutar, sin cocinar ni preocuparte por planear tus comidas.
      </template>

      <figure class="flex items-center justify-center overflow-hidden">
        <NuxtImg
          src="https://res.cloudinary.com/rafamed-dev/image/upload/v1746204408/heltifud/hero_or5twy.png"
          width="400"
          height="550"
          class="shadow-2xl md:m-12"
        />
      </figure>
    </BaseSection>

    <!-- <section
      class="container mx-auto flex w-full flex-col-reverse items-center justify-center gap-8 py-8 md:flex-row md:gap-12 md:py-20"
    >
      <figure class="overflow-hidden  shadow-2xl">
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
    </section> -->

    <USeparator />

    <!-- Como funciona el servicio -->
    <BaseSection title="¿Cómo funciona el servicio?">
      <template #description>
        Para recibir tus meal preps a la puerta de tu hogar sólo sigue los siguientes pasos:
      </template>

      <!-- Versión movil -->
      <div class="md:hidden">
        <BaseGallery :items="steps" />
      </div>

      <!-- Versión desktop -->
      <div class="hidden md:grid md:grid-cols-4 md:justify-between md:gap-4 md:py-4">
        <BaseCard
          v-for="{ id, title, description, button, image } in steps"
          :key="id"
          card-style="complex"
          :title
          :description
          :button
          :image
        />
      </div>
    </BaseSection>

    <USeparator />

    <BaseSection title="Menú de la semana">
      <template #description>
        Descubre nuestro menú semanal, lleno de opciones deliciosas y saludables. Cada semana, ofrecemos una variedad de
        platos para que disfrutes.
      </template>

      <section class="pb-4">
        <BaseGallery :items="menuItems" :autoplay="3000" />
      </section>

      <template #footer>
        <p class="text-center text-lg md:text-left">Consulta lo que prepararemos para la próxima semana</p>
        <BaseButton to="/menu" label="Ver Menú" icon="i-heroicons-newspaper" />
      </template>
    </BaseSection>

    <!-- <section class="py-8">
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
        <BaseButton to="/menu" label="Ver Menú" icon="i-heroicons-newspaper" />
      </section>
    </section> -->

    <USeparator />

    <!-- Sección de promoción -->
    <BaseSection title="¡Promoción en tu primer pedido!" title-size="lg" layout="columns">
      <template #description>
        Recibe $100 pesos de descuento así como un set de cubiertos reutilizables en tu primer pedido
      </template>

      <template #actions>
        <BaseButton label="Reclamar promoción" icon="i-lucide-rocket" />
      </template>

      <figure class="flex items-center justify-center overflow-hidden">
        <NuxtImg
          src="https://res.cloudinary.com/rafamed-dev/image/upload/v1746204411/heltifud/promo_hbku0g.png"
          width="400"
          height="550"
          class="shadow-2xl md:m-12"
        />
      </figure>
    </BaseSection>

    <USeparator />

    <!-- Sección de beneficios -->
    <BaseSection title="¿Por qué elegirnos?">
      <template #description>
        En Heltifud nos preocupamos por ofrecerte un servicio de calidad y confianza. Nuestros ingredientes son frescos
        y seleccionados con cuidado.
      </template>

      <div class="md:hidden">
        <BaseGallery :items="benefits" :autoplay="4000" dots />
      </div>

      <section class="hidden pt-4 md:grid md:grid-cols-4 md:justify-between md:gap-4">
        <BaseCard v-for="{ id, title, description, image } in benefits" :key="id" :title :description :image />
      </section>
    </BaseSection>

    <USeparator />

    <BaseSection title="Preguntas frecuentes">
      <template #description>
        Aquí encontrarás respuestas a las preguntas más comunes sobre nuestro servicio. Si tienes alguna duda adicional,
        no dudes en contactarnos.
      </template>

      <section class="mx-auto flex flex-col justify-between gap-8 py-8 md:w-1/2">
        <FaqQuestion
          v-for="question in faqQuestions"
          :key="question.id"
          :question="question.question"
          :answer="question.answer"
        />
      </section>
    </BaseSection>

    <USeparator />
  </div>
</template>
