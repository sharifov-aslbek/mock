<script setup>
import { computed, ref , onMounted , onBeforeUnmount } from 'vue'
import { NButton, NCard, NLayout, NLayoutContent, NLayoutSider } from 'naive-ui'
import DashboardSidebar from '@/components/DashboardSidebar.vue'
import DashboardTopbar from '@/components/DashboardTopbar.vue'

const dashboardType = 'admin'

const mobileSidebarOpen = ref(false)
const dashboardModes = {
  admin: {
    brandLabel: 'MILLIY',
    roleLabel: 'ADMIN',
    modeLabel: 'Admin',
    userName: 'MilliyMock Admin',
    userRole: 'Administrator',
    avatarLetter: 'A',
    initialSection: 'dashboard',
    sidebarItems: [
      { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { key: 'users', label: 'Users', icon: 'users' },
      { key: 'projects', label: 'Projects', icon: 'projects' },
      {
        key: 'payments',
        label: 'Payments',
        icon: 'payments',
        children: ['Transactions', 'Invoices']
      },
      {
        key: 'auth',
        label: 'Auth',
        icon: 'auth',
        children: ['Sign in', 'Register']
      },
      { key: 'faq', label: 'FAQ', icon: 'faq' },
      { key: 'error', label: '404', icon: 'error' },
      { key: 'account', label: 'Account preferences', icon: 'account' },
      { key: 'settings', label: 'Application settings', icon: 'settings' }
    ],
    sections: {
      dashboard: {
        eyebrow: 'Boshqaruv paneli',
        title: 'Asosiy ko‘rinish',
        description: 'Platformadagi foydalanuvchilar, loyihalar va to‘lovlar bo‘yicha umumiy boshqaruv shu yerdan boshlanadi.',
        cards: [
          { title: 'Foydalanuvchilar', value: '1,248', subtitle: 'faol akkauntlar' },
          { title: 'Loyihalar', value: '32', subtitle: 'joriy ishlar' },
          { title: 'To‘lovlar', value: '18', subtitle: 'tekshiruvda' }
        ]
      },
      users: {
        eyebrow: 'Users',
        title: 'Foydalanuvchilar bo‘limi',
        description: 'Ro‘yxatdan o‘tgan foydalanuvchilarni kuzatish, rollarni boshqarish va faollikni tekshirish uchun joy.',
        cards: [
          { title: 'Yangi foydalanuvchi', value: '86', subtitle: 'so‘nggi 7 kun' },
          { title: 'Tutorlar', value: '24', subtitle: 'tasdiqlangan' },
          { title: 'Talabalar', value: '1,138', subtitle: 'faol' }
        ]
      },
      projects: {
        eyebrow: 'Projects',
        title: 'Loyihalar boshqaruvi',
        description: 'Test paketlari, ichki topshiriqlar va mahsulot bo‘yicha ishlayotgan yo‘nalishlarni shu joyda yig‘ing.',
        cards: [
          { title: 'Faol loyiha', value: '14', subtitle: 'joriy sprint' },
          { title: 'Rejada', value: '9', subtitle: 'keyingi bosqich' },
          { title: 'Yakunlangan', value: '27', subtitle: 'bu chorak' }
        ]
      },
      payments: {
        eyebrow: 'Payments',
        title: 'To‘lovlar markazi',
        description: 'Tariflar, kelib tushgan to‘lovlar va kutilayotgan invoice jarayonlarini soddalashtirilgan ko‘rinishda boshqaring.',
        cards: [
          { title: 'Yangi to‘lov', value: '54', subtitle: 'bugun' },
          { title: 'Kutilayotgan', value: '12', subtitle: 'tasdiqlash kerak' },
          { title: 'Jami summa', value: '$6,820', subtitle: 'oylik tushum' }
        ]
      },
      'payments:Transactions': {
        eyebrow: 'Payments',
        title: 'Tranzaksiyalar',
        description: 'Barcha tranzaksiyalar oqimini ko‘rish va tekshirish uchun bo‘lim.',
        cards: [
          { title: 'Muvaffaqiyatli', value: '201', subtitle: 'oy davomida' },
          { title: 'Qaytgan', value: '7', subtitle: 'refund' },
          { title: 'Kutilayotgan', value: '4', subtitle: 'processing' }
        ]
      },
      'payments:Invoices': {
        eyebrow: 'Payments',
        title: 'Invoice lar',
        description: 'Chiqadigan invoice lar va ularga bog‘liq statuslarni boshqarish maydoni.',
        cards: [
          { title: 'Ochiq invoice', value: '35', subtitle: 'to‘lanmagan' },
          { title: 'Yuborilgan', value: '48', subtitle: 'mijozlarga' },
          { title: 'Muddati o‘tgan', value: '3', subtitle: 'tezkor nazorat' }
        ]
      },
      auth: {
        eyebrow: 'Auth',
        title: 'Autentifikatsiya',
        description: 'Kirish, ro‘yxatdan o‘tish va xavfsizlik oqimlarini boshqarishga mo‘ljallangan bo‘lim.',
        cards: [
          { title: 'Kirish urinishlari', value: '412', subtitle: 'bugun' },
          { title: 'Bloklanganlar', value: '9', subtitle: 'xavfsizlik sababli' },
          { title: '2FA yoqilgan', value: '68%', subtitle: 'adminlar orasida' }
        ]
      },
      'auth:Sign in': {
        eyebrow: 'Auth',
        title: 'Kirish oynasi',
        description: 'Sign in oqimi, validatsiya va foydalanuvchi kirish holatini nazorat qilish uchun joy.',
        cards: [
          { title: 'Bugungi login', value: '328', subtitle: 'muvaffaqiyatli' },
          { title: 'Xato kirish', value: '14', subtitle: 'parol xatosi' },
          { title: 'Faol sessiya', value: '94', subtitle: 'hozir onlayn' }
        ]
      },
      'auth:Register': {
        eyebrow: 'Auth',
        title: 'Ro‘yxatdan o‘tish',
        description: 'Yangi foydalanuvchi onboarding jarayonlari va ro‘yxatdan o‘tish oqimlari shu bo‘limda jamlanadi.',
        cards: [
          { title: 'Yangi ariza', value: '57', subtitle: 'kutmoqda' },
          { title: 'Tasdiqlangan', value: '41', subtitle: 'ushbu hafta' },
          { title: 'Konversiya', value: '62%', subtitle: 'landingdan' }
        ]
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'Ko‘p so‘raladigan savollar',
        description: 'Foydalanuvchilar ko‘p so‘raydigan savollarni, tayyor javoblar va yordam ssenariylarini shu yerdan boshqaring.',
        cards: [
          { title: 'FAQ kategoriyasi', value: '12', subtitle: 'mavjud' },
          { title: 'Yangi savol', value: '8', subtitle: 'ushbu hafta' },
          { title: 'Ko‘rishlar', value: '4.2k', subtitle: 'so‘nggi oy' }
        ]
      },
      error: {
        eyebrow: '404',
        title: '404 sahifa nazorati',
        description: 'Topilmagan sahifalar bo‘yicha foydalanuvchi oqimini va yo‘naltirishlarni nazorat qiling.',
        cards: [
          { title: '404 hit', value: '91', subtitle: 'bugun' },
          { title: 'Top URL', value: '/old-pricing', subtitle: 'eng ko‘p uchragan' },
          { title: 'Redirects', value: '6', subtitle: 'faol' }
        ]
      },
      account: {
        eyebrow: 'Account',
        title: 'Akkaunt sozlamalari',
        description: 'Profil, til, xavfsizlik va bildirishnomalarni boshqarishga mo‘ljallangan panel.',
        cards: [
          { title: 'Adminlar', value: '5', subtitle: 'imtiyozli rol' },
          { title: 'Til sozlamasi', value: '3', subtitle: 'faol variant' },
          { title: 'Xavfsizlik', value: 'Yuqori', subtitle: 'joriy daraja' }
        ]
      },
      settings: {
        eyebrow: 'Settings',
        title: 'Ilova sozlamalari',
        description: 'Platforma bo‘yicha umumiy sozlamalar, integratsiyalar va tizim parametrlarini boshqarish joyi.',
        cards: [
          { title: 'Integratsiya', value: '7', subtitle: 'ulangan xizmat' },
          { title: 'Muhit', value: 'Prod', subtitle: 'joriy server' },
          { title: 'Yangilanish', value: '2', subtitle: 'kutilmoqda' }
        ]
      }
    }
  },
  user: {
    brandLabel: 'MILLIY',
    roleLabel: 'USER',
    modeLabel: 'User',
    userName: 'MilliyMock Student',
    userRole: 'Foydalanuvchi',
    avatarLetter: 'U',
    initialSection: 'solve-tests',
    sidebarItems: [
      { key: 'solve-tests', label: 'Test yechish', icon: 'dashboard' },
      {
        key: 'old-tests',
        label: 'Eski testlar',
        icon: 'projects',
        children: ['Natijalar', 'Tahlil']
      },
      { key: 'my-progress', label: 'Mening natijalarim', icon: 'payments' },
      { key: 'ranking', label: 'Reyting', icon: 'users' },
      { key: 'saved-tests', label: 'Saqlangan testlar', icon: 'faq' },
      {
        key: 'profile',
        label: 'Profil',
        icon: 'account',
        children: ['Sozlamalar', 'Xavfsizlik']
      },
      { key: 'logout', label: 'Logout', icon: 'auth' }
    ],
    sections: {
      'solve-tests': {
        eyebrow: 'Test yechish',
        title: 'Yangi testni boshlang',
        description: 'Mos testni tanlang, vaqtni belgilang va natijangizni real imtihon formatida sinab ko‘ring.',
        cards: [
          { title: 'Bugungi testlar', value: '12', subtitle: 'yangi qo‘shilgan' },
          { title: 'Bepul testlar', value: '5', subtitle: 'darhol ishlash mumkin' },
          { title: 'Jarayondagi test', value: '2', subtitle: 'davom ettirish mumkin' }
        ]
      },
      'old-tests': {
        eyebrow: 'Eski testlar',
        title: 'Avval ishlangan testlar',
        description: 'Oldingi test tarixini ko‘ring, natijalarni solishtiring va kuchsiz mavzularni aniqlang.',
        cards: [
          { title: 'Jami ishlangan', value: '48', subtitle: 'oxirgi 3 oy' },
          { title: 'O‘rtacha ball', value: '78%', subtitle: 'umumiy ko‘rsatkich' },
          { title: 'Eng yaxshi natija', value: '92%', subtitle: 'so‘nggi rekord' }
        ]
      },
      'old-tests:Natijalar': {
        eyebrow: 'Eski testlar',
        title: 'Natijalar tarixi',
        description: 'Har bir test bo‘yicha to‘plangan ballar va ishlash sanalari shu yerda ko‘rinadi.',
        cards: [
          { title: 'Matematika', value: '84%', subtitle: 'oxirgi urinish' },
          { title: 'Ona tili', value: '76%', subtitle: 'oxirgi urinish' },
          { title: 'Mantiq', value: '81%', subtitle: 'oxirgi urinish' }
        ]
      },
      'old-tests:Tahlil': {
        eyebrow: 'Eski testlar',
        title: 'Xatolar tahlili',
        description: 'Noto‘g‘ri ishlangan savollar va qaysi mavzularda xato ko‘p bo‘layotganini tahlil qiling.',
        cards: [
          { title: 'Algebra', value: '12', subtitle: 'xato savol' },
          { title: 'Geometriya', value: '7', subtitle: 'xato savol' },
          { title: 'Funksiya', value: '5', subtitle: 'xato savol' }
        ]
      },
      'my-progress': {
        eyebrow: 'Natijalar',
        title: 'Mening rivojlanishim',
        description: 'Haftalik va oylik natijalarni kuzatib, qaysi yo‘nalishda o‘sayotganingizni baholang.',
        cards: [
          { title: 'Haftalik o‘sish', value: '+6%', subtitle: 'o‘tgan haftaga nisbatan' },
          { title: 'Topilgan mavzu', value: '3', subtitle: 'yaxshilanish bor' },
          { title: 'Maqsadga yaqinlik', value: '82%', subtitle: 'umumiy progress' }
        ]
      },
      ranking: {
        eyebrow: 'Reyting',
        title: 'Sizning o‘rningiz',
        description: 'Boshqa foydalanuvchilar bilan solishtirganda umumiy reyting va kuchli tomonlaringiz ko‘rsatiladi.',
        cards: [
          { title: 'Joriy o‘rin', value: '#18', subtitle: 'ushbu hafta' },
          { title: 'Hudud bo‘yicha', value: '#6', subtitle: 'Toshkent' },
          { title: 'Ball farqi', value: '+24', subtitle: 'keyingi o‘rin bilan' }
        ]
      },
      'saved-tests': {
        eyebrow: 'Saqlanganlar',
        title: 'Saqlangan testlar',
        description: 'Keyin ishlash uchun belgilab qo‘yilgan testlarni bir joyda to‘plang.',
        cards: [
          { title: 'Saqlangan', value: '9', subtitle: 'hammasi' },
          { title: 'Bepul', value: '4', subtitle: 'ichida mavjud' },
          { title: 'Yangi', value: '3', subtitle: 'hali ochilmagan' }
        ]
      },
      profile: {
        eyebrow: 'Profil',
        title: 'Foydalanuvchi profili',
        description: 'Shaxsiy ma’lumotlar, o‘qish maqsadlari va hisob sozlamalarini boshqaring.',
        cards: [
          { title: 'Daraja', value: 'Intermediate', subtitle: 'joriy bosqich' },
          { title: 'Maqsad ball', value: '85%', subtitle: 'belgilangan' },
          { title: 'Faollik', value: '21 kun', subtitle: 'ketma-ket kirish' }
        ]
      },
      'profile:Sozlamalar': {
        eyebrow: 'Profil',
        title: 'Profil sozlamalari',
        description: 'Til, bildirishnoma va shaxsiy o‘qish rejimlarini shu bo‘limda yangilang.',
        cards: [
          { title: 'Til', value: 'O‘zbekcha', subtitle: 'tanlangan' },
          { title: 'Reminder', value: 'Yoqilgan', subtitle: 'har kuni 19:00' },
          { title: 'Maqsad', value: 'Milliy sertifikat', subtitle: 'asosiy yo‘nalish' }
        ]
      },
      'profile:Xavfsizlik': {
        eyebrow: 'Profil',
        title: 'Xavfsizlik sozlamalari',
        description: 'Parol, qurilmalar va login xavfsizligini boshqarish uchun asosiy bo‘lim.',
        cards: [
          { title: 'Parol', value: 'Yangilangan', subtitle: '14 kun oldin' },
          { title: 'Qurilmalar', value: '2', subtitle: 'faol' },
          { title: '2 bosqichli kirish', value: 'Ochiq', subtitle: 'himoya yoqilgan' }
        ]
      },
      logout: {
        eyebrow: 'Logout',
        title: 'Hisobdan chiqish',
        description: 'Hisobdan chiqishdan oldin davom etayotgan testlar va saqlangan natijalar holatini tekshirib oling.',
        cards: [
          { title: 'Jarayondagi test', value: '2', subtitle: 'saqlanadi' },
          { title: 'Saqlangan progress', value: '100%', subtitle: 'yo‘qolmaydi' },
          { title: 'Oxirgi login', value: 'Bugun', subtitle: '17:42' }
        ]
      }
    }
  }
}

const currentMode = dashboardModes[dashboardType] || dashboardModes.admin
const activeSection = ref(currentMode.initialSection)

const currentSection = computed(
  () => currentMode.sections[activeSection.value] || currentMode.sections[currentMode.initialSection]
)
const sectionTitle = computed(() => currentSection.value.title)

const selectSection = (section) => {
  activeSection.value = section
  mobileSidebarOpen.value = false
}

const isDesktop = ref(false)

const checkScreen = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreen)
})
</script>

<template>
  <NLayout has-sider class="min-h-screen bg-[#f7f7f5]">
       <n-layout has-sider>
  <n-layout-sider
    v-if="isDesktop"
    collapse-mode="width"
    :collapsed-width="0"
    :width="290"
    :native-scrollbar="false"
    content-class="h-full"
  >
    <DashboardSidebar
      :items="currentMode.sidebarItems"
      :active-section="activeSection"
      :brand-label="currentMode.brandLabel"
      :role-label="currentMode.roleLabel"
      @select="selectSection"
    />
  </n-layout-sider>

</n-layout>

        <div
          v-if="mobileSidebarOpen"
          class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          @click="mobileSidebarOpen = false"
        ></div>

        <div
          class="fixed inset-y-0 left-0 z-50 w-[290px] -translate-x-full transition-transform duration-300 lg:hidden"
          :class="mobileSidebarOpen ? 'translate-x-0' : ''"
        >
          <DashboardSidebar
            :items="currentMode.sidebarItems"
            :active-section="activeSection"
            :brand-label="currentMode.brandLabel"
            :role-label="currentMode.roleLabel"
            @select="selectSection"
          />
        </div>

    <NLayout class="h-[100vh]">
          <div class="relative overflow-hidden">
        <div class="absolute inset-0 -z-10 bg-white/70"></div>
        <div class="absolute left-10 top-10 -z-10 h-48 w-48 rounded-full bg-slate-300/30 blur-3xl"></div>
        <div class="absolute right-10 top-0 -z-10 h-56 w-56 rounded-full bg-gray-300/25 blur-3xl"></div>
            <DashboardTopbar
              :section-title="sectionTitle"
              :mode-label="currentMode.modeLabel"
              :user-name="currentMode.userName"
              :user-role="currentMode.userRole"
              :avatar-letter="currentMode.avatarLetter"
              @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
            />
          </div>

      <NLayoutContent class="relative overflow-hidden bg-[#f7f7f5] p-4 sm:p-6 lg:p-8">
        <div class="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-white/90 to-transparent"></div>
        <div class="absolute left-0 top-0 -z-10 h-72 w-72 rounded-full bg-slate-300/20 blur-3xl"></div>
        <div class="absolute right-10 top-20 -z-10 h-64 w-64 rounded-full bg-neutral-300/20 blur-3xl"></div>

        <div class="mb-6 rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{{ currentSection.eyebrow }}</p>
          <div class="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl">
              <h2 class="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {{ currentSection.title }}
              </h2>
              <p class="mt-3 text-base leading-7 text-slate-600">
                {{ currentSection.description }}
              </p>
            </div>

            <NButton color="#111111" text-color="#ffffff" class="min-w-[180px] rounded-2xl">
              Bo‘limni ochish
            </NButton>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <NCard
                v-for="item in currentSection.cards"
                :key="item.title"
                class="rounded-[28px] border border-black/10 bg-white/85 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                content-class="!p-6"
              >
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {{ item.title }}
                </p>
                <p class="mt-4 text-4xl font-black tracking-tight text-slate-900">{{ item.value }}</p>
                <p class="mt-2 text-sm text-slate-500">{{ item.subtitle }}</p>
              </NCard>
        </div>
          </NLayoutContent>
        </NLayout>
  </NLayout>
</template>
