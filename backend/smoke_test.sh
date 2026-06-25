#!/usr/bin/env bash
# End-to-end check of the API. Start the server first:
#   uvicorn app.main:app --reload --port 8000
# Then in another shell:
#   ./smoke_test.sh
set -euo pipefail

BASE="${BASE:-http://localhost:8000}"
USER="smoke_$(date +%s)"
PIN="1234"
DATE="2026-06-24"

say() { printf "\n\033[1;36m▶ %s\033[0m\n" "$1"; }

say "Health"
curl -fsS "$BASE/api/health"; echo

say "Register $USER"
TOKEN=$(curl -fsS -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER\",\"pin\":\"$PIN\"}" | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
AUTH=(-H "Authorization: Bearer $TOKEN")
echo "got token: ${TOKEN:0:24}…"

say "POST a full day ($DATE)"
curl -fsS -X POST "$BASE/api/logs" "${AUTH[@]}" -H "Content-Type: application/json" -d "{
  \"log_date\": \"$DATE\",
  \"bodyweight\": 88.5,
  \"meals\": [{\"name\":\"Breakfast\",\"food_items\":[
    {\"name\":\"Eggs\",\"quantity\":4,\"unit\":\"whole\",\"calories\":280,\"protein_g\":24,\"carbs_g\":2,\"fat_g\":20}
  ]}],
  \"peds\": [{\"compound\":\"Testosterone Enanthate\",\"dose\":250,\"unit\":\"mg\",\"route\":\"injection\"}],
  \"sessions\": [{\"name\":\"Push\",\"duration_min\":62,\"exercises\":[
    {\"name\":\"Bench Press\",\"muscle_group\":\"chest\",\"sets\":[
      {\"set_number\":1,\"reps\":8,\"weight\":100,\"weight_unit\":\"kg\",\"rpe\":8}
    ]}
  ]}],
  \"notes\": [{\"content\":\"Felt strong.\"}]
}" | python3 -m json.tool

say "GET list"
curl -fsS "$BASE/api/logs" "${AUTH[@]}" | python3 -m json.tool

say "GET $DATE"
curl -fsS "$BASE/api/logs/$DATE" "${AUTH[@]}" | python3 -m json.tool

say "PUT $DATE (drop to 1 meal, bump bodyweight)"
curl -fsS -X PUT "$BASE/api/logs/$DATE" "${AUTH[@]}" -H "Content-Type: application/json" -d "{
  \"bodyweight\": 88.0,
  \"meals\": [{\"name\":\"Lunch\",\"food_items\":[
    {\"name\":\"Rice\",\"quantity\":200,\"unit\":\"g\",\"calories\":260,\"protein_g\":5,\"carbs_g\":56,\"fat_g\":1}
  ]}],
  \"peds\": [], \"sessions\": [], \"notes\": []
}" | python3 -m json.tool

say "DELETE $DATE (expect 204)"
curl -fsS -o /dev/null -w "status: %{http_code}\n" -X DELETE "$BASE/api/logs/$DATE" "${AUTH[@]}"

say "GET $DATE again (expect 404)"
curl -sS -o /dev/null -w "status: %{http_code}\n" "$BASE/api/logs/$DATE" "${AUTH[@]}"

say "All checks passed ✓"
