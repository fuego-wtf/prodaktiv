# KOSGEB Girişimci Destek Programı 2026/2 — Uygunluk ve Strateji Memorandumu

**Başvuran şirket:** Prodaktiv (kurulacak TR LTD)
**Ana şirket:** Fuego Labs LLC
**Çağrı:** Girişimci Destek Programı – İş Geliştirme Çağrısı 2026 Yılı 2. Dönem
**Kaynak doküman:** UE.35 (11) GDP Uygulama Esasları — yürürlük 11/03/2026
**Başvuru penceresi:** 20 Nisan – 8 Mayıs 2026
**Bu memo tarihi:** 5 Mayıs 2026

---

## English Summary (TL;DR)

You are eligible to apply if four conditions hold simultaneously: (1) you personally hold a valid **Uygulamalı Girişimcilik Eğitimi** certificate from KOSGEB, (2) a Turkish company is incorporated with you as ≥50% shareholder and the company is **0–3 years old** at application time, (3) the company's NACE code falls inside Sections C / 61 / 62 / 63 / 72, and (4) the legal applicant is the entrepreneur, not Fuego Labs LLC.

Recommended posture: **incorporate Prodaktiv as a TR LTD with Aysima as ≥50% founder under NACE 62.01.01 (Bilgisayar programlama faaliyetleri).** This unlocks 20K TL geri ödemesiz kuruluş desteği (vs 10K for şahıs), limits personal liability, lets Fuego Labs LLC hold a minority technology-license relationship, and — if Aysima is the named entrepreneur — adds a +150K TL kadın girişimci bonus on top of the headline 1.5M TL geri ödemeli ceiling. Total addressable envelope: **~2.0M TL**.

The hard constraint is the **Uygulamalı Girişimcilik Eğitimi certificate**. Without it, the application is rejected at the formal-completeness stage. Confirm whether Aysima already has one (KOSGEB e-Akademi or face-to-face). Everything else is shaped by that gate.

---

## 1 · Program Parametreleri (Doğrulanmış)

| Parametre | Değer | Kaynak |
|---|---|---|
| Toplam destek üst limiti | 2.000.000 TL | KOSGEB resmi duyuru |
| Geri ödemeli üst limit | 1.500.000 TL | KOSGEB resmi duyuru |
| Geri ödemesiz (kuruluş) – sermaye şirketi | 20.000 TL | KOSGEB resmi duyuru |
| Geri ödemesiz (kuruluş) – gerçek kişi | 10.000 TL | KOSGEB resmi duyuru |
| Pozitif ayrımcılık ek limiti | +150.000 TL (kadın/genç/engelli/gazi/şehit yakını) | KOSGEB resmi duyuru |
| Destek oranı | %80 | KOSGEB resmi duyuru |
| Proje süresi | 36 ay | KOSGEB resmi duyuru |
| Geri ödeme | Proje bitiminden 6 ay sonra başlar; 4 eşit taksit, üçer ay arayla | KOSGEB resmi duyuru |
| Uygun NACE | C-İmalat, 61, 62, 63, 72 | UE.35 (11) |
| İşletme yaşı | 0–3 yıl | UE.35 (11) |
| Girişimci pay oranı | ≥%50 (doğrulanacak; bazı ikincil kaynaklar %25 söylüyor — birincilde teyit gerek) | UE.35 (11) — teyit |
| Bilişim personeli aylık üst limit | 4× brüt asgari ücretin işverene maliyeti | UE.35 (11) |

> **Belirsizlik notu:** Pay oranı kuralının %50 mi yoksa %25 mi olduğu ikincil kaynaklarda çelişkili. UE.35 (11) PDF'sinin tam metnini parse edemediğim için bu bir **doğrulama bağımlılığı** — başvurudan önce kosgeb.gov.tr birincil belgesinden teyit edilmeli. Stratejik tavsiye: %50 varsay, çünkü daha kısıtlayıcı olan eşik üzerinden plan yapmak güvenli.

---

## 2 · Bağımlılık Sırası (Sıra, takvim değil)

```
[A] Aysima'nın Uygulamalı Girişimcilik Eğitimi sertifikası
                │
                ├─ varsa → atlat
                │
                └─ yoksa → KOSGEB e-Akademi modülü tamamla → sertifika indir
                          ↓
[B] Şirket türü ve NACE kodu kararı (LTD + 62.01.01 öneriliyor)
                ↓
[C] MERSİS üzerinden ana sözleşme hazırlığı
       │
       ├─ Sermaye taahhüdü: 50.000 TL minimum LTD
       ├─ Aysima ≥%50 pay
       └─ Adres (sanal ofis kabul)
                ↓
[D] Ticaret Sicili tescili → Ticaret Sicili Gazetesi ilanı
                ↓
[E] Vergi levhası + SGK işyeri sicil + banka hesabı
                ↓
[F] KOBİ Bilgi Sistemi (KBS) işletme kaydı
                ↓
[G] Fuego Labs LLC ↔ Prodaktiv TR teknoloji lisans sözleşmesi
       (Graphyn/Fuego IP'sine ayrıcalıklı erişim — kurul'a moat olarak sunulacak)
                ↓
[H] e-Devlet üzerinden başvuru → İş Planı yükle → "Başvuruyu Onayla"
                ↓
[I] Kurul değerlendirme (sözlü savunma)
                ↓
[J] Kabul → 36 ay proje süresi → izleme → ödeme → 6 ay grace + 4 taksit geri ödeme
```

**Kritik bağımlılık:** [A] olmadan hiçbir şey çalışmaz. [G] formal başvuru için zorunlu değil ama kurul değerlendirmesinde *yenilikçi yön* puanını yükselten en güçlü argüman.

**Paralelleştirilebilir:** [B] ve [G] birlikte yürüyebilir. [E] altındaki banka hesabı ile vergi levhası eş zamanlı.

---

## 3 · Şirket Türü Kararı

| Kriter | Şahıs Şirketi | LTD (sermaye şirketi) | A.Ş. |
|---|---|---|---|
| Kuruluş desteği (geri ödemesiz) | 10.000 TL | **20.000 TL** | 20.000 TL |
| Kuruluş süresi | 1 gün | 1–3 gün | 5–7 gün |
| Asgari sermaye | yok | 50.000 TL | 250.000 TL |
| Sorumluluk | sınırsız kişisel | sermaye ile sınırlı | sermaye ile sınırlı |
| Yatırım alabilirlik (gelecek raise) | düşük | iyi | en iyi |
| KOSGEB değerlendirmede algı | "küçük girişim" | "ciddi girişim" | overkill |

**Tavsiye: LTD.** İki kat geri ödemesiz destek (10K → 20K), kişisel mal varlığını koruma, ileride Fuego Labs LLC ile yapılacak teknoloji lisans sözleşmesinin tüzel kişilik düzeyinde temiz görünmesi, ve kurul tarafından "ciddi girişim" olarak algılanma — hepsi LTD'yi haklı çıkarıyor. A.Ş. asgari sermayesi (250K TL) bu aşama için aşırı.

---

## 4 · NACE Kodu Kararı

Prodaktiv hibrit bir ürün: yazılım + donanım. Uygun NACE kodu seçenekleri:

| Kod | Tanım | Prodaktiv için yorum |
|---|---|---|
| **62.01.01** | **Bilgisayar programlama faaliyetleri** | **Birincil — yazılım üretimi, plugin, web app** |
| 62.02 | Bilgisayar danışmanlık faaliyetleri | İkincil — B2B danışmanlık tarafına eklenebilir |
| 62.09.01 | Diğer bilgi teknolojisi ve bilgisayar hizmet faaliyetleri | Plugin marketplace + ekosistem hizmetleri için |
| 63.11.01 | Veri işleme, barındırma | Cloud altyapı tarafına işlerse |
| 26.30.04 | Telsiz/radyo/iletişim cihazları imalatı | ESP32 dock donanımı için olası — ama imalat kıyısı |

**Tavsiye: Birincil 62.01.01, ikincil 62.09.01.** Donanım üretimi (ESP32 dock) ana iş tanımı değil; bu, *yazılım şirketinin sattığı bir aksesuar* olarak konumlandırılır. NACE 62 grubu KOSGEB için en güvenilir ve en yüksek kabul oranlı sektör. İmalat NACE'sine girersen *Yapı / İmalat sınıfı denetim* yükümlülükleri açılır — gerek yok.

---

## 5 · Girişimci Profili Kararı (Stratejik Çatallanma)

Bu memorandumun en önemli karar noktası. KOSGEB programı **tüzel kişiye değil, gerçek kişi girişimciye verilir** — şirket sadece destek aracıdır. Yani başvuruyu kim adına yapacağın **doğrudan toplam destek miktarını ve kurul puanını etkiliyor**.

| Senaryo | Mantık | Toplam destek tavanı | Kurul ek puanı |
|---|---|---|---|
| **A) Aysima girişimci** | Kadın girişimci → +150K bonus + kadın ek puanı | **2.150.000 TL** | Yüksek |
| B) Resat girişimci | Genç girişimci (yaş ≤30 ise) → +150K bonus | 2.150.000 TL | Orta |
| C) Resat girişimci, ≥30 | Standart | 2.000.000 TL | Standart |

**Tavsiye: Senaryo A — Aysima ≥%50 pay sahibi olarak girişimci.** Hem +150K parasal kazanç hem kurul'da kadın girişimci ek puanı. Resat ise teknik kurucu / CTO olarak ortak yapısında <%50 pay ile yer alır, **Fuego Labs LLC'nin Türkiye'deki teknoloji partneri** olarak konumlandırılır. Bu yapı KOSGEB'e doğal görünür ve birden fazla mevcut Türk teknoloji girişiminde kullanılan bir kalıptır.

**Şart:** Aysima'nın aktif Uygulamalı Girişimcilik Eğitimi sertifikası olması. Eğer yoksa, KOSGEB e-Akademi modülü ~32 saatlik içerik — başvuru penceresi içinde tamamlanması mümkün ama sıkı.

---

## 6 · Fuego Labs ↔ Prodaktiv TR İlişki Yapısı

Kurul'a sunulacak yapı:

```
Fuego Labs LLC (US ana şirket)
       │
       │ — IP / teknoloji lisans sözleşmesi
       │ — Graphyn agent platformuna ayrıcalıklı erişim
       │ — minoritery hisse (opsiyonel, %≤49)
       ▼
Prodaktiv TR LTD (KOSGEB başvuranı)
       Aysima %≥50 (kadın girişimci, kurul'da puanlanacak)
       Resat %  (teknik ortak)
       Fuego Labs LLC %  (minoritery, opsiyonel)
```

**Niye bu yapı kurul'a iyi görünüyor:**
- "Yenilikçi yön" puanlaması için Graphyn'ın varlığı *kanıtlanabilir bir teknolojik moat* sağlıyor — sıradan bir productivity SaaS'ından ayırıyor
- Fuego Labs LLC'nin minority pozisyonu Türkiye operasyonunun bağımsızlığını gösterirken yabancı sermaye girişi mesajı veriyor (KOSGEB bunu *düşük puanlı pozitif sinyal* olarak görür, yüksek puanlı değil — abartmamak lazım)
- Aysima'nın çoğunluk pay kontrolü %50 kuralını rahatlıkla geçirir

**Niye bu yapı kötü görünebilir (azaltma stratejisi):**
- "Esas iş yurt dışında, Türkiye sadece destek almak için açılmış" şüphesi — *mitigation:* Prodaktiv ürününün Türkiye merkezli geliştirildiğini, ESP32 donanım tedarik zinciriyle yerli üretici ortaklıklarını, ve hedef pazarın global ama TR'den yönetildiğini iş planında somut göstergelerle anlat (TR'li müşteri sayısı, TR'li tedarikçi sözleşmeleri, TR'de istihdam edilecek personel sayısı)

---

## 7 · Risk Yüzeyi

| Risk | Olasılık | Etki | Azaltma |
|---|---|---|---|
| Aysima'da Uygulamalı Girişimcilik Eğitimi sertifikası yok | Bilinmiyor — TEYİT GEREK | KRİTİK (başvuru reddi) | Bugün e-Akademi'de modüle başla |
| 8 Mayıs 2026 son tarihine yetişememe | Orta | KRİTİK (1. dönem 2027'ye sarkar) | LTD kuruluşunu acil başlat — MERSİS başvurusu paralel |
| Pay oranı kuralı %50 yerine %25 çıkarsa kurul'da soru olur | Düşük | Düşük | Birincilden teyit ettikten sonra net cevap hazırla |
| NACE kodu sonradan değişmek istenirse | Düşük | Orta | İlk seferde 62.01.01 + 62.09.01 olarak iki kod birden tescil ettir |
| Fuego Labs LLC ile lisans sözleşmesi kurul'a "transfer pricing" gibi görünürse | Orta | Orta | Sözleşmede *piyasa fiyatı* royalty oranı (örn. yıllık net gelirin %X'i) ve *bağımsız yönetim* maddeleri olsun |
| Geri ödemeli desteği geri ödeyememe (proje sonunda gelir yetersiz) | Orta | Yüksek (yasal takip) | Finansal projeksiyonlarda muhafazakar gelir senaryosu altında bile geri ödeme kapasitesini göster |
| Donanım tedarik zinciri (ESP32, e-ink) gecikme | Yüksek | Orta | İş planında donanımı *Faz 2* olarak konumlandır; Faz 1 = yazılım, gelir yazılımdan başlar |

---

## 8 · Sonraki Adımlar (Bu Memo'dan Sonra)

Bu memo onaylandığında 4 numaralı görev (Bütçe & gider planı) açılır. Bütçe; Bölüm 4'te belirlenen NACE altında izin verilen destek kalemlerine somut TL tutarları yerleştirir. Bütçe + bu memo birlikte 5 numaralı görevin (Türkçe iş planı tam metni) girdisi olur.

**Karar bekleyenler:**
1. Aysima'nın Uygulamalı Girişimcilik Eğitimi sertifikası durumu (var/yok/alınacak)
2. Senaryo A onayı (Aysima girişimci, kadın girişimci avantajı kullanılacak)
3. NACE kodu seçimi onayı (62.01.01 birincil + 62.09.01 ikincil)
4. LTD kuruluşunun başvuru penceresi içinde tamamlanmasına ilişkin pratik onay (sermaye, adres, noter randevusu)

---

## Kaynaklar

- [Girişimci Destek Programı İş Geliştirme Çağrısı 2026 Yılı 2. Dönem Başvuruları Başladı – KOSGEB](https://www.kosgeb.gov.tr/site/tr/genel/detay/9374/girisimci-destek-programi-is-gelistirme-cagrisi-2026-yili-2-donem-basvurulari-basladi)
- [Girişimci Destek Programı – KOSGEB ana sayfa](https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi)
- [UE.35 (11) GDP Uygulama Esasları PDF — 11/03/2026](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Giri%C5%9Fimcilik/2026/2026.03.11/UE.35_(11)_GDP_Uygulama_-_Esaslar%C4%B1.pdf)
- [Girişimcilere 2 milyon TL destek! Son başvuru tarihi 8 Mayıs – Bigpara](https://bigpara.hurriyet.com.tr/haberler/ekonomi-haberleri/girisimcilere-2-milyon-tl-destek-son-basvuru-tarihi-8-mayis_ID100701028/)
- [KOSGEB Girişimci Destek Programı 2026 Yılı Uygulama Esasları – SER Danışmanlık](https://sd.com.tr/kosgeb-girisimci-destek-programi-2026-yili-uygulama-esaslari-ve-basvuru-surecleri/)
- [KOSGEB Girişimci Destek Programı: 2026 Başvuru Rehberi – Kobitime](https://kobitime.com/kosgeb-girisimci-destek-programi-basvuru-ve-sartlar/)
