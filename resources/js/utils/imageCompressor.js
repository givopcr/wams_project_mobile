/**
 * Mengompresi file gambar dari kamera/galeri HP menggunakan HTML5 Canvas
 * sebelum dikirim sebagai Base64 ke server atau disimpan di localStorage.
 *
 * @param {File} file - Objek File dari input[type="file"]
 * @param {Object} options - Opsi kompresi
 * @param {number} [options.maxDimension=1280] - Ukuran piksel maksimum sisi terpanjang
 * @param {number} [options.quality=0.8] - Kualitas JPEG (0.1 - 1.0)
 * @returns {Promise<string>} Data URI Base64 (data:image/jpeg;base64,...)
 */
export function compressImageFile(file, { maxDimension = 1280, quality = 0.8 } = {}) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('File gambar tidak ditemukan.'));
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
        reader.onload = (event) => {
            const rawDataUrl = event.target?.result;
            if (typeof rawDataUrl !== 'string') {
                reject(new Error('Format data gambar tidak valid.'));
                return;
            }

            const img = new Image();
            img.onerror = () => {
                // Fallback ke rawDataUrl jika elemen Image gagal merender
                resolve(rawDataUrl);
            };
            img.onload = () => {
                try {
                    let { width, height } = img;
                    if (width > maxDimension || height > maxDimension) {
                        if (width >= height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, width);
                    canvas.height = Math.max(1, height);
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        resolve(rawDataUrl);
                        return;
                    }

                    // Isi background putih untuk gambar PNG transparan sebelum konversi ke JPEG
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    // Gunakan hasil kompresi jika lebih ringkas atau jika file asli > 1MB
                    if (compressedDataUrl && (compressedDataUrl.length < rawDataUrl.length || file.size > 1024 * 1024)) {
                        resolve(compressedDataUrl);
                    } else {
                        resolve(rawDataUrl);
                    }
                } catch {
                    resolve(rawDataUrl);
                }
            };
            img.src = rawDataUrl;
        };

        reader.readAsDataURL(file);
    });
}

