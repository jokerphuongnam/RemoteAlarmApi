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


///////////////////////////////////////////////////////////////get list alarm
router.get('/list', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    admin.firestore().collection("alarms").get().then((querySnapshot) => {
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


///////////////////////////////////////////////////////////////get a alarm with id
router.get('/list/:id', function (req, res) {
    let id = req.params.id
    res.setHeader('Content-Type', 'application/json');
    admin.firestore().collection("alarms").doc(id).get().then((doc) => {
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
    var time = data.time.toString()  // name cua input la time <input name="time" >
    let hour = parseInt(time.substring(0, 2)) // cat chuoi lay gio
    let minute = parseInt(time.substring(3, 5))
    let title = data.title // // name cua input la title <input name="title" >
    let recurring = (data.onoffswitch == undefined ? false : true)
    let monday = (data.monday_cb == undefined ? false : true)
    let tuesday = (data.tuesday_cb == undefined ? false : true)
    let wednesday = (data.wednesday_cb == undefined ? false : true)
    let thursday = (data.thursday_cb == undefined ? false : true)
    let friday = (data.friday_cb == undefined ? false : true)
    let saturday = (data.saturday_cb == undefined ? false : true)
    let sunday = (data.sunday_cb == undefined ? false : true)
    if (data.monday_cb == undefined) {
        console.log('thu 2 false')

    } else {
        console.log('thu 2 true')
    }
    // khoi tao data gui thong bao den mobile
    let id = data.aid
    let json = {
        "to": "/topics/remoteAlarm",
        "data": {
            "alarmId": id.toString(),
            "type": "update",
            "hour": hour.toString(),
            "minute": minute.toString(),
            "title": title
        },
        "priority": "high"
    }
    // check exist

    admin.firestore().collection("alarms").doc(id).get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            axios.post('https://fcm.googleapis.com/fcm/send', json, config)  // gui http post den mobile
                .then(resp => {
                    console.log(`statusCode: ${resp.statusCode}`)
                    // cap nhat data len firebase
                    admin.firestore().collection("alarms").doc(id.toString()).update({
                        alarmId: parseInt(id),
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
                        res.json({ alarm_id: Number(data.aid) })
                        res.end()
                    }).catch((error) => {
                        // The document probably doesn't exist.
                        res.status(500).json({ error: 'khong cap nhat firestore' })
                        res.end()
                    });

                })
                .catch(error => {
                    console.error(error)
                    res.status(500).json({ error: 'khong the gui den mobile' })
                    res.end()

                })


        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            res.status(404).json({ error: 'khong ton tai id' })
            res.end()
        }
    })

    var isError = true





});

///////////////////////////////////////////////////////////////mapping cancel alarm
router.post('/cancel/:id', function (req, res) {
    // tuong tu o tren, chuan bi data gui thong bao den mobile
    // roi cap nhat database tren firebase
    res.setHeader('Content-Type', 'application/json');

    let id = req.params.id
    let json = {
        "to": "/topics/remoteAlarm",
        "data": {
            "alarmId": id,
            "type": "cancel"
        },
        "priority": "high"
    }

    admin.firestore().collection("alarms").doc(id).get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());

            axios.post('https://fcm.googleapis.com/fcm/send', json, config)
                .then(resp => {
                    console.log(`statusCode: ${resp.statusCode}`)
                    admin.firestore().collection("alarms").doc(id).delete().then(() => {
                        console.log("Document successfully deleted!");
                        res.json({ alarm_id: Number(id) })
                        res.end()
                    }).catch((error) => {
                        res.status(500).json({ error: ' khong the xoa firestore' })
                        res.end()
                    });

                })
                .catch(error => {
                    res.status(500).json({ error: 'khong the gui den mobile' })
                    res.end()
                })


        } else {
            // doc.data() will be undefined in this case
            res.status(404).json({ error: 'khong ton tai' })
            res.end()
        }
    })

});

////////////////////////////////////////////////////////////////mapping new alarm
router.post('/new', function (req, res) {
    // chuan bi data
    var id = Math.floor(100000000 + Math.random() * 900000000);
    console.log(id)
    let data = req.body
    var time = data.time.toString()
    // chuan bi cac checkbox
    // recurring
    // console.log('checkbox test' + data.onoffswitch)
    // undefined thi false  , else thi true
    if (data.monday_cb == undefined) {
        console.log('undefined ----')
    }
    let recurring = (data.onoffswitch == undefined ? false : true)
    let monday = (data.monday_cb == undefined ? false : true)
    let tuesday = (data.tuesday_cb == undefined ? false : true)
    let wednesday = (data.wednesday_cb == undefined ? false : true)
    let thursday = (data.thursday_cb == undefined ? false : true)
    let friday = (data.friday_cb == undefined ? false : true)
    let saturday = (data.saturday_cb == undefined ? false : true)
    let sunday = (data.sunday_cb == undefined ? false : true)
    // console.log(data.monday_cb)
    // console.log(data.tuesday_cb)
    // console.log(data.wednesday_cb)
    // console.log(data.thursday_cb)
    // console.log(data.friday_cb)
    // console.log(data.saturday_cb)
    // console.log(data.sunday_cb)

    // khong can gui  thong bao ve user nhung checkbox

    // chi can gui len firestore cho demo


    let hour = parseInt(time.substring(0, 2))
    let minute = parseInt(time.substring(3, 5))
    let title = data.title
    let json = {
        "to": "/topics/remoteAlarm",
        "data": {
            "alarmId": id.toString(),
            "type": "insert",
            "hour": hour.toString(),
            "minute": minute.toString(),
            "title": title
        },
        "priority": "high"
    }


    // cap nhat firestore
    admin.firestore().collection("alarms").doc(id.toString())
        .withConverter(Converter)
        .set(new Alarm(id, hour, minute, title, true, monday, tuesday, wednesday, thursday, friday, saturday, sunday, recurring)).then(() => {
            console.log("Document successfully written!");
            axios.post('https://fcm.googleapis.com/fcm/send', json, config) // gui den mobile http post
                .then(resp => {
                    console.log(`statusCode: ${resp.statusCode}`)
                   // res.end(JSON.stringify({ alarm_id: Number(id) }))
                   res.json({  alarm_id: Number(id) })
                   res.end()
                })
                .catch(error => {
                    console.error(error)
                    res.status(500).json({ error: 'khong the gui den mobile' })
                    res.end()
                })

        })
        .catch((error) => {
            console.error("Error writing document: ", error);
            res.status(500).json({ error: 'khong the luu firestore' })
            res.end()
        });


});

module.exports = router // xuat router ra cho Main.js su dung