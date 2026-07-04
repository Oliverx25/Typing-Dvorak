import { t as __exportAll } from "./compiler_CkZkdNPW.mjs";
import { A as createComponent, E as addAttribute, T as renderHead, b as renderSlot, k as createAstro, x as renderTemplate, y as renderComponent } from "./render_5Y2nopdm.mjs";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { createClient } from "@supabase/supabase-js";
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title = "Typing Dvorak", description = "Practice touch typing with the Dvorak Simplified Keyboard layout." } = Astro.props;
	return renderTemplate`<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><meta name="theme-color" content="#6366f1"><meta property="og:type" content="website"><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:url"${addAttribute("https://typing-dvorak.vercel.app", "content")}><meta name="twitter:card" content="summary"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"><title>${title}</title><script>
      (function () {
        const stored = localStorage.getItem('typing-dvorak-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';
        if (theme === 'dark') document.documentElement.classList.add('dark');
        const loc = localStorage.getItem('typing-dvorak-settings');
        const hl = {
          indigo: { light: ['#6366f1', '#4f46e5'], dark: ['#818cf8', '#6366f1'] },
          emerald: { light: ['#22c55e', '#16a34a'], dark: ['#4ade80', '#22c55e'] },
          cyan: { light: ['#0891b2', '#0e7490'], dark: ['#22d3ee', '#06b6d4'] },
          violet: { light: ['#7c3aed', '#6d28d9'], dark: ['#a78bfa', '#8b5cf6'] },
          amber: { light: ['#d97706', '#b45309'], dark: ['#fbbf24', '#f59e0b'] },
        };
        let highlightId = 'indigo';
        if (loc) {
          try {
            const settings = JSON.parse(loc);
            document.documentElement.lang = settings.locale || 'en';
            if (hl[settings.highlightTheme]) highlightId = settings.highlightTheme;
          } catch {}
        }
        const pair = hl[highlightId][theme];
        document.documentElement.style.setProperty('--color-highlight', pair[0]);
        document.documentElement.style.setProperty('--color-highlight-hover', pair[1]);
      })();
    <\/script>${renderHead($$result)}</head><body class="min-h-screen antialiased"><noscript><div style="max-width:40rem;margin:2rem auto;padding:1.5rem;font-family:system-ui,sans-serif;text-align:center"><h1>Typing Dvorak</h1><p>JavaScript is required. Enable it and open <a href="/lessons">the lessons page</a>.</p></div></noscript>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "/Users/oliverolvera/Documents/GitHub - Personal/Typing-Dvorak/src/layouts/Layout.astro", void 0);
//#endregion
//#region src/i18n/en.ts
var en = {
	siteName: "Typing Dvorak",
	footer: "Built with Astro · Practice the Dvorak layout daily",
	nav: {
		lessons: "Lessons",
		stats: "Stats",
		multiplayer: "Multiplayer",
		settings: "Settings",
		backToLessons: "Back to lessons"
	},
	landing: {
		badge: "Dvorak Simplified Keyboard",
		title: "Type faster with",
		titleAccent: "less finger travel",
		subtitle: "Progressive lessons, on-screen keyboard, hand guides, and stats — practice the Dvorak layout at your own pace. No account required.",
		startPracticing: "Start practicing →",
		createAccount: "Create free account",
		openApp: "Open app",
		continuePracticing: "Continue practicing →",
		viewStats: "View stats",
		welcomeBack: "Welcome back — pick up where you left off.",
		featureLessonsTitle: "12 progressive lessons",
		featureLessonsDesc: "From home row to advanced drills. Unlock the next lesson at 90% accuracy.",
		featureFeedbackTitle: "Live feedback",
		featureFeedbackDesc: "WPM, accuracy, visual keyboard, and finger guides while you type.",
		featureSyncTitle: "Optional cloud sync",
		featureSyncDesc: "Sign in with GitHub, Google, or email to back up progress. Works offline without an account.",
		homeRowCaption: "The Dvorak home row — 70% of typing happens here.",
		goToLessons: "Go to lessons",
		builtWith: "Built with Astro"
	},
	home: {
		title: "Master the",
		titleAccent: "Dvorak",
		titleEnd: "layout",
		subtitle: "Progressive lessons, live feedback, and on-screen keyboard visualization. Build muscle memory one row at a time.",
		lessonsHeading: "Lessons",
		recommended: "Recommended next",
		curriculumProgress: "Curriculum progress",
		homeRowTitle: "Dvorak home row",
		homeRowKeys: "a o e u i · d h t n s",
		homeRowDesc: "The Dvorak layout places the most common letters on the home row, reducing finger travel by up to 70% compared to QWERTY.",
		qwertyTitle: "QWERTY vs Dvorak",
		qwertyDesc: "See how common letters move to more efficient positions on Dvorak.",
		recentSessions: "Recent sessions",
		locked: "Locked",
		bestWpm: "Best",
		startLesson: "Start lesson",
		completePrevious: "Complete the previous lesson with 90%+ accuracy to unlock.",
		heatmapTitle: "Key accuracy heatmap",
		heatmapDesc: "Keys in red are the ones you miss most often — focus your practice there.",
		heatmapNoData: "Not practiced",
		heatmapGood: "Accurate",
		heatmapBad: "Needs work",
		adaptiveLabel: "Personalized",
		adaptiveTitle: "Adaptive drill",
		adaptiveDesc: "Practice generated from your weakest keys based on your heatmap data.",
		customPractice: "Custom text practice",
		customPracticeDesc: "Paste your own paragraph and practice at your pace.",
		badgesTitle: "Achievements",
		microLessons: "micro-lessons",
		allLessons: "All lessons",
		yourNextStep: "Your next step",
		continueWith: "Continue with {lesson}",
		lessonLibrary: "Lesson library",
		extraPractice: "Extra practice",
		pasteText: "Paste text",
		learnMoreTitle: "Learn more about Dvorak (optional)",
		inProgress: "In progress — tap to continue",
		selectedChapter: "Selected chapter",
		reviewLesson: "Review {lesson}",
		tapToReview: "Tap to review micro-lessons",
		backToRecommended: "Back to your next step"
	},
	auth: {
		signInGithub: "GitHub",
		signInGoogle: "Google",
		signOut: "Sign out",
		loginTitle: "Welcome back",
		loginSubtitle: "Sign in to sync your progress across devices.",
		signupTitle: "Create account",
		signupSubtitle: "Save your stats and unlock cloud backup.",
		forgotTitle: "Reset password",
		forgotSubtitle: "We will email you a link to choose a new password.",
		resetTitle: "New password",
		resetSubtitle: "Enter your new password below.",
		email: "Email",
		password: "Password",
		confirmPassword: "Confirm password",
		signIn: "Sign in",
		signUp: "Sign up",
		sendResetLink: "Send reset link",
		savePassword: "Save password",
		forgotPassword: "Forgot password?",
		noAccount: "No account?",
		hasAccount: "Already have an account?",
		continueWithout: "Continue without account",
		orContinueWith: "Or continue with",
		checkEmail: "Check your email to confirm your account.",
		resetEmailSent: "If that email exists, a reset link is on its way.",
		passwordMismatch: "Passwords do not match.",
		passwordTooShort: "Password must be at least 8 characters.",
		signingIn: "Signing in…",
		redirecting: "Redirecting…",
		changePhoto: "Change profile photo",
		changePhotoDesc: "Upload JPG, PNG or WebP (max 2 MB).",
		uploadPhoto: "Upload photo",
		removePhoto: "Remove custom photo",
		cancel: "Cancel",
		avatarInvalidType: "Use JPG, PNG or WebP.",
		avatarTooLarge: "Image must be 2 MB or smaller.",
		avatarNotConfigured: "Cloud storage is not configured.",
		avatarNotAuthenticated: "Sign in to update your photo.",
		viewAchievements: "Achievements"
	},
	achievements: {
		title: "Achievements",
		subtitle: "Unlock badges by practicing consistently, improving speed, and mastering the curriculum.",
		unlockedCount: "Unlocked",
		totalCount: "Total",
		completionRate: "Complete",
		unlockedLabel: "Unlocked",
		lockedLabel: "Locked",
		progressLabel: "Progress",
		guestHint: "Progress is saved on this device. Sign in to sync achievements across devices.",
		syncHint: "Your unlocked badges sync automatically when you complete a session."
	},
	lesson: {
		practice: "Practice",
		test: "Test",
		practiceDesc: "Relaxed mode — backspace allowed, finish the text.",
		testDesc: "60s timed test — backspace allowed, errors still penalize WPM.",
		startTyping: "Start typing to begin the lesson",
		timeRemaining: "Time left",
		lockedTitle: "Lesson locked",
		lockedDesc: "Complete the previous lesson with at least 90% accuracy to unlock this one.",
		goBack: "Go to lessons",
		paused: "Paused",
		resume: "Resume",
		pauseHint: "Press Esc to pause · resume when ready"
	},
	stats: {
		title: "Your progress",
		subtitle: "Track WPM, accuracy, and practice streaks over time.",
		totalSessions: "Total sessions",
		bestWpm: "Best WPM",
		avgAccuracy: "Avg. accuracy",
		streak: "Day streak",
		wpmOverTime: "WPM over time",
		byLesson: "By lesson",
		noData: "Complete a lesson to see your stats here.",
		lesson: "Lesson",
		wpm: "WPM",
		accuracy: "Accuracy",
		date: "Date",
		heatmapTitle: "Key accuracy heatmap",
		heatmapDesc: "Red keys = most errors. Green = accurate.",
		heatmapNoData: "Complete a lesson to generate heatmap data.",
		chartHint: "Historical WPM from your last sessions.",
		sessionsRecorded: "sessions recorded"
	},
	settings: {
		title: "Settings",
		language: "Language",
		sound: "Sound effects",
		soundDesc: "Play sounds on correct and incorrect keystrokes",
		blindMode: "Blind mode",
		blindDesc: "Hide the on-screen keyboard during practice",
		fingerColors: "Finger colors",
		fingerDesc: "Color keys by finger assignment on the keyboard",
		reducedMotion: "Respects system reduced-motion preference",
		exportData: "Export progress",
		exportDesc: "Download a JSON backup of your sessions and stats",
		importData: "Import progress",
		importDesc: "Restore from a previously exported JSON file",
		exportBtn: "Download backup",
		importBtn: "Choose file",
		importSuccess: "Progress restored successfully",
		importError: "Invalid backup file",
		highlightTheme: "Highlight theme",
		highlightThemeDesc: "Accent color for lessons, progress, and practice actions",
		highlightThemes: {
			indigo: "Indigo",
			emerald: "Emerald",
			cyan: "Cyan",
			violet: "Violet",
			amber: "Amber"
		}
	},
	categories: {
		drill: "Key Drill",
		words: "Words",
		sentences: "Sentences",
		punctuation: "Punctuation",
		numbers: "Numbers",
		symbols: "Symbols"
	},
	difficulty: [
		"",
		"Beginner",
		"Easy",
		"Medium",
		"Hard",
		"Expert"
	],
	typing: {
		wpm: "WPM",
		accuracy: "Accuracy",
		time: "Time",
		nextKey: "Next key",
		pressed: "Pressed",
		homeGuides: "Home guides (U · H)",
		dvorakLayout: "Dvorak Layout",
		fingers: "Fingers",
		leftHand: "Left",
		rightHand: "Right",
		showKeyboard: "Show keyboard",
		hideKeyboard: "Hide keyboard",
		thumb: "Thumb"
	},
	completion: {
		perfect: "Perfect run!",
		complete: "Lesson complete!",
		perfectDesc: "Flawless accuracy — great work.",
		keepGoing: "Keep practicing to improve your speed.",
		tryAgain: "Try again",
		newRecord: "New personal best!",
		improved: "Improved by {delta} WPM",
		weakKeys: "Keys to focus on",
		weakKeysHint: "These keys caused the most errors in this session.",
		starsEarned: "Stars earned"
	},
	fingers: {
		lp: "L. pinky",
		lr: "L. ring",
		lm: "L. middle",
		li: "L. index",
		ri: "R. index",
		rm: "R. middle",
		rr: "R. ring",
		rp: "R. pinky"
	},
	badges: {
		firstLesson: "First steps",
		firstLessonDesc: "Complete your first lesson.",
		streak7: "Week warrior",
		streak7Desc: "Practice 7 days in a row.",
		wpm50: "Speed demon",
		wpm50Desc: "Reach 50 WPM in any session.",
		perfectRun: "Flawless",
		perfectRunDesc: "Finish a session with 100% accuracy.",
		curriculumDone: "Graduate",
		curriculumDoneDesc: "Master every core lesson with 90%+ accuracy."
	},
	custom: {
		title: "Custom practice",
		desc: "Paste any text you want to practice — articles, code snippets, or your own writing.",
		placeholder: "Paste or type your practice text here (min. 10 characters)...",
		chars: "characters",
		start: "Start practice",
		editText: "Edit text"
	},
	lessonMeta: {
		homeRow: {
			title: "Home Row",
			description: "Master the foundation: A O E U I and D H T N S."
		},
		topRow: {
			title: "Top Row",
			description: "Practice the top row: ' , . P Y F G C R L."
		},
		bottomRow: {
			title: "Bottom Row",
			description: "Train the bottom row: ; Q J K X B M W V Z."
		},
		punctuation: {
			title: "Punctuation",
			description: "Practice symbols: ' , . ; - / ="
		},
		numbers: {
			title: "Numbers",
			description: "Train the number row: 0–9."
		},
		shiftCaps: {
			title: "Shift & Caps",
			description: "Practice capital letters using the Shift keys."
		},
		allRows: {
			title: "All Rows",
			description: "Combine every row into fluid typing patterns."
		},
		commonWords: {
			title: "Common Words",
			description: "High-frequency English words optimized for Dvorak."
		},
		sentences: {
			title: "Sentences",
			description: "Full sentences to build rhythm and accuracy."
		},
		devSymbols: {
			title: "Developer Symbols",
			description: "Brackets, operators, and code punctuation for programmers."
		},
		advanced: {
			title: "Advanced Challenge",
			description: "Longer passages for experienced Dvorak typists."
		},
		adaptiveDrill: {
			title: "Adaptive Drill",
			description: "Personalized practice targeting your weakest keys."
		},
		customPractice: {
			title: "Custom Practice",
			description: "Type your own text at your own pace."
		},
		codeMode: {
			title: "Code Mode",
			description: "Real code snippets for developers."
		},
		spanishDvorak: {
			title: "Spanish Dvorak",
			description: "Accents, ñ, and Spanish pangrams."
		}
	},
	microLessons: {
		homeLeft: "Left hand (A O E U)",
		homeRight: "Right hand (D H T N)",
		homeFull: "Full home row",
		topNivel1: "Level 1 (P G C R L)",
		topNivel2: "Level 2 (F V Z X)",
		topFull: "Full top row",
		bottomNivel1: "Level 1 (Q J K X)",
		bottomNivel2: "Level 2 (B M W V)",
		bottomFull: "Full bottom row",
		codeHtml: "HTML tags",
		codeTs: "TypeScript syntax",
		codeFull: "Full code challenge",
		esAccents: "Accents (á é í ó ú)",
		esEnye: "Letter ñ",
		esFull: "Spanish pangrams"
	},
	qwerty: {
		qwerty: "QWERTY",
		dvorak: "Dvorak",
		vowelsTitle: "Grouped vowels",
		vowelsDesc: "All vowels (A, O, E, U, I) rest under your left hand.",
		homeRowTitle: "70% on home row",
		homeRowDesc: "Your fingers travel much less compared to 32% usage on QWERTY.",
		alternationTitle: "Natural alternation",
		alternationDesc: "The most common consonants sit on the right hand, creating a fluid rhythm between both hands."
	},
	multiplayer: {
		title: "Multiplayer",
		subtitle: "Create a room or join with a code. Everyone marks ready to start.",
		lobbyTitle: "Lobby",
		lobbySubtitle: "Wait for players, then mark yourself ready.",
		backToLobby: "Back to multiplayer",
		createRoom: "Create room",
		createRoomDesc: "Generate a code and share it with friends.",
		createRoomAction: "Create new room",
		joinRoom: "Join room",
		joinRoomDesc: "Enter the code shared by the host.",
		joinRoomAction: "Join",
		roomCode: "Room code",
		roomCodePlaceholder: "ABC123",
		playersReady: "{ready} / {total} ready",
		ready: "Ready",
		notReady: "Waiting",
		you: "you",
		markReady: "Mark ready",
		unready: "Cancel ready",
		leaveRoom: "Leave room",
		connecting: "Connecting…",
		connected: "Connected",
		waiting: "Waiting for players…",
		connectionError: "Could not connect to the room.",
		timedOut: "Connection timed out.",
		allReady: "Everyone is ready — starting match…",
		raceProgress: "Race progress",
		waitingForOpponentProgress: "Opponent progress will appear when they start typing.",
		signInRequired: "Sign in to join multiplayer lobbies.",
		notConfigured: "Multiplayer requires Supabase to be configured."
	}
};
//#endregion
//#region src/i18n/index.ts
var translations = {
	en,
	es: {
		siteName: "Typing Dvorak",
		footer: "Hecho con Astro · Practica el layout Dvorak cada día",
		nav: {
			lessons: "Lecciones",
			stats: "Estadísticas",
			multiplayer: "Multijugador",
			settings: "Ajustes",
			backToLessons: "Volver a lecciones"
		},
		landing: {
			badge: "Distribución Dvorak simplificado",
			title: "Escribe más rápido con",
			titleAccent: "menos recorrido de dedos",
			subtitle: "Lecciones progresivas, teclado en pantalla, guías de manos y estadísticas — practica Dvorak a tu ritmo. No necesitas cuenta.",
			startPracticing: "Empezar a practicar →",
			createAccount: "Crear cuenta gratis",
			openApp: "Abrir app",
			continuePracticing: "Continuar practicando →",
			viewStats: "Ver estadísticas",
			welcomeBack: "Bienvenido de nuevo — retoma donde lo dejaste.",
			featureLessonsTitle: "12 lecciones progresivas",
			featureLessonsDesc: "Desde la fila base hasta ejercicios avanzados. Desbloquea la siguiente lección con 90% de precisión.",
			featureFeedbackTitle: "Retroalimentación en vivo",
			featureFeedbackDesc: "PPM, precisión, teclado visual y guías de dedos mientras escribes.",
			featureSyncTitle: "Sincronización opcional",
			featureSyncDesc: "Inicia sesión con GitHub, Google o correo para respaldar tu progreso. Funciona sin cuenta.",
			homeRowCaption: "La fila base Dvorak — el 70% de la escritura ocurre aquí.",
			goToLessons: "Ir a lecciones",
			builtWith: "Hecho con Astro"
		},
		home: {
			title: "Domina el layout",
			titleAccent: "Dvorak",
			titleEnd: "",
			subtitle: "Lecciones progresivas, feedback en vivo y visualización del teclado. Construye memoria muscular fila por fila.",
			lessonsHeading: "Lecciones",
			recommended: "Siguiente recomendada",
			curriculumProgress: "Progreso del currículum",
			homeRowTitle: "Fila base Dvorak",
			homeRowKeys: "a o e u i · d h t n s",
			homeRowDesc: "El layout Dvorak coloca las letras más frecuentes en la fila base, reduciendo el recorrido de los dedos hasta un 70% frente a QWERTY.",
			qwertyTitle: "QWERTY vs Dvorak",
			qwertyDesc: "Observa cómo las letras comunes se mueven a posiciones más eficientes en Dvorak.",
			recentSessions: "Sesiones recientes",
			locked: "Bloqueada",
			bestWpm: "Mejor",
			startLesson: "Iniciar lección",
			completePrevious: "Completa la lección anterior con 90%+ de precisión para desbloquear.",
			heatmapTitle: "Mapa de calor por tecla",
			heatmapDesc: "Las teclas en rojo son las que más fallas — enfoca tu práctica ahí.",
			heatmapNoData: "Sin practicar",
			heatmapGood: "Precisa",
			heatmapBad: "Mejorar",
			adaptiveLabel: "Personalizado",
			adaptiveTitle: "Ejercicio adaptativo",
			adaptiveDesc: "Práctica generada a partir de tus teclas más débiles según el mapa de calor.",
			customPractice: "Práctica con texto propio",
			customPracticeDesc: "Pega tu propio párrafo y practica a tu ritmo.",
			badgesTitle: "Logros",
			microLessons: "micro-lecciones",
			allLessons: "Todas las lecciones",
			yourNextStep: "Tu siguiente paso",
			continueWith: "Continuar con {lesson}",
			lessonLibrary: "Biblioteca de lecciones",
			extraPractice: "Práctica extra",
			pasteText: "Pegar texto",
			learnMoreTitle: "Aprende más sobre Dvorak (opcional)",
			inProgress: "En progreso — toca para continuar",
			selectedChapter: "Capítulo seleccionado",
			reviewLesson: "Repasar {lesson}",
			tapToReview: "Toca para ver micro-lecciones",
			backToRecommended: "Volver a tu siguiente paso"
		},
		auth: {
			signInGithub: "GitHub",
			signInGoogle: "Google",
			signOut: "Cerrar sesión",
			loginTitle: "Bienvenido de nuevo",
			loginSubtitle: "Inicia sesión para sincronizar tu progreso entre dispositivos.",
			signupTitle: "Crear cuenta",
			signupSubtitle: "Guarda tus estadísticas y activa el respaldo en la nube.",
			forgotTitle: "Restablecer contraseña",
			forgotSubtitle: "Te enviaremos un enlace para elegir una nueva contraseña.",
			resetTitle: "Nueva contraseña",
			resetSubtitle: "Introduce tu nueva contraseña abajo.",
			email: "Correo",
			password: "Contraseña",
			confirmPassword: "Confirmar contraseña",
			signIn: "Iniciar sesión",
			signUp: "Registrarse",
			sendResetLink: "Enviar enlace",
			savePassword: "Guardar contraseña",
			forgotPassword: "¿Olvidaste tu contraseña?",
			noAccount: "¿No tienes cuenta?",
			hasAccount: "¿Ya tienes cuenta?",
			continueWithout: "Continuar sin cuenta",
			orContinueWith: "O continúa con",
			checkEmail: "Revisa tu correo para confirmar tu cuenta.",
			resetEmailSent: "Si el correo existe, recibirás un enlace de restablecimiento.",
			passwordMismatch: "Las contraseñas no coinciden.",
			passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
			signingIn: "Iniciando sesión…",
			redirecting: "Redirigiendo…",
			changePhoto: "Cambiar foto de perfil",
			changePhotoDesc: "Sube JPG, PNG o WebP (máx. 2 MB).",
			uploadPhoto: "Subir foto",
			removePhoto: "Quitar foto personalizada",
			cancel: "Cancelar",
			avatarInvalidType: "Usa JPG, PNG o WebP.",
			avatarTooLarge: "La imagen debe pesar 2 MB o menos.",
			avatarNotConfigured: "El almacenamiento en la nube no está configurado.",
			avatarNotAuthenticated: "Inicia sesión para actualizar tu foto.",
			viewAchievements: "Logros"
		},
		achievements: {
			title: "Logros",
			subtitle: "Desbloquea insignias practicando con constancia, mejorando velocidad y dominando el currículum.",
			unlockedCount: "Desbloqueados",
			totalCount: "Total",
			completionRate: "Completado",
			unlockedLabel: "Desbloqueado",
			lockedLabel: "Bloqueado",
			progressLabel: "Progreso",
			guestHint: "El progreso se guarda en este dispositivo. Inicia sesión para sincronizar logros entre dispositivos.",
			syncHint: "Tus logros se sincronizan automáticamente al completar una sesión."
		},
		lesson: {
			practice: "Práctica",
			test: "Test",
			practiceDesc: "Modo relajado — permite retroceso, termina el texto.",
			testDesc: "Test de 60s — permite retroceso, los errores siguen penalizando el PPM.",
			startTyping: "Empieza a escribir para comenzar la lección",
			timeRemaining: "Tiempo restante",
			lockedTitle: "Lección bloqueada",
			lockedDesc: "Completa la lección anterior con al menos 90% de precisión para desbloquear esta.",
			goBack: "Ir a lecciones",
			paused: "En pausa",
			resume: "Continuar",
			pauseHint: "Pulsa Esc para pausar · continúa cuando quieras"
		},
		stats: {
			title: "Tu progreso",
			subtitle: "Sigue tu PPM, precisión y racha de práctica.",
			totalSessions: "Sesiones totales",
			bestWpm: "Mejor PPM",
			avgAccuracy: "Precisión media",
			streak: "Racha de días",
			wpmOverTime: "PPM en el tiempo",
			byLesson: "Por lección",
			noData: "Completa una lección para ver tus estadísticas.",
			lesson: "Lección",
			wpm: "PPM",
			accuracy: "Precisión",
			date: "Fecha",
			heatmapTitle: "Mapa de calor por tecla",
			heatmapDesc: "Teclas rojas = más errores. Verdes = precisas.",
			heatmapNoData: "Completa una lección para generar datos del mapa.",
			chartHint: "PPM histórico de tus últimas sesiones.",
			sessionsRecorded: "sesiones registradas"
		},
		settings: {
			title: "Ajustes",
			language: "Idioma",
			sound: "Efectos de sonido",
			soundDesc: "Reproduce sonidos al acertar o fallar una tecla",
			blindMode: "Modo ciego",
			blindDesc: "Oculta el teclado en pantalla durante la práctica",
			fingerColors: "Colores por dedo",
			fingerDesc: "Colorea las teclas según el dedo asignado",
			reducedMotion: "Respeta la preferencia de movimiento reducido del sistema",
			exportData: "Exportar progreso",
			exportDesc: "Descarga una copia JSON de tus sesiones y estadísticas",
			importData: "Importar progreso",
			importDesc: "Restaura desde un archivo JSON exportado previamente",
			exportBtn: "Descargar copia",
			importBtn: "Elegir archivo",
			importSuccess: "Progreso restaurado correctamente",
			importError: "Archivo de copia inválido",
			highlightTheme: "Tema de resalte",
			highlightThemeDesc: "Color de acento para lecciones, progreso y acciones de práctica",
			highlightThemes: {
				indigo: "Índigo",
				emerald: "Esmeralda",
				cyan: "Cian",
				violet: "Violeta",
				amber: "Ámbar"
			}
		},
		categories: {
			drill: "Ejercicio de teclas",
			words: "Palabras",
			sentences: "Oraciones",
			punctuation: "Puntuación",
			numbers: "Números",
			symbols: "Símbolos"
		},
		difficulty: [
			"",
			"Principiante",
			"Fácil",
			"Medio",
			"Difícil",
			"Experto"
		],
		typing: {
			wpm: "PPM",
			accuracy: "Precisión",
			time: "Tiempo",
			nextKey: "Siguiente tecla",
			pressed: "Presionada",
			homeGuides: "Guías base (U · H)",
			dvorakLayout: "Layout Dvorak",
			fingers: "Dedos",
			leftHand: "Izquierda",
			rightHand: "Derecha",
			showKeyboard: "Mostrar teclado",
			hideKeyboard: "Ocultar teclado",
			thumb: "Pulgar"
		},
		completion: {
			perfect: "¡Ronda perfecta!",
			complete: "¡Lección completada!",
			perfectDesc: "Precisión impecable — excelente trabajo.",
			keepGoing: "Sigue practicando para mejorar tu velocidad.",
			tryAgain: "Intentar de nuevo",
			newRecord: "¡Nuevo récord personal!",
			improved: "Mejoraste {delta} PPM",
			weakKeys: "Teclas a reforzar",
			weakKeysHint: "Estas teclas causaron más errores en esta sesión.",
			starsEarned: "Estrellas obtenidas"
		},
		fingers: {
			lp: "Meñique izq.",
			lr: "Anular izq.",
			lm: "Medio izq.",
			li: "Índice izq.",
			ri: "Índice der.",
			rm: "Medio der.",
			rr: "Anular der.",
			rp: "Meñique der."
		},
		badges: {
			firstLesson: "Primeros pasos",
			firstLessonDesc: "Completa tu primera lección.",
			streak7: "Guerrero semanal",
			streak7Desc: "Practica 7 días seguidos.",
			wpm50: "Velocista",
			wpm50Desc: "Alcanza 50 PPM en cualquier sesión.",
			perfectRun: "Impecable",
			perfectRunDesc: "Termina una sesión con 100% de precisión.",
			curriculumDone: "Graduado",
			curriculumDoneDesc: "Domina todas las lecciones principales con 90%+ de precisión."
		},
		custom: {
			title: "Práctica personalizada",
			desc: "Pega cualquier texto que quieras practicar — artículos, código o tu propia escritura.",
			placeholder: "Pega o escribe tu texto aquí (mín. 10 caracteres)...",
			chars: "caracteres",
			start: "Iniciar práctica",
			editText: "Editar texto"
		},
		lessonMeta: {
			homeRow: {
				title: "Fila base",
				description: "Domina la base: A O E U I y D H T N S."
			},
			topRow: {
				title: "Fila superior",
				description: "Practica la fila superior: ' , . P Y F G C R L."
			},
			bottomRow: {
				title: "Fila inferior",
				description: "Entrena la fila inferior: ; Q J K X B M W V Z."
			},
			punctuation: {
				title: "Puntuación",
				description: "Practica símbolos: ' , . ; - / ="
			},
			numbers: {
				title: "Números",
				description: "Entrena la fila numérica: 0–9."
			},
			shiftCaps: {
				title: "Shift y mayúsculas",
				description: "Practica letras mayúsculas con las teclas Shift."
			},
			allRows: {
				title: "Todas las filas",
				description: "Combina todas las filas en patrones fluidos."
			},
			commonWords: {
				title: "Palabras comunes",
				description: "Palabras frecuentes en inglés optimizadas para Dvorak."
			},
			sentences: {
				title: "Oraciones",
				description: "Oraciones completas para ritmo y precisión."
			},
			devSymbols: {
				title: "Símbolos de desarrollo",
				description: "Llaves, operadores y puntuación de código para programadores."
			},
			advanced: {
				title: "Desafío avanzado",
				description: "Pasajes largos para tipistas experimentados."
			},
			adaptiveDrill: {
				title: "Ejercicio adaptativo",
				description: "Práctica personalizada enfocada en tus teclas más débiles."
			},
			customPractice: {
				title: "Práctica personalizada",
				description: "Escribe tu propio texto a tu ritmo."
			},
			codeMode: {
				title: "Modo código",
				description: "Fragmentos de código reales para desarrolladores."
			},
			spanishDvorak: {
				title: "Dvorak español",
				description: "Tildes, ñ y pangrams en español."
			}
		},
		microLessons: {
			homeLeft: "Mano izq. (A O E U)",
			homeRight: "Mano der. (D H T N)",
			homeFull: "Fila base completa",
			topNivel1: "Nivel 1 (P G C R L)",
			topNivel2: "Nivel 2 (F V Z X)",
			topFull: "Fila superior completa",
			bottomNivel1: "Nivel 1 (Q J K X)",
			bottomNivel2: "Nivel 2 (B M W V)",
			bottomFull: "Fila inferior completa",
			codeHtml: "Etiquetas HTML",
			codeTs: "Sintaxis TypeScript",
			codeFull: "Desafío de código completo",
			esAccents: "Tildes (á é í ó ú)",
			esEnye: "Letra ñ",
			esFull: "Pangrams en español"
		},
		qwerty: {
			qwerty: "QWERTY",
			dvorak: "Dvorak",
			vowelsTitle: "Vocales agrupadas",
			vowelsDesc: "Todas las vocales (A, O, E, U, I) descansan bajo tu mano izquierda.",
			homeRowTitle: "70% en la fila base",
			homeRowDesc: "Tus dedos viajan mucho menos en comparación al 32% de uso en QWERTY.",
			alternationTitle: "Alternancia natural",
			alternationDesc: "Las consonantes más usadas están en la mano derecha, creando un ritmo de escritura fluido entre ambas manos."
		},
		multiplayer: {
			title: "Multijugador",
			subtitle: "Crea una sala o únete con un código. Todos marcan listo para empezar.",
			lobbyTitle: "Sala de espera",
			lobbySubtitle: "Espera a los jugadores y luego marca que estás listo.",
			backToLobby: "Volver a multijugador",
			createRoom: "Crear sala",
			createRoomDesc: "Genera un código y compártelo con tus amigos.",
			createRoomAction: "Crear nueva sala",
			joinRoom: "Unirse a sala",
			joinRoomDesc: "Introduce el código que te compartió el anfitrión.",
			joinRoomAction: "Unirse",
			roomCode: "Código de sala",
			roomCodePlaceholder: "ABC123",
			playersReady: "{ready} / {total} listos",
			ready: "Listo",
			notReady: "Esperando",
			you: "tú",
			markReady: "Marcar listo",
			unready: "Cancelar listo",
			leaveRoom: "Salir de la sala",
			connecting: "Conectando…",
			connected: "Conectado",
			waiting: "Esperando jugadores…",
			connectionError: "No se pudo conectar a la sala.",
			timedOut: "La conexión expiró.",
			allReady: "Todos están listos — iniciando partida…",
			raceProgress: "Progreso de carrera",
			waitingForOpponentProgress: "El progreso del rival aparecerá cuando empiece a escribir.",
			signInRequired: "Inicia sesión para unirte a salas multijugador.",
			notConfigured: "El multijugador requiere que Supabase esté configurado."
		}
	}
};
function getTranslations(locale) {
	return translations[locale] ?? en;
}
function t(locale, path, params) {
	const keys = path.split(".");
	let value = getTranslations(locale);
	for (const key of keys) value = value?.[key];
	if (typeof value !== "string") return path;
	if (!params) return value;
	return Object.entries(params).reduce((str, [k, v]) => str.replace(`{${k}}`, String(v)), value);
}
//#endregion
//#region src/utils/progress/streak.ts
/** Local calendar date `YYYY-MM-DD` (avoids UTC drift near midnight). */
function toLocalPracticeDate(value) {
	const date = typeof value === "string" ? new Date(value) : value;
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function addDaysToDateString(dateStr, days) {
	const [y, m, d] = dateStr.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	date.setDate(date.getDate() + days);
	return toLocalPracticeDate(date);
}
/** Unique local practice dates, most recent first. */
function collectPracticeDates(timestamps) {
	const set = /* @__PURE__ */ new Set();
	for (const ts of timestamps) set.add(toLocalPracticeDate(ts));
	return [...set].sort((a, b) => b.localeCompare(a));
}
/**
* Consecutive practice days ending on the latest session.
* Streak stays active only if the last practice was today or yesterday (local time).
*/
function computeStreakFromPracticeDates(practiceDates, referenceDate) {
	if (practiceDates.length === 0) return {
		streak: 0,
		lastPracticeDate: null
	};
	const unique = [...new Set(practiceDates)].sort((a, b) => b.localeCompare(a));
	const lastPracticeDate = unique[0];
	const today = referenceDate ?? toLocalPracticeDate(/* @__PURE__ */ new Date());
	const yesterday = addDaysToDateString(today, -1);
	if (lastPracticeDate !== today && lastPracticeDate !== yesterday) return {
		streak: 0,
		lastPracticeDate
	};
	const dateSet = new Set(unique);
	const anchor = lastPracticeDate === today ? today : yesterday;
	let streak = 0;
	let cursor = anchor;
	while (dateSet.has(cursor)) {
		streak++;
		cursor = addDaysToDateString(cursor, -1);
	}
	return {
		streak,
		lastPracticeDate
	};
}
//#endregion
//#region src/utils/progress/keys.ts
/** Centralized localStorage keys — single source of truth for progress data. */
var STORAGE_KEYS = {
	history: "typing-dvorak-history",
	progress: "typing-dvorak-progress",
	theme: "typing-dvorak-theme",
	keyStats: "typing-dvorak-key-stats",
	badges: "typing-dvorak-badges",
	customText: "typing-dvorak-custom-text",
	settings: "typing-dvorak-settings",
	cloudMigrated: "typing-dvorak-cloud-migrated"
};
/** Cleared on login/logout to avoid cross-account bleed. */
var GUEST_PROGRESS_KEYS = [
	STORAGE_KEYS.history,
	STORAGE_KEYS.progress,
	STORAGE_KEYS.keyStats,
	STORAGE_KEYS.badges,
	STORAGE_KEYS.customText,
	STORAGE_KEYS.cloudMigrated
];
/** Keys included in export/import backup bundles. */
var EXPORT_KEYS = [
	STORAGE_KEYS.history,
	STORAGE_KEYS.progress,
	STORAGE_KEYS.keyStats,
	STORAGE_KEYS.settings,
	STORAGE_KEYS.badges,
	STORAGE_KEYS.theme,
	STORAGE_KEYS.customText
];
//#endregion
//#region src/utils/progress/localStorage.ts
function readJson(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function writeJson(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}
function readString(key, fallback = "") {
	if (typeof window === "undefined") return fallback;
	return localStorage.getItem(key) ?? fallback;
}
function writeString(key, value) {
	localStorage.setItem(key, value);
}
function removeKeys(keys) {
	if (typeof window === "undefined") return;
	for (const key of keys) localStorage.removeItem(key);
}
//#endregion
//#region src/utils/progress/storage.ts
var MAX_RECORDS = 100;
var EMPTY_PROGRESS = {
	lessons: {},
	streak: 0,
	lastPracticeDate: null
};
function getSessionHistory() {
	return readJson(STORAGE_KEYS.history, []);
}
function getProgress() {
	return readJson(STORAGE_KEYS.progress, EMPTY_PROGRESS);
}
function saveProgress(progress) {
	writeJson(STORAGE_KEYS.progress, progress);
}
function updateStreak(progress) {
	const { streak, lastPracticeDate } = computeStreakFromPracticeDates(collectPracticeDates(getSessionHistory().map((s) => s.completedAt)));
	return {
		...progress,
		streak,
		lastPracticeDate
	};
}
/** Overwrite local session history and lesson progress (e.g. after cloud load). */
function replaceLocalProgress(history, progress) {
	writeJson(STORAGE_KEYS.history, history.slice(0, MAX_RECORDS));
	saveProgress(progress);
}
function saveSession(lessonId, lessonTitle, stats, mode = "practice") {
	const record = {
		lessonId,
		lessonTitle,
		wpm: stats.wpm,
		accuracy: stats.accuracy,
		elapsedSeconds: stats.elapsedSeconds,
		mode,
		completedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	const history = [record, ...getSessionHistory()].slice(0, MAX_RECORDS);
	writeJson(STORAGE_KEYS.history, history);
	const progress = updateStreak(getProgress());
	const existing = progress.lessons[lessonId];
	const previousBest = existing?.bestWpm ?? 0;
	const isNewRecord = stats.wpm > previousBest;
	progress.lessons[lessonId] = {
		bestWpm: Math.max(previousBest, stats.wpm),
		bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, stats.accuracy),
		attempts: (existing?.attempts ?? 0) + 1,
		lastPlayedAt: record.completedAt
	};
	saveProgress(progress);
	return {
		isNewRecord,
		previousBest
	};
}
function getCompletedLessonsMap() {
	const { lessons } = getProgress();
	const map = {};
	for (const [id, p] of Object.entries(lessons)) map[id] = {
		bestAccuracy: p.bestAccuracy,
		bestWpm: p.bestWpm
	};
	return map;
}
function getAggregateStats() {
	const history = getSessionHistory();
	const progress = getProgress();
	if (history.length === 0) return {
		totalSessions: 0,
		bestWpm: 0,
		avgAccuracy: 0,
		streak: progress.streak
	};
	const bestWpm = Math.max(...history.map((r) => r.wpm));
	const avgAccuracy = Math.round(history.reduce((sum, r) => sum + r.accuracy, 0) / history.length);
	return {
		totalSessions: history.length,
		bestWpm,
		avgAccuracy,
		streak: progress.streak
	};
}
function getStoredTheme() {
	const stored = readString(STORAGE_KEYS.theme);
	if (stored === "dark" || stored === "light") return stored;
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function setStoredTheme(theme) {
	writeString(STORAGE_KEYS.theme, theme);
	document.documentElement.classList.toggle("dark", theme === "dark");
}
//#endregion
//#region src/utils/app/highlightTheme.ts
var HIGHLIGHT_THEME_IDS = [
	"indigo",
	"emerald",
	"cyan",
	"violet",
	"amber"
];
var HIGHLIGHT_THEMES = {
	indigo: {
		swatch: "#818cf8",
		light: {
			main: "#6366f1",
			hover: "#4f46e5"
		},
		dark: {
			main: "#818cf8",
			hover: "#6366f1"
		}
	},
	emerald: {
		swatch: "#4ade80",
		light: {
			main: "#22c55e",
			hover: "#16a34a"
		},
		dark: {
			main: "#4ade80",
			hover: "#22c55e"
		}
	},
	cyan: {
		swatch: "#22d3ee",
		light: {
			main: "#0891b2",
			hover: "#0e7490"
		},
		dark: {
			main: "#22d3ee",
			hover: "#06b6d4"
		}
	},
	violet: {
		swatch: "#a78bfa",
		light: {
			main: "#7c3aed",
			hover: "#6d28d9"
		},
		dark: {
			main: "#a78bfa",
			hover: "#8b5cf6"
		}
	},
	amber: {
		swatch: "#fbbf24",
		light: {
			main: "#d97706",
			hover: "#b45309"
		},
		dark: {
			main: "#fbbf24",
			hover: "#f59e0b"
		}
	}
};
var DEFAULT_HIGHLIGHT_THEME = "indigo";
function isHighlightThemeId(value) {
	return typeof value === "string" && HIGHLIGHT_THEME_IDS.includes(value);
}
function applyHighlightTheme(id, mode) {
	if (typeof document === "undefined") return;
	const preset = HIGHLIGHT_THEMES[id] ?? HIGHLIGHT_THEMES.indigo;
	const pair = mode === "dark" ? preset.dark : preset.light;
	document.documentElement.style.setProperty("--color-highlight", pair.main);
	document.documentElement.style.setProperty("--color-highlight-hover", pair.hover);
}
//#endregion
//#region src/utils/app/settings.ts
var DEFAULTS = {
	locale: "en",
	sound: false,
	blindMode: false,
	fingerColors: true,
	practiceMode: "practice",
	highlightTheme: DEFAULT_HIGHLIGHT_THEME
};
function getSettings() {
	const parsed = readJson(STORAGE_KEYS.settings, DEFAULTS);
	if (!isHighlightThemeId(parsed.highlightTheme)) parsed.highlightTheme = DEFAULT_HIGHLIGHT_THEME;
	return {
		...DEFAULTS,
		...parsed
	};
}
function saveSettings(partial) {
	const next = {
		...getSettings(),
		...partial
	};
	writeJson(STORAGE_KEYS.settings, next);
	document.documentElement.lang = next.locale;
	applyHighlightTheme(next.highlightTheme, getStoredTheme());
	return next;
}
//#endregion
//#region src/contexts/AppProvider.tsx
var AppContext = createContext(null);
var DEFAULT_SETTINGS = {
	locale: "en",
	sound: false,
	blindMode: false,
	fingerColors: true,
	practiceMode: "practice",
	highlightTheme: "indigo"
};
function AppProvider({ children }) {
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [theme, setTheme] = useState("light");
	useEffect(() => {
		const storedSettings = getSettings();
		const storedTheme = getStoredTheme();
		setSettings(storedSettings);
		setTheme(storedTheme);
		setStoredTheme(storedTheme);
		applyHighlightTheme(storedSettings.highlightTheme, storedTheme);
	}, []);
	const updateSettings = useCallback((partial) => {
		const next = saveSettings(partial);
		setSettings(next);
	}, []);
	const setLocale = useCallback((locale) => {
		updateSettings({ locale });
	}, [updateSettings]);
	const toggleTheme = useCallback(() => {
		const next = theme === "light" ? "dark" : "light";
		setTheme(next);
		setStoredTheme(next);
		applyHighlightTheme(settings.highlightTheme, next);
	}, [theme, settings.highlightTheme]);
	const setPracticeMode = useCallback((mode) => {
		updateSettings({ practiceMode: mode });
	}, [updateSettings]);
	const value = useMemo(() => ({
		locale: settings.locale,
		t: getTranslations(settings.locale),
		settings,
		theme,
		setLocale,
		updateSettings,
		toggleTheme,
		setPracticeMode
	}), [
		settings,
		theme,
		setLocale,
		updateSettings,
		toggleTheme,
		setPracticeMode
	]);
	return /* @__PURE__ */ jsx(AppContext.Provider, {
		value,
		children
	});
}
function useApp() {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error("useApp must be used within AppProvider");
	return ctx;
}
function getLessonTitle(t, key) {
	return t.lessonMeta[key]?.title ?? key;
}
//#endregion
//#region src/lib/supabaseClient.ts
var client = null;
function isSupabaseConfigured() {
	return Boolean(true);
}
function getSupabaseClient() {
	if (!isSupabaseConfigured()) return null;
	if (!client) client = createClient("https://rtbgqigcbhcgmqmirujx.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YmdxaWdjYmhjZ21xbWlydWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDU1MTMsImV4cCI6MjA5ODY4MTUxM30.KuFKpeCgpCrv-jsFQfBpQmYS2gmJ-misVMMjZkfaRqk");
	return client;
}
//#endregion
//#region src/utils/app/events.ts
var SESSION_COMPLETE_EVENT = "typing-dvorak:session-complete";
var KEY_STATS_UPDATED_EVENT = "typing-dvorak:key-stats-updated";
var BADGES_UPDATED_EVENT = "typing-dvorak:badges-updated";
function dispatchSessionComplete() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(SESSION_COMPLETE_EVENT));
}
function dispatchKeyStatsUpdated() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(KEY_STATS_UPDATED_EVENT));
}
function dispatchBadgesUpdated() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(BADGES_UPDATED_EVENT));
}
//#endregion
//#region src/utils/progress/guestProgress.ts
/** Clear localStorage keys tied to a user session — on login/logout to avoid cross-account bleed. */
function clearGuestProgress() {
	removeKeys(GUEST_PROGRESS_KEYS);
}
//#endregion
//#region src/utils/curriculum/stars.ts
/** Star rating 1–3 based on session performance. */
function calculateStars(accuracy, _wpm) {
	if (accuracy >= 98) return 3;
	if (accuracy >= 90) return 2;
	return 1;
}
//#endregion
//#region src/utils/keyboard/dvorak.ts
/** Dvorak Simplified Keyboard layout (US). */
var DVORAK_ROWS = [
	{ keys: [
		{
			label: "`",
			code: "Backquote"
		},
		{
			label: "1",
			code: "Digit1"
		},
		{
			label: "2",
			code: "Digit2"
		},
		{
			label: "3",
			code: "Digit3"
		},
		{
			label: "4",
			code: "Digit4"
		},
		{
			label: "5",
			code: "Digit5"
		},
		{
			label: "6",
			code: "Digit6"
		},
		{
			label: "7",
			code: "Digit7"
		},
		{
			label: "8",
			code: "Digit8"
		},
		{
			label: "9",
			code: "Digit9"
		},
		{
			label: "0",
			code: "Digit0"
		},
		{
			label: "[",
			code: "BracketLeft"
		},
		{
			label: "]",
			code: "BracketRight"
		}
	] },
	{
		indent: 1,
		keys: [
			{
				label: "'",
				code: "Quote"
			},
			{
				label: ",",
				code: "Comma"
			},
			{
				label: ".",
				code: "Period"
			},
			{
				label: "p",
				code: "KeyP"
			},
			{
				label: "y",
				code: "KeyY"
			},
			{
				label: "f",
				code: "KeyF"
			},
			{
				label: "g",
				code: "KeyG"
			},
			{
				label: "c",
				code: "KeyC"
			},
			{
				label: "r",
				code: "KeyR"
			},
			{
				label: "l",
				code: "KeyL"
			},
			{
				label: "/",
				code: "Slash"
			},
			{
				label: "=",
				code: "Equal"
			}
		]
	},
	{
		indent: 2,
		keys: [
			{
				label: "a",
				code: "KeyA"
			},
			{
				label: "o",
				code: "KeyO"
			},
			{
				label: "e",
				code: "KeyE"
			},
			{
				label: "u",
				code: "KeyU",
				homeRowMark: true
			},
			{
				label: "i",
				code: "KeyI"
			},
			{
				label: "d",
				code: "KeyD"
			},
			{
				label: "h",
				code: "KeyH",
				homeRowMark: true
			},
			{
				label: "t",
				code: "KeyT"
			},
			{
				label: "n",
				code: "KeyN"
			},
			{
				label: "s",
				code: "KeyS"
			},
			{
				label: "-",
				code: "Minus"
			}
		]
	},
	{
		indent: 3,
		keys: [
			{
				label: ";",
				code: "Semicolon"
			},
			{
				label: "q",
				code: "KeyQ"
			},
			{
				label: "j",
				code: "KeyJ"
			},
			{
				label: "k",
				code: "KeyK"
			},
			{
				label: "x",
				code: "KeyX"
			},
			{
				label: "b",
				code: "KeyB"
			},
			{
				label: "m",
				code: "KeyM"
			},
			{
				label: "w",
				code: "KeyW"
			},
			{
				label: "v",
				code: "KeyV"
			},
			{
				label: "z",
				code: "KeyZ"
			}
		]
	},
	{
		indent: 3.5,
		keys: [{
			label: "Space",
			code: "Space",
			width: 5.5
		}]
	}
];
var HOME_ROW = "aoeuidhtns";
var TOP_ROW = "',.pyfgcrl";
var BOTTOM_ROW = ";qjkxbmwvz";
var CHAR_TO_CODE = {};
for (const row of DVORAK_ROWS) for (const key of row.keys) if (key.code !== "Space") {
	CHAR_TO_CODE[key.label.toLowerCase()] = key.code;
	CHAR_TO_CODE[key.label] = key.code;
}
CHAR_TO_CODE[" "] = "Space";
CHAR_TO_CODE["\n"] = "Enter";
/** Maps a typed character to its physical key code on a Dvorak keyboard. */
function charToKeyCode(char) {
	return CHAR_TO_CODE[char] ?? CHAR_TO_CODE[char.toLowerCase()];
}
//#endregion
//#region src/utils/stats/keyStats.ts
var EMPTY_STATS = {
	hits: {},
	misses: {}
};
var CODE_TO_LABEL = {};
for (const row of DVORAK_ROWS) for (const key of row.keys) CODE_TO_LABEL[key.code] = key.label;
function codeToLabel(code) {
	return CODE_TO_LABEL[code] ?? code.replace("Key", "").replace("Digit", "");
}
function getKeyStats() {
	return readJson(STORAGE_KEYS.keyStats, EMPTY_STATS);
}
function saveKeyStats(data) {
	writeJson(STORAGE_KEYS.keyStats, data);
}
/** Overwrite heatmap stats (e.g. after cloud load). */
function replaceKeyStats(data) {
	saveKeyStats(data);
	dispatchKeyStatsUpdated();
}
/** Records a keystroke for heatmap analytics. */
function recordKeystroke(char, isCorrect) {
	const code = charToKeyCode(char) ?? char;
	const stats = getKeyStats();
	const bucket = isCorrect ? stats.hits : stats.misses;
	bucket[code] = (bucket[code] ?? 0) + 1;
	saveKeyStats(stats);
	dispatchKeyStatsUpdated();
}
/** Returns error rate 0–1 for a key code (0 = perfect, 1 = all misses). */
function getKeyErrorRate(code, stats) {
	const hits = stats.hits[code] ?? 0;
	const misses = stats.misses[code] ?? 0;
	const total = hits + misses;
	if (total === 0) return 0;
	return misses / total;
}
/** Keys with the most misses, weighted by error rate. */
function getWeakestKeys(limit = 5, stats = getKeyStats()) {
	const codes = /* @__PURE__ */ new Set([...Object.keys(stats.hits), ...Object.keys(stats.misses)]);
	const ranked = [];
	for (const code of codes) {
		const misses = stats.misses[code] ?? 0;
		if (misses === 0) continue;
		const errorRate = getKeyErrorRate(code, stats);
		ranked.push({
			code,
			label: codeToLabel(code),
			misses,
			errorRate
		});
	}
	return ranked.sort((a, b) => b.misses * b.errorRate - a.misses * a.errorRate).slice(0, limit);
}
function getSessionWeakKeys(misses, limit = 3) {
	return Object.entries(misses).sort(([, a], [, b]) => b - a).slice(0, limit).map(([char]) => char);
}
//#endregion
//#region src/services/supabase/queries.ts
async function fetchUserSessions(limit = 50) {
	const supabase = getSupabaseClient();
	if (!supabase) return [];
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];
	const { data, error } = await supabase.from("typing_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(limit);
	if (error) {
		console.warn("[supabase] fetch sessions failed:", error.message);
		return [];
	}
	return data ?? [];
}
async function fetchUserKeyErrors() {
	const supabase = getSupabaseClient();
	if (!supabase) return [];
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];
	const { data, error } = await supabase.from("key_errors").select("*").eq("user_id", user.id);
	if (error) {
		console.warn("[supabase] fetch key_errors failed:", error.message);
		return [];
	}
	return data ?? [];
}
async function fetchUserProfile() {
	const supabase = getSupabaseClient();
	if (!supabase) return null;
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;
	const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
	if (error) {
		console.warn("[supabase] fetch profile failed:", error.message);
		return null;
	}
	return data;
}
/** All session timestamps for streak calculation (source of truth). Paginates past the default row cap. */
async function fetchUserSessionTimestamps() {
	const supabase = getSupabaseClient();
	if (!supabase) return [];
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];
	const PAGE = 1e3;
	const timestamps = [];
	let from = 0;
	while (true) {
		const { data, error } = await supabase.from("typing_sessions").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).range(from, from + PAGE - 1);
		if (error) {
			console.warn("[supabase] fetch session timestamps failed:", error.message);
			break;
		}
		if (!data?.length) break;
		timestamps.push(...data.map((row) => row.created_at));
		if (data.length < PAGE) break;
		from += PAGE;
	}
	return timestamps;
}
/** All sessions (paginated) for badge evaluation. */
async function fetchAllUserSessionSummaries() {
	const supabase = getSupabaseClient();
	if (!supabase) return [];
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];
	const PAGE = 1e3;
	const rows = [];
	let from = 0;
	while (true) {
		const { data, error } = await supabase.from("typing_sessions").select("lesson_id, wpm, accuracy").eq("user_id", user.id).order("created_at", { ascending: false }).range(from, from + PAGE - 1);
		if (error) {
			console.warn("[supabase] fetch session summaries failed:", error.message);
			break;
		}
		if (!data?.length) break;
		rows.push(...data.map((row) => ({
			lesson_id: row.lesson_id,
			wpm: row.wpm,
			accuracy: Number(row.accuracy)
		})));
		if (data.length < PAGE) break;
		from += PAGE;
	}
	return rows;
}
//#endregion
//#region src/services/supabase/syncProgress.ts
/** Writes computed streak fields to profiles (cache for quick reads). */
async function updateProfileStreak(userId, { streak, lastPracticeDate }) {
	const supabase = getSupabaseClient();
	if (!supabase) return;
	const { error } = await supabase.from("profiles").update({
		current_streak: streak,
		last_practice_date: lastPracticeDate
	}).eq("id", userId);
	if (error) console.warn("[sync] profile streak update failed:", error.message);
}
/** Recompute streak from all cloud sessions and persist to profiles. */
async function syncStreakToProfile(userId) {
	const result = computeStreakFromPracticeDates(collectPracticeDates(await fetchUserSessionTimestamps()));
	await updateProfileStreak(userId, result);
	return result;
}
/** Persists a session to Supabase. No-op when unauthenticated or offline. */
async function syncSessionToCloud(userId, record) {
	const supabase = getSupabaseClient();
	if (!supabase) return;
	const { error } = await supabase.from("typing_sessions").insert({
		user_id: userId,
		lesson_id: record.lessonId,
		wpm: record.wpm,
		accuracy: record.accuracy,
		stars: calculateStars(record.accuracy, record.wpm),
		mode: record.mode
	});
	if (error) {
		console.warn("[sync] session insert failed:", error.message);
		return;
	}
	await syncStreakToProfile(userId);
}
/** Upserts aggregated key errors from local heatmap data. */
async function syncKeyErrorsToCloud(userId) {
	const supabase = getSupabaseClient();
	if (!supabase) return;
	const stats = getKeyStats();
	const rows = Object.entries(stats.misses).map(([code, count]) => ({
		user_id: userId,
		key_char: code.slice(-1),
		error_count: count
	}));
	if (rows.length === 0) return;
	for (const row of rows) {
		const { error } = await supabase.from("key_errors").upsert(row, { onConflict: "user_id,key_char" });
		if (error) console.warn("[sync] key_errors upsert failed:", error.message);
	}
}
//#endregion
//#region src/utils/typing/textGenerator.ts
var CHARSETS = {
	home: HOME_ROW,
	top: TOP_ROW,
	bottom: BOTTOM_ROW,
	all: HOME_ROW + TOP_ROW + BOTTOM_ROW,
	punctuation: "'.,;-/=",
	numbers: "0123456789"
};
function drillChars(charSet) {
	return (CHARSETS[charSet] ?? charSet).replace(/\s/g, "");
}
function randomChar(chars) {
	return chars[Math.floor(Math.random() * chars.length)];
}
/** Builds a drill string from a character set, grouped in word chunks separated by single spaces. */
function generateDrillText(charSet, length = 48) {
	const chars = drillChars(charSet);
	if (!chars.length) return "";
	const words = [];
	let total = 0;
	while (total < length) {
		const wordLen = Math.min(3 + Math.floor(Math.random() * 4), length - total);
		if (wordLen <= 0) break;
		let word = "";
		for (let i = 0; i < wordLen; i++) word += randomChar(chars);
		words.push(word);
		total += word.length + (total + word.length < length ? 1 : 0);
	}
	return words.join(" ").slice(0, length);
}
/** Generates continuous text for timed test mode. */
function generateTestStream(charSet, minLength = 200) {
	return generateDrillText(charSet, minLength);
}
//#endregion
//#region src/utils/typing/adaptiveDrill.ts
/** Builds practice text focused on the user's weakest keys. */
function generateAdaptiveDrillText(length = 48) {
	const weak = getWeakestKeys(5);
	if (weak.length === 0) return null;
	return generateDrillText(weak.map((w) => w.label).join(""), length);
}
//#endregion
//#region src/utils/curriculum/lessons.ts
var LESSONS = [
	{
		id: "home-row",
		titleKey: "homeRow",
		descriptionKey: "homeRow",
		category: "drill",
		difficulty: 1,
		generated: true,
		charSet: "home",
		texts: [
			"aoeu aoeu iuia iuia",
			"dhtn dhtn snth snth",
			"aoeui dhtns aoeui dhtns"
		]
	},
	{
		id: "top-row",
		titleKey: "topRow",
		descriptionKey: "topRow",
		category: "drill",
		difficulty: 2,
		generated: true,
		charSet: "top",
		texts: [
			"pyfg pyfg crlf crlf",
			",.py ,.py fgcr fgcr",
			"pyfgcrl ,.pyfgcrl"
		]
	},
	{
		id: "bottom-row",
		titleKey: "bottomRow",
		descriptionKey: "bottomRow",
		category: "drill",
		difficulty: 2,
		generated: true,
		charSet: "bottom",
		texts: [
			"qjkx qjkx bmwv bmwv",
			";qjk ;qjk xbmw xbmw",
			"qjkxbmwv ;qjkxbmwv"
		]
	},
	{
		id: "punctuation",
		titleKey: "punctuation",
		descriptionKey: "punctuation",
		category: "punctuation",
		difficulty: 3,
		generated: true,
		charSet: "punctuation",
		texts: [
			"' , . ; ' , . ;",
			"- / = - / =",
			"a.e,i;o' a.e,i;o'"
		]
	},
	{
		id: "numbers",
		titleKey: "numbers",
		descriptionKey: "numbers",
		category: "numbers",
		difficulty: 3,
		generated: true,
		charSet: "numbers",
		texts: [
			"12345 67890",
			"02468 13579",
			"31415 27182"
		]
	},
	{
		id: "shift-caps",
		titleKey: "shiftCaps",
		descriptionKey: "shiftCaps",
		category: "words",
		difficulty: 3,
		texts: [
			"The Quick Brown Fox Jumps Over The Lazy Dog",
			"Hello World Practice Every Single Day",
			"Dvorak Layout Makes Typing Feel Natural",
			"Shift Keys Unlock Capital Letters"
		],
		textsEs: [
			"El Zorro Marron Salta Sobre El Perro Perezoso",
			"Practica Dvorak Cada Dia Con Paciencia",
			"Las Mayusculas Requieren La Tecla Shift"
		]
	},
	{
		id: "all-rows",
		titleKey: "allRows",
		descriptionKey: "allRows",
		category: "words",
		difficulty: 3,
		texts: [
			"the quick brown fox jumps over the lazy dog",
			"practice dvorak layout every single day for best results",
			"typing speed grows with consistent daily drills and focus",
			"pack my box with five dozen liquor jugs today",
			"how vexingly quick daft zebras jump over fences",
			"the five boxing wizards jump quickly on the mat"
		],
		textsEs: [
			"el veloz murcielago hindu comia feliz cardillo y kiwi",
			"practica el layout dvorak cada dia con constancia",
			"la velocidad llega cuando la precision es solida"
		]
	},
	{
		id: "common-words",
		titleKey: "commonWords",
		descriptionKey: "commonWords",
		category: "words",
		difficulty: 3,
		texts: [
			"the and for are but not you all can had her was one our out",
			"day get has him his how man new now old see way who boy did",
			"its let put say she too use dad mom run sun top try win yes"
		]
	},
	{
		id: "sentences",
		titleKey: "sentences",
		descriptionKey: "sentences",
		category: "sentences",
		difficulty: 4,
		texts: [
			"Learning Dvorak takes patience and daily practice.",
			"Your fingers will gradually find their home positions.",
			"Accuracy matters more than speed when you are starting out."
		],
		textsEs: [
			"Aprender Dvorak requiere paciencia y practica diaria.",
			"Tus dedos encontraran gradualmente su posicion en la fila base.",
			"La precision importa mas que la velocidad al empezar."
		]
	},
	{
		id: "dev-symbols",
		titleKey: "devSymbols",
		descriptionKey: "devSymbols",
		category: "symbols",
		difficulty: 4,
		texts: [
			"{ } [ ] ( ) < > ` ~ # $ % ^ & *",
			"const fn = () => { return true; };",
			"import { useState } from \"react\";",
			"git commit -m \"fix: keyboard layout\"",
			"SELECT * FROM users WHERE id = 1;"
		]
	},
	{
		id: "advanced",
		titleKey: "advanced",
		descriptionKey: "advanced",
		category: "sentences",
		difficulty: 5,
		texts: ["Programming languages use many symbols and punctuation marks that require practice on any keyboard layout.", "The Dvorak Simplified Keyboard was patented in 1936 by August Dvorak and his brother-in-law William Dealey."],
		textsEs: ["Los lenguajes de programacion usan muchos simbolos que exigen practica en cualquier layout.", "El teclado Dvorak simplificado fue patentado en 1936 por August Dvorak."]
	},
	{
		id: "adaptive-drill",
		titleKey: "adaptiveDrill",
		descriptionKey: "adaptiveDrill",
		category: "drill",
		difficulty: 3,
		optional: true,
		adaptive: true,
		texts: ["aoeu dhtn aoeu dhtn"]
	}
];
var CORE_LESSONS = LESSONS.filter((l) => !l.optional);
function getLessonById(id) {
	return LESSONS.find((lesson) => lesson.id === id);
}
/** Localized lesson metadata — keys live in i18n lessonMeta. */
function getLessonText(lesson, pick, generate, locale = "en") {
	if (lesson.adaptive) return generateAdaptiveDrillText() ?? pick(lesson.texts);
	const pool = locale === "es" && lesson.textsEs?.length ? lesson.textsEs : lesson.texts;
	if (lesson.generated && lesson.charSet && generate) return generate(lesson.charSet);
	return pick(pool);
}
//#endregion
//#region src/utils/curriculum/curriculum.ts
/** Lesson unlock order — first lesson is always available. Optional lessons excluded. */
var LESSON_ORDER = CORE_LESSONS.map((l) => l.id);
//#endregion
//#region src/utils/achievements/badges.ts
function getUnlockedBadges() {
	return readJson(STORAGE_KEYS.badges, []);
}
function saveUnlockedBadges(ids) {
	writeJson(STORAGE_KEYS.badges, ids);
}
/** Overwrite unlocked badges (e.g. after cloud load). */
function replaceUnlockedBadges(ids) {
	saveUnlockedBadges(ids);
	dispatchBadgesUpdated();
}
function buildBadgeEvaluationFromLocal() {
	const progress = getProgress();
	const completed = getCompletedLessonsMap();
	const aggregate = getAggregateStats();
	const hasPerfectRun = getSessionHistory().some((session) => session.accuracy === 100);
	const masteredLessonCount = LESSON_ORDER.filter((id) => (completed[id]?.bestAccuracy ?? 0) >= 90).length;
	return {
		completedLessonCount: Object.keys(completed).length,
		streak: progress.streak,
		bestWpm: aggregate.bestWpm,
		hasPerfectRun,
		masteredLessonCount,
		totalCurriculumLessons: LESSON_ORDER.length
	};
}
/** Pure evaluation from session-derived stats — same rules for local and cloud. */
function evaluateUnlockedBadges(input) {
	const unlocked = [];
	if (input.completedLessonCount > 0) unlocked.push("first-lesson");
	if (input.streak >= 7) unlocked.push("streak-7");
	if (input.bestWpm >= 50) unlocked.push("wpm-50");
	if (input.hasPerfectRun) unlocked.push("perfect-run");
	if (input.masteredLessonCount >= input.totalCurriculumLessons) unlocked.push("curriculum-done");
	return unlocked;
}
function checkAndUnlockBadges(stats) {
	const next = evaluateUnlockedBadges(buildBadgeEvaluationFromLocal());
	const previous = new Set(getUnlockedBadges());
	const newly = next.filter((id) => !previous.has(id));
	if (newly.length > 0 || next.length !== previous.size) replaceUnlockedBadges(next);
	return newly;
}
//#endregion
//#region src/services/supabase/syncBadges.ts
function buildBadgeEvaluationFromSessions(sessions, streak) {
	const lessonBests = {};
	let bestWpm = 0;
	let hasPerfectRun = false;
	for (const session of sessions) {
		const accuracy = Number(session.accuracy);
		bestWpm = Math.max(bestWpm, session.wpm);
		if (accuracy === 100) hasPerfectRun = true;
		const existing = lessonBests[session.lesson_id];
		lessonBests[session.lesson_id] = {
			bestWpm: Math.max(existing?.bestWpm ?? 0, session.wpm),
			bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy)
		};
	}
	const masteredLessonCount = LESSON_ORDER.filter((id) => (lessonBests[id]?.bestAccuracy ?? 0) >= 90).length;
	return {
		completedLessonCount: Object.keys(lessonBests).length,
		streak,
		bestWpm,
		hasPerfectRun,
		masteredLessonCount,
		totalCurriculumLessons: LESSON_ORDER.length
	};
}
async function persistUserBadges(userId, badgeIds) {
	const supabase = getSupabaseClient();
	if (!supabase) return;
	for (const badgeId of badgeIds) {
		const { error } = await supabase.from("user_badges").upsert({
			user_id: userId,
			badge_id: badgeId
		}, { onConflict: "user_id,badge_id" });
		if (error) console.warn("[sync] user_badges upsert failed:", error.message);
	}
}
/** Recompute badges from all cloud sessions, persist, and mirror to localStorage. */
async function syncBadgesToCloud(userId) {
	const [sessions, timestamps] = await Promise.all([fetchAllUserSessionSummaries(), fetchUserSessionTimestamps()]);
	const streak = computeStreakFromPracticeDates(collectPracticeDates(timestamps)).streak;
	const unlocked = evaluateUnlockedBadges(buildBadgeEvaluationFromSessions(sessions, streak));
	await persistUserBadges(userId, unlocked);
	replaceUnlockedBadges(unlocked);
	return unlocked;
}
/** Recompute from already-fetched session rows (login load). */
async function syncBadgesFromSessionRows(userId, sessions, streak) {
	const unlocked = evaluateUnlockedBadges(buildBadgeEvaluationFromSessions(sessions, streak));
	await persistUserBadges(userId, unlocked);
	replaceUnlockedBadges(unlocked);
	return unlocked;
}
//#endregion
//#region src/services/supabase/loadProgress.ts
function mapSessionRow(row) {
	const lesson = getLessonById(row.lesson_id);
	return {
		lessonId: row.lesson_id,
		lessonTitle: lesson?.titleKey ?? row.lesson_id,
		wpm: row.wpm,
		accuracy: Number(row.accuracy),
		elapsedSeconds: 0,
		mode: row.mode === "test" ? "test" : "practice",
		completedAt: row.created_at
	};
}
function buildProgressFromSessions(sessions, streakResult) {
	const lessons = {};
	for (const session of sessions) {
		const existing = lessons[session.lessonId];
		lessons[session.lessonId] = {
			bestWpm: Math.max(existing?.bestWpm ?? 0, session.wpm),
			bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, session.accuracy),
			attempts: (existing?.attempts ?? 0) + 1,
			lastPlayedAt: !existing || session.completedAt > existing.lastPlayedAt ? session.completedAt : existing.lastPlayedAt
		};
	}
	return {
		lessons,
		streak: streakResult.streak,
		lastPracticeDate: streakResult.lastPracticeDate
	};
}
function mapKeyErrors(rows) {
	const misses = {};
	for (const row of rows) {
		const code = charToKeyCode(row.key_char) ?? row.key_char;
		misses[code] = row.error_count;
	}
	return {
		hits: {},
		misses
	};
}
/** Replace local progress with this account's cloud data. Call after clearing guest keys. */
async function loadProgressFromCloud() {
	const supabase = getSupabaseClient();
	const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
	const [sessions, keyErrors, profile, timestamps] = await Promise.all([
		fetchUserSessions(100),
		fetchUserKeyErrors(),
		fetchUserProfile(),
		fetchUserSessionTimestamps()
	]);
	const streakResult = computeStreakFromPracticeDates(collectPracticeDates(timestamps));
	const history = sessions.map(mapSessionRow);
	replaceLocalProgress(history, buildProgressFromSessions(history, streakResult));
	replaceKeyStats(mapKeyErrors(keyErrors));
	if (user) {
		await updateProfileStreak(user.id, streakResult);
		const sessionSummaries = await fetchAllUserSessionSummaries();
		await syncBadgesFromSessionRows(user.id, sessionSummaries, streakResult.streak);
	}
	dispatchSessionComplete();
	dispatchKeyStatsUpdated();
	if (profile && user) return {
		...profile,
		current_streak: streakResult.streak,
		last_practice_date: streakResult.lastPracticeDate
	};
	return profile;
}
/** Re-apply custom avatar to auth metadata after OAuth sign-in overwrites it. */
async function restoreCustomAvatarFromProfile() {
	const supabase = getSupabaseClient();
	if (!supabase) return;
	const profile = await fetchUserProfile();
	if (!profile?.avatar_custom || !profile.avatar_url) return;
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;
	const meta = user.user_metadata ?? {};
	if (meta.avatar_custom === true && meta.avatar_url === profile.avatar_url) return;
	await supabase.auth.updateUser({ data: {
		avatar_url: profile.avatar_url,
		avatar_custom: true
	} });
}
//#endregion
//#region src/contexts/AuthProvider.tsx
var AuthContext = createContext(null);
function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(isSupabaseConfigured());
	const lastLoadedUserIdRef = useRef(null);
	useEffect(() => {
		const supabase = getSupabaseClient();
		if (!supabase) {
			setLoading(false);
			return;
		}
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user);
			setLoading(false);
		}).catch(() => setLoading(false));
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});
		return () => subscription.unsubscribe();
	}, []);
	const userId = user?.id ?? null;
	/** On login: discard guest localStorage, load cloud progress, restore custom avatar. */
	useEffect(() => {
		if (!userId) {
			lastLoadedUserIdRef.current = null;
			setProfile(null);
			return;
		}
		if (lastLoadedUserIdRef.current === userId) return;
		let cancelled = false;
		(async () => {
			clearGuestProgress();
			const loadedProfile = await loadProgressFromCloud();
			await restoreCustomAvatarFromProfile();
			if (cancelled) return;
			const supabase = getSupabaseClient();
			if (supabase) {
				const { data } = await supabase.auth.getUser();
				if (!cancelled) setUser(data.user);
			}
			if (!cancelled) {
				setProfile(loadedProfile);
				lastLoadedUserIdRef.current = userId;
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [userId]);
	/** Background sync on session complete — cloud mirrors authenticated sessions. */
	useEffect(() => {
		if (!user) return;
		const handler = () => {
			const latest = getSessionHistory()[0];
			if (latest) {
				syncSessionToCloud(user.id, latest);
				syncKeyErrorsToCloud(user.id);
				syncBadgesToCloud(user.id);
			}
		};
		window.addEventListener(SESSION_COMPLETE_EVENT, handler);
		return () => window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
	}, [user]);
	const signOut = useCallback(async () => {
		const supabase = getSupabaseClient();
		if (supabase) await supabase.auth.signOut();
		clearGuestProgress();
		dispatchSessionComplete();
		dispatchKeyStatsUpdated();
		lastLoadedUserIdRef.current = null;
		setProfile(null);
		setUser(null);
	}, []);
	const refreshUser = useCallback(async () => {
		const supabase = getSupabaseClient();
		if (!supabase) return;
		const { data } = await supabase.auth.getUser();
		setUser(data.user);
		const nextProfile = await fetchUserProfile();
		setProfile(nextProfile);
	}, []);
	const value = useMemo(() => ({
		user,
		profile,
		loading,
		isConfigured: isSupabaseConfigured(),
		signOut,
		refreshUser
	}), [
		user,
		profile,
		loading,
		signOut,
		refreshUser
	]);
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
//#endregion
//#region src/components/layout/headerClasses.ts
/** Shared styles for compact header controls — all use size-9 (36px) for alignment. */
var headerIconButtonClassName = "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0 leading-none text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";
var headerLinkClassName = "inline-flex h-9 shrink-0 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-sm leading-none text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]";
var headerAvatarButtonClassName = "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-accent)]/20 p-0 leading-none transition hover:border-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";
//#endregion
//#region src/components/layout/ThemeToggle.tsx
function ThemeToggle() {
	const { theme, toggleTheme } = useApp();
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: toggleTheme,
		className: headerIconButtonClassName,
		"aria-label": theme === "light" ? "Switch to dark mode" : "Switch to light mode",
		children: theme === "light" ? /* @__PURE__ */ jsx("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			width: "20",
			height: "20",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: /* @__PURE__ */ jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" })
		}) : /* @__PURE__ */ jsxs("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			width: "20",
			height: "20",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: [/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "4"
			}), /* @__PURE__ */ jsx("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })]
		})
	});
}
//#endregion
//#region src/utils/progress/exportImport.ts
function exportProgress() {
	const data = {};
	if (typeof window === "undefined") return {
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		data
	};
	for (const key of EXPORT_KEYS) {
		const raw = localStorage.getItem(key);
		if (raw) try {
			data[key] = JSON.parse(raw);
		} catch {
			data[key] = raw;
		}
	}
	return {
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		data
	};
}
function downloadExport() {
	const bundle = exportProgress();
	const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `typing-dvorak-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
	a.click();
	URL.revokeObjectURL(url);
}
function importProgress(json) {
	try {
		const bundle = JSON.parse(json);
		if (bundle.version !== 1 || !bundle.data) return false;
		for (const [key, value] of Object.entries(bundle.data)) if (EXPORT_KEYS.includes(key)) localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}
//#endregion
//#region src/components/layout/SettingsPanel.tsx
function SettingsPanel() {
	const { t, settings, updateSettings, setLocale } = useApp();
	const [open, setOpen] = useState(false);
	const [importMsg, setImportMsg] = useState(null);
	const fileRef = useRef(null);
	const handleImport = (file) => {
		const reader = new FileReader();
		reader.onload = () => {
			const ok = importProgress(reader.result);
			setImportMsg(ok ? "success" : "error");
			if (ok) {
				window.dispatchEvent(new CustomEvent(SESSION_COMPLETE_EVENT));
				window.dispatchEvent(new CustomEvent(KEY_STATS_UPDATED_EVENT));
			}
			setTimeout(() => setImportMsg(null), 3e3);
		};
		reader.readAsText(file);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setOpen(!open),
			className: headerIconButtonClassName,
			"aria-label": t.settings.title,
			"aria-expanded": open,
			children: /* @__PURE__ */ jsxs("svg", {
				xmlns: "http://www.w3.org/2000/svg",
				width: "20",
				height: "20",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: [/* @__PURE__ */ jsx("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), /* @__PURE__ */ jsx("circle", {
					cx: "12",
					cy: "12",
					r: "3"
				})]
			})
		}), open && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false),
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsxs("div", {
			className: "absolute right-0 z-50 mt-2 w-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-xl",
			children: [/* @__PURE__ */ jsx("h3", {
				className: "mb-4 text-sm font-semibold text-[var(--color-text)]",
				children: t.settings.title
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 max-h-[70vh] overflow-y-auto",
				children: [
					/* @__PURE__ */ jsx(SettingRow, {
						label: t.settings.language,
						children: /* @__PURE__ */ jsx("div", {
							className: "flex gap-1",
							children: ["en", "es"].map((loc) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setLocale(loc),
								className: ["rounded-md px-2.5 py-1 text-xs font-medium uppercase transition", settings.locale === loc ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-key)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"].join(" "),
								children: loc
							}, loc))
						})
					}),
					/* @__PURE__ */ jsx(Toggle, {
						label: t.settings.sound,
						description: t.settings.soundDesc,
						checked: settings.sound,
						onChange: (v) => updateSettings({ sound: v })
					}),
					/* @__PURE__ */ jsx(Toggle, {
						label: t.settings.blindMode,
						description: t.settings.blindDesc,
						checked: settings.blindMode,
						onChange: (v) => updateSettings({ blindMode: v })
					}),
					/* @__PURE__ */ jsx(Toggle, {
						label: t.settings.fingerColors,
						description: t.settings.fingerDesc,
						checked: settings.fingerColors,
						onChange: (v) => updateSettings({ fingerColors: v })
					}),
					/* @__PURE__ */ jsx(HighlightThemePicker, {
						label: t.settings.highlightTheme,
						description: t.settings.highlightThemeDesc,
						value: settings.highlightTheme,
						themeLabels: t.settings.highlightThemes,
						onChange: (id) => updateSettings({ highlightTheme: id })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "border-t border-[var(--color-border)] pt-4 space-y-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-sm text-[var(--color-text)]",
								children: t.settings.exportData
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-[var(--color-text-muted)]",
								children: t.settings.exportDesc
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => downloadExport(),
								className: "mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-key)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)]",
								children: t.settings.exportBtn
							})
						] }), /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-sm text-[var(--color-text)]",
								children: t.settings.importData
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-[var(--color-text-muted)]",
								children: t.settings.importDesc
							}),
							/* @__PURE__ */ jsx("input", {
								ref: fileRef,
								type: "file",
								accept: "application/json,.json",
								className: "hidden",
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (file) handleImport(file);
									e.target.value = "";
								}
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => fileRef.current?.click(),
								className: "mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-key)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)]",
								children: t.settings.importBtn
							}),
							importMsg === "success" && /* @__PURE__ */ jsx("p", {
								className: "mt-1.5 text-xs text-[var(--color-correct)]",
								children: t.settings.importSuccess
							}),
							importMsg === "error" && /* @__PURE__ */ jsx("p", {
								className: "mt-1.5 text-xs text-[var(--color-incorrect)]",
								children: t.settings.importError
							})
						] })]
					})
				]
			})]
		})] })]
	});
}
function SettingRow({ label, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-sm text-[var(--color-text)]",
			children: label
		}), children]
	});
}
function HighlightThemePicker({ label, description, value, themeLabels, onChange }) {
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("p", {
			className: "text-sm text-[var(--color-text)]",
			children: label
		}),
		/* @__PURE__ */ jsx("p", {
			className: "text-xs text-[var(--color-text-muted)]",
			children: description
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: HIGHLIGHT_THEME_IDS.map((id) => {
				const selected = value === id;
				return /* @__PURE__ */ jsx("button", {
					type: "button",
					title: themeLabels[id],
					"aria-label": themeLabels[id],
					"aria-pressed": selected,
					onClick: () => onChange(id),
					className: ["size-8 rounded-lg border-2 transition hover:scale-105", selected ? "border-[var(--color-text)] ring-2 ring-[var(--color-highlight)] ring-offset-2 ring-offset-[var(--color-surface-elevated)]" : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"].join(" "),
					style: { backgroundColor: HIGHLIGHT_THEMES[id].swatch }
				}, id);
			})
		})
	] });
}
function Toggle({ label, description, checked, onChange }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "flex cursor-pointer items-start justify-between gap-3",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
			className: "text-sm text-[var(--color-text)]",
			children: label
		}), /* @__PURE__ */ jsx("p", {
			className: "text-xs text-[var(--color-text-muted)]",
			children: description
		})] }), /* @__PURE__ */ jsx("button", {
			type: "button",
			role: "switch",
			"aria-checked": checked,
			onClick: () => onChange(!checked),
			className: ["relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"].join(" "),
			children: /* @__PURE__ */ jsx("span", { className: ["absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition", checked ? "translate-x-5" : "translate-x-0"].join(" ") })
		})]
	});
}
//#endregion
//#region src/services/supabase/auth.ts
function authRedirectPath(next = "/lessons") {
	if (typeof window === "undefined") return "/auth/callback";
	const url = new URL("/auth/callback", window.location.origin);
	url.searchParams.set("next", next);
	return url.toString();
}
async function signInWithOAuth(provider, next = "/lessons") {
	const supabase = getSupabaseClient();
	if (!supabase) return { error: "Supabase is not configured. Add credentials to .env" };
	const { error } = await supabase.auth.signInWithOAuth({
		provider,
		options: { redirectTo: authRedirectPath(next) }
	});
	return { error: error?.message ?? null };
}
//#endregion
//#region src/components/ui/Card.tsx
var VARIANT$1 = {
	default: "border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
	elevated: "border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm",
	dashed: "border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50",
	highlight: "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 bg-[var(--color-surface-elevated)]",
	muted: "border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50 opacity-60"
};
var PADDING = {
	none: "",
	sm: "p-4",
	md: "p-5",
	lg: "p-6"
};
/** Header padding used when the body is full-bleed (matches PADDING but bottom-less). */
var BLEED_HEADER_PADDING = {
	none: "px-6 pt-6",
	sm: "px-4 pt-4",
	md: "px-5 pt-5",
	lg: "px-6 pt-6"
};
function Card({ children, title, description, variant = "default", padding = "md", className = "", headerClassName = "", bodyClassName = "", bleed = false, as: Tag = "div", href, onClick }) {
	const base = [
		"rounded-xl border transition overflow-hidden",
		VARIANT$1[variant],
		bleed ? "" : PADDING[padding],
		className
	].join(" ");
	const hasHeader = Boolean(title || description);
	const headerPadding = bleed ? BLEED_HEADER_PADDING[padding] : "";
	const content = /* @__PURE__ */ jsxs(Fragment$1, { children: [hasHeader && /* @__PURE__ */ jsxs("header", {
		className: [
			"mb-4",
			headerPadding,
			headerClassName
		].join(" "),
		children: [title && /* @__PURE__ */ jsx("h2", {
			className: "text-lg font-semibold text-[var(--color-text)]",
			children: title
		}), description && /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-sm text-[var(--color-text-muted)]",
			children: description
		})]
	}), bleed ? /* @__PURE__ */ jsx("div", {
		className: bodyClassName,
		children
	}) : children] });
	if (href) return /* @__PURE__ */ jsx("a", {
		href,
		className: [base, "block no-underline"].join(" "),
		onClick,
		children: content
	});
	return /* @__PURE__ */ jsx(Tag, {
		className: base,
		onClick,
		children: content
	});
}
//#endregion
//#region src/components/ui/Button.tsx
var VARIANT = {
	primary: "bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20 hover:bg-[var(--color-accent-hover)]",
	secondary: "border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
	ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]",
	success: "bg-[var(--color-correct)] text-white shadow-lg shadow-[var(--color-correct)]/25 hover:brightness-110",
	highlight: "bg-[var(--color-highlight)] text-white shadow-lg shadow-[var(--color-highlight)]/25 hover:bg-[var(--color-highlight-hover)]"
};
var SIZE = {
	sm: "px-3 py-1.5 text-xs",
	md: "px-4 py-2.5 text-sm",
	lg: "px-6 py-3.5 text-base"
};
function Button({ children, variant = "primary", size = "md", fullWidth = false, className = "", type = "button", ...props }) {
	return /* @__PURE__ */ jsx("button", {
		type,
		className: [
			"inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-40",
			VARIANT[variant],
			SIZE[size],
			fullWidth ? "w-full" : "",
			className
		].join(" "),
		...props,
		children
	});
}
//#endregion
//#region src/components/ui/Icon.tsx
var PATHS = {
	"chevron-down": /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" }),
	"chevron-right": /* @__PURE__ */ jsx("path", { d: "m9 18 6-6-6-6" }),
	star: /* @__PURE__ */ jsx("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" }),
	"star-filled": /* @__PURE__ */ jsx("path", {
		d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
		fill: "currentColor",
		stroke: "none"
	}),
	github: /* @__PURE__ */ jsx(Fragment$1, { children: /* @__PURE__ */ jsx("path", { d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" }) }),
	google: /* @__PURE__ */ jsx(Fragment$1, { children: /* @__PURE__ */ jsx("path", { d: "M12 11v2.4h3.97c-.16 1.029-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42S9.61 7.58 12 7.58c1.36 0 2.27.58 2.79 1.08l1.9-1.83C15.47 5.69 13.89 5 12 5 8.14 5 5 8.14 5 12s3.14 7 7 7c4.06 0 6.75-2.85 6.75-6.87 0-.46-.05-.81-.11-1.13H12z" }) }),
	lock: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
		width: "18",
		height: "11",
		x: "3",
		y: "11",
		rx: "2",
		ry: "2"
	}), /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })] }),
	chart: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M3 3v18h18" }), /* @__PURE__ */ jsx("path", { d: "m19 9-5 5-4-4-3 3" })] }),
	keyboard: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("rect", {
		width: "20",
		height: "16",
		x: "2",
		y: "4",
		rx: "2"
	}), /* @__PURE__ */ jsx("path", { d: "M6 8h.001M10 8h.001M14 8h.001M18 8h.001" })] }),
	"log-out": /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
		/* @__PURE__ */ jsx("polyline", { points: "16 17 21 12 16 7" }),
		/* @__PURE__ */ jsx("line", {
			x1: "21",
			x2: "9",
			y1: "12",
			y2: "12"
		})
	] }),
	user: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "7",
		r: "4"
	})] }),
	camera: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("path", { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" }), /* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "13",
		r: "3"
	})] }),
	trophy: /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("path", { d: "M8 21h8" }),
		/* @__PURE__ */ jsx("path", { d: "M12 17v4" }),
		/* @__PURE__ */ jsx("path", { d: "M7 4h10" }),
		/* @__PURE__ */ jsx("path", { d: "M17 4v3a5 5 0 0 1-10 0V4" }),
		/* @__PURE__ */ jsx("path", { d: "M5 5H3v1a4 4 0 0 0 4 4" }),
		/* @__PURE__ */ jsx("path", { d: "M19 5h2v1a4 4 0 0 1-4 4" })
	] })
};
function Icon({ name, size = 16, className = "", ...props }) {
	const filled = name === "star-filled";
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: filled ? "currentColor" : "none",
		stroke: filled ? "none" : "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className,
		"aria-hidden": "true",
		...props,
		children: PATHS[name]
	});
}
//#endregion
//#region src/components/ui/StarRating.tsx
function StarRating({ accuracy, wpm, size = 22, showLabel = true, label }) {
	const stars = calculateStars(accuracy, wpm);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-1",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex gap-1",
			"aria-label": `${stars} de 3 estrellas`,
			children: [
				1,
				2,
				3
			].map((n) => /* @__PURE__ */ jsx(Icon, {
				name: n <= stars ? "star-filled" : "star",
				size,
				className: n <= stars ? "text-[var(--color-key-target)]" : "text-[var(--color-border)]"
			}, n))
		}), showLabel && label && /* @__PURE__ */ jsx("p", {
			className: "text-xs text-[var(--color-text-muted)]",
			children: label
		})]
	});
}
//#endregion
//#region src/components/ui/StatCard.tsx
var VARIANT_CLASSES = {
	default: "border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
	highlight: "border-[var(--color-correct)]/30 bg-[var(--color-correct)]/8",
	accent: "border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
	success: "border-[var(--color-correct)]/40 bg-[var(--color-correct)]/5",
	active: "border-[var(--color-accent)]/30 bg-[var(--color-surface-elevated)] shadow-sm",
	urgent: "border-[var(--color-incorrect)]/50 bg-[var(--color-incorrect)]/5 animate-pulse motion-reduce:animate-none"
};
var VALUE_CLASSES = {
	default: "text-[var(--color-text)]",
	highlight: "text-[var(--color-correct)]",
	accent: "text-[var(--color-accent)]",
	success: "text-[var(--color-correct)]",
	active: "text-[var(--color-text)]",
	urgent: "text-[var(--color-incorrect)]"
};
/** Reusable metric pill — stats bar, dashboard, and completion modal. */
function StatCard({ label, value, variant = "default", size = "md", icon }) {
	const padding = size === "lg" ? "px-2 py-3 sm:px-3" : "sm:px-4 sm:py-4";
	const valueSize = size === "lg" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";
	const surface = variant === "highlight" ? "bg-[var(--color-surface)]" : "";
	return /* @__PURE__ */ jsxs("div", {
		className: [
			"relative overflow-hidden rounded-xl border px-3 py-3 text-center transition-all duration-300",
			padding,
			VARIANT_CLASSES[variant],
			surface
		].join(" "),
		children: [
			variant === "active" && /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" }),
			/* @__PURE__ */ jsx("p", {
				className: "text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)] sm:text-xs",
				children: label
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-1 flex items-center justify-center gap-2",
				children: [/* @__PURE__ */ jsx("p", {
					className: [
						"font-mono font-bold",
						valueSize,
						VALUE_CLASSES[variant]
					].join(" "),
					children: value
				}), icon]
			})
		]
	});
}
//#endregion
//#region src/components/auth/AuthControls.tsx
function OAuthIconButton({ provider, label }) {
	const [loading, setLoading] = useState(false);
	const icon = provider === "github" ? "github" : "google";
	const handleClick = async () => {
		setLoading(true);
		const { error } = await signInWithOAuth(provider);
		if (error) console.warn("[auth]", error);
		setLoading(false);
	};
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: handleClick,
		disabled: loading,
		className: headerIconButtonClassName,
		"aria-label": label,
		title: label,
		children: /* @__PURE__ */ jsx(Icon, {
			name: icon,
			size: 20
		})
	});
}
function AuthControls({ variant = "app" }) {
	const { user, loading, isConfigured } = useAuth();
	const { t } = useApp();
	if (user) return null;
	if (loading) return null;
	if (!isConfigured) return /* @__PURE__ */ jsx("a", {
		href: "/login",
		className: headerLinkClassName,
		children: t.auth.signIn
	});
	if (variant === "landing") return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-1.5",
		children: [/* @__PURE__ */ jsx("a", {
			href: "/login",
			className: "rounded-lg px-3 py-2 text-sm leading-none text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-accent)]",
			children: t.auth.signIn
		}), /* @__PURE__ */ jsx("a", {
			href: "/lessons",
			className: "inline-flex h-9 items-center rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold leading-none text-white no-underline shadow-lg shadow-[var(--color-accent)]/20 transition hover:bg-[var(--color-accent-hover)]",
			children: t.landing.openApp
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex shrink-0 items-center gap-1.5",
		children: [
			/* @__PURE__ */ jsx("a", {
				href: "/login",
				className: "hidden h-9 items-center px-2 text-sm leading-none text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-accent)] sm:inline-flex",
				children: t.auth.signIn
			}),
			/* @__PURE__ */ jsx(OAuthIconButton, {
				provider: "github",
				label: t.auth.signInGithub
			}),
			/* @__PURE__ */ jsx(OAuthIconButton, {
				provider: "google",
				label: t.auth.signInGoogle
			})
		]
	});
}
//#endregion
//#region src/utils/user/userDisplay.ts
function readOAuthAvatar(user) {
	for (const identity of user.identities ?? []) {
		const data = identity.identity_data ?? {};
		const url = data.avatar_url ?? data.picture;
		if (typeof url === "string" && url.trim().length > 0) return url.trim();
	}
	const meta = user.user_metadata ?? {};
	const fallback = meta.avatar_url ?? meta.picture;
	if (typeof fallback === "string" && fallback.trim().length > 0 && meta.avatar_custom !== true) return fallback.trim();
	return null;
}
function getUserAvatarUrl(user) {
	const meta = user.user_metadata ?? {};
	if (meta.avatar_custom === true) {
		const custom = meta.avatar_url;
		if (typeof custom === "string" && custom.trim().length > 0) return custom.trim();
	}
	return readOAuthAvatar(user);
}
function getUserAvatarSource(user) {
	const meta = user.user_metadata ?? {};
	if (meta.avatar_custom === true && typeof meta.avatar_url === "string" && meta.avatar_url.trim()) return "custom";
	if (readOAuthAvatar(user)) return "oauth";
	return "none";
}
function getUserDisplayName(user) {
	const meta = user.user_metadata ?? {};
	const name = meta.full_name ?? meta.name ?? meta.user_name;
	if (typeof name === "string" && name.trim()) return name.trim();
	if (user.email) return user.email.split("@")[0] ?? "User";
	return "User";
}
function getUserInitials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
	return name.slice(0, 2).toUpperCase();
}
function getUserDisplay(user, profile) {
	const name = (typeof profile?.display_name === "string" && profile.display_name.trim() ? profile.display_name.trim() : null) ?? getUserDisplayName(user);
	if (profile?.avatar_custom === true) {
		const custom = profile.avatar_url;
		if (typeof custom === "string" && custom.trim().length > 0) return {
			name,
			avatarUrl: custom.trim(),
			initials: getUserInitials(name),
			avatarSource: "custom",
			hasCustomAvatar: true
		};
	}
	const avatarSource = getUserAvatarSource(user);
	return {
		name,
		avatarUrl: getUserAvatarUrl(user),
		initials: getUserInitials(name),
		avatarSource,
		hasCustomAvatar: avatarSource === "custom"
	};
}
//#endregion
//#region src/services/supabase/avatar.ts
var AVATAR_BUCKET = "avatars";
var MAX_BYTES = 2 * 1024 * 1024;
var ALLOWED_TYPES = /* @__PURE__ */ new Set([
	"image/jpeg",
	"image/png",
	"image/webp"
]);
function extForMime(mime) {
	if (mime === "image/png") return "png";
	if (mime === "image/webp") return "webp";
	return "jpg";
}
function avatarObjectPath(userId, mime) {
	return `${userId}/avatar.${extForMime(mime)}`;
}
async function syncProfileAvatar(userId, avatarUrl, avatarCustom) {
	const supabase = getSupabaseClient();
	if (!supabase) return;
	const { error } = await supabase.from("profiles").update({
		avatar_url: avatarUrl,
		avatar_custom: avatarCustom
	}).eq("id", userId);
	if (error) console.warn("[avatar] profile sync failed:", error.message);
}
async function updateAuthAvatarMetadata(avatarUrl, avatarCustom) {
	const supabase = getSupabaseClient();
	if (!supabase) return "Supabase is not configured.";
	const { error } = await supabase.auth.updateUser({ data: {
		avatar_url: avatarUrl,
		avatar_custom: avatarCustom
	} });
	return error?.message ?? null;
}
function validateAvatarFile(file) {
	if (!ALLOWED_TYPES.has(file.type)) return "invalidType";
	if (file.size > MAX_BYTES) return "tooLarge";
	return null;
}
async function uploadUserAvatar(file) {
	const supabase = getSupabaseClient();
	if (!supabase) return { error: "notConfigured" };
	const validation = validateAvatarFile(file);
	if (validation) return { error: validation };
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return { error: "notAuthenticated" };
	const objectPath = avatarObjectPath(user.id, file.type);
	const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(objectPath, file, {
		upsert: true,
		contentType: file.type,
		cacheControl: "3600"
	});
	if (uploadError) return { error: uploadError.message };
	const { data: publicData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
	const publicUrl = `${publicData.publicUrl}?t=${Date.now()}`;
	const metaError = await updateAuthAvatarMetadata(publicUrl, true);
	if (metaError) return { error: metaError };
	await syncProfileAvatar(user.id, publicUrl, true);
	return {
		error: null,
		url: publicUrl
	};
}
async function removeCustomUserAvatar() {
	const supabase = getSupabaseClient();
	if (!supabase) return { error: "notConfigured" };
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return { error: "notAuthenticated" };
	const paths = [
		"jpg",
		"png",
		"webp"
	].map((ext) => `${user.id}/avatar.${ext}`);
	await supabase.storage.from(AVATAR_BUCKET).remove(paths);
	const metaError = await updateAuthAvatarMetadata(null, false);
	if (metaError) return { error: metaError };
	await syncProfileAvatar(user.id, null, false);
	return { error: null };
}
//#endregion
//#region src/components/auth/UserAvatar.tsx
function UserAvatar({ avatarUrl, initials, avatarSource = "none", size = 36 }) {
	return /* @__PURE__ */ jsx("span", {
		className: "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-accent)]/15",
		style: {
			width: size,
			height: size
		},
		children: Boolean(avatarUrl) ? /* @__PURE__ */ jsx("img", {
			src: avatarUrl,
			alt: "",
			draggable: false,
			className: "absolute inset-0 block size-full object-cover object-center"
		}) : avatarSource === "none" ? /* @__PURE__ */ jsx(Icon, {
			name: "user",
			size: Math.round(size * .48),
			className: "text-[var(--color-accent)]"
		}) : /* @__PURE__ */ jsx("span", {
			className: "font-semibold text-[var(--color-accent)]",
			style: { fontSize: size * .36 },
			children: initials
		})
	});
}
//#endregion
//#region src/components/auth/EditAvatarModal.tsx
function EditAvatarModal({ user, onClose }) {
	const { t } = useApp();
	const { refreshUser, profile } = useAuth();
	const fileRef = useRef(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [errorKey, setErrorKey] = useState(null);
	const display = getUserDisplay(user, profile);
	const handleFile = async (file) => {
		setErrorKey(null);
		setLoading(true);
		const preview = URL.createObjectURL(file);
		setPreviewUrl(preview);
		const { error } = await uploadUserAvatar(file);
		setLoading(false);
		if (error) {
			setErrorKey(error);
			URL.revokeObjectURL(preview);
			setPreviewUrl(null);
			return;
		}
		await refreshUser();
		URL.revokeObjectURL(preview);
		onClose();
	};
	const handleRemove = async () => {
		setErrorKey(null);
		setLoading(true);
		const { error } = await removeCustomUserAvatar();
		setLoading(false);
		if (error) {
			setErrorKey(error);
			return;
		}
		await refreshUser();
		onClose();
	};
	const errorMessage = (() => {
		if (!errorKey) return null;
		if (errorKey === "invalidType") return t.auth.avatarInvalidType;
		if (errorKey === "tooLarge") return t.auth.avatarTooLarge;
		if (errorKey === "notConfigured") return t.auth.avatarNotConfigured;
		if (errorKey === "notAuthenticated") return t.auth.avatarNotAuthenticated;
		return errorKey;
	})();
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[60] bg-black/50",
		onClick: onClose,
		"aria-hidden": "true"
	}), /* @__PURE__ */ jsxs("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "edit-avatar-title",
		className: "fixed left-1/2 top-1/2 z-[70] w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-2xl",
		children: [
			/* @__PURE__ */ jsx("h2", {
				id: "edit-avatar-title",
				className: "text-base font-semibold text-[var(--color-text)]",
				children: t.auth.changePhoto
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-[var(--color-text-muted)]",
				children: t.auth.changePhotoDesc
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-5 flex justify-center",
				children: /* @__PURE__ */ jsx(UserAvatar, {
					avatarUrl: previewUrl ?? display.avatarUrl,
					initials: display.initials,
					avatarSource: previewUrl ? "custom" : display.avatarSource,
					size: 88
				})
			}),
			errorMessage && /* @__PURE__ */ jsx("p", {
				className: "mt-4 rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-3 py-2 text-xs text-[var(--color-incorrect)]",
				children: errorMessage
			}),
			/* @__PURE__ */ jsx("input", {
				ref: fileRef,
				type: "file",
				accept: "image/jpeg,image/png,image/webp",
				className: "hidden",
				onChange: (e) => {
					const file = e.target.files?.[0];
					if (file) handleFile(file);
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex flex-col gap-2",
				children: [
					/* @__PURE__ */ jsx(Button, {
						type: "button",
						fullWidth: true,
						disabled: loading,
						onClick: () => fileRef.current?.click(),
						children: t.auth.uploadPhoto
					}),
					display.hasCustomAvatar && /* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						fullWidth: true,
						disabled: loading,
						onClick: handleRemove,
						children: t.auth.removePhoto
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "ghost",
						fullWidth: true,
						disabled: loading,
						onClick: onClose,
						children: t.auth.cancel
					})
				]
			})
		]
	})] });
}
//#endregion
//#region src/components/auth/UserProfileDropdown.tsx
function UserProfileDropdown() {
	const { user, profile, signOut, isConfigured } = useAuth();
	const { t } = useApp();
	const [open, setOpen] = useState(false);
	const [avatarModalOpen, setAvatarModalOpen] = useState(false);
	const [imageFailed, setImageFailed] = useState(false);
	if (!user) return null;
	const display = getUserDisplay(user, profile);
	const showImage = Boolean(display.avatarUrl) && !imageFailed;
	const handleSignOut = async () => {
		setOpen(false);
		await signOut();
	};
	const openAvatarModal = () => {
		setOpen(false);
		setAvatarModalOpen(true);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
		className: "relative shrink-0",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setOpen((o) => !o),
			className: headerAvatarButtonClassName,
			"aria-label": display.name,
			"aria-expanded": open,
			"aria-haspopup": "menu",
			children: showImage ? /* @__PURE__ */ jsx("img", {
				src: display.avatarUrl,
				alt: "",
				draggable: false,
				className: "absolute inset-0 block size-full object-cover object-center",
				onError: () => setImageFailed(true)
			}) : display.avatarSource === "none" ? /* @__PURE__ */ jsx(Icon, {
				name: "user",
				size: 18,
				className: "text-[var(--color-accent)]"
			}) : /* @__PURE__ */ jsx("span", {
				className: "text-xs font-semibold text-[var(--color-accent)]",
				children: display.initials
			})
		}), open && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false),
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsxs("div", {
			role: "menu",
			className: "absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "border-b border-[var(--color-border)] px-4 py-3",
					children: /* @__PURE__ */ jsx("p", {
						className: "truncate text-sm font-medium text-[var(--color-text)]",
						title: display.name,
						children: display.name
					})
				}),
				isConfigured && /* @__PURE__ */ jsxs("button", {
					type: "button",
					role: "menuitem",
					onClick: openAvatarModal,
					className: "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
					children: [/* @__PURE__ */ jsx(Icon, {
						name: "camera",
						size: 16
					}), t.auth.changePhoto]
				}),
				/* @__PURE__ */ jsxs("a", {
					href: "/achievements",
					role: "menuitem",
					onClick: () => setOpen(false),
					className: "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
					children: [/* @__PURE__ */ jsx(Icon, {
						name: "trophy",
						size: 16
					}), t.auth.viewAchievements]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					role: "menuitem",
					onClick: handleSignOut,
					className: "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
					children: [/* @__PURE__ */ jsx(Icon, {
						name: "log-out",
						size: 16
					}), t.auth.signOut]
				})
			]
		})] })]
	}), avatarModalOpen && /* @__PURE__ */ jsx(EditAvatarModal, {
		user,
		onClose: () => setAvatarModalOpen(false)
	})] });
}
//#endregion
//#region src/components/layout/HeaderActions.tsx
function isStatsPage() {
	if (typeof window === "undefined") return false;
	return /^\/stats\/?$/.test(window.location.pathname);
}
function HeaderActions({ variant = "app" }) {
	const { t } = useApp();
	const { user, loading } = useAuth();
	const onStatsPage = isStatsPage();
	if (variant === "app") return /* @__PURE__ */ jsxs("nav", {
		className: "flex items-center gap-1.5 sm:gap-2",
		"aria-label": t.nav.settings,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-1.5",
			children: [
				onStatsPage ? /* @__PURE__ */ jsx("a", {
					href: "/lessons",
					className: headerLinkClassName,
					children: t.nav.lessons
				}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("a", {
					href: "/stats",
					className: headerLinkClassName,
					children: t.nav.stats
				}), /* @__PURE__ */ jsx("a", {
					href: "/multiplayer",
					className: headerLinkClassName,
					children: t.nav.multiplayer
				})] }),
				/* @__PURE__ */ jsx(SettingsPanel, {}),
				/* @__PURE__ */ jsx(ThemeToggle, {})
			]
		}), !loading && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
			className: "mx-0.5 h-6 w-px shrink-0 bg-[var(--color-border)]",
			"aria-hidden": "true"
		}), user ? /* @__PURE__ */ jsx(UserProfileDropdown, {}) : /* @__PURE__ */ jsx(AuthControls, { variant: "app" })] })]
	});
	return /* @__PURE__ */ jsxs("nav", {
		className: "flex items-center gap-1.5 sm:gap-2",
		"aria-label": t.nav.settings,
		children: [
			user && /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5",
					children: [
						onStatsPage ? /* @__PURE__ */ jsx("a", {
							href: "/lessons",
							className: "inline-flex h-9 shrink-0 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-sm leading-none text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
							children: t.nav.lessons
						}) : /* @__PURE__ */ jsx("a", {
							href: "/stats",
							className: "inline-flex h-9 shrink-0 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-sm leading-none text-[var(--color-text-muted)] no-underline transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
							children: t.nav.stats
						}),
						/* @__PURE__ */ jsx(SettingsPanel, {}),
						/* @__PURE__ */ jsx(ThemeToggle, {})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mx-0.5 h-6 w-px shrink-0 bg-[var(--color-border)]",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ jsx(UserProfileDropdown, {})
			] }),
			!user && !loading && /* @__PURE__ */ jsx(AuthControls, { variant: "landing" }),
			!user && loading && /* @__PURE__ */ jsx("div", {
				className: "h-9 w-24 animate-pulse rounded-lg bg-[var(--color-surface-elevated)]",
				"aria-hidden": "true"
			})
		]
	});
}
//#endregion
//#region src/components/layout/PageLayout.tsx
function PageLayout({ children }) {
	const { t } = useApp();
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("header", {
		className: "border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex max-w-5xl items-center justify-between px-4 py-4",
			children: [/* @__PURE__ */ jsxs("a", {
				href: "/",
				className: "flex items-center gap-2 font-semibold text-[var(--color-text)] no-underline hover:text-[var(--color-accent)]",
				children: [/* @__PURE__ */ jsxs("svg", {
					xmlns: "http://www.w3.org/2000/svg",
					width: "24",
					height: "24",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					className: "text-[var(--color-accent)]",
					children: [/* @__PURE__ */ jsx("rect", {
						width: "20",
						height: "16",
						x: "2",
						y: "4",
						rx: "2"
					}), /* @__PURE__ */ jsx("path", { d: "M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" })]
				}), t.siteName]
			}), /* @__PURE__ */ jsx(HeaderActions, {})]
		})
	}), /* @__PURE__ */ jsx("main", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children
	})] });
}
//#endregion
//#region src/components/layout/SiteFooter.tsx
function SiteFooter() {
	const { t } = useApp();
	return /* @__PURE__ */ jsx("footer", {
		className: "border-t border-[var(--color-border)] py-6 text-center text-sm text-[var(--color-text-muted)]",
		children: /* @__PURE__ */ jsx("p", { children: t.footer })
	});
}
//#endregion
//#region src/components/layout/AppShell.tsx
function AppShell({ children }) {
	return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsxs(AppProvider, { children: [/* @__PURE__ */ jsx(PageLayout, { children }), /* @__PURE__ */ jsx(SiteFooter, {})] }) });
}
//#endregion
//#region src/components/layout/BackLink.tsx
function BackLink({ href = "/lessons", label }) {
	const { t } = useApp();
	const text = label ?? t.nav.backToLessons;
	return /* @__PURE__ */ jsx("nav", {
		className: "mb-8",
		children: /* @__PURE__ */ jsxs("a", {
			href,
			className: "inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-accent)]",
			children: [/* @__PURE__ */ jsx(Icon, {
				name: "chevron-right",
				size: 16,
				className: "rotate-180"
			}), text]
		})
	});
}
//#endregion
//#region src/hooks/useMultiplayerLobby.ts
function parsePresenceState(state) {
	const players = [];
	for (const presences of Object.values(state)) for (const raw of presences) {
		const entry = raw;
		if (!entry.userId || !entry.name) continue;
		players.push({
			userId: entry.userId,
			name: entry.name,
			avatarUrl: entry.avatarUrl ?? null,
			initials: entry.initials ?? entry.name.slice(0, 2).toUpperCase(),
			avatarSource: entry.avatarSource ?? "none",
			isReady: Boolean(entry.isReady),
			joinedAt: entry.joinedAt ?? 0
		});
	}
	return players.sort((a, b) => a.joinedAt - b.joinedAt);
}
function useMultiplayerLobby({ roomId, onAllReady, minPlayers = 2 }) {
	const { user, profile } = useAuth();
	const [players, setPlayers] = useState([]);
	const [status, setStatus] = useState("idle");
	const [error, setError] = useState(null);
	const [isReady, setIsReady] = useState(false);
	const [channel, setChannel] = useState(null);
	const channelRef = useRef(null);
	const presenceRef = useRef(null);
	const allReadyFiredRef = useRef(false);
	const onAllReadyRef = useRef(onAllReady);
	onAllReadyRef.current = onAllReady;
	const syncPlayers = useCallback((channel) => {
		const next = parsePresenceState(channel.presenceState());
		setPlayers(next);
		if (user?.id) {
			const self = next.find((player) => player.userId === user.id);
			if (self) setIsReady(self.isReady);
		}
		if (!allReadyFiredRef.current && next.length >= minPlayers && next.every((player) => player.isReady)) {
			allReadyFiredRef.current = true;
			onAllReadyRef.current?.();
		}
	}, [user?.id, minPlayers]);
	useEffect(() => {
		allReadyFiredRef.current = false;
	}, [roomId]);
	useEffect(() => {
		if (!user || !roomId) {
			setStatus("idle");
			setPlayers([]);
			return;
		}
		const supabase = getSupabaseClient();
		if (!supabase) {
			setStatus("error");
			setError("supabase_not_configured");
			return;
		}
		const display = getUserDisplay(user, profile);
		const presencePayload = {
			userId: user.id,
			name: display.name,
			avatarUrl: display.avatarUrl,
			initials: display.initials,
			avatarSource: display.avatarSource,
			isReady: false,
			joinedAt: Date.now()
		};
		presenceRef.current = presencePayload;
		setIsReady(false);
		setStatus("connecting");
		setError(null);
		setPlayers([]);
		const channel = supabase.channel(`room-${roomId}`, { config: { presence: { key: user.id } } });
		channel.on("presence", { event: "sync" }, () => syncPlayers(channel)).subscribe(async (subscribeStatus) => {
			if (subscribeStatus === "SUBSCRIBED") {
				const { error: trackError } = await channel.track(presencePayload);
				if (trackError) {
					setStatus("error");
					setError(trackError.message);
					return;
				}
				setStatus("connected");
				syncPlayers(channel);
			} else if (subscribeStatus === "CHANNEL_ERROR") {
				setStatus("error");
				setError("channel_error");
			} else if (subscribeStatus === "TIMED_OUT") {
				setStatus("error");
				setError("timed_out");
			}
		});
		channelRef.current = channel;
		setChannel(channel);
		return () => {
			channel.untrack().finally(() => {
				supabase.removeChannel(channel);
			});
			channelRef.current = null;
			presenceRef.current = null;
			setChannel(null);
		};
	}, [
		user,
		profile,
		roomId,
		syncPlayers
	]);
	const toggleReadyStatus = useCallback(async () => {
		const channel = channelRef.current;
		const presence = presenceRef.current;
		if (!channel || !presence) return;
		const nextReady = !presence.isReady;
		const updated = {
			...presence,
			isReady: nextReady
		};
		presenceRef.current = updated;
		setIsReady(nextReady);
		const { error: trackError } = await channel.track(updated);
		if (trackError) {
			setError(trackError.message);
			presenceRef.current = presence;
			setIsReady(presence.isReady);
		}
	}, []);
	const leaveLobby = useCallback(async () => {
		const channel = channelRef.current;
		const supabase = getSupabaseClient();
		if (!channel || !supabase) return;
		await channel.untrack();
		supabase.removeChannel(channel);
		channelRef.current = null;
		presenceRef.current = null;
		setChannel(null);
		setPlayers([]);
		setStatus("idle");
		setIsReady(false);
	}, []);
	return {
		players,
		status,
		error,
		isReady,
		isConnected: status === "connected",
		toggleReadyStatus,
		leaveLobby,
		currentUserId: user?.id ?? null,
		channel
	};
}
//#endregion
//#region src/components/multiplayer/LobbyPlayerList.tsx
function LobbyPlayerList({ players, currentUserId, readyLabel, waitingLabel, youLabel }) {
	if (players.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "py-8 text-center text-sm text-[var(--color-text-muted)]",
		children: waitingLabel
	});
	return /* @__PURE__ */ jsx("ul", {
		className: "divide-y divide-[var(--color-border)]",
		children: players.map((player) => {
			const isSelf = player.userId === currentUserId;
			return /* @__PURE__ */ jsxs("li", {
				className: "flex items-center gap-3 px-5 py-4",
				children: [
					/* @__PURE__ */ jsx(UserAvatar, {
						avatarUrl: player.avatarUrl,
						initials: player.initials,
						avatarSource: player.avatarSource,
						size: 40
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsxs("p", {
							className: "truncate font-medium text-[var(--color-text)]",
							children: [player.name, isSelf ? /* @__PURE__ */ jsxs("span", {
								className: "ml-2 text-xs font-normal text-[var(--color-text-muted)]",
								children: [
									"(",
									youLabel,
									")"
								]
							}) : null]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-[var(--color-text-muted)]",
							children: player.isReady ? readyLabel : waitingLabel
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: ["flex h-8 w-8 shrink-0 items-center justify-center rounded-full border", player.isReady ? "border-[var(--color-correct)] bg-[var(--color-correct)]/15 text-[var(--color-correct)]" : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"].join(" "),
						"aria-label": player.isReady ? readyLabel : waitingLabel,
						children: player.isReady ? /* @__PURE__ */ jsx("svg", {
							xmlns: "http://www.w3.org/2000/svg",
							width: 16,
							height: 16,
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.5",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" })
						}) : /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-current opacity-40" })
					})
				]
			}, player.userId);
		})
	});
}
//#endregion
//#region src/hooks/useMultiplayerRace.ts
function clampPercentage(value) {
	return Math.min(100, Math.max(0, value));
}
function useMultiplayerRace({ channel, currentUserId, players, enabled = true }) {
	const [opponents, setOpponents] = useState([]);
	const opponentMapRef = useRef(/* @__PURE__ */ new Map());
	const animationFrameRef = useRef(null);
	const lastBroadcastAtRef = useRef(0);
	const playerById = useMemo(() => {
		return new Map(players.map((player) => [player.userId, player]));
	}, [players]);
	const flushOpponents = useCallback(() => {
		animationFrameRef.current = null;
		const next = [];
		for (const progress of opponentMapRef.current.values()) {
			const player = playerById.get(progress.userId);
			if (!player || progress.userId === currentUserId) continue;
			next.push({
				...progress,
				name: player.name,
				avatarUrl: player.avatarUrl,
				initials: player.initials,
				avatarSource: player.avatarSource
			});
		}
		next.sort((a, b) => b.percentage - a.percentage || b.wpm - a.wpm);
		setOpponents(next);
	}, [currentUserId, playerById]);
	const scheduleFlush = useCallback(() => {
		if (animationFrameRef.current !== null) return;
		animationFrameRef.current = window.requestAnimationFrame(flushOpponents);
	}, [flushOpponents]);
	useEffect(() => {
		if (!channel || !enabled) return;
		const opponentMap = opponentMapRef.current;
		channel.on("broadcast", { event: "progress" }, ({ payload }) => {
			const progress = payload;
			if (!progress.userId || progress.userId === currentUserId) return;
			opponentMap.set(progress.userId, {
				userId: progress.userId,
				wpm: Math.max(0, Math.round(progress.wpm ?? 0)),
				percentage: clampPercentage(progress.percentage ?? 0),
				updatedAt: progress.updatedAt ?? Date.now()
			});
			scheduleFlush();
		});
		return () => {
			if (animationFrameRef.current !== null) {
				window.cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			opponentMap.clear();
			setOpponents([]);
		};
	}, [
		channel,
		currentUserId,
		enabled,
		scheduleFlush
	]);
	useEffect(() => {
		scheduleFlush();
	}, [players, scheduleFlush]);
	return {
		opponents,
		broadcastProgress: useCallback(async (wpm, percentage, force = false) => {
			if (!channel || !currentUserId || !enabled) return;
			const now = Date.now();
			if (!force && now - lastBroadcastAtRef.current < 500) return;
			lastBroadcastAtRef.current = now;
			await channel.send({
				type: "broadcast",
				event: "progress",
				payload: {
					userId: currentUserId,
					wpm: Math.max(0, Math.round(wpm)),
					percentage: clampPercentage(percentage),
					updatedAt: now
				}
			});
		}, [
			channel,
			currentUserId,
			enabled
		])
	};
}
/** Standard WPM: (correct characters / 5) / minutes elapsed. */
function calculateWpm(correctChars, elapsedMs) {
	if (elapsedMs <= 0) return 0;
	const minutes = elapsedMs / 6e4;
	return Math.round(correctChars / 5 / minutes);
}
/** Test mode WPM with error penalty on effective character count. */
function calculateTestWpm(correctChars, incorrectChars, elapsedMs) {
	return calculateWpm(Math.max(0, correctChars - incorrectChars * 2), elapsedMs);
}
function calculateAccuracy(correct, incorrect) {
	const total = correct + incorrect;
	if (total === 0) return 100;
	return Math.round(correct / total * 100);
}
function buildStats(correctChars, incorrectChars, elapsedMs, testMode = false) {
	return {
		wpm: testMode ? calculateTestWpm(correctChars, incorrectChars, elapsedMs) : calculateWpm(correctChars, elapsedMs),
		accuracy: calculateAccuracy(correctChars, incorrectChars),
		correctChars,
		incorrectChars,
		elapsedSeconds: Math.round(elapsedMs / 1e3)
	};
}
function pickRandomText(texts) {
	return texts[Math.floor(Math.random() * texts.length)];
}
//#endregion
//#region src/utils/typing/sound.ts
var audioCtx = null;
function getCtx() {
	if (typeof window === "undefined") return null;
	if (!audioCtx) audioCtx = new AudioContext();
	return audioCtx;
}
function playTone(frequency, duration, volume = .08) {
	const ctx = getCtx();
	if (!ctx) return;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.frequency.value = frequency;
	osc.type = "sine";
	gain.gain.setValueAtTime(volume, ctx.currentTime);
	gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
	osc.start(ctx.currentTime);
	osc.stop(ctx.currentTime + duration);
}
function playCorrectSound() {
	playTone(880, .06);
}
function playIncorrectSound() {
	playTone(220, .1, .1);
}
function playCompleteSound() {
	playTone(523, .1);
	setTimeout(() => playTone(659, .1), 80);
	setTimeout(() => playTone(784, .15), 160);
}
//#endregion
//#region src/hooks/useTypingSession.ts
function resolveInitialText(lesson, locale, customText) {
	if (customText?.trim()) return customText.trim();
	return getLessonText(lesson, pickRandomText, (charSet) => lesson.generated ? generateDrillText(charSet, 48) : pickRandomText(lesson.texts), locale);
}
function useTypingSession({ lessonId, lessonTitle, lesson, mode, sound, locale = "en", customText }) {
	const isTestMode = mode === "test";
	const initialRef = useRef(null);
	if (!initialRef.current) {
		const text = isTestMode ? generateTestStream(lesson.charSet ?? "all") : resolveInitialText(lesson, locale, customText);
		initialRef.current = {
			text,
			statuses: text.split("").map(() => "pending")
		};
	}
	const [targetText, setTargetText] = useState(initialRef.current.text);
	const [input, setInput] = useState("");
	const [statuses, setStatuses] = useState(initialRef.current.statuses);
	const [started, setStarted] = useState(false);
	const [finished, setFinished] = useState(false);
	const [paused, setPaused] = useState(false);
	const [finalStats, setFinalStats] = useState(null);
	const [isNewRecord, setIsNewRecord] = useState(false);
	const [wpmDelta, setWpmDelta] = useState(0);
	const [sessionWeakKeys, setSessionWeakKeys] = useState([]);
	const [startTime, setStartTime] = useState(null);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [activeKey, setActiveKey] = useState();
	const [errorKeystrokes, setErrorKeystrokes] = useState(0);
	const containerRef = useRef(null);
	const retryButtonRef = useRef(null);
	const sessionMissesRef = useRef({});
	const pausedAtRef = useRef(null);
	const totalPausedMsRef = useRef(0);
	const correctChars = statuses.filter((s) => s === "correct").length;
	const incorrectChars = statuses.filter((s) => s === "incorrect").length;
	const liveStats = buildStats(correctChars, isTestMode ? errorKeystrokes : incorrectChars, elapsedMs || 1, isTestMode);
	const stats = finished && finalStats ? finalStats : liveStats;
	const progress = isTestMode ? elapsedMs / (60 * 1e3) * 100 : targetText.length > 0 ? input.length / targetText.length * 100 : 0;
	const timeRemaining = Math.max(0, 60 - Math.floor(elapsedMs / 1e3));
	const nextChar = targetText[input.length];
	const targetKey = !finished && !paused && nextChar ? charToKeyCode(nextChar) : void 0;
	const finishSession = useCallback((result) => {
		const weak = getSessionWeakKeys(sessionMissesRef.current);
		setSessionWeakKeys(weak);
		setElapsedMs(result.elapsedSeconds * 1e3);
		setFinalStats(result);
		setFinished(true);
		setPaused(false);
		const { isNewRecord: record, previousBest } = saveSession(lessonId, lessonTitle, result, mode);
		setIsNewRecord(record);
		setWpmDelta(result.wpm - previousBest);
		dispatchSessionComplete();
		dispatchKeyStatsUpdated();
		checkAndUnlockBadges({
			accuracy: result.accuracy,
			wpm: result.wpm,
			lessonId
		});
		if (sound) playCompleteSound();
	}, [
		lessonId,
		lessonTitle,
		mode,
		sound
	]);
	const togglePause = useCallback(() => {
		if (!isTestMode || !started || finished) return;
		setPaused((prev) => {
			if (!prev) {
				pausedAtRef.current = Date.now();
				return true;
			}
			if (pausedAtRef.current) {
				totalPausedMsRef.current += Date.now() - pausedAtRef.current;
				pausedAtRef.current = null;
			}
			return false;
		});
	}, [
		isTestMode,
		started,
		finished
	]);
	const reset = useCallback(() => {
		sessionMissesRef.current = {};
		totalPausedMsRef.current = 0;
		pausedAtRef.current = null;
		const text = isTestMode ? generateTestStream(lesson.charSet ?? "all") : resolveInitialText(lesson, locale, customText);
		setTargetText(text);
		setInput("");
		setStatuses(text.split("").map(() => "pending"));
		setStarted(false);
		setFinished(false);
		setPaused(false);
		setFinalStats(null);
		setIsNewRecord(false);
		setWpmDelta(0);
		setSessionWeakKeys([]);
		setStartTime(null);
		setElapsedMs(0);
		setActiveKey(void 0);
		setErrorKeystrokes(0);
		requestAnimationFrame(() => containerRef.current?.focus());
	}, [
		isTestMode,
		lesson,
		locale,
		customText
	]);
	useEffect(() => {
		if (!started || finished || paused) return;
		const interval = setInterval(() => {
			if (!startTime) return;
			const elapsed = Date.now() - startTime - totalPausedMsRef.current;
			setElapsedMs(elapsed);
			if (isTestMode && elapsed >= 60 * 1e3) {
				const result = buildStats(correctChars, errorKeystrokes, elapsed, true);
				finishSession(result);
			}
		}, 100);
		return () => clearInterval(interval);
	}, [
		started,
		finished,
		paused,
		startTime,
		isTestMode,
		correctChars,
		errorKeystrokes,
		finishSession
	]);
	useEffect(() => {
		containerRef.current?.focus();
	}, []);
	const prevMode = useRef(mode);
	useEffect(() => {
		if (prevMode.current !== mode) {
			prevMode.current = mode;
			reset();
		}
	}, [mode, reset]);
	useEffect(() => {
		if (!finished) return;
		retryButtonRef.current?.focus();
		const handleRetryKey = (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				reset();
			}
		};
		window.addEventListener("keydown", handleRetryKey);
		return () => window.removeEventListener("keydown", handleRetryKey);
	}, [finished, reset]);
	const handleKeyDown = (e) => {
		if (finished) {
			if (e.key === "Enter") {
				e.preventDefault();
				reset();
			}
			return;
		}
		if (isTestMode && e.key === "Escape") {
			e.preventDefault();
			togglePause();
			return;
		}
		if (paused) return;
		if (e.key === "Tab" || e.key.startsWith("Arrow")) {
			e.preventDefault();
			return;
		}
		if (e.key === "Backspace") {
			e.preventDefault();
			if (input.length === 0) return;
			const newInput = input.slice(0, -1);
			setInput(newInput);
			setStatuses((prev) => {
				const next = [...prev];
				next[newInput.length] = "pending";
				return next;
			});
			return;
		}
		if (e.key.length !== 1) return;
		e.preventDefault();
		if (!started) {
			setStarted(true);
			setStartTime(Date.now());
		}
		const expected = targetText[input.length];
		if (expected === void 0) return;
		const isCorrect = e.key === expected;
		const newInput = input + e.key;
		setInput(newInput);
		setStatuses((prev) => {
			const next = [...prev];
			next[input.length] = isCorrect ? "correct" : "incorrect";
			return next;
		});
		recordKeystroke(e.key, isCorrect);
		if (!isCorrect) {
			setErrorKeystrokes((n) => n + 1);
			sessionMissesRef.current[e.key] = (sessionMissesRef.current[e.key] ?? 0) + 1;
		}
		if (sound) if (isCorrect) playCorrectSound();
		else playIncorrectSound();
		const code = charToKeyCode(e.key);
		setActiveKey(code);
		setTimeout(() => setActiveKey(void 0), 150);
		if (isTestMode && newInput.length >= targetText.length - 20) {
			const extension = " " + generateDrillText(lesson.charSet ?? "all", 40);
			setTargetText((prev) => prev + extension);
			setStatuses((prev) => [...prev, ...extension.split("").map(() => "pending")]);
		}
		if (!isTestMode && newInput.length === targetText.length) {
			const finalElapsed = startTime ? Date.now() - startTime - totalPausedMsRef.current : elapsedMs;
			const finalCorrect = isCorrect ? correctChars + 1 : correctChars;
			const finalIncorrect = isCorrect ? incorrectChars : incorrectChars + 1;
			finishSession(buildStats(finalCorrect, finalIncorrect, finalElapsed || 1, false));
		}
	};
	return {
		targetText,
		input,
		statuses,
		started,
		finished,
		paused,
		stats,
		progress,
		timeRemaining,
		targetKey,
		activeKey,
		isNewRecord,
		wpmDelta,
		sessionWeakKeys,
		isTestMode,
		containerRef,
		retryButtonRef,
		reset,
		handleKeyDown,
		togglePause
	};
}
//#endregion
//#region src/utils/keyboard/fingers.ts
var FINGER_CSS_VAR = {
	lp: "--finger-lp",
	lr: "--finger-lr",
	lm: "--finger-lm",
	li: "--finger-li",
	ri: "--finger-ri",
	rm: "--finger-rm",
	rr: "--finger-rr",
	rp: "--finger-rp"
};
/**
* Dvorak Simplified Keyboard — finger map by vertical column.
*
* Home row: a(LP) o(LR) e(LM) u(LI) i(LI) | d(RI) h(RI) t(RM) n(RR) s(RP)
* Space is pressed with the thumb — not mapped to a finger.
*/
var KEY_FINGERS = {
	Backquote: "lp",
	Digit1: "lp",
	Quote: "lp",
	KeyA: "lp",
	Semicolon: "lp",
	Digit2: "lr",
	Comma: "lr",
	KeyO: "lr",
	KeyQ: "lr",
	Digit3: "lm",
	Period: "lm",
	KeyE: "lm",
	KeyJ: "lm",
	Digit4: "li",
	KeyP: "li",
	KeyU: "li",
	KeyK: "li",
	Digit5: "li",
	KeyY: "li",
	KeyI: "li",
	KeyX: "li",
	Digit6: "ri",
	KeyF: "ri",
	KeyD: "ri",
	KeyB: "ri",
	Digit7: "ri",
	KeyG: "ri",
	KeyH: "ri",
	KeyM: "ri",
	Digit8: "rm",
	KeyC: "rm",
	KeyT: "rm",
	KeyW: "rm",
	Digit9: "rr",
	KeyR: "rr",
	KeyN: "rr",
	KeyV: "rr",
	Digit0: "rp",
	KeyL: "rp",
	KeyS: "rp",
	KeyZ: "rp",
	BracketLeft: "rp",
	BracketRight: "rp",
	Slash: "rp",
	Minus: "rp",
	Equal: "rp"
};
function getFingerForKey(code) {
	return KEY_FINGERS[code];
}
//#endregion
//#region src/components/typing/HandGuide.tsx
function FingerSlot({ finger, label, active }) {
	return /* @__PURE__ */ jsxs("div", {
		className: ["flex flex-col items-center gap-1 transition-all duration-150", active ? "scale-110" : "opacity-50"].join(" "),
		children: [/* @__PURE__ */ jsx("div", {
			className: ["h-10 w-7 rounded-t-full rounded-b-md border-2 sm:h-12 sm:w-8", active ? "border-[var(--color-key-target)] shadow-[0_0_12px_color-mix(in_srgb,var(--color-key-target)_50%,transparent)]" : "border-[var(--color-border)]"].join(" "),
			style: { background: active ? `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 60%, var(--color-key-target-bg))` : `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 20%, var(--color-key))` }
		}), /* @__PURE__ */ jsx("span", {
			className: ["text-[9px] sm:text-[10px]", active ? "font-semibold text-[var(--color-key-target)]" : "text-[var(--color-text-muted)]"].join(" "),
			children: label
		})]
	});
}
function ThumbBar({ active }) {
	return /* @__PURE__ */ jsx("div", {
		className: ["h-3 w-24 rounded-full transition-all duration-150 sm:w-28", active ? "bg-[var(--color-key-target)] shadow-[0_0_14px_color-mix(in_srgb,var(--color-key-target)_55%,transparent)]" : "bg-[var(--color-border)]"].join(" "),
		"aria-hidden": "true"
	});
}
function HandGuide({ targetKey }) {
	const { t } = useApp();
	const isSpace = targetKey === "Space";
	const activeFinger = !isSpace && targetKey ? getFingerForKey(targetKey) : void 0;
	const left = [
		{
			finger: "lp",
			label: t.fingers.lp
		},
		{
			finger: "lr",
			label: t.fingers.lr
		},
		{
			finger: "lm",
			label: t.fingers.lm
		},
		{
			finger: "li",
			label: t.fingers.li
		}
	];
	const right = [
		{
			finger: "ri",
			label: t.fingers.ri
		},
		{
			finger: "rm",
			label: t.fingers.rm
		},
		{
			finger: "rr",
			label: t.fingers.rr
		},
		{
			finger: "rp",
			label: t.fingers.rp
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-4 flex items-end justify-center gap-6 sm:gap-10",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center gap-2",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]",
					children: t.typing.leftHand
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex items-end gap-1 sm:gap-2",
					children: left.map(({ finger, label }) => /* @__PURE__ */ jsx(FingerSlot, {
						finger,
						label,
						active: activeFinger === finger
					}, finger))
				}),
				/* @__PURE__ */ jsx(ThumbBar, { active: isSpace }),
				isSpace && /* @__PURE__ */ jsx("span", {
					className: "text-[9px] font-semibold text-[var(--color-key-target)] sm:text-[10px]",
					children: t.typing.thumb
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center gap-2",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]",
					children: t.typing.rightHand
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex items-end gap-1 sm:gap-2",
					children: right.map(({ finger, label }) => /* @__PURE__ */ jsx(FingerSlot, {
						finger,
						label,
						active: activeFinger === finger
					}, finger))
				}),
				/* @__PURE__ */ jsx(ThumbBar, { active: isSpace })
			]
		})]
	});
}
//#endregion
//#region src/components/typing/Keyboard.tsx
function KeyLegend() {
	const { t, settings } = useApp();
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-[var(--color-text-muted)]",
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ jsx("span", { className: "inline-flex h-4 w-4 items-center justify-center rounded border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)]" }), t.typing.nextKey]
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ jsx("span", { className: "inline-flex h-4 w-4 rounded bg-[var(--color-key-pressed)]" }), t.typing.pressed]
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ jsx("span", {
					className: "relative inline-flex h-4 w-4 rounded border border-[var(--color-border)] bg-[var(--color-key)]",
					children: /* @__PURE__ */ jsx("span", { className: "absolute bottom-0.5 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-[var(--color-key-mark)]" })
				}), t.typing.homeGuides]
			}),
			settings.fingerColors && /* @__PURE__ */ jsxs("span", {
				className: "hidden text-[var(--color-text-muted)] sm:inline",
				children: [t.typing.fingers, " ↓"]
			})
		]
	});
}
function FingerColorBar({ fingers }) {
	const { t } = useApp();
	return /* @__PURE__ */ jsx("div", {
		className: "mb-3 hidden flex-wrap justify-center gap-2 sm:flex",
		children: [...new Set(fingers)].map((f) => /* @__PURE__ */ jsxs("span", {
			className: "flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]",
			children: [/* @__PURE__ */ jsx("span", {
				className: "h-2.5 w-2.5 rounded-sm",
				style: { background: `var(${FINGER_CSS_VAR[f]})` }
			}), t.fingers[f]]
		}, f))
	});
}
function Keyboard({ pressedKey, targetKey }) {
	const { t, settings } = useApp();
	const showFingers = settings.fingerColors;
	const allFingers = DVORAK_ROWS.flatMap((r) => r.keys.map((k) => getFingerForKey(k.code)).filter(Boolean));
	return /* @__PURE__ */ jsxs("section", {
		className: "hidden w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 p-4 shadow-sm sm:block sm:p-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "mb-4 flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)]",
					children: t.typing.dvorakLayout
				}), /* @__PURE__ */ jsx(KeyLegend, {})]
			}),
			showFingers && /* @__PURE__ */ jsx(FingerColorBar, { fingers: allFingers }),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto w-full max-w-3xl select-none motion-reduce:transition-none",
				"aria-hidden": "true",
				children: DVORAK_ROWS.map((row, rowIndex) => {
					const totalUnits = row.keys.reduce((s, k) => s + (k.width ?? 1), 0);
					return /* @__PURE__ */ jsx("div", {
						className: "mb-1 flex w-full justify-center",
						style: { paddingLeft: `${(row.indent ?? 0) * 2.5}%` },
						children: /* @__PURE__ */ jsx("div", {
							className: "flex w-full gap-0.5",
							children: row.keys.map((key) => {
								const isPressed = pressedKey === key.code;
								const isTarget = !isPressed && targetKey === key.code;
								const finger = showFingers ? getFingerForKey(key.code) : void 0;
								return /* @__PURE__ */ jsxs("div", {
									style: {
										width: `${(key.width ?? 1) / totalUnits * 100}%`,
										...finger && !isPressed && !isTarget ? { background: `color-mix(in srgb, var(${FINGER_CSS_VAR[finger]}) 25%, var(--color-key))` } : {}
									},
									className: ["relative flex h-10 items-center justify-center rounded-lg border font-mono text-sm font-medium transition-all duration-75 motion-reduce:animate-none sm:h-11 sm:text-base", isPressed ? "z-10 scale-95 border-[var(--color-key-pressed)] bg-[var(--color-key-pressed)] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]" : isTarget ? "z-10 border-2 border-[var(--color-key-target)] bg-[var(--color-key-target-bg)] text-[var(--color-key-target)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-key-target)_25%,transparent)] animate-pulse motion-reduce:animate-none" : "border-[var(--color-border)] bg-[var(--color-key)] text-[var(--color-text)]"].join(" "),
									children: [
										key.label,
										key.homeRowMark && !isPressed && /* @__PURE__ */ jsx("span", { className: ["absolute bottom-1 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full sm:w-4", isTarget ? "bg-[var(--color-key-target)]" : "bg-[var(--color-key-mark)]"].join(" ") }),
										isTarget && /* @__PURE__ */ jsx("span", { className: "absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-b-4 border-x-transparent border-b-[var(--color-key-target)]" })
									]
								}, key.code);
							})
						})
					}, rowIndex);
				})
			}),
			/* @__PURE__ */ jsx(HandGuide, { targetKey })
		]
	});
}
//#endregion
//#region src/components/typing/StatsBar.tsx
function StatsBar({ wpm, accuracy, elapsedSeconds, progress, finished = false, started = false, isTestMode = false, timeRemaining = 0 }) {
	const { t } = useApp();
	const formatTime = (seconds) => {
		return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
	};
	const timeDisplay = isTestMode ? formatTime(timeRemaining) : formatTime(elapsedSeconds);
	const timeLabel = isTestMode ? t.lesson.timeRemaining : t.typing.time;
	const wpmVariant = finished && wpm > 0 ? "success" : started && !finished ? "active" : "default";
	const accuracyVariant = finished && accuracy === 100 ? "success" : started && !finished ? "active" : "default";
	const timeVariant = isTestMode && timeRemaining <= 10 && started ? "urgent" : started && !finished ? "active" : "default";
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		"aria-live": "polite",
		"aria-atomic": "true",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-3 gap-3 sm:gap-4",
			children: [
				/* @__PURE__ */ jsx(StatCard, {
					label: t.typing.wpm,
					value: wpm.toString(),
					variant: wpmVariant
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: t.typing.accuracy,
					value: `${accuracy}%`,
					variant: accuracyVariant
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: timeLabel,
					value: timeDisplay,
					variant: timeVariant
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]",
			children: /* @__PURE__ */ jsx("div", {
				className: ["h-full rounded-full transition-all duration-300 ease-out", finished ? "bg-[var(--color-correct)]" : isTestMode ? "bg-[var(--color-key-target)]" : "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]"].join(" "),
				style: { width: `${Math.min(progress, 100)}%` },
				role: "progressbar",
				"aria-valuenow": Math.round(progress),
				"aria-valuemin": 0,
				"aria-valuemax": 100
			})
		})]
	});
}
//#endregion
//#region src/components/typing/CompletionPanel.tsx
function formatTime(seconds) {
	return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}
function CompletionPanel({ wpm, accuracy, elapsedSeconds, isNewRecord = false, wpmDelta = 0, weakKeys = [], onRetry, retryButtonRef }) {
	const { t: t$1, settings } = useApp();
	const isPerfect = accuracy === 100;
	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "completion-title",
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 bg-[var(--color-surface)]/60 backdrop-blur-sm motion-reduce:backdrop-blur-none",
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsxs("div", {
			className: "completion-enter relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl shadow-black/20 motion-reduce:animate-none",
			children: [/* @__PURE__ */ jsx("div", {
				className: ["h-1 w-full", isPerfect ? "bg-gradient-to-r from-[var(--color-correct)] to-[var(--color-correct)]/50" : "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/50"].join(" "),
				"aria-hidden": "true"
			}), /* @__PURE__ */ jsxs("div", {
				className: "px-6 py-8 text-center sm:px-8",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: ["mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full", isPerfect ? "bg-[var(--color-correct)]/15 ring-2 ring-[var(--color-correct)]/30" : "bg-[var(--color-accent)]/15 ring-2 ring-[var(--color-accent)]/30"].join(" "),
						children: isPerfect ? /* @__PURE__ */ jsx("svg", {
							xmlns: "http://www.w3.org/2000/svg",
							width: "28",
							height: "28",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "var(--color-correct)",
							strokeWidth: "2.5",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" })
						}) : /* @__PURE__ */ jsxs("svg", {
							xmlns: "http://www.w3.org/2000/svg",
							width: "28",
							height: "28",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "var(--color-accent)",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: [/* @__PURE__ */ jsx("path", { d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" }), /* @__PURE__ */ jsx("path", { d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" })]
						})
					}),
					isNewRecord && /* @__PURE__ */ jsx("p", {
						className: "mb-2 text-sm font-semibold text-[var(--color-key-target)]",
						children: t$1.completion.newRecord
					}),
					/* @__PURE__ */ jsx("h2", {
						id: "completion-title",
						className: "text-2xl font-bold tracking-tight text-[var(--color-text)]",
						children: isPerfect ? t$1.completion.perfect : t$1.completion.complete
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1.5 text-sm text-[var(--color-text-muted)]",
						children: isPerfect ? t$1.completion.perfectDesc : t$1.completion.keepGoing
					}),
					wpmDelta > 0 && !isNewRecord && /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-[var(--color-correct)]",
						children: t(settings.locale, "completion.improved", { delta: wpmDelta })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ jsx(StatCard, {
								label: t$1.typing.wpm,
								value: wpm.toString(),
								variant: wpm >= 40 ? "highlight" : "default",
								size: "lg"
							}),
							/* @__PURE__ */ jsx(StatCard, {
								label: t$1.typing.accuracy,
								value: `${accuracy}%`,
								variant: accuracy === 100 ? "highlight" : "default",
								size: "lg"
							}),
							/* @__PURE__ */ jsx(StatCard, {
								label: t$1.typing.time,
								value: formatTime(elapsedSeconds),
								size: "lg"
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-5",
						children: /* @__PURE__ */ jsx(StarRating, {
							accuracy,
							wpm,
							label: t$1.completion.starsEarned
						})
					}),
					weakKeys.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "mt-5 rounded-xl border border-[var(--color-incorrect)]/20 bg-[var(--color-incorrect)]/5 px-4 py-3 text-left",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-center text-xs font-medium text-[var(--color-text-muted)]",
								children: t$1.completion.weakKeys
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-2.5 flex justify-center gap-2",
								children: weakKeys.map((key) => /* @__PURE__ */ jsx("kbd", {
									className: "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--color-incorrect)]/25 bg-[var(--color-surface)] font-mono text-base font-semibold text-[var(--color-incorrect)]",
									children: key === " " ? "␣" : key
								}, key))
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-center text-[10px] text-[var(--color-text-muted)]",
								children: t$1.completion.weakKeysHint
							})
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						ref: retryButtonRef,
						type: "button",
						onClick: onRetry,
						className: "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--color-accent)]/20 transition hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface-elevated)]",
						children: [t$1.completion.tryAgain, /* @__PURE__ */ jsx("kbd", {
							className: "rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs font-normal text-white/80",
							children: "Enter ↵"
						})]
					})
				]
			})]
		})]
	});
}
//#endregion
//#region src/components/typing/ModeToggle.tsx
function ModeToggle() {
	const { t, settings, setPracticeMode } = useApp();
	return /* @__PURE__ */ jsx("div", {
		className: "flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1",
		children: ["practice", "test"].map((mode) => /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setPracticeMode(mode),
			className: ["flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition", settings.practiceMode === mode ? "bg-[var(--color-accent)] text-white shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"].join(" "),
			children: mode === "practice" ? t.lesson.practice : t.lesson.test
		}, mode))
	});
}
function ModeDescription() {
	const { t, settings } = useApp();
	return /* @__PURE__ */ jsx("p", {
		className: "mt-2 text-sm text-[var(--color-text-muted)]",
		children: settings.practiceMode === "practice" ? t.lesson.practiceDesc : t.lesson.testDesc
	});
}
//#endregion
//#region src/components/typing/PauseOverlay.tsx
function PauseOverlay({ onResume }) {
	const { t } = useApp();
	return /* @__PURE__ */ jsx("div", {
		className: "absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--color-surface)]/80 backdrop-blur-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/15 ring-2 ring-[var(--color-accent)]/25",
					children: /* @__PURE__ */ jsxs("svg", {
						xmlns: "http://www.w3.org/2000/svg",
						width: "28",
						height: "28",
						viewBox: "0 0 24 24",
						fill: "var(--color-accent)",
						children: [/* @__PURE__ */ jsx("rect", {
							x: "6",
							y: "4",
							width: "4",
							height: "16",
							rx: "1"
						}), /* @__PURE__ */ jsx("rect", {
							x: "14",
							y: "4",
							width: "4",
							height: "16",
							rx: "1"
						})]
					})
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "text-xl font-bold text-[var(--color-text)]",
					children: t.lesson.paused
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1.5 text-sm text-[var(--color-text-muted)]",
					children: t.lesson.pauseHint
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onResume,
					className: "mt-6 rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]",
					children: t.lesson.resume
				})
			]
		})
	});
}
//#endregion
//#region src/components/typing/TypedChar.tsx
function TypedChar({ char, status, isCurrent, active }) {
	if (char === " ") return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		className: [
			"inline-block align-baseline",
			"min-w-[0.55em] h-[1em]",
			spaceClass(status, isCurrent, active)
		].join(" ")
	});
	let className = "text-[var(--color-text-muted)]/60";
	if (status === "correct") className = "text-[var(--color-correct)]";
	if (status === "incorrect") className = "text-[var(--color-incorrect)] underline decoration-wavy decoration-[var(--color-incorrect)]/50";
	if (isCurrent && active) className = "relative text-[var(--color-key-target)] after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--color-key-target)] after:content-[\"\"]";
	return /* @__PURE__ */ jsx("span", {
		className,
		children: char
	});
}
function spaceClass(status, isCurrent, active) {
	if (isCurrent && active) return "border-b-2 border-[var(--color-key-target)] caret-blink motion-reduce:animate-none";
	if (status === "correct") return "border-b border-[var(--color-correct)]/40";
	if (status === "incorrect") return "border-b-2 border-dashed border-[var(--color-incorrect)]/70";
	return "border-b border-[var(--color-border)]/30";
}
//#endregion
//#region src/components/typing/TypingTest.tsx
function TypingTest({ lessonId, lesson, customText, onProgressChange }) {
	const { t, settings } = useApp();
	const lessonTitle = getLessonTitle(t, lesson.titleKey);
	const { targetText, input, statuses, started, finished, paused, stats, progress, timeRemaining, targetKey, activeKey, isNewRecord, wpmDelta, sessionWeakKeys, isTestMode, containerRef, retryButtonRef, reset, handleKeyDown, togglePause } = useTypingSession({
		lessonId,
		lessonTitle,
		lesson,
		mode: settings.practiceMode,
		sound: settings.sound,
		locale: settings.locale,
		customText
	});
	const [keyboardOpen, setKeyboardOpen] = useState(true);
	useEffect(() => {
		const mq = window.matchMedia("(max-width: 640px)");
		setKeyboardOpen(!mq.matches);
		const handler = (e) => setKeyboardOpen(!e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);
	useEffect(() => {
		if (!onProgressChange || !started || paused) return;
		onProgressChange(stats.wpm, progress, finished);
		if (finished) return;
		const interval = window.setInterval(() => {
			onProgressChange(stats.wpm, progress);
		}, 500);
		return () => window.clearInterval(interval);
	}, [
		onProgressChange,
		started,
		paused,
		finished,
		stats.wpm,
		progress
	]);
	const showKeyboard = !settings.blindMode && keyboardOpen;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(ModeToggle, {}),
			/* @__PURE__ */ jsx(ModeDescription, {}),
			/* @__PURE__ */ jsx(StatsBar, {
				wpm: stats.wpm,
				accuracy: stats.accuracy,
				elapsedSeconds: stats.elapsedSeconds,
				progress,
				finished,
				started,
				isTestMode,
				timeRemaining,
				paused
			}),
			/* @__PURE__ */ jsxs("div", {
				ref: containerRef,
				tabIndex: 0,
				onKeyDown: handleKeyDown,
				onClick: () => !finished && !paused && containerRef.current?.focus(),
				role: "textbox",
				"aria-label": lessonTitle,
				"aria-readonly": "true",
				className: ["relative min-h-[160px] cursor-text overflow-hidden rounded-2xl border-2 bg-[var(--color-surface-elevated)] p-6 outline-none transition-all duration-300 sm:min-h-[180px] sm:p-8", finished ? "border-[var(--color-correct)]/30" : paused ? "border-[var(--color-key-target)]/40" : "border-[var(--color-border)] focus:border-[var(--color-accent)]/50 focus:ring-4 focus:ring-[var(--color-accent)]/10"].join(" "),
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "pointer-events-none absolute inset-0 opacity-50",
						style: {
							backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
							backgroundSize: "24px 24px",
							maskImage: "linear-gradient(to bottom, black, transparent)"
						},
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "relative font-mono text-xl leading-[2] tracking-wide break-words sm:text-2xl sm:leading-[2.2]",
						"aria-live": "off",
						children: [targetText.split("").map((char, i) => /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(TypedChar, {
							char,
							status: statuses[i],
							isCurrent: i === input.length,
							active: !finished && !paused
						}) }, i)), !finished && !paused && input.length === targetText.length && /* @__PURE__ */ jsx("span", { className: "caret-blink ml-px inline-block h-[1.1em] w-0.5 translate-y-0.5 bg-[var(--color-key-target)] align-middle motion-reduce:animate-none" })]
					}),
					!started && !finished && /* @__PURE__ */ jsxs("p", {
						className: "relative mt-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]",
						children: [/* @__PURE__ */ jsx("span", { className: "inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse motion-reduce:animate-none" }), t.lesson.startTyping]
					}),
					paused && !finished && /* @__PURE__ */ jsx(PauseOverlay, { onResume: togglePause })
				]
			}),
			finished && /* @__PURE__ */ jsx(CompletionPanel, {
				wpm: stats.wpm,
				accuracy: stats.accuracy,
				elapsedSeconds: stats.elapsedSeconds,
				isNewRecord,
				wpmDelta,
				weakKeys: sessionWeakKeys,
				onRetry: reset,
				retryButtonRef
			}),
			!settings.blindMode && /* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-center sm:hidden",
				children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setKeyboardOpen((v) => !v),
					className: "flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
					children: [/* @__PURE__ */ jsxs("svg", {
						xmlns: "http://www.w3.org/2000/svg",
						width: "16",
						height: "16",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						children: [/* @__PURE__ */ jsx("rect", {
							width: "20",
							height: "16",
							x: "2",
							y: "4",
							rx: "2"
						}), /* @__PURE__ */ jsx("path", { d: "M6 8h.001M10 8h.001M14 8h.001M18 8h.001" })]
					}), keyboardOpen ? t.typing.hideKeyboard : t.typing.showKeyboard]
				})
			}),
			showKeyboard && /* @__PURE__ */ jsx("div", {
				className: ["transition-all duration-500", finished ? "pointer-events-none opacity-40 grayscale-[30%]" : "opacity-100"].join(" "),
				children: /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsx(Keyboard, {
						pressedKey: activeKey,
						targetKey
					})
				})
			}),
			settings.blindMode && !finished && /* @__PURE__ */ jsxs("p", {
				className: "text-center text-xs text-[var(--color-text-muted)]",
				children: ["👁 ", t.settings.blindDesc]
			}),
			isTestMode && started && !finished && /* @__PURE__ */ jsx("p", {
				className: "text-center text-xs text-[var(--color-text-muted)]",
				children: t.lesson.pauseHint
			})
		]
	});
}
//#endregion
//#region src/components/multiplayer/MultiplayerRaceTrack.tsx
function RaceRow({ name, avatarUrl, initials, avatarSource, wpm, percentage }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3",
		children: [
			/* @__PURE__ */ jsx(UserAvatar, {
				avatarUrl,
				initials,
				avatarSource,
				size: 34
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-1 flex items-center justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ jsx("span", {
						className: "truncate font-medium text-[var(--color-text)]",
						children: name
					}), /* @__PURE__ */ jsxs("span", {
						className: "shrink-0 font-mono text-xs text-[var(--color-text-muted)]",
						children: [Math.round(wpm), " WPM"]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "h-3 overflow-hidden rounded-full bg-[var(--color-surface)]",
					children: /* @__PURE__ */ jsx("div", {
						className: "h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300 ease-out",
						style: { width: `${percentage}%` }
					})
				})]
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "w-10 text-right font-mono text-xs text-[var(--color-text-muted)]",
				children: [Math.round(percentage), "%"]
			})
		]
	});
}
function MultiplayerRaceTrack({ localProgress, opponents, title, emptyLabel }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5",
		children: [/* @__PURE__ */ jsx("h2", {
			className: "mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]",
			children: title
		}), /* @__PURE__ */ jsxs("div", {
			className: "space-y-4",
			children: [localProgress.player ? /* @__PURE__ */ jsx(RaceRow, {
				name: localProgress.player.name,
				avatarUrl: localProgress.player.avatarUrl,
				initials: localProgress.player.initials,
				avatarSource: localProgress.player.avatarSource,
				wpm: localProgress.wpm,
				percentage: localProgress.percentage
			}) : null, opponents.length > 0 ? opponents.map((opponent) => /* @__PURE__ */ jsx(RaceRow, {
				name: opponent.name,
				avatarUrl: opponent.avatarUrl,
				initials: opponent.initials,
				avatarSource: opponent.avatarSource,
				wpm: opponent.wpm,
				percentage: opponent.percentage
			}, opponent.userId)) : /* @__PURE__ */ jsx("p", {
				className: "text-sm text-[var(--color-text-muted)]",
				children: emptyLabel
			})]
		})]
	});
}
//#endregion
//#region src/components/multiplayer/MultiplayerRacePanel.tsx
function MultiplayerRacePanel({ channel, currentUserId, players }) {
	const { t } = useApp();
	const [localProgress, setLocalProgress] = useState({
		wpm: 0,
		percentage: 0
	});
	const lesson = LESSONS.find((item) => item.id === "all-rows") ?? LESSONS[0];
	const { opponents, broadcastProgress } = useMultiplayerRace({
		channel,
		currentUserId,
		players,
		enabled: Boolean(channel && currentUserId)
	});
	const localPlayer = useMemo(() => players.find((player) => player.userId === currentUserId) ?? null, [players, currentUserId]);
	const handleProgressChange = useCallback((wpm, percentage, force = false) => {
		setLocalProgress({
			wpm,
			percentage
		});
		broadcastProgress(wpm, percentage, force);
	}, [broadcastProgress]);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx(MultiplayerRaceTrack, {
			localProgress: {
				player: localPlayer,
				wpm: localProgress.wpm,
				percentage: localProgress.percentage
			},
			opponents,
			title: t.multiplayer.raceProgress,
			emptyLabel: t.multiplayer.waitingForOpponentProgress
		}), /* @__PURE__ */ jsx(TypingTest, {
			lessonId: lesson.id,
			lesson,
			customText: lesson.texts[0],
			onProgressChange: handleProgressChange
		})]
	});
}
//#endregion
//#region src/components/multiplayer/LobbyView.tsx
function LobbyView({ roomId }) {
	const { t } = useApp();
	const { user, loading: authLoading, isConfigured } = useAuth();
	const [matchStarting, setMatchStarting] = useState(false);
	const { players, status, error, isReady, isConnected, toggleReadyStatus, leaveLobby, currentUserId, channel } = useMultiplayerLobby({
		roomId,
		onAllReady: useCallback(() => {
			setMatchStarting(true);
		}, []),
		minPlayers: 2
	});
	const handleLeave = async () => {
		await leaveLobby();
		window.location.href = "/multiplayer";
	};
	if (!isConfigured) return /* @__PURE__ */ jsx(Card, {
		title: t.multiplayer.title,
		padding: "lg",
		children: /* @__PURE__ */ jsx("p", {
			className: "text-sm text-[var(--color-text-muted)]",
			children: t.multiplayer.notConfigured
		})
	});
	if (authLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-[40vh] items-center justify-center",
		children: /* @__PURE__ */ jsx("div", { className: "h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" })
	});
	if (!user) return /* @__PURE__ */ jsxs(Card, {
		title: t.multiplayer.title,
		padding: "lg",
		children: [/* @__PURE__ */ jsx("p", {
			className: "mb-4 text-sm text-[var(--color-text-muted)]",
			children: t.multiplayer.signInRequired
		}), /* @__PURE__ */ jsx("a", {
			href: `/login?next=/multiplayer/${roomId}`,
			className: "inline-flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/20 transition hover:bg-[var(--color-accent-hover)]",
			children: t.auth.signIn
		})]
	});
	const statusLabel = status === "connecting" ? t.multiplayer.connecting : status === "connected" ? t.multiplayer.connected : status === "error" ? t.multiplayer.connectionError : t.multiplayer.waiting;
	const readyCount = players.filter((player) => player.isReady).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs(Card, {
				padding: "lg",
				bleed: true,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-start justify-between gap-4 px-6 pt-6",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm font-medium text-[var(--color-text-muted)]",
							children: t.multiplayer.roomCode
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 font-mono text-3xl font-bold tracking-widest text-[var(--color-text)]",
							children: roomId
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "text-right",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-sm text-[var(--color-text-muted)]",
								children: statusLabel
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm font-medium text-[var(--color-text)]",
								children: t.multiplayer.playersReady.replace("{ready}", String(readyCount)).replace("{total}", String(players.length))
							})]
						})]
					}),
					error ? /* @__PURE__ */ jsx("p", {
						className: "mx-6 mt-4 rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-sm text-[var(--color-incorrect)]",
						children: error === "supabase_not_configured" ? t.multiplayer.notConfigured : error === "channel_error" ? t.multiplayer.connectionError : error === "timed_out" ? t.multiplayer.timedOut : error
					}) : null,
					matchStarting ? /* @__PURE__ */ jsx("div", {
						className: "mx-6 mt-4 rounded-lg border border-[var(--color-correct)]/30 bg-[var(--color-correct)]/10 px-4 py-3 text-sm font-medium text-[var(--color-correct)]",
						children: t.multiplayer.allReady
					}) : null,
					/* @__PURE__ */ jsx("div", {
						className: "mt-6",
						children: /* @__PURE__ */ jsx(LobbyPlayerList, {
							players,
							currentUserId,
							readyLabel: t.multiplayer.ready,
							waitingLabel: t.multiplayer.notReady,
							youLabel: t.multiplayer.you
						})
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ jsx(Button, {
					variant: isReady ? "secondary" : "success",
					onClick: () => void toggleReadyStatus(),
					disabled: !isConnected || matchStarting,
					children: isReady ? t.multiplayer.unready : t.multiplayer.markReady
				}), /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					onClick: () => void handleLeave(),
					children: t.multiplayer.leaveRoom
				})]
			}),
			matchStarting ? /* @__PURE__ */ jsx(MultiplayerRacePanel, {
				channel,
				currentUserId,
				players
			}) : null
		]
	});
}
//#endregion
//#region src/components/pages/MultiplayerLobbyPage.tsx
function LobbyContent({ roomId }) {
	const { t } = useApp();
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(BackLink, {
			href: "/multiplayer",
			label: t.multiplayer.backToLobby
		}),
		/* @__PURE__ */ jsxs("header", {
			className: "mb-10",
			children: [/* @__PURE__ */ jsx("h1", {
				className: "text-3xl font-bold text-[var(--color-text)] sm:text-4xl",
				children: t.multiplayer.lobbyTitle
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2 text-lg text-[var(--color-text-muted)]",
				children: t.multiplayer.lobbySubtitle
			})]
		}),
		/* @__PURE__ */ jsx(LobbyView, { roomId })
	] });
}
function MultiplayerLobbyPage({ roomId }) {
	return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx(LobbyContent, { roomId }) });
}
//#endregion
//#region src/pages/multiplayer/[code].astro
var _code__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Code,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Code = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Code;
	const { code } = Astro.params;
	const roomId = (code ?? "").toUpperCase();
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Typing Dvorak — Lobby" }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "MultiplayerLobbyPage", MultiplayerLobbyPage, {
		"client:load": true,
		"roomId": roomId,
		"client:component-hydration": "load",
		"client:component-path": "/Users/oliverolvera/Documents/GitHub - Personal/Typing-Dvorak/src/components/pages/MultiplayerLobbyPage",
		"client:component-export": "default"
	})}` })}`;
}, "/Users/oliverolvera/Documents/GitHub - Personal/Typing-Dvorak/src/pages/multiplayer/[code].astro", void 0);
var $$file = "/Users/oliverolvera/Documents/GitHub - Personal/Typing-Dvorak/src/pages/multiplayer/[code].astro";
var $$url = "/multiplayer/[code]";
//#endregion
//#region \0virtual:astro:page:src/pages/multiplayer/[code]@_@astro
var page = () => _code__exports;
//#endregion
export { page };
