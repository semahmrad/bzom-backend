import bcrypt from "bcryptjs";
import { Router } from "express";
import User from "../schema/user.js";
import passport from "passport";
import fs from "file-system";
const { readFileSync, statSync } = fs;
import multer from "multer";
import {
    compressImg,
    deleteImageFromServer,
    galleryToBase64,
    SendVerifyEmail,
} from "../functions/user.functions.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            new Date().toString().replace(/:/g, "_") +
                "_" +
                file.originalname +
                (Math.random() + 1).toString(36).substring(7) +
                ".jpg"
        );
    },
});
const filefilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter: filefilter,
    limits: 5 * 1024 * 1024,
});

//init the router

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.post("/jwtTest", (req, res) => {
    res.send("just test the route");
});

router.post("/add", (req, res) => {
    const user = new User({
        username: "username",
        password: "password",
    });

    user.save();
    res.send("hi");
});
router.post("/verify/account", async (req, res) => {
    try {
        let userId = req.user.id;
        let secretCode = req.body.secretCode;

        await User.findOne({
            _id: userId,
        })
            .then((userFinded) => {
                if (secretCode == userFinded.secretCode) {
                    User.updateOne({ _id: userId }, { isVerified: true })
                        .then((verify) => {
                            res.json({
                                code: 200,
                                msg: "isverify",
                            });
                        })
                        .catch((err) => {
                            res.json({
                                code: 501,
                                msg: "problem in verification ur account !!",
                            });
                        });
                } else {
                    res.json({
                        code: 400,
                        msg: "not verify",
                    });
                }
            })
            .catch((err) => {
                res.json({
                    code: 500,
                    msg: JSON.stringify(err.message),
                });
            });
    } catch (err) {
        res.send("err", err);
    }
});

router.post("/add/picture/", upload.single("newPic"), async (req, res) => {
    try {
        if (req.file) {
            let imgData = fs.readFileSync(req.file.path);
            //imgDesc = req.body.textPic;
            let stats = fs.statSync(req.file.path);
            let imgSizeInBytes = stats.size / (1024 * 1024);

            if (imgData && stats && imgSizeInBytes) {
                if (imgSizeInBytes > 100) {
                    res.json({
                        code: 400,
                        msg: "image too big",
                    });
                    deleteImageFromServer(req.file);
                } else {
                    await User.findById(req.user.id)
                        .then(async (user) => {
                            console.log("then");
                            console.log(user.gallery.length);
                            if (user.gallery.length < 100) {
                                let minibuffer = await compressImg(imgData);
                                let newImgData = {
                                    image: minibuffer,
                                    update: new Date(),
                                };

                                user.gallery.push(newImgData);
                                user.save()
                                    .then(() => {
                                        res.json({
                                            code: 200,
                                            msg: "image uploaded",
                                        });
                                    })
                                    .catch((err) =>
                                        res.json({
                                            code: 400,
                                            msg: "problem to add image",
                                        })
                                    );
                            } else
                                res.json({
                                    code: 500,
                                    msg: "you can not upload anymore images",
                                });
                            deleteImageFromServer(req.file);
                        })
                        .catch((err) => {
                            res.json({ code: 501, msg: err.message });
                            deleteImageFromServer(req.file);
                        });
                }
            } else {
                res.json({ code: 401, msg: "problem ...!!" });
            }
        }
    } catch (err) {
        res.json({ msg: err });
    }
});

router.post("/gallery", async (req, res) => {
    try {
        let userId = req.user.id;
        await User.findOne({ userId })
            .then((user) => {
                res.json({
                    code: 200,
                    msg: "user find",
                    gallery: galleryToBase64(user.gallery),
                });
            })
            .catch((err) => {
                res.json({ code: 401, msg: err });
            });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});

router.post("/remove/picture", async (req, res) => {
    try {
        let userId = req.user.id;
        let picId = req.body.imageId;
        console.log("===>", picId);
        await User.findById(userId).then((user) => {
            let picIndex = user.gallery.findIndex((item) => item._id == picId);
            if (picIndex != -1) {
                user.gallery.splice(picIndex, 1);
                user.save()
                    .then(() => {
                        res.json({
                            code: 200,
                            msg: "image deleted",
                        });
                    })
                    .catch((err) => res.send(err));
            } else {
                res.json({
                    code: 404,
                    msg: "image not found",
                });
            }
        });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});

router.post("/change/profile/picture", async (req, res) => {
    try {
        let userId = req.user.id;
        let imageId = req.body.imageId;
        await User.findById(userId)
            .then((user) => {
                let image = user.gallery.filter((image) => image.id == imageId);
                if (image.length == 0) {
                    res.json({
                        code: 402,
                        msg: "image not found",
                    });
                } else {
                    console.log(image[0].id);
                    user.profilePic = image[0].image;
                    user.save()
                        .then((user) => {
                            res.json({
                                code: 200,
                                msg: "changed success",
                                profilePic: image[0].image.toString("base64"),
                            });
                        })
                        .catch((err) => {
                            res.json({
                                code: 500,
                                msg: err,
                            });
                        });
                }
            })
            .catch((err) => {
                res.json({
                    code: 404,
                    msg: "can t find user",
                });
            });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});

export default router;
