<script setup lang="ts">
import {toast} from '@/components/ui/toast/use-toast'
const roomId = ref('');
const roomLocate = async () => {
  toast({
    title: 'Вы будете перемещены в комнату',
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify({
      roomId: roomId.value,
    }, null, 2))),
  })
  await useRouter().push({ path: `/code/${roomId.value}` });
}

computed(()=> {
  roomLocate()
});
</script>

<template>
  <header class="header">
    <div class="header__container container">
      <NuxtLink class="header__logo-link" href="https://github.com/IvanMalkS/codether">
        <p class="header__logo text-5xl">codether.ru</p>
      </NuxtLink>
      <nav class="header__nav flex justify-between gap-10 items-center">
        <NuxtLink class="header__nav-link block text-2xl" to="/">Создать</NuxtLink>
        <NuxtLink class="header__nav-link block text-2xl" href="https://api.codether.io">Доки</NuxtLink>
        <Input class="block" v-model="roomId" @keyup.enter="roomLocate" placeholder="Веедите номер"/>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header__container {
  display: flex;
  justify-content: space-around;
  padding-top: 10px;
  padding-bottom: 10px;

  @media (max-width: 768px) {
    gap: 20px;
    flex-direction: column;
    align-items: center;
  }
}

.header__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 320px) {
    flex-direction: column;
    gap: 10px;
  }
}

.text-2xl {
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}
</style>