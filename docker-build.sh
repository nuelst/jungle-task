#!/bin/bash

# Script para build do Docker com fallbacks para problemas de rede
# Uso: ./docker-build.sh [service] ou ./docker-build.sh all

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para build de um serviço específico
build_service() {
    local service=$1
    log "Building $service..."
    
    # Tenta build normal primeiro
    if docker compose build $service; then
        log "$service built successfully!"
        return 0
    else
        warn "Normal build failed for $service, trying with no cache..."
        
        # Tenta com --no-cache
        if docker compose build --no-cache $service; then
            log "$service built successfully with --no-cache!"
            return 0
        else
            error "Failed to build $service even with --no-cache"
            return 1
        fi
    fi
}

# Função para build de todos os serviços
build_all() {
    log "Building all services..."
    
    # Lista de serviços
    services=("web" "api-gateway" "auth-service" "tasks-service" "notifications-service")
    
    # Build sequencial para evitar problemas de memória
    for service in "${services[@]}"; do
        if ! build_service $service; then
            error "Failed to build $service, stopping build process"
            exit 1
        fi
    done
    
    log "All services built successfully!"
}

# Função para limpar cache do Docker
clean_docker() {
    log "Cleaning Docker cache..."
    docker system prune -f
    docker builder prune -f
}

# Função para mostrar ajuda
show_help() {
    echo "Usage: $0 [OPTIONS] [SERVICE]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -c, --clean    Clean Docker cache before building"
    echo "  -a, --all      Build all services"
    echo ""
    echo "Services:"
    echo "  web, api-gateway, auth-service, tasks-service, notifications-service"
    echo ""
    echo "Examples:"
    echo "  $0 web                    # Build only web service"
    echo "  $0 --all                  # Build all services"
    echo "  $0 --clean --all          # Clean cache and build all services"
}

# Parse arguments
CLEAN=false
SERVICE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -a|--all)
            SERVICE="all"
            shift
            ;;
        web|api-gateway|auth-service|tasks-service|notifications-service)
            SERVICE=$1
            shift
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Se não especificou serviço, build todos
if [ -z "$SERVICE" ]; then
    SERVICE="all"
fi

# Limpar cache se solicitado
if [ "$CLEAN" = true ]; then
    clean_docker
fi

# Executar build
if [ "$SERVICE" = "all" ]; then
    build_all
else
    build_service $SERVICE
fi

log "Build completed successfully!"
