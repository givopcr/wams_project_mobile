import React from 'react';
import MobileRiwayat from './MobileRiwayat';

export default function MobilePeminjaman({ loans = [], allLogs = [], initialLogId = null }) {
    return (
        <MobileRiwayat
            riwayatList={allLogs && allLogs.length > 0 ? allLogs : loans}
            initialTab={1}
            initialLogId={initialLogId}
        />
    );
}
