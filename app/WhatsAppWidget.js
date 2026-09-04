'use client';

import { useEffect, useState } from 'react';

const WHATSAPP_NUMBER = '8615886530985';
const DEFAULT_MESSAGE = 'Hi Lisa, I am interested in your packaging products. Can you send me more details?';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
const EMAIL = 'lisa@colorprintingpackage.com';

export default function WhatsAppWidget() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className="bpf-contact-dock">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="bpf-wa-icon-btn"
          aria-label="Chat with Lisa Wu on WhatsApp"
          title="Chat on WhatsApp"
        >
          {/* 官方 WhatsApp 字形(simple-icons 官方品牌路径),白色实心置于品牌绿 #25D366 圆底上 */}
          <svg viewBox="0 0 24 24" aria-hidden="true" width="34" height="34" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>

        <a className="bpf-mail-pill" href={`mailto:${EMAIL}`} title={`Email ${EMAIL}`}>
          <span className="bpf-mail-pill__text">{EMAIL}</span>
        </a>
      </div>

      <style>{`
        .bpf-contact-dock {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 100000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        /* ---------- WhatsApp 圆形按钮 ---------- */
        .bpf-wa-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 62px;
          height: 62px;
          background: #25d366;
          border-radius: 50%;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(0,0,0,0.22);
          /* 一闪一闪:雷达脉冲 + 亮度闪烁 + 周期性摆动 */
          animation:
            bpf-wa-ring 1.8s ease-out infinite,
            bpf-wa-flash 1.8s ease-in-out infinite,
            bpf-wa-wiggle 4.5s ease-in-out infinite;
          transition: transform 0.18s ease;
        }
        .bpf-wa-icon-btn svg { position: relative; z-index: 2; display: block; }

        /* 两圈向外扩散的绿色光环 */
        .bpf-wa-icon-btn::before,
        .bpf-wa-icon-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #25d366;
          z-index: 1;
          animation: bpf-wa-halo 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite;
        }
        .bpf-wa-icon-btn::after { animation-delay: 1.1s; }

        .bpf-wa-icon-btn:hover,
        .bpf-wa-icon-btn:focus-visible {
          transform: scale(1.1);
          outline: none;
        }
        .bpf-wa-icon-btn:focus-visible {
          box-shadow: 0 0 0 4px rgba(37,211,102,0.45), 0 6px 18px rgba(0,0,0,0.22);
        }

        @keyframes bpf-wa-ring {
          0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.75), 0 6px 18px rgba(0,0,0,0.22); }
          70%  { box-shadow: 0 0 0 18px rgba(37,211,102,0),  0 6px 18px rgba(0,0,0,0.22); }
          100% { box-shadow: 0 0 0 0 rgba(37,211,102,0),     0 6px 18px rgba(0,0,0,0.22); }
        }
        @keyframes bpf-wa-halo {
          0%   { opacity: 0.55; transform: scale(1); }
          70%  { opacity: 0;    transform: scale(1.85); }
          100% { opacity: 0;    transform: scale(1.85); }
        }
        /* 明暗交替,产生"一闪一闪"的观感 */
        @keyframes bpf-wa-flash {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.35); }
        }
        @keyframes bpf-wa-wiggle {
          0%, 82%, 100%      { transform: rotate(0deg); }
          86%                { transform: rotate(-11deg); }
          90%                { transform: rotate(9deg); }
          94%                { transform: rotate(-6deg); }
          97%                { transform: rotate(3deg); }
        }

        /* ---------- 邮箱胶囊框 ---------- */
        .bpf-mail-pill {
          display: inline-flex;
          align-items: center;
          max-width: min(78vw, 320px);
          padding: 11px 20px;
          background: #fff;
          border: 1px solid #d7dde5;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.12);
          color: #1f2937;
          font-size: 15px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.1px;
          text-decoration: none;
          white-space: nowrap;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }
        .bpf-mail-pill__text {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bpf-mail-pill:hover,
        .bpf-mail-pill:focus-visible {
          border-color: #25d366;
          box-shadow: 0 6px 18px rgba(37,211,102,0.28);
          transform: translateY(-1px);
          outline: none;
        }

        @media (max-width: 600px) {
          .bpf-contact-dock { right: 14px; bottom: 14px; gap: 8px; }
          .bpf-wa-icon-btn { width: 56px; height: 56px; }
          .bpf-wa-icon-btn svg { width: 30px; height: 30px; }
          .bpf-mail-pill { font-size: 13px; padding: 9px 15px; }
        }

        /* 尊重系统的"减少动态效果"设置 */
        @media (prefers-reduced-motion: reduce) {
          .bpf-wa-icon-btn,
          .bpf-wa-icon-btn::before,
          .bpf-wa-icon-btn::after {
            animation: none;
          }
          .bpf-wa-icon-btn { transition: none; box-shadow: 0 6px 18px rgba(0,0,0,0.22); }
          .bpf-mail-pill { transition: none; }
        }
      `}</style>
    </>
  );
}
