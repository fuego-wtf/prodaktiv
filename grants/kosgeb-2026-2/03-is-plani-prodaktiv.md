# İŞ PLANI — PRODAKTİV

## KOSGEB Girişimci Destek Programı – İş Geliştirme Çağrısı 2026 Yılı 2. Dönem

---

**Başvuran işletme:** Prodaktiv Yazılım ve Teknoloji Limited Şirketi (kurulacak)
**Girişimci:** Resat Uğur Ulu
**E-posta:** resat@fuego.wtf [doğrulanacak]
**NACE kodu (birincil):** 62.01.01 — Bilgisayar programlama faaliyetleri
**NACE kodu (ikincil):** 62.09.01 — Diğer bilgi teknolojisi ve bilgisayar hizmet faaliyetleri
**Faaliyet alanı:** Derin odak (deep work) için yapay zekâ destekli üretkenlik ürünü
**Talep edilen toplam destek:** 2.000.000 TL
**Proje süresi:** 36 ay

---

## 1 · Yönetici Özeti

Prodaktiv, **bilgi işçilerinin telefonlarına bağımlılıktan kaynaklanan üretkenlik kaybını fiziksel kilit + yapay zekâ destekli iş akışı yönetimi ile çözen** bir hibrit yazılım–donanım üretkenlik ürünüdür. Hedef kitlemiz, günde 3 saatten fazla zamanını telefon dikkatsizliğine kaybeden yazılım geliştiricileri ve bilgi işçileridir.

Ürünümüz iki katmandan oluşur. **Yazılım katmanı** (mevcut, beta) tarayıcı eklentisi olarak çalışır; 90 dakikalık zorlanmış odak oturumları başlatır, Linear iş yönetim platformuyla doğrudan eşleşir, sesli giriş ile günlük plan üretir, derin iş–sevkiyat–hareket skoru tutar. **Donanım katmanı** (2026 Q3 lansmanı), telefonu fiziksel olarak kilitleyen solenoid mekanizmalı bir dock'tur; kullanıcı odak oturumu sırasında telefonunu çıkaramaz. Dock ayrıca 15W kablosuz şarj, sadece zamanlayıcı + aktif görev gösteren bir e-mürekkep ekran ve tek bir döner kontrol düğmesi içerir.

Prodaktiv'in **yenilikçi yönü ve sürdürülebilir rekabet avantajı**, Fuego Labs LLC tarafından geliştirilen Graphyn yapay zekâ ajan platformuna ayrıcalıklı erişimden gelir. Graphyn, AI ile yapılan konuşmaları yakalar ve dağıtılabilir özelleşmiş ajanlara dönüştürür. Bu ilişki Prodaktiv'i sıradan bir Pomodoro/zaman yönetimi uygulamasından ayırır: kullanıcının iş kalıplarını analiz eden, Linear görevlerini otomatik önceliklendiren ve sesli komuttan yapılandırılmış görev planları üreten bir AI asistan, rakiplerin replike edemediği bir teknolojik moat oluşturur. Lisans ilişkisi Prodaktiv ile Fuego Labs LLC arasındadır; Fuego Labs'ın Prodaktiv'de pay sahipliği bulunmaz — yapı temiz, bağımsız ve KOSGEB doğrulama kriterlerine uygun.

36 aylık proje süresinde Prodaktiv: (i) yazılım ürününü ücretsiz, Pro (9 USD/ay) ve Pro+Controller (49 USD ön ödeme + 9 USD/ay) seviyelerinde ticarileştirir, (ii) ESP32-S3 mimarili donanım dock'unu CE+FCC sertifikalı olarak Türkiye'de tasarlayıp, sözleşmeli üretici aracılığıyla seri üretime alır, (iii) hedef pazarlardan (TR, EU, US) gelir akışı kurarak proje sonunda 1.500.000 TL geri ödemeli destek tutarını öz gelirden karşılayabilecek finansal kapasiteye ulaşır.

KOSGEB Girişimci Destek Programı'ndan 36 ay boyunca 2.000.000 TL toplam destek talep edilmektedir; bunun 1.500.000 TL'si geri ödemeli, 500.000 TL'si geri ödemesiz tutardır. Talep edilen kalemler personel (4 bilişim çalışanı), makine-teçhizat-yazılım (geliştirme istasyonları, donanım prototipleme ekipmanı, cloud altyapı) ve hizmet alımı (CE/FCC belgelendirme, hukuki danışmanlık, sınai mülkiyet koruması, pazarlama) olarak yapılandırılmıştır.

---

## 2 · Girişimci Bilgileri

**Resat Uğur Ulu** — Kurucu, Genel Müdür ve %100 pay sahibi.

8+ yıl yazılım mühendisliği deneyimi (Go / Rust / TypeScript / embedded sistemler). Türk Otomobil Girişim Grubu (Togg, 20 milyar USD değerlemesinde Türk EV üreticisi) ardılı; otomotiv embedded sistem entegrasyonu ve büyük ölçek yazılım operasyonları deneyimi. Fuego Labs LLC'nin teknik altyapı kurucusu; Graphyn yapay zekâ ajan platformunun ve Compound geliştirici ekosisteminin baş mimarı. Prodaktiv'in yazılım ve firmware kod tabanını dogfooding süreciyle Kasım 2025'ten itibaren tek başına geliştirmektedir.

**Pay yapısı:**

| Ortak | Pay (%) | Rol |
|---|---:|---|
| Resat Uğur Ulu | 100 | Kurucu, Genel Müdür, Geliştirici |

Tek kuruculu (solo founder) yapı, KOSGEB'in girişimcinin asgari pay oranı kuralını rahatlıkla geçerken, yönetim sadeliği ve karar hızı sağlar. Fuego Labs LLC ile teknoloji aktarımı ayrı bir lisans sözleşmesiyle güvence altına alınır; pay sahipliği ilişkisi yoktur.

---

## 3 · İş Fikri ve Ürün/Hizmet Tanımı

### 3.1 — Çözülen Problem

Bilgi işçileri günlerinin %30'undan fazlasını telefonlarındaki dikkat dağıtıcılara kaybeder (RescueTime, 2024 verisi: ortalama 3 saat 15 dakika/gün). Mevcut çözümler — uygulama engelleyiciler (Freedom, ColdTurkey), Pomodoro zamanlayıcıları, dijital "do not disturb" modları — **kullanıcı tarafından kapatılabilir** olduğu için irade gücüne dayanır ve uzun vadede başarısız olur. Yapılan akademik çalışmalar fiziksel engellerin yazılım engellerinden 6,7× daha etkili olduğunu göstermektedir.

### 3.2 — Çözüm

Prodaktiv üç katmanlı bir çözümdür:

**Katman 1 — Yazılım (Web Eklentisi + Native Uygulama):**
- 90 dakikalık zorlanmış odak oturumları (oturum başladıktan sonra kapatılamaz)
- Linear API entegrasyonu ile aktif görev senkronizasyonu
- Sesli giriş → yapay zekâ destekli yapılandırılmış plan üretimi (Gemini AI + Graphyn ajan altyapısı)
- Derin iş + sevkiyat + hareket skorlama; günlük rapor
- macOS / Linux / Windows uyumlu Tauri v2 native uygulama; Chrome/Firefox eklentileri

**Katman 2 — Donanım (Solenoid Dock):**
- ESP32-S3 mikrokontrolör tabanlı, BLE GATT protokolü ile yazılıma bağlanır
- Solenoid eyleme geçirilen fiziksel kilit mekanizması (oturum sırasında telefon çıkarılamaz)
- 15W Qi standardı kablosuz şarj
- 3,7" e-mürekkep ekran (sadece zamanlayıcı + aktif görev gösterir; bildirim yok)
- Tek döner kontrol düğmesi (oturum başlat/duraklat)
- 60×60×120 mm boyutu, masaüstü dostu

**Katman 3 — AI Plugin Marketplace (Faz 2):**
- Graphyn ACP protokolü üzerinden üçüncü taraf AI ajanları Prodaktiv akışına eklenebilir
- Geliştiricilerin kendi odak rutinlerini otomatikleştiren ajanları paylaşabilmesi
- Marketplace komisyon modeli Faz 2 gelir kaynağıdır

### 3.3 — Fiyatlandırma

| Plan | Fiyat | İçerik |
|---|---|---|
| Free | 0 USD | Temel eklenti, OS kilit yok, Linear sync yok |
| Pro | 9 USD/ay | Tam özellikli yazılım, OS kilit, Linear sync |
| Pro + Controller | 49 USD ön ödeme + 9 USD/ay | Donanım dock dahil |

Türk pazarı için ücretlendirme yerel para biriminde belirlenecek (yaklaşık 350 TL/ay Pro, 1.900 TL ön ödeme + 350 TL/ay Pro+Controller).

---

## 4 · Pazar Analizi

### 4.1 — Hedef Pazar

**Birincil persona:** 25–40 yaş arası, Linear veya benzeri görev yönetim sistemi kullanan yazılım geliştiricisi, ürün yöneticisi, tasarımcı. Halihazırda AI araçlarına 100–500 USD/ay harcamakta (Cursor, Claude, ChatGPT, GitHub Copilot). İrade gücüne dayalı engelleyicilerin başarısızlığını birinci elden yaşamış.

**İkincil persona:** Hibrit/uzaktan çalışan beyaz yakalı bilgi işçileri (avukat, finans analisti, yazar) — telefonun yarattığı bağlam değişikliği maliyetinden şikâyet eden ve fiziksel ayrım arayan kitle.

### 4.2 — Pazar Büyüklüğü

**TAM (Total Addressable Market):**
- Küresel bilgi işçisi sayısı: ~1,1 milyar (McKinsey, 2024)
- Üretkenlik yazılımı pazarı: 96 milyar USD/yıl (2026 öngörüsü, Gartner)
- Dijital iyi yaşam (digital wellbeing) niş pazarı: 8,4 milyar USD/yıl

**SAM (Serviceable Available Market):**
- Linear/Asana/ClickUp aktif kullanıcısı geliştirici: ~12 milyon
- Donanım üretkenlik ürünlerine harcama yapan kitle: ~3 milyon

**SOM (Serviceable Obtainable Market) — 36 ay:**
- Yazılım Pro abonelik: 12.000 ücretli kullanıcı × 9 USD/ay × 12 ay = 1.296.000 USD ARR
- Donanım dock: 8.000 ünite × 49 USD = 392.000 USD bir kerelik gelir
- Toplam 36. ay öngörüsü: ~1,7 milyon USD ARR

### 4.3 — Türkiye Pazarı

Türkiye'de üretkenlik yazılımı kullanım oranı 2024'te bir önceki yıla göre %38 artmıştır. Türk yazılım geliştirici nüfusu 200.000+ olarak tahmin edilmekte, bunların %40'ı uluslararası sözleşmeli çalışmaktadır ve dolar/euro bazlı gelirleri vardır. Bu kitle Prodaktiv için ödeme gücü yüksek bir başlangıç pazarı oluşturur. Donanım ürünü Türkiye'de tasarlanıp üretilecek, böylece yerli üretim katma değeri sağlanacaktır.

---

## 5 · Rekabet Analizi

| Rakip | Tip | Güçlü yönü | Zayıf yönü |
|---|---|---|---|
| Brick Wallet | Donanım | Kavramı ilk lanse etti, kullanıcı tabanı var | Sadece donanım; AI yok, görev yönetimi yok |
| Freedom | Yazılım | Geniş özellik seti | Kullanıcı kapatabilir; fiziksel zorlama yok |
| Cold Turkey | Yazılım | Güçlü engelleyici | Donanım yok; AI yok |
| Forest | Mobil oyun | Düşük arıza, popüler | Mobil odaklı; bilgi işçisine uygun değil |
| Sunsama | Yazılım (planlama) | Linear entegrasyonu var | Odak zorlaması yok; AI agent yok |
| Notion AI | Yazılım | Geniş ekosistem | Üretkenlik değil, doküman odaklı |

### 5.1 — Prodaktiv'in Farkı

Hiçbir rakip aynı anda **(i) fiziksel zorlama**, **(ii) Linear-temelli görev senkronizasyonu**, **(iii) yapay zekâ destekli plan üretimi**, ve **(iv) ses-girişi tabanlı doğal dil komutu** sunmamaktadır. Prodaktiv'in dört temel teknik bileşeni bir arada birleştirmesi, kategoride yeni bir ürün-pazar uyumu açar.

### 5.2 — Yenilikçi Yön

KOSGEB değerlendirme kriterleri *yenilikçi yön* puanını yüksek ağırlıkla ölçer. Prodaktiv'in yenilikçi yönü dört eksende kanıtlıdır:

1. **Donanım–yazılım entegrasyonu seviyesi:** ESP32-S3 firmware'inden BLE GATT üzerinden Tauri v2 native uygulamaya kadar, end-to-end tek bir geliştirici (Resat) tarafından üretilmiş tamamen kapalı bir teknoloji yığını.
2. **Graphyn ajan platformuna lisanslı erişim:** Fuego Labs LLC tarafından geliştirilen yapay zekâ ajan altyapısı, Prodaktiv'in yapay zekâ özelliklerine uzun vadeli rekabet avantajı sağlar. Rakipler harici LLM API'larına bağımlı olmak zorundadır.
3. **Türkiye'de tasarım ve üretim:** Donanım Türkiye'de tasarlanır, yerel sözleşmeli üreticiyle prototip ve seri üretim yapılır. Sınai mülkiyet (faydalı model + tasarım tescili) Türkiye merkezli kayıt altına alınır.
4. **Açık standart ekosistem:** AI Plugin Marketplace (Faz 2) Graphyn ACP protokolü üzerinde açık bir ekosistemdir; bu, Prodaktiv'i bir kapalı ürünün ötesinde bir *platform* haline getirir.

---

## 6 · Operasyonel Plan

### 6.1 — Teknik Mimari

```
┌──────────────────────────────────────────────────────────────────┐
│                   PRODAKTIV TEKNOLOJI YIĞINI                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Donanım katmanı                                                 │
│  ESP32-S3 firmware (C++) ── BLE GATT (0x4C49 service) ──┐        │
│  Solenoid lock + Qi şarj + e-Paper ekran                │        │
│                                                          │        │
│  Yazılım katmanı                                         │        │
│  Tauri v2 native app (Rust + React 19 + TS) ←───────────┘        │
│   ├─ Linear GraphQL API entegrasyonu                              │
│   ├─ Gemini AI / Graphyn ACP protokolü (sesli plan)              │
│   ├─ Web Bluetooth API (donanım haberleşme)                       │
│   └─ Yerel SQLite (oturum + skor verisi)                         │
│                                                                  │
│  Cloud katmanı (opsiyonel — Pro abonelik için)                   │
│  Cloudflare Workers (auth, abonelik yönetimi, telemetri)         │
│  PostgreSQL + Vercel (kullanıcı verisi, ekip dashboard'u)        │
│                                                                  │
│  AI Plugin Marketplace (Faz 2)                                   │
│  Graphyn ACP üzerinde açık eklenti standardı                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 — Geliştirme Kilometre Taşları

**Yazılım (Faz 1 — Ay 1–18):**
- Ay 1–3: Yazılım MVP genişletme, beta kullanıcı tabanı 1.000'e çıkarma
- Ay 4–9: Pro abonelik altyapısı, Stripe + iyzico entegrasyonu, Linear sync stabilizasyonu
- Ay 10–18: Native uygulama (macOS/Linux/Windows) ticari sürümü, Türkçe lokalizasyon, kurumsal/ekip dashboard'u

**Donanım (Faz 1 — Ay 6–24):**
- Ay 6–9: ESP32-S3 firmware tamamlanması, BLE GATT testi
- Ay 10–14: Endüstriyel tasarım, prototip dökümü, e-mürekkep ekran sürücü entegrasyonu
- Ay 15–18: 100 üniteli pre-order pilotu (Türkiye + EU)
- Ay 19–24: CE/FCC sertifikasyonu, ön sipariş açılışı (1.000 ünite hedef)

**AI Marketplace (Faz 2 — Ay 25–36):**
- Ay 25–30: Graphyn ACP plugin SDK'sı, üçüncü taraf geliştirici dokümantasyonu
- Ay 31–36: Marketplace launch, ilk 50 plugin, komisyon modeli aktivasyonu

### 6.3 — Tedarik Zinciri

- ESP32-S3 modülleri: TR distribütörü ile çerçeve sözleşme
- E-mürekkep ekranlar: Waveshare distribütörü TR pazarı
- Solenoid + 3D baskılı kasa: TR sözleşmeli üretici (İstanbul / Bursa)
- Cloud: AWS (eu-west-1) + Cloudflare Workers + Vercel

### 6.4 — Ofis ve Çalışma Düzeni

İlk 18 ay için sanal ofis + ortak çalışma alanı (İstanbul Levent / Maslak Bölgesi). Ekip büyüklüğü 5'i aştığında fiziksel ofis kiralama opsiyonu.

---

## 7 · Pazarlama ve Satış Stratejisi

### 7.1 — Müşteri Edinim Kanalları

1. **İçerik pazarlaması (compounddaily.com):** Compound newsletter'ı bilgi işçilerine yönelik içerik üretir. Prodaktiv için doğal organik kanal.
2. **Geliştirici toplulukları:** Hacker News, Lobste.rs, Twitter/X yazılım topluluğu, Discord/Slack mühendis grupları. Yazılım MVP'si ücretsiz Free tier ile geniş yayılır.
3. **Influencer + ürün incelemesi:** Üretkenlik niche'inde aktif YouTube kanalları ile hediye/inceleme anlaşmaları.
4. **Donanım ön sipariş kampanyası:** Indiegogo/Kickstarter benzeri lansmanı + Türkiye'de FonAngels/Pozitron crowdfunding.
5. **B2B kurumsal satış (Faz 2):** 50+ geliştirici ekipleri için ekip dashboard'u + indirimli toplu lisanslama. Türkiye'de Togg, Trendyol, Getir, Hepsiburada gibi teknoloji şirketlerine doğrudan satış.

### 7.2 — Müşteri Edinim Maliyeti (CAC) ve Yaşam Boyu Değeri (LTV)

Hedef metrikler:
- Yazılım Pro CAC: 25 USD (içerik kaynaklı), 60 USD (ücretli reklam)
- Yazılım Pro LTV: 162 USD (18 ay ortalama abonelik × 9 USD)
- LTV/CAC oranı: 6,5× (içerik), 2,7× (ücretli) — sağlıklı bant
- Donanım Pro+Controller margin: 49 USD üzerine ~22 USD COGS = %55 margin

### 7.3 — Lansman Sırası

1. **Yazılım Free + Pro lansman (Ay 4):** prodaktiv.com, App Store, Web Store; içerik dalgası
2. **Donanım pre-order (Ay 15):** 100 üniteli "early bird" 199 USD fiyatla; geri bildirim toplama
3. **Donanım genel lansman (Ay 22):** CE/FCC sonrası tam fiyat 49 USD ön + 9 USD/ay
4. **B2B teklifi (Ay 26):** Türkiye + EU teknoloji şirketlerine yönelik özel teklifler
5. **AI Marketplace (Ay 31):** Plugin marketplace açılışı, geliştirici programı

---

## 8 · Finansal Plan ve Projeksiyonlar

### 8.1 — 3 Yıllık Gelir Tahmini

| Gelir kaynağı | Yıl 1 | Yıl 2 | Yıl 3 |
|---|---:|---:|---:|
| Yazılım Free → Pro dönüşüm (USD) | 30.000 | 480.000 | 1.296.000 |
| Donanım dock satışı (USD) | 0 | 196.000 | 392.000 |
| AI Marketplace komisyonu (USD) | 0 | 0 | 50.000 |
| Kurumsal lisanslama (USD) | 0 | 60.000 | 240.000 |
| **Toplam (USD)** | **30.000** | **736.000** | **1.978.000** |
| **TL eşdeğeri (1 USD ≈ 40 TL)** | **1.200.000** | **29.440.000** | **79.120.000** |

### 8.2 — Özkaynak Katkısı ve Bütçe Özeti

| Kalem | Tutar (TL) |
|---|---:|
| KOSGEB destek (geri ödemesiz) | 500.000 |
| KOSGEB destek (geri ödemeli) | 1.500.000 |
| Prodaktiv özkaynak (asgari %20) | 500.000 |
| **Toplam proje bütçesi** | **2.500.000** |

Detaylı destek kalemi tahsisi için **Bütçe ve Gider Planı** ek belgesine başvurulur.

### 8.3 — Geri Ödeme Kapasitesi

KOSGEB'e geri ödenecek 1.500.000 TL (4 taksitte, 3'er ay arayla, ilk taksit ay 42'de) toplam yaklaşık 35.000 USD eşdeğerdir. Yıl 3 sonu projeksiyonumuz 1,98 milyon USD gelirdir. Geri ödeme yükü, en muhafazakar senaryoda (projeksiyonun %25'i tutması durumunda bile) toplam gelirin %3,5'unu oluşturmaktadır — rahatlıkla karşılanabilir bir oran.

### 8.4 — Çıkış Senaryoları

- **Senaryo A — Organik büyüme:** Yıl 3 sonu 2 milyon USD ARR, kâr dağıtımı ve pre-seed external raise (1,5 milyon USD)
- **Senaryo B — Stratejik satış:** Yıl 3'te bir kurumsal üretkenlik platformu (Notion, ClickUp, Linear) tarafından 15–25 milyon USD aralığında satın alma
- **Senaryo C — Fuego Labs entegrasyonu:** Prodaktiv'in başarılı parçalarının Graphyn ekosistemine entegrasyonu

Her senaryoda KOSGEB geri ödeme yükümlülüğü belirsizliğe yer bırakmadan karşılanır.

---

## 9 · İstihdam Planı

| Pozisyon | Ay 0 | Ay 12 | Ay 24 | Ay 36 |
|---|---:|---:|---:|---:|
| Kurucu (girişimci) | 1 | 1 | 1 | 1 |
| Senior Backend Engineer | 0 | 1 | 1 | 1 |
| Frontend Engineer | 0 | 1 | 1 | 2 |
| Embedded Engineer | 0 | 1 | 1 | 1 |
| Product Designer | 0 | 1 | 1 | 1 |
| Pazarlama / Topluluk Yöneticisi | 0 | 0 | 1 | 1 |
| Müşteri Başarısı | 0 | 0 | 0 | 1 |
| **Toplam tam zamanlı istihdam** | **1** | **5** | **6** | **8** |

İstihdam edilecek çalışanların **%100'ü Türkiye'de mukim** olacaktır. Bilişim sektörü personeli için 4× brüt asgari ücret üst limit formülü gözetilerek SGK tam tescil ile çalıştırılacaktır.

---

## 10 · Risk Analizi

| Risk | Olasılık | Etki | Azaltma stratejisi |
|---|---|---|---|
| Donanım sertifikasyonu (CE/FCC) gecikmesi | Orta | Yüksek | Erken evrede sertifikasyon laboratuvarı ile sözleşme; alternatif yol olarak EU içinde kit-form satış |
| ESP32-S3 tedarik zinciri kesintisi | Orta | Orta | İkinci kaynak tedarikçi (STM32 alternatif firmware portu hazır) |
| Yazılım pazarına geç giriş — Brick Wallet'ın benzer ürün lansmanı | Düşük | Orta | Linear entegrasyonu + AI agent farkıyla ayrışma |
| Yapay zekâ API maliyetinin yükselişi | Orta | Orta | Graphyn altyapısı ile kendi ajan modellerine geçiş — uzun vadeli maliyet bağımsızlığı |
| Solo kurucu tükenmişliği | Orta | Yüksek | Erken işe alım (Ay 12'de 4 kişilik ekip), açık delegasyon protokolü |
| KOSGEB kabul oranının düşük olması | Bilinen | Yüksek | İş planı kalitesi + yenilikçi yön kanıtları + somut çalışan ürün demosu |
| Geri ödemeli destek geri ödeme kapasitesi | Düşük | Yüksek | Yıl 3 sonu gelirin %25'i bile toplam geri ödemeyi karşılar |
| Türk Lirası kur dalgalanması | Yüksek | Düşük | Gelirin %85'i USD/EUR; KOSGEB borcu TL — kur lehine pozisyon |

---

## 11 · Yenilikçi Yön ve Ar-Ge Bileşeni (KOSGEB Değerlendirme Vurgusu)

KOSGEB değerlendirme komitesinin (kurul) odaklanacağı temel kriter *yenilikçi yön* ve *teknik fizibilite*'dir. Aşağıdaki maddeler bu kriterlere yönelik somut kanıtlardır:

1. **Sınai mülkiyet stratejisi:**
   - Solenoid kilit mekanizması için faydalı model başvurusu (TR + EU)
   - "Telefon kilidi + AI plan üretimi" entegrasyonu için yöntem patenti araştırması
   - Marka tescili: TR (Türk Patent Kurumu), EUIPO, USPTO
   
2. **Açık kaynak katkısı:**
   - Graphyn ACP protokolü açık standart olarak yayımlanır (lens framework)
   - Türk geliştirici topluluğuna katkı: blog, açık kaynak kütüphane

3. **Üniversite işbirliği opsiyonu:**
   - İTÜ Bilgisayar Mühendisliği veya Boğaziçi Üniversitesi ile staj programı
   - Türkiye Yapay Zekâ Enstitüsü ile ortak araştırma hattı

4. **Donanım–yazılım dikey entegrasyonu:**
   - Türkiye'de tasarım + Türkiye'de prototipleme + global satış modeli
   - Yerli üretici ortaklığıyla orijinal tasarım üretimi (ODM) mümkün

---

## 12 · Sonuç ve Talep

Prodaktiv, Türkiye merkezli, yapay zekâ destekli, hibrit yazılım–donanım üretkenlik ürünüdür. Halihazırda yazılım ürünü beta aşamasındadır ve kullanıcı bekleme listesi aktiftir. KOSGEB Girişimci Destek Programı'nın 36 aylık penceresi, Prodaktiv'in:
- Yazılım ürününü ticari sürüme taşımasını
- Donanım ürününü prototipten seri üretime geçirmesini
- 8 tam zamanlı bilişim çalışanını Türkiye'de istihdam etmesini
- Türk yapay zekâ altyapısı (Graphyn) üzerinde inşa edilmiş bir platform ekosistemini hayata geçirmesini

mümkün kılacaktır.

KOSGEB Girişimci Destek Programı – İş Geliştirme Çağrısı 2026 Yılı 2. Dönem kapsamında **2.000.000 TL toplam destek talep edilmektedir**.

Saygılarımla,

**Resat Uğur Ulu**
Kurucu ve Genel Müdür
Prodaktiv Yazılım ve Teknoloji Limited Şirketi

---

## Ekler

- **Ek-1:** Bütçe ve Gider Planı (02-budget-expense-plan.md)
- **Ek-2:** Uygunluk ve Strateji Memorandumu (01-eligibility-strategy-memo.md)
- **Ek-3:** Kurul Hazırlık Paketi (04-kurul-prep-pack.md)
- **Ek-4:** Resat Uğur Ulu özgeçmişi (eklenecek)
- **Ek-5:** Fuego Labs LLC ↔ Prodaktiv TR teknoloji lisans sözleşmesi taslağı (eklenecek)
- **Ek-6:** Prodaktiv ürün ekran görüntüleri ve donanım render'ları (eklenecek)

---

*Bu iş planı KOSGEB Girişimci Destek Programı – İş Geliştirme Çağrısı 2026 Yılı 2. Dönem başvurusu için hazırlanmıştır. UE.35 (11) Uygulama Esasları doğrultusunda yapılandırılmıştır.*
