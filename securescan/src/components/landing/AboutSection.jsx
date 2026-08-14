import React from "react";

function AboutSection() {

  return (
    <section
      className="landing-info"
      id="about"
    >

      <div className="landing-title">

        <span>
          ABOUT SECURESCAN
        </span>

        <h2>
          Built to make file security simple.
        </h2>

        <p>
          Upload your file, analyze potential
          threats and receive a clear security
          report.
        </p>

      </div>


      <div className="about-stats">

        <div>
          <strong>12K+</strong>
          <span>Files Analyzed</span>
        </div>

        <div>
          <strong>99.8%</strong>
          <span>Detection Rate</span>
        </div>

        <div>
          <strong>24/7</strong>
          <span>Protection</span>
        </div>

      </div>

    </section>
  );
}

export default AboutSection;