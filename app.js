(function () {
    'use strict';
    const Pi = Math.PI;

    let background,
        ctxBack,
        backWidth,
        backHeight,
        isLoadImage = false,
        dxClean,
        dyClean,
        fogging,
        ctxFog,
        radius = 120,
        axis,
        image,
        imageData,
        mouseDownPlace = {},
        mouseUpPlace = {},
        trackMouseMove = false;

    background = document.getElementById('background');
    ctxBack = background.getContext('2d');
    fogging = document.getElementById('fogging');
    ctxFog = fogging.getContext('2d');

    function makeBackground() {
        backWidth = background.width = 1280;
        backHeight = background.height = 550;
        ctxBack.fillStyle = '#b6b6b6';
        ctxBack.fillRect(0, 0, backWidth, backHeight);
    }


    function diminish(min, WoH, image) {
        let n = Math.floor(((WoH / 2) / (Math.abs(min) + (WoH / 2))) * 10) / 10;
        console.log(n);
        image.width = image.width * n;
        image.height = image.height * n;
        return image;
    }

    function createCircle(ctx, startX, startY, r, globComOp) {
        // ctx.save();
        ctx.globalCompositeOperation = globComOp;
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#0c2e3e';
        ctx.arc(startX, startY, r, Math.PI * 2, 0, false);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#000';
        ctx.fill();
        axis = {x: startX, y: startY};
        console.log(axis);
    }

    function makeMask(centerX, centerY, r) {
        fogging.width = backWidth;
        fogging.height = backHeight;
        ctxFog.fillStyle = '#0c2e3e';
        ctxFog.globalCompositeOperation = 'source-over';
        ctxFog.fillRect(0, 0, backWidth, backHeight);
        ctxFog.fill();
        createCircle(ctxFog, centerX, centerY, r, 'xor');

        console.log(fogging);
        fogging.style.display = 'none';
    }

    function drawEverything(newCenterX, newCenterY, newRadius) {
        makeMask(newCenterX, newCenterY, newRadius);
        imageData = ctxFog.getImageData(0, 0, backWidth, backHeight);
        ctxBack.globalCompositeOperation = 'source-over';
        ctxBack.putImageData(imageData, 0, 0);
        ctxBack.globalCompositeOperation = 'overlay';
        ctxBack.drawImage(image, dxClean, dyClean, image.width, image.height);
    };


    makeBackground();


    document.forms.fileForm.elements.file.addEventListener('change', function () {
        let file = this.files[0];
        this.blur();

        if (file) {

            image = new Image();
            image.src = URL.createObjectURL(file);
            console.log(file.name);
            console.log(image.src);
            image.onload = function () {
                isLoadImage = true;
                dxClean = backWidth / 2 - image.width / 2;
                dyClean = backHeight / 2 - image.height / 2;
                console.log(image.width);
                console.log(dyClean);
                if (dxClean < 0 || dyClean < 0) {
                    let m = Math.min(dxClean, dyClean);
                    console.log(m);
                    if (m == dxClean) {
                        diminish(m, backWidth, image);
                        console.log('вызываем diminish с dx');
                    } else {
                        diminish(m, backHeight, image);
                        console.log('вызываем diminish с dy');

                    }
                    dxClean = backWidth / 2 - image.width / 2;
                    dyClean = backHeight / 2 - image.height / 2;

                }
                console.log(dxClean);
                console.log(dyClean);
                drawEverything(backWidth / 2, backHeight / 2, radius);
                URL.revokeObjectURL(image.src);
            };


        }
    });


    background.addEventListener('mousemove', function (event) {
        console.log('мышь движется');
        if (!trackMouseMove) return;
        console.log(event.pageX);
        console.log(event.pageY);
        let newRadius = Math.abs(event.pageX - axis.x);
        console.log(newRadius);
        drawEverything(axis.x, axis.y, newRadius);
        radius = newRadius;
    });

    background.addEventListener('mousedown', function (event) {
        console.log('отпусти мышь');
        console.log(event.pageX);
        console.log(event.pageY);
        mouseDownPlace = {x: event.pageX, y: event.pageY};
        if (Math.abs(mouseDownPlace.y - axis.y) <= 10 && Math.abs(mouseDownPlace.x - axis.x) <= (10 + radius)) {
            console.log("cчитаем новый радиус");
            trackMouseMove = true;

        }
    });

    background.addEventListener('mouseup', function (event) {
        console.log(event.pageX);
        console.log(event.pageY);
        console.log('мышь отпустили');
        console.log('поменяем радиус');
        mouseUpPlace = {x: event.pageX, y: event.pageY};
        if (trackMouseMove) {
            trackMouseMove = false;
            return;
        }
        drawEverything(mouseUpPlace.x, mouseUpPlace.y, radius);
        axis.x = mouseUpPlace.x;
        axis.y = mouseUpPlace.y;
        console.log('это просто щелчек');
    });

    document.onkeyup = function (event) {
        console.log('нажали на клавишу');
        if (event.keyCode == 13) {
            console.log('нажали enter');
            let savePart = ctxBack.getImageData(axis.x - radius, axis.y - radius, 2 * radius, 2 * radius);
            console.log(savePart);

            let forSave = document.getElementById('forSave'),
                ctxSave = forSave.getContext('2d');
            forSave.width = 2 * radius;
            forSave.height = 2 * radius;
            forSave.style.display = 'none';
            ctxSave.putImageData(savePart, 0, 0, 0, 0, 2 * radius, 2 * radius);

            ctxSave.globalCompositeOperation = 'destination-in';

            ctxSave.arc(radius, radius, radius, Math.PI * 2, 0, false);
            ctxSave.fillStyle = '#000';
            ctxSave.fill();
            // let fileName = document.forms.fileForm.elements.file.value;
            // console.log(fileName);

            let dataUrl = forSave.toDataURL();
            console.log(dataUrl);
            let a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'yourImage.png';
            a.dispatchEvent(new MouseEvent('click'));
            URL.revokeObjectURL(a.href);

        } else
            console.log('что за клавиша?');
        console.log(event.keyCode);
    }


}())
