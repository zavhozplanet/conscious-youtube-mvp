import { LayoutDashboard, Library, Gamepad2, Upload } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';

const Navigation = ({ role }) => {
    const location = useLocation();

    const parentLinks = [
        { icon: LayoutDashboard, label: 'Radar', path: '/parent' },
        { icon: Library, label: 'Library', path: '/parent/library' },
    ];

    const childLinks = [
        { icon: Gamepad2, label: 'Tasks', path: '/child' },
        { icon: Upload, label: 'Submit', path: '/child/submit' },
    ];

    const links = role === 'parent' ? parentLinks : childLinks;

    return (
        <div className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl z-50">
            <div className="flex justify-around items-center h-16">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={classNames(
                                "flex flex-col items-center justify-center w-full h-full transition-colors",
                                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;
