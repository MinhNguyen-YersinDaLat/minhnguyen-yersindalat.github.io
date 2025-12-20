 // --- 0. FIREBASE CONFIG (YERSIN EDITION) ---
        const FIREBASE_CONFIG = {
            apiKey: "AIzaSyBivJqcFx_JZhVpjuFJjV786Ug9nDpPBWg",
            authDomain: "hanhkiem-d853b.firebaseapp.com",
            databaseURL: "https://hanhkiem-d853b-default-rtdb.firebaseio.com",
            projectId: "hanhkiem-d853b",
            storageBucket: "hanhkiem-d853b.firebasestorage.app",
            messagingSenderId: "208584372826",
            appId: "1:208584372826:web:6e55373d25ca0ffeb59e63",
            measurementId: "G-M1Z8X4FX8L"
        };

        // --- 1. APP CONFIG ---
        const DEFAULT_CLASS_NAME = "Lớp 12C2";
        const DEFAULT_STUDENTS = [ "Nguyễn Ngọc Phúc An", "Trần Ngọc Khánh An", "Mai Vân Anh", "Nguyễn Trọng Anh", "Nguyễn Lương Bằng", "Đặng Ngọc Bảo Châu", "Trần Mỹ Châu", "Nguyễn Quốc Cường", "Phạm Đức", "Nguyễn Thị Thanh Hằng", "Nguyễn Đức Minh Hoàng", "Phan Ngọc Huy", "Nguyễn Đình Gia Hưng", "Trương Thị Ngọc Hương", "Bế Đăng Nguyên Khang", "Hoàng Trọng Khang", "Nguyễn Văn Đăng Khoa", "Nguyễn Cao Đăng Khôi", "Hứa Lư Mỹ Kim", "Bùi Thị Khánh Linh" ];
        const ANIMAL_AVATARS = ['🦁','🐰','🦊','🐼','🐨','🦄','🐯','🐸','🐷','🐵','🐣','🐧','🦉','🦋','🐞'];
        const SUBJECTS = [ { id: 'math', name: 'Toán', icon: 'calculator' }, { id: 'lit', name: 'Văn', icon: 'book-open' }, { id: 'eng', name: 'Anh', icon: 'languages' }, { id: 'phy', name: 'Lý', icon: 'atom' }, { id: 'chem', name: 'Hóa', icon: 'flask-conical' }, { id: 'bio', name: 'Sinh', icon: 'dna' }, { id: 'hist', name: 'Sử', icon: 'landmark' }, { id: 'geo', name: 'Địa', icon: 'globe-2' }, { id: 'gdcd', name: 'GDPL', icon: 'scale' }, { id: 'it', name: 'Tin', icon: 'monitor' }, { id: 'tech', name: 'CN', icon: 'cpu' } ];
        
        // Helper to split names into Last+Middle and First Name
        const splitName = (fullName) => {
            const parts = fullName.trim().split(' ');
            if (parts.length === 1) return { last: '', first: parts[0] };
            const first = parts.pop();
            const last = parts.join(' ');
            return { last, first };
        };

        // Helper to evaluate rank based on TT22 (Simplified for subject level)
        const getEvaluation = (score) => {
            if (score === "" || score === null) return "";
            const s = parseFloat(score);
            if (s >= 8.0) return "Tốt";
            if (s >= 6.5) return "Khá";
            if (s >= 5.0) return "Đạt";
            return "Chưa đạt";
        };

        // --- 2. ICONS & HELPERS ---
        const Icon = ({ name, size = 24, className = "", style = {}, onClick }) => {
            const ref = React.useRef(null);
            React.useEffect(() => {
                if (window.lucide && ref.current) {
                    ref.current.innerHTML = '';
                    const i = document.createElement('i');
                    i.setAttribute('data-lucide', name);
                    ref.current.appendChild(i);
                    window.lucide.createIcons({ root: ref.current, attrs: { width: size, height: size, class: "lucide-icon-svg" } });
                }
            }, [name, size]); 
            return <span ref={ref} onClick={onClick} className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} />;
        };

        const showToast = (msg, type = 'info') => {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerText = msg;
            container.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
        };

        // UPDATED: Calculate average based on Circular 22
        // CT: (TX + 2*GK + 3*CK) / (Count_TX + 5)
        const calculateSubjectAverage = (scores) => {
            if (!scores) return "";
            const { tx = [], gk, ck } = scores;
            
            // Filter valid TX scores (non-null, non-empty)
            const validTx = tx.filter(s => s !== null && s !== undefined && s !== "");
            
            // Need at least one score to calculate
            if (validTx.length === 0 && (gk === null || gk === "") && (ck === null || ck === "")) return "";

            let sum = 0;
            let coefficientSum = 0;

            // Add TX (Coefficient 1)
            validTx.forEach(s => {
                sum += parseFloat(s);
                coefficientSum += 1;
            });

            // Add GK (Coefficient 2)
            if (gk !== null && gk !== undefined && gk !== "") {
                sum += parseFloat(gk) * 2;
                coefficientSum += 2;
            }

            // Add CK (Coefficient 3)
            if (ck !== null && ck !== undefined && ck !== "") {
                sum += parseFloat(ck) * 3;
                coefficientSum += 3;
            }

            if (coefficientSum === 0) return "";
            return (sum / coefficientSum).toFixed(1);
        };

        // --- 3. 10-RANK SYSTEM (1-20 Points) ---
        const getRankInfo = (points) => {
            if (points >= 20) return { id: 'scholar', name: 'HỌC GIẢ TRẺ', effect: 'scholar', textColor: 'shimmer-text', badge: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg' };
            if (points >= 18) return { id: 'breakthrough', name: 'BỨT PHÁ', effect: 'breakthrough', textColor: 'text-rose-600', badge: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md' };
            if (points >= 16) return { id: 'excellent', name: 'XUẤT SẮC', effect: 'excellent', textColor: 'text-orange-600', badge: 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md' };
            if (points >= 14) return { id: 'superior', name: 'VƯỢT BẬC', effect: 'superior', textColor: 'text-cyan-600', badge: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md' };
            if (points >= 12) return { id: 'confident', name: 'TỰ TIN', effect: 'confident', textColor: 'text-yellow-600', badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md' };
            if (points >= 10) return { id: 'progressive', name: 'TIẾN BỘ', effect: 'progressive', textColor: 'text-lime-600', badge: 'bg-gradient-to-r from-lime-400 to-green-500 text-white shadow-sm' };
            if (points >= 8) return { id: 'persistent', name: 'KIÊN TRÌ', effect: 'persistent', textColor: 'text-teal-600', badge: 'bg-teal-500 text-white shadow-sm' };
            if (points >= 5) return { id: 'conscious', name: 'TỰ GIÁC', effect: 'conscious', textColor: 'text-blue-500', badge: 'bg-blue-400 text-white shadow-sm' };
            if (points >= 2) return { id: 'learner', name: 'CHĂM HỌC', effect: 'learner', textColor: 'text-indigo-500', badge: 'bg-indigo-300 text-white shadow-sm' };
            return { id: 'starter', name: 'KHỞI ĐỘNG', effect: 'starter', textColor: 'text-gray-500', badge: 'bg-gray-200 text-gray-500 shadow-sm' };
        };

        // --- 4. OPTIMIZED AVATAR RINGS ---
        const AvatarRing = ({ type, isAnimated = false }) => {
            if (type === 'none' || !type) return null;
            const containerClass = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] h-[135%] pointer-events-none flex items-center justify-center";
            const anim = (c) => isAnimated ? c : '';
            const renderOrbits = (count, icon, colorClass, duration = '10s', reverse = false, radius = 70, spinSelf = false) => (
                <div className={`w-full h-full absolute ${reverse ? anim('animate-spin-reverse') : anim('animate-spin-slow')}`} style={{animationDuration: duration}}>
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: `rotate(${i * (360/count)}deg) translate(${radius}px) rotate(-${i * (360/count)}deg)` }}>
                            <div className={spinSelf ? anim('animate-spin-medium') : ''}><Icon name={icon} size={24} className={colorClass + " drop-shadow-md"} /></div>
                        </div>
                    ))}
                </div>
            );

            if (type === 'starter') return <div className={containerClass}><div className="w-full h-full border-2 border-dashed border-gray-300 rounded-full opacity-60"></div><div className={`w-[110%] h-[110%] absolute border border-gray-100 rounded-full ${anim('animate-shockwave')}`}></div>{renderOrbits(3, 'sprout', 'text-emerald-400', '12s', false, 65)}</div>;
            if (type === 'learner') return <div className={containerClass}><div className={`w-full h-full border-[3px] border-dashed border-indigo-300 rounded-full opacity-70 ${anim('animate-spin-slow')}`}></div><div className={`w-[115%] h-[115%] absolute border border-indigo-200 rounded-full ${anim('animate-pulse-ring')}`}></div>{renderOrbits(4, 'pencil', 'text-indigo-400', '15s', true, 70)}<div className={`absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-indigo-100 z-10 ${anim('animate-bounce')}`}><Icon name="book" size={14} className="text-indigo-500"/></div></div>;
            if (type === 'conscious') return <div className={containerClass}><div className={`w-full h-full border-2 border-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.4)] ${anim('animate-pulse')}`}></div><div className={`w-[125%] h-[125%] absolute border border-blue-200 rounded-full ${anim('animate-shockwave')}`} style={{animationDelay: '1s'}}></div><div className={`w-[110%] h-[110%] absolute border-b-4 border-blue-300 rounded-full opacity-60 ${anim('animate-spin-reverse')}`}></div>{renderOrbits(5, 'lightbulb', 'text-blue-500 fill-yellow-100', '18s', false, 75)}</div>;
            if (type === 'persistent') return <div className={containerClass}><div className="w-full h-full border-[4px] double border-teal-500 rounded-full"></div><div className={`w-[120%] h-[120%] absolute border-2 border-teal-300/50 rounded-full border-t-transparent border-r-transparent ${anim('animate-spin-slow')}`}></div><div className={`w-[120%] h-[120%] absolute border-2 border-teal-300/50 rounded-full border-b-transparent border-l-transparent ${anim('animate-spin-reverse')}`}></div><div className={`absolute -bottom-2 right-0 drop-shadow-lg ${anim('animate-bounce')}`}><Icon name="shield" size={24} className="text-teal-600 fill-teal-100"/></div></div>;
            if (type === 'progressive') return <div className={containerClass}><div className="w-full h-full border-2 border-lime-400 rounded-full shadow-[0_0_15px_rgba(163,230,53,0.5)]"></div><div className={`w-[115%] h-[115%] absolute border-[3px] border-dotted border-lime-500 rounded-full ${anim('animate-spin-slow')}`}></div>{renderOrbits(6, 'leaf', 'text-lime-600 fill-lime-200', '12s', true, 78)}<div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-lg border border-lime-200 z-10"><Icon name="trending-up" size={18} className="text-lime-600 stroke-[3]"/></div></div>;
            if (type === 'confident') return <div className={containerClass}><div className={`w-full h-full border-[3px] border-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6),inset_0_0_10px_rgba(250,204,21,0.4)] ${anim('animate-pulse')}`}></div><div className={`w-[140%] h-[140%] absolute rounded-full border border-yellow-200 opacity-40 ${anim('animate-shockwave')}`}></div>{renderOrbits(4, 'award', 'text-yellow-600 fill-yellow-100', '18s', false, 82)}<div className="absolute -top-4 left-1/2 -translate-x-1/2"><Icon name="crown" size={24} className="text-yellow-500 fill-yellow-200 drop-shadow-md"/></div></div>;
            if (type === 'superior') return <div className={containerClass}><div className="w-full h-full border-2 border-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-cyan-50/20"></div><div className="w-[130%] h-[130%] absolute border border-cyan-400 rounded-full" style={{ transform: 'rotateX(70deg)', animation: isAnimated ? 'spin-medium 4s linear infinite' : 'none' }}></div><div className="w-[130%] h-[130%] absolute border border-cyan-400 rounded-full" style={{ transform: 'rotateY(70deg)', animation: isAnimated ? 'spin-medium 4s linear infinite' : 'none' }}></div><div className="w-[130%] h-[130%] absolute border border-cyan-400 rounded-full" style={{ transform: 'rotate(60deg) rotateX(70deg)', animation: isAnimated ? 'spin-medium 4s linear infinite' : 'none' }}></div>{renderOrbits(3, 'atom', 'text-cyan-500 fill-cyan-100', '6s', false, 85, true)}</div>;
            if (type === 'excellent') return <div className={containerClass}><div className="w-full h-full border-[3px] border-orange-500 rounded-full shadow-[0_0_25px_orange,inset_0_0_15px_orange]"></div><div className={`w-[110%] h-[110%] absolute border-[2px] border-orange-300 rounded-full ${anim('animate-shockwave')}`}></div><div className={`w-[130%] h-[130%] absolute border-[2px] border-dashed border-orange-400 rounded-full ${anim('animate-spin-slow')}`}></div>{renderOrbits(8, 'sun', 'text-orange-600 fill-yellow-300', '20s', true, 85, true)}</div>;
            if (type === 'breakthrough') return <div className={containerClass}><div className="w-full h-full border-[3px] border-pink-400 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.6)]"></div><div className={`w-[125%] h-[125%] absolute border-[1px] border-pink-300 rounded-full ${anim('animate-spin-reverse-slow')}`}></div><div className={`w-[115%] h-[115%] absolute border-[2px] dotted border-pink-300 rounded-full opacity-70 ${anim('animate-spin-medium')}`}></div>{renderOrbits(5, 'gem', 'text-rose-500 fill-rose-200', '12s', true, 85, true)}{renderOrbits(5, 'flower', 'text-pink-400', '15s', false, 75, false)}<div className={`absolute inset-0 flex items-center justify-center opacity-30 ${anim('animate-pulse')}`}><Icon name="sparkles" size={100} className="text-pink-300"/></div></div>;
            if (type === 'scholar') return <div className={containerClass}>{isAnimated && <div className="magic-border-container"><div className="magic-border-layer" style={{'--border-color': '#a855f7'}}></div><div className="magic-border-layer reverse" style={{'--border-color': '#3b82f6'}}></div></div>}<div className={`absolute inset-0 rounded-full border border-white/50 ${anim('animate-shockwave')}`}></div><FairyDust />{renderOrbits(6, 'star', 'text-yellow-300 fill-white', '12s', false, 85, true)}{renderOrbits(4, 'sparkles', 'text-purple-300', '8s', true, 65, true)}<div className={`absolute -top-8 left-1/2 -translate-x-1/2 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] z-30 ${anim('animate-bounce')}`}><Icon name="crown" size={42} className="text-yellow-400 fill-yellow-100 stroke-[2.5]"/></div></div>;
            return null;
        };
        
        const FairyDust = () => { return null; };

        // --- 6. START SCREEN COMPONENT (Liquid Glass Style) ---
        const StartScreen = ({ onStart, onLogin, user }) => {
            return (
                <div id="startScreen" className="fixed inset-0 z-[100] bg-white/20 backdrop-blur-md overflow-y-auto">
                    <div className="min-h-full flex flex-col items-center justify-center p-6 font-sans">
                        
                        <div className="relative z-10 flex flex-col items-center w-full max-w-lg my-auto">
                             <div className="mb-6 relative animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                                <div className="w-32 h-32 md:w-40 md:h-40 glass-panel rounded-[2rem] p-4 shadow-2xl transform hover:scale-105 transition-transform duration-500 cursor-pointer flex items-center justify-center border-white/60 animate-breathe relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent"></div>
                                    <img src="logo.png" alt="Logo" className="max-w-full max-h-full object-contain drop-shadow-2xl relative z-10" onError={(e)=>{e.target.style.display='none'; e.target.parentNode.innerHTML='<span class="text-6xl md:text-7xl filter drop-shadow-lg">🎓</span>'}}/>
                                </div>
                            </div>
                            
                            <div className="text-center space-y-1 mb-8 animate-fade-in-up relative z-10" style={{animationDelay: '0.2s'}}>
                                <h2 className="text-sm md:text-xl font-bold uppercase tracking-widest text-slate-600 drop-shadow-sm leading-relaxed p-1">Ứng Dụng Theo Dõi Học Sinh</h2>
                                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 drop-shadow-xl leading-relaxed py-6 animate-pulse">SỔ ĐIỂM</h1>
                                <div className="flex flex-wrap items-center justify-center gap-2 text-slate-600 text-[10px] md:text-xs font-bold bg-white/50 py-1.5 px-4 rounded-full backdrop-blur-md border border-white/40 shadow-sm mx-auto w-fit mt-2">
                                    <span>Thầy Thái Minh Nguyên</span><span className="hidden md:inline w-1 h-1 bg-slate-400 rounded-full"></span><span className="block md:inline">TH, THCS & THPT YERSIN ĐÀ LẠT</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full animate-fade-in-up relative z-10 max-w-xs md:max-w-sm mb-4" style={{animationDelay: '0.3s'}}>
                                {user ? (
                                    <div className="space-y-4 w-full">
                                        <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 border border-white/60 shadow-md">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover"/> : <span className="w-full h-full flex items-center justify-center text-xl">👤</span>}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase truncate">Xin chào,</div>
                                                <div className="text-base font-black text-slate-800 truncate">{user.displayName}</div>
                                            </div>
                                        </div>
                                        <button onClick={onStart} className="w-full glass-button-primary text-white font-bold py-3.5 rounded-xl text-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 shadow-lg hover:shadow-orange-200/50">
                                            <Icon name="play-circle" size={24} className="animate-pulse"/> BẮT ĐẦU
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={onLogin} className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-5 rounded-xl shadow-lg border border-slate-100 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden">
                                           <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none"><path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/><path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/><path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/><path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/></svg>
                                           <span className="text-sm font-bold tracking-tight">Đăng nhập Google</span>
                                        </button>
                                        <button onClick={onStart} className="glass-button-primary text-white font-bold py-3 px-5 rounded-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-200/50 text-sm">
                                            <Icon name="rocket" size={20}/> DÙNG THỬ NGAY (KHÁCH)
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // --- 7. MAIN APP COMPONENTS ---
        const StudentCard = ({ student, onAddPoint, onClick, isTopRanked }) => {
            const [isHovered, setIsHovered] = React.useState(false);
            const [burst, setBurst] = React.useState(false);
            const points = student.points || 0;
            const rank = getRankInfo(points);
            const shouldAnimate = isHovered || isTopRanked;

            const handleQuickAdd = (e) => {
                e.stopPropagation();
                onAddPoint(student.id, 1);
                setBurst(true);
                setTimeout(()=>setBurst(false), 500);
            };

            return (
                <div className="relative group w-full cursor-pointer select-none transition-all duration-300 hover:-translate-y-2" onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                    <div className="glass-card min-h-[280px] h-full relative rounded-[2rem] p-[4px] overflow-hidden flex flex-col"> 
                        <div className={`relative h-full w-full rounded-[1.8rem] flex flex-col items-center p-4 z-10 overflow-hidden`}>
                            {burst && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl animate-ping opacity-0 z-50">⭐</div>}
                            
                            <div className="w-full flex justify-center items-center z-20 mb-4">
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${rank.badge}`}>{rank.name}</span>
                            </div>

                            <div className="relative z-10 mb-4 mt-auto transition-transform duration-500 group-hover:scale-110">
                                <AvatarRing type={rank.effect} isAnimated={shouldAnimate} />
                                <div className={`w-24 h-24 rounded-full bg-white/80 shadow-inner flex items-center justify-center text-5xl relative z-10 overflow-hidden border-[3px] border-white/60`}>
                                    {student.avatarUrl ? <img src={student.avatarUrl} className="w-full h-full object-cover" /> : <span className="drop-shadow-md filter saturate-150">{student.avatar || '🦁'}</span>}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-1 rounded-full shadow-lg border border-white flex items-center gap-2 min-w-[4rem] justify-center z-30 backdrop-blur-sm">
                                    <Icon name="star" size={14} className="fill-yellow-400 text-yellow-400" /><span className="font-black text-slate-700 text-lg">{points}</span>
                                </div>
                            </div>

                            <div className="mt-auto w-full text-center z-20 pb-2">
                                <h3 className={`text-lg font-black text-center px-1 leading-tight break-words drop-shadow-sm ${rank.textColor || 'text-slate-700'}`}>{student.name}</h3>
                            </div>
                            
                            <button onClick={handleQuickAdd} className="mt-2 w-full py-2.5 rounded-xl bg-white/50 hover:bg-white text-slate-500 hover:text-orange-500 font-bold text-xs flex items-center justify-center gap-1 transition-all border border-white/50 hover:shadow-md"><Icon name="thumbs-up" size={14}/> THƯỞNG NHANH</button>
                        </div>
                    </div>
                </div>
            );
        };

        const StudentDetailModal = ({ student, subjectId, onClose, onUpdateScore, onUpdatePoints }) => {
            const [tab, setTab] = React.useState('behavior');
            const [selectedSubModal, setSelectedSubModal] = React.useState(subjectId);
            const [txScores, setTxScores] = React.useState(['', '', '', '', '']); // 5 fixed slots
            const [gkScore, setGkScore] = React.useState('');
            const [ckScore, setCkScore] = React.useState('');

            React.useEffect(() => {
                const s = student.subjects?.[selectedSubModal] || { tx: [], gk: '', ck: '' };
                // Populate TX slots, pad with empty strings up to 5
                const txData = [...(s.tx || [])];
                while(txData.length < 5) txData.push('');
                setTxScores(txData.slice(0, 5));
                setGkScore(s.gk ?? '');
                setCkScore(s.ck ?? '');
            }, [selectedSubModal, student]);

            const avg = calculateSubjectAverage({ tx: txScores, gk: gkScore, ck: ckScore });
            const rank = getRankInfo(student.points || 0);

            const handleSaveScores = () => {
                onUpdateScore(student.id, selectedSubModal, { 
                    tx: txScores, 
                    gk: gkScore, 
                    ck: ckScore 
                });
                showToast('Đã lưu điểm môn ' + SUBJECTS.find(s=>s.id===selectedSubModal).name, 'success');
            };

            const handleTxChange = (index, value) => {
                const newTx = [...txScores];
                newTx[index] = value;
                setTxScores(newTx);
            };

            return (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="glass-modal w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up z-10 relative">
                        <div className="p-6 bg-white/50 backdrop-blur-md border-b border-white/50 flex items-center gap-4 relative">
                            <div className="relative z-10"><div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-5xl border-4 border-white/50">{student.avatarUrl ? <img src={student.avatarUrl} className="w-full h-full object-cover" /> : (student.avatar || '🦁')}</div>{tab === 'grades' && (<div className="absolute -bottom-2 -right-2 bg-orange-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white text-lg">{avg || '-'}</div>)}</div>
                            <div className="flex-1 z-10">
                                <h2 className="text-2xl font-black text-slate-800">{student.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm ${rank.badge}`}>{rank.name}</span>
                                    <span className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1 border border-white/50"><Icon name="star" size={12} className="text-orange-500"/> {student.points} Điểm</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"><Icon name="x" /></button>
                        </div>
                        <div className="flex border-b border-white/50 bg-white/30 p-1 gap-1">
                            <button onClick={()=>setTab('behavior')} className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${tab==='behavior'?'bg-white shadow-sm text-orange-600':'text-slate-500 hover:bg-white/40'}`}>HÀNH VI & THI ĐUA</button>
                            <button onClick={()=>setTab('grades')} className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${tab==='grades'?'bg-white shadow-sm text-blue-600':'text-slate-500 hover:bg-white/40'}`}>SỔ ĐIỂM CHI TIẾT</button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-white/40">
                            {tab === 'behavior' ? (
                                <div className="space-y-6">
                                    <div><h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-wider">Thưởng điểm (+1 đến +5)</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{l:'Phát biểu', v:1, i:'hand'}, {l:'Bài tốt', v:2, i:'file-check'}, {l:'Giúp bạn', v:2, i:'users'}, {l:'Xuất sắc', v:5, i:'trophy'}].map((btn, idx) => (<button key={idx} onClick={()=>onUpdatePoints(student.id, btn.v)} className="glass-button flex flex-col items-center justify-center p-4 rounded-2xl text-emerald-600"><Icon name={btn.i} size={24} className="mb-1"/><span className="font-bold text-xs">{btn.l}</span><span className="text-[10px] font-bold bg-emerald-100 px-2 rounded-full mt-1 text-emerald-700">+{btn.v}</span></button>))}</div></div>
                                    <div><h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-wider">Phạt điểm (-1 đến -5)</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{l:'Nói chuyện', v:-1, i:'message-circle-off'}, {l:'Không thuộc bài', v:-2, i:'book-x'}, {l:'Đi trễ', v:-2, i:'clock'}, {l:'Vô lễ', v:-5, i:'frown'}].map((btn, idx) => (<button key={idx} onClick={()=>onUpdatePoints(student.id, btn.v)} className="glass-button flex flex-col items-center justify-center p-4 rounded-2xl text-red-500"><Icon name={btn.i} size={24} className="mb-1"/><span className="font-bold text-xs">{btn.l}</span><span className="text-[10px] font-bold bg-red-100 px-2 rounded-full mt-1 text-red-700">{btn.v}</span></button>))}</div></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="mb-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Môn Học</label><div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">{SUBJECTS.map(s => (<button key={s.id} onClick={()=>setSelectedSubModal(s.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${selectedSubModal === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white/60 text-slate-500 border-white hover:bg-white'}`}>{s.name}</button>))}</div></div>
                                    <div className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm">
                                        <div className="mb-4">
                                            <label className="text-sm font-bold text-slate-700 block mb-2">ĐG Thường Xuyên (Hệ số 1)</label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {txScores.map((s, i) => (
                                                    <div key={i}>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase text-center block mb-1">TX{i+1}</label>
                                                        <input type="number" value={s} onChange={e=>handleTxChange(i, e.target.value)} className="w-full p-2 bg-white/80 border border-white rounded-lg font-bold text-center focus:ring-2 focus:ring-blue-300 outline-none text-slate-700" placeholder="-" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-bold text-slate-700 block mb-2">Giữa Kỳ (HS 2)</label><input type="number" value={gkScore} onChange={e=>setGkScore(e.target.value)} className="w-full p-3 bg-white/80 border border-white rounded-xl font-bold text-center focus:ring-2 focus:ring-blue-300 outline-none text-blue-600" placeholder="--"/></div><div><label className="text-sm font-bold text-slate-700 block mb-2">Cuối Kỳ (HS 3)</label><input type="number" value={ckScore} onChange={e=>setCkScore(e.target.value)} className="w-full p-3 bg-white/80 border border-white rounded-xl font-bold text-center text-red-600 focus:ring-2 focus:ring-red-300 outline-none" placeholder="--"/></div></div>
                                    </div>
                                    <button onClick={handleSaveScores} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"><Icon name="save" /> LƯU ĐIỂM MÔN {SUBJECTS.find(s=>s.id===selectedSubModal).name.toUpperCase()}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        const GradebookTable = ({ students, subjectId, onEditStudent, activeClassName }) => {
            const handleExportGradebook = () => {
                const subjectName = SUBJECTS.find(s => s.id === subjectId)?.name || "MonHoc";
                const fileName = `SoDiem_${subjectName}_${activeClassName}.xlsx`;
                
                const wb = XLSX.utils.book_new();
                
                // --- STYLES ---
                const borderStyle = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
                const headerStyle = { font: { name: "Times New Roman", sz: 11, bold: true }, border: borderStyle, alignment: { vertical: "center", horizontal: "center", wrapText: true } };
                const normalStyle = { font: { name: "Times New Roman", sz: 11 }, border: borderStyle, alignment: { vertical: "center", horizontal: "center" } };
                const nameStyle = { font: { name: "Times New Roman", sz: 11 }, border: borderStyle, alignment: { vertical: "center", horizontal: "left" } };

                // --- DATA PREPARATION ---
                const data = [];
                // Row 1: School Header - UPDATED AS REQUESTED
                data.push(["SỞ GIÁO DỤC VÀ ĐÀO TẠO LÂM ĐỒNG", "", "", "", "", "", "", "", "", "", ""]);
                data.push(["TRƯỜNG: TH, THCS & THPT YERSIN ĐÀ LẠT", "", "", "", "", "", "", "", "", "", ""]);
                // Row 3: Title
                data.push([`BẢNG ĐIỂM CHI TIẾT - MÔN ${subjectName.toUpperCase()} - HỌC KỲ 1 - NĂM HỌC 2025-2026`, "", "", "", "", "", "", "", "", "", ""]);
                // Row 4: Class info
                data.push([`Khối 12 - ${activeClassName}`, "", "", "", "", "", "", "", "", "", ""]);
                
                // Row 5: Column Headers (Top Level)
                data.push(["STT", "Họ và tên", "ĐĐGtx", "", "", "", "", "ĐĐG\ngk", "ĐĐG\nck", "ĐTB\nmhk", "Nhận xét"]);
                // Row 6: Column Headers (Sub Level for TX)
                data.push(["", "", "TX1", "TX2", "TX3", "TX4", "TX5", "", "", "", ""]);

                let goodCount = 0; let fairCount = 0; let passCount = 0; let failCount = 0;

                // Student Data Rows
                students.forEach((s, idx) => {
                    const scores = s.subjects?.[subjectId] || { tx: [], gk: null, ck: null };
                    const tx = scores.tx || [];
                    const avg = calculateSubjectAverage(scores);
                    
                    const evalText = getEvaluation(avg);
                    if (avg !== "") {
                        if (parseFloat(avg) >= 8.0) goodCount++;
                        else if (parseFloat(avg) >= 6.5) fairCount++;
                        else if (parseFloat(avg) >= 5.0) passCount++;
                        else failCount++;
                    }

                    data.push([
                        idx + 1,
                        s.name, // Combined Name
                        tx[0] || "", tx[1] || "", tx[2] || "", tx[3] || "", tx[4] || "",
                        scores.gk || "",
                        scores.ck || "",
                        avg || "",
                        evalText || ""
                    ]);
                });

                // Stats Rows (Footer)
                const totalStudents = students.length;
                const getPercent = (count) => totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) + "%" : "0%";
                
                const startRow = data.length;
                data.push(["THỐNG KÊ HỌC KỲ 1", "", "", "", "", "", "", "", "", "", ""]);
                data.push(["Số học sinh đạt", "Tốt", goodCount, "-", getPercent(goodCount), "", "", "", "", "", ""]);
                data.push(["Số lượng - Tỉ lệ (%)", "Khá", fairCount, "-", getPercent(fairCount), "", "", "", "", "", ""]);
                data.push(["", "Đạt", passCount, "-", getPercent(passCount), "", "", "", "", "", ""]);
                data.push(["", "Chưa", failCount, "-", getPercent(failCount), "", "", "", "", "", ""]);

                // Create Sheet
                const ws = XLSX.utils.aoa_to_sheet(data);

                // --- MERGES ---
                ws['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, // Header 1
                    { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }, // Header 2
                    { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } }, // Title
                    { s: { r: 3, c: 0 }, e: { r: 3, c: 10 } }, // Class Info
                    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },  // STT
                    { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },  // Ho va Ten Header (Merged Vertical)
                    { s: { r: 4, c: 2 }, e: { r: 4, c: 6 } },  // DDGtx Header (Span 5 cols)
                    { s: { r: 4, c: 7 }, e: { r: 5, c: 7 } },  // GK
                    { s: { r: 4, c: 8 }, e: { r: 5, c: 8 } },  // CK
                    { s: { r: 4, c: 9 }, e: { r: 5, c: 9 } }, // DTB
                    { s: { r: 4, c: 10 }, e: { r: 5, c: 10 } }, // Nhan xet
                    
                    // Stats Merges
                    { s: { r: startRow, c: 0 }, e: { r: startRow, c: 4 } }, // Stat Header
                    { s: { r: startRow + 1, c: 0 }, e: { r: startRow + 1, c: 0 } }, // "So hoc sinh dat" text 
                    { s: { r: startRow + 2, c: 0 }, e: { r: startRow + 4, c: 0 } }, // "So luong - Ti le" text vertical merge
                ];

                // --- COL WIDTHS ---
                ws['!cols'] = [
                    { wch: 5 }, { wch: 30 }, // Width for Name increased
                    { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, 
                    { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 15 }
                ];

                // --- APPLY STYLES ---
                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!ws[cellRef]) continue;

                        // Header Styling
                        if (R <= 3) {
                            ws[cellRef].s = { font: { name: "Times New Roman", sz: 12, bold: true }, alignment: { horizontal: "center" } };
                            if (R === 2) ws[cellRef].s.font.sz = 14;
                        } 
                        else if (R === 4 || R === 5) {
                            ws[cellRef].s = headerStyle;
                        }
                        // Data Styling
                        else if (R >= 6 && R < startRow) {
                            ws[cellRef].s = normalStyle;
                            if (C === 1) ws[cellRef].s = nameStyle; // Name
                            // Color Logic for GK/CK/DTB
                            if (C === 7 || C === 8) ws[cellRef].s = { ...normalStyle, fill: { fgColor: { rgb: "FFFFE0" } } }; // Yellowish for GK/CK columns
                        }
                        // Stats Styling
                        else if (R >= startRow) {
                            ws[cellRef].s = headerStyle;
                             if (C === 2 || C === 4) ws[cellRef].s = { ...headerStyle, font: { ...headerStyle.font, color: { rgb: "0000FF" } } }; // Blue text for numbers
                        }
                    }
                }

                XLSX.utils.book_append_sheet(wb, ws, subjectName);
                XLSX.writeFile(wb, fileName);
            };

            return (
                <div className="flex flex-col h-full">
                    <div className="flex justify-end mb-3">
                        <button onClick={handleExportGradebook} className="glass-button-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95">
                            <Icon name="download" size={16}/> Xuất Excel Chuẩn Mẫu
                        </button>
                    </div>
                    <div className="overflow-hidden glass-panel rounded-3xl flex-1 flex flex-col relative">
                        <div className="overflow-y-auto h-full custom-scrollbar pb-24">
                            {/* DESKTOP TABLE */}
                            <table className="w-full text-sm glass-table hidden md:table border-collapse">
                                <thead>
                                    <tr className="text-slate-600 bg-white/50">
                                        <th rowSpan="2" className="p-2 border border-slate-200">STT</th>
                                        <th rowSpan="2" className="p-2 border border-slate-200 text-left pl-4">Họ và tên</th>
                                        <th colSpan="5" className="p-2 border border-slate-200 text-center">ĐĐGtx (HS1)</th>
                                        <th rowSpan="2" className="p-2 border border-slate-200 w-16">GK (HS2)</th>
                                        <th rowSpan="2" className="p-2 border border-slate-200 w-16">CK (HS3)</th>
                                        <th rowSpan="2" className="p-2 border border-slate-200 w-16 text-blue-600">ĐTB</th>
                                        <th rowSpan="2" className="p-2 border border-slate-200 w-10">Sửa</th>
                                    </tr>
                                    <tr className="text-slate-500 text-xs bg-white/40">
                                        <th className="p-1 border border-slate-200 w-10 text-center">1</th>
                                        <th className="p-1 border border-slate-200 w-10 text-center">2</th>
                                        <th className="p-1 border border-slate-200 w-10 text-center">3</th>
                                        <th className="p-1 border border-slate-200 w-10 text-center">4</th>
                                        <th className="p-1 border border-slate-200 w-10 text-center">5</th>
                                    </tr>
                                </thead>
                                <tbody>{students.map((s, idx) => {
                                    const scores = s.subjects?.[subjectId] || { tx: [], gk: null, ck: null };
                                    const tx = scores.tx || [];
                                    const avg = calculateSubjectAverage(scores);
                                    
                                    return (
                                        <tr key={s.id} className="transition-colors group hover:bg-white/30">
                                            <td className="p-2 text-center text-slate-400 font-bold border border-slate-100">{idx + 1}</td>
                                            <td className="p-2 font-bold text-slate-700 border border-slate-100 text-left pl-4">{s.name}</td>
                                            
                                            {[0,1,2,3,4].map(i => (
                                                <td key={i} className="p-2 text-center border border-slate-100">
                                                    {tx[i] ? <span className="bg-white/60 px-2 py-1 rounded text-xs font-bold shadow-sm">{tx[i]}</span> : ''}
                                                </td>
                                            ))}
                                            
                                            <td className="p-2 text-center font-bold text-slate-700 border border-slate-100">{scores.gk||'-'}</td>
                                            <td className="p-2 text-center font-bold text-red-500 border border-slate-100">{scores.ck||'-'}</td>
                                            <td className="p-2 text-center font-black text-blue-600 border border-slate-100 bg-blue-50/30">{avg||'-'}</td>
                                            <td className="p-2 text-center border border-slate-100">
                                                <button onClick={()=>onEditStudent(s)} className="w-8 h-8 rounded-full hover:bg-white text-slate-400 hover:text-blue-500 flex items-center justify-center transition-all"><Icon name="edit-3" size={16}/></button>
                                            </td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                            
                            {/* MOBILE CARD LIST (NEW SMART VIEW) */}
                            <div className="md:hidden flex flex-col gap-3 p-4">
                                {students.map((s, idx) => {
                                    const scores = s.subjects?.[subjectId] || { tx: [], gk: null, ck: null };
                                    const avg = calculateSubjectAverage(scores);
                                    const avgNum = parseFloat(avg);
                                    const rankColor = avgNum >= 8 ? 'text-green-600' : (avgNum >= 6.5 ? 'text-blue-600' : (avgNum >= 5 ? 'text-orange-500' : 'text-red-500'));
                                    
                                    return (
                                        <div key={s.id} className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white shadow-inner flex items-center justify-center text-xl border-2 border-white">{s.avatar}</div>
                                                    <div>
                                                        <div className="font-black text-slate-800 text-sm">{s.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">STT: {idx + 1}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-2xl font-black ${avg ? rankColor : 'text-slate-300'}`}>{avg || '--'}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">ĐTB Môn</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white/50 rounded-xl p-3 border border-white/40 grid grid-cols-3 gap-2 text-center">
                                                <div className="flex flex-col gap-1 col-span-3 border-b border-slate-100 pb-2 mb-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Thường Xuyên (5 Cột)</span>
                                                    <div className="flex gap-1 flex-wrap justify-center">
                                                        {(scores.tx && scores.tx.length > 0) ? scores.tx.map((sc,i)=><span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-100 text-xs font-bold text-slate-600">{sc}</span>) : <span className="text-xs text-slate-300">-</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col border-r border-slate-100">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Giữa Kỳ</span>
                                                    <span className="font-bold text-slate-700">{scores.gk||'-'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Cuối Kỳ</span>
                                                    <span className="font-bold text-red-500">{scores.ck||'-'}</span>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <button onClick={()=>onEditStudent(s)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Icon name="edit-3" size={14}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const ExcelImportModal = ({ onClose, onImport, subjectId }) => {
            const [data, setData] = React.useState('');
            const [columnType, setColumnType] = React.useState('tx');
            const subject = SUBJECTS.find(s => s.id === subjectId);
            const handleImport = () => { if (data.trim()) { onImport(columnType, data.split(/\r?\n/).map(l => l.trim())); onClose(); } };
            return (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="glass-modal w-full max-w-lg rounded-3xl flex flex-col overflow-hidden animate-fade-in-up z-10">
                        <div className="p-5 bg-emerald-600 text-white flex justify-between items-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
                             <h3 className="font-bold flex items-center gap-2 relative z-10 text-lg"><Icon name="file-spreadsheet"/> Nhập Điểm Excel: {subject.name}</h3><button onClick={onClose} className="relative z-10 hover:bg-white/20 p-2 rounded-full transition-colors"><Icon name="x"/></button>
                        </div>
                        <div className="p-6 space-y-5 bg-white/40">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Chọn Cột Điểm:</label><div className="grid grid-cols-3 gap-3"><button onClick={() => setColumnType('tx')} className={`p-3 rounded-xl border text-xs font-bold transition-all ${columnType === 'tx' ? 'bg-emerald-100 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white/60 border-white text-slate-500'}`}>Thường Xuyên</button><button onClick={() => setColumnType('gk')} className={`p-3 rounded-xl border text-xs font-bold transition-all ${columnType === 'gk' ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm' : 'bg-white/60 border-white text-slate-500'}`}>Giữa Kỳ</button><button onClick={() => setColumnType('ck')} className={`p-3 rounded-xl border text-xs font-bold transition-all ${columnType === 'ck' ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-sm' : 'bg-white/60 border-white text-slate-500'}`}>Cuối Kỳ</button></div></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Dán Cột Điểm Excel:</label><textarea value={data} onChange={e => setData(e.target.value)} className="w-full h-48 p-4 bg-white/60 border border-white rounded-xl font-mono text-sm focus:ring-2 focus:ring-emerald-300 outline-none shadow-inner resize-none" placeholder="8.5&#10;9.0&#10;..."></textarea></div>
                            <button onClick={handleImport} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]">Xác Nhận Nhập</button>
                        </div>
                    </div>
                </div>
            );
        };

        const ClassManager = ({ classes, activeClassId, onSwitchClass, onAddClass, onDeleteClass, onClose }) => {
            const [newClassName, setNewClassName] = React.useState('');
            const [importText, setImportText] = React.useState('');
            const handleCreate = () => { if (!newClassName.trim()) return; onAddClass(newClassName, importText); setNewClassName(''); setImportText(''); };
            
            return (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                     <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
                    <div className="glass-modal w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col h-[85vh] animate-fade-in-up z-10">
                        
                        {/* Header */}
                        <div className="p-5 bg-slate-800 text-white flex justify-between items-center shadow-md z-10 shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
                            <h2 className="text-xl font-bold flex items-center gap-3 tracking-wide relative z-10">
                                <Icon name="layout-dashboard" className="text-blue-400"/> QUẢN LÝ LỚP HỌC
                            </h2>
                            <button onClick={onClose} className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition-colors text-gray-300 hover:text-white relative z-10">
                                <Icon name="x" size={20} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row h-full overflow-hidden">
                            {/* Left: Class List */}
                            <div className="w-full md:w-1/3 bg-slate-50/80 border-r border-white/50 flex flex-col backdrop-blur-sm">
                                <div className="p-4 border-b border-white/50 bg-white/30">
                                    <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                        <Icon name="list" size={14}/> Danh Sách Lớp ({classes.length})
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {classes.map(c => (
                                        <div key={c.id} onClick={() => onSwitchClass(c.id)} 
                                             className={`px-4 py-3 rounded-xl cursor-pointer flex justify-between items-center group transition-all border ${activeClassId === c.id ? 'bg-white shadow-md border-blue-200 ring-1 ring-blue-100' : 'bg-white/40 border-white hover:bg-white hover:shadow-sm'}`}>
                                            <div>
                                                <div className={`font-bold text-sm ${activeClassId === c.id ? 'text-blue-700' : 'text-slate-700'}`}>{c.name}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Icon name="users" size={12}/> {c.students.length} Học sinh</div>
                                            </div>
                                            {activeClassId === c.id && <Icon name="check-circle" size={18} className="text-blue-500"/>}
                                            {classes.length > 1 && <button onClick={(e) => {e.stopPropagation(); onDeleteClass(c.id)}} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-all"><Icon name="trash-2" size={16}/></button>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Add New */}
                            <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
                                <div className="p-6 border-b border-white/50">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <div className="p-2 bg-green-100 rounded-xl text-green-600 shadow-sm"><Icon name="plus-circle" size={20}/></div>
                                        Thêm Lớp Mới
                                    </h3>
                                </div>
                                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Tên Lớp</label>
                                        <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white bg-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold transition-all shadow-sm" placeholder="Ví dụ: 10A1" />
                                    </div>
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider flex justify-between">
                                            <span>Danh Sách Học Sinh</span>
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 lowercase">copy từ excel (1 tên/dòng)</span>
                                        </label>
                                        <textarea value={importText} onChange={e => setImportText(e.target.value)} className="w-full h-48 px-4 py-3 rounded-xl border border-white bg-white/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono leading-relaxed shadow-sm resize-none" placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C..."></textarea>
                                    </div>
                                    <button onClick={handleCreate} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]">
                                        <Icon name="save" size={18} /> TẠO LỚP & NHẬP DANH SÁCH
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const ToolsPanel = ({ students }) => {
            const [timer, setTimer] = React.useState(0);
            const [inputMinutes, setInputMinutes] = React.useState(5);
            const [isActive, setIsActive] = React.useState(false);
            const [showTimerOverlay, setShowTimerOverlay] = React.useState(false);
            
            const [chosen, setChosen] = React.useState(null);
            const [isSpinning, setIsSpinning] = React.useState(false);
            
            // Timer Logic
            React.useEffect(() => {
                let interval = null;
                if (isActive && timer > 0) { interval = setInterval(() => setTimer(timer => timer - 1), 1000); } 
                else if (timer === 0 && isActive) { setIsActive(false); setShowTimerOverlay(false); showToast("Hết giờ!", "success"); }
                return () => clearInterval(interval);
            }, [isActive, timer]);

            const startTimer = () => {
                const totalSeconds = inputMinutes * 60;
                if (totalSeconds > 0) {
                    setTimer(totalSeconds);
                    setIsActive(true);
                    setShowTimerOverlay(true);
                }
            };

            const stopTimer = () => { setIsActive(false); setShowTimerOverlay(false); };

            // Wheel Logic
            const spinWheel = () => {
                if (isSpinning) return;
                setIsSpinning(true);
                setChosen(null); 
                let count = 0;
                const maxSpins = 30;
                
                const interval = setInterval(() => { 
                    setChosen(students[Math.floor(Math.random() * students.length)]); 
                    count++; 
                    if(count > maxSpins) { 
                        clearInterval(interval); 
                        setIsSpinning(false);
                        // Trigger Confetti
                        if (window.confetti) {
                            window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                        }
                    } 
                }, 80);
            };

            const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                    {/* LUCKY WHEEL */}
                    <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center min-h-[350px] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 opacity-50 z-0"></div>
                        <div className="relative z-10 w-full flex flex-col items-center">
                            <div className={`w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-pink-100 ${isSpinning ? 'animate-spin' : ''}`}>
                                <span className="text-5xl">🎡</span>
                            </div>
                            <h3 className="font-black text-2xl text-slate-800 mb-4 font-display">Vòng Quay May Mắn</h3>
                            
                            <div className="h-40 flex items-center justify-center mb-6 w-full">
                                {chosen ? (
                                    <div className="flex flex-col items-center animate-bounce-slow">
                                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-3 transform hover:scale-110 transition-transform">
                                            {chosen.avatarUrl ? <img src={chosen.avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-pink-100 flex items-center justify-center text-4xl">{chosen.avatar || '🦁'}</div>}
                                        </div>
                                        <div className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 drop-shadow-sm px-2 text-center leading-tight min-h-[3rem] flex items-center justify-center">{chosen.name}</div>
                                    </div>
                                ) : (
                                    <div className="text-slate-400 font-medium italic flex flex-col items-center gap-2">
                                        <span className="text-4xl opacity-50">✨</span>
                                        <span>Ai sẽ là người được chọn?</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={spinWheel} disabled={isSpinning} className="glass-button-primary w-full py-4 rounded-xl font-bold shadow-lg transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95">
                                {isSpinning ? <><Icon name="loader-2" className="animate-spin"/> ĐANG QUAY...</> : 'QUAY NGAY'}
                            </button>
                        </div>
                    </div>
                    
                    {/* COUNTDOWN TIMER */}
                    <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center min-h-[350px] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50 z-0"></div>
                        <div className="relative z-10 w-full flex flex-col items-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-blue-100">
                                <Icon name="clock" size={40} className="text-blue-500"/>
                            </div>
                            <h3 className="font-black text-2xl text-slate-800 mb-2 font-display">Đếm Ngược Vui Vẻ</h3>
                            
                            <div className="my-6 w-full max-w-xs">
                                <div className="flex items-center gap-2 mb-4 bg-white/60 p-2 rounded-xl border border-white">
                                    <button onClick={()=>setInputMinutes(Math.max(1, inputMinutes-1))} className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 transition-colors">-</button>
                                    <div className="flex-1 text-center font-black text-2xl text-slate-700 font-cute">{inputMinutes} phút</div>
                                    <button onClick={()=>setInputMinutes(inputMinutes+1)} className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 transition-colors">+</button>
                                </div>
                            </div>

                            <button onClick={startTimer} className="w-full py-4 rounded-xl font-bold shadow-lg transition-all text-white text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transform active:scale-95 flex items-center justify-center gap-2">
                                <Icon name="play" fill="currentColor" /> BẮT ĐẦU ĐẾM
                            </button>
                        </div>
                    </div>

                    {/* FULL SCREEN OVERLAY TIMER */}
                    {showTimerOverlay && (
                        <div className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-fade-in-up">
                            <button onClick={stopTimer} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all">
                                <Icon name="x" size={32} />
                            </button>
                            <div className="font-cute text-[12vw] font-bold leading-none tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 drop-shadow-[0_10px_30px_rgba(245,158,11,0.5)] animate-pulse">
                                {formatTime(timer)}
                            </div>
                            <div className="mt-8 text-2xl md:text-4xl font-display text-slate-300 animate-bounce">Sắp hết giờ rồi nha! 🏃💨</div>
                        </div>
                    )}
                </div>
            );
        };

        // --- 7. MAIN APP ---
        const App = () => {
            const [user, setUser] = React.useState(null);
            const [showStart, setShowStart] = React.useState(true);
            const [activeTab, setActiveTab] = React.useState('dashboard');
            const [selectedSubject, setSelectedSubject] = React.useState('math');
            const [classes, setClasses] = React.useState([]);
            const [activeClassId, setActiveClassId] = React.useState(null);
            
            const [showImport, setShowImport] = React.useState(false);
            const [showClassManager, setShowClassManager] = React.useState(false);
            const [selectedStudent, setSelectedStudent] = React.useState(null);

            // --- FIREBASE INIT ---
            React.useEffect(() => {
                if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
                const unsubscribe = firebase.auth().onAuthStateChanged(u => {
                    setUser(u);
                    if (u) {
                        showToast(`Xin chào, ${u.displayName}!`, 'success');
                        firebase.database().ref(`users/${u.uid}/data`).once('value').then(snapshot => {
                            const val = snapshot.val();
                            if (val) {
                                setClasses(val.classes || []);
                                setActiveClassId(val.activeId || null);
                                // UPDATED: Do NOT auto-hide start screen here. Let user click "Start".
                            } else {
                                initDefaultData();
                                // Same here
                            }
                        });
                    }
                });
                return () => unsubscribe();
            }, []);

            const initDefaultData = () => {
                const defaultStudents = DEFAULT_STUDENTS.map((n, i) => ({ id: 's_' + i, name: n, points: 0, avatar: ANIMAL_AVATARS[i % ANIMAL_AVATARS.length], subjects: {} }));
                const defaultClass = { id: 'c_default', name: DEFAULT_CLASS_NAME, students: defaultStudents };
                setClasses([defaultClass]);
                setActiveClassId(defaultClass.id);
            };

            React.useEffect(() => {
                if (classes.length === 0) return;
                if (user) {
                    const debounceSync = setTimeout(() => { firebase.database().ref(`users/${user.uid}/data`).set({ classes, activeId: activeClassId }); }, 1000);
                    return () => clearTimeout(debounceSync);
                } else {
                    localStorage.setItem('gradebook_yersin_data', JSON.stringify({ classes, activeId: activeClassId }));
                }
            }, [classes, activeClassId, user]);

            React.useEffect(() => {
                if (!user && showStart === false) {
                    const saved = localStorage.getItem('gradebook_yersin_data');
                    if (saved) { const parsed = JSON.parse(saved); setClasses(parsed.classes); setActiveClassId(parsed.activeId); } 
                    else if (classes.length === 0) { initDefaultData(); }
                }
            }, [user, showStart]);

            const activeClass = classes.find(c => c.id === activeClassId) || classes[0];
            const students = activeClass ? activeClass.students : [];
            const topStudentIds = React.useMemo(() => {
                const sorted = [...students].sort((a, b) => (b.points || 0) - (a.points || 0));
                return sorted.slice(0, 3).map(s => s.id);
            }, [students]);

            const handleLogin = () => { const provider = new firebase.auth.GoogleAuthProvider(); firebase.auth().signInWithPopup(provider).catch(e => alert("Lỗi: " + e.message)); };
            const handleLogout = () => { if(confirm("Đăng xuất?")) firebase.auth().signOut().then(() => { setShowStart(true); setClasses([]); }); };

            const handleUpdateStudent = (studentId, newData) => { setClasses(prev => prev.map(c => { if (c.id !== activeClassId) return c; return { ...c, students: c.students.map(s => s.id === studentId ? { ...s, ...newData } : s) }; })); };
            const updatePoints = (id, delta) => { const s = students.find(x => x.id === id); if (s) handleUpdateStudent(id, { points: Math.max(0, (s.points || 0) + delta) }); };
            const updateScores = (studentId, subjectId, newScores) => { const s = students.find(x => x.id === studentId); if (s) { handleUpdateStudent(studentId, { subjects: { ...s.subjects, [subjectId]: newScores } }); } };
            
            const handleBulkImport = (columnType, scoresList) => {
                setClasses(prev => prev.map(c => {
                    if (c.id !== activeClassId) return c;
                    const newStudents = c.students.map((s, idx) => {
                        const rawScore = scoresList[idx];
                        if (rawScore === undefined || rawScore === '') return s;
                        const val = parseFloat(rawScore);
                        if (isNaN(val)) return s;
                        const currentSub = s.subjects?.[selectedSubject] || { tx: [], gk: null, ck: null };
                        let newSubData = { ...currentSub };
                        if (columnType === 'tx') newSubData.tx = [...(newSubData.tx || []), val];
                        else if (columnType === 'gk') newSubData.gk = val;
                        else if (columnType === 'ck') newSubData.ck = val;
                        return { ...s, subjects: { ...s.subjects, [selectedSubject]: newSubData } };
                    });
                    return { ...c, students: newStudents };
                }));
            };

            const resetData = () => { if(confirm("Xóa hết dữ liệu lớp này?")) { setClasses(prev => prev.map(c => c.id === activeClassId ? { ...c, students: c.students.map(s => ({ ...s, points: 0, subjects: {} })) } : c)); } };
            const handleAddClass = (name, importText) => { const names = importText.split(/\r?\n/).map(n => n.trim()).filter(n => n); const newStudents = names.length > 0 ? names.map((n, i) => ({ id: Date.now() + '_' + i, name: n, points: 0, avatar: ANIMAL_AVATARS[i % ANIMAL_AVATARS.length], subjects: {} })) : []; const newClass = { id: 'class_' + Date.now(), name, students: newStudents }; setClasses(prev => [...prev, newClass]); setActiveClassId(newClass.id); setShowClassManager(false); };
            const handleDeleteClass = (id) => { if(confirm("Xóa lớp này vĩnh viễn?")) { const newClasses = classes.filter(c => c.id !== id); setClasses(newClasses); if(activeClassId === id && newClasses.length > 0) setActiveClassId(newClasses[0].id); } };

            const toggleFullScreen = () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    if (document.exitFullscreen) document.exitFullscreen();
                }
            };

            if (showStart) return <StartScreen onStart={() => setShowStart(false)} onLogin={handleLogin} user={user} />;
            if (!activeClass) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div></div>;

            return (
                <div className="min-h-screen flex flex-col md:flex-row p-4 md:p-6 gap-4 max-w-[1600px] mx-auto relative">
                    
                    {/* Full Screen Toggle Button */}
                    <button onClick={toggleFullScreen} className="fixed top-4 right-4 z-50 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all text-slate-500 hover:text-slate-800">
                        <Icon name="maximize" size={20}/>
                    </button>

                    {selectedStudent && <StudentDetailModal student={selectedStudent} subjectId={selectedSubject} onClose={()=>setSelectedStudent(null)} onUpdateScore={updateScores} onUpdatePoints={updatePoints} />}
                    {showImport && <ExcelImportModal subjectId={selectedSubject} onClose={()=>setShowImport(false)} onImport={handleBulkImport} />}
                    {showClassManager && <ClassManager classes={classes} activeClassId={activeClassId} onSwitchClass={(id) => { setActiveClassId(id); setShowClassManager(false); }} onAddClass={handleAddClass} onDeleteClass={handleDeleteClass} onClose={()=>setShowClassManager(false)} />}

                    {/* Sidebar */}
                    <div className="hidden md:flex flex-col w-72 glass-panel rounded-[2.5rem] p-6 h-[90vh] sticky top-6">
                        <div className="mb-8 flex flex-col items-center justify-center gap-2">
                            <h1 className="font-black text-2xl leading-tight tracking-tight animate-fade-in-up text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 drop-shadow-sm">SỔ ĐIỂM<br/>GAMIFICATION</h1>
                            <div onClick={()=>setShowClassManager(true)} className="glass-button w-full px-4 py-3 rounded-2xl font-bold text-blue-600 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md"><Icon name="library" size={18}/> {activeClass.name} <Icon name="chevron-down" size={16}/></div>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            {[{id:'dashboard',l:'Thi Đua & Avatar',i:'layout-grid'}, {id:'gradebook',l:'Sổ Điểm (TT22)',i:'table-2'}, {id:'tools',l:'Công Cụ Lớp Học',i:'wrench'}].map(t => (
                                <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] font-bold text-base transition-all duration-300 group border ${activeTab===t.id ? 'bg-white/80 text-pink-600 shadow-lg border-white ring-2 ring-pink-100/50' : 'text-slate-500 hover:bg-white/40 hover:text-pink-500 border-transparent'}`}>
                                    <Icon name={t.i} size={20} className={`transition-colors ${activeTab===t.id ? 'text-pink-500' : 'group-hover:text-pink-400'}`}/> {t.l}
                                </button>
                            ))}
                        </div>
                        <div className="mt-auto space-y-3">
                            <div className="flex items-center justify-center gap-2">
                                {user ? <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full shadow-sm"><span className="status-dot online"></span> {user.displayName}</span> : <span className="text-xs font-bold text-slate-400">Chưa đăng nhập</span>}
                            </div>
                            <button onClick={user ? handleLogout : handleLogin} className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold rounded-xl transition-colors shadow-sm ${user ? 'text-red-500 bg-red-50/50 hover:bg-red-100' : 'text-blue-500 bg-blue-50/50 hover:bg-blue-100'}`}>
                                <Icon name={user ? 'log-out' : 'log-in'} size={16}/> {user ? 'Đăng Xuất' : 'Đăng Nhập Cloud'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden flex justify-between items-center glass-panel p-4 rounded-2xl shadow-sm mb-2 sticky top-2 z-40">
                        <div onClick={() => setShowClassManager(true)} className="flex items-center gap-2">
                            <span className="font-black text-pink-600 text-lg">{activeClass.name}</span>
                            <Icon name="chevron-down" size={16} className="text-gray-400"/>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={()=>setActiveTab('dashboard')} className={`p-2 rounded-xl transition-all ${activeTab==='dashboard'?'bg-pink-100 text-pink-600 shadow-inner':'text-slate-400'}`}><Icon name="layout-grid" size={24}/></button>
                            <button onClick={()=>setActiveTab('gradebook')} className={`p-2 rounded-xl transition-all ${activeTab==='gradebook'?'bg-blue-100 text-blue-600 shadow-inner':'text-slate-400'}`}><Icon name="table-2" size={24}/></button>
                            <button onClick={()=>setActiveTab('tools')} className={`p-2 rounded-xl transition-all ${activeTab==='tools'?'bg-orange-100 text-orange-600 shadow-inner':'text-slate-400'}`}><Icon name="wrench" size={24}/></button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 glass-panel rounded-[2.5rem] p-4 md:p-8 overflow-hidden min-h-[85vh] flex flex-col relative">
                        {activeTab === 'dashboard' && (
                            <div className="h-full overflow-y-auto pb-20 custom-scrollbar">
                                <div className="flex justify-between items-end mb-8 px-2">
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-800 mb-1">Thi Đua</h2>
                                        <p className="text-slate-500 font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Chạm thẻ để tương tác</p>
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 drop-shadow-sm">{students.reduce((a,b)=>a+(b.points||0),0)}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng điểm lớp</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                    {students.map(s => (
                                        <StudentCard key={s.id} student={s} onAddPoint={updatePoints} isTopRanked={topStudentIds.includes(s.id)} onClick={() => setSelectedStudent(s)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'gradebook' && (
                            <div className="h-full flex flex-col">
                                <div className="mb-8 px-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-800 mb-1">Sổ Điểm Điện Tử</h2>
                                        <p className="text-slate-500 font-medium">Chuẩn Thông tư 22/2021/TT-BGDĐT</p>
                                    </div>
                                    <div className="flex gap-3 bg-white/40 p-2 rounded-2xl border border-white/50">
                                        <select value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)} className="bg-white/80 border border-white text-slate-700 font-bold py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm cursor-pointer">
                                            {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <button onClick={()=>setShowImport(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all hover:-translate-y-0.5"><Icon name="file-spreadsheet" size={18}/> Nhập Excel</button>
                                    </div>
                                </div>
                                <GradebookTable students={students} subjectId={selectedSubject} onEditStudent={setSelectedStudent} activeClassName={activeClass.name} />
                            </div>
                        )}

                        {activeTab === 'tools' && (
                             <div className="h-full overflow-y-auto pb-20 custom-scrollbar">
                                <div className="mb-8 px-2"><h2 className="text-3xl font-black text-slate-800">Tiện Ích Lớp Học</h2><p className="text-slate-500 font-medium">Công cụ hỗ trợ giảng dạy vui nhộn</p></div>
                                <ToolsPanel students={students} />
                             </div>
                        )}
                    </div>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);