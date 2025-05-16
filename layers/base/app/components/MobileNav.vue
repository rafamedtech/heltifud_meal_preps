<script setup lang="ts"></script>

<template>
  <UNavigationMenu
    orientation="horizontal"
    variant="link"
    :items="links"
    :ui="{
      root: 'justify-between w-full [&>div]:min-w-full',
      item: 'flex-[1]',
      link: 'flex-col ',
    }"
  />
</template>
