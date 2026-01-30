import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0C10] text-white p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-md w-full p-8 bg-zinc-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-orange-500/10 border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
          <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Zugriff verweigert
        </h1>

        <p className="text-zinc-400 mb-8 leading-relaxed">
          Du bist für diese Anwendung nicht registriert. Bitte wende dich an den Administrator, um Zugriff anzufordern.
        </p>

        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-sm text-zinc-400 text-left">
          <p className="font-bold text-zinc-200 mb-2">Mögliche Lösungen:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              Prüfe, ob du mit dem richtigen Account eingeloggt bist
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              Kontaktiere den Support
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              Versuche dich neu einzuloggen
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
