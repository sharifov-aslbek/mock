const messages = {
  en: {
    navbar: {
      pricing: 'Pricing',
      result: 'Result',
      resources: 'Resources',
      bookDemo: 'Login',
      languages: {
        en: 'EN',
        uz: 'UZ',
        ru: 'RU'
      },
      items: {
        sat: 'SAT',
        act: 'ACT',
        math: 'Math',
        psat: 'PSAT',
        shsat: 'SHSAT'
      }
    },
    supportButton: {
      label: 'Support'
    },
    hero: {
      badge: 'A modern mock platform for the national certificate',
      titleStart: 'Prepare for the National Certificate with',
      titleHighlight: 'confidence',
      titleEnd: '',
      description: 'Take mock exams aligned with the real format, analyze your mistakes, and improve your score step by step.',
      primary: 'Start Mock Test',
      secondary: 'Learn More'
    },
    featureBlocks: {
      title: 'An ideal solution for tutors preparing students for exams',
      cards: [
        {
          icon: '✓',
          title: 'Create your own tests',
          description: 'Build practice tests focused on your students’ weak points and save time.'
        },
        {
          icon: '▦',
          title: 'International exam interfaces',
          description: 'Use familiar interfaces inspired by SAT, ACT, and SHSAT to prepare students better.'
        },
        {
          icon: '✎',
          title: 'Upload questions easily',
          description: 'Upload large question banks at once and generate tests from them quickly.'
        },
        {
          icon: '👥',
          title: 'Transparency with parents',
          description: 'Share student reports and outcomes with parents clearly and keep them informed.'
        }
      ]
    },
    productShowcase: {
      title: 'Experience MilliyMock',
      sat: 'SAT / PSAT',
      act: 'Enhanced ACT'
    },
    testimonials: {
      title: 'What Students Say',
      items: [
        {
          name: 'Aziza Rahimova',
          role: 'National certificate student',
          text: 'The mock tests helped me feel the real exam atmosphere and manage my time better.'
        },
        {
          name: 'Javohir Qodirov',
          role: 'Applicant',
          text: 'The analytics section showed exactly which topics I was missing, and my result improved a lot.'
        },
        {
          name: 'Madina Ortiqova',
          role: 'Student',
          text: 'The interface was very convenient and the test experience felt close to the real exam.'
        },
        {
          name: 'Bekzod Tursunov',
          role: 'Tutor',
          text: 'It became much easier to track my students’ results and spot their weak areas.'
        },
        {
          name: 'Sevara Ismoilova',
          role: 'National certificate candidate',
          text: 'Regular mock tests gave me confidence and reduced my exam anxiety.'
        }
      ]
    },
    finalCta: {
      title: 'Want to see how MilliyMock works?',
      button: 'Book a Personalized Demo'
    },
    footer: {
      brand: 'Milliy Mock',
      columns: [
        {
          title: 'Company',
          links: ['User stories', 'About us', 'Pricing', 'Careers', 'Help center', '2025 recap']
        },
        {
          title: 'Resources',
          links: ['About the national certificate', 'Free mock test', 'Exam tips', 'Podcast', 'Platform updates', 'News', 'Frequently asked questions']
        },
        {
          title: 'Comparisons',
          links: ['With other mock platforms', 'With online test sites', 'With traditional prep books', 'With offline courses', 'With free platforms']
        },
        {
          title: 'Contact',
          links: ['Contact us', 'Request a demo']
        },
        {
          title: 'Legal',
          links: ['Privacy policy', 'Terms of use']
        }
      ],
      contactTitle: 'Reach us',
      contactButton: 'WhatsApp: +998 90 000 00 00',
      copyright: '© 2026 Milliy Mock Platform. All rights reserved.',
      disclaimer: 'This platform is designed for national certificate exam preparation through mock testing. It is not directly affiliated with official exam organizations.'
    },
    pricing: {
      title: 'Plans and Pricing',
      description: 'Teach at scale with your own customizable and white-label digital testing platform.',
      cta: 'Request a demo now',
      moreInfo: 'Learn More',
      plans: [
        {
          name: 'Starter Plan',
          price: "19.999 so'm",
          duration: '/90 days',
          setupFee: "+ 9.999 so'm one-time setup fee",
          highlighted: false,
          features: [
            '100 attempts',
            'Access to 5100+ questions',
            'Single test cost only $9.99',
            'Up to 2 administrator accounts',
            'Upload your own questions'
          ]
        },
        {
          name: 'Growth Plan',
          price: "49.999 so'm",
          duration: '/180 days',
          setupFee: "+ 54.999 so'm one-time setup fee",
          highlighted: true,
          features: [
            '360 attempts',
            'Access to 5100+ questions',
            'Single test cost only $6.95',
            'Up to 3 administrator accounts',
            'Upload your own questions'
          ]
        },
        {
          name: 'Advanced Plan',
          price: "99.999 so'm",
          duration: '/365 days',
          setupFee: "+ 549.999 so'm one-time setup fee",
          highlighted: false,
          features: [
            '1000 attempts',
            'Access to 5100+ questions',
            'Single test cost only $4.99',
            'Up to 5 administrator accounts',
            'Upload your own questions'
          ]
        }
      ]
    },
    login: {
      home: 'Home',
      title: 'Sign in',
      description: 'Sign in with email and password or use social accounts',
      google: 'Continue with Google',
      telegram: 'Continue with Telegram',
      or: 'or',
      email: 'Email',
      password: 'Password',
      emailPlaceholder: "you{'@'}example.com",
      passwordPlaceholder: 'Enter your password',
      show: 'Show',
      hide: 'Hide',
      remember: 'Remember me',
      forgot: 'Forgot password?',
      submit: 'Sign in',
      loading: 'Signing in...',
      validation: 'Enter both email and password.',
      socialDisabled: 'Only email and password login is available right now.',
      noAccount: 'Don’t have an account?',
      signUp: 'Sign up'
    },
    math: {
      eyebrow: 'Math Center',
      title: 'Math Tests',
      description: 'Choose a test that fits you, start immediately, or open the discussion area to review strategies and solutions.',
      subjectLabel: 'Subject',
      subjectValue: 'Mathematics',
      tabs: {
        all: 'All tests',
        started: 'Started',
        notStarted: 'Not started',
        attempted: 'Attempted'
      },
      info: 'Mathematics tests loaded from the backend API.',
      sort: {
        newest: 'Sort: newest first',
        popular: 'Sort: most attempts',
        score: 'Sort: most questions'
      },
      loading: 'Loading tests...',
      errorConfig: 'API base URL is missing.',
      errorFetch: 'Could not load tests from the API.',
      emptyStarted: 'No started tests yet.',
      empty: 'No tests found in this section yet.',
      tests: [
        { title: 'Math Test #74', subject: 'Mathematics', amount: '40 questions', peopleTook: '2811', lastScore: 'Not taken', type: 'Practice test', status: 'New test', isFree: true, isNew: true, inProgress: false, completed: false, order: 74 },
        { title: 'Algebra Drill #73', subject: 'Mathematics', amount: '32 questions', peopleTook: '156', lastScore: 'Not taken', type: 'Timed challenge', status: '', isFree: false, isNew: true, inProgress: true, completed: false, order: 73 },
        { title: 'Geometry Test #72', subject: 'Mathematics', amount: '28 questions', peopleTook: '181', lastScore: 'Not taken', type: 'Practice test', status: '', isFree: false, isNew: false, inProgress: false, completed: false, order: 72 },
        { title: 'Functions Set #71', subject: 'Mathematics', amount: '35 questions', peopleTook: '1456', lastScore: '74%', type: 'Free test', status: 'Popular', isFree: true, isNew: false, inProgress: false, completed: true, order: 71 },
        { title: 'Statistics Lab #70', subject: 'Mathematics', amount: '25 questions', peopleTook: '83', lastScore: 'Not taken', type: 'Practice test', status: '', isFree: false, isNew: false, inProgress: true, completed: false, order: 70 },
        { title: 'Mock Exam #69', subject: 'Mathematics', amount: '50 questions', peopleTook: '1097', lastScore: '81%', type: 'Full mock', status: 'Recommended', isFree: false, isNew: false, inProgress: false, completed: true, order: 69 }
      ]
    },
    mathCard: {
      free: 'FREE',
      premium: 'PREMIUM',
      amount: 'Questions',
      people: 'Attempts',
      lastResult: 'Last result',
      start: 'Start Test',
      starting: 'Opening...',
      startError: 'The test could not be opened.',
      continue: 'Continue',
      continuing: 'Opening...',
      remainingQuestions: 'Questions left',
      remainingTime: 'Time left',
      answeredQuestions: 'Answered',
      confirmTitle: 'Do you really want to start the test?',
      confirmYes: 'Yes',
      confirmNo: 'No',
      discuss: 'Go Discuss'
    },
    testPage: {
      title: 'Mathematics Test',
      submit: 'SUBMIT TEST',
      timer: 'Time Left',
      minutes: 'minutes',
      questionsLabel: 'questions',
      sectionTitle: 'Part A',
      answered: 'answered',
      back: 'Back to tests',
      login: 'Go to login',
      retry: 'Retry',
      questionCount: 'Questions',
      questionLabel: 'Question',
      scoreLabel: 'Score',
      optionBank: 'Options',
      selectOption: 'Select',
      groupedTask: 'Grouped task',
      freeAnswerLabel: 'Free answer',
      freeAnswerPlaceholder: 'Write your answer here',
      openMathInput: 'Open math input',
      closeMathInput: 'Close math input',
      mathDone: 'Done',
      mathAnswerLabel: 'Math answer',
      mathInputOpen: 'Math input is open below',
      answerSaved: 'Answer entered',
      preview: 'Preview',
      reference: 'Reference',
      referenceClose: 'Close',
      dragHere: 'Drag here',
      referenceShrink: 'Make smaller',
      referenceGrow: 'Make larger',
      referenceSheetAlt: 'Reference sheet',
      imageAlt: 'Question image',
      missingId: 'Test ID was not found.',
      authRequired: 'Please sign in to open this test.',
      questionTypes: {
        MultipleChoice: 'Multiple choice',
        FreeAnswer: 'Free answer',
        Matching: 'Matching'
      }
    }
  },
  uz: {
    navbar: {
      pricing: 'Narxlar',
      result: 'Result',
      resources: 'Resurslar',
      bookDemo: 'Login',
      languages: {
        en: 'EN',
        uz: 'UZ',
        ru: 'RU'
      },
      items: {
        sat: 'SAT',
        act: 'ACT',
        math: 'Matematika',
        psat: 'PSAT',
        shsat: 'SHSAT'
      }
    },
    supportButton: {
      label: 'Yordam'
    },
    hero: {
      badge: 'Milliy sertifikat uchun zamonaviy mock platforma',
      titleStart: 'Milliy Sertifikatga',
      titleHighlight: 'Ishonchli',
      titleEnd: 'Tayyorlaning',
      description: 'Imtihon formatiga mos mock testlar orqali bilimingizni sinab ko‘ring, xatolaringizni tahlil qiling va natijangizni bosqichma-bosqich yaxshilang.',
      primary: 'Mock Testni Boshlash',
      secondary: 'Batafsil ma’lumot'
    },
    featureBlocks: {
      title: 'Testga tayyorlovchi repetitorlar uchun ideal yechim',
      cards: [
        {
          icon: '✓',
          title: 'Shaxsiy testlaringizni yarating',
          description: 'O‘quvchilarning zaif nuqtalariga yo‘naltirilgan amaliy testlar yarating va vaqtingizni tejang.'
        },
        {
          icon: '▦',
          title: 'Xalqaro imtihon interfeyslari',
          description: 'SAT, ACT yoki SHSAT kabi xalqaro standartdagi interfeyslardan foydalanib o‘quvchilarni yaxshiroq tayyorlang.'
        },
        {
          icon: '✎',
          title: 'Savollarni oson yuklang',
          description: 'Katta hajmdagi savollar to‘plamini bir vaqtda yuklang va tezda testlar hosil qiling.'
        },
        {
          icon: '👥',
          title: 'Ota-onalar bilan shaffoflik',
          description: 'Natijalar va hisobotlarni ota-onalarga qulay tarzda ulashing va ularni xabardor qilib boring.'
        }
      ]
    },
    productShowcase: {
      title: 'MilliyMock tajribasi',
      sat: 'SAT / PSAT',
      act: 'Kengaytirilgan ACT'
    },
    testimonials: {
      title: 'O‘quvchilar fikri',
      items: [
        {
          name: 'Aziza Rahimova',
          role: 'Milliy sertifikat o‘quvchisi',
          text: 'Mock testlar orqali haqiqiy imtihon muhitini his qildim va vaqtni to‘g‘ri taqsimlashni o‘rgandim.'
        },
        {
          name: 'Javohir Qodirov',
          role: 'Abituriyent',
          text: 'Tahlil bo‘limi yordamida aynan qaysi mavzularda xato qilayotganimni ko‘rdim va natijam sezilarli yaxshilandi.'
        },
        {
          name: 'Madina Ortiqova',
          role: 'O‘quvchi',
          text: 'Interfeys juda qulay, test ishlash jarayoni esa real imtihonga juda o‘xshash bo‘ldi.'
        },
        {
          name: 'Bekzod Tursunov',
          role: 'Tutor',
          text: 'O‘quvchilarimning natijalarini kuzatish va ularning kuchsiz joylarini aniqlash ancha osonlashdi.'
        },
        {
          name: 'Sevara Ismoilova',
          role: 'Milliy sertifikat nomzodi',
          text: 'Doimiy mock test ishlash menga ishonch berdi va imtihon oldi hayajonini kamaytirdi.'
        }
      ]
    },
    finalCta: {
      title: 'MilliyMock qanday ishlashini ko‘rishni xohlaysizmi?',
      button: 'Shaxsiy demo buyurtma qiling'
    },
    footer: {
      brand: 'Milliy Mock',
      columns: [
        {
          title: 'Kompaniya',
          links: ['Foydalanuvchilar hikoyalari', 'Biz haqimizda', 'Narxlar', 'Ish imkoniyatlari', 'Yordam markazi', '2025 yil sarhisobi']
        },
        {
          title: 'Resurslar',
          links: ['Milliy sertifikat haqida', 'Bepul mock test', 'Imtihon maslahatlari', 'Podkast', 'Platforma yangiliklari', 'Yangiliklar', 'Ko‘p so‘raladigan savollar']
        },
        {
          title: 'Taqqoslash',
          links: ['Boshqa mock platformalar bilan', 'Onlayn test saytlar bilan', 'An’anaviy test kitoblari bilan', 'Offline kurslar bilan', 'Bepul platformalar bilan']
        },
        {
          title: 'Bog‘lanish',
          links: ['Biz bilan aloqa', 'Demo ko‘rish']
        },
        {
          title: 'Huquqiy',
          links: ['Maxfiylik siyosati', 'Foydalanish shartlari']
        }
      ],
      contactTitle: 'Biz bilan bog‘laning',
      contactButton: 'WhatsApp: +998 90 000 00 00',
      copyright: '© 2026 Milliy Mock Platformasi. Barcha huquqlar himoyalangan.',
      disclaimer: 'Ushbu platforma Milliy sertifikat imtihoniga tayyorlanish uchun mo‘ljallangan mock test tizimi hisoblanadi. Bu sayt rasmiy imtihon tashkilotlari bilan bevosita bog‘liq emas.'
    },
    pricing: {
      title: "Ta'riflar va Narxlar",
      description: "O'zingizning moslashtiriladigan va o'z brendingizga ega (white-label) raqamli test platformangiz yordamida keng ko'lamda o'qiting!",
      cta: 'Demoga hoziroq buyurtma bering',
      moreInfo: "Ko‘proq ma’lumot",
      plans: [
        {
          name: "Boshlang'ich Ta'rif",
          price: "19.999 so'm",
          duration: '/90 kun',
          setupFee: "+ 9.999 so'm bir martalik sozlash to'lovi",
          highlighted: false,
          features: ['100 ta urinish', '5100+ savollarga ruxsat', 'Bitta test narxi faqat $9.99', '2 ta administrator kirishi mumkin', "O'z savollaringizni yuklash imkoniyati"]
        },
        {
          name: "O'sish Ta'rifi",
          price: "49.999 so'm",
          duration: '/180 kun',
          setupFee: "+ 54.999 so'm bir martalik sozlash to'lovi",
          highlighted: true,
          features: ['360 ta urinish', '5100+ savollarga ruxsat', 'Bitta test narxi faqat $6.95', '3 ta administrator kirishi mumkin', "O'z savollaringizni yuklash imkoniyati"]
        },
        {
          name: "Kengaytirilgan Ta'rif",
          price: "99.999 so'm",
          duration: '/365 kun',
          setupFee: "+ 549.999 so'm bir martalik sozlash to'lovi",
          highlighted: false,
          features: ['1000 ta urinish', '5100+ savollarga ruxsat', 'Bitta test narxi faqat $4.99', '5 ta administrator kirishi mumkin', "O'z savollaringizni yuklash imkoniyati"]
        }
      ]
    },
    login: {
      home: 'Bosh sahifa',
      title: 'Tizimga kirish',
      description: 'Email va parol orqali yoki ijtimoiy tarmoqlar orqali kiring',
      google: 'Google orqali kirish',
      telegram: 'Telegram orqali kirish',
      or: 'yoki',
      email: 'Email',
      password: 'Parol',
      emailPlaceholder: "you{'@'}example.com",
      passwordPlaceholder: 'Parolingizni kiriting',
      show: 'Ko‘rsatish',
      hide: 'Yashirish',
      remember: 'Eslab qolish',
      forgot: 'Parolni unutdingizmi?',
      submit: 'Kirish',
      loading: 'Kirilmoqda...',
      validation: 'Email va parolni kiriting.',
      socialDisabled: 'Hozircha faqat email va parol orqali kirish ishlaydi.',
      noAccount: 'Hisobingiz yo‘qmi?',
      signUp: 'Ro‘yxatdan o‘tish'
    },
    math: {
      eyebrow: 'Matematika markazi',
      title: 'Matematika testlari',
      description: 'O‘zingizga mos testni tanlang, darhol ishlashni boshlang yoki yechimlar va strategiyalarni muhokama qilish uchun suhbat bo‘limiga o‘ting.',
      subjectLabel: 'Fan',
      subjectValue: 'Matematika',
      tabs: {
        all: 'Barcha testlar',
        started: 'Boshlangan',
        notStarted: 'Boshlanmagan',
        attempted: 'Urinish qilingan'
      },
      info: 'Backend API orqali yuklangan matematika testlari.',
      sort: {
        newest: 'Saralash: yangi testlar',
        popular: 'Saralash: eng ko‘p urinish',
        score: 'Saralash: eng ko‘p savol'
      },
      loading: 'Testlar yuklanmoqda...',
      errorConfig: 'API manzili topilmadi.',
      errorFetch: 'API dan testlarni yuklab bo‘lmadi.',
      emptyStarted: 'Boshlangan testlar hozircha yo‘q.',
      empty: 'Bu bo‘limda hozircha test topilmadi.',
      tests: [
        { title: 'Matematika testi #74', subject: 'Matematika', amount: '40 ta savol', peopleTook: '2811', lastScore: 'Ishlanmagan', type: 'Amaliy test', status: 'Yangi test', isFree: true, isNew: true, inProgress: false, completed: false, order: 74 },
        { title: 'Algebra mashqi #73', subject: 'Matematika', amount: '32 ta savol', peopleTook: '156', lastScore: 'Ishlanmagan', type: 'Vaqtli sinov', status: '', isFree: false, isNew: true, inProgress: true, completed: false, order: 73 },
        { title: 'Geometriya testi #72', subject: 'Matematika', amount: '28 ta savol', peopleTook: '181', lastScore: 'Ishlanmagan', type: 'Amaliy test', status: '', isFree: false, isNew: false, inProgress: false, completed: false, order: 72 },
        { title: 'Funksiyalar to‘plami #71', subject: 'Matematika', amount: '35 ta savol', peopleTook: '1456', lastScore: '74%', type: 'Bepul test', status: 'Mashhur', isFree: true, isNew: false, inProgress: false, completed: true, order: 71 },
        { title: 'Statistika laboratoriyasi #70', subject: 'Matematika', amount: '25 ta savol', peopleTook: '83', lastScore: 'Ishlanmagan', type: 'Amaliy test', status: '', isFree: false, isNew: false, inProgress: true, completed: false, order: 70 },
        { title: 'Sinov imtihoni #69', subject: 'Matematika', amount: '50 ta savol', peopleTook: '1097', lastScore: '81%', type: 'To‘liq mock', status: 'Tavsiya etiladi', isFree: false, isNew: false, inProgress: false, completed: true, order: 69 }
      ]
    },
    mathCard: {
      free: 'BEPUL',
      premium: 'PREMIUM',
      amount: 'Savollar soni',
      people: 'Urinishlar',
      lastResult: 'Oxirgi natija',
      start: 'Testni boshlash',
      starting: 'Ochilmoqda...',
      startError: 'Testni ochib bo‘lmadi.',
      continue: 'Davom ettirish',
      continuing: 'Ochilmoqda...',
      remainingQuestions: 'Qolgan savollar',
      remainingTime: 'Qolgan vaqt',
      answeredQuestions: 'Tanlangan javoblar',
      confirmTitle: 'Haqiqatdan ham testni boshlamoqchimisiz?',
      confirmYes: 'Ha',
      confirmNo: 'Yo‘q',
      discuss: 'Muhokamaga o‘tish'
    },
    testPage: {
      title: 'Matematika testi',
      submit: 'TESTNI YAKUNLASH',
      timer: 'Qolgan vaqt',
      minutes: 'daqiqa',
      questionsLabel: 'savol',
      sectionTitle: 'A qism',
      answered: 'javob berildi',
      back: 'Testlarga qaytish',
      login: 'Login sahifasiga o‘tish',
      retry: 'Qayta urinish',
      questionCount: 'Savollar',
      questionLabel: 'Savol',
      scoreLabel: 'Ball',
      optionBank: 'Variantlar',
      selectOption: 'Tanlang',
      groupedTask: 'Guruhlangan topshiriq',
      freeAnswerLabel: 'Erkin javob',
      freeAnswerPlaceholder: 'Javobingizni shu yerga yozing',
      openMathInput: 'Matematik inputni ochish',
      closeMathInput: 'Matematik inputni yopish',
      mathDone: 'Tayyor',
      mathAnswerLabel: 'Matematik javob',
      mathInputOpen: 'Matematik input pastda ochiq',
      answerSaved: 'Javob kiritilgan',
      preview: 'Ko‘rinish',
      reference: 'Formula',
      referenceClose: 'Yopish',
      dragHere: 'Bu yerdan suring',
      referenceShrink: 'Kichraytirish',
      referenceGrow: 'Kattalashtirish',
      referenceSheetAlt: 'Formula varaqi',
      imageAlt: 'Savol rasmi',
      missingId: 'Test ID topilmadi.',
      authRequired: 'Bu testni ochish uchun tizimga kiring.',
      questionTypes: {
        MultipleChoice: 'Tanlovli savol',
        FreeAnswer: 'Erkin javob',
        Matching: 'Moslashtirish'
      }
    }
  },
  ru: {
    navbar: {
      pricing: 'Тарифы',
      result: 'Result',
      resources: 'Ресурсы',
      bookDemo: 'Login',
      languages: {
        en: 'EN',
        uz: 'UZ',
        ru: 'RU'
      },
      items: {
        sat: 'SAT',
        act: 'ACT',
        math: 'Математика',
        psat: 'PSAT',
        shsat: 'SHSAT'
      }
    },
    supportButton: {
      label: 'Поддержка'
    },
    hero: {
      badge: 'Современная mock-платформа для национального сертификата',
      titleStart: 'Готовьтесь к национальному сертификату',
      titleHighlight: 'уверенно',
      titleEnd: '',
      description: 'Проходите пробные экзамены в реальном формате, анализируйте ошибки и шаг за шагом улучшайте результат.',
      primary: 'Начать mock-тест',
      secondary: 'Подробнее'
    },
    featureBlocks: {
      title: 'Идеальное решение для преподавателей, готовящих учеников к экзаменам',
      cards: [
        {
          icon: '✓',
          title: 'Создавайте собственные тесты',
          description: 'Собирайте практические тесты под слабые темы учеников и экономьте время.'
        },
        {
          icon: '▦',
          title: 'Интерфейсы международных экзаменов',
          description: 'Используйте знакомые интерфейсы SAT, ACT и SHSAT для лучшей подготовки.'
        },
        {
          icon: '✎',
          title: 'Легко загружайте вопросы',
          description: 'Загружайте большие банки вопросов сразу и быстро формируйте из них тесты.'
        },
        {
          icon: '👥',
          title: 'Прозрачность для родителей',
          description: 'Понятно делитесь результатами и отчетами учеников с родителями.'
        }
      ]
    },
    productShowcase: {
      title: 'Опыт MilliyMock',
      sat: 'SAT / PSAT',
      act: 'Расширенный ACT'
    },
    testimonials: {
      title: 'Отзывы учеников',
      items: [
        {
          name: 'Aziza Rahimova',
          role: 'Ученик национального сертификата',
          text: 'Пробные тесты помогли мне почувствовать атмосферу настоящего экзамена и лучше распределять время.'
        },
        {
          name: 'Javohir Qodirov',
          role: 'Абитуриент',
          text: 'Раздел аналитики показал, в каких темах я ошибаюсь, и мой результат заметно вырос.'
        },
        {
          name: 'Madina Ortiqova',
          role: 'Ученик',
          text: 'Интерфейс очень удобный, а процесс решения теста оказался близким к реальному экзамену.'
        },
        {
          name: 'Bekzod Tursunov',
          role: 'Преподаватель',
          text: 'Стало намного проще отслеживать результаты учеников и находить их слабые стороны.'
        },
        {
          name: 'Sevara Ismoilova',
          role: 'Кандидат на национальный сертификат',
          text: 'Регулярные mock-тесты придали мне уверенности и уменьшили предэкзаменационное волнение.'
        }
      ]
    },
    finalCta: {
      title: 'Хотите увидеть, как работает MilliyMock?',
      button: 'Заказать персональное демо'
    },
    footer: {
      brand: 'Milliy Mock',
      columns: [
        {
          title: 'Компания',
          links: ['Истории пользователей', 'О нас', 'Тарифы', 'Вакансии', 'Центр помощи', 'Итоги 2025 года']
        },
        {
          title: 'Ресурсы',
          links: ['О национальном сертификате', 'Бесплатный mock-тест', 'Советы к экзамену', 'Подкаст', 'Обновления платформы', 'Новости', 'Часто задаваемые вопросы']
        },
        {
          title: 'Сравнение',
          links: ['С другими mock-платформами', 'С онлайн-сайтами тестирования', 'С традиционными книгами', 'С офлайн-курсами', 'С бесплатными платформами']
        },
        {
          title: 'Контакты',
          links: ['Связаться с нами', 'Запросить демо']
        },
        {
          title: 'Правовая информация',
          links: ['Политика конфиденциальности', 'Условия использования']
        }
      ],
      contactTitle: 'Свяжитесь с нами',
      contactButton: 'WhatsApp: +998 90 000 00 00',
      copyright: '© 2026 Платформа Milliy Mock. Все права защищены.',
      disclaimer: 'Эта платформа предназначена для подготовки к экзамену на национальный сертификат с помощью mock-тестов. Она не связана напрямую с официальными экзаменационными организациями.'
    },
    pricing: {
      title: 'Тарифы и цены',
      description: 'Обучайте в большом масштабе с помощью собственной настраиваемой white-label платформы для тестирования.',
      cta: 'Заказать демо сейчас',
      moreInfo: 'Подробнее',
      plans: [
        {
          name: 'Стартовый тариф',
          price: "19.999 so'm",
          duration: '/90 дней',
          setupFee: "+ 9.999 so'm разовая настройка",
          highlighted: false,
          features: ['100 попыток', 'Доступ к 5100+ вопросам', 'Стоимость одного теста всего $9.99', 'До 2 администраторов', 'Возможность загрузки своих вопросов']
        },
        {
          name: 'Тариф роста',
          price: "49.999 so'm",
          duration: '/180 дней',
          setupFee: "+ 54.999 so'm разовая настройка",
          highlighted: true,
          features: ['360 попыток', 'Доступ к 5100+ вопросам', 'Стоимость одного теста всего $6.95', 'До 3 администраторов', 'Возможность загрузки своих вопросов']
        },
        {
          name: 'Расширенный тариф',
          price: "99.999 so'm",
          duration: '/365 дней',
          setupFee: "+ 549.999 so'm разовая настройка",
          highlighted: false,
          features: ['1000 попыток', 'Доступ к 5100+ вопросам', 'Стоимость одного теста всего $4.99', 'До 5 администраторов', 'Возможность загрузки своих вопросов']
        }
      ]
    },
    login: {
      home: 'Главная',
      title: 'Вход в систему',
      description: 'Войдите через email и пароль или через социальные сети',
      google: 'Войти через Google',
      telegram: 'Войти через Telegram',
      or: 'или',
      email: 'Email',
      password: 'Пароль',
      emailPlaceholder: "you{'@'}example.com",
      passwordPlaceholder: 'Введите пароль',
      show: 'Показать',
      hide: 'Скрыть',
      remember: 'Запомнить меня',
      forgot: 'Забыли пароль?',
      submit: 'Войти',
      loading: 'Выполняется вход...',
      validation: 'Введите email и пароль.',
      socialDisabled: 'Сейчас работает только вход по email и паролю.',
      noAccount: 'Нет аккаунта?',
      signUp: 'Зарегистрироваться'
    },
    math: {
      eyebrow: 'Центр математики',
      title: 'Тесты по математике',
      description: 'Выберите подходящий тест, начните сразу или откройте раздел обсуждений, чтобы разобрать решения и стратегии.',
      subjectLabel: 'Предмет',
      subjectValue: 'Математика',
      tabs: {
        all: 'Все тесты',
        started: 'Начатые',
        notStarted: 'Не начаты',
        attempted: 'С попытками'
      },
      info: 'Тесты по математике, загруженные из backend API.',
      sort: {
        newest: 'Сортировка: сначала новые',
        popular: 'Сортировка: больше попыток',
        score: 'Сортировка: больше вопросов'
      },
      loading: 'Тесты загружаются...',
      errorConfig: 'Не найден базовый URL API.',
      errorFetch: 'Не удалось загрузить тесты из API.',
      emptyStarted: 'Пока нет начатых тестов.',
      empty: 'В этом разделе пока нет тестов.',
      tests: [
        { title: 'Тест по математике #74', subject: 'Математика', amount: '40 вопросов', peopleTook: '2811', lastScore: 'Не пройден', type: 'Практический тест', status: 'Новый тест', isFree: true, isNew: true, inProgress: false, completed: false, order: 74 },
        { title: 'Алгебра #73', subject: 'Математика', amount: '32 вопроса', peopleTook: '156', lastScore: 'Не пройден', type: 'Тест на время', status: '', isFree: false, isNew: true, inProgress: true, completed: false, order: 73 },
        { title: 'Геометрия #72', subject: 'Математика', amount: '28 вопросов', peopleTook: '181', lastScore: 'Не пройден', type: 'Практический тест', status: '', isFree: false, isNew: false, inProgress: false, completed: false, order: 72 },
        { title: 'Функции #71', subject: 'Математика', amount: '35 вопросов', peopleTook: '1456', lastScore: '74%', type: 'Бесплатный тест', status: 'Популярный', isFree: true, isNew: false, inProgress: false, completed: true, order: 71 },
        { title: 'Статистика #70', subject: 'Математика', amount: '25 вопросов', peopleTook: '83', lastScore: 'Не пройден', type: 'Практический тест', status: '', isFree: false, isNew: false, inProgress: true, completed: false, order: 70 },
        { title: 'Mock экзамен #69', subject: 'Математика', amount: '50 вопросов', peopleTook: '1097', lastScore: '81%', type: 'Полный mock', status: 'Рекомендуется', isFree: false, isNew: false, inProgress: false, completed: true, order: 69 }
      ]
    },
    mathCard: {
      free: 'БЕСПЛАТНО',
      premium: 'ПРЕМИУМ',
      amount: 'Количество вопросов',
      people: 'Попытки',
      lastResult: 'Последний результат',
      start: 'Начать тест',
      starting: 'Открывается...',
      startError: 'Не удалось открыть тест.',
      continue: 'Продолжить',
      continuing: 'Открывается...',
      remainingQuestions: 'Осталось вопросов',
      remainingTime: 'Осталось времени',
      answeredQuestions: 'Выбрано ответов',
      confirmTitle: 'Вы действительно хотите начать тест?',
      confirmYes: 'Да',
      confirmNo: 'Нет',
      discuss: 'К обсуждению'
    },
    testPage: {
      title: 'Тест по математике',
      submit: 'ОТПРАВИТЬ ТЕСТ',
      timer: 'Осталось времени',
      minutes: 'минут',
      questionsLabel: 'вопросов',
      sectionTitle: 'Часть A',
      answered: 'ответов дано',
      back: 'Назад к тестам',
      login: 'Перейти ко входу',
      retry: 'Повторить',
      questionCount: 'Вопросы',
      questionLabel: 'Вопрос',
      scoreLabel: 'Баллы',
      optionBank: 'Варианты',
      selectOption: 'Выбрать',
      groupedTask: 'Групповое задание',
      freeAnswerLabel: 'Свободный ответ',
      freeAnswerPlaceholder: 'Введите ваш ответ',
      openMathInput: 'Открыть математический ввод',
      closeMathInput: 'Закрыть математический ввод',
      mathDone: 'Готово',
      mathAnswerLabel: 'Математический ответ',
      mathInputOpen: 'Математический ввод открыт ниже',
      answerSaved: 'Ответ введён',
      preview: 'Предпросмотр',
      reference: 'Формулы',
      referenceClose: 'Закрыть',
      dragHere: 'Перетащите здесь',
      referenceShrink: 'Уменьшить',
      referenceGrow: 'Увеличить',
      referenceSheetAlt: 'Лист с формулами',
      imageAlt: 'Изображение вопроса',
      missingId: 'ID теста не найден.',
      authRequired: 'Для открытия этого теста нужно войти в систему.',
      questionTypes: {
        MultipleChoice: 'Выбор ответа',
        FreeAnswer: 'Свободный ответ',
        Matching: 'Сопоставление'
      }
    }
  }
}

export default messages
