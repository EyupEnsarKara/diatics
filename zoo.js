// Simülasyon ayarları
const ALAN_GENISLIK = 500;
const ALAN_YUKSEKLIK = 500;
const TOPLAM_ADIM = 1000;
const fs = require('fs');

// Hayvan sınıfı - temel özellikler ve davranışlar
class Hayvan {
    constructor(tur, cinsiyet, hareketMesafesi) {
        this.tur = tur;
        this.cinsiyet = cinsiyet;
        this.hareketMesafesi = hareketMesafesi;
        // Rastgele başlangıç pozisyonu
        this.x = Math.random() * ALAN_GENISLIK;
        this.y = Math.random() * ALAN_YUKSEKLIK;
        this.yasiyor = true;
    }

    // Rastgele yönde hareket et
    hareketEt() {
        const yon = Math.random() * 2 * Math.PI;
        let yeniX = this.x + Math.cos(yon) * this.hareketMesafesi;
        let yeniY = this.y + Math.sin(yon) * this.hareketMesafesi;
        // Alan sınırları içinde kal
        this.x = Math.max(0, Math.min(ALAN_GENISLIK, yeniX));
        this.y = Math.max(0, Math.min(ALAN_YUKSEKLIK, yeniY));
    }

    // İki hayvan arasındaki mesafeyi hesapla
    mesafeHesapla(diger) {
        return Math.hypot(this.x - diger.x, this.y - diger.y);
    }
}

// Avcı sınıfı - hayvanları avlar
class Avci {
    constructor() {
        this.x = Math.random() * ALAN_GENISLIK;
        this.y = Math.random() * ALAN_YUKSEKLIK;
        this.hareketMesafesi = 1;
    }
    
    hareketEt() {
        const yon = Math.random() * 2 * Math.PI;
        let yeniX = this.x + Math.cos(yon) * this.hareketMesafesi;
        let yeniY = this.y + Math.sin(yon) * this.hareketMesafesi;
        this.x = Math.max(0, Math.min(ALAN_GENISLIK, yeniX));
        this.y = Math.max(0, Math.min(ALAN_YUKSEKLIK, yeniY));
    }
    
    mesafeHesapla(hayvan) {
        return Math.hypot(this.x - hayvan.x, this.y - hayvan.y);
    }
}

// Başlangıç hayvanlarını oluştur
function hayvanlariOlustur() {
    const hayvanlar = [];
    
    // Koyunlar - en çok sayıda
    for (let i = 0; i < 15; i++) hayvanlar.push(new Hayvan("koyun", "erkek", 2));
    for (let i = 0; i < 15; i++) hayvanlar.push(new Hayvan("koyun", "dişi", 2));
    
    // İnekler - orta sayıda
    for (let i = 0; i < 5; i++) hayvanlar.push(new Hayvan("inek", "erkek", 2));
    for (let i = 0; i < 5; i++) hayvanlar.push(new Hayvan("inek", "dişi", 2));
    
    // Kurtlar - yırtıcı
    for (let i = 0; i < 5; i++) hayvanlar.push(new Hayvan("kurt", "erkek", 3));
    for (let i = 0; i < 5; i++) hayvanlar.push(new Hayvan("kurt", "dişi", 3));
    
    // Aslanlar - en güçlü yırtıcı
    for (let i = 0; i < 4; i++) hayvanlar.push(new Hayvan("aslan", "erkek", 4));
    for (let i = 0; i < 4; i++) hayvanlar.push(new Hayvan("aslan", "dişi", 4));
    
    // Kümes hayvanları
    for (let i = 0; i < 10; i++) hayvanlar.push(new Hayvan("tavuk", "dişi", 1));
    for (let i = 0; i < 10; i++) hayvanlar.push(new Hayvan("horoz", "erkek", 1));
    
    return hayvanlar;
}

// Rastgele cinsiyet seç
function rastgeleCinsiyet() {
    return Math.random() < 0.5 ? "erkek" : "dişi";
}

// İlerleme çubuğu göster
function ilerlemeGoster(adim, toplam) {
    const barUzunluk = 30;
    const yuzde = adim / toplam;
    const dolu = Math.round(barUzunluk * yuzde);
    const bos = barUzunluk - dolu;
    const bar = '█'.repeat(dolu) + '-'.repeat(bos);
    process.stdout.write(`\r[${bar}] %${Math.round(yuzde * 100)} (${adim}/${toplam})`);
    if (adim === toplam) process.stdout.write('\n');
}

// Ana simülasyon fonksiyonu
function simulasyonBaslat() {
    let hayvanlar = hayvanlariOlustur();
    let avci = new Avci();
    let logMetni = "Simülasyon başlıyor...\n";
    
    console.log("Simülasyon başlıyor...");
    
    for (let adim = 1; adim <= TOPLAM_ADIM; adim++) {
        // 1. AŞAMA: Tüm hayvanlar ve avcı hareket eder
        hayvanlar.forEach(h => h.yasiyor && h.hareketEt());
        avci.hareketEt();

        // 2. AŞAMA: Yırtıcı hayvanlar avlanır
        hayvanlar.forEach(yirtici => {
            if (!yirtici.yasiyor) return;
            
            // Kurtlar küçük hayvanları avlar
            if (yirtici.tur === "kurt") {
                hayvanlar.forEach(av => {
                    if (!av.yasiyor) return;
                    if (["koyun", "tavuk", "horoz"].includes(av.tur) && yirtici.mesafeHesapla(av) <= 4) {
                        av.yasiyor = false;
                    }
                });
            }
            
            // Aslanlar büyük hayvanları avlar
            if (yirtici.tur === "aslan") {
                hayvanlar.forEach(av => {
                    if (!av.yasiyor) return;
                    if (["inek", "koyun"].includes(av.tur) && yirtici.mesafeHesapla(av) <= 5) {
                        av.yasiyor = false;
                    }
                });
            }
        });
        
        // 3. AŞAMA: Avcı avlanır
        hayvanlar.forEach(hayvan => {
            if (hayvan.yasiyor && avci.mesafeHesapla(hayvan) <= 8) {
                hayvan.yasiyor = false;
            }
        });

        // 4. AŞAMA: Üreme - aynı türden farklı cinsiyet hayvanlar çiftleşir
        let yeniHayvanlar = [];
        for (let i = 0; i < hayvanlar.length; i++) {
            let a = hayvanlar[i];
            if (!a.yasiyor) continue;
            
            for (let j = i + 1; j < hayvanlar.length; j++) {
                let b = hayvanlar[j];
                if (!b.yasiyor) continue;
                
                // Aynı tür, farklı cinsiyet ve yakın mesafede
                if (a.tur === b.tur && a.cinsiyet !== b.cinsiyet && a.mesafeHesapla(b) <= 3) {
                    yeniHayvanlar.push(new Hayvan(a.tur, rastgeleCinsiyet(), a.hareketMesafesi));
                }
                
                // Tavuk ve horoz çiftleşmesi (kümes hayvanları)
                if (((a.tur === "tavuk" && b.tur === "horoz") || (a.tur === "horoz" && b.tur === "tavuk")) && 
                    a.cinsiyet !== b.cinsiyet && a.mesafeHesapla(b) <= 3) {
                    // Tavuk-horoz çiftleşmesinden tavuk veya horoz doğar
                    const yavruTur = Math.random() < 0.5 ? "tavuk" : "horoz";
                    yeniHayvanlar.push(new Hayvan(yavruTur, rastgeleCinsiyet(), a.hareketMesafesi));
                }
            }
        }
        hayvanlar = hayvanlar.concat(yeniHayvanlar);
        
        // Ölü hayvanları listeden çıkar
        hayvanlar = hayvanlar.filter(h => h.yasiyor);

        // Her 100 adımda durum raporu
        if (adim % 100 === 0 || adim === TOPLAM_ADIM) {
            ilerlemeGoster(adim, TOPLAM_ADIM);
            
            // Hayvan sayılarını hesapla
            const sayilar = {};
            hayvanlar.forEach(h => {
                if (!h.yasiyor) return;
                sayilar[h.tur] = (sayilar[h.tur] || 0) + 1;
            });
            
            let ozet = `\nAdım: ${adim}\n`;
            Object.entries(sayilar).forEach(([tur, sayi]) => {
                ozet += `  ${tur}: ${sayi}\n`;
            });
            logMetni += ozet;
            console.log(ozet);
        }
    }

    // Final sonuçları
    const finalSayilar = {};
    hayvanlar.forEach(h => {
        finalSayilar[h.tur] = (finalSayilar[h.tur] || 0) + 1;
    });
    
    let sonucMetni = "\nSimülasyon tamamlandı. Sonuçlar:\n";
    Object.entries(finalSayilar).forEach(([tur, sayi]) => {
        sonucMetni += `${tur}: ${sayi}\n`;
    });
    console.log(sonucMetni);
    logMetni += sonucMetni;
    
    // Sonuçları dosyaya kaydet
    fs.writeFileSync("sonuclar.txt", logMetni, "utf8");
}

// Simülasyonu başlat
simulasyonBaslat(); 