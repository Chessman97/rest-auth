import * as express from 'express';
import { getMongoManager, getMongoRepository, MongoRepository } from 'typeorm';
import * as uuidv1 from 'uuid/v1';

import { IPingResult, ping } from '@network-utils/tcp-ping';

import { Token } from '../models/Token';
import { User } from '../models/User';

export class UserService {

    async userSignin(user: User): Promise<string> {
        //Создаем Mongo repository
        const repo = getMongoRepository(User);
        //Ищем введенный логин и пароль в БД
        let userEmail = await repo.findOne({ email: user.email, password: user.password });

        if (userEmail) {
            //Создаем токен
            userEmail = await this.setToken(userEmail);
            //Обновляем токены в базе
            repo.save(userEmail);
            return userEmail.token.accessToken;
        }
        return process.env.USER_SERVICE_RESPONSE;
    }

    async userSignup(newUser: User): Promise<string> {
        //Создаем Mongo repository
        const repo = getMongoRepository(User);
        //Проверяем на совпадение email (Чтобы небыло 2 пользователя с одним email)
        const userRepeat = await repo.findOne({ email: newUser.email });

        if (!userRepeat) {
            //Создаем токен
            newUser = await this.setToken(newUser);
            //Добавляем в базу
            const addUser = getMongoManager();
            await addUser.save(newUser);
            return newUser.token.accessToken;
        }
        else {
            return process.env.USER_SERVICE_RESPONSE;
        }
    }

    async getUserInfo(req: express.Request): Promise<User> {
        //Создаем Mongo repository
        const repository = getMongoRepository(User);
        //Поиск по текущему токену
        const user = await this.findUser(req, repository);
        return user;
    }

    private async findUser(req: express.Request, repository: MongoRepository<User>): Promise<User> {
        if (req.get(process.env.HEADER_AUTH)) {
            //Получаем токен
            const token = req.get(process.env.HEADER_AUTH).split(' ', 2);
            //Получаем пользователей из базы (это вообще хреново), тут короче трабла возникла из-за Mongo. В обычной базе тупо брал бы по Токенам сразу выборку, а не по Юзерам
            const usersAll = await repository.find();
            //Ищем пользователя
            for (let i = 0; i < usersAll.length; i++) {
                if (usersAll[i].token.accessToken.toString() === token[1]) {
                    return usersAll[i];
                }
            }
        }
    }

    getLatency(): Promise<IPingResult> {

        function update(progress: number, total: number): void {
            console.log(progress, '/', total);
        }

        //Метод такой-себе если честно, для ознакомления думаю покатит:)
        const latency = ping({
            address: process.env.PING_ADRESS,
            attempts: Number(process.env.PING_ATTEMPTS),
            port: Number(process.env.PING_PORT),
            timeout: Number(process.env.PING_TIMEOUT)
        }, update).then(result => {
            console.log('ping result:', result);
            return result;
        })

        return latency;
    }

    async userLogout(all: boolean, req: express.Request): Promise<void> {
        //Создаем Mongo repository
        const repository = getMongoRepository(User);
        //Поиск по текущему токену
        const user = await this.findUser(req, repository);

        if (all) {
            //Если true удаляем(заменяем пустыми, что тоже так себе. Опять же тупо с Mongo не очень удобно работать, так проще всего было. Так метод Update юзал) все токены
            user.token.accessToken = process.env.GET_LOGOUT_TOKEN;
            user.token.refreshToken = process.env.GET_LOGOUT_TOKEN;
            //Сохраняем изменения
            repository.save(user);
        }
        else {
            //Если false удаляем только текущий
            user.token.accessToken = process.env.GET_LOGOUT_TOKEN;
            //Сохраняем изменения
            repository.save(user);
        }
    }
    //Для пользователя задаем новые токены и время жизни
    private setToken(user: User): User {
        //Записываем токены в сущность
        user.token = new Token();
        user.token.accessToken = uuidv1();
        user.token.refreshToken = uuidv1();
        user.token.timeKill = Date.now() + Number(process.env.TO_SECONDS) * Number(process.env.TO_MINUTES);

        return user;
    }
}