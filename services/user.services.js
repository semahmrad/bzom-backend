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
    forLazyLoading,
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
        let secretCodeFromUser = req.body.secretCode;

        await User.find(
            {
                _id: userId,
            },
            { secretCode: 1 }
        )
            .then((respSecretCode) => {
                console.log("secretCode", respSecretCode[0].secretCode);
                console.log("secretCodeFromUser", secretCodeFromUser);

                if (secretCodeFromUser == respSecretCode[0].secretCode) {
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
                    let minibuffer = await compressImg(imgData);
                    let newImgData = {
                        image: minibuffer,
                        update: new Date(),
                    };
                    await User.updateOne(
                        { _id: req.user.id },
                        {
                            $push: {
                                gallery: {
                                    $each: [newImgData],
                                    $position: 0,
                                },
                            },
                        }
                    )
                        .then(async (resp) => {
                            res.json({
                                code: 200,
                                msg: "image aded ..",
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

router.post("/gallery/oroginal", async (req, res) => {
    try {
        let userId = req.user.id;

        await User.findOne({ _id: userId }, { gallery: 2 })
            .then((respGallery) => {
                console.log("id ,", userId);
                console.log("length", respGallery.gallery.length);
                console.log("respGallery", respGallery._id);
                res.json({
                    code: 200,
                    msg: "user find",
                    gallery: galleryToBase64(respGallery.gallery),
                });
            })
            .catch((err) => {
                res.json({ code: 401, msg: err });
            });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});

router.post("/gallery", async (req, res) => {
    try {
        let start = req.body.start;
        let step = req.body.step;
        console.log("start variable : ", start);
        console.log(
            "startPosition : ",
            start,
            "  end position :",
            start + step
        );

        let arrStartStep = [parseInt(start), parseInt(step)];
        let userId = req.user.id;

        await User.find(
            { _id: userId },
            {
                gallery: {
                    $slice: arrStartStep,
                },
            }
        )

            .then((resp) => {
                console.log("gallery : ", resp[0].gallery.length);
                for (let i = 0; i < resp[0].gallery.length; i++) {
                    console.log("a", resp[0].gallery[i]._id);
                }
                res.json({
                    code: 200,
                    msg: "ok",
                    gallery: galleryToBase64(resp[0].gallery),
                });
            })
            .catch((err) => {
                console.log("1");
                res.json({ code: 402, msg: err.message });
            });
    } catch (err) {
        console.log("2");
        res.json({ code: 500, msg: err.message });
    }
});

router.post("/remove/picture", async (req, res) => {
    try {
        let userId = req.user.id;
        let picId = req.body.imageId;

        await User.findOne({ _id: userId }, { gallery: 1 })
            .then((respGellery) => {
                /**respGellery[[shjksjk,siuhjd,iojjdio]] */
                let arrayWithOuttarget = [];
                for (let i = 0; i < respGellery.gallery.length; i++) {
                    if (respGellery.gallery[i]._id == picId) {
                        respGellery.gallery.splice(i, 1);

                        break;
                    }
                    console.log("i : ", i);
                }
                arrayWithOuttarget = respGellery.gallery;
                User.updateOne(
                    { _id: userId },
                    {
                        $set: {
                            gallery: arrayWithOuttarget,
                        },
                    },
                    { multi: true }
                )
                    .then((resp) => {
                        console.log(resp);
                        res.json({
                            code: 200,
                            msg: "image deleted ... !",
                        });
                    })
                    .catch((err) => {
                        res.json({
                            code: 402,
                            msg: err,
                        });
                    });
            })
            .catch((err) => {
                console.log(err);
                res.json({
                    code: 500,
                    msg: err.message,
                });
            });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});

router.post("/change/profile/picture", async (req, res) => {
    try {
        let userId = req.user.id;
        let imageId = req.body.imageId;
        await User.findOne(
            { _id: userId },
            { _id: 0, gallery: { $elemMatch: { _id: imageId } } }
        )
            .then((image) => {
                if (image.gallery.length > 0) {
                    User.updateOne(
                        { _id: userId },
                        {
                            $set: {
                                profilePic: image.gallery[0].image,
                            },
                        }
                    ).then((result) => {
                        console.log(result);
                        res.json({
                            code: 200,
                            msg: "profile pic updated ...",
                            profilePic:
                                image.gallery[0].image.toString("base64"),
                        });
                    });
                } else {
                    res.json({
                        code: 402,
                        msg: "can t find the image",
                    });
                }
            })
            .catch((err) => {
                res.json({
                    code: 404,
                    msg: err.message,
                });
            });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});

router.post("/update/hashtags", async (req, res) => {
    try {
        let userId = req.user.id;
        let arrayHshtags = req.body.hashtags; //array of hashtags
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    hashtags: arrayHshtags,
                },
            }
        ).then((result) => {
            console.log(result);
            if (result.matchedCount == 1 && result.acknowledged) {
                res.json({
                    code: 200,
                    msg: "hashtags updated",
                    hashtags: arrayHshtags,
                });
            }
        });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});
router.post("/get/hashtags", async (req, res) => {
    try {
        let userId = req.user.id;
        await User.findOne({ id: userId }, { hashtags: 1, _id: 0 })
            .then((hashtagsArray) => {
                res.json({
                    code: 200,
                    msg: "ok",
                    hashtags: hashtagsArray.hashtags,
                });
            })
            .catch((err) => {
                res.json({
                    code: 400,
                    msg: "problem : " + err.message,
                });
            });
    } catch (err) {
        res.json({ code: 500, msg: err.message });
    }
});
export default router;
