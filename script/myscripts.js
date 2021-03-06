navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

var constraints = {
    video: true,
    audio: false
};
var video_statut = true;
var image_statut = false;

var current;
var PosX = 200;
var PosY = 200;

var width = 275;

if (navigator.getUserMedia)
    navigator.getUserMedia(constraints, successCallback, errorCallback);
else
    console.error("getUserMedia not supported");

function successCallback(localMediaStream) {
    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(localMediaStream);
    video.play();
};

function errorCallback(err) {
    video_statut = false;
    console.log("The following error occured: " + err);
};

function capture() {
    if (video_statut == true || image_statut == true) {
        var video = document.querySelector('video');
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var filter = document.querySelector('input[name = "editpic_filter"]:checked');
        if (filter) {
            canvas.width = 640;
            canvas.height = 480;
            cv = document.getElementById("canvas");
            if(cv.firstChild)
                cv.insertBefore(canvas, cv.firstChild);
            else
                cv.appendChild(canvas);

            if (document.getElementById('image').src) {
                var image = new Image();
                image.src = document.getElementById('image').src;
                context.drawImage(image, 0, 0, 640, 480);
            } else
                context.drawImage(video, 0, 0, 640, 480);

            var img = new Image();
            img.src = filter.value;
            context.drawImage(img, PosX, PosY, width, width);

            var data = canvas.toDataURL('image/png');
            canvas.setAttribute('src', data);
            document.getElementById('img').value = data;

            var fd = new FormData(document.forms["form"]);
            var httpr = new XMLHttpRequest();
            httpr.open('POST', '../control/upload.php', true);
            httpr.send(fd);
        } else
            alert("You must first select editor.");
    } else
        alert("You must first activate your webcam or upload picture");
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        image = document.getElementById('image');
        reader.onload = function(e) {
            image.style.display = "";
            image.setAttribute('src', e.target.result);
            image.height = 480;
            image.width = 640;
            document.getElementById('video').style.display = "none";
        };

        reader.readAsDataURL(input.files[0]);
    }
    image_statut = true;
}

function show_img(img_url) {
    if ((video_statut == true || image_statut == true) && img_url) {
        current = img_url;
        var element = document.getElementById("filtercanvas");
        if (element)
            element.parentNode.removeChild(element);
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = 40;
        canvas.height = 80;
        canvas.draggable = true;
        canvas.id = "filtercanvas";
        canvas.addEventListener("click", getClickPosition, false);
        document.getElementById("edit_pic").appendChild(canvas);
        var img = new Image();
        img.src = document.getElementById(img_url).value;
        context.drawImage(img, PosX, PosY, width, width);
    }
}

function getClickPosition(e) {
    if (current) {
        var rect = document.getElementById('edit_pic').getBoundingClientRect();
        PosX = e.clientX - rect.left - (width / 2);
        PosY = e.clientY - rect.top - (width / 2);
        show_img(current);
    }
}