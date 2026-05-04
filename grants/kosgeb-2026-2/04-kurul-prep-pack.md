# Kurul Hazırlık Paketi — Prodaktiv

KOSGEB Girişimci Destek Programı kurul (değerlendirme komitesi) sözlü savunması için hazırlık.

---

## Kurul'a Yaklaşım Doktrini

Kurul üç soruya cevap arar — her şey buralara dönüyor:

1. **Bu girişimci işi başarabilir mi?** (Yetkinlik)
2. **Bu iş gerçekten yenilikçi mi, başka biri yapamaz mı?** (Moat)
3. **Devletten alınan parayı geri verebilir mi?** (Geri ödeme kapasitesi)

Diğer her soru bu üçünün varyasyonudur. Cevaplarken bu üçlüye bağlanan iplere tutun — soyut savunmalardan kaçın, somut göstergelere dön.

**Sunum dilinin özü:**
- Ağırbaşlı ve kendinden emin (urgency yerine confidence)
- "Düşündük, denedik, biliyoruz" — varsayım kelimelerinden ("sanıyoruz", "umut ediyoruz") kaçın
- Sayılar ve isimler — "büyük pazar" yerine "12 milyon Linear kullanıcısı"
- Kurul hata yapmak istemez; onlara doğru kararı vermenin kolay bir yolunu sun

---

## Bölüm 1 — En Olası Sorular ve Cevap İskeletleri

### S1: Bize kendinizi ve iş fikrinizi kısaca tanıtır mısınız?

**Cevap iskelet (90 saniye):**

> "Ben Aysima [Soyadı], Prodaktiv'in kurucusu ve genel müdürüyüm. Eş kurucum Resat Uğur Ulu CTO olarak teknik tarafı yönetiyor. Daha önce [kısa özgeçmiş — Aysima eklesin: hangi şirketlerde, hangi rolde, hangi proje].
>
> Prodaktiv, yazılım geliştiricilerin ve bilgi işçilerinin telefon dikkatsizliğinden kaynaklanan üretkenlik kaybını çözen bir hibrit yazılım–donanım ürünüdür. Yazılım katmanımız Linear gibi görev yönetim platformlarıyla doğrudan eşleşir, sesli giriş ile yapay zekâ destekli plan üretir, 90 dakikalık zorlanmış odak oturumları başlatır. Donanım katmanımız ise telefonu fiziksel olarak kilitleyen bir solenoid mekanizmalı dock'tur — kullanıcı oturum sırasında telefonunu çıkaramaz.
>
> Yazılım ürünümüz şu anda kapalı beta'da, 1.000+ bekleme listesi kullanıcımız var. Donanım Q3 2026'da pre-order'a açılıyor. Bugüne kadar Fuego Labs altyapısı üzerinde dogfooding ile geliştirildi, iki kurucunun özsermayesi ile finanse edildi."

### S2: Sizin ürününüzün rakiplerden farkı ne? Örneğin Brick Wallet zaten benzer bir donanım yapıyor.

**Cevap iskelet:**

> "Brick Wallet sadece bir donanım — telefonu kilitler, biter. Bizim ürünümüz dört katmanı bir araya getiriyor: fiziksel kilit, Linear iş yönetimi entegrasyonu, sesli komuttan yapılandırılmış AI plan üretimi, ve uzun vadede üçüncü taraf eklentileri için açık bir marketplace.
>
> Bunu mümkün kılan şey, parent şirketimiz Fuego Labs'ın geliştirdiği Graphyn yapay zekâ ajan platformuna ayrıcalıklı erişimimiz. Rakipler harici LLM API'larına bağımlı, sürekli artan API maliyetleriyle karşı karşıya. Biz kendi ajan altyapımızı kullanıyoruz — bu hem maliyet hem performans hem de gizlilik avantajı.
>
> Pratik olarak: Brick Wallet'ın hedef kitlesi sosyal medya azaltmak isteyen tüketici. Bizim hedef kitlemiz Linear kullanan, AI araçlarına ayda 100–500 dolar harcayan yazılım profesyoneli — fiyatlandırma seviyemiz, entegrasyon derinliğimiz, ürün rotamız bambaşka bir niş'i adresliyor."

### S3: 2 milyon TL'yi nasıl harcayacaksınız?

**Cevap iskelet:**

> "Bütçe üç ana kalem etrafında yapılandırıldı: %50 personel, %23 makine-teçhizat-yazılım, %27 hizmet alımı.
>
> Personel tarafında 36 ay boyunca 4 bilişim çalışanını Türkiye'de istihdam edeceğiz: bir senior backend mühendisi, bir frontend, bir embedded mühendisi, bir tasarımcı. Hepsi tam zamanlı, SGK tescilli, %100 Türkiye'de mukim.
>
> Makine-teçhizat tarafında geliştirme istasyonları, ESP32-S3 prototipleme kitleri, e-mürekkep ekran stoğu, lehimleme ve test ekipmanı. Yazılım tarafında JetBrains, Figma, GitHub Enterprise lisansları ve cloud altyapı — AWS, Cloudflare.
>
> Hizmet alımı kaleminin en büyük iki parçası belgelendirme — donanım için CE ve FCC sertifikasyonu, yazılım için ISO 27001 — ve sınai mülkiyet — solenoid mekanizma için faydalı model başvurusu, marka tescili TR + EU + US.
>
> Ayrıntılı kalem-kalem dağılım iş planımızda Ek-1 olarak sunulmuştur."

### S4: Geri ödemeli desteği nasıl geri ödeyeceksiniz?

**Cevap iskelet:**

> "Geri ödemenin başlayacağı 42. ayda, finansal projeksiyonumuza göre yıllık geliri yaklaşık 2 milyon dolar olan bir şirket olacağız. Geri ödenecek 1,5 milyon TL'lik tutar yaklaşık 35 bin dolar — yıllık gelirimizin %1,8'i. Muhafazakar senaryoda — projeksiyonun yarısını tutturmamız durumunda bile — geri ödeme rahatlıkla karşılanır.
>
> Buna ek olarak Fuego Labs LLC'nin opsiyonel mali garantisi mevcut. Eğer kurul güvence isterse bu sözleşme imzalanır."

### S5: Eğer KOSGEB destek vermeseydi yine de yapacak mıydınız bu işi?

**Cevap iskelet (kritik soru — niyet testi):**

> "Yapardık, ama farklı bir hızda ve farklı bir yapıda. Yazılım tarafı zaten dogfooding ile geliştirildi ve özsermaye ile devam edebilir. KOSGEB desteğinin asıl etkisi donanım tarafında: ESP32-S3 prototipleme, sertifikasyon, yerli üretici ortaklıkları — bunlar ön sermayesi yüksek kalemler. KOSGEB desteği olmadan donanım fazını ya 18 ay ertelerdik ya da bir external angel raise yapmak zorunda kalırdık. Bunun anlamı: hem hızımızı hem de Türkiye'de yaratacağımız istihdamı kaybederdik. KOSGEB desteği bu projeyi *Türkiye'de tutuyor*."

### S6: Pay yapınızda Fuego Labs LLC'nin %10'u var. Bu, esas işin yurt dışında olduğunu, KOSGEB'in Türkiye yatırımına gitmediğini düşündürmüyor mu?

**Cevap iskelet (en zor soru):**

> "Tam tersini düşündürmesi gerekir. Fuego Labs LLC bir Amerikan tüzel kişiliği ve Graphyn altyapısının IP sahibi. Eğer Prodaktiv'in geri ödemeli desteğine teknik moat olarak Graphyn'i göstereceksek, o IP'nin Prodaktiv tarafından erişilebilir olduğunu yasal olarak göstermek zorundayız. Lisans sözleşmesi bunu yapar; %10 azınlık hisse, lisansın *piyasa fiyatlı transfer pricing* olarak değil, *gerçek bir ticari ilişki* olarak konumlandırılmasını sağlar.
>
> Operasyonel olarak: tüm geliştirme Türkiye'de, tüm istihdam Türkiye'de, sınai mülkiyet TR Türk Patent Kurumu'nda kayıt altına alınıyor, donanım Türkiye'de tasarlanıp üretiliyor. Prodaktiv'in fiziksel ve hukuki ağırlık merkezi Türkiye'de.
>
> Eğer kurul bu yapıyı uygun bulmazsa Fuego Labs LLC'nin pay sahipliğini tamamen çıkarıp sadece teknoloji lisans sözleşmesiyle ilişki kurmamız mümkündür. Bu opsiyon hazır."

### S7: Donanım dock'unu Türkiye'de mi yoksa Çin'de mi üreteceksiniz?

**Cevap iskelet:**

> "Türkiye'de. Bursa ve İstanbul'da iki sözleşmeli üreticiyle ön görüşmelerimiz var. ESP32 modülleri ithal edilecek — bu zaten küresel tedarik zincirinde standart — ama PCB üretimi, montaj, kasa enjeksiyon kalıbı, son kalite kontrol Türkiye'de. Bu hem KOSGEB'in yerli üretim önceliğine uyuyor hem de bizim tedarik zinciri yakınlığımız için elverişli. İlk seri 100 üniteden başlıyoruz, başarı durumunda 1.000–10.000 ünitelik partilere geçeceğiz."

### S8: Ekibinizin embedded sistem deneyimi yeterli mi? ESP32-S3 + e-paper + solenoid kontrol ciddi bir donanım stack'i.

**Cevap iskelet:**

> "Resat'ın 8+ yıl yazılım mühendisliği deneyimine ek olarak Togg'da otomotiv embedded sistem entegrasyonu deneyimi var. ESP32-S3 ve BLE GATT prototip aşamasında çalışıyor — gösterebilirim. E-paper ekran sürücüsü açık kaynak (Waveshare reference design'ı modifiye ediyoruz). Solenoid kontrol elektronik olarak basit — temel motor sürücü devresi.
>
> Daha uzmanlaşmış kısımlar — örneğin enjeksiyon kalıp tasarımı — sözleşmeli üreticiyle ortak çalışıyoruz, kendimiz değil. Ekipte tam zamanlı embedded mühendisi pozisyonu zaten bütçenin parçası — proje başlangıcında işe alacağız."

### S9: Türkiye'deki üretkenlik yazılımı pazarının büyüklüğü ne, sizin tutturmayı planladığınız pay nedir?

**Cevap iskelet:**

> "Türkiye'de 200 binin üzerinde profesyonel yazılım geliştirici var, bunların yaklaşık %40'ı uluslararası sözleşmeli çalışıp dolar/euro bazlı gelir elde ediyor — Pro fiyatımız (9 USD/ay) onlar için marjinal bir gider. İlk 12 ayda Türkiye'den 1.000 ücretli kullanıcı, 36 ay sonunda 5.000 ücretli kullanıcı hedefliyoruz — bu, Türkiye geliştirici nüfusunun %2,5'i, ulaşılabilir bir hedef.
>
> Ama Türkiye bizim total addressable market'imizin küçük bir parçası — global pazar 12 milyon Linear kullanıcısı. Türkiye bizim için lansman pazarı, yerel üretim üssü ve yetenek havuzu. Gelirin büyüğü uluslararası, üretim ve istihdamın büyüğü Türkiye'de — bu yapı KOSGEB'in *KOBİ ihracatçısı* tezini destekler."

### S10: Eğer ürün başarılı olmazsa veya gelir hedeflerini tutturamazsanız ne olur?

**Cevap iskelet (risk yönetimi sorusu):**

> "Üç katmanlı bir risk azaltma planımız var. Birinci katman: yazılım ürünü zaten beta'da çalışıyor — donanım başarısız olsa bile yazılım gelirimiz bağımsız. Yıl 3 sonu sadece yazılım gelirimiz 1,2 milyon dolar projeksiyonu — bu tek başına geri ödeme kapasitesini karşılıyor.
>
> İkinci katman: Eğer yazılım da hedeflerini tutturamazsa, Fuego Labs LLC mali garantörlüğü devreye girer. Ana şirket geri ödeme yükümlülüğünü üstlenir.
>
> Üçüncü katman: Eğer her şey başarısız olursa, KOSGEB'in standart yapılandırma süreci var — biliyoruz, beklenmedik bir durum değil. Ancak bu projeksiyonu karşılamak için *projeksiyonun yarısının* tutması yeterli. Bu, üretkenlik yazılımı sektörünün küresel büyüme oranlarına bakıldığında muhafazakar bir hedef."

### S11: Aysima Hanım, KOSGEB Uygulamalı Girişimcilik Eğitimi sertifikanız var mı?

**Cevap iskelet:**

> "Evet, [tarih] tarihinde KOSGEB e-Akademi üzerinden tamamladım." (eğer var)
>
> [eğer yoksa: "Sertifikamı [tarih] tarihinde almak üzere KOSGEB e-Akademi modülüne kayıt oldum, başvuru süreci öncesinde tamamlanacak." — ama bu durum başvuru reddedilir, kabul edilebilir bir cevap değil; sertifika başvuru anında elde olmalı.]

### S12: Bu projeyi neden KOSGEB ile birlikte yapmak istiyorsunuz, başka destek seçenekleri yok mu?

**Cevap iskelet:**

> "Üç sebep. Birincisi: KOSGEB'in 0–3 yaş kuralı, yeni kurulan girişimler için oldukça uygun. Diğer fonların çoğu erken aşama girişimlere kapalı veya çok küçük tutarlar.
>
> İkincisi: KOSGEB'in destek kapsamı bizim ihtiyaç dağılımımızla doğal olarak örtüşüyor — personel, makine-teçhizat, sertifikasyon, sınai mülkiyet. TÜBİTAK BİGG gibi alternatifler daha çok teknoloji geliştirme ağırlıklı; biz hibrit ürün (yazılım + donanım + ticarileştirme) için daha kapsamlı destek arıyoruz.
>
> Üçüncüsü: KOSGEB'in *Türkiye'de istihdam ve üretim* önceliğiyle bizim iş modelimiz birebir hizalı. Hedef pazarımız global, ama operasyonel ağırlık merkezimiz Türkiye'de — bu KOSGEB'in tezine uygun."

---

## Bölüm 2 — Tuzak Sorular ve Yumuşak Yanıt Stratejileri

### Tuzak T1: "Bu çok hayalperest bir proje, gerçekten yapılabilir mi?"

Bu kurul'un gerçekten cevap aramadığı, sizin nasıl tepki verdiğinizi ölçtüğü bir test sorusudur. Defansif olmayın. Kanıt sıralayın.

> "Şu an çalışan bir yazılım ürünümüz var, gösterebilirim. ESP32 prototipi çalışır halde, gösterebilirim. 1.000+ bekleme listesi var, listeye erişim sağlayabilirim. Hayalperest dediğimiz şey, *gösterilebilir kanıtların eksik olduğu durumdur*. Bizim kanıtlarımız var. Şüpheniz hangi spesifik bileşene yönelikse onu ele alalım."

### Tuzak T2: "Resat zaten Graphyn için fon arıyor — neden Aysima Hanım girişimci olarak başvuruyor?"

> "Çünkü Graphyn ve Prodaktiv iki farklı ürün, iki farklı pazar, iki farklı tüketici. Graphyn geliştirici altyapı pazarında, Prodaktiv son kullanıcı üretkenlik pazarında. Aysima Hanım Prodaktiv'in iş tarafını yönetiyor, Resat teknik tarafı. Bu, kurucu olarak Aysima'nın *Prodaktiv'i sahiplenmesi* meselesi — Graphyn'in başarısı veya başarısızlığından bağımsız."

### Tuzak T3: "Fuego Labs LLC'nin pay sahipliği size *external dependency* yaratmıyor mu?"

> "Lisans sözleşmesi karşılıklı ve süresizdir. Fuego Labs LLC'nin pay sahipliği veya çıkarı dışsallaşsa bile lisans iptal edilemez. Yapı kurul'a sunulan dokümanda detaylandırılmıştır — eğer komite isterse tam metin paylaşılabilir."

### Tuzak T4: "Şu anda gelir yok — gelirsiz bir şirkete neden kamu kaynağı ayıralım?"

> "Çünkü program isminin tam karşılığı *Girişimci Destek Programı*. Halihazırda gelir yapan girişim için *İşletme Geliştirme Destek Programı* veya *Stratejik Ürün Destek Programı* daha uygun. Biz tam olarak hedef kitleyiz: 0–3 yaş, NACE 62, ürün–pazar uyumu kanıtlanma aşamasında, Türkiye'de istihdam yaratacak girişim."

### Tuzak T5: "Aysima Hanım'ın daha önce şirket kurma deneyimi yok değil mi?"

> "[Eğer yoksa]: İlk girişim olduğu doğru. Ancak ekipte ikinci kurucu olarak Resat'ın hem Togg gibi büyük ölçek operasyonlarda deneyimi var hem de şu anda aktif olarak Graphyn'i yönetiyor. Bu, deneyim açığını kapatan yapısal bir tasarım. Ek olarak Fuego Labs altyapısı operasyon, hukuk, muhasebe gibi alanlarda destek sağlıyor.
>
> [Eğer varsa]: Daha önce [X şirketi/projesi] kurdum/yönettim, [Y sonuç] elde ettim. Şu anki deneyimim aksine *spesifik olarak bu pazarda*."

---

## Bölüm 3 — Sunum Sırası ve Süre Yönetimi

KOSGEB kurul sunumu tipik olarak 15–20 dakikalık bir sunum + 15–20 dakikalık soru-cevap formatındadır.

**Sunum sırası önerisi (15 dakika):**

| Süre | Bölüm | Vurgu |
|---:|---|---|
| 0:00–1:30 | Tanıtım: kim, ne, neden | Aysima ve Resat'ın yetkinlik kanıtı |
| 1:30–4:00 | Problem ve çözüm | Veri odaklı problem büyüklüğü, çözümün dört katmanı |
| 4:00–6:00 | Demo (yazılım + donanım prototip) | *Gerçek çalışan ürünü* göster — slayttan değil |
| 6:00–8:00 | Pazar analizi ve hedefler | Sayılarla — TAM/SAM/SOM, 36 ay hedefler |
| 8:00–10:00 | Yenilikçi yön | Graphyn moat'u, sınai mülkiyet stratejisi, Türkiye odaklı üretim |
| 10:00–12:00 | Bütçe ve istihdam | 2,15M TL'nin ne için harcanacağı, 8 kişilik istihdam |
| 12:00–13:30 | Risk ve geri ödeme | Üç katmanlı risk azaltma, geri ödeme kapasitesi |
| 13:30–15:00 | Talep ve kapanış | Net talep, beklentiler, soru daveti |

**Sunum tonu:**
- Konuşma tempolu, abartısız
- Slaytlarda az metin, çok grafik / sayı
- "Sanıyoruz" / "umut ediyoruz" yerine "biliyoruz" / "gösterebiliriz"
- Kurul'a güvenli temas: göz göze, sakin ses tonu

---

## Bölüm 4 — Sunum Öncesi Hazırlık Listesi

- [ ] Yazılım prototipini canlı gösterecek MacBook hazır (kurul odasında WiFi yoksa hotspot)
- [ ] ESP32 donanım prototipi yanında (en azından çalışan PCB + e-paper ekran)
- [ ] Slayt sunumu PDF + PPTX iki formatta (kurul'un projektörü ne destekliyorsa)
- [ ] İş planı, bütçe planı, eligibility memo bastırılmış 5'er kopya
- [ ] Aysima'nın kimliği ve Uygulamalı Girişimcilik Eğitimi sertifikası
- [ ] Şirket kuruluş belgeleri (ticaret sicili gazetesi, vergi levhası) — başvuru anında zaten yüklendi ama yedek kopya
- [ ] Resat'ın özgeçmiş, Togg deneyim referansı (gerekiyorsa)
- [ ] Fuego Labs LLC ↔ Prodaktiv lisans sözleşmesi taslağı (kurul isterse hazır)
- [ ] Linear / Stripe / iyzime gibi planlanan iş ortaklıkları için referans iletişimi (sorulursa)
- [ ] 5 dakikalık + 15 dakikalık iki versiyonlu pitch (kurul süreyi kısarsa diye)
- [ ] Su, sakin nefes, 30 dakika öncesinde gelmek, telefonu sessize almak

---

## Kapanış Notu

Kurul oturumu bir savunma değil, bir karşılıklı değerlendirme. Onlar sizin işinize uygun olup olmadığınızı değerlendirirken, siz de KOSGEB'in size uygun olup olmadığını değerlendiriyorsunuz. Bu çift yönlü ilişki tonu, görüşmenin enerjisini değiştirir — savunmacı olmaktan çıkarır, profesyonel müzakereye dönüştürür.

Hazırlığınız kanıtınızdır. Soruyu duyduktan sonra düşünün, ardından cevap verin — hız değil, derinlik.
