import AiInboxClient from './AiInboxClient';

export const metadata = {
  title: 'AI Customer Inbox | BestPackFactory',
  description: 'Private AI-assisted customer service workspace.',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default function AiInboxPage() {
  return <AiInboxClient />;
}
