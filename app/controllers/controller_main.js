const express = require('express')
const router = express.Router()
const axios = require('axios')
const model_user = require('../models/model_user')
const bcrypt = require('bcrypt')
const salt = bcrypt.genSaltSync(10);
const module_credential = require('../module/credential')
const sendMail = require('../module/mailer');
const model_tr_login = require('../models/model_tr_login');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("1030264029942-qa9d5psmin15r4lddat1gvuvet9rlfeg.apps.googleusercontent.com");

router.get('/', function(req, res){
    res.send('Hello World')
})

router.post('/login', async function(req, res){
    try {
        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        if(!req.body.password){
            return res.status(400).json({
                error: 1,
                message: "Password Required"
            })
        }

        var email = req.body.email
        var password = req.body.password
        var [getUser, errGet] = await model_user.getByEmail(email)
        if(getUser.length > 0){
            var compare = bcrypt.compareSync(password, getUser[0].password)
            if(compare){
                var [insetTr, errInsert] = await model_tr_login.insertTr(email)
                var access_token = module_credential.generateAccessToken({
                    app_user: email
                })
            
                return res.status(200).json({
                    error: 0,
                    message: "Login Success",
                    email: email,
                    token: access_token
                })
            } else {
                return res.status(400).json({
                    error: 1,
                    message: "Wrong Password"
                })
            }
        } else {
            return res.status(400).json({
                error: 1,
                message: "User Not Found"
            })
        }     
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/login_google', async function(req, res){
    try {
        const idToken = req.body.idToken
        const ticket = await client.verifyIdToken({
            idToken,
            audience: "1030264029942-qa9d5psmin15r4lddat1gvuvet9rlfeg.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        var username = payload.name
        var email = payload.email

        var[getUser, errGet] = await model_user.getByEmail(email)
        if(errGet){
            return res.status(400).json({
                error: 1,
                message: "Failed to Get"
            })
        }
        if(getUser.length > 0){
            var [insetTr, errInsert] = await model_tr_login.insertTr(email)
            var access_token = module_credential.generateAccessToken({
                app_user: email
            })
            return res.status(200).json({
                error: 0,
                message: "Login Success",
                email: email,
                token: access_token
            })
        } else {
            var data = {
                username: username,
                email: email,
                password: null,
                is_verified_email: 1
            }
            var [insertUser, errInsert] = await model_user.insertUser(data)
            if(errInsert){
                return res.status(400).json({
                    error: 1,
                    message: "Failed to Insert"
                })
            } else {
                var [insetTr, errInsert] = await model_tr_login.insertTr(email)
                var access_token = module_credential.generateAccessToken({
                    app_user: email
                })
                return res.status(200).json({
                    error: 0,
                    message: "Login Success",
                    email: email,
                    token: access_token
                })
            }
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/login_facebook', async function(req, res){
    try {
        const accessToken = req.body.accessToken
        const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`);
        const { id, name, email } = response.data;

        var[getUser, errGet] = await model_user.getByEmail(email)
        if(errGet){
            return res.status(400).json({
                error: 1,
                message: "Failed to Get"
            })
        }
        if(getUser.length > 0){
            var [insetTr, errInsert] = await model_tr_login.insertTr(email)
            var access_token = module_credential.generateAccessToken({
                app_user: email
            })
            return res.status(200).json({
                error: 0,
                message: "Login Success",
                email: email,
                token: access_token
            })
        } else {
            var data = {
                username: name,
                email: email,
                password: null,
                is_verified_email: 1
            }
            var [insertUser, errInsert] = await model_user.insertUser(data)
            if(errInsert){
                return res.status(400).json({
                    error: 1,
                    message: "Failed to Insert"
                })
            } else {
                var [insetTr, errInsert] = await model_tr_login.insertTr(email)
                var access_token = module_credential.generateAccessToken({
                    app_user: email
                })
                return res.status(200).json({
                    error: 0,
                    message: "Login Success",
                    email: email,
                    token: access_token
                })
            }
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/register', async function(req, res){
    try {
        if(!req.body.username){
            return res.status(400).json({
                error: 1,
                message: "Username Required"
            })
        }

        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        if(!req.body.password){
            return res.status(400).json({
                error: 1,
                message: "Password Required"
            })
        }

        var username = req.body.username
        var email = req.body.email
        var password = req.body.password
        var[getUser, errGet] = await model_user.getByEmail(email)
        if(errGet){
            return res.status(400).json({
                error: 1,
                message: "Failed to Get"
            })
        }

        if(getUser.lentgh == 0){
            var hashPassword = bcrypt.hashSync(password, salt);
            var data = {
                username: username,
                email: email,
                password: hashPassword,
                is_verified_email: 0
            }
            var [insertUser, errInsert] = await model_user.insertUser(data)

            const verificationLink = `http://localhost:5173/verify_email?email=${email}`;
            try {
                await sendMail(
                email,
                'Email Verification',
                `Please verify your email by clicking <a href="${verificationLink}">here</a>.`,
                `<p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`
                );    
            } catch (error) {
            }

            if(errInsert){
                return res.status(400).json({
                    error: 1,
                    message: "Failed to Insert"
                })
            } else {
                return res.status(200).json({
                    error: 0,
                    message: "Success to Insert"
                })
            }
        } else {
            return res.status(200).json({
                error: 0,
                message: "User already registered"
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/logout', async function(req, res){
    try {
        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        var email = req.body.email
        var [updateTr, errTr] = await model_tr_login.getLatest(email)
        if(updateTr.length > 0){
            var [update, err] = await model_tr_login.updateSignOut(updateTr[0].id_tr_login)
        }
        return res.status(200).json({
            error: 0,
            message: "Success to logout"
        })
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/resend_verify_email', async function(req, res){
    try {
        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        var email = req.body.email
        const verificationLink = `http://localhost:5173/verify_email?email=${email}`;
        try {
            await sendMail(
            email,
            'Email Verification',
            `Please verify your email by clicking <a href="${verificationLink}">here</a>.`,
            `<p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`
            );
            res.status(200).json({ 
                error: 0,
                message: 'Verification email sent.' 
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send email.' });
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/verify_email', async function(req, res){
    try {
        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        var email = req.body.email
        var [getUser, errGet] = await model_user.getByEmail(email)
        if(errGet){
            return res.status(400).json({
                error: 1,
                message: "Failed to Get"
            })
        }
        if(getUser.length > 0){
            if(getUser[0].is_email_verified){
                return res.status(200).json({
                    error: 0,
                    message: "Email already verified"
                })
            } else  {
                var [updateVerified, errUpdate] = await model_user.updateVerifiedEmail(email)
                if(errUpdate){
                    return res.status(400).json({
                        error: 1,
                        message: "Failed to update"
                    })
                } else {
                    return res.status(200).json({
                        error: 0,
                        message: "Success to verified"
                    })
                }
            }
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/getUser', async function(req, res){
    try {
        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        var email = req.body.email
        var [getUser, errGet] = await model_user.getByEmail(email)
        if(errGet){
            return res.status(400).json({
                error: 1,
                message: "Failed to Get"
            })
        } else {
            return res.status(200).json({
                error: 0,
                message: "Success to Get",
                data: getUser[0]
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/editUser', async function(req, res){
    try {
        if(!req.body.username){
            return res.status(400).json({
                error: 1,
                message: "Username Required"
            })
        }

        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        var username = req.body.username
        var email = req.body.email
        var data = {
            username: username,
            email: email
        }
        var [editUser, errEdit] = await model_user.updateUser(data)
        if(errEdit){
            return res.status(400).json({
                error: 1,
                message: "Failed to Edit"
            })
        } else {
            return res.status(200).json({
                error: 0,
                message: "Success to Edit",
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/resetPassword', async function(req, res){
    try {
        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        if(!req.body.oldPassword){
            return res.status(400).json({
                error: 1,
                message: "Old Password Required"
            })
        }

        if(!req.body.newPassword){
            return res.status(400).json({
                error: 1,
                message: "New Password Required"
            })
        }

        if(!req.body.newConfirmPassword){
            return res.status(400).json({
                error: 1,
                message: "New Confirm Password Required"
            })
        }

        var email = req.body.email
        var oldPassword = req.body.oldPassword
        var newPassword = req.body.newPassword
        var newConfirmPassword = req.body.newConfirmPassword
        var [getUser, errGet] = await model_user.getByEmail(email)
        if(getUser.length > 0){
            var compare = bcrypt.compareSync(oldPassword, getUser[0].password)
            if(compare){
                var hashPassword = bcrypt.hashSync(newPassword, salt);
                var data = {
                    email: email,
                    password: hashPassword
                }

                var [resetPassword, errReset] = await model_user.resetPassword(data)
                if(errReset){
                    return res.status(400).json({
                        error: 1,
                        message: "Failed to reset"
                    })
                } else {
                    return res.status(200).json({
                        error: 0,
                        message: "Success to reset",
                    })
                }
            } else {
                return res.status(400).json({
                    error: 1,
                    message: "Old password was wrong"
                })
            }
        } else {
            return res.status(400).json({
                error: 1,
                message: "User Not Found"
            })
        }     
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.post('/getHome', async function(req, res){
    try {
        if(!req.body.email){
            return res.status(400).json({
                error: 1,
                message: "Email Required"
            })
        }

        var email = req.body.email
        var [getUser, errGet] = await model_user.getByEmail(email)
        var data = {}
        if(errGet){
            return res.status(400).json({
                error: 1,
                message: "Failed to Get"
            })
        } else {
            //total user signup
            var [getAllUser, errGetAll] = await model_user.getCount()
            if(errGetAll){
                return res.status(400).json({
                    error: 1,
                    message: "Failed to Get"
                })
            }
            data.total_sign_up = getAllUser[0].counted

            //active today
            var [getTotalLogin, errGetTotalLogin] = await model_tr_login.getLoginToday()
            if(errGetTotalLogin){
                return res.status(400).json({
                    error: 1,
                    message: "Failed to Get"
                })
            }
            data.total_login_today = getTotalLogin[0].counted

            //average login per 7 day
            var [getAverage,errGetAverage] = await model_tr_login.getAverageLogin7Days()
            var totalUsers = getAverage.reduce((acc, row) => acc + row.active_users, 0);
            var averageUsers = getAverage.length > 0 ? totalUsers / getAverage.length : 0;
            data.averageUsers = averageUsers

            data.user_sign_up = getUser[0].created_at
            var [getCount, errGet2] = await model_tr_login.getCount(email)
            if(errGet2){
                return res.status(400).json({
                    error: 1,
                    message: "Failed to Get"
                })
            }
            data.times_logged_in = getCount[0].counted
            var [getLatest, errGet3] = await model_tr_login.getLatestData(email)
            if(errGet3){
                return res.status(400).json({
                    error: 1,
                    message: "Failed to Get"
                })
            }
            data.user_logged_out = getLatest[0].sign_out

            return res.status(200).json({
                error: 0,
                message: "Success to reset",
                data: data
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: 1,
            message: "Internal Server Error"
        })
    }
})

router.use(function(req, res){
    res.status(404).render("pages/page_404",{
        title: "404"
    })
    return
});

module.exports = router