#!/usr/bin/env bash
set -euo pipefail

(cd backend && mvn spring-boot:run) & BE_PID=$!
sleep 3
(cd frontend && npm install && npm start) & FE_PID=$!

trap "kill $BE_PID $FE_PID 2>/dev/null || true" INT TERM
wait
