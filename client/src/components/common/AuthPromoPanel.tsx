
import imageBg from '@/assets/images/image.png';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface AuthPromoPanelProps {
    primary: string;
    secondary: string;
}

const AuthPromoPanel = ({ primary, secondary }: AuthPromoPanelProps) => {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-[linear-gradient(145deg,rgba(78,25,43,0.91),rgba(163,57,85,0.85))] p-12 relative overflow-hidden text-white">
            <img
                src={imageBg}
                alt="Background"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="relative z-10 max-w-lg flex flex-col justify-between">
                <div className="flex">
                    <Link className="flex items-center gap-2 font-bold" to="/">
                        <div className="flex items-center justify-center gap-3 text-2xl font-bold">
                            <Sparkles size={20} />
                            <span>glow book</span>
                        </div>
                    </Link>
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[1.45px] text-[#f4c1cf]">
                        beauty, on your time
                    </span>
                    <h1 className="flex gap-2 mt-3.75 mb-4.75 max-w-110 font-['Playfair_Display'] text-[clamp(44px,5vw,67px)] leading-[0.99] tracking-[-2.8px]">
                        {primary}
                    </h1>
                    <p className="max-w-105 text-base leading-[1.65] text-[#f9dae2] max-[650px]:text-sm">
                        {secondary}
                    </p>
                </div>

                <div className="max-w-92.5 border-l-2 border-[#efb4c3] py-1.75 pl-4">
                    <span className="font-['Playfair_Display'] text-[17px] leading-[1.55]">
                        “The easiest way to keep my beauty routine on track.”
                    </span>
                    <strong className="mt-3 block text-xs text-[#f4c1cf]">— Amal</strong>
                </div>
            </div>
        </div>
    )
};

export default AuthPromoPanel;
