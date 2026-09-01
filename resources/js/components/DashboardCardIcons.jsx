import React from 'react';

/**
 * Image 1: Jumlah Total Barang (Bunk Bed / Master Storage Inventory Icon)
 */
export function TotalBarangIcon({ className = "w-5 h-5", size = 20, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Left & Right Posts */}
            <line x1="2" y1="1.5" x2="2" y2="22.5" />
            <line x1="22" y1="1.5" x2="22" y2="22.5" />
            
            {/* Top Shelf / Upper Bed Bar */}
            <line x1="2" y1="8.5" x2="22" y2="8.5" />
            {/* Upper Right Pillow / Headboard */}
            <path d="M16 8.5V4C16 2.9 16.9 2 18 2H22" />

            {/* Bottom Shelf / Lower Bed Bar */}
            <line x1="2" y1="19" x2="22" y2="19" />
            {/* Lower Arches / Beds */}
            <path d="M2 19V15.5C2 14.4 2.9 13.5 4 13.5H6C7.1 13.5 8 14.4 8 15.5V19" />
            <path d="M9.5 19V15.5C9.5 14.4 10.4 13.5 11.5 13.5H13.5C14.6 13.5 15.5 14.4 15.5 15.5V19" />
        </svg>
    );
}

/**
 * Image 2: Total Unit Tersedia (Power Drill / Equipment Tool Icon)
 */
export function UnitTersediaIcon({ className = "w-5 h-5", size = 20, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Drill Bit */}
            <line x1="19.5" y1="6" x2="23.5" y2="6" />
            
            {/* Chuck Box */}
            <path d="M15 3.5H19.5V8.5H15" />
            
            {/* Main Body */}
            <path d="M15 3H4C2.9 3 2 3.9 2 5V10C2 11.1 2.9 12 4 12H12.5L15 8.5V3Z" />
            
            {/* Slots / Vents */}
            <line x1="5" y1="5.5" x2="11" y2="5.5" />
            <line x1="5" y1="8.5" x2="11" y2="8.5" />
            
            {/* Handle */}
            <path d="M5.2 12L3.6 19" />
            <path d="M8.8 12L7.2 19" />
            
            {/* Battery Base */}
            <rect x="1.5" y="19" width="9" height="3" rx="1.5" />
        </svg>
    );
}

/**
 * Image 3: Barang Sedang Dipinjam (Computer Screen with Setting / Gear Icon)
 */
export function BarangDipinjamIcon({ className = "w-5 h-5", size = 20, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Base and Neck */}
            <line x1="12" y1="18.5" x2="12" y2="21" />
            <path d="M7 21H17" />
            
            {/* Screen Frame (with top-right gear notch) */}
            <path d="M9.5 2H4C2.9 2 2 2.9 2 4V14.5C2 15.6 2.9 16.5 4 16.5H20C21.1 16.5 22 15.6 22 14.5V11.5" />
            
            {/* Gear on Top Right */}
            <circle cx="17.5" cy="5.5" r="2.8" />
            {/* Gear Teeth */}
            <line x1="17.5" y1="1.2" x2="17.5" y2="2.7" />
            <line x1="17.5" y1="8.3" x2="17.5" y2="9.8" />
            <line x1="13.8" y1="3.4" x2="15.1" y2="4.15" />
            <line x1="19.9" y1="6.85" x2="21.2" y2="7.6" />
            <line x1="13.8" y1="7.6" x2="15.1" y2="6.85" />
            <line x1="19.9" y1="4.15" x2="21.2" y2="3.4" />
        </svg>
    );
}

/**
 * Card 4: Persentase Barang Baik (Task Checklist Icon)
 */
export function BarangBaikIcon({ className = "w-5 h-5", size = 20, ...props }) {
    return (
        <i className={`fi fi-br-task-checklist ${className}`} style={{ fontSize: size }} {...props} />
    );
}
