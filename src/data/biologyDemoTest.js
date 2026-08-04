// Biologiya demo test — 'Biologiya fanidan test topshiriqlari' namunasi.
// Frontend-only UI namoyishi (backend talab qilinmaydi). Subject id = 2.
//
// Savol turlari:
//   mcq     — 1-32: to'rt variantli yopiq test (A/B/C/D)
//   variant — 33-35: umumiy ma'lumot (matn) + A-F umumiy javoblar banki
//   numeric — 36-40: ochiq (raqamli) javob
//   ai      — 41-43: jarayonni tavsiflash (matn) + chizma (rasm) yuklash, AI tekshiradi

export const biologyDemoTest = {
  id: 'biologiya-namuna-2',
  subjectId: 2,
  title: 'Biologiya',
  edition: 'Milliy sertifikat — namunaviy test',
  durationMinutes: 180,
  sections: [
    { id: 'mcq', num: 'I', label: 'Yopiq test savollari', range: '1–32' },
    { id: 'data', num: 'II', label: "Ma'lumot asosida", range: '33–35' },
    { id: 'numeric', num: 'III', label: 'Hisobli (ochiq) javoblar', range: '36–40' },
    { id: 'ai', num: 'IV', label: 'AI tekshiruvi (tavsif + chizma)', range: '41–43' },
  ],

  // 33-35 uchun umumiy ma'lumot bloki va A-F javoblar banki.
  dataGroup: {
    passage: `Quyidagi ma'lumotlar asosida 33–35-topshiriqlarning javoblarini (A–F) variantlaridan tanlang. Muayyan hududda yashovchi insonning kunlik ratsioni tarkibidagi oqsil, yog' va uglevodlar miqdori (grammda) tahlil qilindi. Yog'larning massasi uglevodlar massasining 30% ini, oqsillar massasining esa 40% ini tashkil qilishi aniqlandi. Ulardan ajraladigan umumiy energiya 16988 kJ ga teng.`,
    bank: [
      { letter: 'A', text: '1594,4' },
      { letter: 'B', text: '120' },
      { letter: 'C', text: '280' },
      { letter: 'D', text: '1640' },
      { letter: 'E', text: '1230' },
      { letter: 'F', text: '1395,1' },
    ],
  },

  questions: [
    {
      order: 1, type: 'mcq', section: 'mcq',
      text: `Quyidagi mulohazalardan qaysi biri bakteriya hujayrasi uchun xos EMAS?`,
      options: [
        { letter: 'A', text: `Irsiy axborot sitoplazmada nukleoid va plazmidalarda joylashgan.` },
        { letter: 'B', text: `Hujayra qobig'i murein moddasidan tashkil topgan.` },
        { letter: 'C', text: `Ribosomalarga, ba'zan gazli vakuolalar — aerosomalarga ega.` },
        { letter: 'D', text: `Zaxira modda sifatida glikogen to'playdi.` },
      ],
    },
    {
      order: 2, type: 'mcq', section: 'mcq',
      text: `Dengiz okuni haqidagi ma'lumotlarni toping.
1) ayirish sistemasi bir juft tasmachasimon buyraklardan iborat;
2) qorin aortasi yurak vazifasini bajaradi;
3) jag'larida bir xil tuzilishga ega tishlar joylashgan;
4) jinsiy dimorfizm kuzatiladi;
5) issiqqonli organizm hisoblanadi;
6) ichakning keyingi kengaygan qismi kloaka deb ataladi;
7) urg'ochi va erkak jinsiy a'zolari bitta organizmda joylashgan;
8) ichki urug'lanish.`,
      options: [
        { letter: 'A', text: `1, 4, 8;` },
        { letter: 'B', text: `1, 3, 7;` },
        { letter: 'C', text: `3, 5, 6;` },
        { letter: 'D', text: `2, 4, 7.` },
      ],
    },
    {
      order: 3, type: 'mcq', section: 'mcq',
      text: `Organizmlarning populyatsiya strukturasi noto'g'ri ko'rsatilgan javobni aniqlang.`,
      options: [
        { letter: 'A', text: `Zebra podasida har doim oldinda qari urg'ochisi yuradi, uning ortidan dastlab eng yoshi, keyin yoshi kattaroqlari, ularning ortidan yoshi katta zebralar, eng oxirida esa podaning boshlig'i — erkak zebra harakatlanadi.` },
        { letter: 'B', text: `Pavianlar podasining markazida, eng xavfsiz joyda bolali yoki bo'g'oz urg'ochilar, chetlarida — yetakchilar, yosh erkak va urg'ochilar, podaning intentional oldi va orqasida esa yirik erkaklari harakatlanadi.` },
        { letter: 'C', text: `Ustritsa va midiyalar koloniyalari yakka shakllarning hududiy birlashmasi hisoblanadi.` },
        { letter: 'D', text: `Qaldirg'ochlar va pingvinlar koloniyalarida vazifalar individlar o'rtasida taqsimlanadi.` },
      ],
    },
    {
      order: 4, type: 'mcq', section: 'mcq',
      text: `Mo'tadil iqlim mintaqasining keng bargli o'rmonlarida tarqalgan organizmlar qaysi javobda to'g'ri ko'rsatilgan?`,
      options: [
        { letter: 'A', text: `Oq qarag'ay, sidr, los, kabarga` },
        { letter: 'B', text: `Buk, yasenh (shumtol), daxma (sonya-polchok)` },
        { letter: 'C', text: `Bo'ri, sher, gepard` },
        { letter: 'D', text: `Eman, jo'ka, sidr, qarag'ay` },
      ],
    },
    {
      order: 5, type: 'mcq', section: 'mcq',
      text: `Odam markaziy nerv sistemasining bosh miya bo'limlarida joylashgan markazlar to'g'ri ko'rsatilgan javobni toping.`,
      options: [
        { letter: 'A', text: `7 — harakat; 8 — qon aylanishi; 11 — tiroksin gormoni ishlab chiqarilishi` },
        { letter: 'B', text: `7 — qo'l barmoqlarining nozik harakatlari; 6 — skelet mushaklari tonusi; 5 — ko'rish, eshitish` },
        { letter: 'C', text: `6 — ko'z olmasining harakati; 10 — harakat, skelet mushaklari tonusi; 8 — himoya` },
        { letter: 'D', text: `5 — mo'ljal olish refleksi; 6 — mimika (yuz) mushaklari; 8 — nafas olish` },
      ],
    },
    {
      order: 6, type: 'mcq', section: 'mcq',
      text: `Cherkez (b) va besh bargli partenotsissus (a) uchun to'g'ri fikrlarni tanlang.
1) o'q ildiz tizimiga ega;
2) murakkab bargga ega;
3) changchilari gultojibarglarning qo'shilishidan hosil bo'lgan naychada joylashgan;
4) yonbargchalarsiz oddiy bargga ega;
5) mevasi reza meva;
6) barglari va gullari tibbiyotda yo'talga qarshi ishlatiladi;
7) ituzumdoshlar oilasi vakili hisoblanadi;
8) urug' unib chiqayotganda urug'pallalar yer ostida qoladi.`,
      options: [
        { letter: 'A', text: `a - 1, 4; b - 2, 5` },
        { letter: 'B', text: `a - 2, 3; b - 4, 8` },
        { letter: 'C', text: `a - 1, 6; b - 3, 7` },
        { letter: 'D', text: `a - 2, 5; b - 1, 4` },
      ],
    },
    {
      order: 7, type: 'mcq', section: 'mcq',
      text: `Tabiiy ravishda: а) Neotropik; б) Efiopiya biogeografik viloyatida tarqalgan organizmlarni aniqlang.
1) gavial;
2) kolibri;
3) agama;
4) nandu;
5) xameleon;
6) bankiv tovuqlari;
7) alligator;
8) tovus;
9) iguana.`,
      options: [
        { letter: 'A', text: `а - 2, 4; б - 6, 8` },
        { letter: 'B', text: `а - 2, 6; б - 1, 4;` },
        { letter: 'C', text: `а - 1, 7; б - 3, 9` },
        { letter: 'D', text: `а - 7, 9; б - 3, 5` },
      ],
    },
    {
      order: 8, type: 'mcq', section: 'mcq',
      text: `Quyidagi rasmda tasvirlangan turlar hosil bo'lish jarayonida shakllangan turlarni aniqlang.
1) Missisipi daryosida osyotrsimonlardan soxta kurakburunlarga yaqin turlarning uchrashi;
2) g'o'za turkumlarining kelib chiqishi;
3) Lanao ko'lida bitta umumiy ajdod turdan 18 turni baliqlarning kelib chiqishi;
4) qirg'ovulning Xiva, Yettisuv va Murg'ob kenja turlarining kelib chiqishi;
5) xrizantema turkumiga kiruvchi 18, 36, 90 xromosomalarga ega poliploid turlarning kelib chiqishi.`,
      options: [
        { letter: 'A', text: `1, 3, 5` },
        { letter: 'B', text: `1, 2, 4` },
        { letter: 'C', text: `3, 5` },
        { letter: 'D', text: `2, 4` },
      ],
    },
    {
      order: 9, type: 'mcq', section: 'mcq',
      text: `Organizmdagi mushaklar vazifasi to'g'ri ko'rsatilgan javobni aniqlang. а) ikki boshli b) to'rt boshli;
1) qo'lni tirsak bo'g'imidan buklaydi;
2) qo'lni tirsak bo'g'imidan yozadi;
3) oyoqni chanoq-son bo'g'imidan buklaydi;
4) oyoqni oshiq-boldir bo'g'imidan buklaydi;
5) oyoqni chanoq-son bo'g'imidan yozadi;
6) oyoqni oshiq-boldir bo'g'imidan yozadi.`,
      options: [
        { letter: 'A', text: `a - 2; b - 5` },
        { letter: 'B', text: `a - 1; b - 5` },
        { letter: 'C', text: `a - 2; b - 3` },
        { letter: 'D', text: `a - 1; b – 3` },
      ],
    },
    {
      order: 10, type: 'mcq', section: 'mcq',
      text: `Aneuploidiya hodisasi va uning turlarini ularning to'g'ri ta'riflari bilan muvofiqlashtiring.
1) nullisomik;
2) trisomik;
3) tetrasomik;
4) monosomik.а) bitta ortiqcha xromosomaning mavjudligi; b) bitta ortiqcha juft xromosomaning mavjudligi; с) bitta xromosoma yetishmasligi; d) bir juft xromosoma yetishmasligi`,
      options: [
        { letter: 'A', text: `1 - d, 2 - a, 3 - b, 4 - c` },
        { letter: 'B', text: `1 - b, 2 - a, 3 - d, 4 - c` },
        { letter: 'C', text: `1 - d, 2 - c, 3 - b, 4 - a` },
        { letter: 'D', text: `1 - a, 2 - b, 3 - c, 4 - d` },
      ],
    },
    {
      order: 11, type: 'mcq', section: 'mcq',
      text: `Quyidagi o'simliklarning qaysi birida birikish guruhi eng katta?`,
      options: [
        { letter: 'A', text: `tetraploid navli olcha` },
        { letter: 'B', text: `diploid navli olcha` },
        { letter: 'C', text: `diploid navli olxo'ri` },
        { letter: 'D', text: `tetraploid navli makkajo'xori` },
      ],
    },
    {
      order: 12, type: 'mcq', section: 'mcq',
      text: `Biosfera evolutsiyasining birinchi bosqichida sodir bo'lgan o'zgarishlarni aniqlang.`,
      options: [
        { letter: 'A', text: `minoga va miksinalarning uzoq ajdodlari paydo bo'ldi` },
        { letter: 'B', text: `o'tsimon o'simliklar — psilofitlar paydo bo'ldi` },
        { letter: 'C', text: `suv muhitida yashashga ikkilamchi moslashgan sutemizuvchilar paydo bo'ldi` },
        { letter: 'D', text: `ikki tomonlama simmetriyali organizmlar paydo bo'ldi` },
      ],
    },
    {
      order: 13, type: 'mcq', section: 'mcq',
      text: `Odam ko'rish analizatorining tuzilishi va vazifalari to'g'ri ko'rsatilgan qatorni toping.
1) kolbachasimon hujayralar rang ajratish vazifasini bajaradi;
2) sklera yorug'lik nurini ko'z ichiga o'tkazish vazifasini bajaradi;
3) gavhar yorug'likni sindirish va uni to'r pardaga o'tkazish vazifasini bajaradi;
4) sariq dog' — ko'zning retseptorlar joylashgan qismi;
5) rangdor qobiq — oq qobiqning oldingi qismi bo'lib, ko'zga rang berish vazifasini bajaradi;
6) qorachiq — yorug'likda torayadi va qorong'uda kengayadi.`,
      options: [
        { letter: 'A', text: `1, 2, 5;` },
        { letter: 'B', text: `1, 3, 5;` },
        { letter: 'C', text: `2, 4, 5;` },
        { letter: 'D', text: `1, 4, 6.` },
      ],
    },
    {
      order: 14, type: 'mcq', section: 'mcq',
      text: `DNK tarkibida 5400 ta vodorod bog'i bor, adenin va timin o'rtasidagi vodorod bog'lari soni guanin va sitozin o'rtasidagidan 1,5 marta ko'p. Mutatsiya natijasida nukleotidlarning 30% yo'qotildi. Mutatsiyaga uchragan DNKdan sintezlangan oqsildagi peptid bog'lari sonini aniqlang.`,
      options: [
        { letter: 'A', text: `545;` },
        { letter: 'B', text: `645;` },
        { letter: 'C', text: `225;` },
        { letter: 'D', text: `454;` },
      ],
    },
    {
      order: 15, type: 'mcq', section: 'mcq',
      text: `Agglyutinogen B (1) va tromboplastin (2) uchun to'g'ri ma'lumot berilgan javobni ko'rsating.`,
      options: [
        { letter: 'A', text: `1 — ikkinchi va to'rtinchi guruh qoniga ega insonlar qonida mavjud; 2 — eritrotsitlarda;` },
        { letter: 'B', text: `1 — eritrotsitlarda; 2 — trombinni protrombinga aylantiradi;` },
        { letter: 'C', text: `1 — plazmada; 2 — tromb hosil bo'lishiga to'sqinlik qiladi;` },
        { letter: 'D', text: `1 — uchinchi va to'rtinchi guruh qoniga ega insonlar qonida mavjud; 2 — protrombinni trombinga aylantiradi;` },
      ],
    },
    {
      order: 16, type: 'mcq', section: 'mcq',
      text: `Ushbu fikrlar qaysi olimga tegishli ekanligini ko'rsating: "Dunyo o'z-o'zidan paydo bo'lgan, hayvonlar nam yerdan chiqib kelgan, dastlab ularning nuqsonli turlari, keyin esa harakatlanadigan, oziqlanadigan, ko'payadigan va dushmanlardan himoyalanadigan normal hayvonlar paydo bo'lgan."`,
      options: [
        { letter: 'A', text: `Karl Ber` },
        { letter: 'B', text: `Klavdiy Galen` },
        { letter: 'C', text: `Lukretsiy Kar` },
        { letter: 'D', text: `Aristotel` },
      ],
    },
    {
      order: 17, type: 'mcq', section: 'mcq',
      text: `Qaysi javobda turli oilalarga mansub o'simliklar ko'rsatilgan?`,
      options: [
        { letter: 'A', text: `qanotli qushqo'nmas (tatarnik), topinambur, andiz` },
        { letter: 'B', text: `xandalak (qovun), tarvuz, bodring` },
        { letter: 'C', text: `pomidor, kartoshka, baqlajon` },
        { letter: 'D', text: `turp, ismaloq, nasha` },
      ],
    },
    {
      order: 18, type: 'mcq', section: 'mcq',
      text: `Quyidagi fikrlardan qaysi biri ikkilamchi suktsessiyaga tegishli?1) populyatsiyalar o'rtasidagi o'zaro aloqalar buzilgan hududlarda kuzatiladi;
2) vulqon otilgan joylarda, qum tepaliklarida va qoyalar yuzasida sodir bo'ladi;
3) yong'inlar, qurg'oqchiliklar yoki o'rmon kesilishi sodir bo'lgan hududlarda populyatsiyalar o'rtasidagi o'zaro aloqalarning tiklanishi natijasida sodir bo'ladi;
4) tuproq va o'simlik qoplami bo'lmagan joylarda kuzatiladi;
5) o'simliklar asosiy rolni o'ynaydi, chunki ularning faoliyati natijasida tuproq tarkibi o'zgaradi va minerallar bilan boyiydi;
6) Uning amalga oshishi ko'pincha inson omili ta'sirida sodir bo'lganligi sababli, uni antropogen suktsessiya deb ham atash mumkin.`,
      options: [
        { letter: 'A', text: `1, 3, 5` },
        { letter: 'B', text: `2, 4, 6` },
        { letter: 'C', text: `2, 4, 5` },
        { letter: 'D', text: `1, 3, 6` },
      ],
    },
    {
      order: 19, type: 'mcq', section: 'mcq',
      text: `1998-yilda o'zak (asosiy) hujayralardan "yangi" a'zolarni yaratish texnologiyasini ishlab chiqqan olim(lar) to'g'ri ko'rsatilgan qatorni aniqlang.`,
      options: [
        { letter: 'A', text: `J. Gerdon` },
        { letter: 'B', text: `J. Tomson` },
        { letter: 'C', text: `Kyoler va Milshteyn` },
        { letter: 'D', text: `O. Everi, K. Maklaud va M. Makkarti` },
      ],
    },
    {
      order: 20, type: 'mcq', section: 'mcq',
      text: `Qorago'zal (a) va Nimrang (b) navlari uchun xos bo'lgan ma'lumotlarni aniqlang.
1) gulyonbargchalariga (tashqi kosacha) ega;
2) ildizlarida tugunak bakteriyalari yashaydi;
3) gulining qalpoqchaga o'xshash qismi bor;
4) gul kosachasi sust rivojlangan;
5) buralma to'pgul hosil qiladi.`,
      options: [
        { letter: 'A', text: `a - 3, 4; b - 5` },
        { letter: 'B', text: `a - 1, 4; b - 2` },
        { letter: 'C', text: `a - 1, 3; b - 5` },
        { letter: 'D', text: `a - 3, 4; b – 2` },
      ],
    },
    {
      order: 21, type: 'mcq', section: 'mcq',
      text: `Inanstansiya (a) va tradeskansiya (b) hujayralarida sodir bo'ladigan jarayonlarni aniqlang.
1) xloroplastlarda ATF sintezi;
2) ribosomalarda oqsil biosintezi;
3) yadroda transkriptsiya jarayoni;
4) pinotsitoz;
5) membrana hosil bo'lishi orqali tsitokinez;
6) fagotsitoz;
7) mitoxondriyalarda glyukoza parchalanishi.`,
      options: [
        { letter: 'A', text: `а - 1, 2, 4; b - 3, 5, 7` },
        { letter: 'B', text: `а -1, 2, 3, 4, 7; b - 2, 3, 4, 5` },
        { letter: 'C', text: `а - 2, 3, 4, 6, 7; b - 1, 2, 3, 4, 5, 7` },
        { letter: 'D', text: `а - 2, 3, 4, 7; b- 1, 2, 3, 5, 6, 7` },
      ],
    },
    {
      order: 22, type: 'mcq', section: 'mcq',
      text: `Fotosintez qiluvchi (a) va xemosintez qiluvchi (b) organizmlar keltirilgan qatorni aniqlang.`,
      options: [
        { letter: 'A', text: `a — nostok; b — tugunak bakteriyalari` },
        { letter: 'B', text: `a — galla nematodasi; b — vodorod bakteriyalari` },
        { letter: 'C', text: `a — ossillyatoriya; b — nitrifikatsiyalovchi bakteriyalar` },
        { letter: 'D', text: `a — kladoniya; b — chirish bakteriyalari` },
      ],
    },
    {
      order: 23, type: 'mcq', section: 'mcq',
      text: `Magnoliopsidlar (ikki pallalilar) sinfiga kiruvchi burchoqdoshlar (A) va ituzumdoshlar (B) oilalariga mansub o'simliklarning belgilarini muvofiqlashtiring.
1) barglari oddiy, yonbargchalarsiz;
2) barglari murakkab, panjasimon;
3) 9 ta changchi iplari o'zaro qo'shilgan;
4) ayrim jinsli, shakllangan;
5) meva bitta meva bargchasidan hosil bo'ladi;
6) tuguncha 2 ta meva bargchasidan iborat;
7) changchilar soni 5 ta.`,
      options: [
        { letter: 'A', text: `A - 2, 3, 5; B - 1, 7, 6` },
        { letter: 'B', text: `A - 1, 4, 7; B - 2, 3, 6` },
        { letter: 'C', text: `A - 1, 5, 6; B - 3, 4, 5` },
        { letter: 'D', text: `A - 2, 4, 5; B - 1, 3, 6` },
      ],
    },
    {
      order: 24, type: 'mcq', section: 'mcq',
      text: `Makkajo'xorida ma'lum miqdordagi glyukozaning to'liq va noto'liq parchalanishi hamda yorug'lik energiyasi hisobiga 1682 mol ATF to'plangan. Sitoplazma va xloroplastda hosil bo'lgan ATF miqdorining nisbati 2:405 ga teng. (Yorug'lik energiyasi hisobiga hosil bo'lgan ATFning 1/2 qismidan glyukoza sintezlangan.) Fotofosforillanishda hosil bo'lgan suv massasini aniqlang.`,
      options: [
        { letter: 'A', text: `29160;` },
        { letter: 'C', text: `15700;` },
        { letter: 'B', text: `38900;` },
        { letter: 'D', text: `16843` },
      ],
    },
    {
      order: 25, type: 'mcq', section: 'mcq',
      text: `Ushbu organizm uchun xarakterli bo'lgan belgilarni aniqlang. (Latimeriya balig'i)`,
      options: [
        { letter: 'A', text: `panjaqanotlilar turkumiga kiradi, barqarorlashtiruvchi tanlanish natijasi` },
        { letter: 'B', text: `o'pka bilan nafas oladi, proterozoy erasida paydo bo'lgan` },
        { letter: 'C', text: `baliqlar va sudralib yuruvchilar o'rtasidagi oraliq shakl` },
        { letter: 'D', text: `yuragi ikki kamerali, yo'qolib ketgan turlar ro'yxatiga kiritilgan` },
      ],
    },
    {
      order: 26, type: 'mcq', section: 'mcq',
      text: `Keltirilgan hodisalar qaysi mutatsiya turiga tegishli ekanligini to'g'ri muvofiqlashtirilgan qatorni aniqlang.I) aneuploidiya; II) inversiya; III) allopoliploidiya; IV) transversiya;
1) odamlarda o'roqsimon hujayrali anemiyaning kelib chiqishi;
2) xromosoma o'rta qismining yo'qolishi;
3) odamlarda Daun sindromining kelib chiqishi;
4) xromosomaning ba'zi qismlari joylashuvining 180° ga o'zgarishi;
5) karam va turp duragayining hosil bo'lishi;
6) bug'doyning triploid to'plami hosil bo'lishi.`,
      options: [
        { letter: 'A', text: `I - 3; II - 4; III - 5; IV - 1` },
        { letter: 'B', text: `I - 6; II - 4; III - 3, 5; IV - 1` },
        { letter: 'C', text: `I - 3; II - 4; III - 5, 6; IV - 1` },
        { letter: 'D', text: `I - 3, 6; II - 2; III - 1; IV – 5` },
      ],
    },
    {
      order: 27, type: 'mcq', section: 'mcq',
      text: `Funariya yo'sini (moxi) ning sporofit (a) va gametofit (b) bo'g'ini uchun xos bo'lgan belgilarni aniqlang.
1) mustaqil oziqlanadi;
2) barglarining chetlarida yoki pastki tomonida spora hosil qiluvchi a'zolar — soruslar joylashgan;
3) tuproqqa rizoidlar yordamida birikadi;
4) jinsiz bo'g'in hisoblanadi;
5) ikki jinsli;
6) bahorgi va yozgi poyalarni hosil qiladi;
7) sporadan rivojlanadi (hosil bo'ladi);
8) zigota hosil qiladi;
9) sporali boshoqchaga ega.`,
      options: [
        { letter: 'A', text: `a - 4; b - 1, 3, 7, 8` },
        { letter: 'B', text: `a - 4; b - 1, 3, 9` },
        { letter: 'C', text: `a - 1, 2, 7; b - 1, 5, 8` },
        { letter: 'D', text: `a - 3, 4; b - 1, 6, 7, 8` },
      ],
    },
    {
      order: 28, type: 'mcq', section: 'mcq',
      text: `Buyrak darvozasi (a), buyrak jomi (b), siydik yo'li (c) va siydik pufagi (d) haqida to'g'ri ma'lumot keltirilgan qatorni toping.`,
      options: [
        { letter: 'A', text: `a — buyrak arteriyasi va nervlarning kirish joyi; b — yog' kletchatkasi bilan o'ralgan; c — qorinning orqa devori bo'ylab joylashgan; d — asosida (tubida) uchta teshik bor.` },
        { letter: 'B', text: `a — buyrakning botiq tomonida joylashgan botiqlik; b — unga buyrak kosachalaridan siydik tushadi; c — tsilindrsimon naychalardan iborat; d — qorin bo'shlig'ida joylashgan.` },
        { letter: 'C', text: `a — buyrak arteriyasi, vena, nerv va limfa tomirlari kiradi; b — siydik yo'liga ochiladi; c — siydikni tashqariga chiqaradi; d — hajmi 500–700 ml ni tashkil etadi.` },
        { letter: 'D', text: `a — buyrakning ichki bo'shlig'i bilan tutashgan; b — nefronlarning buyrak so'rg'ichlari uchlari ochiladi; c — siydik pufagining tubiga ochiladi; d — devorining o'rta qavati silliq mushaklardan iborat.` },
      ],
    },
    {
      order: 29, type: 'mcq', section: 'mcq',
      text: `Kordait (a), kalmar (b) va karakatitsa (c) ga tegishli to'g'ri ma'lumotlarni muvofiqlashtiring.
1) produtsent organizm;
2) prokariot organizm;
3) umurtqali hayvon;
4) aerob nafas oladi;
5) konsument organizm;
6) umurtqasiz hayvon.`,
      options: [
        { letter: 'A', text: `a - 4, b - 6, c - 5` },
        { letter: 'B', text: `a - 2, b - 1, c - 5` },
        { letter: 'C', text: `a - 3, b - 4, c - 1` },
        { letter: 'D', text: `a - 4, b - 5, c – 2` },
      ],
    },
    {
      order: 30, type: 'mcq', section: 'mcq',
      text: `Kalxat tanasining qaysi qismlarida O2 gazi konsentratsiyasi past bo'ladi?1) o'ng bo'lmachadagi qon tarkibida;
2) o'ng bo'lmachaga qon keltiruvchi venoz qon tomirida;
3) chap bo'lmachaga qon keltiruvchi venoz qon tomirida;
4) bosh miyadan qon olib ketuvchi qon tomirida;
5) kichik qon aylanish doirasining arterial qon tomirida;
6) chap qorinchadagi qon tarkibida;
7) tana mushaklariga qon olib boruvchi arterial qon tomirlarida.`,
      options: [
        { letter: 'A', text: `1, 4, 5` },
        { letter: 'B', text: `3, 6, 7` },
        { letter: 'C', text: `2, 4, 7` },
        { letter: 'D', text: `3, 5, 6` },
      ],
    },
    {
      order: 31, type: 'mcq', section: 'mcq',
      text: `Quyida keltirilgan hayvonlarning xarakterli xususiyatlarini aniqlang. а) leyshmaniya; b) nurlilar;
1) skelet qoldiqlari metallarni silliqlashda ishlatiladi;
2) uyqu kasalligini keltirib chiqaradi;
3) yuz va ba'zan qo'l terisida uzoq vaqt bitmaydigan yaralar hosil qiladi;
4) chig'anoqlarining to'planishi hozirgi ohaktosh konlarini hosil qilgan;
5) soxta oyoqlilar sinfiga kiradi;
6) doimiy tana shakliga ega.`,
      options: [
        { letter: 'A', text: `а - 2, 6; b - 1, 4.` },
        { letter: 'B', text: `а - 3, 6; b - 1, 5` },
        { letter: 'C', text: `а - 2, 5; b - 4, 6` },
        { letter: 'D', text: `а - 3, 5; b - 4, 5` },
      ],
    },
    {
      order: 32, type: 'mcq', section: 'mcq',
      text: `Kalla suyaksizlar kenja tipi vakillarida qon aylanish sistemasida qonning harakati qaysi javobda to'g'ri ko'rsatilgan?`,
      options: [
        { letter: 'A', text: `yurak qorinchasi → qorin aortasi → jabra arteriyasi → kapillyarlar → orqa aorta → arteriyalar → kapillyarlar → venalar → bo'lmacha` },
        { letter: 'B', text: `bo'lmacha → qorin aortasi → jabra arteriyasi → kapillyarlar → orqa aorta → arteriyalar → kapillyarlar → venalar → yurak qorinchasi` },
        { letter: 'C', text: `orqa aorta → jabra kapillyarlari → jabralar → qorin aortasi → mayda qon tomirlari → to'qimalar → orqa aorta` },
        { letter: 'D', text: `qorin aortasi → jabra kapillyarlari → jabralar → orqa aorta → mayda qon tomirlari → jabra tomirlari → qorin aortasi` },
      ],
    },
    {
      order: 33, type: 'variant', section: 'data',
      text: `Oaqsillardan ajralgan energiya miqdorini (kkal) aniqlang.`,
    },
    {
      order: 34, type: 'variant', section: 'data',
      text: `Uglevodlar massasi yog'lar massasidan necha grammga ko'p?`,
    },
    {
      order: 35, type: 'variant', section: 'data',
      text: `Bu inson iste'mol qilgan oziq-ovqatdan ajralgan energiyaning (kkal) qaysi qismi tushlik paytida yeyilgan ovqatdan olingan? (eng yuqori oziqlanish foizi bo'yicha hisoblang)`,
    },
    {
      order: 36, type: 'numeric', section: 'numeric',
      text: `Xloroplastlarda fotosintez jarayonida noma'lum miqdordagi ADFdan ma'lum miqdorda ATF hosil bo'ldi. Ushbu ATFning 25% i hisobiga glyukoza sintez qilindi. Shu glyukozaning to'liq va noto'liq parchalanishida hosil bo'lgan suv molekulalari sonining xuddi shu vaqtda xloroplastlarda hosil bo'lgan ATF molekulalari soniga nisbati mos ravishda 1:24 ni tashkil etishi ma'lum. Jami 9 mol glyukoza parchalangan. Xloroplastlarda sarflanmay qolgan ATF molekulalari soni dissimilatsiya jarayonida sarflangan ADF molekulalari sonidan nechtaga farq qilishini aniqlang.`,
    },
    {
      order: 37, type: 'numeric', section: 'numeric',
      text: `Muayyan xromosoma tarkibiga kiruvchi genlardagi nukleotidlar soni quyidagicha:Gen A: 3000, B: 8000, C: 6000, D: 4500, E: 5500, F: 8800, G: 1000, H: 4800.Deletsiyaning natijasida D geni xromosoma tarkibidan tushib qoldi, xromosomaning qolgan genlarining bo'yalgan qismida (B va C genlari) esa duplikatsiya mutatsiyasi sodir bo'ldi. Shundan so'ng xromosomada inversiya mutatsiyasi kuzatildi. A, G va H genlari ham deletsiyaning natijasida xromosomadan tushib qoldi. Agar duplikatsiyaga uchragan genlarda guanin nukleotidlari 30% ini, qolgan genlarda esa 60% ini tashkil etsa, gendagi (DNK) umumiy vodorod bog'lari sonini aniqlang.`,
    },
    {
      order: 38, type: 'numeric', section: 'numeric',
      text: `N va M genlari o'rtasidagi yakka krossingover chastotasi 12%, M va L genlari o'rtasida 18%, N va L genlari o'rtasidagi masofa esa 34 morganidaga teng. 2000 ta organizm orasida krossingoverga uchramagan (krossover bo'lmagan) organizmlar sonini aniqlang.`,
    },
    {
      order: 39, type: 'numeric', section: 'numeric',
      text: `Odamlarda qonning normal ivishi va normal ko'rish X-xromosoma bilan birikkan dominant belgilar hisoblanadi. Gemofiliya va daltonizm esa retsessiv kasalliklardir. Polidaktiliya — dominant gen tomonidan yuzaga chiquvchi autosom kasallikdir. Probandning otasi normal barmoqlar soniga, qonning normal ivishiga ega va daltonizm bilan og'rimaydi, uning onasi esa gemofiliya va daltonizm bilan kasallangan, shuningdek, polidaktiliyaga ega (uning barcha genlari gomozigotali). Yigitning onasi gemofiliya va daltonizm bilan og'riydi, yigitning o'zi esa polidaktiliya bo'yicha geterozigotali genotipga ega. Ushbu oilada tug'iladigan bolalarning necha foizi gemofiliya va daltonizm tashuvchisi bo'lib, ayni paytda polidaktiliya bo'yicha geterozigotali genotipga ega bo'ladi?`,
    },
    {
      order: 40, type: 'numeric', section: 'numeric',
      text: `Muayyan DNK molekulasining ikkinchi zanjiridan sintezlangan iRNK tarkibida 30 ta adenin, 40 ta uratsil nukleotidlari bor, guanin nukleotidlari soni esa sitozin nukleotidlari sonidan 50 taga kam. Agar ushbu DNK molekulasidagi vodorod bog'lari soni 890 ta bo'lsa, ushbu DNK tarkibidagi fosfodiefir bog'lari sonini aniqlang.`,
    },
    {
      order: 41, type: 'ai', section: 'ai',
      text: `Topinambur o'simligida poya uzunligi (A) kalta poya (a) ustidan, tugunakning urchuqsimon shakli (B) sharsimon (b) shakl ustidan, poya bo'g'im oralig'ining uzunligi (C) esa kalta bo'g'im oralig'i (c) ustidan to'liq dominantlik qiladi. Barcha belgilar to'liq dominantlik bilan irsiylanadi, genlar bitta autosom xromosomada joylashgan va to'liqsiz birikish holatida bo'ladi. Genlar o'rtasidagi masofa A–B uchun 12,5 M, B–C uchun 10 M ni tashkil etadi, kointsidensiya koeffitsiyenti 0,8 ga teng (B geni o'rtada joylashgan). Tajribada uzun poyali, urchuqsimon tugunakli va uzun bo'g'im oraliqli o'simlik kalta poyali, sharsimon tugunakli va kalta bo'g'im oraliqli o'simlik bilan chatishtirildi. F1 bo'g'inining barcha o'simliklari uzun poyali, urchuqsimon tugunakli va uzun bo'g'im oraliqli bo'ldi. F1 o'simliklari tahliliy chatishtirildi, natijada F2 bo'g'inida 20 000 ta o'simlik olindi.`,
      parts: [
        { key: 'a', text: `ushbu ma'lumotlardan foydalanib, F2 da uzun poyali, urchuqsimon tugunakli va uzun bo'g'im oraliqli o'simliklar sonini aniqlang.` },
        { key: 'b', text: `F2 da kalta poyali, sharsimon tugunakli va uzun bo'g'im oraliqli organizmlar sonini aniqlang.` },
        { key: 'c', text: `F2 da kalta poyali, sharsimon tugunakli va kalta bo'g'im oraliqli o'simliklar sonini aniqlang.` },
      ],
    },
    {
      order: 42, type: 'ai', section: 'ai',
      text: `Odamlarda pakanalik (D), sepkillar (E) va jingalak sochlar (F) (geterozigota holatda — to'lqinsimon) dominant belgilar hisoblanadi. Qon guruhlari A, B, O allellari bilan belgilanadi. Ushbu allellarning chastotalari Xardi-Vaynberg qonuniga bo'ysunishi aniqlangan. Allel chastotalari: D — 20%, E — 40%, F — 50%. Qon guruhi allellarining chastotalari: A — 20%, B — 30%, O — 50%. Agar ushbu shahar populyatsiyasida past bo'yli, sepkilli, to'lqinsimon sochli va I qon guruhiga ega insonlar soni 18 000 kishini tashkil etsa:`,
      parts: [
        { key: 'a', text: `shahardagi IV qon guruhiga ega bo'lgan umumiy insonlar sonini aniqlang.` },
        { key: 'b', text: `ushbu populyatsiyada past bo'yli, to'lqinsimon sochli va IV qon guruhiga ega bo'lgan insonlar sonini aniqlang;` },
        { key: 'c', text: `normal bo'yli, jingalak sochli va II qon guruhiga (geterozigota IAIO) ega insonlar sonini aniqlang.` },
      ],
    },
    {
      order: 43, type: 'ai', section: 'ai',
      text: `Toshkent shahrida 120 000 kishi istiqomat qiladi. Qon guruhini belgilovchi B genining uchrash ehtimolligi 20% ni, III qon guruhiga ega insonlarning uchrash ehtimolligi esa 32% ni tashkil etishi aniqlangan. Shuningdek, shahar aholisining 9% i rezus-manfiy (Rh−) ekanligi ma'lum.`,
      parts: [
        { key: 'a', text: `Toshkent shahrida I qon guruhiga va rezus-musbat faktorga ega insonlar sonini aniqlang.` },
        { key: 'b', text: `Toshkent shahrida III qon guruhiga ega bo'lgan, digeterozigotali (ya'ni ham rezus-faktor, ham qon guruhi bo'yicha geterozigotali) insonlar sonini aniqlang.` },
        { key: 'c', text: `II qon guruhiga va rezus-musbat faktorga ega insonlar soni I qon guruhiga va rezus-manfiy faktorga ega insonlar sonidan necha kishiga ko'p (yoki kam)?` },
      ],
    },
  ],
}
