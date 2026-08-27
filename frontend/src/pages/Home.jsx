import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReveal from "../lib/useReveal";
import MagnetButton from "../components/MagnetButton";
import CountUp from "../components/CountUp";
import FeaturedProducts from "../components/FeaturedProducts";
import {
  ArrowIcon, CheckIcon, StarIcon, GlobeIcon, WrenchIcon, ClockIcon,
} from "../lib/icons";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  { cat: "profiles", title: "Aluminum Profiles", desc: "T-shaped & angle systems for windows, doors, and facades.", wide: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 4h16v6H10v10H4V4z" /></svg> },
  { cat: "profiles", title: "PVC Profiles", desc: "10mm glass-compatible systems, energy-efficient chambers.", wide: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" /><line x1="9" y1="6" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="18" /></svg> },
  { cat: "hardware", title: "Window & Door Hardware", desc: "Handles, locks, and hinges from Maco.", wide: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="3" width="12" height="18" rx="1" /><circle cx="13" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg> },
  { cat: "doors", title: "Interior Doors", desc: "Custom-fit inter-room doors, made to measure.", wide: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="18" rx="1" /><rect x="13" y="3" width="8" height="18" rx="1" /></svg> },
];

export default function Home() {
  const navigate = useNavigate();
  const heroVisualRef = useRef(null);
  const finalCtaRef = useRef(null);

  useReveal([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".headline .line span", { yPercent: 110, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".headline .line span", { yPercent: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.1)
        .from(".eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0)
        .from(".hero .sub", { opacity: 0, y: 18, duration: 0.8 }, 0.5)
        .from(".hero .cta-row > *", { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 }, 0.63)
        .from(".hero .stat", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.75)
        .from(".hero-visual .panel", { opacity: 0, scale: 0.92, duration: 1.1, ease: "power3.out" }, 0.2)
        .from(".float-card, .badge-promo", { opacity: 0, scale: 0.8, duration: 0.7, stagger: 0.15, ease: "back.out(1.7)" }, 0.85);

      gsap.to(".card-stock", { y: -14, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".card-rating", { y: 12, duration: 3.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 });
      gsap.to(".badge-promo", { y: -10, rotate: 2, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.5 });
      gsap.to(".panel-glow", { x: 30, y: 20, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".scroll-cue .stick i", { top: "100%", duration: 1.4, ease: "power2.inOut", repeat: -1 });
      gsap.to("#marqueeTrack", { xPercent: -50, duration: 16, ease: "none", repeat: -1 });
      gsap.to("#promoMarquee", { xPercent: -50, duration: 18, ease: "none", repeat: -1 });

      gsap.to("#processFill", {
        width: "100%", ease: "none",
        scrollTrigger: { trigger: ".process-wrap", start: "top 75%", end: "bottom 60%", scrub: true },
      });
      gsap.utils.toArray(".process-step").forEach(step =>
        ScrollTrigger.create({ trigger: step, start: "top 70%", onEnter: () => step.classList.add("active") })
      );
    });

    function onMouseMove(e) {
      const relX = (e.clientX / window.innerWidth - 0.5) * 14;
      const relY = (e.clientY / window.innerHeight - 0.5) * 14;
      gsap.to(heroVisualRef.current, { rotateY: relX, rotateX: -relY, duration: 0.8, ease: "power2.out", transformPerspective: 900 });
    }
    window.addEventListener("mousemove", onMouseMove);

    const catCards = gsap.utils.toArray(".cat-card");
    const catCardHandlers = catCards.map(card => {
      const onMove = e => {
        const r = card.getBoundingClientRect();
        const relX = (e.clientX - r.left - r.width / 2) / r.width;
        const relY = (e.clientY - r.top - r.height / 2) / r.height;
        gsap.to(card, { rotateY: relX * 8, rotateX: -relY * 8, duration: 0.4, ease: "power2.out", transformPerspective: 700 });
      };
      const onLeave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      const onClick = () => {
        const cat = card.dataset.cat;
        navigate(cat ? `/catalog?cat=${cat}` : "/catalog");
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("click", onClick);
      return { card, onMove, onLeave, onClick };
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
      window.removeEventListener("mousemove", onMouseMove);
      catCardHandlers.forEach(({ card, onMove, onLeave, onClick }) => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("click", onClick);
      });
      finalCtaRef.current?.removeEventListener("mousemove", onCtaMove);
      ctx.revert();
    };
  }, [navigate]);

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pip">EST.</span> Yerevan's trusted building systems supplier</div>
            <h1 className="headline">
              <span className="line"><span>Profiles, doors &amp;</span></span>
              <span className="line"><span className="accent">facades</span><span>&nbsp;— sourced,</span></span>
              <span className="line"><span>priced, and installed.</span></span>
            </h1>
            <p className="sub">Aluminum and PVC systems, hardware, and glass facades — in stock now, with fixed pricing and full installation support. No guesswork, no delays.</p>
            <div className="cta-row">
              <MagnetButton as="button" className="btn-primary">Get a Free Quote <ArrowIcon size={16} /></MagnetButton>
              <button className="btn-secondary" onClick={() => navigate("/catalog")}>Browse Catalog</button>
            </div>
            <div className="stats-row">
              <div className="stat"><CountUp target={500} suffix="+" /><div className="label">Projects delivered</div></div>
              <div className="stat"><CountUp target={15} suffix="+" /><div className="label">Years in business</div></div>
              <div className="stat"><CountUp target={48} suffix="h" /><div className="label">Avg. quote turnaround</div></div>
            </div>
          </div>

          <div className="hero-visual" ref={heroVisualRef}>
            <div className="panel">
              <div className="panel-grid"></div>
              <div className="panel-glow"></div>
              <div className="panel-frame"><span></span><span></span><span></span><span></span></div>
            </div>
            <div className="float-card card-stock">
              <div className="ic"><CheckIcon size={18} /></div>
              <div><div className="txt-title">In stock</div><div className="txt-sub">Aluminum profile T-40</div></div>
            </div>
            <div className="float-card card-rating">
              <div className="ic"><StarIcon size={18} /></div>
              <div><div className="txt-title">4.9 / 5 rating</div><div className="txt-sub">from 500+ clients</div></div>
            </div>
            <div className="badge-promo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M2 12h20" /></svg>
              20% off ABS sheets
            </div>
          </div>
        </div>
        <div className="scroll-cue"><span>SCROLL</span><div className="stick"><i></i></div></div>
      </section>

      <section className="marquee-section">
        <div className="marquee-label">Trusted supplier partners</div>
        <div className="marquee-mask">
          <div className="marquee-track" id="marqueeTrack">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i}>MEDOS&nbsp;&nbsp;&nbsp;&nbsp;MACO&nbsp;&nbsp;&nbsp;&nbsp;ARPLAS&nbsp;&nbsp;&nbsp;&nbsp;PALRAM&nbsp;&nbsp;&nbsp;&nbsp;FLEXIDOOR</span>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="why">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Why Hakhverdyan</div>
              <h2 className="section-title">Built for people who don't want to gamble on a supplier.</h2>
            </div>
            <p className="section-sub">Fixed pricing, in-stock materials, and installation crews that show up on schedule.</p>
          </div>
          <div className="why-grid">
            <div className="why-card reveal">
              <div className="why-ic">֏</div>
              <h3>Fixed, Transparent Pricing</h3>
              <p>No surprise markups. The price we quote is the price you pay — locked in before work starts.</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><GlobeIcon /></div>
              <h3>EU-Sourced Materials</h3>
              <p>Direct partnerships with Medos, Maco, Arplas, Palram and Flexidoor, plus warehouse capacity in Georgia for faster imports.</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><WrenchIcon /></div>
              <h3>Full-Service Installation</h3>
              <p>From measurement to final fit — certified crews handle assembly, engineering, and finishing.</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><ClockIcon /></div>
              <h3>Fast Turnaround</h3>
              <p>Most quotes delivered within 48 hours. In-stock profiles ship the same week.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="catalog" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Catalog</div>
              <h2 className="section-title">Everything you need, in one warehouse.</h2>
            </div>
            <button className="view-all-link" onClick={() => navigate("/catalog")}>
              Browse full catalog <ArrowIcon size={16} />
            </button>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map(c => (
              <div className="cat-card reveal" data-cat={c.cat} key={c.title}>
                <div className="cat-glow"></div>
                <div className="cat-top"><div className="cat-ic">{c.icon}</div></div>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <span className="cat-link">View catalog <ArrowIcon /></span>
                </div>
              </div>
            ))}

            <div className="cat-card wide reveal" data-cat="sheets">
              <div className="cat-glow"></div>
              <div className="cat-top">
                <div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 8l8-4 8 4-8 4-8-4z" /><path d="M4 12l8 4 8-4" /><path d="M4 16l8 4 8-4" /></svg></div>
                <span className="cat-tag">-20% now</span>
              </div>
              <div>
                <h3>ABS Sheets</h3>
                <p>1200×600mm, 0.8mm — now 2,400֏/m² instead of 3,000֏/m².</p>
                <span className="cat-link">Claim this price <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card reveal" data-cat="sheets">
              <div className="cat-glow"></div>
              <div className="cat-top"><div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 15l6-6 4 4 8-8" /></svg></div></div>
              <div>
                <h3>Stainless Steel Sheets</h3>
                <p>Industrial and architectural grade finishes.</p>
                <span className="cat-link">View catalog <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card reveal" data-cat="doors">
              <div className="cat-glow"></div>
              <div className="cat-top"><div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14h18" /></svg></div></div>
              <div>
                <h3>Sectional Gates</h3>
                <p>Garage and warehouse gate systems.</p>
                <span className="cat-link">View catalog <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card reveal" data-cat="facades">
              <div className="cat-glow"></div>
              <div className="cat-top"><div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M4 9h16M4 15h16M12 2v20" /></svg></div></div>
              <div>
                <h3>Glass Facades</h3>
                <p>Structural glazing and curtain wall systems.</p>
                <span className="cat-link">View catalog <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card light span3 center reveal" data-cat="">
              <div>
                <h3>See the full catalog</h3>
                <p>200+ SKUs across profiles, hardware, glass, and finishing materials.</p>
                <span className="cat-link">Open catalog <ArrowIcon /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="products" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Featured Products</div>
              <h2 className="section-title">Pick what you need. Build your quote as you go.</h2>
            </div>
            <p className="section-sub">Add items to your quote list — no account, no back-and-forth calls to get a number.</p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="promo reveal">
            <div className="promo-marquee" aria-hidden="true">
              <div className="promo-marquee-track" id="promoMarquee">
                <span>LIMITED STOCK · LIMITED STOCK · LIMITED STOCK ·</span>
                <span>LIMITED STOCK · LIMITED STOCK · LIMITED STOCK ·</span>
              </div>
            </div>
            <div className="promo-content">
              <div className="promo-badge">Limited-time offer</div>
              <h3>ABS sheets, 1200×600mm — while stock lasts.</h3>
              <p>Locked-in pricing on our most-requested sheet size, with same-week delivery from our Yerevan warehouse.</p>
            </div>
            <div className="promo-price">
              <div className="old">3,000֏/m²</div>
              <div className="new">2,400<small>֏/m²</small></div>
              <MagnetButton as="button" className="btn-primary" onClick={() => navigate("/catalog?cat=sheets")}>
                Claim this price <ArrowIcon size={16} />
              </MagnetButton>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="process">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">How it works</div>
              <h2 className="section-title">From first message to finished installation.</h2>
            </div>
            <p className="section-sub">Four steps. No back-and-forth, no guessing on price.</p>
          </div>
          <div className="process-wrap">
            <div className="process-line"><div className="process-line-fill" id="processFill"></div></div>
            <div className="process-grid">
              <div className="process-step reveal"><div className="process-num">01</div><h4>Request a quote</h4><p>Send your specs, drawings, or just your dimensions — online or by phone.</p></div>
              <div className="process-step reveal"><div className="process-num">02</div><h4>Get fixed pricing</h4><p>A transparent quote covering materials and installation. No hidden costs later.</p></div>
              <div className="process-step reveal"><div className="process-num">03</div><h4>We install</h4><p>Certified crews handle delivery, assembly, and engineering — on schedule.</p></div>
              <div className="process-step reveal"><div className="process-num">04</div><h4>Ongoing support</h4><p>Technical advisory and after-installation service, whenever you need it.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Services</div>
              <h2 className="section-title">Not just a supplier — your build partner.</h2>
            </div>
            <button className="view-all-link" onClick={() => navigate("/services")}>
              See all services <ArrowIcon size={16} />
            </button>
          </div>
          <div className="services-grid">
            <div className="service-card reveal" onClick={() => navigate("/services")} style={{ cursor: "pointer" }}>
              <div className="service-num">01</div>
              <h3>Construction &amp; Assembly</h3>
              <p>On-site construction and structural assembly for aluminum, PVC, and glass systems — residential and commercial.</p>
              <span className="service-link">Learn more <ArrowIcon /></span>
            </div>
            <div className="service-card reveal" onClick={() => navigate("/services")} style={{ cursor: "pointer" }}>
              <div className="service-num">02</div>
              <h3>Engineering Consultation</h3>
              <p>Technical planning and material specification before you commit — sized, priced, and ready to build.</p>
              <span className="service-link">Learn more <ArrowIcon /></span>
            </div>
            <div className="service-card reveal" onClick={() => navigate("/services")} style={{ cursor: "pointer" }}>
              <div className="service-num">03</div>
              <h3>Technical &amp; After-Sales Support</h3>
              <p>Maintenance, part replacement, and advisory support long after installation is complete.</p>
              <span className="service-link">Learn more <ArrowIcon /></span>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="testimonials">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Client feedback</div>
              <h2 className="section-title">Trusted by contractors and homeowners alike.</h2>
            </div>
            <p className="section-sub">Placeholder quotes — swap in real client reviews before launch.</p>
          </div>
          <div className="testi-grid">
            <div className="testi-card reveal">
              <div className="testi-stars">★★★★★</div>
              <p>"Quoted price matched the final invoice exactly. The installation crew finished two days ahead of schedule."</p>
              <div className="testi-who"><div className="testi-avatar">A.G.</div><div><div className="testi-name">A. G.</div><div className="testi-role">Residential renovation, Yerevan</div></div></div>
            </div>
            <div className="testi-card reveal">
              <div className="testi-stars">★★★★★</div>
              <p>"We needed 40 window units on a tight deadline. Stock was confirmed same day and delivery was on time."</p>
              <div className="testi-who"><div className="testi-avatar">V.M.</div><div><div className="testi-name">V. M.</div><div className="testi-role">General contractor</div></div></div>
            </div>
            <div className="testi-card reveal">
              <div className="testi-stars">★★★★★</div>
              <p>"Their engineering team caught a spec issue before we ordered, which saved us a costly reorder."</p>
              <div className="testi-who"><div className="testi-avatar">S.H.</div><div><div className="testi-name">S. H.</div><div className="testi-role">Facility manager</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>Ready to price out your project?</h2>
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
