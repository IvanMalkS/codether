<template>
  <div class="input">
    <label class="input__label" :for="uniqueId">{{ inputLabel }}</label>
    <input
        class="input__field"
        :id="uniqueId"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :min="min"
        :max="max"
    >
  </div>
</template>
<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'

defineProps(['inputLabel', 'modelValue', 'type', 'min', 'max'])
const uniqueId = ref(uuidv4())
</script>

<style scoped lang="scss">
.input {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__field {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #66FCF1;
    border-radius: 0.25rem;
    background-color: transparent;
    color: inherit;

    &:focus {
      outline: none;
      border-color: #45A29E;
    }

    &:hover {
      border-color: #45A29E;
    }
  }

  &__label {
    display: block;
  }
}
</style>
