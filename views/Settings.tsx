import React from 'react';
import { User, Bell, Shield, Moon, Sun, ChevronRight, Check, X, Lock } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import Card from '../components/ui/Card';
import { auth, db, doc, getDoc, updateDoc, sendPasswordResetEmail } from '../firebase';

const Settings: React.FC = () => {
   const { theme, toggleTheme } = useTheme();
   const [userProfile, setUserProfile] = React.useState<{
      name: string;
      email: string;
      sacraments?: string[];
      sacramentDates?: Record<string, string>;
      address?: {
         cep: string;
         street: string;
         number: string;
         complement: string;
         neighborhood: string;
         city: string;
         state: string;
      };
      holyOrdersDetails?: {
         level: 'Diácono' | 'Padre' | 'Bispo' | '';
         idCard: string;
      };
   } | null>(null);
   const [loading, setLoading] = React.useState(true);
   const [isEditingName, setIsEditingName] = React.useState(false);
   const [newName, setNewName] = React.useState('');
   const [saving, setSaving] = React.useState(false);

   const sacramentsInfo: Record<string, { label: string; placeholder: string }> = {
      'Batismo': { label: 'Batismo', placeholder: 'Fui batizado em' },
      'Confirmação (Crisma)': { label: 'Crisma', placeholder: 'Confirmei meu batismo no dia' },
      'Penitência (Confissão)': { label: 'Penitência', placeholder: 'A ultima vez que confessei meus pecado foi em' },
      'Unção dos Enfermos': { label: 'Unção dos Enfermos', placeholder: 'Recebi a unçao dos enfermos em' },
      'Ordem': { label: 'Ordem', placeholder: 'Fui ordenado no dia' },
      'Matrimônio': { label: 'Matrimônio', placeholder: 'Meu matrimônio aconteceu no dia' },
      'Eucaristia': { label: 'Eucaristia', placeholder: 'Recebi a primeira eucaristia em' }
   };

   const sacramentsList = Object.keys(sacramentsInfo);

   React.useEffect(() => {
      const fetchProfile = async () => {
         try {
            if (auth.currentUser) {
               const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
               if (userDoc.exists()) {
                  const data = userDoc.data();
                  setUserProfile(data);
                  setNewName(data.name || '');
               }
            }
         } catch (err) {
            console.error("Error fetching settings profile:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchProfile();
   }, []);

   const handleUpdateName = async () => {
      if (!newName.trim()) return;
      setSaving(true);
      try {
         if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { name: newName });
            setUserProfile(prev => prev ? { ...prev, name: newName } : null);
            setIsEditingName(false);
         }
      } catch (err) {
         console.error("Error updating name:", err);
         alert("Erro ao atualizar nome.");
      } finally {
         setSaving(false);
      }
   };

   const handleToggleSacrament = async (sacrament: string) => {
      let currentSacraments = userProfile?.sacraments || [];
      const isRemoving = currentSacraments.includes(sacrament);

      let updatedSacraments = isRemoving
         ? currentSacraments.filter(s => s !== sacrament)
         : [...currentSacraments, sacrament];

      // Exclusivity Rule: Ordem and Matrimônio
      if (!isRemoving) {
         if (sacrament === 'Ordem') {
            updatedSacraments = updatedSacraments.filter(s => s !== 'Matrimônio');
         } else if (sacrament === 'Matrimônio') {
            updatedSacraments = updatedSacraments.filter(s => s !== 'Ordem');
         }
      }

      try {
         if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { sacraments: updatedSacraments });
            setUserProfile(prev => prev ? { ...prev, sacraments: updatedSacraments } : null);
         }
      } catch (err) {
         console.error("Error updating sacraments:", err);
      }
   };

   const handleUpdateSacramentDate = async (sacrament: string, date: string) => {
      const updatedDates = { ...(userProfile?.sacramentDates || {}), [sacrament]: date };

      try {
         if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { sacramentDates: updatedDates });
            setUserProfile(prev => prev ? { ...prev, sacramentDates: updatedDates } : null);
         }
      } catch (err) {
         console.error("Error updating sacrament date:", err);
      }
   };

   const handleUpdateAddress = async (field: string, value: string) => {
      const updatedAddress = { ...(userProfile?.address || { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }), [field]: value };

      try {
         if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { address: updatedAddress });
            setUserProfile(prev => prev ? { ...prev, address: updatedAddress } : null);
         }
      } catch (err) {
         console.error("Error updating address:", err);
      }
   };

   const handleUpdateHolyOrders = async (field: string, value: string) => {
      const updatedDetails = { ...(userProfile?.holyOrdersDetails || { level: '', idCard: '' }), [field]: value };

      try {
         if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { holyOrdersDetails: updatedDetails });
            setUserProfile(prev => prev ? { ...prev, holyOrdersDetails: updatedDetails } : null);
         }
      } catch (err) {
         console.error("Error updating holy orders:", err);
      }
   };

   const handleResetPassword = async () => {
      try {
         if (userProfile?.email) {
            await sendPasswordResetEmail(auth, userProfile.email);
            alert("E-mail de redefinição de senha enviado!");
         }
      } catch (err) {
         console.error("Error sending reset email:", err);
         alert("Erro ao enviar e-mail de redefinição.");
      }
   };

   const handleSignOut = async () => {
      await auth.signOut();
      window.location.reload();
   };

   return (
      <div className="max-w-2xl mx-auto py-8 px-4">
         <h1 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2 text-center">Configurações</h1>
         <p className="text-center text-stone-500 dark:text-stone-400 mb-8 text-sm px-4">Gerencie sua caminhada espiritual e preferências.</p>

         {/* Profile Card */}
         <Card className="p-5 md:p-6 mb-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 border-4 border-gold-50 dark:border-gold-900/30 flex items-center justify-center text-stone-400 shrink-0">
               <User size={32} />
            </div>
            <div className="flex-1 w-full">
               {isEditingName ? (
                  <div className="flex items-center gap-2">
                     <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400 w-full"
                        placeholder="Nome completo"
                        disabled={saving}
                        autoFocus
                     />
                     <button
                        onClick={handleUpdateName}
                        disabled={saving}
                        className="p-2 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition disabled:opacity-50"
                     >
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check size={18} />}
                     </button>
                     <button
                        onClick={() => { setIsEditingName(false); setNewName(userProfile?.name || ''); }}
                        disabled={saving}
                        className="p-2 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                     >
                        <X size={18} />
                     </button>
                  </div>
               ) : (
                  <>
                     <h2 className="font-bold text-xl text-stone-800 dark:text-stone-100">
                        {loading ? "Carregando..." : (userProfile?.name || "Fiel")}
                     </h2>
                     <p className="text-stone-400 dark:text-stone-500 text-sm">
                        {loading ? "..." : (userProfile?.email || "...")}
                     </p>
                  </>
               )}
            </div>
            {!loading && !isEditingName && (
               <button
                  onClick={() => setIsEditingName(true)}
                  className="text-gold-600 dark:text-gold-500 text-sm font-bold hover:underline shrink-0"
               >
                  Editar
               </button>
            )}
         </Card>

         <div className="space-y-6">


            {/* Section: Sacraments */}
            <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
               <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                  <Shield size={18} className="text-gold-500" /> Sacramentos
               </div>
               <div className="p-4 md:p-6 space-y-3">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 italic">Selecione os sacramentos que você já recebeu.</p>
                  {sacramentsList.map(sacrament => {
                     const isReceived = userProfile?.sacraments?.includes(sacrament);
                     const info = sacramentsInfo[sacrament];
                     return (
                        <div
                           key={sacrament}
                           onClick={() => handleToggleSacrament(sacrament)}
                           className={`flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer ${isReceived
                              ? 'bg-gold-50/50 dark:bg-gold-900/10 border-gold-200 dark:border-gold-800'
                              : 'border-stone-100 dark:border-stone-800 hover:border-gold-100 dark:hover:border-stone-700'
                              }`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isReceived ? 'bg-gold-500 border-gold-500 text-white' : 'border-stone-300 dark:border-stone-700'}`}>
                                 {isReceived && <Check size={14} strokeWidth={4} />}
                              </div>
                              <span className={`text-sm font-medium ${isReceived ? 'text-stone-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>
                                 {info.label}
                              </span>
                           </div>

                           {isReceived && (
                              <div
                                 className="mt-1 pl-8 space-y-4 animate-in fadeIn duration-300 w-full"
                                 onClick={(e) => e.stopPropagation()}
                              >
                                 <div className="h-px bg-gold-200/30 dark:bg-gold-900/40 w-full my-2" />

                                 <div>
                                    <p className="text-[10px] md:text-xs text-stone-500 dark:text-stone-400 italic mb-1">
                                       {info.placeholder}:
                                    </p>
                                    <input
                                       type="date"
                                       value={userProfile?.sacramentDates?.[sacrament] || ''}
                                       onClick={(e) => e.stopPropagation()}
                                       onChange={(e) => {
                                          handleUpdateSacramentDate(sacrament, e.target.value);
                                       }}
                                       className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                    />
                                 </div>

                                 {sacrament === 'Ordem' && (
                                    <div className="space-y-4 pt-2">
                                       <div>
                                          <p className="text-[10px] md:text-xs text-stone-500 dark:text-stone-400 italic mb-1">
                                             Nível de Ordenação:
                                          </p>
                                          <select
                                             value={userProfile?.holyOrdersDetails?.level || ''}
                                             onChange={(e) => handleUpdateHolyOrders('level', e.target.value)}
                                             className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                          >
                                             <option value="">Selecione...</option>
                                             <option value="Diácono">Diácono</option>
                                             <option value="Padre">Padre</option>
                                             <option value="Bispo">Bispo</option>
                                          </select>
                                       </div>
                                       <div>
                                          <p className="text-[10px] md:text-xs text-stone-500 dark:text-stone-400 italic mb-1">
                                             Número da Carteira Eclesiástica:
                                          </p>
                                          <input
                                             type="text"
                                             value={userProfile?.holyOrdersDetails?.idCard || ''}
                                             onChange={(e) => handleUpdateHolyOrders('idCard', e.target.value)}
                                             placeholder="Ex: 123456"
                                             className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                          />
                                       </div>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </section>

            {/* Section: Address */}
            <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
               <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                  <User size={18} className="text-gold-500" /> Endereço Residencial
               </div>
               <div className="p-4 md:p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 block">CEP</label>
                        <input
                           type="text"
                           value={userProfile?.address?.cep || ''}
                           onChange={(e) => handleUpdateAddress('cep', e.target.value)}
                           placeholder="00000-000"
                           className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     <div className="col-span-3">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 block">Logradouro</label>
                        <input
                           type="text"
                           value={userProfile?.address?.street || ''}
                           onChange={(e) => handleUpdateAddress('street', e.target.value)}
                           placeholder="Rua, Avenida..."
                           className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 block">Nº</label>
                        <input
                           type="text"
                           value={userProfile?.address?.number || ''}
                           onChange={(e) => handleUpdateAddress('number', e.target.value)}
                           placeholder="123"
                           className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 block">Bairro</label>
                        <input
                           type="text"
                           value={userProfile?.address?.neighborhood || ''}
                           onChange={(e) => handleUpdateAddress('neighborhood', e.target.value)}
                           className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 block">Complemento</label>
                        <input
                           type="text"
                           value={userProfile?.address?.complement || ''}
                           onChange={(e) => handleUpdateAddress('complement', e.target.value)}
                           placeholder="Apto, Bloco..."
                           className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     <div className="col-span-3">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 block">Cidade</label>
                        <input
                           type="text"
                           value={userProfile?.address?.city || ''}
                           onChange={(e) => handleUpdateAddress('city', e.target.value)}
                           className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                     </div>
                     <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 block">UF</label>
                        <input
                           type="text"
                           maxLength={2}
                           value={userProfile?.address?.state || ''}
                           onChange={(e) => handleUpdateAddress('state', e.target.value.toUpperCase())}
                           placeholder="SP"
                           className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-gold-400 text-center uppercase"
                        />
                     </div>
                  </div>
               </div>
            </section>

            {/* Section: Appearance */}
            <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
               <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Moon size={18} className="text-gold-500" /> Aparência
               </div>
               <div className="p-4 md:p-6 grid grid-cols-2 gap-3 md:gap-4">
                  <div
                     onClick={() => theme === 'dark' && toggleTheme()}
                     className={`border-2 rounded-xl p-3 md:p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${theme === 'light'
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/10'
                        : 'border-stone-100 dark:border-stone-800 opacity-50 grayscale hover:grayscale-0'
                        }`}
                  >
                     <Sun className={theme === 'light' ? 'text-gold-600' : 'text-stone-400'} size={20} />
                     <span className={`font-bold text-xs md:text-sm ${theme === 'light' ? 'text-stone-800' : 'text-stone-500'}`}>Luz de Cristo</span>
                  </div>
                  <div
                     onClick={() => theme === 'light' && toggleTheme()}
                     className={`border-2 rounded-xl p-3 md:p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${theme === 'dark'
                        ? 'border-gold-500 bg-gold-900/10'
                        : 'border-stone-100 opacity-50 grayscale hover:grayscale-0'
                        }`}
                  >
                     <Moon className={theme === 'dark' ? 'text-gold-500' : 'text-stone-400'} size={20} />
                     <span className={`font-bold text-xs md:text-sm ${theme === 'dark' ? 'text-white' : 'text-stone-500'}`}>Vigília</span>
                  </div>
               </div>
            </section>

            {/* Section: Account */}
            <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
               <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Shield size={18} className="text-gold-500" /> Conta e Privacidade
               </div>
               <div className="divide-y divide-stone-50 dark:divide-stone-800">
                  <button
                     onClick={handleResetPassword}
                     className="w-full p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition group"
                  >
                     <div className="flex items-center gap-3">
                        <Lock size={16} className="text-stone-400 group-hover:text-gold-500" />
                        <span className="text-stone-700 dark:text-stone-300">Redefinir Senha (E-mail)</span>
                     </div>
                     <ChevronRight size={16} className="text-stone-400" />
                  </button>
                  <button onClick={handleSignOut} className="w-full p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition text-red-500 font-bold text-left">
                     <span>Sair da Conta</span>
                  </button>
               </div>
            </section>
         </div>
      </div>
   );
};

export default Settings;