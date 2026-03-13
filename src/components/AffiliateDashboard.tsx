import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/errorHandlers';

interface AffiliateDashboardProps {
  userProfile: UserProfile;
  onClose: () => void;
  onSignOut: () => void;
  speak: (text: string) => void;
  ui: any;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ userProfile, onClose, onSignOut, speak, ui }) => {
  const [amazonIdBR, setAmazonIdBR] = useState(userProfile.amazonIdBR || '');
  const [amazonIdUS, setAmazonIdUS] = useState(userProfile.amazonIdUS || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Speak intro when dashboard opens
    speak(ui.dashboardIntro);
    
    // If locked, explain why
    if (userProfile.subscriptionLevel === 'free') {
      setTimeout(() => speak(ui.lockedExplanation), 4000);
    } else if (userProfile.subscriptionLevel === 'elite') {
      setTimeout(() => speak(ui.eliteIntro), 4000);
    } else {
      setTimeout(() => speak(ui.unlockedExplanation), 4000);
    }
  }, []);

  const handleSave = async () => {
    if (userProfile.subscriptionLevel === 'free') {
      speak(ui.lockedExplanation);
      return;
    }
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        amazonIdBR,
        amazonIdUS
      });
      speak(ui.saveSuccess);
    } catch (error) {
      console.error('Error saving profile:', error);
      speak(ui.saveError);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isLocked = userProfile.subscriptionLevel === 'free';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#150a1d] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-transparent">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Painel do Afiliado</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{userProfile.email}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Subscription Status */}
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Plano Atual</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    userProfile.subscriptionLevel === 'elite' ? 'bg-amber-500 text-slate-950' : 
                    userProfile.subscriptionLevel === 'standard' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {userProfile.subscriptionLevel === 'free' ? 'Aguardando Assinatura' : userProfile.subscriptionLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status da IA</span>
                <div className={`text-xs font-black uppercase tracking-widest mt-1 ${isLocked ? 'text-amber-500/50' : 'text-emerald-400'}`}>
                  {isLocked ? 'Modo Demonstração' : 'Operação Total'}
                </div>
              </div>
            </div>

            {isLocked && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <a 
                  href="https://buy.stripe.com/aFa00c3ny7lS5tJ4gS08g00" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => speak(ui.paymentRedirect)}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all group"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Plano Standard</div>
                  <div className="text-lg font-black">$20<span className="text-xs opacity-50">/mês</span></div>
                  <div className="text-[9px] font-bold uppercase mt-2 group-hover:translate-x-1 transition-transform">Liberar Meus IDs →</div>
                </a>
                <a 
                  href="https://buy.stripe.com/9B65kw4rCgWsf4jaFg08g01" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => speak(ui.paymentRedirect)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-4 rounded-2xl transition-all group"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Plano Elite</div>
                  <div className="text-lg font-black">$50<span className="text-xs opacity-50">/mês</span></div>
                  <div className="text-[9px] font-bold uppercase mt-2 group-hover:translate-x-1 transition-transform">IDs + Treinamento →</div>
                </a>
              </div>
            )}
          </div>

          {/* Amazon IDs */}
          <div className={`space-y-6 transition-all ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500/60">Configurações de Afiliado</h3>
              {isLocked && (
                <div className="flex items-center gap-2 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                  <i className="fas fa-lock"></i>
                  Bloqueado
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Amazon ID Brasil</label>
                <input 
                  type="text" 
                  value={amazonIdBR}
                  onChange={(e) => setAmazonIdBR(e.target.value)}
                  disabled={isLocked}
                  placeholder={isLocked ? "Assine para liberar" : "ex: seuid-20"}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Amazon ID EUA</label>
                <input 
                  type="text" 
                  value={amazonIdUS}
                  onChange={(e) => setAmazonIdUS(e.target.value)}
                  disabled={isLocked}
                  placeholder={isLocked ? "Assine para liberar" : "ex: yourid-20"}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 outline-none transition-all disabled:cursor-not-allowed"
                />
              </div>
            </div>
            {isLocked && (
              <p className="text-[10px] text-amber-500/60 font-medium italic text-center">
                * Após a confirmação do pagamento e o cadastro de seus IDs, o Mordomo começará a trabalhar oficialmente para o senhor.
              </p>
            )}
          </div>

          {/* Elite Content */}
          {userProfile.subscriptionLevel === 'elite' ? (
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/20 rounded-3xl p-8 border border-amber-500/30">
              <h3 className="text-amber-500 font-black uppercase tracking-[0.3em] text-xs mb-4 flex items-center gap-3">
                <i className="fas fa-graduation-cap"></i>
                Conteúdo Elite: Tráfego Pago
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Acesse suas aulas exclusivas sobre como escalar suas vendas usando anúncios patrocinados no Facebook, Instagram e TikTok.
              </p>
              <button 
                onClick={() => speak(ui.trainingAccess)}
                className="bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all"
              >
                Acessar Treinamento
              </button>
            </div>
          ) : userProfile.subscriptionLevel === 'standard' && (
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Quer aprender a fazer anúncios?</p>
              <a 
                href="https://buy.stripe.com/9B65kw4rCgWsf4jaFg08g01" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => speak(ui.paymentRedirect)}
                className="inline-block text-amber-500 border border-amber-500/30 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 transition-all"
              >
                Upgrade para Elite ($50)
              </a>
            </div>
          )}
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <button 
            onClick={onSignOut}
            className="text-gray-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Sair da Conta
          </button>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white text-slate-950 font-black px-10 py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
