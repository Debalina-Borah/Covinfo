const express = require('express')
const router = express.Router()
const User=require('../models/User')
const fs = require('fs')
const path = require('path')
const { v4 } = require('uuid');
// const mkdirp=require('mkdirp')
//const upload= require('../controllers/authControllers')

//uploading files with multer
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log("in multer",file)
        if(file.fieldname!=='profilePic'){
        const name="student"
        // console.log('disease name',name)
        //console.log('field',file.fieldname)
        
        const dname= name.toLowerCase()
        const userEmail = req.user.email.toLowerCase()
        var dir = `./public/uploads/${userEmail}/${dname}/${file.fieldname}`
        
        
        }else{
            const userEmail = req.user.email.toLowerCase()
            var dir = `./public/uploads/${userEmail}/${file.fieldname}`
            // console.log("dir:",dir)
        }
        if (!fs.existsSync(dir)) {
            //console.log("making files")
            fs.mkdirSync(dir, { recursive: true }, (err) => {
                if (err) console.error('New Directory Creation Error');
            })
        }
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        // const userId = req.user._id

       // fileName= path.join(`${file.fieldname}`,`File-${v4()}-${file.originalname}-${path.extname(file.originalname)}`)
        //console.log(fileName)
        if(file.fieldname==='profilePic'){
        const user=req.user
        user.profilePic=`ProfilePic_${file.originalname}`
        cb(null,`ProfilePic_${file.originalname}` )
        }else{
            const temp=`File-${v4()}-${file.originalname}`
            if(file.fieldname==='document'){
                console.log('temp Document',temp)
                User.findOneAndUpdate({_id: req.user._id}, {$set:{ documentName:temp}}, {new: true}, (err, doc) => {
                    if (err) {
                        console.log("Something wrong when updating data!");
                        req.flash("error_msg", "Something wrong when updating data!")
                        res.redirect('/hospital/profile')
                    }
                      // console.log(doc);
                });
            }
            
        else if(file.fieldname==='medicine'){
            console.log('temp profile',temp)
        User.findOneAndUpdate({_id: req.user._id}, {$set:{ scholarName:temp}}, {new: true}, (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
                req.flash("error_msg", "Something wrong when updating data!")
                res.redirect('/hospital/profile')
            }
              // console.log(doc);
        });
    }
    cb(null, temp)
    }
    },
})

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 6000000 },
    fileFilter: function (req, file, cb) {
        if(file.fieldname==='profilePic'){
        checkFileType1(file, cb)
        }else{
        checkFileType(file, cb)
        }
    },
})
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)
    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(null,false)
    }
}
function checkFileType1(file, cb) {
    const filetypes = /jpeg|jpg|png/
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)
    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(null,false)
        // req.flash("error_msg", "Enter a valid picture of format jpeg jpg png") 
    }
}

//uploading finishes
const authController = require('../controllers/authControllers')
const { requireAuth, redirectIfLoggedIn } = require('../middleware/userAuth')
router.get('/verify/:id', authController.emailVerify_get)
router.get('/signup',redirectIfLoggedIn, authController.signup_get)
router.post('/signup', authController.signup_post)
router.post('/login', authController.login_post)
router.get('/logout', requireAuth, authController.logout_get)
router.get('/profile', requireAuth, authController.profile_get)
router.post('/profile/editDetails',requireAuth,authController.editDetails_post)
router.post('/data/:id',requireAuth,authController.data_post)

router.post(
    '/profile/upload',
    requireAuth,
    upload.fields([{
        name: 'medicine', maxCount: 1
      }, {
        name: 'document', maxCount: 1
      }]),  
    authController.upload_post
)


router.get('/userHospital',requireAuth,authController.userHospital_get)

router.get('/disease',requireAuth,authController.disease_get)
router.get('/hospitalSearch',requireAuth,authController.hospitalSearch_get)
router.post('/hospitalSearch',requireAuth,authController.hospitalSearch_post)
router.get('/forgotPassword', redirectIfLoggedIn,authController.getForgotPasswordForm)
router.post('/forgotPassword', redirectIfLoggedIn,authController.forgotPassword)
router.get('/resetPassword/:id/:token',authController.getPasswordResetForm)
router.post('/resetPassword/:id/:token',authController.resetPassword)
router.get('/download/:type/pdf',requireAuth,authController.download)
router.post(
    '/profile/picupload',
    requireAuth,
    upload.single(
            'profilePic',
      ),  
    authController.picupload_post
)
module.exports = router