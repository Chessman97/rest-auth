import * as express from 'express';
import {
    Authorized, Body, Get, Header, JsonController, NotFoundError, Post, QueryParam, Req,
    UnauthorizedError
} from 'routing-controllers';

import { IPingResult } from '@network-utils/tcp-ping';

import { User } from '../models/User';
import { UserService } from '../services/UserService';

//Декоратор для работы с JSON
@JsonController()
export class UserController {

   userService: UserService
   //Конструткор контроллера
   constructor() {
      this.userService = new UserService();
   }
   //Главная страница
   @Get('/')
   //Протестировано добавление заголовков
   @Header('Access-Control-Allow-Origin', '*')
   @Header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Access-Token')
   getStart(): string {
      return process.env.GET_MAIN_MASSAGE;
   }

   //Вход пользователя
   @Post('/signin')
   async login(@Body() user: User): Promise<string> {
      const responseSignin = await this.userService.userSignin(user);
      if (responseSignin !== process.env.USER_SERVICE_RESPONSE) {
         return responseSignin;
      }
      else {
         throw new NotFoundError(process.env.POST_SIGNIN_MASSAGE);
      }
   }

   //Регистрация пользователя
   @Post('/signup')
   async registrateUser(@Body() newUser: User): Promise<string> {
      const responseSignup = await this.userService.userSignup(newUser);
      if (responseSignup !== process.env.USER_SERVICE_RESPONSE) {
         return responseSignup;
      }
      else {
         throw new UnauthorizedError(process.env.POST_SIGNUP_MASSAGE);
      }
   }

   //Возвращает авторизированного пользователя
   @Get('/info')
   @Authorized()
   async getId(@Req() req: express.Request): Promise<User> {
      return this.userService.getUserInfo(req);
   }

   //Время задержки сервера
   @Authorized()
   @Get('/latency')
   getPing(): Promise<IPingResult> {
      return this.userService.getLatency();
   }

   @Get('/logout')
   async deleteToken(@QueryParam("all") all: boolean, @Req() req: express.Request): Promise<void> {
      this.userService.userLogout(all, req);
   }
}