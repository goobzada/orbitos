#!/bin/bash
# =============================================================================
# Orbitos Domain Provisioner
# Usage: provision-domain.sh <domain> <target_port>
# Example: provision-domain.sh loja.meusite.com 3001
# =============================================================================

set -euo pipefail

DOMAIN="${1:?Domain is required}"
TARGET_PORT="${2:-3001}"
EMAIL="${CERTBOT_EMAIL:-admin@orbitup.io}"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
SITE_CONF="$NGINX_AVAILABLE/$DOMAIN"

# ── Validate domain format (letters, numbers, hyphens, dots only) ─────────────
if ! echo "$DOMAIN" | grep -qE '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'; then
  echo "ERROR: Invalid domain format: $DOMAIN" >&2
  exit 1
fi

echo "[PROVISION] 🚀 Provisionando domínio: $DOMAIN → porta $TARGET_PORT"

# ── Create nginx config (HTTP only first, certbot will add HTTPS block) ───────
cat > "$SITE_CONF" <<NGINXCONF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$TARGET_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXCONF

echo "[PROVISION] ✅ nginx config criado: $SITE_CONF"

# ── Enable site ───────────────────────────────────────────────────────────────
ln -sfn "$SITE_CONF" "$NGINX_ENABLED/$DOMAIN"

# ── Test nginx config ─────────────────────────────────────────────────────────
if ! nginx -t 2>&1; then
  echo "ERROR: nginx config test failed" >&2
  rm -f "$NGINX_ENABLED/$DOMAIN"
  exit 2
fi

# ── Reload nginx (HTTP first, certbot will re-reload after SSL) ───────────────
nginx -s reload
echo "[PROVISION] ✅ nginx recarregado (HTTP)"

# ── Request SSL certificate via certbot ───────────────────────────────────────
echo "[PROVISION] 🔒 Solicitando certificado SSL para: $DOMAIN"

if certbot --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    -m "$EMAIL" \
    --redirect 2>&1; then
  echo "[PROVISION] ✅ SSL provisionado com sucesso para: $DOMAIN"
else
  echo "ERROR: certbot falhou para $DOMAIN" >&2
  # Nginx still works in HTTP — don't fail loud, let caller decide
  exit 3
fi

echo "[PROVISION] 🎉 Domínio $DOMAIN provisionado com sucesso!"
