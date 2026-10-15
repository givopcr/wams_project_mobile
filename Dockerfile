# =============================================================
# WAMS - Image PHP-FPM untuk Laravel 12 (PHP 8.2)
# =============================================================
FROM php:8.4-fpm

# Paket sistem + ekstensi PHP yang dibutuhkan Laravel & project WAMS
# (pdo_mysql: database, gd/exif: upload & olah gambar, zip/intl/bcmath: library umum)
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libicu-dev \
        libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring zip gd intl exif bcmath opcache \
    && rm -rf /var/lib/apt/lists/*

# Batas upload disamakan dengan Nginx (client_max_body_size 20M)
RUN { \
        echo "upload_max_filesize=20M"; \
        echo "post_max_size=20M"; \
        echo "memory_limit=256M"; \
    } > /usr/local/etc/php/conf.d/wams.ini

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
