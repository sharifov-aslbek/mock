<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const coatOfArmsSrc = '@/assets/gerb.png'

function hideBrokenImage(event) {
  event.target.style.display = 'none'
}
</script>

<template>
  <div class="certificate-page">
    <div class="frame"></div>
    <div class="ornament-top-right"></div>
    <div class="ornament-bottom-left"></div>

    <div class="content">
      <div class="logo">
        <img :src="coatOfArmsSrc" alt="O'zbekiston gerbi" @error="hideBrokenImage" />
      </div>

      <h1 class="top-title">
        O‘ZBEKISTON RESPUBLIKASI OLIY TA’LIM, FAN VA INNOVATSIYALAR VAZIRLIGI<br />
        HUZURIDAGI BILIM VA MALAKALARNI BAHOLASH AGENTLIGI
      </h1>

      <hr class="divider-strong" />

      <h2 class="main-title">
        {{ data.subject }} BILISH DARAJASI<br />
        TO‘G‘RISIDA SERTIFIKAT
      </h2>

      <div class="row-between certificate-number">
        <div><span class="label">Sertifikat raqami:</span></div>
        <div class="value">{{ data.certificateNumber }}</div>
      </div>

      <hr class="divider-soft" />

      <div class="info-section">
        <div class="info-grid">
          <div class="label">Talabgorning shaxsiy kodi:</div>
          <div class="value">{{ data.personalCode }}</div>

          <div class="label">Familiyasi:</div>
          <div class="value">{{ data.lastName }}</div>

          <div class="label">Ismi:</div>
          <div class="value">{{ data.firstName }}</div>

          <div class="label">Otasining ismi:</div>
          <div class="value">{{ data.fatherName }}</div>
        </div>

        <div class="photo">
          <svg class="photo-icon" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="photoBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f7ecd0" />
                <stop offset="100%" stop-color="#e3ce9c" />
              </linearGradient>
            </defs>
            <rect x="0.5" y="0.5" width="63" height="79" fill="url(#photoBg)" stroke="#c19c5c" stroke-width="1" />
            <circle cx="32" cy="30" r="11" fill="none" stroke="#8a6a2e" stroke-width="2" />
            <path
              d="M12 70 C14 55, 22 49, 32 49 C42 49, 50 55, 52 70 Z"
              fill="none"
              stroke="#8a6a2e"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <hr class="divider-soft" />

      <div class="subject-grid">
        <div class="label">Testning nomi:</div>
        <div class="value">{{ data.subject }}</div>

        <div class="label">Umumiy to‘plagan bali:</div>
        <div class="value">{{ data.totalScore }}</div>

        <div class="label">Maksimal ball:</div>
        <div class="value">{{ data.maxScore }}</div>

        <div class="label">Umumiy ballga nisbatan foiz ko‘rsatkichi:</div>
        <div class="value">{{ data.percentage }}</div>

        <div class="label">Sertifikat darajasi:</div>
        <div class="value">{{ data.grade }}</div>
      </div>

      <div class="results-title">Test natijalari:</div>

      <div class="results">
        <template v-for="row in data.resultRows" :key="row.name">
          <div class="name muted">{{ row.name }}</div>
          <div class="score">{{ row.score }}</div>
        </template>
      </div>

      <div class="bottom-area">
        <div class="bottom-meta">
          <div>
            <span class="label">Berilgan sanasi:</span>
            <span class="value">{{ data.issuedDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="fake-stamp" aria-hidden="true">
      <div class="stamp-inner">
        <span class="stamp-main">Sertifikat</span>
        <div class="stamp-divider"></div>
        <span class="stamp-sub">Original emas</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.certificate-page {
  position: relative;
  width: 794px;
  min-height: 1123px;
  color: #2d2518;
  background: linear-gradient(135deg, #eee1bf 0%, #e3ce9c 100%);
  border: 8px solid #c19c5c;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 1;
  font-family: 'Times New Roman', Georgia, serif;
}

.certificate-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23c19c5c' stroke-width='1' fill='none' opacity='0.18'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' /%3E%3Cpath d='M15 15 L45 15 L45 45 L15 45 Z' /%3E%3Cpath d='M0 0 L60 60 M60 0 L0 60' /%3E%3C/g%3E%3C/svg%3E");
  z-index: -1;
  pointer-events: none;
}

.frame {
  position: absolute;
  inset: 6px;
  border: 1px solid #c19c5c;
  pointer-events: none;
  z-index: 2;
}

.ornament-top-right,
.ornament-bottom-left {
  position: absolute;
  width: 360px;
  height: 360px;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23c19c5c' stroke-width='2' fill='none' opacity='0.75'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' /%3E%3Cpath d='M15 15 L45 15 L45 45 L15 45 Z' /%3E%3Cpath d='M0 0 L60 60 M60 0 L0 60' /%3E%3C/g%3E%3C/svg%3E");
}

.ornament-top-right {
  top: 0;
  right: 0;
  -webkit-mask-image: radial-gradient(circle at 100% 0%, black 15%, transparent 70%);
  mask-image: radial-gradient(circle at 100% 0%, black 15%, transparent 70%);
}

.ornament-bottom-left {
  left: 0;
  bottom: 0;
  -webkit-mask-image: radial-gradient(circle at 0% 100%, black 15%, transparent 70%);
  mask-image: radial-gradient(circle at 0% 100%, black 15%, transparent 70%);
}

.content {
  position: relative;
  z-index: 3;
  padding: 54px 58px 44px;
}

.logo {
  width: 140px;
  height: 140px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.top-title {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  margin: 0;
}

.divider-strong {
  border: none;
  border-top: 4px solid #2d2518;
  margin: 20px 0 16px;
}

.main-title {
  text-align: center;
  font-size: 25px;
  line-height: 1.45;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0 0 24px;
  padding: 0 36px;
}

.row-between {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: baseline;
}

.certificate-number {
  font-size: 18px;
  margin-bottom: 10px;
}

.certificate-number .label,
.info-grid .label,
.subject-grid .label,
.results .name,
.bottom-meta .label {
  font-weight: 600;
  color: #333;
}

.certificate-number .value,
.info-grid .value,
.subject-grid .value,
.results .score,
.bottom-meta .value {
  font-weight: 700;
  color: #111;
}

.divider-soft {
  border: none;
  border-top: 1px solid rgba(45, 37, 24, 0.4);
  margin: 12px 0 20px;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 132px;
  gap: 26px;
  align-items: start;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  row-gap: 16px;
  column-gap: 20px;
  font-size: 18px;
}

.photo {
  width: 132px;
  height: 164px;
  border: 1px solid rgba(45, 37, 24, 0.4);
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: 4px;
}

.photo-icon {
  width: 100%;
  height: 100%;
  display: block;
}

.subject-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 30px;
  font-size: 18px;
  margin: 8px 0 10px;
}

.results-title {
  margin: 28px 0 10px;
  font-size: 18px;
  font-weight: 700;
}

.results {
  display: grid;
  grid-template-columns: 1fr 140px;
  row-gap: 10px;
  column-gap: 24px;
  font-size: 16px;
  padding-left: 2px;
  min-height: 80px;
}

.bottom-area {
  margin-top: 40px;
}

.bottom-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 16px;
  margin-bottom: 24px;
}

.muted {
  opacity: 0.9;
}

/* Scaled down version of the rectangular stamp */
.fake-stamp {
  position: absolute;
  right: 50px;
  bottom: 4px;
  padding: 8px 20px; 
  border-radius: 8px; 
  border: 2px solid #b23b2b;
  color: #b23b2b;
  display: flex;
  align-items: center;
  justify-content: center;
  /* transform: rotate(-10deg); */
  opacity: 0.85;
  z-index: 5;
  box-shadow: inset 0 0 0 1px #b23b2b;
  pointer-events: none;
  font-family: 'Arial Black', Arial, sans-serif;
  background-color: transparent;
}

.fake-stamp::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px dashed #b23b2b;
  border-radius: 5px; 
  opacity: 0.7;
}

.fake-stamp .stamp-inner {
  text-align: center;
  line-height: 1.1;
}

.fake-stamp .stamp-main {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
  display: block;
}

.fake-stamp .stamp-sub {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  display: block;
  margin-top: 2px;
  text-transform: uppercase;
}

.fake-stamp .stamp-divider {
  width: 85%;
  height: 1px;
  background: #b23b2b;
  margin: 3px auto;
  opacity: 0.8;
}
</style>