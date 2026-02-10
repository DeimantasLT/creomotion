'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
const footerLinks = {
    navigation: [
        { label: 'HOME', href: '/' },
        { label: 'SERVICES', href: '#services' },
        { label: 'PROJECTS', href: '#projects' },
        { label: 'CONTACT', href: '#contact' },
    ],
    admin: [
        { label: 'ADMIN LOGIN', href: '/login' },
        { label: 'CLIENT PORTAL', href: '/portal' },
    ],
};
export function Footer() {
    const currentYear = new Date().getFullYear();
    return (_jsxs("footer", { className: "w-full bg-black text-[#F5F5F0] border-t-2 border-black", children: [_jsx("div", { className: "max-w-7xl mx-auto px-6 md:px-12 py-16", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12", children: [_jsxs("div", { children: [_jsxs(Link, { href: "/", className: "text-3xl font-bold tracking-tighter", style: { fontFamily: "'Space Grotesk', sans-serif" }, children: [_jsx("span", { className: "text-[#F5F5F0]", children: "CREO" }), _jsx("span", { className: "text-[#FF2E63]", children: "MOTION" })] }), _jsx("p", { className: "mt-4 text-sm text-[#F5F5F0]/60", style: { fontFamily: "'JetBrains Mono', monospace" }, children: "Motion Design & AI Video Production" }), _jsx("p", { className: "mt-2 text-xs text-[#F5F5F0]/40 tracking-wider", style: { fontFamily: "'JetBrains Mono', monospace" }, children: "VILNIUS, LITHUANIA" })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs tracking-[0.2em] text-[#FF2E63] mb-4", style: { fontFamily: "'JetBrains Mono', monospace" }, children: "[NAVIGATION]" }), _jsx("ul", { className: "space-y-2", children: footerLinks.navigation.map((link) => (_jsx("li", { children: _jsx("a", { href: link.href, className: "text-sm uppercase hover:text-[#FF2E63] transition-colors duration-200", style: { fontFamily: "'JetBrains Mono', monospace" }, children: link.label }) }, link.label))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs tracking-[0.2em] text-[#FF2E63] mb-4", style: { fontFamily: "'JetBrains Mono', monospace" }, children: "[ACCESS]" }), _jsx("ul", { className: "space-y-2", children: footerLinks.admin.map((link) => (_jsx("li", { children: _jsx(Link, { href: link.href, className: "text-sm uppercase hover:text-[#FF2E63] transition-colors duration-200", style: { fontFamily: "'JetBrains Mono', monospace" }, children: link.label }) }, link.label))) })] })] }) }), _jsx("div", { className: "border-t-2 border-[#F5F5F0]/10", children: _jsx("div", { className: "max-w-7xl mx-auto px-6 md:px-12 py-6", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-4", children: [_jsxs("p", { className: "text-xs text-[#F5F5F0]/40", style: { fontFamily: "'JetBrains Mono', monospace" }, children: ["\u00A9 ", currentYear, " CREOMOTION. ALL RIGHTS RESERVED."] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-[#FF2E63] animate-pulse" }), _jsx("span", { className: "text-xs tracking-wider", style: { fontFamily: "'JetBrains Mono', monospace" }, children: "SYSTEM ONLINE" })] })] }) }) })] }));
}
export default Footer;
