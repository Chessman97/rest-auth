import { Action, UnauthorizedError } from 'routing-controllers';
import { getMongoRepository } from 'typeorm';

import { User } from '../models/User';

export async function authorizationChecker(action: Action): Promise<boolean> {

    let token: string;
    if (action.request.headers.authorization) {
        //Получаем текущий токен   
        token = action.request.headers.authorization.split(" ", 2);
        const repository = getMongoRepository(User);
        const usersAll = await repository.find();

        for (let i = 0; i < usersAll.length; i++) {
            if (usersAll[i].token.accessToken.toString() === token[1]) {
                return true;
            }
        }
    }
    else {
        throw new UnauthorizedError('This user has not token.');
    }
    return false;
}