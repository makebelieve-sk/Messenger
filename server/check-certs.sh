#!/usr/bin/env bash
# Проверка наличия server/certs/localhost.pem и server/certs/localhost-key.pem

set -euo pipefail

CERT_DIR="./certs"
CERT_CHAIN="$CERT_DIR/localhost.pem"
CERT_KEY="$CERT_DIR/localhost-key.pem"

missing=()

if [ ! -d "$CERT_DIR" ]; then
    missing+=("directory $CERT_DIR")
fi

if [ ! -f "$CERT_CHAIN" ]; then
    missing+=("file $CERT_CHAIN")
fi

if [ ! -f "$CERT_KEY" ]; then
    missing+=("file $CERT_KEY")
fi

if [ ${#missing[@]} -gt 0 ]; then
    echo "Ошибка: не найдены необходимые сертификаты для HTTPS:"

    for item in "${missing[@]}"; do
        echo "  • $item"
    done

    echo
    echo "В папке server сгенерируйте локальные сертификаты командой:"
    echo " cd $CERT_DIR && mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1 ::1"
    exit 1
fi

echo "Проверка наличия сертификатов прошла успешно."