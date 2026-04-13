import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-6xl">🎮</div>
                <h1 className="font-display text-3xl font-bold text-foreground">¡Ups!</h1>
                <p className="text-muted-foreground">
                    La página <span className="font-medium text-foreground">"{pageName}"</span> no existe.
                </p>
                {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                    <div className="p-4 bg-muted rounded-xl text-sm text-muted-foreground">
                        Admin: Esta página aún no ha sido implementada.
                    </div>
                )}
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="inline-flex items-center px-6 py-3 font-display font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    )
}