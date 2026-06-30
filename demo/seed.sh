#!/usr/bin/env bash
# Popula todos os serviços com dados de demo e gera http-client.env.json
# Uso: bash demo/seed.sh
set -e

CATALOG="http://localhost:3001"
ORDERS="http://localhost:3002"
NOTIF="http://localhost:3003"
ENV_FILE="$(dirname "$0")/../http-client.env.json"

# ── dependências ────────────────────────────────────────────────────────────
if ! command -v jq &>/dev/null; then
  echo "❌  jq não encontrado. Instale com: brew install jq"
  exit 1
fi

# ── aguarda serviços ─────────────────────────────────────────────────────────
echo "⏳  Verificando serviços..."
for SVC in "$CATALOG" "$ORDERS" "$NOTIF"; do
  for i in $(seq 1 10); do
    if curl -s --max-time 2 -o /dev/null "$SVC" 2>/dev/null; then
      break
    fi
    if [ "$i" -eq 10 ]; then
      echo "❌  Serviço $SVC não respondeu. Certifique-se que 'npm run dev' está rodando."
      exit 1
    fi
    sleep 1
  done
done
echo "✅  Serviços OK"

# ── produtos ─────────────────────────────────────────────────────────────────
echo ""
echo "🛍️   Criando produtos no Catálogo..."

P1=$(curl -sf -X POST "$CATALOG/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"MacBook Pro 14\"","stock":5,"price":849900}')
P1_ID=$(echo "$P1" | jq -r '.id')
echo "   ✅  MacBook Pro 14\"   → $P1_ID  (R$ 8.499,00 | estoque: 5)"

P2=$(curl -sf -X POST "$CATALOG/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","stock":10,"price":499900}')
P2_ID=$(echo "$P2" | jq -r '.id')
echo "   ✅  iPhone 15          → $P2_ID  (R$ 4.999,00 | estoque: 10)"

P3=$(curl -sf -X POST "$CATALOG/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"AirPods Pro","stock":20,"price":179900}')
P3_ID=$(echo "$P3" | jq -r '.id')
echo "   ✅  AirPods Pro        → $P3_ID  (R$ 1.799,00 | estoque: 20)"

# ── clientes ─────────────────────────────────────────────────────────────────
echo ""
echo "👥  Criando clientes..."

C1=$(curl -sf -X POST "$ORDERS/customers" \
  -H "Content-Type: application/json" \
  -d '{"name":"Joao Silva"}')
C1_ID=$(echo "$C1" | jq -r '.id')
echo "   ✅  João Silva   → $C1_ID"

C2=$(curl -sf -X POST "$ORDERS/customers" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Santos"}')
C2_ID=$(echo "$C2" | jq -r '.id')
echo "   ✅  Maria Santos → $C2_ID"

# ── pedidos ───────────────────────────────────────────────────────────────────
echo ""
echo "📦  Criando pedidos..."

O1=$(curl -sf -X POST "$ORDERS/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$C1_ID\",
    \"items\": [
      { \"productId\": \"$P1_ID\", \"quantity\": 1 },
      { \"productId\": \"$P3_ID\", \"quantity\": 2 }
    ]
  }")
O1_ID=$(echo "$O1" | jq -r '.id')
O1_TOTAL=$(echo "$O1" | jq -r '.total')
echo "   ✅  Pedido João: 1× MacBook + 2× AirPods → $O1_ID  (total: $O1_TOTAL centavos)"

O2=$(curl -sf -X POST "$ORDERS/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$C2_ID\",
    \"items\": [
      { \"productId\": \"$P2_ID\", \"quantity\": 1 }
    ]
  }")
O2_ID=$(echo "$O2" | jq -r '.id')
O2_TOTAL=$(echo "$O2" | jq -r '.total')
echo "   ✅  Pedido Maria: 1× iPhone → $O2_ID  (total: $O2_TOTAL centavos)"

# ── notificações ──────────────────────────────────────────────────────────────
echo ""
echo "⏳  Aguardando notificações assíncronas (RabbitMQ)..."
sleep 2

echo ""
echo "🔔  Notificações — João Silva:"
curl -s "$NOTIF/customers/$C1_ID/notifications" | jq '.[] | {message, type}'

echo ""
echo "🔔  Notificações — Maria Santos:"
curl -s "$NOTIF/customers/$C2_ID/notifications" | jq '.[] | {message, type}'

# ── escreve http-client.env.json ──────────────────────────────────────────────
cat > "$ENV_FILE" <<EOF
{
  "demo": {
    "CATALOG_URL": "$CATALOG",
    "ORDERS_URL": "$ORDERS",
    "NOTIF_URL": "$NOTIF",
    "PRODUCT_1_ID": "$P1_ID",
    "PRODUCT_2_ID": "$P2_ID",
    "PRODUCT_3_ID": "$P3_ID",
    "CUSTOMER_1_ID": "$C1_ID",
    "CUSTOMER_2_ID": "$C2_ID",
    "ORDER_1_ID": "$O1_ID",
    "ORDER_2_ID": "$O2_ID"
  }
}
EOF

echo ""
echo "💾  IDs salvos em demo/http-client.env.json"
echo "    No VS Code REST Client: selecione o environment 'demo' e use os arquivos .http"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  MacBook Pro ID  : $P1_ID"
echo "  iPhone 15 ID    : $P2_ID"
echo "  AirPods Pro ID  : $P3_ID"
echo "  João Silva ID   : $C1_ID"
echo "  Maria Santos ID : $C2_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
