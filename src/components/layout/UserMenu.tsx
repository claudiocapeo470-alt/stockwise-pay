import { LogOut, Settings, User, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function UserMenu() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = profile?.company_name || 
    (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.email?.split('@')[0] || 'Utilisateur');

  const initials = profile?.company_name 
    ? profile.company_name.substring(0, 2).toUpperCase()
    : (profile?.first_name && profile?.last_name
        ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
        : (user.email?.[0] || 'U').toUpperCase());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              {isAdmin && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="mr-1 h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/app/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/app/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir vous déconnecter ? Toute vente en cours à la caisse sera perdue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => signOut()}
              >
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}