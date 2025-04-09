import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Timer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddCategoryModal from '@/components/modals/add-category-modal';
import { Category } from '@shared/schema';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const { t } = useTranslation();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Function to get the icon class for a category
  const getCategoryIcon = (icon: string) => {
    return icon || 'ri-folder-line';
  };

  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <aside className={`md:flex md:w-64 flex-col bg-zinc-900 border-r border-zinc-800 fixed h-full z-20 transition-all duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="font-bold text-xl flex items-center">
            <Timer className="mr-2 h-5 w-5 text-primary" />
            {t('app.title')}
          </h1>
          <button 
            className="md:hidden p-2 rounded-md hover:bg-zinc-800 transition-all"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link 
            href="/" 
            className={`flex items-center space-x-3 ${location === '/' ? 'bg-primary/20 text-white' : 'hover:bg-zinc-800/80'} rounded-md p-2.5 transition-all`}
            onClick={() => onClose()}
          >
            <i className="ri-dashboard-line text-primary"></i>
            <span>{t('navigation.dashboard')}</span>
          </Link>
          
          <div className="pt-4 pb-2">
            <h2 className="text-zinc-400 text-xs uppercase font-semibold px-2">{t('navigation.categories')}</h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center space-x-3 hover:bg-zinc-800/80 rounded-md p-2.5">
              <div className="h-4 w-4 bg-zinc-800 rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse"></div>
            </div>
          ) : (
            categories?.map((category: Category) => (
              <Link 
                key={category.id}
                href={`/category/${category.id}`} 
                className={`flex items-center justify-between ${location === `/category/${category.id}` ? 'bg-primary/20 text-white' : 'hover:bg-zinc-800/80'} rounded-md p-2.5 transition-all group`}
                onClick={() => onClose()}
              >
                <div className="flex items-center space-x-3">
                  <i className={getCategoryIcon(category.icon)}></i>
                  <span>{category.name}</span>
                </div>
                <span className="text-zinc-500 text-xs">
                  {formatTime(0)}
                </span>
              </Link>
            ))
          )}
          
          <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
            <DialogTrigger asChild>
              <button className="flex w-full items-center space-x-3 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-md p-2.5 transition-all mt-2">
                <i className="ri-add-line"></i>
                <span>{t('category.addCategory')}</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <AddCategoryModal onSuccess={() => {
                setIsAddCategoryModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
              }} />
            </DialogContent>
          </Dialog>
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <Link href="/settings">
            <Button 
              variant="ghost" 
              className="flex w-full items-center justify-start"
              onClick={onClose}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('navigation.settings')}</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={onClose}
        ></div>
      )}
    </>
  );
}
