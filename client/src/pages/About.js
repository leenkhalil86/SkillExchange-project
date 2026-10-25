import "../styles/About.css";

const About = () => {
  return (
    <div className="about">
      <h1>About StudySmart</h1>
      <p className="about-sub">We help students study more effectively using AI and proven techniques.</p>

      <div className="about-cards">
        <div className="about-card">
          <h3>Our Mission</h3>
          <p>To make quality studying accessible to every student through smart tools and AI-powered assistance.</p>
        </div>
        <div className="about-card">
          <h3>Pomodoro Technique</h3>
          <p>Developed by Francesco Cirillo, this method breaks work into 25-minute focused intervals separated by short breaks.</p>
        </div>
        <div className="about-card">
          <h3>AI-Powered</h3>
          <p>Our AI assistant is powered by Claude (Anthropic) to give you accurate, helpful academic guidance.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
