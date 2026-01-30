//لعرض مقدمه وخفائها 
function revealQuiz() {
    // 1. إخفاء واجهة النص التمهيدي بالكامل مع تأثير اختفاء بسيط
    const intro = document.getElementById('intro-container');
    intro.style.transition = "opacity 0.5s ease";
    intro.style.opacity = "0";
    
    setTimeout(() => {
        intro.style.display = 'none';
        
        // 2. إظهار حاوية الامتحان (id="all")
        const quizMain = document.getElementById('all');
        quizMain.style.display = 'flex'; // نعيده كـ flex كما في التنسيق الأصلي
        
        // 3. التأكد من استدعاء وظيفة فحص أعلى نتيجة
        if(typeof checkHighScore === "function") checkHighScore();
        
    }, 500);
}

        
        // الأسئلة بتنسيق JSON (سهل التعديل)
        

        let currentQ = 0, score = 0, qTimer, totalClockInterval, timeLeft, maxTime, userResponses = [], startTime;

        // إعداد خيارات الوقت
        const timeSelect = document.getElementById('time-limit');
        const timeOptions = [{v:10, t:"10 ثوانٍ"}, {v:15, t:"15 ثانية"}, {v:30, t:"30 ثانية"}, {v:60, t:"دقيقة"},{v:120,t:"دقيقتان"},

{v:300,t:"5 دقائق"},

{v:600,t:"10 دقائق"}];
        timeOptions.forEach(optData => {
            let opt = document.createElement('option'); opt.value = optData.v; opt.innerText = optData.t;
            if(optData.v === 15) opt.selected = true;
            timeSelect.appendChild(opt);
        });

        // فحص أعلى نتيجة مخزنة
        function checkHighScore() {
            const high = localStorage.getItem('quiz_high_score') || 0;
            const highUser = localStorage.getItem('quiz_high_user') || "لا يوجد";
            if(high > 0) {
                document.getElementById('high-score-text').innerText = `أعلى نتيجة: ${high}% بواسطة ${highUser}`;
            }
        }

        window.toggleDarkMode = function() {
    // 1. تحديد حاوية الاختبار
    const quizArea = document.getElementById('all');
    
    if (quizArea) {
        // 2. تبديل الكلاس في الحاوية نفسها
        quizArea.classList.toggle('dark-mode-quiz');
        
        // 3. التحقق من وجود الكلاس في الحاوية (وليس البودي) لتحديد الأيقونة
        const isDark = quizArea.classList.contains('dark-mode-quiz');
        const icon = isDark ? "☀️" : "🌙";
        
        // 4. تحديث النصوص داخل الأزرار الثلاثة
        ['m-btn-1', 'm-btn-2', 'm-btn-3'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.innerText = icon;
        });
    }
};


        function startChallenge() {
            maxTime = parseInt(timeSelect.value);
            document.getElementById('display-name').innerText = document.getElementById('user-name').value || "بطل";
            document.getElementById('start-page').style.display = 'none';
            document.getElementById('quiz-page').style.display = 'block';
            startTime = new Date();
            startTotalClock();
            document.getElementById('dots-container').innerHTML = quizData.map(() => '<div class="dot"></div>').join('');
            loadQuestion();
        }

        function startTotalClock() {
            totalClockInterval = setInterval(() => {
                let diff = Math.floor((new Date() - startTime) / 1000);
                document.getElementById('total-clock').innerText = `${Math.floor(diff/60).toString().padStart(2,'0')}:${(diff%60).toString().padStart(2,'0')}`;
            }, 1000);
        }

        function loadQuestion() {
            document.getElementById('question-counter').innerText = `${currentQ + 1}/${quizData.length}`;
            timeLeft = maxTime; updateTimerUI();
            document.getElementById('timer-display').classList.remove('pulse');
            
            qTimer = setInterval(() => {
                timeLeft--; updateTimerUI();
                if(timeLeft <= 5) document.getElementById('timer-display').classList.add('pulse');
                if(timeLeft <= 0) submitAnswer(true);
            }, 1000);

            let q = quizData[currentQ];
            const imgEl = document.getElementById('q-image');
            imgEl.style.display = q.img ? 'block' : 'none';
            if(q.img) imgEl.src = q.img;
            document.getElementById('q-text').innerText = q.q;
            document.getElementById('q-options').innerHTML = q.o.sort(() => Math.random() - 0.5)
                .map(opt => `<div class="option-card" onclick="selectOpt(this)">${opt}</div>`).join('');
            document.getElementById('submit-btn').disabled = false;
        }

        function updateTimerUI() {
            document.getElementById('timer-display').innerText = timeLeft;
            document.getElementById('timer-path').style.strokeDashoffset = (283 * (maxTime - timeLeft)) / maxTime;
        }

        function selectOpt(el) {
            document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        }

        function submitAnswer(isTimeout = false) {
            clearInterval(qTimer);
            document.getElementById('submit-btn').disabled = true;
            let selected = document.querySelector('.option-card.active');
            let userAns = isTimeout ? "لم تجاوب" : (selected ? selected.innerText : "لا توجد إجابة");
            let isCorrect = userAns === quizData[currentQ].a;

            if(!isTimeout && selected) {
                selected.classList.add(isCorrect ? 'correct-feedback' : 'wrong-feedback');
            } else if(isTimeout) {
                document.getElementById('quiz-page').classList.add('shake');
                setTimeout(() => document.getElementById('quiz-page').classList.remove('shake'), 400);
            }

            if(isCorrect) score++;
            document.querySelectorAll('.dot')[currentQ].classList.add(isCorrect ? 'correct' : (isTimeout ? 'timeout' : 'wrong'));
            userResponses.push({ q: quizData[currentQ].q, u: userAns, c: quizData[currentQ].a, status: isCorrect, isTimeout });

            setTimeout(() => {
                currentQ++;
                if(currentQ < quizData.length) loadQuestion(); else showFinalResult();
            }, 800);
        }

        function showFinalResult() {
            clearInterval(totalClockInterval);
            document.getElementById('quiz-page').style.display = 'none';
            document.getElementById('result-page').style.display = 'block';
            let unanswered = userResponses.filter(r => r.isTimeout).length;
            let p = (score / quizData.length) * 100;
            
            // تحديث النتيجة وحفظها
            document.getElementById('final-score').innerText = p.toFixed(0) + "%";
            const lastHigh = localStorage.getItem('quiz_high_score') || 0;
            if(p > lastHigh) {
                localStorage.setItem('quiz_high_score', p.toFixed(0));
                localStorage.setItem('quiz_high_user', document.getElementById('display-name').innerText);
            }

            document.getElementById('correct-count').innerText = score;
            document.getElementById('wrong-count').innerText = quizData.length - score - unanswered;
            document.getElementById('unanswered-count').innerText = unanswered;
            document.getElementById('final-time-spent').innerText = `⏱️ الوقت الكلي: ${document.getElementById('total-clock').innerText}`;

            let rank = p === 100 ? "أسطورة 👑" : p >= 70 ? "ذكي جداً 🧠" : p >= 50 ? "ناجح 💪" : "حاول مجدداً 🌱";
            document.getElementById('rank-tag').innerText = rank;

            if (p >= 50) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            
            document.getElementById('review-area').innerHTML = userResponses.map((res, i) => `
                <div class="review-item" style="border-right-color: ${res.status ? 'var(--success)' : (res.isTimeout ? 'var(--warning)' : 'var(--danger)')}">
                    <strong>${i+1}: ${res.q}</strong><br>
                    <small>إجابتك: ${res.u} | الصحيحة: ${res.c}</small>
                </div>`).join('');
        }

        // دوال المشاركة
        function openShareModal() {
            const p = (score / quizData.length) * 100;
            const rank = document.getElementById('rank-tag').innerText;
            const text = `لقد حصلت على ${p.toFixed(0)}% بلقب [${rank}] في تحدي الصور والذكاء! هل يمكنك هزيمتي؟ 🏆`;
            const url = window.location.href;

            document.getElementById('share-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
            document.getElementById('share-x').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            document.getElementById('share-modal-overlay').style.display = 'flex';
        }

        function closeShareModal() { document.getElementById('share-modal-overlay').style.display = 'none'; }
        
        function copyLink() {
            navigator.clipboard.writeText(window.location.href).then(() => alert("تم نسخ الرابط!"));
        };
