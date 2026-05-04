# Doğrulama Raporu — Prodaktiv KOSGEB Başvuru Paketi

Bu rapor, paketteki dört ana belgenin (uygunluk memorandumu, bütçe, iş planı, kurul prep) içerdiği iddiaları KOSGEB resmi kaynaklarına ve birincil dokümanlara karşı çapraz kontrol eder. **Hatalı veya belirsiz olan iddialar kırmızı flag ile işaretlenmiştir.**

---

## 1 · Doğrulanmış Olgular

| İddia | Belgedeki konum | Kaynak | Durum |
|---|---|---|---|
| Başvuru penceresi: 20 Nisan – 8 Mayıs 2026 | Tüm belgeler | KOSGEB resmi duyuru #9374 | ✓ Doğrulandı |
| Toplam destek üst limiti: 2.000.000 TL (+150K bonus) | Memo §1, Bütçe Bölüm A | KOSGEB resmi duyuru | ✓ Doğrulandı |
| İş Kurma Desteği: 20K TL (LTD) / 10K TL (gerçek kişi), %100 oran | Memo §1, Bütçe Bölüm A | KOSGEB resmi duyuru | ✓ Doğrulandı |
| İş Geliştirme Desteği: 1.500.000 TL geri ödemeli, %80 oran | Memo §1, Bütçe Bölüm B | KOSGEB resmi duyuru | ✓ Doğrulandı |
| Proje süresi: 36 ay | Tüm belgeler | KOSGEB resmi duyuru | ✓ Doğrulandı |
| Geri ödeme: 6 ay grace + 4 eşit taksit, üçer ay arayla | Bütçe Bölüm E | KOSGEB resmi duyuru | ✓ Doğrulandı |
| Uygun NACE: C, 61, 62, 63, 72 | Memo §4, İş Planı §1 | UE.35 (11) açıklaması | ✓ Doğrulandı |
| 0–3 yaş işletme şartı | Tüm belgeler | UE.35 (11) | ✓ Doğrulandı |
| İşletme yaşı hesaplama: ticaret sicili tescil tarihi (LTD) / vergi levhasında işe başlama tarihi (şahıs) | Memo §2 | KOSGEB resmi duyuru | ✓ Doğrulandı |
| 0–1 yaş: hem İş Kurma hem İş Geliştirme; 1–3 yaş: sadece İş Geliştirme | (yeni — bu raporda flag) | KOSGEB resmi duyuru | ✓ Doğrulandı (iş planına ekleme gerekli) |
| Bilişim personeli aylık üst limit: 4× brüt asgari ücret işverene maliyeti | Bütçe Bölüm B.1 | UE.35 (11) (ikincil kaynak teyit) | ✓ Doğrulandı |
| Pozitif ayrımcılık (kadın/genç/engelli/gazi/şehit yakını): +150K TL üst limit artışı | Tüm belgeler | KOSGEB resmi duyuru | ✓ Doğrulandı |
| Uygulamalı Girişimcilik Eğitimi (e-Akademi) sertifika geçerliliği: 2020 sonrası SÜRESİZ | Memo §2 | KOSGEB SSS, kosgebdestekler.com | ✓ Doğrulandı |
| Eğitim süresi: minimum 32 saat, ortalama 50–70 saat, en fazla 6 saat devamsızlık | (yeni — bu raporda) | kosgebdestekler.com | ✓ Doğrulandı |

---

## 2 · KIRMIZI FLAG'LER — Acil Doğrulama Gerekiyor

### F1 — Girişimcinin başka şirkette ortaklık kuralı (KRİTİK)

**Birincil kaynaklarda buldum:** "Tüzel kişi statüsünde kurulmuş herhangi bir firmada **yüzde 25 ve üzeri ortaklığının bulunmaması** gerekiyor" (kobitime.com referansıyla; bu kural KOSGEB Uygulama Esasları'na dayanıyor).

**Risk:**
- **Aysima'nın Fuego Labs LLC'de ≥%25 hissesi varsa**, bu kural Aysima'yı diskalifiye edebilir
- **Resat'ın Fuego Labs LLC veya başka TR şirketinde ≥%25 hissesi varsa**, Resat girişimci olarak başvuramaz

**Aksiyon:**
1. Aysima'nın Fuego Labs LLC dahil herhangi bir şirketteki pay yapısını netleştir
2. Eğer Aysima Fuego Labs'ta ≥%25 ortak ise — bu paya geçici/kalıcı olarak %24,99 altına çekilmeli, VEYA başvuru farklı bir kişi adına yapılmalı
3. **Belirsizlik:** Bu kural sadece TR'de tüzel kişi olarak kayıtlı şirketler için mi geçerli, yoksa yabancı tüzel kişilikleri (Fuego Labs LLC, US) de kapsıyor mu? UE.35 (11) tam metninden teyit edilmeli.

**Etki seviyesi:** KRİTİK — yanlış cevap başvurunun reddine yol açar.

### F2 — Uygulamalı Girişimcilik Eğitimi sertifikasının Aysima'da olup olmadığı

**Risk:**
- Sertifika yoksa, başvuru başvuru penceresinde reddedilir
- e-Akademi modülü minimum 32 saat — 8 Mayıs deadline'ına 3 gün kaldı. Self-paced olduğu için teorik olarak mümkün; pratikte zorlu

**Aksiyon:**
1. **EN ACIL:** Aysima'nın e-Devlet üzerinden "KOSGEB Girişimcilik Eğitimi Katılım Belgesi Sorgulama" adresinden mevcut sertifikasını teyit etmesi (https://www.turkiye.gov.tr/kvogvd-girisimcilik-egitimi-katilim-belgesi-sorgulama)
2. Sertifika yoksa: 5 Mayıs gece yarısından önce e-Akademi modülüne kayıt olmak ve maraton hız ile bitirmek; VEYA başvuruyu 2027/1 dönemine taşımak
3. **Tavsiye:** Eğer sertifika yoksa **2027/1 dönemine kaydır**. 3 günlük maraton hem sertifika hem LTD kuruluş hem de iş planı kalitesini ciddi olarak tehlikeye atar — yetiştirme baskısıyla yapılan başvuruların kabul oranı düşer.

**Etki seviyesi:** KRİTİK — paketin kalan tüm kısımları bu noktaya bağlı.

### F3 — Girişimcinin işletmedeki pay oranı kuralı (%50 mi, %25 mi)

**Belirsizlik:** Memo §1 ve §5'te "≥%50 pay" varsayımı yapıldı. Bazı ikincil kaynaklar (https://kobitime.com — yukarıdaki kural F1 ile karıştırılmış olabilir) %25 oranından bahsediyor; bu olasılıkla "başka şirketteki ortaklık" kuralı (F1) ile karıştırılmıştır.

**Aksiyon:**
1. UE.35 (11) PDF'ini birincil kaynak olarak teyit et — pay oranı %50 mi %25 mi?
2. **Konservatif strateji:** %50 üzerinden plan yap (Aysima %51) — kuralın hangisi olduğundan bağımsız olarak bu oran her iki kuralı da geçer.

**Etki seviyesi:** ORTA — konservatif strateji riski sıfırlar.

### F4 — Pozitif ayrımcılık bonusu: +150K TL mi, +10K TL mi?

**Çelişki:**
- KOSGEB resmi duyuru #9374: "destek üst limiti 150 bin TL artırılacak"
- İkincil kaynak (yenisafak.com/bigpara.hurriyet): "kuruluş desteğine 10 bin TL ilave"

**Olası açıklama:** İki farklı kalem olabilir:
- Kuruluş desteği (20K) üzerine: +10K TL (sadece bu kaleme)
- Toplam destek üst limiti üzerine: +150K TL (geri ödemeli kalemde)

Veya birbirinin üzerine eklenmiyor olabilir.

**Aksiyon:**
1. UE.35 (11) tam metninden tam ifadeyi teyit et
2. Bütçe planı şu anda +150K bonus varsayımıyla yapıldı; eğer +10K çıkarsa toplam talep 2.000.000 TL'ye düşer (geri ödemesiz 530K → 520K). Bu çok ciddi bir değişiklik değil ama kalibre edilmesi gerek.

**Etki seviyesi:** DÜŞÜK — bütçenin %5'i etkilenir.

### F5 — Performans desteği 480.000 TL varsayımı

**Belirsizlik:** Bütçe Bölüm A'da "Performans desteği 480.000 TL" olarak yer aldı, ancak bu kalemin tam tutarı ve şartları (istihdam/gelir milestone'ları) UE.35 (11) tam metninden netleştirilmemiş.

**Aksiyon:**
1. UE.35 (11) PDF'ini birincil kaynak olarak doğrula — performans desteği gerçek tavanı kaç TL?
2. Eğer farklı bir tutarsa bütçeyi yeniden kalibre et

**Etki seviyesi:** ORTA — toplam talep tutarını değiştirir.

---

## 3 · Yapısal Kontrol

| Belge | İç tutarlılık | Belgeler arası tutarlılık | Notlar |
|---|---|---|---|
| 01 — Eligibility & Strategy Memo | ✓ | ✓ | Pay yapısı (%51/%39/%10) iş planı ile uyumlu |
| 02 — Budget & Expense Plan | ✓ | ✓ | Toplam 2.150K, 36 ay tahsisi tutarlı |
| 03 — İş Planı | ✓ | ⚠ | Aysima ve Resat'ın özgeçmişleri placeholder — Aysima'nın gerçek özgeçmişi eklenmeli |
| 04 — Kurul Prep Pack | ✓ | ✓ | Cevap iskeletleri iş planı ile hizalı |

---

## 4 · Eksik Belgeler / Veriler

Başvuru paketinin tam olması için aşağıdakilerin Aysima tarafından sağlanması gerekiyor:

- [ ] Aysima'nın tam adı ve soyadı (iş planında placeholder)
- [ ] Aysima'nın özgeçmişi (eğitim, deneyim, neden Prodaktiv'i kuruyor)
- [ ] Aysima'nın kadın/genç/engelli/gazi/şehit yakını kategorisinden hangisinde olduğu (kadın varsayıldı)
- [ ] Aysima'nın doğum yılı (genç girişimci kategorisi ≤30 yaş ise ek puan)
- [ ] Aysima'nın Uygulamalı Girişimcilik Eğitimi sertifikasının tarihi ve numarası (varsa)
- [ ] Aysima'nın diğer şirketlerdeki ortaklık durumu (F1 için kritik)
- [ ] Resat'ın diğer şirketlerdeki ortaklık durumu
- [ ] Fuego Labs LLC ↔ Prodaktiv TR teknoloji lisans sözleşmesi taslağı
- [ ] Şirket merkez adresi (sanal ofis veya fiziksel)
- [ ] Sermaye taahhüt tutarı (LTD için minimum 50.000 TL)
- [ ] Banka şubesi tercihi (sermaye yatırma için)

---

## 5 · Kritik Karar Noktaları (Aysima'nın Vermesi Gereken Kararlar)

1. **Eğitim sertifikası durumu** — Var mı? Yok mu? Hızlı kontrol e-Devlet üzerinden yapılabilir.
2. **2026/2 dönem mi yoksa 2027/1 dönem mi hedef?** — Eğitim sertifikası yoksa ve LTD kurulmamışsa, 2027/1 daha sağlıklı bir hedef.
3. **Aysima %51 girişimci yapısı onay mı?** — F1 ve F3 risklerinin yönetimi için kritik.
4. **Fuego Labs LLC %10 azınlık ortak mı tutalım, yoksa sadece lisans sözleşmesiyle ilişki kuralım mı?** — F1 riskine bağlı.
5. **NACE kodu 62.01.01 + 62.09.01 kombinasyonu onay mı?** — MERSİS başvurusu öncesi netleşmeli.

---

## 6 · Stratejik Tavsiye (Verification Sonucu)

**Mevcut durum:** Paket içerik olarak tutarlı ve kurul'a sunulabilir kalitede. Ancak iki kritik ön koşul açıkta:

1. **Aysima'nın eğitim sertifikası**
2. **8 Mayıs 2026 deadline'ına 3 gün**

**İki yol ayrımı:**

### Yol A — 2026/2 Dönemi Hedeflemek (Yüksek Risk, Yüksek Değer)

Bugün başla:
1. (4 saat) Aysima eğitim sertifikası teyidi → yoksa e-Akademi modülü başlat
2. (Paralel) MERSİS LTD başvurusu hazırla — Aysima %51, sermaye 50K TL, NACE 62.01.01
3. (Paralel) Aysima özgeçmişini ve diğer eksik bilgileri tamamla, iş planına işle
4. (6 Mayıs) LTD tescili tamamlanır → vergi levhası → SGK kaydı
5. (7 Mayıs) Banka hesabı açılır, KOBİ Bilgi Sistemi'ne işletme kaydedilir
6. (8 Mayıs) e-Devlet üzerinden başvuru submit edilir

Risk: herhangi bir adım gecikirse paket eksik kalır. Eğitim sertifikası en büyük risk.

### Yol B — 2027/1 Dönemi Hedeflemek (Düşük Risk, Geç Başlangıç)

KOSGEB tipik olarak yılda 2 dönem açar (Ocak ve Nisan/Mayıs). 2027/1 dönemi yaklaşık Ocak 2027'de açılır — yaklaşık 8 ay sonra.

Bu süreçte:
1. Eğitim sertifikası rahatça alınır
2. LTD kuruluşu rahatça yapılır
3. Yazılım ürünü beta'dan ticari sürüme geçer (gelir başlar — kurul'a güçlü kanıt)
4. Donanım prototipi tamamlanır (kurul'a fiziksel demo)
5. Aysima'nın Fuego Labs ortaklık durumu netleştirilir

Bu yolda **kabul oranı materyel olarak yüksek** — kurul daha olgun bir paket görür.

**Tavsiye:** Eğer Aysima'da eğitim sertifikası yoksa, **Yol B'yi seç**. Yol A'daki maraton kalitesizleşmeyi neredeyse garantili hale getirir.

---

## 7 · Sonuç

Paket teknik olarak hazır. Kapatılması gereken iki açık nokta var:

1. **F1 — diğer şirketlerde ortaklık kuralı** (Aysima'nın Fuego Labs LLC pozisyonu)
2. **F2 — Eğitim sertifikası** (Aysima'da var/yok)

Her iki nokta da bir saat içinde Aysima tarafından netleştirilebilir. Sonuca göre Yol A veya Yol B aktif edilir.

---

## Kaynaklar

- [KOSGEB resmi duyuru #9374 — 2026/2 dönem başvuruları](https://www.kosgeb.gov.tr/site/tr/genel/detay/9374/girisimci-destek-programi-is-gelistirme-cagrisi-2026-yili-2-donem-basvurulari-basladi)
- [KOSGEB Girişimci Destek Programı ana sayfa](https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi)
- [UE.35 (11) Uygulama Esasları PDF](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/Giri%C5%9Fimcilik/2026/2026.03.11/UE.35_(11)_GDP_Uygulama_-_Esaslar%C4%B1.pdf)
- [KOSGEB SSS — Girişimcilik Eğitimi](https://www.kosgeb.gov.tr/site/tr/genel/sss?ara=giri%C5%9Fimcilik+e%C4%9Fitimi)
- [Eğitim sertifikası geçerlilik süresi referansı](https://www.kosgebdestekler.com/kosgeb-girisimcilik-sertifikasi/)
- [e-Devlet eğitim katılım belgesi sorgulama](https://www.turkiye.gov.tr/kvogvd-girisimcilik-egitimi-katilim-belgesi-sorgulama)
- [KOSGEB LMS — Girişimcilik Eğitimi](https://lms.kosgeb.gov.tr/)
- [KOSGEB Genel Destek Başvuru Şartları #7580](https://www.kosgeb.gov.tr/site/tr/genel/detay/7580/destek-basvuru-sartlari-ve-destek-turu)
- [Bigpara — başvuru penceresi 8 Mayıs](https://bigpara.hurriyet.com.tr/haberler/ekonomi-haberleri/girisimcilere-2-milyon-tl-destek-son-basvuru-tarihi-8-mayis_ID100701028/)
- [Kobitime — pay oranı ve ortaklık kuralı](https://kobitime.com/kosgeb-girisimci-destek-programi-basvuru-ve-sartlar/)
