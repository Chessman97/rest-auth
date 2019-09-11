
REST API. Авторизация по bearer токену (/info, /latency, /logout). Настроенный CORS для доступа с любого домена. DB — MongoDB. Токен создавать при каждом заходе.

Описание API:

    /signin [POST] — запрос bearer токена по id и паролю // данные принимает в json: "email" = "1@example.com", "password" = "password"
    /signup [POST] — регистрация нового пользователя: // данные принимает в json: "email" = "1@example.com", "password" = "password"
    /info [GET] — возвращает id пользователя и тип id, требует выданный bearer токен в аутентификации
    /latency [GET] — возвращает задержку (ping), требует выданный bearer токен в аутентификации
    /logout [GET] — с паметром all: true — удаляет все bearer токены пользователя или false — удаляет только текущий bearer токен

