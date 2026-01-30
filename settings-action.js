document.addEventListener('DOMContentLoaded', () => {
    const btnSmall = document.getElementById('btnSmall');
    const btnNormal = document.getElementById('btnNormal');
    const btnLarge = document.getElementById('btnLarge');

    function ubahFont(ukuran) {
        // Targetnya ke HTML (ROOT), bukan Body
        const root = document.documentElement;

        // Reset
        root.classList.remove('font-small', 'font-large');

        // Simpan
        localStorage.setItem('fontSize', ukuran);

        // Pasang
        if (ukuran === 'small') root.classList.add('font-small');
        if (ukuran === 'large') root.classList.add('font-large');
    }

    if (btnSmall) btnSmall.addEventListener('click', () => ubahFont('small'));
    if (btnNormal) btnNormal.addEventListener('click', () => ubahFont('normal'));
    if (btnLarge) btnLarge.addEventListener('click', () => ubahFont('large'));
});
