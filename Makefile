.PHONY: up down logs stop restart ps build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

stop:
	docker-compose stop

restart:
	docker-compose restart

ps:
	docker-compose ps

build:
	docker-compose build --no-cache

clean:
	docker-compose down -v

help:
	@echo "Comandos disponibles:"
	@echo "  make up       - Levantar servicios"
	@echo "  make down     - Detener y eliminar contenedores"
	@echo "  make logs     - Ver logs en tiempo real"
	@echo "  make stop     - Pausar servicios"
	@echo "  make restart  - Reiniciar servicios"
	@echo "  make ps       - Ver estado de contenedores"
	@echo "  make build    - Reconstruir imágenes"
	@echo "  make clean    - Eliminar todo (incluyendo volúmenes)"
