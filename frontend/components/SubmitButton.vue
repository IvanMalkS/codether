<script setup lang="ts">
interface Props {
  textSubmit: string;
  disableSubmit: boolean;
}

defineProps<Props>();
</script>

<template>
  <button class="submit-button" :disabled="disableSubmit" type="submit">{{ textSubmit }}</button>
</template>

<style scoped lang="scss">
.submit-button {
  margin: 20px auto 0;
  display: block;
  padding: 15px 50px;
  background-color: transparent;
  color: inherit;
  border: 2px solid #66FCF1;
  border-radius: 5px;

  &:hover {
    background-color: #45A29E;
    color: #000;
  }

  &:focus {
    outline: none;
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>