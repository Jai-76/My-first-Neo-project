// Canvas Cursor Effect
// Adapted from Cursify (https://cursify.ui-layouts.com/components/canvas-cursor)

(function() {
    let ctx, f, pos = { x: 0, y: 0 }, lines = [], E = {
        friction: 0.5,
        trails: 20,
        size: 50,
        dampening: 0.25,
        tension: 0.98,
    };

    function Osc(e) {
        this.init(e || {});
    }
    Osc.prototype = {
        init: function (e) {
            this.phase = e.phase || 0;
            this.offset = e.offset || 0;
            this.frequency = e.frequency || 0.001;
            this.amplitude = e.amplitude || 1;
        },
        update: function () {
            this.phase += this.frequency;
            return this.offset + Math.sin(this.phase) * this.amplitude;
        }
    };

    function Node() {
        this.x = 0;
        this.y = 0;
        this.vy = 0;
        this.vx = 0;
    }

    function Line(e) {
        this.init(e || {});
    }
    Line.prototype = {
        init: function (e) {
            this.spring = e.spring + 0.1 * Math.random() - 0.02;
            this.friction = E.friction + 0.01 * Math.random() - 0.002;
            this.nodes = [];
            for (var t, n = 0; n < E.size; n++) {
                t = new Node();
                t.x = pos.x;
                t.y = pos.y;
                this.nodes.push(t);
            }
        },
        update: function () {
            var e = this.spring,
                t = this.nodes[0];
            t.vx += (pos.x - t.x) * e;
            t.vy += (pos.y - t.y) * e;
            for (var n, i = 0, a = this.nodes.length; i < a; i++) {
                t = this.nodes[i];
                if (0 < i) {
                    n = this.nodes[i - 1];
                    t.vx += (n.x - t.x) * e;
                    t.vy += (n.y - t.y) * e;
                    t.vx += n.vx * E.dampening;
                    t.vy += n.vy * E.dampening;
                }
                t.vx *= this.friction;
                t.vy *= this.friction;
                t.x += t.vx;
                t.y += t.vy;
                e *= E.tension;
            }
        },
        draw: function () {
            var e, t, n = this.nodes[0].x, i = this.nodes[0].y;
            ctx.beginPath();
            ctx.moveTo(n, i);
            for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
                e = this.nodes[a];
                t = this.nodes[a + 1];
                n = 0.5 * (e.x + t.x);
                i = 0.5 * (e.y + t.y);
                ctx.quadraticCurveTo(e.x, e.y, n, i);
            }
            e = this.nodes[a];
            t = this.nodes[a + 1];
            ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
            ctx.stroke();
            ctx.closePath();
        }
    };

    function onMousemove(e) {
        function o() {
            lines = [];
            for (var e = 0; e < E.trails; e++)
                lines.push(new Line({ spring: 0.4 + (e / E.trails) * 0.025 }));
        }
        function c(e) {
            if (e.touches) {
                pos.x = e.touches[0].pageX;
                pos.y = e.touches[0].pageY;
            } else {
                pos.x = e.clientX + window.scrollX;
                pos.y = e.clientY + window.scrollY;
            }
            // e.preventDefault(); // Don't prevent default to allow scrolling
        }
        function l(e) {
            if (e.touches.length == 1) {
                pos.x = e.touches[0].pageX;
                pos.y = e.touches[0].pageY;
            }
        }
        document.removeEventListener('mousemove', onMousemove);
        document.removeEventListener('touchstart', onMousemove);
        document.addEventListener('mousemove', c);
        document.addEventListener('touchmove', c);
        document.addEventListener('touchstart', l);
        c(e);
        o();
        render();
    }

    function render() {
        if (ctx.running) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'hsla(' + Math.round(f.update()) + ',50%,50%,0.5)';
            ctx.lineWidth = 1;
            for (var e, t = 0; t < E.trails; t++) {
                e = lines[t];
                e.update();
                e.draw();
            }
            ctx.frame++;
            window.requestAnimationFrame(render);
        }
    }

    function resizeCanvas() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    }

    function init() {
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas-cursor';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10000';
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');
        ctx.running = true;
        ctx.frame = 1;
        f = new Osc({
            phase: Math.random() * 2 * Math.PI,
            amplitude: 85,
            frequency: 0.0015,
            offset: 285,
        });

        document.addEventListener('mousemove', onMousemove);
        document.addEventListener('touchstart', onMousemove);
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('focus', () => {
            if (!ctx.running) {
                ctx.running = true;
                render();
            }
        });
        window.addEventListener('blur', () => {
            ctx.running = true;
        });
        resizeCanvas();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
