#!/bin/bash
# Cloudflare DNS setup for prodaktiv.com
# Run after nameservers propagate to Cloudflare

set -e

DOMAIN="prodaktiv.com"
DO_APP="prodaktiv-63fz2.ondigitalocean.app"
FLARECTL="$HOME/go/bin/flarectl"

# Check for API token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Set CLOUDFLARE_API_TOKEN first:"
  echo "   export CLOUDFLARE_API_TOKEN='your-token'"
  echo ""
  echo "Get token from: https://dash.cloudflare.com/profile/api-tokens"
  echo "Required permission: Zone.DNS (Edit)"
  exit 1
fi

echo "🔍 Getting zone ID for $DOMAIN..."
ZONE_ID=$($FLARECTL zone list | grep "$DOMAIN" | awk '{print $1}')

if [ -z "$ZONE_ID" ]; then
  echo "❌ Zone not found. Add $DOMAIN to Cloudflare first."
  exit 1
fi

echo "✅ Zone ID: $ZONE_ID"

# Delete existing A/CNAME records for @ and www
echo "🗑️  Cleaning existing records..."
$FLARECTL dns list --zone "$DOMAIN" | grep -E "^[a-f0-9]+" | while read -r line; do
  RECORD_ID=$(echo "$line" | awk '{print $1}')
  RECORD_NAME=$(echo "$line" | awk '{print $2}')
  if [ "$RECORD_NAME" = "$DOMAIN" ] || [ "$RECORD_NAME" = "www.$DOMAIN" ]; then
    echo "   Deleting $RECORD_NAME..."
    $FLARECTL dns delete --zone "$DOMAIN" --id "$RECORD_ID" 2>/dev/null || true
  fi
done

# Create CNAME records (Cloudflare auto-flattens @ CNAME)
echo "➕ Creating CNAME records..."

# Apex domain (@ → CNAME flattening)
$FLARECTL dns create --zone "$DOMAIN" --type CNAME --name "@" --content "$DO_APP" --proxy
echo "   ✅ @ → $DO_APP (proxied)"

# www subdomain
$FLARECTL dns create --zone "$DOMAIN" --type CNAME --name "www" --content "$DO_APP" --proxy
echo "   ✅ www → $DO_APP (proxied)"

echo ""
echo "🎉 DNS configured! Test with:"
echo "   curl -sI https://prodaktiv.com | head -5"
echo "   curl -sI https://www.prodaktiv.com | head -5"
