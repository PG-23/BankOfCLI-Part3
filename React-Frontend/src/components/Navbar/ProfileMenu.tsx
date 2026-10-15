import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

function ProfileMenu(){
    //Logged-in user,their account and the logout function from AuthProvider
    const { user,account,logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen,setIsOpen] = useState(false); //is the dropdown showing?
    const menuRef = useRef<HTMLDivElement>(null); // wraps button + dropped, for click outside

    //while open: close on click outside the menu or on the escape key
    useEffect(() => {
        if(!isOpen) return;

        function handleClickOutside(e:MouseEvent){
            if(menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
        }
        function handleEscape(e:KeyboardEvent){
            if(e.key === 'Escape') setIsOpen(false);
        }

        document.addEventListener('mousedown',handleClickOutside);
        document.addEventListener('keydown',handleEscape);
        //clean up when the menu closes,so listeners don't pile up 
        return()=>{
            document.removeEventListener('mousedown',handleClickOutside);
            document.removeEventListener('keydown',handleEscape);
        };
    },[isOpen]);

    //Navbar only shows on protected pages,but stay safe if there's no user
    if(!user) return null;

    //for example "Alice Smith" becomes "AS"
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    //for example "1000001234" becomes "1234"
    const lastFour = account?.accountNumber.slice(-4);

    function handleLogout(){
        setIsOpen(false);
        logout();
        navigate('/login',{replace:true});
    }

    return(
        //relative: the dropdown below is positioned against this box
        < div ref={menuRef} className="relative">
        {/* The button in the navbar:avatar+ name+ arrow */}
        <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen} //screen readers announce open/closed
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/20"
        >
            <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-primary"
            aria-hidden="true"
            >

                {initials}
            </span>
            {/* Name hidden on very small screens to save space */}
            <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight">{user.username}</span>
                <span className="block text-xs leading-tight text-white/80">Signed in</span>
            </span>
            {/* Arrow flips up when open */}
            <i className={`bi bi-chevron-down ml-1 text-xs transition-transform ${isOpen ? 'rotate-180':''}`} 
            aria-hidden="true"/>

        </button>
        {/* Dropdown: only render while open. absolute right-0 = pinned under the button's right edge  */}
        {isOpen &&(
            <div
            role="menu"
            className="absolute -right-2 mt-2 w-56 rounded-md border border-border bg-surface p-2 text-text-main shadow-lg">

            {/* User Info  */} 
            <div className="flex items-center gap-3 p-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-success-bg text-primary">
                    <i className="bi bi-person" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{user.username}</p>
                    {lastFour && <p className="text-small text-text-muted">Account •••• {lastFour}</p>}
                </div>
            </div>
            {/* Divider line */}
            <div className="mx-2 my-1 border-t border-border"/>

             {/* logout */}
             <button 
             type="button"
             role="menuitem"
             onClick={handleLogout}
             className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-base text-link transition-colors hover:bg-background">
            
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            Logout
             </button>
             </div>



        )}
        </div>
    );
}

export default ProfileMenu;