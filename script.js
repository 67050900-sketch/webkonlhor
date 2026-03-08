const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let width, height;
let lines = [];
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.nav-links');

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active'); // สำหรับทำอนิเมชั่นปุ่ม (ถ้ามี)
    menuLinks.classList.toggle('active'); // สั่งให้เมนูเลื่อนออกมา
});

// เสริม: กดที่ลิงก์แล้วให้เมนูปิดอัตโนมัติ (กรณีหน้ายาวๆ)
document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
    menuLinks.classList.remove('active');
}));
// กำหนดจำนวนเส้นวงจรบนหน้าจอ (ปรับเพิ่มลดได้)
const numberOfLines = 35; 

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class TechLine {
    constructor() {
        this.reset();
    }
    
    reset() {
        // สุ่มเกิดทั่วหน้าจอ
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // ให้เส้นวิ่งในมุมของแผงวงจร (0, 45, 90, 135, 180... องศา)
        this.angle = Math.floor(Math.random() * 8) * (Math.PI / 4);
        
        // ความเร็วสมูทๆ สบายตา
        this.speed = 0.8 + Math.random() * 1.2;
        this.history = [];
        this.maxLength = 60 + Math.random() * 120; // ความยาวของหาง
        this.timer = 0;
        
        // สุ่มสี: สีส้ม KMITL (15%) หรือ สีเทาเงิน (85%)
        this.isOrange = Math.random() < 0.15;
        this.color = this.isOrange ? '255, 107, 0' : '170, 170, 170';
    }
    
    update() {
        this.timer++;
        
        // สุ่มหักเลี้ยวทุกๆ ระยะเวลาหนึ่ง (หัก 45 หรือ 90 องศาแบบแผงวงจร)
        if (this.timer % 60 === 0 && Math.random() > 0.4) {
            let turn = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4); // เลี้ยว 45 องศา
            if (Math.random() > 0.7) turn *= 2; // เลี้ยว 90 องศา
            this.angle += turn;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.history.push({x: this.x, y: this.y});
        
        // ลบหางส่วนที่ยาวเกินไป
        if (this.history.length > this.maxLength) {
            this.history.shift();
        }

        // ถวิ่งออกนอกจอไปไกลๆ ให้สุ่มเกิดใหม่
        if (this.x < -150 || this.x > width + 150 || this.y < -150 || this.y > height + 150) {
            this.reset();
        }
    }
    
    draw() {
        if (this.history.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        
        // สร้างเอฟเฟกต์หางจางไล่ระดับสี (Gradient Fade)
        let grad = ctx.createLinearGradient(
            this.history[0].x, this.history[0].y, 
            this.history[this.history.length-1].x, this.history[this.history.length-1].y
        );
        grad.addColorStop(0, `rgba(${this.color}, 0)`); // ปลายหางโปร่งใส
        grad.addColorStop(1, `rgba(${this.color}, ${this.isOrange ? 0.6 : 0.25})`); // หัวเข้ม
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        
        // ใส่เอฟเฟกต์เรืองแสง (Glow) เริ่ดๆ
        ctx.shadowBlur = this.isOrange ? 12 : 4;
        ctx.shadowColor = `rgba(${this.color}, 0.8)`;
        ctx.stroke();

        // วาดจุดข้อมูล (Data Node) ที่ส่วนหัว
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.isOrange ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, 1)`;
        ctx.fill();
        
        // รีเซ็ตแสง เพื่อไม่ให้กวนเส้นอื่น
        ctx.shadowBlur = 0;
    }
}

// สร้างชุดข้อมูล
for (let i = 0; i < numberOfLines; i++) {
    lines.push(new TechLine());
}

function animate() {
    // ลบหน้าจอและทำให้โปร่งใส
    ctx.clearRect(0, 0, width, height);
    
    lines.forEach(line => {
        line.update();
        line.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();

// --- ส่วน Intersection Observer (เก็บไว้ให้ตัวหนังสือค่อยๆ ปรากฏเหมือนเดิม) ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
