import React from 'react';
import MobileRiwayat from './MobileRiwayat';

export default function MobilePeminjaman({ loans = [], initialLogId = null }) {
    return (
        <MobileRiwayat
            riwayatList={loans}
            initialTab={1}
            initialLogId={initialLogId}
        />
    );
}
