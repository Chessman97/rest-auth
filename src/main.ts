import 'reflect-metadata';

import * as dotenv from 'dotenv';
import { createExpressServer } from 'routing-controllers';
import { createConnection } from 'typeorm';

import { authorizationChecker } from './auth/authorizationChecker';
import { UserController } from './controllers/UserController';
import { User } from './models/User';

dotenv.config();

//Подключение БД
createConnection({
   type: 'mongodb',
   host: process.env.DB_HOST,
   database: process.env.DB_NAME_DATABASE,
   entities: [
      User
   ],
   synchronize: true,
   logging: false
}).catch(error => console.log(error));

//Создаем приложение Express
const app = createExpressServer({
   //Префикс
   routePrefix: process.env.SERVER_PREFIX,
   //Инициализируем ошибки
   defaults: {
      nullResultCode: Number(process.env.ERROR_NULL_RESULT_CODE),
      undefinedResultCode: Number(process.env.ERROR_NULL_UNDEFINED_RESULT_CODE),
      paramOptions: {
         required: true
      }
   },
   //Проверка авторизации пользователя
   authorizationChecker: authorizationChecker,
   cors: {
      'origin': process.env.CORS_ORIGIN,
      'methods': process.env.CORS_METHODS,
      'preflightContinue': false,
      'optionsSuccessStatus': process.env.CORS_OPTIONS_SUCCESS_STATUS
   },
   //Контроллер
   controllers: [UserController]
});
//Запуск приложения
app.listen(process.env.SERVER_PORT, () => {
   console.log(process.env.SERVER_MASSAGE);
});
