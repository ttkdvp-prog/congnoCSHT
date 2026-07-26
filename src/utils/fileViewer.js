/**
 * Universal File Viewer Utility for Web App (Works seamlessly on PC, iPhone iOS Safari, and Android Chrome)
 */
export const openAttachedFile = (rawUrl, station = {}) => {
  if (!rawUrl) return;
  let url = String(rawUrl).trim();

  // 1. Convert Google Drive / Docs links to Universal Preview Embed Format
  // Converts drive.google.com/file/d/ID/view?usp=... -> drive.google.com/file/d/ID/preview
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      url = `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  // 2. Handle HTTP/HTTPS URLs
  if (/^(http:\/\/|https:\/\/)/i.test(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  // 3. Handle Web URLs without protocol (e.g. drive.google.com/..., dropbox.com/...)
  if (/^(drive\.google\.com|docs\.google\.com|dropbox\.com|onedrive\.|1drv\.ms|[a-z0-9-]+\.[a-z]{2,}\/)/i.test(url)) {
    window.open('https://' + url, '_blank', 'noopener,noreferrer');
    return;
  }

  // 4. Handle Base64 Data URLs (data:application/pdf;base64,...) safely for Mobile Browsers
  if (url.startsWith('data:')) {
    try {
      const parts = url.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        // Fallback for mobile popup blocker
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = station?.fileName || (station?.maCSHT ? `${station.maCSHT}_van_ban.pdf` : 'van_ban_dinh_kem.pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Base64 parse error:', e);
      alert('Không thể hiển thị file Base64 này. Vui lòng thử lại!');
    }
    return;
  }

  // 5. Fallback: Plain Text Filename or Custom Message
  alert(`📌 Thông tin file đính kèm trạm ${station?.maCSHT || ''}:\n"${url}"\n\n(Để mọi người xem file 1-click từ điện thoại & máy tính khác, vui lòng dán Link Google Drive/OneDrive public vào ô đính kèm).`);
};
