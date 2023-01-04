# Фронтенд для игры "Где логика?"

## Установка из исходников

### 1. Установить зависимости:
`yarn`

### 2. Сборка
- #### В прод: `yarn dist`
- #### Для разработки: `yarn dev`

## Установка и запуск через Docker

### Сборка из исходников
```
make build
```

### Загрузка из Docker Container Registry
```
docker login git.sberrobots.ru:8443
make pull
```

### Запуск
```
make run
```
Страница будет доступна по адресу `https://localhost:8000`

### Остановка
```
make stop
```
