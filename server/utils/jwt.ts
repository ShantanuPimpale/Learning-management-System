require("dotenv").config();
import { Request,Response,NextFunction } from "express";
import {IUser} from "../models/user_models";
import {redis} from "./redis";

interface ITokenOptions{
    expires:Date;
    maxAge:number;
    httpOnly:boolean;
    sameSite:'lax'|'strict'|'none'|undefined;
    secure?:boolean;
}
export const sendToken=(user:IUser,statusCode:number,res:Response)=>{
    const accessToken=user.SignAccessToken();
    const refreshToken=user.SignRefreshToken();
    //upload session to redis
    redis.set(user._id,JSON.stringify(user) as any);

    //parse environment variables to integrate with fallback values
    const accessTokenExpire=parseInt(process.env.ACCESS_TOKEN_EXPIRE||"300",10)
    const refreshTokenExpire=parseInt(process.env.REFRESH_TOKEN_EXPIRE||"1200",10)
    //options for cookies
    const accessTokenOptions:ITokenOptions={
        expires:new Date(Date.now()+accessTokenExpire*1000),
        maxAge:accessTokenExpire*1000,
        httpOnly:true,
        sameSite:"lax",
    }
    const refreshTokenOptions:ITokenOptions={
        expires:new Date(Date.now()+refreshTokenExpire*1000),
        maxAge:refreshTokenExpire*1000,
        httpOnly:true,
        sameSite:"lax",
    }
    //only set secure to true production
    if(process.env.NODE_ENV==='production'){
        accessTokenOptions.secure==true;
    }
    res.cookie("access_token",accessToken,accessTokenOptions);
    res.cookie("refresh_token",refreshToken,refreshTokenOptions);

    res.status(statusCode).json({
        success:true,
        user,
        accessToken,
    })
}