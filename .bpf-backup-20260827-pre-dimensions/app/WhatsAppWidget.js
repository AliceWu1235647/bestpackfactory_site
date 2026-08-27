// Server component facade: the WhatsApp FAB + email pill are rendered as pure
// static HTML/CSS in the initial document — no client JS, no hydration needed.
// Links (wa.me / mailto) and all animations work without JavaScript.
// Visual output is identical to the previous client-rendered widget.

const WHATSAPP_NUMBER = '8615886530985';
const CONTACT_EMAIL = 'lisa@colorprintingpackage.com';
const DEFAULT_MESSAGE = 'Hi Lisa, I am interested in your packaging products. Can you send me more details?';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
const EMAIL_LINK = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Packaging Inquiry')}&body=${encodeURIComponent('Hello Lisa, I would like a custom packaging quote.')}`;

const WhatsAppIcon = ({ size = 32, color = '#fff' }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true">
    <path
      fill={color}
      d="M16.04 4C9.4 4 4 9.4 4 16.04c0 2.13.56 4.21 1.62 6.04L4 28l6.08-1.59a12.02 12.02 0 0 0 5.96 1.52h.01C22.68 27.93 28 22.52 28 15.96 28 12.78 26.8 9.77 24.62 7.6A11.96 11.96 0 0 0 16.04 4Zm0 2.15c2.72 0 5.27 1.06 7.19 2.98a10.12 10.12 0 0 1 2.99 7.19c0 5.58-4.56 10.14-10.16 10.14-1.83 0-3.62-.5-5.17-1.43l-.37-.22-3.6.94.96-3.51-.24-.38a10.1 10.1 0 0 1-1.55-5.4c0-5.6 4.55-10.16 10.15-10.16h-.2Zm-3.6 4.9c-.22 0-.58.08-.89.42-.31.33-1.17 1.14-1.17 2.78 0 1.65 1.2 3.24 1.37 3.46.16.22 2.31 3.67 5.7 5 .78.31 1.4.5 1.88.64.79.23 1.51.2 2.07.12.63-.09 1.95-.8 2.22-1.57.28-.77.28-1.43.19-1.57-.08-.14-.3-.22-.63-.39-.33-.16-1.95-.96-2.25-1.07-.3-.11-.52-.16-.74.17-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.7.08-.33-.16-1.38-.51-2.63-1.62-.97-.87-1.63-1.94-1.82-2.27-.19-.33-.02-.5.14-.67.14-.14.32-.37.48-.56.16-.19.21-.33.32-.54.11-.22.05-.41-.03-.57-.08-.16-.72-1.75-1-2.4-.25-.58-.5-.5-.7-.5h-.6Z"
    />
  </svg>
);

const EnvelopeIcon = ({ size = 15, color = '#16a34a' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
    <path
      fill={color}
      d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.24v9.51h16V7.24l-7.44 5.58a1.2 1.2 0 0 1-1.12 0L4 7.24Zm.42-1.24L12 11.6l7.58-5.6H4.42Z"
    />
  </svg>
);

export default function WhatsAppWidget() {
  return (
    <>
      <div
        className="wa-wrap"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        {/* Email capsule — shown on all viewports */}
        <a
          href={EMAIL_LINK}
          className="wa-email-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#fff',
            border: '1.5px solid #16a34a',
            color: '#14532d',
            borderRadius: 999,
            padding: '9px 14px',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(22,163,74,.25)',
            maxWidth: 'calc(100vw - 36px)',
          }}
        >
          <EnvelopeIcon size={15} />
          {CONTACT_EMAIL}
        </a>

        {/* WhatsApp FAB — direct link to chat with Lisa (no intermediate panel) */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="wa-fab"
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#25D366',
            border: '2.5px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            textDecoration: 'none',
          }}
        >
          <WhatsAppIcon size={33} />
        </a>
      </div>

      <style>{`
        /* Blinking pulse rings — reminds visitors to click */
        .wa-fab::before,
        .wa-fab::after {
          content: '';
          position: absolute;
          inset: -7px;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.55);
          z-index: -1;
          animation: waPing 1.9s ease-out infinite;
        }
        .wa-fab::after {
          animation-delay: 0.95s;
          background: rgba(37, 211, 102, 0.35);
        }
        /* Gentle floating + breathing glow */
        .wa-fab {
          animation: waFloat 2.6s ease-in-out infinite, waGlow 1.9s ease-in-out infinite;
        }
        .wa-fab:hover {
          animation: waGlow 1.9s ease-in-out infinite;
          transform: scale(1.06);
        }
        @keyframes waPing {
          0% {
            transform: scale(0.85);
            opacity: 0.75;
          }
          70%,
          100% {
            transform: scale(1.75);
            opacity: 0;
          }
        }
        @keyframes waFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes waGlow {
          0%,
          100% {
            box-shadow: 0 6px 18px rgba(37, 211, 102, 0.5);
          }
          50% {
            box-shadow: 0 6px 28px rgba(37, 211, 102, 1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wa-fab::before,
          .wa-fab::after,
          .wa-fab {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
