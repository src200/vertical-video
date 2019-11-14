export function CanvasFlow(defaultCanvasTag, zoneSize) {
    var calculatedCallbacks = [],
        canvas = defaultCanvasTag,
        ctx,
        width,
        height,
        oldImage,
        loopId,
        calculator = new FlowCalculator(zoneSize || 8),

        requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           window.oRequestAnimationFrame      ||
                           window.msRequestAnimationFrame     ||
                           function( callback ) { window.setTimeout(callback, 1000 / 60); },
        cancelAnimFrame =  window.cancelAnimationFrame ||
                           window.mozCancelAnimationFrame,
        isCapturing = false,

        getCurrentPixels = function () {
            return ctx.getImageData(0, 0, width, height).data;
        },
        calculate = function () {
            var newImage = getCurrentPixels();
            if (oldImage && newImage) {
                var zones = calculator.calculate(oldImage, newImage, width, height);
                calculatedCallbacks.forEach(function (callback) {
                    callback(zones);
                });
            }
            oldImage = newImage;
        },

        initView = function () {
            width = canvas.width;
            height = canvas.height;
            ctx = canvas.getContext('2d');
        },
        animloop = function () {
            if (isCapturing) {
                loopId = requestAnimFrame(animloop);
                calculate();
            }
        };

    if (!defaultCanvasTag) {
        var err = new Error();
        err.message = "Video tag is required";
        throw err;
    }

    this.startCapture = function () {
        // todo: error?
        isCapturing = true;
        initView();
        animloop();
    };
    this.stopCapture = function () {
        cancelAnimFrame(loopId);
        isCapturing = false;
    };
    this.onCalculated = function (callback) {
        calculatedCallbacks.push(callback);
    };
    this.getWidth = function () { return width; };
    this.getHeight = function () { return height; };
}

function FlowCalculator(step) {
    this.step = step || 8;
}

FlowCalculator.prototype.calculate = function (oldImage, newImage, width, height) {
    var zones = [];
    var step = this.step;
    var winStep = step * 2 + 1;

    var A2, A1B2, B1, C1, C2;
    var u, v, uu, vv;
    uu = vv = 0;
    var wMax = width - step - 1;
    var hMax = height - step - 1;
    var globalY, globalX, localY, localX;

    for (globalY = step + 1; globalY < hMax; globalY += winStep) {
        for (globalX = step + 1; globalX < wMax; globalX += winStep) {
            A2 = A1B2 = B1 = C1 = C2 = 0;

            for (localY = -step; localY <= step; localY++) {
                for (localX = -step; localX <= step; localX++) {
                    var address = (globalY + localY) * width + globalX + localX;

                    var gradX = (newImage[(address - 1) * 4]) - (newImage[(address + 1) * 4]);
                    var gradY = (newImage[(address - width) * 4]) - (newImage[(address + width) * 4]);
                    var gradT = (oldImage[address * 4]) - (newImage[address * 4]);

                    A2 += gradX * gradX;
                    A1B2 += gradX * gradY;
                    B1 += gradY * gradY;
                    C2 += gradX * gradT;
                    C1 += gradY * gradT;
                }
            }

            var delta = (A1B2 * A1B2 - A2 * B1);

            if (delta !== 0) {
                /* system is not singular - solving by Kramer method */
                var iDelta = step / delta;
                var deltaX = -(C1 * A1B2 - C2 * B1);
                var deltaY = -(A1B2 * C2 - A2 * C1);

                u = deltaX * iDelta;
                v = deltaY * iDelta;
            } else {
                /* singular system - find optical flow in gradient direction */
                var norm = (A1B2 + A2) * (A1B2 + A2) + (B1 + A1B2) * (B1 + A1B2);
                if (norm !== 0) {
                    var iGradNorm = step / norm;
                    var temp = -(C1 + C2) * iGradNorm;

                    u = (A1B2 + A2) * temp;
                    v = (B1 + A1B2) * temp;
                } else {
                    u = v = 0;
                }
            }

            if (-winStep < u && u < winStep &&
                -winStep < v && v < winStep) {
                uu += u;
                vv += v;
                zones.push(new FlowZone(globalX, globalY, u, v));
            }
        }
    }

    return {
        zones : zones,
        u : uu / zones.length,
        v : vv / zones.length
    };
};

function FlowZone(x, y, u, v) {
    this.x = x;
    this.y = y;
    this.u = u;
    this.v = v;
}

