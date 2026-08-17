import React from 'react';

interface Reason {
  icon: string;
  title: string;
  description: string;
}

const REASONS: Reason[] = [
  {
    icon: '⚡',
    title: 'Real-time Synchronization',
    description: 'Track job applications from federal, state, and private boards. Status changes are stored instantly for zero latency.'
  },
  {
    icon: '🔒',
    title: 'Local & Secure Data',
    description: 'We value your privacy. Your application history, credentials, and data remain secure on your local device.'
  },
  {
    icon: '🧠',
    title: 'AI Score Insights',
    description: 'Evaluate compatibility and compare your credentials with listing requirements to target roles where you have a competitive edge.'
  },
  {
    icon: '📈',
    title: 'Organized Analytics',
    description: 'Visualize your progress with live stat counters that reflect exactly where you stand in active recruitment funnels.'
  }
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="why-choose-us-section">
      <div className="section-header">
        <span className="section-badge">ADVANTAGES</span>
        <h2>Why Choose applyTrack-ai?</h2>
        <p className="section-subtitle-text">
          Maximize your hiring success rate with tools built specifically for the modern job seeker.
        </p>
      </div>

      <div className="why-choose-grid">
        {REASONS.map((item, index) => (
          <div key={index} className="why-choose-card">
            <div className="why-choose-icon-wrapper">
              <span className="why-choose-icon">{item.icon}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
