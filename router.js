// khoi tao cac thu vien
var express = require('express'); // khoi chay web app express js
var router = express.Router(); // lien ket router
var admin = require('firebase-admin'); // thu vien firebase
var serviceAccount = require("./privateKey.json"); // khoi tao file ket noi server firebase
var fs = require('fs') // thu vien cho phep doc file html 
const axios = require('axios') // thu vien cho phep tao http request
const { Converter, Alarm } = require('./Alarm.js'); // import file Alarm.js vao

// server key cho firebase
var serverKey = 'key=AAAAhO2bFYw:APA91bEzd3Rmnym3ln5nrDshVka0JuCLDnPJV7lY142_0JKhGJSHVel35nC-L2NzBXsvLK_WzTYEvJCDQoHHJX_EH6ivFb8q2y4xR8AqTRbQoaWJYnQ4sosH-k-3WwNethe0jIVWwWFS';

// khoi tao firebase 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://remotealarmclock-2f98a.firebaseio.com"
});

//var token = "fZgGBrzpLBA:APA91bGr1JXwvKMqXmTu6bvfzm1LgL6VKinszgq_nO7_wyN91qCiyiljqdGc9TJHki95MIvBUFYGeLHMYg39gJl2ifS4leCmx6EtwkCc1K7dvviqVDk2EptfxD6LC5o3XIwXMDbG3XjL"

// khoi tao config gui thong bao cho client (Firebase Cloud messsaging)
let config = {
    headers: {
        'Content-Type': 'application/json', // noi dung header la json
        'Authorization': serverKey // xac thuc bang server key dc cung cap
    }
}


///////////////////////////////////////////////////////////////get list alarm full with userid
router.get('/list', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let uid = req.query.uid
    admin.firestore().collection("user").doc(uid).collection("alarms").get().then((querySnapshot) => {
        var arr = []
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());

            arr.push(doc.data())
        });

        res.end(JSON.stringify(arr))
    }).catch((error) => {
        console.log("Error getting documents: ", error);

        res.status(500).json({ error: 'something is wrong' })
        res.end()
    });


});


///////////////////////////////////////////////////////////////get a alarm with id + userid
router.get('/alarmDetail', function (req, res) {
    let uid = req.query.uid
    let aid = req.query.aid
    res.setHeader('Content-Type', 'application/json');
    admin.firestore().collection("user").doc(uid).collection("alarms").doc(aid).get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            res.end(JSON.stringify(doc.data()))
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            res.status(500).json({ error: 'khong ton tai id' })
            res.end()
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
        res.status(500).json({ error: 'something is wrong' })
        res.end()
    });


});


///////////////////////////////////////////////////////////////mapping update alarm
router.post('/update', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let data = req.body // lay data gui len tu form 
    let uid = data.uid
    let aid = data.aid
    var time = data.time.toString()  // name cua input la time <input name="time" >
    let hour = parseInt(time.substring(0, 2)) // cat chuoi lay gio
    let minute = parseInt(time.substring(3, 5))
    let title = data.title // // name cua input la title <input name="title" >
    let recurring = (data.onoffswitch == "false" ? false : true)
    let monday = (data.monday_cb == "false" ? false : true)
    let tuesday = (data.tuesday_cb == "false" ? false : true)
    let wednesday = (data.wednesday_cb == "false" ? false : true)
    let thursday = (data.thursday_cb == "false" ? false : true)
    let friday = (data.friday_cb == "false" ? false : true)
    let saturday = (data.saturday_cb == "false" ? false : true)
    let sunday = (data.sunday_cb == "false" ? false : true)

    // check exist
    admin.firestore().collection("user").doc(uid).collection("alarms").doc(aid).get().then((alarm) => {
        if (alarm.exists) {
            // console.log("Document data:", alarm.data()); // in log alarm
            // truy van device token
            var docRef = admin.firestore().collection("user").doc(uid);
            docRef.get().then((user) => {
                if (user.data().deviceToken != undefined) { // token ton tai
                    // khoi tao data gui thong bao den mobile

                    let json = {
                        "token": user.data().deviceToken,
                        "data": {
                            "alarmId": aid.toString(),
                            "type": "update",
                            "hour": hour.toString(),
                            "minute": minute.toString(),
                            "title": title
                        }
                    }

                    admin.messaging().send(json)
                        .then((response) => {
                            // Response is a message ID string.
                            console.log('Successfully sent message:', response);
                            admin.firestore().collection("user").doc(uid).collection("alarms").doc(aid).update({
                                alarmId: parseInt(aid),
                                hour: hour,
                                minute: minute,
                                started: true,
                                title: title,
                                monday: monday,
                                tuesday: tuesday,
                                wednesday: wednesday,
                                thursday: thursday,
                                friday: friday,
                                saturday: saturday,
                                sunday: sunday,
                                recurring: recurring
                            }).then(() => {
                                console.log("Document successfully updated!");
                                res.json({ alarm_id: Number(aid) })
                                res.end()
                            }).catch((error) => {
                                // The document probably doesn't exist.
                                res.status(500).json({ error: 'khong cap nhat firestore' })
                                res.end()
                            });
                        })
                        .catch((error) => {
                            console.error(error)
                            res.status(500).json({ error: 'khong the gui den mobile' })
                            res.end()
                        });
                } else { // token chua co thi khong lam gi
                    res.json({ message: "Chua lien ket mobile token" })
                    res.end()
                }
            }).catch((error) => {
                console.log("loi truy van user", error);
                res.status(500).json({ error: 'khong truy van user' })
                res.end()
            });

        } else { // neu alarm khong ton tai
            // doc.data() will be undefined in this case
            console.log("No such document!");
            res.status(404).json({ error: 'khong ton tai id' })
            res.end()
        }
    })

});

///////////////////////////////////////////////////////////////mapping cancel alarm
router.get('/cancel', function (req, res) {
    // tuong tu o tren, chuan bi data gui thong bao den mobile
    // roi cap nhat database tren firebase
    res.setHeader('Content-Type', 'application/json');
    let aid = req.query.aid
    let uid = req.query.uid

    var docRef = admin.firestore().collection("user").doc(uid);
    docRef.get().then((user) => {
        if (user.data().deviceToken != undefined) { // token ton tai
            // khoi tao data gui thong bao den mobile
            let json = {
                "token": user.data().deviceToken,
                "data": {
                    "alarmId": aid,
                    "type": "cancel"
                }
            }

            admin.firestore().collection("user").doc(uid).collection("alarms").doc(aid).get().then((doc) => {
                if (doc.exists) {
                    // console.log("Document data:", doc.data());
                    admin.messaging().send(json)
                        .then((response) => {
                            // Response is a message ID string.
                            admin.firestore().collection("user").doc(uid).collection("alarms").doc(aid).delete().then(() => {
                                console.log("Document successfully deleted!");
                                res.json({ alarm_id: Number(aid) })
                                res.end()
                            }).catch((error) => {
                                res.status(500).json({ error: ' khong the xoa firestore' })
                                res.end()
                            });
                        })
                        .catch((error) => {
                            console.error(error)
                            res.status(500).json({ error: 'khong the gui den mobile' })
                            res.end()
                        });
                } else {
                    // doc.data() will be undefined in this case
                    res.status(404).json({ error: 'khong ton tai' })
                    res.end()
                }
            })



        } else { // token chua co thi khong lam gi
            res.json({ message: "Chua lien ket mobile token" })
            res.end()
        }
    }).catch((error) => {
        console.log("loi truy van user", error);
        res.status(500).json({ error: 'khong truy van user' })
        res.end()
    });




});

////////////////////////////////////////////////////////////////mapping new alarm
router.post('/new', function (req, res) {
    // chuan bi data
    var aid = Math.floor(100000000 + Math.random() * 900000000);
    console.log(aid)
    let data = req.body
    let uid = data.uid
    console.log(uid)
    var time = data.time.toString()
    // chuan bi cac checkbox
    // recurring
    // console.log('checkbox test' + data.onoffswitch)
    // undefined thi false  , else thi true
    if (data.monday_cb == undefined) {
        console.log('undefined ----')
    }
    let recurring = (data.onoffswitch == "false" ? false : true)
    let monday = (data.monday_cb == "false" ? false : true)
    let tuesday = (data.tuesday_cb == "false" ? false : true)
    let wednesday = (data.wednesday_cb == "false" ? false : true)
    let thursday = (data.thursday_cb == "false" ? false : true)
    let friday = (data.friday_cb == "false" ? false : true)
    let saturday = (data.saturday_cb == "false" ? false : true)
    let sunday = (data.sunday_cb == "false" ? false : true)

    // khong can gui  thong bao ve user nhung checkbox

    // chi can gui len firestore cho demo

    let hour = parseInt(time.substring(0, 2))
    let minute = parseInt(time.substring(3, 5))
    let title = data.title


    var docRef = admin.firestore().collection("user").doc(uid);
    docRef.get().then((user) => {
        if (user.data().deviceToken != undefined) { // token ton tai
            // khoi tao data gui thong bao den mobile
            let json = {
                "token": user.data().deviceToken,
                "data": {
                    "alarmId": aid.toString(),
                    "type": "insert",
                    "hour": hour.toString(),
                    "minute": minute.toString(),
                    "title": title
                }
            }
            // cap nhat firestore
            admin.firestore().collection("user").doc(uid).collection("alarms").doc(aid.toString())
                .withConverter(Converter)
                .set(new Alarm(aid, hour, minute, title, true, monday, tuesday, wednesday, thursday, friday, saturday, sunday, recurring)).then(() => {
                    console.log("Document successfully written!");
                    admin.messaging().send(json)
                        .then((response) => {
                            // Response is a message ID string.
                            console.log('Successfully sent message:', response);
                            res.json({ alarm_id: Number(aid) })
                            res.end()
                        })
                        .catch((error) => {
                            console.error(error)
                            res.status(500).json({ error: 'khong the gui den mobile' })
                            res.end()
                        });

                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                    res.status(500).json({ error: 'khong the luu firestore' })
                    res.end()
                });


        } else { // token chua co thi khong lam gi
            res.json({ message: "Chua lien ket mobile token" })
            res.end()
        }
    }).catch((error) => {
        console.log("loi truy van user", error);
        res.status(500).json({ error: 'khong truy van user' })
        res.end()
    });




});

////////////////////////////////////////////////////////////////mapping new alarm
router.post('/updateToken', function (req, res) {
    // chuan bi data
    let data = req.body
    let uid = data.uid
    let token = data.token
    console.log(uid)
    console.log(token)

    // cap nhat firestore
    admin.firestore().collection("user").doc(uid).set({
        deviceToken: token
    }, { merge: true }).then(() => {
        console.log("Document successfully written!");
        res.json({ deviceToken: token })
        res.end()
    })
        .catch((error) => {
            console.error("Error writing document: ", error);
            res.json({ deviceToken: token })
            res.end()
        });;

});


module.exports = router // xuat router ra cho Main.js su dung