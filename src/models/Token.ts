import { Column, Entity } from 'typeorm';

//Сущность для токенов
@Entity()
export class Token {

    @Column()
    accessToken: string;

    @Column()
    refreshToken: string;

    @Column()
    timeKill: number;
}