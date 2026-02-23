'use client';

import { ChangeEvent } from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function Input({ label, value, onChange, placeholder, type = 'text' }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm
                 text-white font-[var(--font-space-grotesk)] text-sm
                 placeholder:text-white/20
                 focus:border-[#ff006e] focus:outline-none transition-colors
                 min-h-[44px]"
      />
    </div>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }: TextAreaProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm
                 text-white font-[var(--font-space-grotesk)] text-sm resize-y
                 placeholder:text-white/20
                 focus:border-[#ff006e] focus:outline-none transition-colors"
      />
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="w-12 h-12 rounded-sm border border-white/10 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-sm
                   text-white font-[var(--font-jetbrains-mono)] text-sm uppercase
                   focus:border-[#ff006e] focus:outline-none transition-colors
                   min-h-[44px]"
        />
      </div>
    </div>
  );
}

export const SHARED = {
  Input,
  TextArea,
  ColorPicker,
};
