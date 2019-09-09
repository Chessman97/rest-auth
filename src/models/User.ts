import { ObjectID } from 'bson';
import { IsEmail, MinLength } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

import { Token } from './Token';

//Сущность пользователь
@Entity()
export class User {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    @IsEmail()
    email: string;

    @Column({
        length: 100
    })
    @MinLength(2)
    password: string;

    @Column()
    token: Token;
}