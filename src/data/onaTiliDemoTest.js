// Demo content for the Ona tili test page design preview.
// Transcribed from the official "2025 aprel imtihoni" sample (Milliy sertifikat,
// Ona tili va adabiyot). Frontend-only — no backend involved.
//
// Passage texts may contain inline markers in the form [[n:phrase]] — the page
// renders these as numbered chips with the phrase highlightable from questions
// that carry a matching `marker` field.

export const onaTiliDemoTest = {
  id: 'onatili-2025-aprel',
  title: 'Ona tili va adabiyot',
  edition: '2025-yil aprel imtihoni',
  durationMinutes: 180,
  sections: [
    { id: 'mcq', num: 'I', label: 'Test savollari', range: '1–17' },
    { id: 'passages', num: 'II', label: 'Matn bilan ishlash', range: '18–32' },
    { id: 'written', num: 'III', label: 'Yozma javoblar', range: '33–44' },
    { id: 'essay', num: 'IV', label: 'Esse', range: '45' },
  ],

  groups: {
    mushuklar: {
      kind: 'prose',
      title: 'Mushuklar',
      instruction: 'Matnni o‘qing va quyidagi topshiriqlarni bajaring.',
      text: `Mushuklar inson bilan ming yillar davomida birga yashab kelgan. Ularning tarixi Misrga borib taqaladi, taxminan 4 ming yil avval u yerda mushuklar don omborlarini kemiruvchilardan himoya qilgani uchun boqilgan. Mushuklar dunyoning barcha hududlariga tarqalgan. Bugungi kunda ularning 500 milliondan ortiq vakillari borligi taxmin qilinadi.

Mushuklar organizmi murakkab va o‘ziga xos tuzilishga ega. [[1:Ular juda chaqqon va egiluvchan.]] Ulardagi bu xususiyat ovni tezroq tutish va anomal holatlarda tez reaksiya ko‘rsatishga moslashgan. Mushuklar 30 dan ortiq turli tovush chiqarishi mumkin, ular orasida miyovlash, g‘uvillash va xirillash mavjud. Ularning juda o‘tkir eshitish va ko‘rish qobiliyatlari bor. Uzoq masofada ham zaif tovushlarni sezish, tungi ko‘rish qobiliyati mushuklarga o‘z ovlarini muvaffaqiyatli tutishga yordam beradi. Ularning orqa oyoqlari kuchli va baland sakrashga moslashgan. Uy mushuklari va yovvoyi mushuklar o‘rtasidagi genetik o‘xshashlik 95 foizni tashkil etadi. Uy mushuklari maksimal 48 km/soat tezlikda harakatlanadi, yovvoyi mushuklar esa ulardan biroz tezroq harakatlanishi mumkin. [[2:Mushuklarni yana bir o‘ziga xosligi shundaki, ular ko‘p uxlaydi.]] Ular kuniga odatda 12 soat uxlashi mumkin. Mushuklar tunda ham yaxshi ko‘ra olishadi. Bunga ko‘zidagi maxsus to‘qimalar yordam beradi. Mushuklar kunduz paytidagi ko‘rishdan ko‘ra tunda 6 barobar yaxshiroq ko‘rishlari ham mumkin. Mushuklardagi mo‘ylovlar esa ularga haroratni sezish va tashqi xavfdan ogoh qilish vazifasini bajaradi. Mushuklar Quyoshdan kelayotgan ultrabinafsha nurlarini ham sezish qobiliyatiga ega. Mushuklarda odatiy holda suvdan qo‘rqish xususiyati mavjud, bu ularning genetik xotirasiga bog‘liq.

[[3:Mushuklar bugungi kunda sayyoramizning deyarli barcha qismida uchraydi.]] Ular qishloq joylardan tortib katta shaharlar va hatto orollargacha yashab keladi. Mushuklarning tabiatdagi roli muhim. Ular o‘rta darajali yirtqich bo‘lib, kemiruvchilar va qushlar populyatsiyasini nazorat ostida ushlab turishga yordam beradi. [[4:Biroq mushuklar tabiiy muvozanatni buzishi ham mumkin.]] Mushuklarning inson bilan aloqalari juda yaqin va hissiydir. Ular uy hayvoni sifatida juda ommabop bo‘lib, taxminan 370 dan ortiq uy mushuklari turi mavjud. Mushuklar insonlarga nafaqat do‘st sifatida yordam beradi, balki stressni kamaytirish va ruhiy salomatlikni yaxshilashga ham hissa qo‘shadi. Olib borilgan tadqiqotlar esa mushuk egalari yurak xurujidan himoyalanganligini ko‘rsatadi.`,
    },

    partiya: {
      kind: 'prose',
      title: 'Qaysi partiya yutadi?',
      author: 'Aziz Nesin',
      credit: 'Turk tilidan Rahmat Bobojon tarjimasi',
      instruction: 'Matnni o‘qing va quyidagi topshiriqlarni bajaring.',
      text: `– Murod og‘a har narsani biladi, – deyishdi.

Qishloqqa kelganimda bir necha marotaba Murod og‘aning uyida mehmon bo‘lgandim. Murod og‘ani bu safar uyidan emas, qahvaxonadan topdim.

– Murod og‘a, siz bilar ekansiz, har holda shunday deyishdi. Qani ayting-chi, bo‘lib o‘tayotgan bu bahslarda qaysi partiya yutib chiqadi? – deya so‘radim.

– Vallohi alam, ma’lummas hali, – dedi.

– Axir qaysi partiya kuchli bo‘lsa o‘sha yutmaydimi?

– Yo‘q, bir narsa deyish qiyin oldindan. [[1:Oq qo‘y oqmi, qora qo‘y qorami — bahs so‘nggida ma’lum bo‘ladi.]] Bu qishloqdagilarning qo‘y bilan ishi yo‘q, qancha so‘rama befoyda. Nega bilasanmi? Unda, eshit.

U o‘ng oyog‘ini o‘ziga tortdi, o‘ziga xos qilib chordona qurdi. Yaxshilab o‘rnashib olgach sigarasini olovlatib so‘z boshladi:

– Avvalo, bilib qo‘y jiyan, bizning mamlakatda partiya-martiya degan narsa yo‘q. To‘g‘ri, bor, faqat nomi bor, hech kim partiya haqida hech narsa bilmaydi. Biz u zamonlar partiyani hukumat deb bilardik. Ulkan bino – hukumat binosi, unda partiya joylashgan deyilardi. Vaqt o‘tib partiya ishi ish bo‘lmay qoldi, to‘g‘ri kelgan odam aralashadigan bo‘ldi. Tikuvchi Komil bir kun yonimga kelib “Murod og‘a, keling siz bilan shu yangi partiyaning bo‘limini ochaylik shu yerda” deb qoldi. “Qani, bu yerdan sur Komilboy, bu sen aytgan partiya deganing mayda-chuyda sotiladigan do‘kon emas, ishingni qil…” dedim. Uning izidan advokat Rizo bey keldi. U ham birga partiya ochaylik, dedi. Aytishicha, u yangi partiyaning kattasi bilan gaplashibdi, masala halmish. Maktub yozishganmish. Ular “Bu mamlakat so‘zingizni tinglaydi, partiyaning bo‘limini oching”, deyishibdi. “Qo‘ying o‘g‘lim, aqlingiz yetmasa keragov, – dedim. – Bir paytlar o‘lkamizda “Erkin jamiyat” nomli tashkilot ishga tushgandi. Uni qurganlarni toshbo‘ron qilishdi. Birortasi yurtimizda qololmadi, muhojirlik to‘rvasini yelkaga osib, vatandan chiqib ketishdi”. Advokat Rizo bey “Yo Xudoyim-ey, Murod og‘a, hozir boshqa zamon… U davrlar o‘tdi. Hozir Amerikada qanday bo‘lsa, bizda ham shu. Har bir inson biror partiya a’zosi bo‘lishga majbur”, dedi. Uning gapiga kirdik, cho‘zib o‘tirmay partiya tuzdik. Biz partiya tuzgach boshqa partiyada qancha odam bo‘lsa bari bizga oqib kelaverdi. Partiyaning kotibi ro‘yxatga olib charchab ketdi. O‘lay agar, buncha odamni nima qilamiz? Meni qo‘rquv bosdi, jiyan, so‘rama… Advokat Rizo bey bizning yo‘lboshchimiz. Unga havotirlanib “Rizo bey, shu ro‘yxat to‘ldi deylik, boshimizga kulfat tushmasin tag‘in”, dedim. “Hech narsa bo‘lmaydi, – deya dalda berdi u. – Partiyaning odami qancha ko‘p bo‘lsa, shuncha yaxshi. Qanchalik tarafdorlarimiz ko‘p bo‘lsa, hukumat bizniki bo‘ladi”. Boshqa partiyadan bizga qo‘shilayotganlar yetmayotgandek, umrida partiya degan so‘zni eshitmaganlar ham kela boshladi, jiyan. Buning oxiri nima bo‘ladi? Yo Xudoyim… Omonni, zamonni anglagan bormi birorta? Kelgan odam partiyamizga kirardi. Mamlakat tarafdorlarimiz bilan to‘ldi, jiyan. Tepadan kimdir bilib qolsa kovushimizni to‘g‘irlashi aniq. Hech bo‘lmasa men shu partiyadan chiqib, boshqasiga kiray, dedim. Bizga partiya markazidan tabriklar kela boshladi. Bizning advokat Rizo bey shunday nutq so‘zlardiki, oh-oh, go‘yo olqishdan bozor yiqilib ketay derdi. Shunday paytda, jiyan, bir xabar keldi, partiyamizning katta boshlig‘i keladi, degan… Yetti yoshdan yetmish yoshga qadar barimiz yurt yo‘llariga to‘kildik. Kimdir buni ko‘rib qolsa, bizni egasiz qo‘ylarday mamlakatning to‘rt tomoniga tarqalib ketishibdi, derdi. Biz advokat Rizo beyni yaxshi nutq so‘zlaydi deb yurgan ekanmiz. Sen nutqni bizning katta boshlig‘imizdan eshitmabsan. U shunday to‘lqinlanib, chayqalib, rolga kirib gapirardiki, millat ho‘ngir-ho‘ngir yig‘lardi. So‘ng yana shunday gapirardiki, millatning kulaverib ichagi uzilardi. [[2:Bir yig‘latadi, bir kuldiradi.]] Go‘yo tugmamiz uning qo‘lida. Tugmani bu tarafga burasa tinmay ko‘z yosh to‘kamiz, boshqa tarafga burasa tinmay qahqaha otamiz.

Nutq tugagach partiyamiz binosiga tashrif buyurdi. Advokat Rizodan:

– Qishloqning aholisi qancha? – deb so‘radi.

Rizo bey:

– Yigirma to‘rt ming, – dedi.

Katta boshlig‘imiz:

– Ovoz berishga kirmaydiganlarni aholiga qo‘shma, – dedi.

– Ulardan tashqari taxminan o‘n ikki ming…

– Bizning partiyaga qanchasi a’zo?

– To‘qqiz ming…

Katta boshliq:

– Unday bo‘lsa bu qishloqda yetarlicha ovoz to‘plabmiz, – deya baqirib yubordi.

Keyin, jiyan, katta boshlig‘imiz ketdi. Narigi partiyani qo‘rquv bosgandi. Darhol uning rahbari qishlog‘imizga keldi. U kelishidan avval men partiyamizdan chiqib, boshqasiga kirmoqchiydim, ulgurolmay qoldim. Bu safar u ham bir nutq so‘zladi. O‘lay agar, jiyan, nutq bo‘lsa shunchalik bo‘ladi. Masjidda mavlud o‘qilsa bunchalik yig‘lashmaydi. Nutqi yakunida:

– Yurtdoshlar, – dedi, – biz hokimiyat tepasiga chiqsak, har bir odamga ming liradan kredit ajratamiz.

Voy jiyan, voy, pul berilishini eshitib shunday narigi partiyaga ko‘chish bo‘ldi. Ertasi kun advokatimiz Rizo bey boshini ushlab, tizzasini quchoqlab yig‘lay boshladi.

– Nima bo‘ldi Rizo bey, tishingiz og‘riyaptimi? – deya so‘radim.

– Tishlarim protez, ming shukrki, og‘rimaydi. Undan yomon xabar bor, barcha tarafkashlarimiz narigi partiyaga o‘tib ketishdi.

– Bizda hech kim qolmadimi?

– Quruvchilar va kredit berilishini eshitmaganlargina qoldi.

Men ham ichburug‘ bo‘lgan odamday burala boshladim. Dodlab sochimni yulaman, Rizo bey ham mendan qolishmaydi.

– O‘lay agar, Rizo bey, – dedim, – bunday soch yulish bilan ish bitmaydi. Tur, biz ham narigi partiyaga kiraylik tezroq. Kech qolsak ro‘yxat to‘ldi, deb olishmaydi.

– Shoshilmay tur, markazga qo‘ng‘iroq qildim, ko‘raylik-chi, nima javob kelar ekan?

Jiyan, qishloqda shunday savdolashish boshlandi, shunday savdo qaynadi, ko‘rmading, ko‘rmadingda. Millat pulsevar, bolam.

– Bu nima sharmandalik, pulni ko‘chadan supurib olyapsizlarmi? – deyman.

– Bu partiya falon pul berishyapti ekan, – deya og‘zimga urishadi. Daryoni ko‘rmay etik yechiladimi hech, jiyan? Bizda yechiladi!

Advokat Rizo ohlagancha boshini ushlab:

– E-voh, ovozlarni yo‘qotdik, – deya baqiradi. Baqirganidan tog‘u tosh titraydi.

Shu desang partiyamiz boshlig‘i yana to‘rt marta shoshilinch kelib ketdi. Xudo haqqi, bir safar mashinadan tushib o‘tirmadi, oyog‘ining changi bilan to‘g‘ri ustiga chiqib, shunday nutq so‘zladiki. Alloh-Alloh! Lof deganing nima? Bir og‘zini ochadi millat kuladi, bir og‘zini ochadi millat yig‘laydi. Eng oxirida:

– Yurtdoshlar, – dedi, – bu yerga mendan avval bittasi kelibdi, sizlarga saylov yakunlangach kredit beraman debdi. Biz, xudo xohlasa, hokimiyat tepasiga chiqsak, ikki ming liradan kredit ajratamiz.

Oh jiyan, yo‘q eding, ko‘rmadingda. Partiyamizning to‘qqiz ming a’zosi bor edi. Sakkiz ming yetti yuzi boshqasiga o‘tgandi. Ikki ming lirani eshitganlar yana partiyamizga qaytib keldi, avvallari to‘qqiz ming a’zomiz bo‘lsa, endilikda o‘n bir mingga yetib qolgandik. Advokat Rizo:

– Bu safar aniq yutib chiqamiz, – derdi.

Faqat Rizo bey emas, hamma shunday derdi. Shaharchada shunday savdo-sotiq boshlandi, oldingisi hech narsa emas.

– Iya, bu nimasi endi? – deyman.

– Narigi partiya bergan pul tugadi, endi sizning partiya va’da qilgan ikki ming lirani kemirmoqchimiz, – deyishardi. Jiyan, bizning hamqishloqlar dono odamlar! Qo‘liga tushgan pulni yeydi, uni yeb tugatgach, boshqasiga o‘tadi. Bu safar narigi partiyadagilar ishga kirishdi. Ularning rahbari keldi.

– Ikki ming lira beramiz deb sizni aldashibdi, – dedi.

Partiyamiz a’zolaridan biri:

– Aldashgani yo‘q, – dedi, – qanday aldashadi. Biz ular aytgan pulni yeb tugatdik allaqachon.

Rahbar:

– Mayli, aldashmagan bo‘lsa-ku mayli, – dedi, – u partiya oila boshiga ikki ming lira bersa, biz kishi boshiga ikki ming liradan berishga qaror qildik. Bormi biror gapingiz?

Qishloqdagilar nutqining qolganini eshitib o‘tirishmadi. Hamma shoshilib u partiyaga o‘ta boshladi. Bizning partiya yana bo‘shab qoldi. Rizo bey:

– E-voh, saylovda yutqazamiz-ku, – deya tinmay oh uradi.

Men bu safar yaxshisi u partiyaga o‘tib qolay dedim. Narigi partiyaning kishi boshiga ikki ming liradan kredit berilishini eshitgan ota aholisini ko‘paytirishga shoshiladi. Mulla nikoh qiyib charchab qoldi. Yo tavba, bu ketishda mamlakatga sig‘may qolamiz-ov.

– Iya o‘g‘lim, bu nima qilganingiz tag‘in? – deya hayratlanaman.

– Jonajon vatanimiz kelajagini yaratyapmiz, – deydi.

Yo Xudoyim, yo tavba, vatan kelajagi shunday yaratiladimi? Shu desang jiyan, partiyamiz katta boshlig‘i yana tashrif buyurdi. O‘lay agar, ayni vaqtida keldi. Agar bir kun kech qolsa aniq partiyamizda birorta a’zo qolmasdi, nafaqat bizda, boshqasida ham. Kelishi bilan shunday nutq so‘zladiki…

– Vatandoshlar, – deya so‘z boshladi, – anavi partiya sizga kishi boshiga ikki ming liradan kredit beraman deb aldagan. Bilib qo‘yinglar, bizning partiya odam boshiga ikki ming lira beradi, hatto foizini ham olmaydi.

Eshitganlar partiyamizga gur etib qaytib keldi. Advokat Rizo saylovda aniq yutamiz deb do‘ppisini osmonga otardi.

– Rizo bey, tezroq shu saylov bo‘lsa yaxshi bo‘lardi, – dedim. – Mabodo narigi partiyadan kelishib narxni oshirishsa yana o‘sha yoqqa qarab jo‘naydi bu bachchag‘arlar.

Aytganimday bo‘ldi. Narigi partiya rahbari keldi.

– Hamyurtlar, – dedi, – kredit foizini olmaslik nima gap? Biz foiz ham olmaymiz, shuningdek, avvalgi qarzlaringizni ham unutamiz. Kreditdan birorta qarzdor odam qolmaydi yurtimizda, inshoolloh!

Maydonni bir ko‘rmadingda, jiyan, to‘y bo‘layotgan joyga aylandi. Kimdir surnay chaladi, kimdir qo‘shiq aytadi… Qiyomatning o‘zi!

– Nima qilamiz Rizo bey? – deya so‘radim.

– Yondik Murod og‘a, adoyi tamom bo‘ldik, – dedi. – Partiyamizda birorta odam qolmadi, hammasi narigiga o‘tib ketdi.

– Yuring, biz ham vaqt borida o‘taylik.

– Shoshilma, katta boshlig‘imizga xat yubordim. Ko‘raylik-chi, kredit qarzlarini o‘chirgach ustiga nima berishar ekan?

Saylovda adolat qolmadi, bolam. Bugun-erta saylovlar bo‘ladigan, yaqin qolgani uchun propaganda taqiqlandi, pul beramiz desakkina kelisharmish a’zolar. Afsus, kech qoldik… Partiyamizda nari-beri yuz kishi bor, narigi partiyada esa o‘n sakkiz ming odamga yetibdi.

– Yo tavba, Rizo bey, qishlog‘imizda bunchalik odam yo‘q, bular qayerdan keldi? – deya savol berdim.

– Kredit qarzdorligi o‘chirilishini eshitishdi, bir odam partiyaga ikkita deb yozildi, – dedi.

– Bizdagi haqiqiy saylovchilar qancha?

– O‘n ikki ming…

– Menga endi ruxsat, Rizo bey. Bu ish partiya ishi. Bu ishda siqilish yaramaydi. Men yaxshisi narigi partiyaga o‘ta qolaman. Maylimi?

Xullas, jiyan, narigi partiyaga o‘tdim.

Murod og‘a qahvaxonachiga uchinchi marotaba qahva buyurdi. Boshqatdan chordona qurdi, oyoqlarini o‘zgartirdi, o‘ng oyog‘ini iyagi ostiga qo‘ydi. Mendan so‘radi:

– Xo‘sh, jiyan, o‘zing ayt… Partiyaning birida o‘n sakkiz ming a’zo bor, boshqasida esa mingta ham chiqmaydi. Qani ayt-chi, saylovda qaysi partiya yutib chiqdi?

– Murod og‘a, buning nimasini so‘raysiz? Albatta o‘n sakkiz ming a’zosi bor bo‘lganda!

– [[3:Bilmading jiyan, bilmading. Saylovda bizning partiyamiz, men tark etgan partiya yutib chiqdi.]] Men o‘shanga ovoz berdim, tushundingmi? Yangi kirgan partiyamga bermadim. Bizning ish shunday, bolam. Bittasi keladi ikki ming beraman deydi, gur etib o‘shanga o‘tishadi, biri keladi uch ming beraman deydi, yana gur etib shunga o‘tishadi. Biroq quloq solma, saylov vaqti keldimi, har kim o‘z bilganini qiladi.

– Mayli-kuya, nega bunday bo‘ladi axir?

– Jonim jiyan, birov keladi, ikki ming lira kredit beraman deydi, uning puli bekorga ketsinmi? Puli behudaga ketmasin deb, uning partiyasiga o‘tiladi. Pul qo‘lga o‘tmasdan yengib chiqilsa, bu boshqa gap, xuddi o‘shandagidek… Pulni eshitgan yana boshqa tomonga o‘tadi.

Ammo saylovlar boshlangach, ko‘ngliga qaysi partiya yoqsa, o‘shanga ovoz beradi. Jiyan, shuning uchun bu ish oldindan ma’lum bo‘lmaydi. Birortamizni yoqamizdan tutib so‘rasang, senga ovoz beramiz, deymiz. Ishonma! Etiklar kiyilganida ma’lum bo‘ladi hammasi. Xo‘sh, jiyan, qahva ichasanmi yana?`,
    },

    gazal: {
      kind: 'poem',
      title: 'G‘azal',
      author: 'Husayniy',
      instruction: 'G‘azalni o‘qing va quyidagi topshiriqlarni bajaring.',
      couplets: [
        ['Bir quyosh hajrida chektim o‘tlug‘ afg‘on bu kecha,', 'Kuymakim dudidin o‘ldi charx giryon bu kecha.'],
        ['Ul quyosh hijronida har bir qarosi shaklidin', 'Qo‘ydilar har bir ko‘zum bir dog‘i xirmon bu kecha.'],
        ['Shomi hijronimni bilmonki, bu yanglig‘ tiyradur,', 'Yo qilibtur dudi ohim oyni pinhon bu kecha.'],
        ['To‘kti kavkab furqating shomida ko‘zum onchakim,', 'Qoldi gardun yuz tuman ko‘z birla hayron bu kecha.'],
        ['Ey ajal, dodimg‘a yetgil bu qatig‘ holatdakim,', 'Yo‘qturur paydo mening shomimg‘a poyon bu kecha.'],
        ['Parcha ming tong yelidin oshufta bo‘lmish bu kecha —', 'Kim, qilibdur ro‘zg‘orimni parishon bu kecha.'],
        ['Ey Husayniy, yorning ko‘ksimga yetgan novakin,', 'Jon berib qildim buzug‘ ko‘nglumg‘a mehmon bu kecha.'],
      ],
      glossary: [
        { term: 'giryon', meaning: 'yig‘lovchi' },
        { term: 'kavkab', meaning: 'yulduz' },
        { term: 'novak', meaning: 'kamon o‘qi' },
        { term: 'gardun', meaning: 'dunyo' },
      ],
    },

    matching: {
      kind: 'matching',
      instruction: 'Gaplar (33, 34, 35) va sintaktik tahlilga oid izohlar (A–F)ni o‘zaro to‘g‘ri moslashtiring.',
      bank: [
        { letter: 'A', text: 'Ajratilgan bo‘lak ishtirok etgan' },
        { letter: 'B', text: 'Shaxsi umumlashgan gap ishtirok etgan' },
        { letter: 'C', text: 'To‘liqsiz gap ishtirok etgan' },
        { letter: 'D', text: 'Kirish gap ishtirok etgan' },
        { letter: 'E', text: 'Atov gap ishtirok etgan' },
        { letter: 'F', text: 'Ergashgan qo‘shma gap ishtirok etgan' },
      ],
    },
  },

  questions: [
    // ——— I. Test savollari (1–17) ———
    {
      id: 1, section: 'mcq', type: 'MultipleChoice',
      text: 'Imloviy jihatdan xato yozilgan so‘zlar qatorini aniqlang.',
      options: [
        { key: 'A', text: 'namoyanda, namoyon, nogahon' },
        { key: 'B', text: 'taajjub, taassurot, tasarruf' },
        { key: 'C', text: 'mujassam, muassasa, mutaxassis' },
        { key: 'D', text: 'tannazul, hayvonat, kampozitor' },
      ],
    },
    {
      id: 2, section: 'mcq', type: 'MultipleChoice',
      text: 'Imloviy jihatdan qo‘shib yoziladigan so‘zlar qatorini aniqlang.',
      options: [
        { key: 'A', text: 'to‘q//qizil, video//kuzatuv, yildan//yilga' },
        { key: 'B', text: 'hazmi//taom, rang//tasvir, radio//eshittirish' },
        { key: 'C', text: 'nano//texnologiya, binafsha//rang, kiber//xavf' },
        { key: 'D', text: 'tim//qora, rang//barang, multi//media' },
      ],
    },
    {
      id: 3, section: 'mcq', type: 'MultipleChoice',
      text: 'Qaysi javobda bot (fe’l) so‘zining izohlari xato berilgan?',
      body: '1. Omonimi: tez (ravish)\n2. Paronimi: yallig‘lanish\n3. Sinonimi: cho‘kmoq\n4. Ko‘chma ma’nosi: botqoqda botmoq',
      options: [
        { key: 'A', text: '1, 4' },
        { key: 'B', text: '2, 3' },
        { key: 'C', text: '1, 2' },
        { key: 'D', text: 'faqat 4' },
      ],
    },
    {
      id: 4, section: 'mcq', type: 'MultipleChoice',
      text: 'O‘zaro ma’nodoshlik hosil qila olmaydigan so‘zlarni aniqlang.',
      options: [
        { key: 'A', text: 'chet, bet, sohil' },
        { key: 'B', text: 'dars, ibrat, saboq' },
        { key: 'C', text: 'mukammal, raso, but' },
        { key: 'D', text: 'sabr, matonatli, bardosh' },
      ],
    },
    {
      id: 5, section: 'mcq', type: 'MultipleChoice',
      text: 'Qaysi gapda qo‘shimcha qo‘llash bilan bog‘liq uslubiy xatolik mavjud?',
      options: [
        { key: 'A', text: 'Nobel mukofoti atoqli arboblarga tinchlikni mustahkamlashdagi xizmatlari uchun berilgan.' },
        { key: 'B', text: 'Saodatmand, dono kimsalar o‘zlarining xushfe’l-atvorini najot sarmoyasi deb biladilar.' },
        { key: 'C', text: 'Ko‘nglim osudalik istar, yolg‘iz bir go‘shaga orom olmoqchi edim.' },
        { key: 'D', text: 'Shoirning orifona mazmun ifodalangan purma’no baytlari diqqatga sazovordir.' },
      ],
    },
    {
      id: 6, section: 'mcq', type: 'MultipleChoice',
      text: 'Qaysi gapda noo‘rin qo‘llangan so‘z mavjud?',
      options: [
        { key: 'A', text: 'Ma’lumki, bugungi kundagi tahrir ishining tarixi yozuvning paydo bo‘lishi va kitobat bilan chambarchas bog‘liq.' },
        { key: 'B', text: 'Men otaxon tavsifi to‘g‘risida to‘la ma’lumotga ega edim. Buni bemalol sizlarga aytib berishim mumkin.' },
        { key: 'C', text: 'Kodeks ixtiro qilingach kitob birinchi marta o‘z shakliga ega bo‘ladi.' },
        { key: 'D', text: 'Uch kecha-yu kunduz tinmay muvaqqat yog‘ayotgan laylak qor tevarakni ko‘rpadek qopladi.' },
      ],
    },
    {
      id: 7, section: 'mcq', type: 'MultipleChoice',
      text: 'Quyidagi gap haqida to‘g‘ri hukm berilgan javobni aniqlang.',
      body: 'O‘zicha g‘ururlanib gapiradigan insonlarda boshqacha bir illat shakllangan: ular dod solib tuhmat qiladi, qoloqlikni ulug‘lab, islohotlarni kamsitadi.',
      options: [
        { key: 'A', text: 'Barcha sodda yasama fe’llarning asosi ikki xil turkum bilan ifodalangan.' },
        { key: 'B', text: 'Sifat va ravish asoslarga fe’l yasovchi qo‘shimcha qo‘shilgan.' },
        { key: 'C', text: 'Olmosh va sifat asoslarga ravish yasovchi qo‘shimcha qo‘shilgan.' },
        { key: 'D', text: 'Fe’l asosga ot yasovchi qo‘shimcha qo‘shilgan.' },
      ],
    },
    {
      id: 8, section: 'mcq', type: 'MultipleChoice',
      text: 'Berilgan gapda qatnashgan fe’llar haqida to‘g‘ri hukmni aniqlang.',
      body: 'Respublikamiz o‘quvchi va o‘qituvchilarini kerakli va zarur qo‘llanmalar bilan ta’minlashimiz, yana ham qulayliklar ustida ishlashimiz kerakligi haqida o‘ylayapmiz.',
      options: [
        { key: 'A', text: 'Barcha fe’llar so‘zga so‘z qo‘shish usuli orqali yasalgan fe’llar hisoblanadi.' },
        { key: 'B', text: 'Barcha fe’llar vazifa shakliga ko‘ra bir turga mansub fe’llar hisoblanadi.' },
        { key: 'C', text: 'Barcha fe’llar so‘zga qo‘shimcha qo‘shish usuli orqali yasalgan sodda yasama fe’llar hisoblanadi.' },
        { key: 'D', text: 'Barcha fe’llar o‘zaro har xil nisbat shaklidagi fe’llar hisoblanadi.' },
      ],
    },
    {
      id: 9, section: 'mcq', type: 'MultipleChoice',
      text: 'Berilgan gaplarda ishtirok etgan ravish turkumiga mansub so‘zlar haqidagi to‘g‘ri hukmni aniqlang.',
      body: 'I. Men har kuni bir necha marotaba o‘zimni tergayman: maslahatlarim yetarlicha samimiymikan?\nII. Choyni nari-beri ichib, otxonaga yugurdim.',
      options: [
        { key: 'A', text: 'Har ikki gapda ravish yasovchi qo‘shimcha ishtirok etgan.' },
        { key: 'B', text: 'Har ikki gapda qo‘shma ravish ishtirok etgan.' },
        { key: 'C', text: 'Har ikki gapda holat ravishi ishtirok etgan.' },
        { key: 'D', text: 'Har ikki gapda yasama ravish ishtirok etgan.' },
      ],
    },
    {
      id: 10, section: 'mcq', type: 'MultipleChoice',
      text: 'Gap haqidagi xato hukmni aniqlang.',
      body: 'Afsus-u nadomat bilan o‘tkazma umr,\nHar lahza aziz, vaqt misoli shamshir.',
      options: [
        { key: 'A', text: 'Gapda vaziyat holi kesimga bevosita tobelangan.' },
        { key: 'B', text: 'Barcha kesimlar bir xil so‘z turkumi bilan ifodalangan.' },
        { key: 'C', text: 'Gapda kesimning ifodalanishiga ko‘ra ikki turi qatnashgan.' },
        { key: 'D', text: 'Gapda vaziyat holining uyushishi kuzatiladi.' },
      ],
    },
    {
      id: 11, section: 'mcq', type: 'MultipleChoice',
      text: 'Gapdagi so‘zlarning mazmun va grammatik jihatdan bog‘lanishi to‘g‘ri ko‘rsatilgan javobni aniqlang.',
      body: 'Bugun san’atda iqtidorli, ilm-fanda raqobatbardosh, teran tafakkurli va yuksak ma’naviyatli avlodni tarbiyalash ustozlarimizning oliy maqsadi, ustuvor vazifasi hamda vatan oldidagi muqaddas burchidir.',
      options: [
        { key: 'A', text: 'teran avlod, ustozlarimizning burchidir' },
        { key: 'B', text: 'yuksak avlod, ilm-fanda raqobatbardosh' },
        { key: 'C', text: 'vatan oldidagi, muqaddas burchidir' },
        { key: 'D', text: 'tarbiyalash vazifasidir, maqsad hamda burchi' },
      ],
    },
    {
      id: 12, section: 'mcq', type: 'MultipleChoice',
      text: 'Qaysi gapda tire bir xil punktuatsion qoida asosida qo‘yilgan?',
      body: '1. To‘nni yaxshi ko‘rsatgan — yengi bilan yoqasi.\n2. Qozon qayda — suv shunda.\n3. Mehmon mezbonga aziz, mezbon — mehmonga.\n4. Xalqaro savdo yo‘li — Buyuk ipak yo‘li Temuriylar davrida juda serqatnov bo‘lgan.\n5. Mehnat qilding — xo‘p qilding, minnat qilding — yo‘q qilding.',
      options: [
        { key: 'A', text: '1, 3' },
        { key: 'B', text: '2, 5' },
        { key: 'C', text: '3, 5' },
        { key: 'D', text: '2, 4' },
      ],
    },
    {
      id: 13, section: 'mcq', type: 'MultipleChoice',
      text: 'She’riy parcha haqidagi to‘g‘ri hukmni toping.',
      body: 'Xasta yorim, za’fin angla, ko‘nglum afg‘onin ko‘rub,\nSo‘rma ko‘nglum yorasin, fahm et ko‘zum qonin ko‘rub.',
      options: [
        { key: 'A', text: 'Baytda muqayyad qofiya qatnashgan.' },
        { key: 'B', text: 'Baytda n undoshi raviy vazifasini bajargan.' },
        { key: 'C', text: 'Baytda radif ishtirok etmagan.' },
        { key: 'D', text: 'Baytda tarse san’atidan foydalanilgan.' },
      ],
    },
    {
      id: 14, section: 'mcq', type: 'MultipleChoice',
      text: 'Quyidagi bayt haqida to‘g‘ri ma’lumot berilgan javobni aniqlang.',
      body: 'O‘sma uzra zarvaraqlik ikki qoshing yuz uza\nJilvagar bo‘lg‘an iki tovus erur gulzor aro.',
      options: [
        { key: 'A', text: 'Baytda ishtiqoq she’riy san’ati qatnashgan.' },
        { key: 'B', text: 'Baytda muqayyad qofiya qatnashgan.' },
        { key: 'C', text: 'Yor yuzi gulzorga tashbeh qilingan.' },
        { key: 'D', text: 'Baytda husni ta’lil she’riy san’ati qatnashgan.' },
      ],
    },
    {
      id: 15, section: 'mcq', type: 'MultipleChoice',
      text: 'Chexovning «Garov» hikoyasi mazmuniga oid TO‘G‘RI fikrni aniqlang.',
      options: [
        { key: 'A', text: 'Inson uchun o‘limdan ko‘ra yashamoqning afzal ekanligi bankir qarashlarining asosiy tomoni edi.' },
        { key: 'B', text: 'Huquqshunos qamoqda o‘tgan o‘n besh yiliga juda afsuslanadi, chunki uning eng kuchga to‘lgan, hayotining bahori qamoqda o‘tayotgan edi.' },
        { key: 'C', text: 'Huquqshunos bankirning qiyin vaziyatda qolganini bilib, garovni yutqazishga ahd qiladi va qamoqdan qochib ketadi.' },
        { key: 'D', text: 'Bankir huquqshunosni o‘ldirmoqchi bo‘ladi, ammo huquqshunosning yozganlarini o‘qib, bu fikrdan qaytadi.' },
      ],
    },
    {
      id: 16, section: 'mcq', type: 'MultipleChoice',
      text: 'Shukur Xolmirzayevning «Ot egasi» asari haqida berilgan XATO hukmni aniqlang.',
      options: [
        { key: 'A', text: 'Insonning o‘tmishga, qadriyatlarga, insoniylikka bo‘lgan sadoqati va sobitligi ulug‘langan.' },
        { key: 'B', text: 'Hukumat qonunlarini ro‘kach qilib, o‘z qishloqdoshini qadrli otidan judo qilgan leytenantning qilmishlari qoralangan.' },
        { key: 'C', text: 'Leytenantdan alamini olish uchun o‘z otini o‘ldirgan va uyidan bosh olib chiqib ketgan obraz tasvirlangan.' },
        { key: 'D', text: 'Asarda ayanchli taqdiri tufayli oilasidan ayrilgan qahramon iztiroblari tasvirlangan.' },
      ],
    },
    {
      id: 17, section: 'mcq', type: 'MultipleChoice',
      text: 'Cho‘lponning «Kecha va kunduz» romani qahramonlari haqida berilgan TO‘G‘RI javobni belgilang.',
      body: '1) Zebi – ertalabdan uyiga kelgan o‘rtog‘ining taklifidan juda xursand bo‘lgan, lekin onasini yolg‘iz tashlab ketishni istamagan edi.\n2) Qurvonbibi – umri to‘rt devor orasida o‘tgan, na turmushidan, na eridan yolchigan, faqat yolg‘iz qizining saodatinigina o‘ylab yashaydigan obraz edi.\n3) Razzoq so‘fi – bu odamga gap uqtirish juda ham qiyin edi, chunki u hammaning ham gapini olmas, faqat eshon va o‘z xotinining gaplarigagina e’tibor berardi.',
      options: [
        { key: 'A', text: '1 va 2' },
        { key: 'B', text: '1, 2 va 3' },
        { key: 'C', text: 'faqat 2' },
        { key: 'D', text: '2 va 3' },
      ],
    },

    // ——— II. Matn bilan ishlash (18–32) ———
    {
      id: 18, section: 'passages', group: 'mushuklar', type: 'MultipleChoice',
      text: 'Matn mazmuniga mos to‘g‘ri shakllantirilgan gapni aniqlang.',
      options: [
        { key: 'A', text: 'Mushuklardagi yaxshi eshitish mexanizmi ularga eng zaif tovushlarni ham payqashga imkon beradi.' },
        { key: 'B', text: 'Quyoshning ultrabinafsha nurlari mushuklardagi suvdan qo‘rqish genini shakllanishiga sabab bo‘ladi.' },
        { key: 'C', text: 'Mushuklar populyatsiyasida kemiruvchi va qushlar muhim ahamiyatga ega.' },
        { key: 'D', text: 'Mushuklarning tungi ko‘rish qobiliyati ularning faqat tunda ov qilishini isbot etadi.' },
      ],
    },
    {
      id: 19, section: 'passages', group: 'mushuklar', type: 'MultipleChoice',
      text: 'Matn mazmuniga xos bo‘lgan to‘g‘ri ma’lumotni aniqlang.',
      options: [
        { key: 'A', text: 'Qadimgi misrliklar mushuklardan nafaqat ijtimoiy hayotda, balki madaniy sohalarda ham foydalanishgan.' },
        { key: 'B', text: 'Yovvoyi mushuklarning orqa oyoqlari kuchli bo‘lgani uchun ular uy mushuklariga nisbatan tezroq harakatlanadi.' },
        { key: 'C', text: 'Mushuklar genetikasida suvdan qo‘rqish refleksi shakllangan va u mushuklarga gen sifatida o‘tadi.' },
        { key: 'D', text: 'Yer yuzida faqat mushuklar yashaydigan qishloq va orollarni ham uchratish mumkin.' },
      ],
    },
    {
      id: 20, section: 'passages', group: 'mushuklar', type: 'MultipleChoice',
      text: 'Matnda aks etgan ma’lumotni aniqlang.',
      options: [
        { key: 'A', text: 'Mushuk mo‘ylovlari ov qilishda muhim ahamiyatga ega.' },
        { key: 'B', text: 'Mushuklar boshqalar e’tiborini tortish uchun 30 xil ovoz chiqarishi mumkin.' },
        { key: 'C', text: 'Shifokorlar mushuklardan tibbiy maqsadda foydalanishni tavsiya etishadi.' },
        { key: 'D', text: 'Mushuklardagi elastik tana tuzilishi ularga ov qilishni osonlashtiradi.' },
      ],
    },
    {
      id: 21, section: 'passages', group: 'mushuklar', type: 'MultipleChoice',
      text: 'Matn mazmuniga xos bo‘lmagan ma’lumot berilgan javobni aniqlang.',
      options: [
        { key: 'A', text: 'Uy va yovvoyi mushuklar genetik jihatdan bir-biriga deyarli o‘xshash.' },
        { key: 'B', text: 'Mushuklar kunning yarmini uyqu bilan o‘tkazadigan hayvonlar sirasiga kiradi.' },
        { key: 'C', text: 'Mushuklar mo‘ylovlari orqali Quyoshning ultrabinafsha nurlarini ham sezadi.' },
        { key: 'D', text: 'Mushuklar inson ichki kasalliklarining oldini olishda muhim rol o‘ynaydi.' },
      ],
    },
    {
      id: 22, section: 'passages', group: 'mushuklar', type: 'MultipleChoice',
      text: 'Raqamlab ko‘rsatilgan qaysi gap matnning mazmuniy tuzilishida uslubiy xatolikni yuzaga keltirgan?',
      options: [
        { key: 'A', text: '4' },
        { key: 'B', text: '2' },
        { key: 'C', text: '1' },
        { key: 'D', text: '3' },
      ],
    },
    {
      id: 23, section: 'passages', group: 'partiya', type: 'MultipleChoice',
      text: 'Matn mazmuni haqida TO‘G‘RI hukmni aniqlang.',
      options: [
        { key: 'A', text: 'Saylovda partiyaning adolat bilan g‘alaba qozongani aks etgan.' },
        { key: 'B', text: 'Siyosiy cheklovlarning salbiy oqibati sifatida yuzaga kelgan siyosiy savodsizlik hajv yo‘li bilan fosh etilgan.' },
        { key: 'C', text: 'Murod og‘a o‘z partiyasini o‘zgartirgandan mamnun bo‘ladi.' },
        { key: 'D', text: 'Rizo bey partiya rahbarlaridan ruxsatsiz ish yuritishi keltirilgan.' },
      ],
    },
    {
      id: 24, section: 'passages', group: 'partiya', type: 'MultipleChoice',
      text: 'Matn mazmuni haqida XATO hukmni aniqlang.',
      options: [
        { key: 'A', text: 'Saylov oxirida kam a’zosi bor partiya yutib chiqadi.' },
        { key: 'B', text: 'Murod og‘a mo‘may pul uchun o‘z partiyasini o‘zgartiradi.' },
        { key: 'C', text: 'Murod og‘aning oldiga partiya ochish fikri bilan Rizo beydan oldin ham boshqalar kelgan.' },
        { key: 'D', text: 'Saylovda partiyaning adolat bilan g‘alaba qozongani aks etgan.' },
      ],
    },
    {
      id: 25, section: 'passages', group: 'partiya', type: 'MultipleChoice', marker: 1,
      text: '[1] raqami bilan berilgan parcha mazmuniga mos to‘g‘ri javobni aniqlang.',
      options: [
        { key: 'A', text: 'Partiyaga talab borligi, ammo partiyani qo‘llaydigan xalqning soddaligi.' },
        { key: 'B', text: 'Kishilarning arzimas narsalar ustida tortishishi va boshqalarning bunga tomoshabin bo‘lishi.' },
        { key: 'C', text: 'Demokratiyaning amalda mavjud emasligiga ishora qilingan.' },
        { key: 'D', text: 'Haqiqatgo‘y insonlarning o‘rni doim yuqori ekani, ammo bundan naf yo‘qligi.' },
      ],
    },
    {
      id: 26, section: 'passages', group: 'partiya', type: 'MultipleChoice', marker: 2,
      text: '[2] raqami bilan berilgan parcha mazmuniga mos to‘g‘ri javobni aniqlang.',
      options: [
        { key: 'A', text: 'O‘z manfaati yo‘lida xalqni ergashtira oladigan mahoratli notiq tasviri mavjud.' },
        { key: 'B', text: 'Qat’iyatlilik va jur’atlilikda namuna bo‘la oladigan, butun millat dardi bilan yashaydigan inson.' },
        { key: 'C', text: 'Kishilarni ishontirishda o‘z nutqida rivoyat va latifalarni o‘rinli qo‘llay biladigan zakovatli inson.' },
        { key: 'D', text: 'So‘z qiymatini biladigan va behuda so‘zlashni yoqtirmaydigan dono inson.' },
      ],
    },
    {
      id: 27, section: 'passages', group: 'partiya', type: 'MultipleChoice', marker: 3,
      text: '[3] raqami bilan ajratib ko‘rsatilgan gapda qanday uslubiy mazmun yuzaga chiqqan?',
      options: [
        { key: 'A', text: 'g‘azab, nafrat' },
        { key: 'B', text: 'kinoya, kesatiq' },
        { key: 'C', text: 'malomat, ta’na' },
        { key: 'D', text: 'achinish, nadomat' },
      ],
    },
    {
      id: 28, section: 'passages', group: 'gazal', type: 'MultipleChoice',
      text: 'G‘azal matla’si haqida berilgan TO‘G‘RI hukmni aniqlang.',
      options: [
        { key: 'A', text: 'Baytda oshiq quyoshdek o‘tli fig‘on chekkanini aytadi.' },
        { key: 'B', text: 'Baytda oshiq azob otashining tutunlari deya bulutlarni nazarda tutadi.' },
        { key: 'C', text: 'Baytda tamsil san’atining yorqin namunasi berilgan.' },
        { key: 'D', text: 'Baytda oshiq yorni sog‘inib yig‘laganini aytadi.' },
      ],
    },
    {
      id: 29, section: 'passages', group: 'gazal', type: 'MultipleChoice',
      text: '2-bayt haqida qaysi javobda XATO fikr berilgan?',
      options: [
        { key: 'A', text: 'Baytda oshiq sog‘inchda o‘tayotgan kunlarni shomdek qorong‘i ekanligini aytadi.' },
        { key: 'B', text: 'Baytda oshiq faryodining tutuni osmondagi oyni berkitganligi tasvirlangan.' },
        { key: 'C', text: 'Qorong‘u tundagi oy egik yoyga tashbeh qilingan.' },
        { key: 'D', text: 'Baytda tanosib san’atining yorqin namunasi mavjud.' },
      ],
    },
    {
      id: 30, section: 'passages', group: 'gazal', type: 'MultipleChoice',
      text: '2 va 4-baytlarda qatnashgan she’riy san’atlarni aniqlang.',
      body: '1) istiora   2) husni ta’lil   3) ishtiqoq   4) iyhom   5) tadrij',
      options: [
        { key: 'A', text: '1 va 3' },
        { key: 'B', text: '3 va 4' },
        { key: 'C', text: '2 va 4' },
        { key: 'D', text: '1 va 4' },
      ],
    },
    {
      id: 31, section: 'passages', group: 'gazal', type: 'MultipleChoice',
      text: 'G‘azaldagi baytlar haqida XATO fikrni aniqlang.',
      options: [
        { key: 'A', text: '5-baytda oshiq yorsiz o‘tayotgan kunlarining poyonsiz ekanini aytadi.' },
        { key: 'B', text: '7-baytda oshiq yori mehmon bo‘lib kelganini aytadi.' },
        { key: 'C', text: '3-baytda yorning chiroyli yuzi qarshisida hatto oy ham yoydek egilib qolgani aytiladi.' },
        { key: 'D', text: '6-baytda tong otish manzarasi berilgan.' },
      ],
    },
    {
      id: 32, section: 'passages', group: 'gazal', type: 'MultipleChoice',
      text: 'G‘azal maqta’si mazmuni haqida qaysi javobda TO‘G‘RI fikr berilgan?',
      options: [
        { key: 'A', text: 'Baytda yorning hijron tuni nihoyasiga yetgani aytilgan.' },
        { key: 'B', text: 'Baytda ruhiyat tasvirida qo‘llangan tashxis ifoda bo‘yoqdorligini oshirgan.' },
        { key: 'C', text: 'Baytda oshiqning ko‘p ko‘z yosh to‘kkanidan falak taajjubda ekanligi ta’kidlangan.' },
        { key: 'D', text: 'Baytda oshiqning ohlari yor qalbiga kamon o‘qidek sanchilgani aytilgan.' },
      ],
    },

    // ——— III. Yozma javoblar (33–44) ———
    {
      id: 33, section: 'written', group: 'matching', type: 'Matching',
      text: 'Ordenli shoirning shuhratdan mast, uchib-qo‘nib yurgan paytlari. Orden hali u kostyumning, hali bu kostyumning yoqasiga taqilardi.',
    },
    {
      id: 34, section: 'written', group: 'matching', type: 'Matching',
      text: 'Filga aylanibsan, chumoli, nechun?\n— Ro‘zg‘orimdan ko‘nglim to‘qligi uchun.',
    },
    {
      id: 35, section: 'written', group: 'matching', type: 'Matching',
      text: 'Bundan qirq yil muqaddam — ming to‘qqiz yuz qirq to‘rtinchi yilda — O‘zbekiston Davlat nashriyoti mo‘jazgina bir she’riy to‘plamni chop etdi.',
    },
    {
      id: 36, section: 'written', type: 'FreeAnswer',
      text: 'Ajratib ko‘rsatilgan har uchala so‘z bilan ma’nodoshlik hosil qila oluvchi so‘zni yozing.',
      body: '1) tez orada   2) qadrdon o‘rtoqlar   3) ko‘ngilga tanish',
    },
    {
      id: 37, section: 'written', type: 'FreeAnswer',
      text: 'Berilgan gapda qo‘llanishi kerak bo‘lgan tinish belgilarining to‘g‘ri ketma-ketligini yozing.',
      body: 'Donishmand aytadi Ochko‘zni ovqat bilan yeng g‘ururlini yolvorish bilan nodonni xushomad bilan oqilni haqiqat bilan',
    },
    {
      id: 38, section: 'written', type: 'FreeAnswer',
      text: 'Parchada qo‘llangan so‘z yasovchi qo‘shimcha bilan almashtirib qo‘yish mumkin bo‘lgan ma’nodosh qo‘shimchani yozing.',
      body: 'Hasadchi borib qolsa zindon sari\nO‘char suvga tushgan olov singari',
    },
    {
      id: 39, section: 'written', type: 'FreeAnswer',
      text: 'Parchada qaysi bo‘lak ajratilgan bo‘lak vazifasini bajargan?',
      body: 'Odamlar qaynaydi gavjum ko‘chada,\nHar kim yuguradi qaygadir doim.\nFaqat chorrahada — taxta uychada\nGazeta sotuvchi o‘tirar qoyim.',
    },
    {
      id: 40, section: 'written', type: 'FreeAnswer',
      text: 'Gapdagi so‘zlarning mazmunan va grammatik jihatdan bog‘lanishlarini tahlil qiling.',
      body: 'Nazrul Islomning erkparvar nidosi(1) xalqni birlashmoqqa, o‘zaro diniy e’tiqodlar nizosidan xalos bo‘lmoqqa(2), qabih mustamlakachilik zulmiga qarshi jang qilmoqqa chorladi.',
      parts: [
        { key: 'a', text: '(1) raqami bilan ajratib ko‘rsatilgan so‘z tobelanib bog‘langan so‘zni aniqlang.' },
        { key: 'b', text: '(2) raqami bilan ajratib ko‘rsatilgan so‘z tobelanib bog‘langan so‘zni aniqlang.' },
      ],
    },
    {
      id: 41, section: 'written', type: 'FreeAnswer',
      text: 'Berilgan gaplarni grammatik jihatdan to‘g‘ri bog‘lang.',
      body: '1) Atrof zim-ziyo.\n2) Bir miltillagan yulduz ko‘rinadi.\n3) Bir milt etgan nur ko‘zga tashlanadi.',
      parts: [
        { key: 'a', text: 'Birinchi va ikkinchi gapni qanday grammatik vosita yordamida to‘g‘ri bog‘lash mumkin?' },
        { key: 'b', text: 'Natijada qanday qo‘shma gap yuzaga keladi?' },
      ],
    },
    {
      id: 42, section: 'written', type: 'FreeAnswer',
      text: 'She’riy parchadagi badiiy san’atni aniqlang va yozing.',
      body: 'Yuzingdek qamar yo‘qdir, qadingdek shajar yo‘qdur,\nYeti jon og‘zimg‘aki chiqmas uyidin ul hur.',
      parts: [
        { key: 'a', text: 'Ikkinchi misradagi she’riy san’atni yozing.' },
        { key: 'b', text: 'She’riy san’atning izohini yozing.' },
      ],
    },
    {
      id: 43, section: 'written', type: 'FreeAnswer',
      text: 'She’riy parchaning qofiyalarini tahlil qiling va yozing.',
      body: 'Hajringda, begim, «Oh!» degumdur, dag‘i o‘lgum,\n«Yod aylagil, ey shoh!» degumdur, dag‘i o‘lgum.',
      parts: [
        { key: 'a', text: 'Qofiyadosh so‘zlardagi raviyni yozing.' },
        { key: 'b', text: 'Raviyning o‘rniga ko‘ra qofiyaning qaysi turi shakllangan?' },
      ],
    },
    {
      id: 44, section: 'written', type: 'FreeAnswer',
      text: 'Quyidagi parchani tahlil qiling va savollarga javob yozing.',
      body: 'So‘g‘d ichida o‘ltururlar yobular,\nYobularning mingan oti yobular.\nYobularning ilgidan el tinmadi,\nYo bular bo‘lsin bu yerda, yo bular.',
      parts: [
        { key: 'a', text: 'Ushbu parcha qaysi janrda yozilgan?' },
        { key: 'b', text: 'Ushbu janrning o‘ziga xos belgisini yozing.' },
      ],
    },

    // ——— IV. Esse (45) ———
    {
      id: 45, section: 'essay', type: 'Essay',
      text: 'Quyidagi vaziyat yuzasidan o‘z munosabatingizni yozma bayon qiling.',
      body: 'Ba’zilar ta’lim olish jarayonida mehnat faoliyati bilan ham shug‘ullansa, tajriba oshib boradi deb hisoblashadi, ayrimlar esa ta’lim jarayonida chalg‘imasdan faqat bilim olish muhimligini ta’kidlashadi.',
      requirements: [
        'Fikr-mulohazalaringizni publitsistik uslubda bayon qiling.',
        'Fikrlaringizni mantiqiy izchillikda, adabiy til me’yorlariga amal qilgan holda ifodalang.',
      ],
      structure: {
        kirish: ['Kirish qismi 2–3 jumladan iborat bo‘lishi lozim.', 'Berilgan vaziyat matnini aynan ko‘chirmang.'],
        asosiy: [
          'Asosiy qism kamida uchta xatboshidan iborat bo‘lishi lozim.',
          'Har bir xatboshida tomonlarning qarashlari va shaxsiy qarashlaringizni batafsil yoriting.',
          'Turli qarashlarni hayotiy misollar bilan dalillang.',
          'Barcha fikr-mulohazalar faqat mavzu doirasida bo‘lishi lozim.',
        ],
        xulosa: ['Asosiy qismda ifodalangan fikr-mulohazalarni umumlashtiring.', 'Xulosa 2–3 jumladan iborat bo‘lishi lozim.'],
      },
      notes: ['Esse uchun reja tuzilmaydi.', 'Epigraf qo‘yilmaydi.'],
    },
  ],
}
