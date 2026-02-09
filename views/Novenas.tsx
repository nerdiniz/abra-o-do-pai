import React from 'react';
import { Novena } from '../types';
import { Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';

interface NovenasProps {
   novenas: Novena[];
}

const Novenas: React.FC<NovenasProps> = ({ novenas }) => {
   return (
      <div className="space-y-8 pb-12">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <h1 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100">Biblioteca de Novenas</h1>
               <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">Explore e inicie novas jornadas espirituais.</p>
            </div>
            <Button onClick={() => { }} className="gap-2 shadow-gold-200 dark:shadow-none">
               <Plus size={20} /> Criar/Adicionar
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active Novenas First */}
            {novenas.length > 0 ? novenas.map(novena => (
               <Card key={novena.id} className="group hover:shadow-xl duration-500">
                  <div className="relative h-48 overflow-hidden">
                     <img
                        src={novena.image}
                        alt={novena.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute top-4 left-4">
                        <span className="bg-gold-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                           Em Andamento
                        </span>
                     </div>
                  </div>
                  <div className="p-6">
                     <h3 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">{novena.title}</h3>
                     <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 line-clamp-2">{novena.description}</p>

                     <div className="mb-6">
                        <ProgressBar
                           current={novena.currentDay}
                           total={novena.totalDays}
                           showLabel
                        />
                        <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-1 text-right">
                           Dia {novena.currentDay} de {novena.totalDays}
                        </p>
                     </div>

                     <Button variant="outline" className="w-full text-xs py-2.5">
                        Rezar Dia {novena.currentDay}
                     </Button>
                  </div>
               </Card>
            )) : (
               <div className="md:col-span-2 lg:col-span-2">
                  <Card className="p-8 flex items-center justify-center text-stone-400 italic">
                     Você ainda não iniciou nenhuma novena.
                  </Card>
               </div>
            )}

            {/* Placeholder Card for "Discover" */}
            <div className="bg-stone-50 dark:bg-stone-900/30 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center p-8 text-center hover:border-gold-300 dark:hover:border-gold-800 transition-all cursor-pointer min-h-[400px] group">
               <div className="w-16 h-16 rounded-full bg-white dark:bg-stone-900 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="text-stone-400 dark:text-stone-600 group-hover:text-gold-500 transition-colors" size={32} />
               </div>
               <h3 className="font-bold text-stone-600 dark:text-stone-300 text-lg">Descobrir Mais</h3>
               <p className="text-stone-400 dark:text-stone-500 text-sm mt-2 max-w-xs leading-relaxed">
                  Encontre orações a Nossa Senhora Desatadora dos Nós, São Judas Tadeu, e muitos outros santos.
               </p>
            </div>
         </div>
      </div>
   );
};

export default Novenas;