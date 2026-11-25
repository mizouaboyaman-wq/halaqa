// ===== الأساس: الإصدار، الترحيل، التقييمات، الإشعارات، الحفظ التلقائي =====
const DATA_VERSION=3;

// التقييمات: ممتاز، جيد، يحتاج إلى تكرار أكثر، أعد
// التحويل من الأسماء القديمة حسب الترتيب: جيد جداً ← جيد، جيد ← يحتاج إلى تكرار أكثر، إعادة ← أعد
const GMAP={"جيد جداً":"جيد","جيد":"يحتاج إلى تكرار أكثر","إعادة":"أعد"};
const mapGrade=g=>GMAP[g]||g;
// التقييمات التي تعيد نفس المقطع في الجلسة التالية
const REPEAT_GRADES=["يحتاج إلى تكرار أكثر","أعد"];

// يضمن شكل البيانات، ويحوّل البيانات من الإصدارات السابقة
function migrate(d){
  d=d&&typeof d==="object"?d:{};
  if(!Array.isArray(d.students))d.students=[];
  if((d.v||1)<3){
    d.students.forEach(s=>{
      (s.logs||[]).forEach(l=>{
        l.grade=mapGrade(l.grade);
        (l.revs||[]).forEach(r=>{r.grade=mapGrade(r.grade)});
      });
    });
  }
  d.v=DATA_VERSION;
  return d;
}

// إشعار أسفل الشاشة، مع زر اختياري (مثل «تراجع»)
function toast(msg,opt={}){
  const box=document.getElementById("toasts");if(!box)return;
  const el=document.createElement("div");el.className="toast";
  const span=document.createElement("span");span.textContent=msg;el.appendChild(span);
  if(opt.action){
    const b=document.createElement("button");b.className="toast-btn";b.textContent=opt.action;
    b.onclick=()=>{try{opt.onAction&&opt.onAction()}finally{el.remove()}};
    el.appendChild(b);
  }
  box.appendChild(el);
  setTimeout(()=>{el.classList.add("out");setTimeout(()=>el.remove(),300)},opt.ms||(opt.action?6000:3000));
}

// حفظ تلقائي عند إخفاء التطبيق أو مغادرته
function autosave(){
  try{if(typeof db!=="undefined"&&typeof save==="function")save()}catch(e){}
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)autosave()});
addEventListener("pagehide",autosave);
