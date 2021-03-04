// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBucL9Q85YASVNA8-M4UMBvZK2tYV14zWo",
    authDomain: "remotealarmclock-2f98a.firebaseapp.com",
    databaseURL: "https://remotealarmclock-2f98a.firebaseio.com",
    projectId: "remotealarmclock-2f98a",
    storageBucket: "remotealarmclock-2f98a.appspot.com",
    messagingSenderId: "570922046860",
    appId: "1:570922046860:web:3b1fa8f98bb8935adcf2a9"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
const list = document.querySelector('.thumbnails');
db.collection("alarms").onSnapshot(function (querySnapshot) {
    list.innerHTML = "";
    var alarms = [];
    querySnapshot.forEach(function (doc) {
        if (doc.data().monday) {
            console.log("true")
        } else {
            console.log("false")
        }
        alarms += `<div class="box">
        <br>
        <!-- Color: Green = đã đặt báo thức  -->
        <i id="${doc.data().alarmId}" onclick="changeColor(${doc.data().alarmId})" class="fa fa-clock-o"
            style="font-size: 8rem; color: ${doc.data().started ? "#008000" : "#808080"};" aria-hidden="true"></i>
        <div class="inner">
            <h3>${doc.data().hour} : ${doc.data().minute}</h3>
            <p>${doc.data().title}</p>

            <p>
                <span id="${doc.data().alarmId}_mo" onclick="dateboxColor(id)"
                style="cursor: pointer; font-weight: bold;font-size: 14px;line-height: 35px ; width: 35px; border: 2px solid;display: inline-block;color:  ${doc.data().monday ? "#008000" : "#808080"}; text-align: center;border-radius: 4px;">Mon</span>
                <span id="${doc.data().alarmId}_tu" onclick="dateboxColor(id)"
                style="cursor: pointer; font-weight: bold;font-size: 14px;line-height: 35px ; width: 35px; border: 2px solid;display: inline-block;color:  ${doc.data().tuesday ? "#008000" : "#808080"};text-align: center;border-radius: 4px;">Tue</span>
                <span id="${doc.data().alarmId}_we" onclick="dateboxColor(id)"
                style="cursor: pointer; font-weight: bold;font-size: 14px;line-height: 35px ; width: 35px; border: 2px solid;display: inline-block;color:  ${doc.data().wednesday ? "#008000" : "#808080"};text-align: center;border-radius: 4px;">Wed</span>
                <span id="${doc.data().alarmId}_th" onclick="dateboxColor(id)"
                style="cursor: pointer; font-weight: bold;font-size: 14px;line-height: 35px ; width: 35px; border: 2px solid;display: inline-block;color:  ${doc.data().thursday ? "#008000" : "#808080"};text-align: center;border-radius: 4px;">Thu</span>
                <span id="${doc.data().alarmId}_fr" onclick="dateboxColor(id)"
                style="cursor: pointer; font-weight: bold;font-size: 14px;line-height: 35px ; width: 35px; border: 2px solid;display: inline-block;color:  ${doc.data().friday ? "#008000" : "#808080"};text-align: center;border-radius: 4px;">Fri</span>
                <span id="${doc.data().alarmId}_sa" onclick="dateboxColor(id)"
                style="cursor: pointer; font-weight: bold;font-size: 14px;line-height: 35px ; width: 35px; border: 2px solid;display: inline-block;color:  ${doc.data().saturday ? "#008000" : "#808080"};text-align: center;border-radius: 4px;">Sat</span>
                <span id="${doc.data().alarmId}_su" onclick="dateboxColor(id)"
                style="cursor: pointer; font-weight: bold;font-size: 14px;line-height: 35px ; width: 35px; border: 2px solid;display: inline-block;color:  ${doc.data().sunday ? "#008000" : "#808080"};text-align: center;border-radius: 4px;">Sun</span>
            </p>
            

            <!-- Checkbox Repeat-->
			<div>
				<div style="text-align: center;">
					<div class="onoffswitch">
						Repeat
						<br>
						<input type="checkbox"  ${doc.data().recurring ? "checked" : ""} name="onoffswitch" class="onoffswitch-checkbox" 
							id="s${doc.data().alarmId}" onclick="ChuMiNga(${doc.data().alarmId})">
						<label class="onoffswitch-label" for="s${doc.data().alarmId}">
							<div class="onoffswitch-inner">
								<div class="onoffswitch-active">
									<div class="onoffswitch-switch">ON</div>
								</div>
								<div class="onoffswitch-inactive">
									<div class="onoffswitch-switch">OFF</div>
								</div>
							</div>
						</label>
					</div>
				</div>
			</div>
			<!-- Checkbox Repeat-->

      
       

            <button class="btn success" style="font-size: 20px" onclick="openUpdateForm(${doc.data().alarmId})">Set Time</button>
            <div style="line-height:50%;">
                <br>
            </div>
            <button class="btn danger" style="font-size: 20px" onclick="location.href='cancel/${doc.data().alarmId}'">Remove</button>
        </div>
    </div>`
    });

    list.innerHTML = alarms;
});



function ChuMiNga(id) {
    
    var checkBox = $('#' + 's' + id);

    let flag = false;
    if (checkBox.is(':checked')) {
        flag = true
    }
    
    setTimeout(() => {
        
        var ref = db.collection("alarms").doc(id.toString());
        ref.update({
            recurring: flag
        }).then(function () {
            console.log("Document successfully updated!");
        })
            .catch(function (error) {
    
                console.error("Error updating document: ", error);
            });

}, 500);

    
}

function dateboxColor(id) {
    var flag = false;
    if ($("#" + id).css('color') == 'rgb(0, 128, 0)') {
        $("#" + id).css('color', 'rgb(128, 128, 128)')
    } else {
        flag = true
        $("#" + id).css('color', 'rgb(0, 128, 0)')

    }
    let index = id.indexOf("_")
    let docId = id.substring(0, index)
    let tmp = id.substring(index + 1, index + 3);

    var ref = db.collection("alarms").doc(String(docId));



    switch (tmp) {
        case 'mo':
            ref.update({
                monday: flag
            })
            break;
        case 'tu':
            ref.update({
                tuesday: flag
            })
            break;
        case 'we':
            ref.update({
                wednesday: flag
            })
            break;
        case 'th':
            ref.update({
                thursday: flag
            })
            break;
        case 'fr':
            ref.update({
                friday: flag
            })
            break;
        case 'sa':
            ref.update({
                saturday: flag
            })
            break;
        case 'su':
            ref.update({
                sunday: flag
            })
            break;
        default:
        // code block
    }



}




function openUpdateForm(id) {
    $("#update").show()
    $("#alarmMid").val(id)
    // nap data vao from tu firestore
    var ref = db.collection("alarms").doc(String(id));

    const doc = ref.get().then(function (doc) {
        if (doc.exists) {
            let data = doc.data()
            $("#updateTitle").val(data.title)
            $("#updateTime").val(data.hour +':' +data.minute)
            // nap cac check box
            $('#alarmID_mo1').prop('checked', data.monday)
            $('#alarmID_sa1').prop('checked', data.saturday)
            $('#alarmID_fr1').prop('checked', data.friday)
            $('#alarmID_tu1').prop('checked', data.tuesday)
            $('#alarmID_we1').prop('checked', data.wednesday)
            $('#alarmID_th1').prop('checked', data.thursday)
            $('#alarmID_su1').prop('checked', data.sunday)
            $('#alarmId_Repeat_Inpopupform1').prop('checked', data.recurring)
            

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
}

function changeColor(id) {
    var flag = false;

    if ($("#" + id).css('color') == 'rgb(0, 128, 0)') {

        flag = false
        console.log("tat")
    } else {


        flag = true
        console.log("bat")
    }


    var ref = db.collection("alarms").doc(String(id));


    ref.update({
        started: flag
    })
        .then(function () {
            console.log("Document successfully updated!");
        })
        .catch(function (error) {

            console.error("Error updating document: ", error);
        });
}