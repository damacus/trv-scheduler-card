#!/usr/bin/env fish

# TRV Scheduler deploy/test helper for Home Assistant on Kubernetes
# Defaults:
# - namespace: home-automation
# - deployment: home-assistant
#
# Usage:
#   fish TEST.fish
#   fish TEST.fish --with-appdaemon
#   fish TEST.fish --skip-restart
#
# MCP behavior:
# - Requires Codex MCP server named: k8s
# - If K8S_MCP_QUERY_CMD is set, it must print JSON:
#   {"deployment":"...","pod":"...","container":"..."}

set -l NS home-automation
set -l DEPLOYMENT home-assistant
set -l HA_CONFIG_DIR /config
set -l WITH_APPDAEMON 0
set -l SKIP_RESTART 0
set -l MCP_SERVER_NAME k8s

for arg in $argv
    switch $arg
        case --with-appdaemon
            set WITH_APPDAEMON 1
        case --skip-restart
            set SKIP_RESTART 1
        case '*'
            echo "Unknown option: $arg"
            echo "Valid options: --with-appdaemon --skip-restart"
            exit 1
    end
end

for f in trv-heating-scheduler-card.js trv-heating-scheduler-card-editor.js
    if not test -f $f
        echo "Missing required file: $f"
        exit 1
    end
end

if test $WITH_APPDAEMON -eq 1
    if not test -f trv_scheduler.py
        echo "Missing required file: trv_scheduler.py"
        exit 1
    end
end

for bin in kubectl codex jq
    if not command -sq $bin
        echo "Required command not found: $bin"
        exit 1
    end
end

echo "Checking MCP server config ($MCP_SERVER_NAME) ..."
codex mcp get $MCP_SERVER_NAME >/dev/null 2>/dev/null
or begin
    echo "MCP server '$MCP_SERVER_NAME' is not configured."
    echo "Run: codex mcp add $MCP_SERVER_NAME -- npx -y mcp-server-kubernetes"
    exit 1
end

echo "Resolving deployment/pod/container through MCP ..."
set -l TARGET_JSON ""

if set -q K8S_MCP_QUERY_CMD
    set TARGET_JSON (eval $K8S_MCP_QUERY_CMD 2>/dev/null)
else
    set -l SCHEMA_FILE (mktemp /tmp/trv-k8s-schema.XXXXXX.json)
    set -l OUT_FILE (mktemp /tmp/trv-k8s-out.XXXXXX.json)

    printf '%s\n' \
        '{' \
        '  "$schema": "http://json-schema.org/draft-07/schema#",' \
        '  "type": "object",' \
        '  "properties": {' \
        '    "deployment": { "type": "string" },' \
        '    "pod": { "type": "string" },' \
        '    "container": { "type": "string" }' \
        '  },' \
        '  "required": ["deployment", "pod", "container"],' \
        '  "additionalProperties": false' \
        '}' > $SCHEMA_FILE

    set -l PROMPT "Use the configured MCP server named '$MCP_SERVER_NAME' only. Query Kubernetes namespace '$NS'. Find deployment '$DEPLOYMENT'. Return JSON with keys deployment, pod, container where pod is one running pod for that deployment and container is a container name from that pod."

    codex exec \
        --skip-git-repo-check \
        --sandbox read-only \
        --output-schema $SCHEMA_FILE \
        -o $OUT_FILE \
        "$PROMPT" >/dev/null
    or begin
        rm -f $SCHEMA_FILE $OUT_FILE
        echo "MCP query failed. If needed, set K8S_MCP_QUERY_CMD to your own MCP query command."
        exit 1
    end

    set TARGET_JSON (cat $OUT_FILE)
    rm -f $SCHEMA_FILE $OUT_FILE
end

if test -z "$TARGET_JSON"
    echo "MCP returned empty output."
    exit 1
end

set -l MCP_DEPLOYMENT (printf '%s' "$TARGET_JSON" | jq -r '.deployment // empty')
set -l POD (printf '%s' "$TARGET_JSON" | jq -r '.pod // empty')
set -l CONTAINER (printf '%s' "$TARGET_JSON" | jq -r '.container // empty')

if test -z "$MCP_DEPLOYMENT" -o -z "$POD" -o -z "$CONTAINER"
    echo "MCP output is missing required fields."
    echo "$TARGET_JSON"
    exit 1
end

if test "$MCP_DEPLOYMENT" != "$DEPLOYMENT"
    echo "MCP resolved deployment '$MCP_DEPLOYMENT' but expected '$DEPLOYMENT'."
    exit 1
end

# Confirm MCP-resolved targets are still valid before copy/exec operations.
kubectl get deployment $DEPLOYMENT -n $NS >/dev/null
or begin
    echo "Deployment not found: $DEPLOYMENT in namespace $NS"
    exit 1
end
kubectl get pod $POD -n $NS >/dev/null
or begin
    echo "Pod not found: $POD in namespace $NS"
    exit 1
end

echo "Using pod: $POD"
echo "Using container: $CONTAINER"

echo "Ensuring target directories ..."
kubectl exec -n $NS $POD -c $CONTAINER -- mkdir -p $HA_CONFIG_DIR/www/trv-scheduler
or exit 1

echo "Uploading Lovelace card files ..."
kubectl cp ./trv-heating-scheduler-card.js "$NS/$POD:$HA_CONFIG_DIR/www/trv-scheduler/trv-heating-scheduler-card.js" -c $CONTAINER
or exit 1
kubectl cp ./trv-heating-scheduler-card-editor.js "$NS/$POD:$HA_CONFIG_DIR/www/trv-scheduler/trv-heating-scheduler-card-editor.js" -c $CONTAINER
or exit 1

if test $WITH_APPDAEMON -eq 1
    echo "Uploading AppDaemon app ..."
    kubectl exec -n $NS $POD -c $CONTAINER -- mkdir -p $HA_CONFIG_DIR/appdaemon/apps
    or exit 1
    kubectl cp ./trv_scheduler.py "$NS/$POD:$HA_CONFIG_DIR/appdaemon/apps/trv_scheduler.py" -c $CONTAINER
    or exit 1
end

if test $SKIP_RESTART -eq 0
    echo "Restarting deployment/$DEPLOYMENT ..."
    kubectl rollout restart deployment/$DEPLOYMENT -n $NS
    or exit 1
    kubectl rollout status deployment/$DEPLOYMENT -n $NS
    or exit 1
else
    echo "Skipping restart (--skip-restart set)."
end

echo ""
echo "Deploy complete."
echo ""
echo "In Home Assistant -> Settings -> Dashboards -> Resources, ensure both exist as JavaScript Module:"
echo "  /local/trv-scheduler/trv-heating-scheduler-card.js"
echo "  /local/trv-scheduler/trv-heating-scheduler-card-editor.js"
echo ""
echo "Then hard refresh browser."
