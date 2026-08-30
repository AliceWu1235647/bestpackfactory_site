'use client';

import { useEffect, useState } from 'react';

const WHATSAPP_NUMBER = '8615886530985';
const DEFAULT_MESSAGE = 'Hi Lisa, I am interested in your packaging products. Can you send me more details?';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

export default function WhatsAppWidget() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="bpf-wa-icon-btn"
        aria-label="Chat with Lisa Wu on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" width="28" height="28" fill="currentColor">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.825.737 5.607 2.137 8.048L0 32l7.933-2.127A15.95 15.95 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0Zm.318 29.951a13.43 13.43 0 0 1-7.388-2.354l-.507-.292-4.713 1.262 1.262-4.669-.292-.508A13.43 13.43 0 0 1 2.833 16.466c0-7.435 6.05-13.485 13.485-13.485s13.485 6.05 13.485 13.485-6.05 13.485-13.485 13.485Zm5.642-11.31c-.197-.099-1.16-.573-1.34-.639s-.311-.099-.442.099c-.131.197-.508.639-.623.771s-.23.148-.426.049c-.197-.099-.833-.307-1.587-.98-.587-.524-.983-1.171-1.098-1.368s-.012-.304.087-.403c.089-.088.197-.23.295-.344s.131-.197.197-.328c.066-.131.033-.246-.016-.344s-.442-1.065-.606-1.458c-.16-.382-.323-.33-.442-.336-.114-.006-.246-.007-.377-.007s-.344.049-.524.246c-.18.197-.688.672-.688 1.638s.705 1.9.803 2.031c.099.131 1.384 2.115 3.353 2.965.468.203.834.324 1.118.414.47.149.898.128 1.235.078.377-.056 1.16-.474 1.323-.933s.164-.852.115-.933c-.049-.082-.18-.131-.377-.23Z"/>
        </svg>
      </a>
      <style>{`
        .bpf-wa-icon-btn {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: #25d366;
          border-radius: 50%;
          color: #fff;
          box-shadow: 0 4px 16px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.18);
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          animation: bpf-wa-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .bpf-wa-icon-btn:hover,
        .bpf-wa-icon-btn:focus-visible {
          transform: scale(1.1);
          box-shadow: 0 6px 22px rgba(37,211,102,0.55), 0 4px 12px rgba(0,0,0,0.22);
          outline: none;
        }
        .bpf-wa-icon-btn:focus-visible {
          box-shadow: 0 0 0 4px rgba(37,211,102,0.35), 0 6px 22px rgba(37,211,102,0.55);
        }
        @keyframes bpf-wa-pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bpf-wa-icon-btn { animation: none; transition: none; }
        }
      `}</style>
    </>
  );
}
