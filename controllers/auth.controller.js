const express = require('express');
const userModel = require('../models/auth.model');
const jwt = require('jsonwebtoken');
const Mailer = require('../helper/mailer');

class AuthController {
    async register(req, res) {
        try {
            let {name, email, phone, address, password} = req.body;
            // Validation
            if(!name || !email || !password || !phone || !address){
                return res.status(400).json({
                    status: 400,
                    message: "Please provide the details. Its a required field",
                    data: {}
                });
            }
            // Check if email already exists
            let isEmailExist = await userModel.find({email});
            if(isEmailExist.length > 0){
                return res.json({
                    status: 400,
                    message: "Email already exists",
                    data: {}
                });
            }
            //profileImage
            let profileImage = "";
            if(req.file){
                profileImage = req.file.filename;
            }
            req.body.profileImage = profileImage;
            // Hash password
            password = await new userModel().generateHash(password);
            // Generate OTP
            let otp = Math.floor(100000 + Math.random() * 900000);
            // Create user
            let user = await userModel.create({name, email, password, phone, address, profileImage, otp});
            // Send email

            if (user) {
            
                const mailer = new Mailer('Gmail', process.env.APP_EMAIL, process.env.APP_PASSWORD);
            
                let mailObj = {
                    to: req.body.email,
                    subject: "Registration Confirmation",
                    text: `You have successfully registered with us using the email ${req.body.email}. Your OTP for verification is ${otp}. Thank you!`
                };
            
                mailer.sendMail(mailObj);
            }
            let userWithoutSensitiveData = await userModel.findById(user).select("-password -createdAt -updatedAt -__v -isDeleted -_id -otp");
            return res.json({
                status: 201,
                message: "User registered successfully",
                data: userWithoutSensitiveData
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async login(req, res) {
        try {
            let { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: 400,
                    message: "Please provide the details. Its a required field",
                    data: {}
                });
            }
        
            let user = await userModel.find({ email });
            if (user.length > 0) {
                // Check if the user has an OTP (not verified)
                if (user[0].otp) {
                    return res.json({
                        status: 400,
                        message: "User is not verified. Please verify your email using the OTP sent to your email.",
                        data: {}
                    });
                }
                 // Compare password
                let isPasswordMatch = await userModel().validatePassword(password, user[0].password);
                if (isPasswordMatch) {
                    let userdata = user[0];
                    const payload = {
                        id: userdata._id,
                    };
                    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
                    req.user = userdata;
                    let userWithoutSensitiveData = await userModel.findById(userdata._id).select("-password -createdAt -updatedAt -__v -isDeleted -_id -otp");
                    return res.json({
                        status: 200,
                        message: "User logged in successfully",
                        data: userWithoutSensitiveData,
                        token: token
                    });
                } else {
                    return res.json({
                        status: 400,
                        message: "Invalid Credentials",
                        data: {}
                    });
                }
            } else {
                return res.json({
                    status: 400,
                    message: "Authentication failed",
                    data: {}
                });
            }
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async verifyEmail(req, res) {
        try{
            let {email, otp} = req.body;
            let user = await userModel.find({email});
            if(user.length > 0){
                // Check if the user has an OTP
                if(user[0].otp == otp){
                    await userModel.updateOne({email}, {otp: null});
                    return res.json({
                        status: 200,
                        message: "Email verified successfully",
                        data: {}
                    });
                }else{
                    return res.json({
                        status: 400,
                        message: "Invalid OTP",
                        data: {}
                    });
                }
            }else{
                return res.json({
                    status: 400,
                    message: "User not found",  
                });
            }
        }catch(error){
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async profile(req, res) {
        try{
            let user = req.user;
            let userWithoutSensitiveData = await userModel.findById(user._id).select("-password -createdAt -updatedAt -__v -isDeleted -_id -otp");
            return res.json({
                status: 200,
                message: "User found successfully",
                data: userWithoutSensitiveData
            });
        }catch(error){
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
    async updateProfile(req, res) {
        try{
            let user = req.user;
            let {name, email, phone, address, profileImage} = req.body;
            let updatedUser = await userModel.updateOne({ _id: user._id }, { $set: { name, email, phone, address, profileImage } });
            let userWithoutSensitiveData = await userModel.findById(user._id).select("-password -createdAt -updatedAt -__v -isDeleted -_id -otp");
            return res.json({
                status: 200,
                message: "User updated successfully",
                data: userWithoutSensitiveData
            });
        } catch (error) {
            return res.json({
                status: 500,
                message: error.message,
                data: {}
            });
        }
    }
}

module.exports = new AuthController();