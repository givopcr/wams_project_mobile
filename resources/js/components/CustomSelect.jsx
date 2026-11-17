import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Modern Custom Dropdown (Drop-in replacement for native <select>)
 * Supports either <option value="...">Label</option> children or options={[{ value, label }]}
 */
export default function CustomSelect({
    value,
    onChange,
    children,
    options: propOptions,
    disabled = false,
    className = '',
    title,
    placeholder = 'Pilih...',
    variant = 'default', // 'default' | 'pill'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    // Extract options from children <option> elements or propOptions
    const parsedOptions = useMemo(() => {
        if (Array.isArray(propOptions) && propOptions.length > 0) {
            return propOptions;
        }
        const list = [];
        React.Children.forEach(children, (child) => {
            if (!React.isValidElement(child)) return;
            if (child.type === 'option') {
                list.push({
                    value: child.props.value !== undefined ? String(child.props.value) : '',
                    label: child.props.children,
                    disabled: Boolean(child.props.disabled),
                });
            }
        });
        return list;
    }, [children, propOptions]);

    const stringValue = value !== undefined && value !== null ? String(value) : '';
    const selectedOption =
        parsedOptions.find((opt) => String(opt.value) === stringValue) ||
        parsedOptions[0] || { value: '', label: placeholder };

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const estimatedMenuHeight = Math.min(parsedOptions.length * 40 + 16, 260);
        const openUpward =
            rect.bottom + estimatedMenuHeight > viewportHeight && rect.top > estimatedMenuHeight;

        setMenuStyle({
            position: 'fixed',
            left: `${Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 160) - 8))}px`,
            width: `${Math.max(rect.width, 155)}px`,
            ...(openUpward
                ? { bottom: `${viewportHeight - rect.top + 6}px` }
                : { top: `${rect.bottom + 6}px` }),
            zIndex: 9999,
        });
    };

    const toggleOpen = () => {
        if (disabled) return;
        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        const handleScrollOrResize = () => {
            updatePosition();
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen, parsedOptions.length]);

    const handleSelect = (opt) => {
        if (opt.disabled) return;
        setIsOpen(false);
        if (onChange && String(opt.value) !== stringValue) {
            onChange({ target: { value: opt.value } });
        }
    };

    const isWhiteText = className.includes('text-white');

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                title={title}
                onClick={toggleOpen}
                className={`inline-flex items-center justify-between gap-2 text-left select-none focus:outline-none ${className}`}
            >
                <span className="truncate">{selectedOption.label}</span>
                <ChevronDown
                    size={variant === 'pill' ? 13 : 15}
                    strokeWidth={2.5}
                    className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    } ${isWhiteText ? 'text-white' : 'text-[#6B7280]'}`}
                />
            </button>

            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={menuStyle}
                        className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_10px_28px_rgba(15,23,42,0.14)] p-1.5 max-h-[260px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                    >
                        {parsedOptions.map((opt) => {
                            const isSelected = String(opt.value) === stringValue;
                            return (
                                <button
                                    key={String(opt.value)}
                                    type="button"
                                    disabled={opt.disabled}
                                    onClick={() => handleSelect(opt)}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                                        opt.disabled
                                            ? 'opacity-45 cursor-not-allowed text-slate-400'
                                            : isSelected
                                            ? 'bg-rose-50 text-[#D84040] font-bold cursor-pointer'
                                            : 'text-[#1D1616] font-medium hover:bg-[#F3F4F6] cursor-pointer'
                                    }`}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {isSelected && (
                                        <Check size={14} strokeWidth={2.6} className="text-[#D84040] shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </>
    );
}
