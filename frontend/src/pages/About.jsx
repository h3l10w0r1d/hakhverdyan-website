import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReveal from "../lib/useReveal";
import MagnetButton from "../components/MagnetButton";
import CountUp from "../components/CountUp";
import { ArrowIcon, CheckIcon, WrenchIcon, ShieldCheckIcon, VennIcon, HeadsetIcon, PinIcon } from "../lib/icons";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const finalCtaRef = useRef(null);

  useReveal([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".about-hero .eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.1)
        .from(".about-hero h1", { opacity: 0, y: 22, duration: 0.9 }, 0.2)
        .from(".about-hero .sub", { opacity: 0, y: 18, duration: 0.8 }, 0.35)
        .from(".about-hero .stat", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.5);

      gsap.to(".story-panel-glow", { x: 30, y: -20, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".chip-1", { y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".chip-2", { y: 10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 });
      gsap.to("#aboutMarquee", { xPercent: -50, duration: 16, ease: "none", repeat: -1 });

      gsap.to("#timelineFill", {
        height: "100%", ease: "none",
        scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: true },
      });
      gsap.utils.toArray(".timeline-item").forEach(item =>
        ScrollTrigger.create({ trigger: item, start: "top 75%", onEnter: () => item.classList.add("active") })
      );
    });

    const onCtaMove = e => {
      const el = finalCtaRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    };
    finalCtaRef.current?.addEventListener("mousemove", onCtaMove);

    return () => {
      finalCtaRef.current?.removeEventListener("mousemove", onCtaMove);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="eyebrow"><span className="pip">SINCE</span> A small profile supplier, grown into a full build partner</div>
          <h1>Building materials are the easy part. <span className="accent">Trust</span> is what we actually sell.</h1>
          <p className="sub">Hakhverdyan Shinmontazh supplies and installs aluminum, PVC, and glass systems across Yerevan — with two locations, direct European partnerships, and crews who show up when they say they will.</p>
          <div className="stats-row">
            <div className="stat"><CountUp target={500} suffix="+" delay={0.9} duration={1.4} /><div className="label">Projects delivered</div></div>
            <div className="stat"><CountUp target={15} suffix="+" delay={0.9} duration={1.4} /><div className="label">Years in business</div></div>
            <div className="stat"><CountUp target={2} delay={0.9} duration={1.4} /><div className="label">Locations in Yerevan</div></div>
            <div className="stat"><CountUp target={5} suffix="+" delay={0.9} duration={1.4} /><div className="label">European partners</div></div>
          </div>
        </div>
      </section>

      <section className="block" id="story" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="story-grid">
            <div className="story-copy">
              <p className="lead reveal">We started as a supplier. Contractors kept asking us to finish the job — so we did.</p>
              <p className="reveal">What began as profile and hardware sales grew into full installation capability because that's what the market actually needed: one team responsible for the material and the result, not two companies pointing at each other when something goes wrong.</p>
              <p className="reveal">Today that means direct partnerships with Medos, Maco, Arplas, Palram, and Flexidoor, warehouse capacity in Georgia to keep EU imports moving, and crews who handle everything from measurement to final fit — all from two locations in Yerevan.</p>
            </div>
            <div className="story-visual reveal">
              <div className="story-panel">
                <div className="story-panel-grid"></div>
                <div className="story-panel-glow"></div>
                <svg className="story-panel-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4h16v6H10v10H4V4z" /></svg>
              </div>
              <div className="story-chip chip-1">
                <div className="ic"><CheckIcon size={16} /></div>
                Direct EU partnerships
              </div>
              <div className="story-chip chip-2">
                <div className="ic"><WrenchIcon size={16} /></div>
                Full installation crews
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="values">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">What we stand for</div>
              <h2 className="section-title">Four things we don't compromise on.</h2>
            </div>
            <p className="section-sub">These aren't values on a wall — they're how quotes, orders, and installs actually run.</p>
          </div>
          <div className="why-grid">
            <div className="why-card reveal">
              <div className="why-ic"><ShieldCheckIcon /></div>
              <h3>Quality Materials</h3>
              <p>We only stock what we'd install in our own homes — sourced directly from manufacturers we've vetted, not resellers.</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><VennIcon /></div>
              <h3>Transparent Partnerships</h3>
              <p>One quote, one price, no hidden line items. What we agree on at the start is what you're billed at the end.</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><WrenchIcon /></div>
              <h3>Craftsmanship</h3>
              <p>Certified installation crews, not day labor. Every job is measured, engineered, and finished to the same standard.</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><HeadsetIcon /></div>
              <h3>Long-Term Support</h3>
              <p>The relationship doesn't end at handover. Technical advisory and part replacement are available long after install.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="timeline">
        <div className="container">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column", alignItems: "center" }}>
            <div className="section-tag center">How we got here</div>
            <h2 className="section-title" style={{ maxWidth: 600 }}>From profile supplier to full build partner.</h2>
          </div>
          <div className="timeline">
            <div className="timeline-line"><div className="timeline-line-fill" id="timelineFill"></div></div>

            <div className="timeline-item reveal">
              <div className="timeline-dot"></div>
              <div className="timeline-stage">Early days</div>
              <h4>Started as a profile &amp; hardware supplier</h4>
              <p>Serving local contractors in Yerevan with aluminum and PVC profiles, sold by the meter.</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot"></div>
              <div className="timeline-stage">Expanding capability</div>
              <h4>Added in-house installation crews</h4>
              <p>Stopped being just a supplier — started taking responsibility for the finished result, not only the material.</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-stage">Going regional</div>
              <h4>Opened warehouse capacity in Georgia</h4>
              <p>Direct partnerships with Medos, Maco, Arplas, Palram, and Flexidoor, with faster and more stable EU imports.</p>
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot"></div>
              <div className="timeline-stage">Today</div>
              <h4>500+ projects, two Yerevan locations</h4>
              <p>Full-service supply, engineering, and installation — still run the same way it started: one team, one price, one result.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="team">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">The people behind it</div>
              <h2 className="section-title">A small team that answers the phone.</h2>
            </div>
          </div>
          <div className="team-grid">
            <div className="team-card reveal"><div className="team-avatar">A</div><div className="team-name">Founder &amp; CEO</div><div className="team-role">Company leadership</div></div>
            <div className="team-card reveal"><div className="team-avatar">H</div><div className="team-name">Head of Engineering</div><div className="team-role">Technical planning &amp; specs</div></div>
            <div className="team-card reveal"><div className="team-avatar">O</div><div className="team-name">Operations Lead</div><div className="team-role">Installation &amp; logistics</div></div>
            <div className="team-card reveal"><div className="team-avatar">C</div><div className="team-name">Client Relations</div><div className="team-role">Quotes &amp; support</div></div>
          </div>
          <div className="team-note">Placeholder roles — swap in real names, titles, and photos before launch.</div>
        </div>
      </section>

      <section className="marquee-section">
        <div className="marquee-label">Direct partnerships with</div>
        <div className="marquee-mask">
          <div className="marquee-track" id="aboutMarquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i}>MEDOS&nbsp;&nbsp;&nbsp;&nbsp;MACO&nbsp;&nbsp;&nbsp;&nbsp;ARPLAS&nbsp;&nbsp;&nbsp;&nbsp;PALRAM&nbsp;&nbsp;&nbsp;&nbsp;FLEXIDOOR</span>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="locations">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Find us</div>
              <h2 className="section-title">Two locations, one team.</h2>
            </div>
          </div>
          <div className="locations-grid">
            {[
              { name: "Griboedov Location", addr: "Griboedov 56 st., Yerevan, Armenia" },
              { name: "Tevosyan Location", addr: "Tevosyan 7/11 st., Yerevan, Armenia" },
            ].map(loc => (
              <div className="location-card reveal" key={loc.name}>
                <div className="location-map">
                  <div className="location-map-grid"></div>
                  <span className="pin"><PinIcon /></span>
                </div>
                <h3>{loc.name}</h3>
                <div className="addr">{loc.addr}</div>
                <div className="meta">
                  <span>Mon–Fri 9:00–18:00</span>
                  <span>Sat 9:00–16:00</span>
                  <a href="tel:+37460770700">+374 60 770 700</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>Want the full story over a call instead?</h2>
            <p>Call +374&nbsp;60&nbsp;770&nbsp;700 or send your specs — most quotes are ready within 48 hours.</p>
            <div className="cta-row">
              <MagnetButton as="button" className="btn-primary">Request a Quote <ArrowIcon size={16} /></MagnetButton>
              <button className="btn-secondary">Call +374 60 770 700</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
