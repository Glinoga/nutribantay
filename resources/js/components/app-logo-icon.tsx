import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/NutriBantay Logo.png"
            alt="NutriBantay"
            className="h-full w-full object-contain"
            {...props}
        />
    );
}
