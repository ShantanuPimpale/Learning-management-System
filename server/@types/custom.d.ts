import {Request} from 'express'
import {IUser} from '../models/user_models'
declare global{
    namespace Express{
        interface Request{
            user?:IUser
        }
    }    
}