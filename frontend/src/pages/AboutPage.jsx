import { useScrollReveal } from '../hooks/useScrollReveal';
import './AboutPage.css';

const SKILLS = [
  { name: 'Video Editing',    level: 98 },
  { name: 'Color Grading',    level: 95 },
  { name: 'Motion Graphics',  level: 88 },
  { name: 'VFX & Compositing',level: 82 },
  { name: 'Sound Design',     level: 78 },
  { name: 'Cinematography',   level: 85 },
];

const TOOLS = [
  { name: 'DaVinci Resolve',    abbr: 'DR',  hue: '180' },
  { name: 'Premiere Pro',       abbr: 'Pr',  hue: '270' },
  { name: 'After Effects',      abbr: 'Ae',  hue: '250' },
  { name: 'Final Cut Pro',      abbr: 'FC',  hue: '0' },
  { name: 'Cinema 4D',          abbr: 'C4D', hue: '210' },
  { name: 'Adobe Audition',     abbr: 'Au',  hue: '190' },
  { name: 'Photoshop',          abbr: 'Ps',  hue: '230' },
  { name: 'Lightroom',          abbr: 'Lr',  hue: '200' },
];

const TIMELINE = [
  { year: '2016', title: 'The Beginning',        desc: 'Started as a freelance video editor, working with local brands and independent creators to hone the craft.' },
  { year: '2018', title: 'First Major Campaign',  desc: 'Delivered a national television commercial that reached 5 million viewers, opening the door to global brand opportunities.' },
  { year: '2020', title: 'Studio Launch',         desc: 'Founded Yash Edits, a full-service post-production studio based in Mumbai.' },
  { year: '2022', title: 'Festival Recognition',  desc: 'Short film "The Last Frame" won Best Editing at three international film festivals.' },
  { year: '2024', title: 'Global Expansion',      desc: 'Now working with clients across 20+ countries, delivering premium cinematic content for top-tier brands.' },
];

export default function AboutPage() {
  useScrollReveal();

  return (
    <div className="about-page page-enter">

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header__bg" />
        <div className="page-header__noise" />
        <div className="container page-header__content">
          <p className="section-eyebrow" style={{ justifyContent: 'center' }}>The Creator</p>
          <h1 className="page-title display-title">About</h1>
          <div className="gold-divider center" />
        </div>
      </div>

      {/* Profile */}
      <section className="section profile-section">
        <div className="container">
          <div className="profile-grid">
            {/* Visual */}
            <div className="profile-visual reveal-left">
              <div className="profile-card glass-card">
                <div className="profile-initials">YR</div>
                <div className="profile-glow" />
                <div className="profile-badge">
                  <span className="badge-num gold-text">8+</span>
                  <span className="badge-lbl">Years</span>
                </div>
              </div>
              {/* Floating accent */}
              <div className="profile-accent profile-accent--1" />
              <div className="profile-accent profile-accent--2" />
            </div>

            {/* Text */}
            <div className="profile-text">
              <p className="section-eyebrow reveal">My Story</p>
              <h2 className="section-title reveal delay-1">Yash Rikame</h2>
              <p className="profile-role gold-text reveal delay-2">Cinematic Editor & Colorist</p>
              <div className="gold-divider reveal delay-3" />
              <p className="profile-bio reveal delay-3">
                I believe that every frame has the power to evoke emotion, tell a story,
                and leave a lasting impression. With over 8 years of experience in
                post-production, I specialize in transforming raw footage into cinematic
                masterpieces that resonate deeply with audiences.
              </p>
              <p className="profile-bio reveal delay-4">
                From blockbuster commercials to intimate wedding films and award-winning
                short films, my work spans genres and formats. Each project receives the
                same level of dedication, precision, and creative passion.
              </p>

              <div className="profile-highlights">
                {[
                  { val: '120+', lbl: 'Projects' },
                  { val: '50+',  lbl: 'Clients' },
                  { val: '12',   lbl: 'Awards' },
                ].map((h, i) => (
                  <div key={h.lbl} className={`highlight-item reveal delay-${i + 4}`}>
                    <span className="highlight-val gold-text">{h.val}</span>
                    <span className="highlight-lbl">{h.lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="section skills-section">
        <div className="skills-section__bg" />
        <div className="container">
          <p className="section-eyebrow reveal">Expertise</p>
          <h2 className="section-title reveal delay-1">Core Skills</h2>
          <div className="gold-divider reveal delay-2" style={{ marginBottom: '56px' }} />

          <div className="skills-grid">
            {SKILLS.map((skill, i) => (
              <div key={skill.name} className={`skill-item reveal delay-${Math.min(i + 1, 8)}`}>
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-pct gold-text">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="section tools-section">
        <div className="container">
          <div className="tools-header">
            <p className="section-eyebrow reveal" style={{ justifyContent: 'center' }}>The Arsenal</p>
            <h2 className="section-title reveal delay-1" style={{ textAlign: 'center' }}>Tools & Software</h2>
            <div className="gold-divider center reveal delay-2" style={{ marginBottom: '56px' }} />
          </div>
          <div className="tools-grid">
            {TOOLS.map((tool, i) => (
              <div key={tool.name} className={`tool-card glass-card reveal delay-${Math.min(i + 1, 8)}`}>
                <div
                  className="tool-icon"
                  style={{
                    background: `hsl(${tool.hue}, 70%, 15%)`,
                    color: `hsl(${tool.hue}, 80%, 70%)`,
                    border: `1px solid hsl(${tool.hue}, 60%, 25%)`,
                  }}
                >
                  {tool.abbr}
                </div>
                <span className="tool-name">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section timeline-section">
        <div className="timeline-section__bg" />
        <div className="container">
          <p className="section-eyebrow reveal">The Journey</p>
          <h2 className="section-title reveal delay-1">Career Timeline</h2>
          <div className="gold-divider reveal delay-2" style={{ marginBottom: '72px' }} />

          <div className="timeline">
            <div className="timeline__line" />
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className={`timeline-item ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'} delay-${Math.min(i + 1, 8)}`}
              >
                <div className="timeline-content glass-card">
                  <span className="timeline-year gold-text">{item.year}</span>
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
                <div className="timeline-dot" />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
