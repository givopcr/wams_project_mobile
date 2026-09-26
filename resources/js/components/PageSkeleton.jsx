import React from 'react';

/**
 * Modern Page-Specific Shimmer Skeletons
 * Matches the exact layouts of each admin page to provide seamless transitions
 */

// 1. DASHBOARD SKELETON
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs flex items-center gap-4"
                    >
                        <div className="w-13 h-13 rounded-full shimmer-box shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="w-16 h-7 rounded-lg shimmer-box" />
                            <div className="w-28 h-3 rounded-md shimmer-box opacity-75" />
                            <div className="w-20 h-2.5 rounded-md shimmer-box opacity-50" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Row: 3 Category Loan Cards with Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex flex-col justify-between space-y-5"
                    >
                        <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl shimmer-box shrink-0" />
                                    <div className="space-y-1.5">
                                        <div className="w-28 h-4 rounded-md shimmer-box" />
                                        <div className="w-36 h-3 rounded-md shimmer-box opacity-60" />
                                    </div>
                                </div>
                                <div className="w-20 h-6 rounded-full shimmer-box opacity-80" />
                            </div>

                            {/* 2 Metrics Boxes */}
                            <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-[#E0E0E0]/80">
                                <div className="bg-[#EEEEEE]/70 rounded-xl p-2.5 space-y-1.5">
                                    <div className="w-16 h-2 rounded shimmer-box opacity-60" />
                                    <div className="w-24 h-3.5 rounded shimmer-box" />
                                </div>
                                <div className="bg-[#EEEEEE]/70 rounded-xl p-2.5 space-y-1.5">
                                    <div className="w-16 h-2 rounded shimmer-box opacity-60" />
                                    <div className="w-24 h-3.5 rounded shimmer-box" />
                                </div>
                            </div>
                        </div>

                        {/* Mini Bar Chart Placeholder */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <div className="w-32 h-3 rounded shimmer-box opacity-70" />
                                <div className="w-20 h-3 rounded shimmer-box opacity-60" />
                            </div>
                            <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2 bg-gray-50/50 rounded-xl">
                                {[40, 75, 95, 55, 80, 35, 70].map((h, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full rounded-t-lg shimmer-box"
                                            style={{ height: `${h}%` }}
                                        />
                                        <div className="w-5 h-2 rounded shimmer-box opacity-50" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Horizontal Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]/80">
                            <div className="w-44 h-5 rounded-lg shimmer-box" />
                            <div className="w-20 h-4 rounded-md shimmer-box opacity-60" />
                        </div>
                        <div className="space-y-3 pt-1">
                            {[1, 2, 3, 4].map((bar) => (
                                <div key={bar} className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <div className="w-32 h-3 rounded shimmer-box opacity-75" />
                                        <div className="w-12 h-3 rounded shimmer-box opacity-60" />
                                    </div>
                                    <div className="w-full h-3 rounded-full shimmer-box" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Row: Recent User Activity */}
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E0E0E0]">
                    <div className="space-y-1.5">
                        <div className="w-48 h-5 rounded-lg shimmer-box" />
                        <div className="w-72 h-3 rounded shimmer-box opacity-60" />
                    </div>
                    <div className="w-28 h-4 rounded shimmer-box opacity-75" />
                </div>
                <div className="divide-y divide-[#E0E0E0]/80">
                    {[1, 2, 3].map((row) => (
                        <div
                            key={row}
                            className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2"
                        >
                            <div className="flex items-center gap-3.5 min-w-[220px]">
                                <div className="w-10 h-10 rounded-xl shimmer-box shrink-0" />
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="w-32 h-3.5 rounded shimmer-box" />
                                    <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                                </div>
                            </div>
                            <div className="space-y-1.5 min-w-[200px]">
                                <div className="w-36 h-3.5 rounded shimmer-box" />
                                <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                            </div>
                            <div className="w-28 h-3.5 rounded shimmer-box min-w-[140px] opacity-70" />
                            <div className="w-24 h-7 rounded-lg shimmer-box min-w-[120px]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 2. CALENDAR SKELETON
function CalendarSkeleton() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* Main Calendar Card */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex-1 w-full overflow-hidden space-y-4">
                    {/* Header Controls Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                        <div className="w-20 h-8 rounded-lg shimmer-box" />
                        <div className="flex items-center gap-3 self-center">
                            <div className="w-8 h-8 rounded-lg shimmer-box" />
                            <div className="w-36 h-6 rounded-lg shimmer-box" />
                            <div className="w-8 h-8 rounded-lg shimmer-box" />
                        </div>
                        <div className="w-32 h-8 rounded-lg shimmer-box" />
                    </div>

                    {/* Day Names Grid (7 columns: Sen - Min) */}
                    <div className="grid grid-cols-7 gap-2 pb-2 border-b border-[#E0E0E0]">
                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
                            <div key={idx} className="text-center py-1">
                                <div className="w-8 h-3 mx-auto rounded shimmer-box opacity-75" />
                            </div>
                        ))}
                    </div>

                    {/* Calendar Month Grid: 5 rows x 7 days */}
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="min-h-[96px] sm:min-h-[110px] p-2 rounded-xl border border-gray-100 bg-white/70 flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="w-5 h-4 rounded shimmer-box opacity-60" />
                                </div>
                                <div className="space-y-1.5 mt-2 flex-1">
                                    {idx % 3 === 0 && (
                                        <div className="w-full h-4 rounded-md shimmer-box bg-blue-100/50" />
                                    )}
                                    {idx % 5 === 0 && (
                                        <div className="w-full h-4 rounded-md shimmer-box bg-emerald-100/50" />
                                    )}
                                    {idx === 14 && (
                                        <div className="w-full h-4 rounded-md shimmer-box bg-rose-100/50" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Sidebar Card */}
                <div className="w-full xl:w-80 bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs space-y-4 shrink-0">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
                        <div className="space-y-1">
                            <div className="w-36 h-4 rounded shimmer-box" />
                            <div className="w-20 h-2.5 rounded shimmer-box opacity-60" />
                        </div>
                        <div className="w-14 h-6 rounded-lg shimmer-box opacity-70" />
                    </div>

                    {/* 5 Upcoming Loan Items */}
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="p-3.5 rounded-xl border border-[#E0E0E0] space-y-2.5 bg-gray-50/40"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-20 h-4 rounded shimmer-box" />
                                    <div className="w-14 h-4 rounded-full shimmer-box opacity-60" />
                                </div>
                                <div className="space-y-1">
                                    <div className="w-32 h-3 rounded shimmer-box opacity-80" />
                                    <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                                </div>
                                <div className="w-28 h-2.5 rounded shimmer-box opacity-50 pt-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 3. MASTER BARANG SKELETON
function BarangSkeleton() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* 1. Category Statistic Cards Skeleton */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="w-56 h-5 rounded-lg shimmer-box" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] shimmer-box" />
                                <div className="w-28 h-6 rounded-full shimmer-box opacity-75" />
                            </div>
                            <div className="space-y-1.5 pt-1">
                                <div className="w-32 h-5 rounded-md shimmer-box" />
                                <div className="w-24 h-3.5 rounded shimmer-box opacity-60" />
                            </div>
                            <div className="pt-4 mt-4 border-t border-[#E0E0E0] grid grid-cols-3 gap-2 text-center">
                                <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0] space-y-1">
                                    <div className="w-10 h-2 mx-auto rounded shimmer-box opacity-60" />
                                    <div className="w-6 h-4 mx-auto rounded shimmer-box" />
                                </div>
                                <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0] space-y-1">
                                    <div className="w-10 h-2 mx-auto rounded shimmer-box opacity-60" />
                                    <div className="w-6 h-4 mx-auto rounded shimmer-box" />
                                </div>
                                <div className="bg-[#EEEEEE] p-2 rounded-lg border border-[#E0E0E0] space-y-1">
                                    <div className="w-10 h-2 mx-auto rounded shimmer-box opacity-60" />
                                    <div className="w-6 h-4 mx-auto rounded shimmer-box" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Segmented Tabs & Toolbar Skeleton */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-[#E0E0E0] rounded-2xl shadow-2xs">
                    <div className="w-36 h-9 rounded-xl shimmer-box" />
                    <div className="w-32 h-9 rounded-xl shimmer-box opacity-70" />
                    <div className="w-40 h-9 rounded-xl shimmer-box opacity-70" />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-full sm:w-64 h-10 rounded-xl shimmer-box" />
                        <div className="w-52 h-10 rounded-xl shimmer-box" />
                    </div>
                    <div className="w-44 h-10 rounded-xl shimmer-box bg-rose-100/60" />
                </div>

                {/* 3. Table Container */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                    {/* Table Header */}
                    <div className="bg-[#EEEEEE] p-4 grid grid-cols-12 gap-4 border-b border-[#E0E0E0]">
                        <div className="col-span-4 h-3.5 rounded shimmer-box opacity-75" />
                        <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                        <div className="col-span-1 h-3.5 rounded shimmer-box opacity-75" />
                        <div className="col-span-1 h-3.5 rounded shimmer-box opacity-75" />
                        <div className="col-span-1 h-3.5 rounded shimmer-box opacity-75" />
                        <div className="col-span-1 h-3.5 rounded shimmer-box opacity-75" />
                        <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                    </div>

                    {/* Table Rows (6 Rows) */}
                    <div className="divide-y divide-[#E0E0E0]">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl shimmer-box shrink-0" />
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="w-36 h-3.5 rounded shimmer-box" />
                                        <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <div className="w-20 h-5 rounded-full shimmer-box opacity-80" />
                                    <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <div className="w-10 h-5 rounded-md shimmer-box" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <div className="w-10 h-5 rounded-md shimmer-box bg-emerald-100/50" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <div className="w-10 h-5 rounded-md shimmer-box bg-amber-100/50" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <div className="w-10 h-5 rounded-md shimmer-box bg-rose-100/50" />
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    <div className="w-8 h-8 rounded-lg shimmer-box" />
                                    <div className="w-8 h-8 rounded-lg shimmer-box" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 4. UNIT FISIK SKELETON
function UnitSkeleton() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-full sm:w-64 h-10 rounded-xl shimmer-box" />
                    <div className="w-40 h-10 rounded-xl shimmer-box" />
                    <div className="w-36 h-10 rounded-xl shimmer-box" />
                </div>
                <div className="w-40 h-10 rounded-xl shimmer-box bg-rose-100/60" />
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-[#EEEEEE] p-4 grid grid-cols-12 gap-4 border-b border-[#E0E0E0]">
                    <div className="col-span-3 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-3 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                </div>
                <div className="divide-y divide-[#E0E0E0]">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl shimmer-box shrink-0" />
                                <div className="w-24 h-4 rounded font-mono shimmer-box" />
                            </div>
                            <div className="col-span-3 space-y-1.5">
                                <div className="w-36 h-3.5 rounded shimmer-box" />
                                <div className="w-20 h-2.5 rounded shimmer-box opacity-60" />
                            </div>
                            <div className="col-span-2">
                                <div className="w-20 h-6 rounded-full shimmer-box" />
                            </div>
                            <div className="col-span-2">
                                <div className="w-16 h-5 rounded-md shimmer-box" />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <div className="w-8 h-8 rounded-lg shimmer-box" />
                                <div className="w-8 h-8 rounded-lg shimmer-box" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 5. LOGBOOK SKELETON
function LogbookSkeleton() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-8">
            {/* Status Tabs Navigation (5 Tabs) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="w-36 h-10 rounded-xl shimmer-box shrink-0"
                    />
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:w-80 h-10 rounded-xl shimmer-box" />
                <div className="w-36 h-4 rounded shimmer-box opacity-60 self-end sm:self-auto" />
            </div>

            {/* Big Transaction Table */}
            <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-[#EEEEEE] p-4 grid grid-cols-12 gap-4 border-b border-[#E0E0E0]">
                    <div className="col-span-3 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-3 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-3 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-1 h-3.5 rounded shimmer-box opacity-75" />
                </div>
                <div className="divide-y divide-[#E0E0E0]">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl shimmer-box shrink-0" />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="w-32 h-3.5 rounded shimmer-box" />
                                    <div className="w-20 h-2.5 rounded shimmer-box opacity-60" />
                                </div>
                            </div>
                            <div className="col-span-3 space-y-1.5">
                                <div className="w-36 h-3.5 rounded shimmer-box" />
                                <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                            </div>
                            <div className="col-span-3 space-y-1.5">
                                <div className="w-32 h-3 rounded shimmer-box" />
                                <div className="w-28 h-2.5 rounded shimmer-box opacity-60" />
                            </div>
                            <div className="col-span-2">
                                <div className="w-24 h-6 rounded-lg shimmer-box" />
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <div className="w-8 h-8 rounded-lg shimmer-box" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 6. QR CODE SKELETON
function QrCodeSkeleton() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Tabs Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E0E0] pb-4">
                <div className="flex items-center gap-2 bg-[#EEEEEE] p-1 rounded-xl">
                    <div className="w-28 h-9 rounded-lg shimmer-box" />
                    <div className="w-32 h-9 rounded-lg shimmer-box opacity-60" />
                </div>
                <div className="w-36 h-9 rounded-xl shimmer-box" />
            </div>

            {/* Grid of QR Code Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs flex flex-col justify-between items-center space-y-4"
                    >
                        <div className="w-full flex justify-between items-center">
                            <div className="w-24 h-5 rounded-md shimmer-box" />
                            <div className="w-6 h-6 rounded shimmer-box opacity-60" />
                        </div>
                        <div className="w-36 h-36 rounded-xl shimmer-box my-2" />
                        <div className="w-full space-y-2 text-center">
                            <div className="w-32 h-3.5 mx-auto rounded shimmer-box" />
                            <div className="w-20 h-2.5 mx-auto rounded shimmer-box opacity-60" />
                        </div>
                        <div className="w-full h-9 rounded-xl shimmer-box" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// 7. USER MANAGEMENT SKELETON
function UsersSkeleton() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="w-full sm:w-64 h-10 rounded-xl shimmer-box" />
                    <div className="w-36 h-10 rounded-xl shimmer-box" />
                </div>
                <div className="w-40 h-10 rounded-xl shimmer-box bg-rose-100/60" />
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-[#EEEEEE] p-4 grid grid-cols-12 gap-4 border-b border-[#E0E0E0]">
                    <div className="col-span-4 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-3 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-2 h-3.5 rounded shimmer-box opacity-75" />
                    <div className="col-span-1 h-3.5 rounded shimmer-box opacity-75" />
                </div>
                <div className="divide-y divide-[#E0E0E0]">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full shimmer-box shrink-0" />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="w-32 h-3.5 rounded shimmer-box" />
                                    <div className="w-40 h-2.5 rounded shimmer-box opacity-60" />
                                </div>
                            </div>
                            <div className="col-span-3">
                                <div className="w-24 h-4 rounded font-mono shimmer-box" />
                            </div>
                            <div className="col-span-2">
                                <div className="w-24 h-6 rounded-full shimmer-box" />
                            </div>
                            <div className="col-span-2">
                                <div className="w-28 h-3 rounded shimmer-box opacity-70" />
                            </div>
                            <div className="col-span-1 flex justify-end gap-2">
                                <div className="w-8 h-8 rounded-lg shimmer-box" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 8. REPORTS SKELETON
function ReportsSkeleton() {
    return (
        <div className="space-y-7 max-w-7xl mx-auto pb-12">
            {/* Header Card with Exports & Period */}
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-2">
                        <div className="w-36 h-6 rounded-full shimmer-box" />
                        <div className="w-64 h-7 rounded-lg shimmer-box" />
                        <div className="w-80 h-3 rounded shimmer-box opacity-60" />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-32 h-10 rounded-xl shimmer-box bg-emerald-100/50" />
                        <div className="w-36 h-10 rounded-xl shimmer-box" />
                    </div>
                </div>

                <div className="pt-4 border-t border-[#E0E0E0] flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-24 h-8 rounded-lg shimmer-box" />
                    ))}
                </div>
            </div>

            {/* 4 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl shimmer-box" />
                            <div className="w-14 h-4 rounded-full shimmer-box opacity-60" />
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <div className="w-20 h-3 rounded shimmer-box opacity-70" />
                            <div className="w-24 h-6 rounded shimmer-box" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Big Report Table Card */}
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
                    <div className="w-48 h-5 rounded shimmer-box" />
                    <div className="w-28 h-4 rounded shimmer-box opacity-60" />
                </div>
                <div className="space-y-3 pt-2">
                    {[1, 2, 3, 4, 5].map((row) => (
                        <div
                            key={row}
                            className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-xl shimmer-box shrink-0" />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="w-40 h-3.5 rounded shimmer-box" />
                                    <div className="w-24 h-2.5 rounded shimmer-box opacity-60" />
                                </div>
                            </div>
                            <div className="w-24 h-6 rounded-full shimmer-box" />
                            <div className="w-28 h-3 rounded shimmer-box opacity-70" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 9. DEFAULT / FALLBACK SKELETON
function GenericSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-150 select-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="space-y-2">
                    <div className="w-52 h-7 rounded-xl shimmer-box" />
                    <div className="w-80 h-3.5 rounded-lg shimmer-box opacity-70" />
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-28 h-10 rounded-xl shimmer-box" />
                    <div className="w-36 h-10 rounded-xl shimmer-box" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl p-5 border border-[#E0E0E0] shadow-2xs space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-11 h-11 rounded-xl shimmer-box" />
                            <div className="w-14 h-4 rounded-full shimmer-box opacity-60" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <div className="w-20 h-3 rounded-md shimmer-box opacity-70" />
                            <div className="w-28 h-7 rounded-lg shimmer-box" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="w-full sm:w-80 h-10 rounded-xl shimmer-box" />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-24 h-9 rounded-lg shimmer-box" />
                        <div className="w-24 h-9 rounded-lg shimmer-box" />
                        <div className="w-28 h-9 rounded-lg shimmer-box" />
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    {[1, 2, 3, 4, 5].map((row) => (
                        <div
                            key={row}
                            className="p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl shimmer-box shrink-0" />
                                <div className="space-y-2 min-w-0 flex-1">
                                    <div className="w-44 h-3.5 rounded-md shimmer-box" />
                                    <div className="w-28 h-2.5 rounded-md shimmer-box opacity-60" />
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="w-24 h-6 rounded-full shimmer-box" />
                                <div className="w-32 h-3.5 rounded-md shimmer-box opacity-70" />
                            </div>
                            <div className="w-8 h-8 rounded-lg shimmer-box shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Main PageSkeleton Router
 * Selects the matching skeleton component based on the target URL path
 */
export default function PageSkeleton({ path = '' }) {
    const cleanPath = (typeof path === 'string' ? path : '').toLowerCase();

    const renderContent = () => {
        if (cleanPath.includes('/calendar')) {
            return <CalendarSkeleton />;
        }
        if (cleanPath.includes('/dashboard')) {
            return <DashboardSkeleton />;
        }
        if (cleanPath.includes('/barang') || cleanPath.includes('/kategori')) {
            return <BarangSkeleton />;
        }
        if (cleanPath.includes('/unit')) {
            return <UnitSkeleton />;
        }
        if (cleanPath.includes('/logbook')) {
            return <LogbookSkeleton />;
        }
        if (cleanPath.includes('/qrcode')) {
            return <QrCodeSkeleton />;
        }
        if (cleanPath.includes('/users')) {
            return <UsersSkeleton />;
        }
        if (cleanPath.includes('/reports')) {
            return <ReportsSkeleton />;
        }
        return <GenericSkeleton />;
    };

    return (
        <div className="animate-in fade-in duration-100 select-none">
            {renderContent()}
        </div>
    );
}
